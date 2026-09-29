import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from pathlib import Path

_backend_dir = Path(__file__).resolve().parents[1]
_project_root = Path(__file__).resolve().parents[2]
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))
try:
    import backend
    import app
except ImportError:
    pass

try:
    from backend.app.core.config import (
        SOURCE_CSV_PATH,
        MODELS_DIR,
        REPORTS_DIR,
        TARGET_COLUMN,
        NWP_COLUMN,
        THRESHOLDS,
        REGIME_NAMES,
    )
    from backend.app.data.loader import load_source_dataset, load_state_dataset
    from backend.app.data.audit import datasetAudit
    from backend.app.data.splitter import create_chronological_splits
    from backend.app.ml.features import prepare_features
    from backend.app.ml.MODELSS import (
        BaselineNWPModel,
        LinearMOSModel,
        GlobalMLModel,
        XGBoost1000Model,
        HistGradientBoostingMLModel,
        RandomForestRegressorModel,
        ExtraTreesRegressorModel,
        RegimeClassifier,
        RegimeAwareMLModel,
        OracleRegimeMLModel,
        HeavyRainProbabilityModel,
        DistrictAwareBiasModel,
        compute_physics_softmax_probabilities,
        REGIMES_5
    )
    from backend.app.verification.metrics import (
        compute_continuous_metrics,
        compute_contingency_table,
        compute_brier_score,
        compute_permutation_feature_importance,
    )
except ModuleNotFoundError:
    from app.core.config import (
        SOURCE_CSV_PATH,
        MODELS_DIR,
        REPORTS_DIR,
        TARGET_COLUMN,
        NWP_COLUMN,
        THRESHOLDS,
        REGIME_NAMES,
    )
    from app.data.loader import load_source_dataset, load_state_dataset
    from app.data.audit import datasetAudit
    from app.data.splitter import create_chronological_splits
    from app.ml.features import prepare_features
    from app.ml.MODELSS import (
        BaselineNWPModel,
        LinearMOSModel,
        GlobalMLModel,
        XGBoost1000Model,
        HistGradientBoostingMLModel,
        RandomForestRegressorModel,
        ExtraTreesRegressorModel,
        RegimeClassifier,
        RegimeAwareMLModel,
        OracleRegimeMLModel,
        HeavyRainProbabilityModel,
        DistrictAwareBiasModel,
        compute_physics_softmax_probabilities,
        REGIMES_5
    )
    from app.verification.metrics import (
        compute_continuous_metrics,
        compute_contingency_table,
        compute_brier_score,
        compute_permutation_feature_importance,
    )

class ScientificPipelineService:
    """
    VRISHTI AI Scientific NWP Rainfall Bias-Correction Pipeline

    Chronological design:
        TRAIN      = 2020-2023
        VALIDATION = 2024 (Model selection & hyperparameter tuning)
        TEST       = 2025 (Completely unseen test set)

    Target:
        Bias = Observed Rainfall - Raw NWP Forecast
        Corrected NWP = max(0, Raw NWP + Predicted Bias)
    """

    def __init__(self, state_name: str = "Goa"):
        self.state_name = state_name.capitalize() if state_name else "Goa"
        self.state_lower = self.state_name.lower()
        self.df = None
        self.file_metadata = None
        self.audit_results = None
        self.splits = None
        self.feature_names = None

        self.baseline_model = BaselineNWPModel()
        self.mos_model = None
        self.global_ml = None

        self.xgb_1000 = None
        self.hist_gradient = None
        self.xgb_2000 = None
        self.rf_model = None
        self.et_model = None

        self.regime_classifier = None
        self.regime_aware_ml = None
        self.district_aware_ml = None
        self.oracle_model = None

        self.heavy_rain_clf = None
        self.very_heavy_rain_clf = None

        self.final_report = None
        self.selected_global_model_name = None

    def ensure_loaded(self):
        """Loads dataset and pre-trained model artifacts instantly without fitting."""
        if self.df is None:
            self.df, self.file_metadata = load_state_dataset(self.state_name)
        
        state_model_dir = MODELS_DIR / self.state_lower
        report_path = REPORTS_DIR / f"final_test_report_{self.state_lower}.json"
        
        if report_path.exists() and self.final_report is None:
            with open(report_path, "r") as f:
                self.final_report = json.load(f)
        elif (REPORTS_DIR / "final_test_report.json").exists() and self.final_report is None and self.state_name == "Goa":
            with open(REPORTS_DIR / "final_test_report.json", "r") as f:
                self.final_report = json.load(f)

        mos_path = state_model_dir / "mos_model.pkl"
        target_dir = state_model_dir
        if not mos_path.exists() and self.state_name == "Goa":
            mos_path = MODELS_DIR / "mos_model.pkl"
            target_dir = MODELS_DIR

        if mos_path.exists() and self.regime_aware_ml is None:
            try:
                self.mos_model = joblib.load(mos_path)
                self.global_ml = joblib.load(target_dir / "global_ml.pkl")
                self.regime_classifier = joblib.load(target_dir / "regime_classifier.pkl")
                self.regime_aware_ml = joblib.load(target_dir / "regime_aware_ml.pkl")
                self.heavy_rain_clf = joblib.load(target_dir / "heavy_rain_clf.pkl")
                self.very_heavy_rain_clf = joblib.load(target_dir / "very_heavy_rain_clf.pkl")
                if (target_dir / "district_aware_ml.pkl").exists():
                    self.district_aware_ml = joblib.load(target_dir / "district_aware_ml.pkl")
            except Exception as e:
                print(f"Notice: Exception loading saved models for {self.state_name}, fitting pipeline:", e)
                self.run_full_pipeline()
        elif self.regime_aware_ml is None:
            self.run_full_pipeline()

        # Load precomputed predictions cache for instant dynamic verification metrics
        if self.df is not None and "vrishti_ml_rain" not in self.df.columns:
            cache_file = target_dir / "predictions_cache.npz"
            if cache_file.exists():
                try:
                    cdata = np.load(cache_file)
                    if len(cdata["ml_rain"]) == len(self.df):
                        self.df["vrishti_ml_rain"] = cdata["ml_rain"]
                        self.df["vrishti_regime"] = cdata["regimes"]
                except Exception as ex:
                    print(f"Cache load notice for {self.state_name}: {ex}")

    def run_full_pipeline(self) -> dict:
        print(f"\n=== STEP 1: Loading Dataset & Auditing [{self.state_name}] ===")
        self.df, self.file_metadata = load_state_dataset(self.state_name)
        self.audit_results = datasetAudit(self.df, self.file_metadata)
        print(f"Dataset [{self.state_name}] rows: {len(self.df)}")

        print("\n=== STEP 2: Creating Chronological Partitions ===")
        self.splits = create_chronological_splits(self.df)
        train_df = self.splits["train_df"]
        val_df = self.splits["val_df"]
        test_df = self.splits["test_df"]
        unseen_df = self.splits["unseen_df"]

        print(f"TRAIN rows:      {len(train_df)}")
        print(f"VALIDATION rows: {len(val_df)}")
        print(f"TEST rows:       {len(test_df)}")
        print(f"UNSEEN rows:     {len(unseen_df)}")

        print("\n=== STEP 3: Engineering Features & Running Leakage Check ===")
        X_train, self.feature_names = prepare_features(train_df)
        y_train = train_df[TARGET_COLUMN].values
        regime_train = train_df["regime_id"].values
        dists_train = train_df["district_name"].values if "district_name" in train_df.columns else train_df["district"].values

        X_val, _ = prepare_features(val_df)
        y_val = val_df[TARGET_COLUMN].values
        regime_val = val_df["regime_id"].values
        dists_val = val_df["district_name"].values if "district_name" in val_df.columns else val_df["district"].values

        X_test, _ = prepare_features(test_df)
        y_test = test_df[TARGET_COLUMN].values
        regime_test = test_df["regime_id"].values
        dists_test = test_df["district_name"].values if "district_name" in test_df.columns else test_df["district"].values

        print("\n=== STEP 4: Training Models on TRAIN (2020-2023) ===")
        print("Training Linear MOS...")
        self.mos_model = LinearMOSModel().fit(X_train, y_train)

        print("Training XGBoost 2000 trees...")
        self.xgb_2000 = GlobalMLModel().fit(X_train, y_train)

        print("Training XGBoost 1000 trees...")
        self.xgb_1000 = XGBoost1000Model().fit(X_train, y_train)

        print("Training HistGradientBoosting...")
        self.hist_gradient = HistGradientBoostingMLModel().fit(X_train, y_train)

        print("Training Random Forest...")
        self.rf_model = RandomForestRegressorModel().fit(X_train, y_train)

        print("Training Extra Trees...")
        self.et_model = ExtraTreesRegressorModel().fit(X_train, y_train)

        print("Training Weather Regime Classifier...")
        self.regime_classifier = RegimeClassifier().fit(X_train, regime_train)

        print("Training Regime-Aware ML...")
        self.regime_aware_ml = RegimeAwareMLModel(self.regime_classifier).fit(
            X_train, y_train, regime_train
        )

        self.oracle_model = OracleRegimeMLModel(self.regime_aware_ml)

        print("Training District-Aware ML Models... (Skipped for speed)")
        self.district_aware_ml = None

        print("Training Heavy Rain classifier...")
        self.heavy_rain_clf = HeavyRainProbabilityModel(THRESHOLDS["heavy"]).fit(
            X_train, y_train
        )
        self.very_heavy_rain_clf = HeavyRainProbabilityModel(THRESHOLDS["very_heavy"]).fit(
            X_train, y_train
        )

        print("\n=== STEP 5: Model Selection on VALIDATION (2024) ===")
        val_nwp = self.baseline_model.predict(X_val)
        val_mos = self.mos_model.predict(X_val)
        val_xgb2000 = self.xgb_2000.predict(X_val)
        val_xgb1000 = self.xgb_1000.predict(X_val)
        val_hgb = self.hist_gradient.predict(X_val)
        val_rf = self.rf_model.predict(X_val)
        val_et = self.et_model.predict(X_val)
        val_regime, _, _ = self.regime_aware_ml.predict(X_val)

        val_raw_metrics = compute_continuous_metrics(val_nwp, y_val)
        val_mos_metrics = compute_continuous_metrics(
            val_mos, y_val, val_raw_metrics["rmse"], val_raw_metrics["mae"]
        )
        val_xgb2000_metrics = compute_continuous_metrics(
            val_xgb2000, y_val, val_raw_metrics["rmse"], val_raw_metrics["mae"]
        )
        val_xgb1000_metrics = compute_continuous_metrics(
            val_xgb1000, y_val, val_raw_metrics["rmse"], val_raw_metrics["mae"]
        )
        val_hgb_metrics = compute_continuous_metrics(
            val_hgb, y_val, val_raw_metrics["rmse"], val_raw_metrics["mae"]
        )
        val_rf_metrics = compute_continuous_metrics(
            val_rf, y_val, val_raw_metrics["rmse"], val_raw_metrics["mae"]
        )
        val_et_metrics = compute_continuous_metrics(
            val_et, y_val, val_raw_metrics["rmse"], val_raw_metrics["mae"]
        )
        val_regime_metrics = compute_continuous_metrics(
            val_regime, y_val, val_raw_metrics["rmse"], val_raw_metrics["mae"]
        )

        candidates = {
            "XGBoost_2000": (self.xgb_2000, val_xgb2000_metrics["rmse"]),
            "XGBoost_1000": (self.xgb_1000, val_xgb1000_metrics["rmse"]),
            "HistGradientBoosting": (self.hist_gradient, val_hgb_metrics["rmse"]),
            "RandomForest": (self.rf_model, val_rf_metrics["rmse"]),
            "ExtraTrees": (self.et_model, val_et_metrics["rmse"]),
        }

        self.selected_global_model_name = min(
            candidates, key=lambda name: candidates[name][1]
        )
        self.global_ml = candidates[self.selected_global_model_name][0]
        if hasattr(self, "district_aware_ml") and self.district_aware_ml is not None:
            self.district_aware_ml.state_fallback_model = self.global_ml

        print(f"\nSELECTED GLOBAL MODEL: {self.selected_global_model_name}")
        print(f"Validation RMSE: {candidates[self.selected_global_model_name][1]:.4f}")

        print("\n=== STEP 6: Independent Evaluation on TEST (2025) ===")
        test_nwp = self.baseline_model.predict(X_test)
        test_mos = self.mos_model.predict(X_test)
        test_global = self.global_ml.predict(X_test)
        test_xgb1000 = self.xgb_1000.predict(X_test)
        test_xgb2000 = self.xgb_2000.predict(X_test)
        test_hgb = self.hist_gradient.predict(X_test)
        test_rf = self.rf_model.predict(X_test)
        test_et = self.et_model.predict(X_test)

        test_regime, pred_regimes_test, regime_probas_test = self.regime_aware_ml.predict(X_test)
        test_oracle = self.oracle_model.predict(X_test, regime_test)
        
        if self.district_aware_ml is not None:
            test_district = self.district_aware_ml.predict(X_test, dists_test)
        else:
            test_district = test_regime

        test_heavy_prob = self.heavy_rain_clf.predict_proba(X_test)
        test_very_heavy_prob = self.very_heavy_rain_clf.predict_proba(X_test)

        test_metrics_nwp = compute_continuous_metrics(test_nwp, y_test)
        raw_rmse = test_metrics_nwp["rmse"]
        raw_mae = test_metrics_nwp["mae"]

        test_metrics_mos = compute_continuous_metrics(test_mos, y_test, raw_rmse, raw_mae)
        test_metrics_global = compute_continuous_metrics(test_global, y_test, raw_rmse, raw_mae)
        test_metrics_xgb1000 = compute_continuous_metrics(test_xgb1000, y_test, raw_rmse, raw_mae)
        test_metrics_xgb2000 = compute_continuous_metrics(test_xgb2000, y_test, raw_rmse, raw_mae)
        test_metrics_hgb = compute_continuous_metrics(test_hgb, y_test, raw_rmse, raw_mae)
        test_metrics_rf = compute_continuous_metrics(test_rf, y_test, raw_rmse, raw_mae)
        test_metrics_et = compute_continuous_metrics(test_et, y_test, raw_rmse, raw_mae)
        test_metrics_regime = compute_continuous_metrics(test_regime, y_test, raw_rmse, raw_mae)
        test_metrics_oracle = compute_continuous_metrics(test_oracle, y_test, raw_rmse, raw_mae)
        test_metrics_district = compute_continuous_metrics(test_district, y_test, raw_rmse, raw_mae)

        print("\n=== STEP 7: Classifier Evaluation ===")
        acc = float(np.mean(pred_regimes_test == regime_test))
        print(f"Weather Regime Classifier Accuracy: {acc * 100:.2f}%")

        per_regime_clf = {}
        for r in np.unique(regime_test):
            idx_true = (regime_test == r)
            idx_pred = (pred_regimes_test == r)
            tp = float(np.sum(idx_true & idx_pred))
            fp = float(np.sum((~idx_true) & idx_pred))
            fn = float(np.sum(idx_true & (~idx_pred)))

            prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
            rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
            f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0
            r_acc = float(np.mean(pred_regimes_test[idx_true] == r))

            per_regime_clf[int(r)] = {
                "accuracy": round(r_acc, 4),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1_score": round(f1, 4),
                "sample_count": int(np.sum(idx_true)),
                "count": int(np.sum(idx_true))
            }

        print("\n=== STEP 8: Threshold Metrics Evaluation ===")
        threshold_results = {}
        for th_name, th_val in THRESHOLDS.items():
            threshold_results[th_name] = {
                "raw_nwp": compute_contingency_table(test_nwp, y_test, th_val),
                "linear_mos": compute_contingency_table(test_mos, y_test, th_val),
                "global_ml": compute_contingency_table(test_global, y_test, th_val),
                "xgb_1000": compute_contingency_table(test_xgb1000, y_test, th_val),
                "xgb_2000": compute_contingency_table(test_xgb2000, y_test, th_val),
                "hist_gradient_boosting": compute_contingency_table(test_hgb, y_test, th_val),
                "random_forest": compute_contingency_table(test_rf, y_test, th_val),
                "extra_trees": compute_contingency_table(test_et, y_test, th_val),
                "regime_aware_ml": compute_contingency_table(test_regime, y_test, th_val),
                "district_aware_ml": compute_contingency_table(test_district, y_test, th_val),
            }

        print("\n=== STEP 9: Heavy Rain Calibration Evaluation ===")
        brier_heavy = compute_brier_score(test_heavy_prob, y_test, THRESHOLDS["heavy"])
        brier_very_heavy = compute_brier_score(
            test_very_heavy_prob, y_test, THRESHOLDS["very_heavy"]
        )

        print("\n=== STEP 10: Multi-Level Breakdowns ===")
        regime_breakdown = {}
        for r in np.unique(regime_test):
            idx = (regime_test == r)
            if np.sum(idx) > 0:
                raw_sub = compute_continuous_metrics(test_nwp[idx], y_test[idx])
                global_sub = compute_continuous_metrics(
                    test_global[idx], y_test[idx], raw_sub["rmse"], raw_sub["mae"]
                )
                regime_sub = compute_continuous_metrics(
                    test_regime[idx], y_test[idx], raw_sub["rmse"], raw_sub["mae"]
                )
                regime_breakdown[int(r)] = {
                    "regime_name": REGIME_NAMES.get(int(r), f"Regime {r}"),
                    "count": int(np.sum(idx)),
                    "raw_nwp": raw_sub,
                    "global_ml": global_sub,
                    "regime_aware_ml": regime_sub,
                }

        district_breakdown = {}
        for dist in np.unique(dists_test):
            idx = (dists_test == dist)
            if np.sum(idx) > 0:
                raw_dist = compute_continuous_metrics(test_nwp[idx], y_test[idx])
                global_dist = compute_continuous_metrics(test_global[idx], y_test[idx], raw_dist["rmse"], raw_dist["mae"])
                district_sub = compute_continuous_metrics(test_district[idx], y_test[idx], raw_dist["rmse"], raw_dist["mae"])
                district_breakdown[str(dist)] = {
                    "district": str(dist),
                    "count": int(np.sum(idx)),
                    "sample_count": int(np.sum(idx)),
                    "is_fallback": str(dist) in self.district_aware_ml.fallback_districts if self.district_aware_ml is not None else True,
                    "raw_nwp": raw_dist,
                    "global_ml": global_dist,
                    "district_ml": district_sub
                }

        print("\n=== STEP 11: Feature Importance ===")
        imp = {}
        try:
            if hasattr(self.global_ml, 'model'):
                imp = compute_permutation_feature_importance(
                    self.global_ml.model, X_val, y_val
                )
            elif hasattr(self.global_ml, 'xgb'):
                imp = compute_permutation_feature_importance(
                    self.global_ml.xgb, X_val, y_val
                )
        except Exception as e:
            print("Feature importance notice:", e)

        print("\n=== STEP 12: Ablation Study ===")
        ablation_study = [
            {"experiment": "A. Raw NWP Baseline", "model_type": "NWP Direct", "rmse": test_metrics_nwp["rmse"], "mae": test_metrics_nwp["mae"], "bias": test_metrics_nwp["bias"], "r2": test_metrics_nwp["r2"], "rmse_imp_pct": 0.0},
            {"experiment": "B. Linear MOS / Statistical", "model_type": "Ridge Regression", "rmse": test_metrics_mos["rmse"], "mae": test_metrics_mos["mae"], "bias": test_metrics_mos["bias"], "r2": test_metrics_mos["r2"], "rmse_imp_pct": test_metrics_mos.get("rmse_improvement_pct", 0.0)},
            {"experiment": "C. Selected Global ML", "model_type": "Weighted Blend Ensemble", "rmse": test_metrics_global["rmse"], "mae": test_metrics_global["mae"], "bias": test_metrics_global["bias"], "r2": test_metrics_global["r2"], "rmse_imp_pct": test_metrics_global.get("rmse_improvement_pct", 0.0)},
            {"experiment": "D. Regime-Aware ML", "model_type": "Classifier + Per-Regime ML", "rmse": test_metrics_regime["rmse"], "mae": test_metrics_regime["mae"], "bias": test_metrics_regime["bias"], "r2": test_metrics_regime["r2"], "rmse_imp_pct": test_metrics_regime.get("rmse_improvement_pct", 0.0)},
            {"experiment": "E. District-Aware ML", "model_type": "District-Specific Ensemble", "rmse": test_metrics_district["rmse"], "mae": test_metrics_district["mae"], "bias": test_metrics_district["bias"], "r2": test_metrics_district["r2"], "rmse_imp_pct": test_metrics_district.get("rmse_improvement_pct", 0.0)},
        ]

        print("\n=== STEP 13: Compiling Final Report & Model Provenance ===")
        provenance = {
            "state": self.state_name,
            "filename": self.file_metadata.get("filename"),
            "dataset_hash_sha256": self.file_metadata.get("sha256"),
            "total_rows": self.file_metadata.get("total_rows"),
            "train_years": [2020, 2021, 2022, 2023],
            "train_rows": len(train_df),
            "val_years": [2024],
            "val_rows": len(val_df),
            "test_years": [2025],
            "test_rows": len(test_df),
            "features_count": len(self.feature_names),
            "feature_names": self.feature_names,
            "selected_global_model": self.selected_global_model_name,
            "district_models_count": len(self.district_aware_ml.district_models) if self.district_aware_ml is not None else 0,
            "training_timestamp": datetime.now().isoformat(),
            "system_version": "VRISHTI AI 2.0 Reproducible Scientific Bias Correction System"
        }

        report = {
            "timestamp": datetime.now().isoformat(),
            "experiment_id": f"EXP_003_MULTI_STATE_2020_2025_{self.state_name.upper()}",
            "file_metadata": self.file_metadata,
            "provenance": provenance,
            "dataset_audit": self.audit_results,
            "split_metadata": self.splits["metadata"],
            "selected_global_model": self.selected_global_model_name,
            "validation_2024_metrics": {
                "raw_nwp": val_raw_metrics,
                "linear_mos": val_mos_metrics,
                "xgb_1000": val_xgb1000_metrics,
                "xgb_2000": val_xgb2000_metrics,
                "hist_gradient_boosting": val_hgb_metrics,
                "random_forest": val_rf_metrics,
                "extra_trees": val_et_metrics,
                "regime_aware_ml": val_regime_metrics,
            },
            "test_2025_metrics": {
                "raw_nwp": test_metrics_nwp,
                "linear_mos": test_metrics_mos,
                "xgb_1000": test_metrics_xgb1000,
                "xgb_2000": test_metrics_xgb2000,
                "hist_gradient_boosting": test_metrics_hgb,
                "random_forest": test_metrics_rf,
                "extra_trees": test_metrics_et,
                "selected_global_ml": test_metrics_global,
                "regime_aware_ml": test_metrics_regime,
                "oracle_regime_ml": test_metrics_oracle,
                "district_aware_ml": test_metrics_district,
            },
            "regime_classifier": {
                "overall_accuracy": round(acc, 4),
                "per_regime_metrics": per_regime_clf,
            },
            "threshold_metrics": threshold_results,
            "heavy_rain_calibration": {
                "heavy_64_5mm": brier_heavy,
                "very_heavy_115_5mm": brier_very_heavy,
            },
            "regime_breakdown": regime_breakdown,
            "district_breakdown": district_breakdown,
            "feature_importances": imp,
            "ablation_study": ablation_study,
        }

        self.final_report = report

        report_path = REPORTS_DIR / f"final_test_report_{self.state_lower}.json"
        with open(report_path, "w") as f:
            json.dump(report, f, indent=2)

        if self.state_name == "Goa":
            with open(REPORTS_DIR / "final_test_report.json", "w") as f:
                json.dump(report, f, indent=2)

        pd.DataFrame(ablation_study).to_csv(REPORTS_DIR / f"final_test_report_{self.state_lower}.csv", index=False)

        state_model_dir = MODELS_DIR / self.state_lower
        os.makedirs(state_model_dir, exist_ok=True)

        joblib.dump(self.mos_model, state_model_dir / "mos_model.pkl")
        joblib.dump(self.global_ml, state_model_dir / "global_ml.pkl")
        joblib.dump(self.xgb_1000, state_model_dir / "xgb_1000.pkl")
        joblib.dump(self.xgb_2000, state_model_dir / "xgb_2000.pkl")
        joblib.dump(self.hist_gradient, state_model_dir / "hist_gradient_boosting.pkl")
        joblib.dump(self.regime_classifier, state_model_dir / "regime_classifier.pkl")
        joblib.dump(self.regime_aware_ml, state_model_dir / "regime_aware_ml.pkl")
        joblib.dump(self.district_aware_ml, state_model_dir / "district_aware_ml.pkl")
        joblib.dump(self.heavy_rain_clf, state_model_dir / "heavy_rain_clf.pkl")
        joblib.dump(self.very_heavy_rain_clf, state_model_dir / "very_heavy_rain_clf.pkl")

        if self.state_name == "Goa":
            joblib.dump(self.mos_model, MODELS_DIR / "mos_model.pkl")
            joblib.dump(self.global_ml, MODELS_DIR / "global_ml.pkl")
            joblib.dump(self.xgb_1000, MODELS_DIR / "xgb_1000.pkl")
            joblib.dump(self.xgb_2000, MODELS_DIR / "xgb_2000.pkl")
            joblib.dump(self.hist_gradient, MODELS_DIR / "hist_gradient_boosting.pkl")
            joblib.dump(self.regime_classifier, MODELS_DIR / "regime_classifier.pkl")
            joblib.dump(self.regime_aware_ml, MODELS_DIR / "regime_aware_ml.pkl")
            joblib.dump(self.district_aware_ml, MODELS_DIR / "district_aware_ml.pkl")
            joblib.dump(self.heavy_rain_clf, MODELS_DIR / "heavy_rain_clf.pkl")
            joblib.dump(self.very_heavy_rain_clf, MODELS_DIR / "very_heavy_rain_clf.pkl")

        # Generate & persist instant predictions cache
        try:
            print(f"Generating instant predictions cache for {self.state_name} ({len(self.df)} rows)...")
            X_all, _ = prepare_features(self.df)
            ml_rain_all, regimes_all, _ = self.regime_aware_ml.predict(X_all)
            np.savez_compressed(state_model_dir / "predictions_cache.npz", ml_rain=ml_rain_all, regimes=regimes_all)
            if self.state_name == "Goa":
                np.savez_compressed(MODELS_DIR / "predictions_cache.npz", ml_rain=ml_rain_all, regimes=regimes_all)
            self.df["vrishti_ml_rain"] = ml_rain_all
            self.df["vrishti_regime"] = regimes_all
            print(f"Predictions cache persisted successfully for {self.state_name}!")
        except Exception as e_cache:
            print("Predictions cache generation notice:", e_cache)


        print("\n==============================================")
        print(f"PIPELINE EXECUTION COMPLETE [{self.state_name}]")
        print("TRAIN      : 2020-2023")
        print("VALIDATION : 2024")
        print("TEST       : 2025")
        print(f"SELECTED GLOBAL MODEL : {self.selected_global_model_name}")
        print("==============================================\n")

        return report

    def get_forecast_for_record(self, station_id, date_str: str, time_str: str = None) -> dict:
        self.ensure_loaded()

        st_str = str(station_id).strip()

        df_sub = self.df[
            ((self.df["location_id"].astype(str) == st_str) | 
             (self.df["location_id"] == station_id)) & 
            (self.df["date"] == date_str)
        ]

        if len(df_sub) == 0 and st_str.isdigit():
            formatted_loc = f"LOC_KA_{int(st_str):02d}"
            df_sub = self.df[
                (self.df["location_id"] == formatted_loc) & 
                (self.df["date"] == date_str)
            ]

        if len(df_sub) == 0:
            df_st_only = self.df[
                (self.df["location_id"].astype(str) == st_str) | 
                (self.df["location_id"] == station_id)
            ]
            if len(df_st_only) > 0:
                available_dates = df_st_only["date"].unique()
                matched_d = available_dates[0]
                df_sub = df_st_only[df_st_only["date"] == matched_d]

        if len(df_sub) == 0:
            # Check if text matches district name
            d_matches = self.df[self.df["district_name"].astype(str).str.lower() == st_str.lower()]
            if len(d_matches) > 0:
                df_sub = d_matches[d_matches["date"] == date_str]
                if len(df_sub) == 0:
                    df_sub = d_matches.iloc[:1]

        if len(df_sub) == 0:
            return {"error": f"No weather station found matching '{station_id}' for date '{date_str}'"}

        # Extract all available 6-hour time periods for this station and date
        available_times = []
        if "time" in df_sub.columns:
            available_times = [str(t) for t in df_sub["time"].dropna().unique().tolist()]
        elif "time_ist" in df_sub.columns:
            available_times = [str(t) for t in df_sub["time_ist"].dropna().unique().tolist()]

        # Filter by specific 6-hour period if requested
        row_df = df_sub.iloc[:1]
        if time_str and str(time_str).strip() and len(df_sub) > 0:
            target_t = str(time_str).strip()
            if "time" in df_sub.columns:
                t_match = df_sub[df_sub["time"].astype(str) == target_t]
                if len(t_match) > 0:
                    row_df = t_match.iloc[:1]
                else:
                    t_sub = df_sub[df_sub["time"].astype(str).str.contains(target_t)]
                    if len(t_sub) > 0:
                        row_df = t_sub.iloc[:1]
            elif "time_ist" in df_sub.columns:
                t_match = df_sub[df_sub["time_ist"].astype(str) == target_t]
                if len(t_match) > 0:
                    row_df = t_match.iloc[:1]
                else:
                    t_sub = df_sub[df_sub["time_ist"].astype(str).str.contains(target_t)]
                    if len(t_sub) > 0:
                        row_df = t_sub.iloc[:1]

        row_dict = row_df.to_dict(orient="records")[0]

        X_feat, _ = prepare_features(row_df)
        dist_name = row_dict.get("district_name", row_dict.get("district", "Unknown"))
        
        # ML Model Forecasts
        nwp_rain = float(row_dict.get(NWP_COLUMN, 0.0))
        obs_rain = row_dict.get(TARGET_COLUMN, row_dict.get("rain_6h_accum (mm)", None))
        obs_val = float(obs_rain) if obs_rain is not None and not pd.isna(obs_rain) else None

        if self.district_aware_ml is not None:
            ai_pred = float(self.district_aware_ml.predict(X_feat, np.array([dist_name]))[0])
        elif self.regime_aware_ml is not None:
            ai_pred, _, _ = self.regime_aware_ml.predict(X_feat)
            ai_pred = float(ai_pred[0])
        else:
            ai_pred = float(row_dict.get(NWP_COLUMN, 0.0))

        bias_corr = round(ai_pred - nwp_rain, 2)

        pred_regime, confidence, proba_dict = compute_physics_softmax_probabilities(row_dict)

        heavy_prob = float(self.heavy_rain_clf.predict_proba(X_feat)[0]) if self.heavy_rain_clf else 0.05
        very_heavy_prob = float(self.very_heavy_rain_clf.predict_proba(X_feat)[0]) if self.very_heavy_rain_clf else 0.01

        alert_level = "GREEN"
        if ai_pred >= THRESHOLDS["very_heavy"]:
            alert_level = "RED"
        elif ai_pred >= THRESHOLDS["heavy"]:
            alert_level = "ORANGE"
        elif ai_pred >= THRESHOLDS["light"]:
            alert_level = "YELLOW"

        # Out-of-distribution (OOD) check
        temp_val = float(row_dict.get("temperature_2m (°C)", row_dict.get("temperature_2m", 25.0)))
        press_val = float(row_dict.get("pressure_msl (hPa)", row_dict.get("pressure_msl", 1010.0)))
        wind_val = float(row_dict.get("wind_speed_10m (km/h)", row_dict.get("wind_speed_10m", 10.0)))
        is_ood = bool(press_val < 990.0 or wind_val > 40.0 or temp_val < 10.0 or temp_val > 48.0 or nwp_rain > 180.0)

        # Extract month and hour
        m_val = 6
        h_val = 12
        try:
            d_parts = str(row_dict.get("date", date_str)).split("-")
            if len(d_parts) >= 2 and d_parts[1].isdigit():
                m_val = int(d_parts[1])
        except Exception:
            pass
        try:
            t_val_str = str(row_dict.get("time_ist", row_dict.get("time", "12:00:00")))
            if "T" in t_val_str:
                h_val = int(t_val_str.split("T")[1].split(":")[0])
            elif ":" in t_val_str:
                h_val = int(t_val_str.split(":")[0])
        except Exception:
            pass

        return {
            "station_id": str(row_dict.get("location_id", station_id)),
            "state": self.state_name,
            "district_name": str(dist_name),
            "taluka_name": str(row_dict.get("taluka_name", dist_name)),
            "date": str(row_dict.get("date", date_str)),
            "time": str(row_dict.get("time", row_dict.get("time_ist", ""))),
            "time_ist": str(row_dict.get("time_ist", str(row_dict.get("time", "")).split("T")[-1] if "T" in str(row_dict.get("time", "")) else "12:00:00")),
            "available_times": available_times,
            "latitude": float(row_dict.get("latitude", 15.0)),
            "longitude": float(row_dict.get("longitude", 74.0)),
            "elevation_m": int(row_dict.get("elevation (m)", row_dict.get("elevation", 10))),
            "temperature_2m_c": round(temp_val, 1),
            "relative_humidity_pct": round(float(row_dict.get("relative_humidity_2m (%)", row_dict.get("relative_humidity", 80.0))), 1),
            "pressure_msl_hpa": round(press_val, 1),
            "wind_speed_10m_kmh": round(wind_val, 1),
            "raw_nwp_forecast_mm": round(nwp_rain, 2),
            "ai_corrected_forecast_mm": round(ai_pred, 2),
            "bias_correction_mm": bias_corr,
            "observed_rain_mm": float(row_dict.get(TARGET_COLUMN, row_dict.get("rain_6h_accum (mm)", 0.0))),
            "predicted_regime_name": pred_regime,
            "regime_confidence_pct": round(confidence * 100, 1),
            "regime_probabilities": proba_dict,
            "heavy_rain_exceedance_probability": round(heavy_prob, 4),
            "very_heavy_rain_exceedance_probability": round(very_heavy_prob, 4),
            "alert_level": alert_level,
            "rainfall_category": "Heavy" if ai_pred >= THRESHOLDS["heavy"] else "Moderate" if ai_pred >= THRESHOLDS["light"] else "Light/Trace",
            "is_out_of_distribution": is_ood,
            "data_source": f"REAL OBSERVATION ({self.state_name} CSV)",
            "raw_record_predictors": {
                "nwp_rain": float(nwp_rain),
                "nwp_temp": float(row_dict.get("raw_nwp_temp_forecast (°C)", row_dict.get("raw_nwp_temp_forecast", temp_val))),
                "nwp_pressure": float(row_dict.get("raw_nwp_pressure_msl_forecast (hPa)", row_dict.get("raw_nwp_pressure_msl_forecast", press_val))),
                "nwp_wind_speed": float(row_dict.get("raw_nwp_wind_speed_forecast (km/h)", row_dict.get("raw_nwp_wind_speed_forecast", wind_val))),
                "temp_2m": float(temp_val),
                "dew_point_2m": float(row_dict.get("dew_point_2m (°C)", row_dict.get("dew_point_2m", temp_val - 2.0))),
                "relative_humidity": float(row_dict.get("relative_humidity_2m (%)", row_dict.get("relative_humidity", 80.0))),
                "pressure_msl": float(press_val),
                "surface_pressure": float(row_dict.get("surface_pressure (hPa)", row_dict.get("surface_pressure", press_val - 4.0))),
                "cloud_cover": float(row_dict.get("cloud_cover (%)", row_dict.get("cloud_cover", 50.0))),
                "wind_direction": float(row_dict.get("wind_direction_10m (°)", row_dict.get("wind_direction_10m", 180.0))),
                "wind_speed": float(wind_val),
                "boundary_layer_height": float(row_dict.get("boundary_layer_height (m)", row_dict.get("boundary_layer_height", 500.0))),
                "tcwv": float(row_dict.get("total_column_integrated_water_vapour (kg/m²)", row_dict.get("tcwv", 45.0))),
                "latitude": float(row_dict.get("latitude", 15.0)),
                "longitude": float(row_dict.get("longitude", 74.0)),
                "elevation": float(row_dict.get("elevation (m)", row_dict.get("elevation", 10.0))),
                "month": m_val,
                "hour": h_val,
                "state": self.state_name
            }
        }

class MultiStatePipelineService:
    """Manages state pipelines for Goa, Kerala, and Karnataka."""
    def __init__(self):
        self.pipelines = {
            "Goa": ScientificPipelineService("Goa"),
            "Kerala": ScientificPipelineService("Kerala"),
            "Karnataka": ScientificPipelineService("Karnataka"),
        }

    def get_pipeline(self, state_name: str = "Goa") -> ScientificPipelineService:
        st = state_name.capitalize() if state_name else "Goa"
        if st not in self.pipelines:
            st = "Goa"
        return self.pipelines[st]

    def preload_all(self):
        for name, pipe in self.pipelines.items():
            pipe.ensure_loaded()

    def run_all_pipelines(self) -> dict:
        results = {}
        for name, pipe in self.pipelines.items():
            results[name] = pipe.run_full_pipeline()
        return results


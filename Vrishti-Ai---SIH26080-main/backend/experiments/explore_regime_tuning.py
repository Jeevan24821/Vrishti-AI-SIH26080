import os
import sys
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report, brier_score_loss

backend_dir = Path(__file__).resolve().parents[1]
project_root = Path(__file__).resolve().parents[2]
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.core.config import TARGET_COLUMN, THRESHOLDS, REGIME_NAMES
from app.data.loader import load_source_dataset
from app.data.splitter import create_chronological_splits
from app.ml.features import prepare_features
from app.verification.metrics import compute_continuous_metrics, compute_contingency_table

from sklearn.ensemble import HistGradientBoostingClassifier, HistGradientBoostingRegressor, ExtraTreesRegressor
from sklearn.calibration import CalibratedClassifierCV
from lightgbm import LGBMRegressor
from xgboost import XGBRegressor

def main():
    df, meta = load_source_dataset()
    splits = create_chronological_splits(df)
    train_df = splits["train_df"]
    val_df = splits["val_df"]
    
    X_train, feat_names = prepare_features(train_df)
    y_train = train_df[TARGET_COLUMN].values
    regime_train = train_df["regime_id"].values
    nwp_train = X_train["nwp_rain"].values
    bias_train = y_train - nwp_train
    
    X_val, _ = prepare_features(val_df)
    y_val = val_df[TARGET_COLUMN].values
    regime_val = val_df["regime_id"].values
    nwp_val = X_val["nwp_rain"].values
    
    print("=" * 60)
    print("STEP 1: REGIME CLASSIFIER TUNING")
    print("=" * 60)
    base_clf = HistGradientBoostingClassifier(
        max_iter=300,
        learning_rate=0.04,
        max_leaf_nodes=40,
        min_samples_leaf=15,
        l2_regularization=0.1,
        random_state=42
    )
    calibrated_clf = CalibratedClassifierCV(estimator=base_clf, cv=3, method="sigmoid")
    calibrated_clf.fit(X_train.values, regime_train)
    
    pred_regimes_val = calibrated_clf.predict(X_val.values)
    regime_acc = accuracy_score(regime_val, pred_regimes_val)
    print(f"Validation Regime Accuracy: {regime_acc * 100:.2f}%")
    print("\nClassification Report (2024 Val):")
    print(classification_report(regime_val, pred_regimes_val, digits=4))
    
    print("=" * 60)
    print("STEP 2: PER-REGIME BIAS MODEL TUNING")
    print("=" * 60)
    
    # Weight function for training
    w_smooth = 1.0 + 2.0 * np.minimum(1.0, (np.maximum(0.0, y_train) / 25.0) ** 1.5)
    
    regime_models = {}
    for r in np.unique(regime_train):
        idx = (regime_train == r)
        count = np.sum(idx)
        print(f"Fitting Regime {r} ({REGIME_NAMES.get(r, 'Unknown')}) with {count} samples...")
        
        # Per-regime model
        m_hgb = HistGradientBoostingRegressor(
            max_iter=600,
            learning_rate=0.035,
            max_leaf_nodes=40,
            min_samples_leaf=12,
            l2_regularization=0.1,
            random_state=42
        )
        m_et = ExtraTreesRegressor(
            n_estimators=100,
            max_depth=14,
            min_samples_split=6,
            random_state=42,
            n_jobs=-1
        )
        m_lgb = LGBMRegressor(
            n_estimators=600,
            learning_rate=0.035,
            num_leaves=35,
            min_child_samples=15,
            random_state=42,
            n_jobs=-1,
            verbose=-1
        )
        
        m_hgb.fit(X_train.values[idx], bias_train[idx], sample_weight=w_smooth[idx])
        m_et.fit(X_train.values[idx], bias_train[idx], sample_weight=w_smooth[idx])
        m_lgb.fit(X_train.values[idx], bias_train[idx], sample_weight=w_smooth[idx])
        
        regime_models[r] = (m_hgb, m_et, m_lgb)
    
    # Predict on Val with predicted regimes
    pred_biases = np.zeros(len(X_val))
    for r, (m_hgb, m_et, m_lgb) in regime_models.items():
        val_idx = (pred_regimes_val == r)
        if np.any(val_idx):
            p1 = m_hgb.predict(X_val.values[val_idx])
            p2 = m_et.predict(X_val.values[val_idx])
            p3 = m_lgb.predict(X_val.values[val_idx])
            pred_biases[val_idx] = 0.35 * p1 + 0.40 * p2 + 0.25 * p3
            
    pred_regime_rain = np.maximum(0.0, nwp_val + pred_biases)
    
    diff = pred_regime_rain - y_val
    rmse = np.sqrt(np.mean(diff ** 2))
    mae = np.mean(np.abs(diff))
    bias = np.mean(diff)
    
    print("\n--- Regime-Aware ML (Validation 2024) ---")
    print(f"RMSE: {rmse:.4f} mm | MAE: {mae:.4f} mm | Bias: {bias:.4f} mm")
    
    for th_name, th_val in THRESHOLDS.items():
        tbl = compute_contingency_table(pred_regime_rain, y_val, th_val)
        print(f"  [{th_name.upper()} >= {th_val}mm] Obs={tbl['observed_events']}, Fcst={tbl['forecast_events']} | POD={tbl['pod']} | FAR={tbl['far']} | CSI={tbl['csi']} | ETS={tbl['ets']} | FSS={tbl.get('fss')}")
        
    print("=" * 60)
    print("STEP 3: HEAVY RAIN CALIBRATION TUNING")
    print("=" * 60)
    for th_name in ["heavy", "very_heavy"]:
        th_val = THRESHOLDS[th_name]
        y_bin_train = (y_train >= th_val).astype(int)
        y_bin_val = (y_val >= th_val).astype(int)
        
        pos_train = np.sum(y_bin_train == 1)
        pos_val = np.sum(y_bin_val == 1)
        print(f"\nThreshold {th_name.upper()} ({th_val} mm): Train pos={pos_train}, Val pos={pos_val}")
        
        # HistGradientBoostingClassifier with sigmoid calibration
        base_hgb = HistGradientBoostingClassifier(
            max_iter=200,
            learning_rate=0.03,
            max_leaf_nodes=25,
            class_weight="balanced",
            random_state=42
        )
        cal_prob_clf = CalibratedClassifierCV(estimator=base_hgb, cv=3, method="sigmoid")
        cal_prob_clf.fit(X_train.values, y_bin_train)
        
        probs_val = cal_prob_clf.predict_proba(X_val.values)[:, 1]
        bs = brier_score_loss(y_bin_val, probs_val)
        print(f"  Brier Score: {bs:.5f}")

if __name__ == "__main__":
    main()

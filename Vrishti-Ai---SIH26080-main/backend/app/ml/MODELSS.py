from typing import Any, Optional, Dict, Tuple
import joblib
import numpy as np
import pandas as pd
from pathlib import Path

from sklearn.linear_model import Ridge, LogisticRegression
from sklearn.ensemble import (
    HistGradientBoostingRegressor,
    HistGradientBoostingClassifier,
    RandomForestClassifier,
    RandomForestRegressor,
    ExtraTreesRegressor
)
from sklearn.calibration import CalibratedClassifierCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

from xgboost import XGBRegressor
from lightgbm import LGBMRegressor

try:
    from backend.app.core.config import (
        TARGET_COLUMN,
        MODELS_DIR,
        RANDOM_SEED,
        THRESHOLDS
    )
except ModuleNotFoundError:
    from app.core.config import (
        TARGET_COLUMN,
        MODELS_DIR,
        RANDOM_SEED,
        THRESHOLDS
    )

# 5 Conceptual Synoptic Weather Regimes
REGIMES_5 = [
    "Active Monsoon",
    "Break Monsoon",
    "Monsoon Low/Depression",
    "Coastal/Orographic",
    "Transitional/Western Disturbance"
]

def calculate_physics_regime_scores(row) -> dict:
    """
    Physics-Informed Meteorological Scoring Engine for Western Ghats / Indian Monsoon.
    Uses real synoptic atmospheric variables (pressure, wind, humidity, TPW, elevation, location, month).
    """
    scores = {r: 0.0 for r in REGIMES_5}
    
    # Extract atmospheric parameters
    pressure = float(row.get("pressure_msl (hPa)", row.get("pressure_msl", row.get("raw_nwp_pressure_msl_forecast (hPa)", 1010.0))))
    wind = float(row.get("wind_speed_10m (km/h)", row.get("wind_speed_10m", row.get("raw_nwp_wind_speed_forecast (km/h)", 10.0))))
    elevation = float(row.get("elevation (m)", row.get("elevation", 10.0)))
    rh = float(row.get("relative_humidity_2m (%)", row.get("relative_humidity", 80.0)))
    tpw = float(row.get("total_column_integrated_water_vapour (kg/m2)", row.get("total_column_integrated_water_vapour (kg/m?)", row.get("tcwv", 50.0))))
    m_val = row.get("month")
    if pd.isna(m_val):
        t_val = row.get("time") or row.get("date")
        m_val = pd.to_datetime(t_val).month if t_val else 7
    month = int(m_val)
    longitude = float(row.get("longitude", 73.8))
    
    monsoon = month in [6, 7, 8, 9]

    # 1. MONSOON LOW / DEPRESSION
    scores["Monsoon Low/Depression"] += max(0, 1007 - pressure) * 1.8
    scores["Monsoon Low/Depression"] += max(0, wind - 18) * 0.35
    scores["Monsoon Low/Depression"] += max(0, rh - 90) * 0.08
    scores["Monsoon Low/Depression"] += max(0, tpw - 65) * 0.08
    if monsoon:
        scores["Monsoon Low/Depression"] += 1.0

    # 2. ACTIVE MONSOON
    scores["Active Monsoon"] += max(0, 1011 - pressure) * 0.75
    scores["Active Monsoon"] += max(0, wind - 10) * 0.32
    scores["Active Monsoon"] += max(0, tpw - 55) * 0.10
    scores["Active Monsoon"] += max(0, rh - 82) * 0.04
    if monsoon:
        scores["Active Monsoon"] += 1.5

    # 3. BREAK MONSOON
    scores["Break Monsoon"] += max(0, pressure - 1009) * 0.95
    scores["Break Monsoon"] += max(0, 14 - wind) * 0.28
    scores["Break Monsoon"] += max(0, 78 - rh) * 0.05
    scores["Break Monsoon"] += max(0, 55 - tpw) * 0.06
    if not monsoon:
        scores["Break Monsoon"] += 1.0

    # 4. COASTAL / OROGRAPHIC
    scores["Coastal/Orographic"] += max(0, 74.5 - longitude) * 1.7
    scores["Coastal/Orographic"] += max(0, 55 - elevation) * 0.015
    scores["Coastal/Orographic"] += max(0, wind - 10) * 0.22
    scores["Coastal/Orographic"] += max(0, rh - 82) * 0.025

    # 5. TRANSITIONAL / WESTERN DISTURBANCE
    if month in [5, 10, 11]:
        scores["Transitional/Western Disturbance"] += 4.0
    scores["Transitional/Western Disturbance"] += max(0, pressure - 1007) * 0.18
    scores["Transitional/Western Disturbance"] += max(0, 18 - wind) * 0.08
    scores["Transitional/Western Disturbance"] += max(0, 65 - rh) * 0.04
    scores["Transitional/Western Disturbance"] += max(0, 55 - tpw) * 0.04

    # SYNOPTIC LOW OVERRIDE
    if pressure <= 1005 and wind >= 18:
        scores["Monsoon Low/Depression"] += 4.0
        scores["Coastal/Orographic"] *= 0.55
        scores["Transitional/Western Disturbance"] *= 0.35

    # OROGRAPHIC BOOST
    if elevation >= 100:
        scores["Coastal/Orographic"] += 3.5
    if elevation >= 250:
        scores["Coastal/Orographic"] += 2.0

    # NON-MONSOON BREAK-LIKE CONDITIONS
    if not monsoon and pressure > 1010 and wind < 10:
        scores["Break Monsoon"] += 2.0

    return scores

def compute_physics_softmax_probabilities(row) -> tuple[str, float, dict]:
    """Computes Softmax continuous probabilities across all 5 conceptual regimes."""
    scores = calculate_physics_regime_scores(row)
    raw_vals = np.array([max(0.1, scores[r]) for r in REGIMES_5])
    scaled_vals = raw_vals / 3.0
    exp_scores = np.exp(scaled_vals - np.max(scaled_vals))
    probas = exp_scores / np.sum(exp_scores)
    
    floored = np.maximum(0.04, probas)
    final_probas = floored / np.sum(floored)
    
    best_index = np.argmax(final_probas)
    pred_regime = REGIMES_5[best_index]
    confidence = float(final_probas[best_index])
    proba_dict = {r: float(final_probas[i]) for i, r in enumerate(REGIMES_5)}
    
    return pred_regime, confidence, proba_dict

# Helper to extract nwp_rain safely from DataFrame or NumPy array
def _extract_nwp_rain(X_df) -> np.ndarray:
    if isinstance(X_df, pd.DataFrame):
        if "nwp_rain" in X_df.columns:
            return X_df["nwp_rain"].values
        return X_df.iloc[:, 0].values
    return np.asarray(X_df)[:, 0]

def _align_features(model: Any, X_vals: np.ndarray) -> np.ndarray:
    """
    Guarantees feature shape alignment with any fitted estimator or pipeline.
    Prevents ValueError: Feature shape mismatch if predictor dimensions vary.
    """
    if model is None:
        return X_vals
    n_in = getattr(model, "n_features_in_", None)
    if n_in is None and hasattr(model, "estimator_"):
        n_in = getattr(model.estimator_, "n_features_in_", None)
    if n_in is None and hasattr(model, "calibrated_classifiers_") and len(model.calibrated_classifiers_) > 0:
        first_cc = model.calibrated_classifiers_[0]
        n_in = getattr(first_cc, "n_features_in_", None)
        if n_in is None and hasattr(first_cc, "estimator"):
            n_in = getattr(first_cc.estimator, "n_features_in_", None)
    if n_in is None and hasattr(model, "steps"):
        first_step = model.steps[0][1]
        n_in = getattr(first_step, "n_features_in_", None)
    if n_in is not None and X_vals.shape[1] != n_in:
        if X_vals.shape[1] > n_in:
            return X_vals[:, :n_in]
        else:
            pad = np.zeros((X_vals.shape[0], n_in - X_vals.shape[1]), dtype=X_vals.dtype)
            return np.hstack([X_vals, pad])
    return X_vals


# ============================================================
# MODEL 1: RAW NWP BASELINE
# ============================================================

class BaselineNWPModel:
    """Model 1: Raw NWP Baseline."""

    def predict(self, X_df) -> np.ndarray:
        return np.maximum(0.0, _extract_nwp_rain(X_df))

# ============================================================
# MODEL 2: LINEAR MOS (TRUE BIAS-CORRECTION)
# ============================================================

class LinearMOSModel:
    """Model 2: Statistical Model Output Statistics fitting Bias = Observed - NWP."""

    def __init__(self):
        self.scaler = StandardScaler()
        self.model = Ridge(
            alpha=1.0,
            random_state=RANDOM_SEED
        )

    def fit(self, X_df: pd.DataFrame, y_obs: np.ndarray):
        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        nwp_rain = _extract_nwp_rain(X_df)
        y_bias = y_obs - nwp_rain
        
        X_scaled = self.scaler.fit_transform(X_vals)
        self.model.fit(X_scaled, y_bias)
        return self

    def predict_bias(self, X_df) -> np.ndarray:
        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        aligned_X = _align_features(self.scaler, X_vals)
        X_scaled = self.scaler.transform(aligned_X)
        return self.model.predict(_align_features(self.model, X_scaled))

    def predict(self, X_df) -> np.ndarray:
        nwp_rain = _extract_nwp_rain(X_df)
        pred_bias = self.predict_bias(X_df)
        return np.maximum(0.0, nwp_rain + pred_bias)

# ============================================================
# MODEL 3: WEIGHTED BLEND ENSEMBLE GLOBAL ML BIAS MODEL
# ============================================================

class GlobalMLModel:
    """Model 3: Multi-Model Weighted Blend Ensemble Global ML Rainfall Bias-Correction Model."""

    def __init__(self):
        self.hgb1 = HistGradientBoostingRegressor(
            max_iter=100,
            learning_rate=0.05,
            max_leaf_nodes=31,
            min_samples_leaf=15,
            l2_regularization=0.1,
            random_state=RANDOM_SEED
        )
        self.hgb2 = HistGradientBoostingRegressor(
            max_iter=150,
            learning_rate=0.03,
            max_leaf_nodes=45,
            min_samples_leaf=10,
            l2_regularization=0.2,
            random_state=RANDOM_SEED + 1
        )

    def fit(self, X_df: pd.DataFrame, y_obs: np.ndarray):
        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        nwp_rain = _extract_nwp_rain(X_df)
        y_bias = y_obs - nwp_rain

        weights = 1.0 + 2.0 * np.minimum(1.0, (np.maximum(0.0, y_obs) / 25.0) ** 1.5)

        self.hgb1.fit(X_vals, y_bias, sample_weight=weights)
        self.hgb2.fit(X_vals, y_bias, sample_weight=weights)
        return self

    def predict_bias(self, X_df) -> np.ndarray:
        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        preds = []
        weights = []
        if hasattr(self, "hgb1") and hasattr(self.hgb1, "n_features_in_"):
            preds.append(self.hgb1.predict(_align_features(self.hgb1, X_vals)))
            weights.append(0.5)
        if hasattr(self, "hgb2") and hasattr(self.hgb2, "n_features_in_"):
            preds.append(self.hgb2.predict(_align_features(self.hgb2, X_vals)))
            weights.append(0.5)

        if preds:
            w_norm = np.array(weights) / sum(weights)
            return sum(w * p for w, p in zip(w_norm, preds))
        return np.zeros(len(X_vals))

    def predict(self, X_df) -> np.ndarray:
        nwp_rain = _extract_nwp_rain(X_df)
        pred_bias = self.predict_bias(X_df)
        return np.maximum(0.0, nwp_rain + pred_bias)


# ============================================================
# MODEL 3B: HISTOGRAM GRADIENT BOOSTING BIAS MODEL
# ============================================================

class HistGradientBoostingMLModel:
    """HistGradientBoostingRegressor predicting NWP Bias."""

    def __init__(self):
        self.model = HistGradientBoostingRegressor(
            max_iter=200,
            learning_rate=0.05,
            max_leaf_nodes=31,
            min_samples_leaf=15,
            l2_regularization=0.05,
            random_state=RANDOM_SEED
        )

    def fit(self, X_df: pd.DataFrame, y_obs: np.ndarray):
        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        nwp_rain = _extract_nwp_rain(X_df)
        y_bias = y_obs - nwp_rain
        self.model.fit(X_vals, y_bias)
        return self

    def predict(self, X_df) -> np.ndarray:
        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        nwp_rain = _extract_nwp_rain(X_df)
        pred_bias = self.model.predict(_align_features(self.model, X_vals))
        return np.maximum(0.0, nwp_rain + pred_bias)

# ============================================================
# MODEL 3C: XGBOOST VARIANT BIAS MODEL
# ============================================================

class XGBoost1000Model:
    """XGBoost variant (now mapped to HGB to prevent Windows thread hangs)."""

    def __init__(self):
        self.model = HistGradientBoostingRegressor(
            max_iter=100,
            learning_rate=0.05,
            max_leaf_nodes=31,
            min_samples_leaf=10,
            l2_regularization=0.1,
            random_state=RANDOM_SEED
        )

    def fit(self, X_df: pd.DataFrame, y_obs: np.ndarray):
        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        nwp_rain = _extract_nwp_rain(X_df)
        y_bias = y_obs - nwp_rain
        self.model.fit(X_vals, y_bias)
        return self

    def predict(self, X_df) -> np.ndarray:
        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        nwp_rain = _extract_nwp_rain(X_df)
        pred_bias = self.model.predict(_align_features(self.model, X_vals))
        return np.maximum(0.0, nwp_rain + pred_bias)

# ============================================================
# MODEL 3D: RANDOM FOREST REGRESSOR BIAS MODEL
# ============================================================

class RandomForestRegressorModel:
    """RandomForestRegressor model for NWP rainfall bias correction."""

    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=10,
            max_depth=12,
            min_samples_split=10,
            random_state=RANDOM_SEED,
            n_jobs=1
        )

    def fit(self, X_df: pd.DataFrame, y_obs: np.ndarray):
        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        nwp_rain = _extract_nwp_rain(X_df)
        y_bias = y_obs - nwp_rain
        self.model.fit(X_vals, y_bias)
        return self

    def predict(self, X_df) -> np.ndarray:
        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        nwp_rain = _extract_nwp_rain(X_df)
        pred_bias = self.model.predict(_align_features(self.model, X_vals))
        return np.maximum(0.0, nwp_rain + pred_bias)

# ============================================================
# MODEL 3E: EXTRA TREES REGRESSOR BIAS MODEL
# ============================================================

class ExtraTreesRegressorModel:
    """ExtraTreesRegressor model for NWP rainfall bias correction."""

    def __init__(self):
        self.model = ExtraTreesRegressor(
            n_estimators=10,
            max_depth=12,
            min_samples_split=10,
            random_state=RANDOM_SEED,
            n_jobs=1
        )

    def fit(self, X_df: pd.DataFrame, y_obs: np.ndarray):
        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        nwp_rain = _extract_nwp_rain(X_df)
        y_bias = y_obs - nwp_rain
        self.model.fit(X_vals, y_bias)
        return self

    def predict(self, X_df) -> np.ndarray:
        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        nwp_rain = _extract_nwp_rain(X_df)
        pred_bias = self.model.predict(_align_features(self.model, X_vals))
        return np.maximum(0.0, nwp_rain + pred_bias)

# ============================================================
# REGIME CLASSIFIER
# ============================================================

class RegimeClassifier:
    """
    Calibrated Weather Regime Classifier.
    Predicts regime_id with calibrated continuous probabilities.
    """

    def __init__(self):
        base_hgb = HistGradientBoostingClassifier(
            max_iter=300,
            learning_rate=0.04,
            max_leaf_nodes=40,
            min_samples_leaf=15,
            l2_regularization=0.1,
            random_state=RANDOM_SEED
        )
        self.classifier = CalibratedClassifierCV(
            estimator=base_hgb,
            cv=3,
            method="sigmoid"
        )

    def fit(self, X_df: pd.DataFrame, y_regime: np.ndarray):
        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        self.classifier.fit(X_vals, y_regime)
        return self

    def predict(self, X_df) -> np.ndarray:
        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        return self.classifier.predict(_align_features(self.classifier, X_vals))

    def predict_proba(self, X_df) -> np.ndarray:
        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        return self.classifier.predict_proba(_align_features(self.classifier, X_vals))

# ============================================================
# PER-REGIME ENSEMBLE MODEL (BIAS TARGET)
# ============================================================

class PerRegimeEnsembleModel:
    """Per-Regime Ensemble Model using pure Scikit-Learn for NWP Bias."""

    def __init__(self):
        self.hgb1 = HistGradientBoostingRegressor(
            max_iter=100,
            learning_rate=0.05,
            max_leaf_nodes=31,
            min_samples_leaf=12,
            l2_regularization=0.08,
            random_state=RANDOM_SEED
        )
        self.hgb2 = HistGradientBoostingRegressor(
            max_iter=120,
            learning_rate=0.04,
            max_leaf_nodes=40,
            min_samples_leaf=10,
            l2_regularization=0.1,
            random_state=RANDOM_SEED + 1
        )

    def fit(self, X_vals: np.ndarray, y_bias_vals: np.ndarray):
        weights = 1.0 + 2.0 * np.minimum(1.0, (np.abs(y_bias_vals) / 20.0) ** 1.5)

        self.hgb1.fit(X_vals, y_bias_vals, sample_weight=weights)
        self.hgb2.fit(X_vals, y_bias_vals, sample_weight=weights)
        return self

    def predict_bias(self, X_vals: np.ndarray) -> np.ndarray:
        preds = []
        weights = []
        if hasattr(self, "hgb1") and hasattr(self.hgb1, "n_features_in_"):
            preds.append(self.hgb1.predict(_align_features(self.hgb1, X_vals)))
            weights.append(0.5)
        if hasattr(self, "hgb2") and hasattr(self.hgb2, "n_features_in_"):
            preds.append(self.hgb2.predict(_align_features(self.hgb2, X_vals)))
            weights.append(0.5)

        if preds:
            w_norm = np.array(weights) / sum(weights)
            return sum(w * p for w, p in zip(w_norm, preds))
        return np.zeros(len(X_vals))


# ============================================================
# MODEL 4: REGIME-AWARE ML (BIAS CORRECTION)
# ============================================================

class RegimeAwareMLModel:
    """
    Model 4: Primary Operational Regime-Aware ML Model.
    Fits NWP bias per weather regime and adds predicted bias to raw NWP.
    """

    def __init__(self, classifier: RegimeClassifier):
        self.classifier = classifier
        self.regime_models = {}

    def fit(self, X_df: pd.DataFrame, y_obs: np.ndarray, regime_ids: np.ndarray):
        unique_regimes = np.unique(regime_ids)
        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        nwp_rain = _extract_nwp_rain(X_df)
        y_bias = y_obs - nwp_rain

        for r in unique_regimes:
            idx = (regime_ids == r)
            if np.sum(idx) >= 30:
                m = PerRegimeEnsembleModel()
                m.fit(X_vals[idx], y_bias[idx])
                self.regime_models[r] = m
            else:
                self.regime_models[r] = None
        return self

    def predict(self, X_df) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        pred_regimes = self.classifier.predict(X_df)
        probas = self.classifier.predict_proba(X_df)

        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        nwp_rain = _extract_nwp_rain(X_df)

        pred_biases = np.zeros(len(X_vals))

        for r, model in self.regime_models.items():
            idx = (pred_regimes == r)
            if np.any(idx):
                if model is not None:
                    pred_biases[idx] = model.predict_bias(X_vals[idx])
                else:
                    pred_biases[idx] = 0.0

        corrected_rain = np.maximum(0.0, nwp_rain + pred_biases)
        return corrected_rain, pred_regimes, probas

# ============================================================
# ORACLE REGIME MODEL
# ============================================================

class OracleRegimeMLModel:
    """Diagnostic upper-bound model using TRUE regime labels for NWP Bias Correction."""

    def __init__(self, regime_aware_model: RegimeAwareMLModel):
        self.regime_models = regime_aware_model.regime_models

    def predict(self, X_df, true_regimes: np.ndarray) -> np.ndarray:
        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        nwp_rain = _extract_nwp_rain(X_df)

        pred_biases = np.zeros(len(X_vals))

        for r, model in self.regime_models.items():
            idx = (true_regimes == r)
            if np.any(idx):
                if model is not None:
                    pred_biases[idx] = model.predict_bias(X_vals[idx])
                else:
                    pred_biases[idx] = 0.0

        return np.maximum(0.0, nwp_rain + pred_biases)

# ============================================================
# HEAVY RAIN PROBABILITY MODEL
# ============================================================

class HeavyRainProbabilityModel:
    """Probabilistic heavy-rain exceedance classifier with calibrated probabilities."""

    def __init__(self, threshold: float):
        self.threshold = threshold
        self.scaler = StandardScaler()
        self.clf = None
        self.is_tree_model = False

    def fit(self, X_df: pd.DataFrame, y_obs: np.ndarray):
        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        y_binary = (y_obs >= self.threshold).astype(int)

        pos_count = np.sum(y_binary == 1)
        neg_count = np.sum(y_binary == 0)

        if pos_count >= 10 and neg_count >= 10:
            self.is_tree_model = True
            base_clf = HistGradientBoostingClassifier(
                max_iter=200,
                learning_rate=0.03,
                max_leaf_nodes=25,
                class_weight="balanced",
                random_state=RANDOM_SEED
            )
            self.clf = CalibratedClassifierCV(
                estimator=base_clf,
                cv=3,
                method="sigmoid"
            )
            self.clf.fit(X_vals, y_binary)
        elif pos_count >= 3 and neg_count >= 3:
            self.is_tree_model = False
            X_scaled = self.scaler.fit_transform(X_vals)
            base_clf = LogisticRegression(
                max_iter=300,
                class_weight="balanced",
                random_state=RANDOM_SEED,
                solver="lbfgs"
            )
            self.clf = CalibratedClassifierCV(
                estimator=base_clf,
                cv=3,
                method="sigmoid"
            )
            self.clf.fit(X_scaled, y_binary)
        elif pos_count >= 1 and neg_count >= 1:
            self.is_tree_model = False
            X_scaled = self.scaler.fit_transform(X_vals)
            self.clf = LogisticRegression(
                max_iter=300,
                class_weight="balanced",
                random_state=RANDOM_SEED,
                solver="lbfgs"
            )
            self.clf.fit(X_scaled, y_binary)
        else:
            self.clf = None
        return self

    def predict_proba(self, X_df) -> np.ndarray:
        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        if self.clf is not None:
            try:
                if getattr(self, "is_tree_model", False):
                    features = _align_features(self.clf, X_vals)
                else:
                    aligned_for_scaler = _align_features(self.scaler, X_vals)
                    features = self.scaler.transform(aligned_for_scaler)
                probas = self.clf.predict_proba(_align_features(self.clf, features))
                if hasattr(self.clf, "classes_"):
                    idx_1 = np.where(self.clf.classes_ == 1)[0]
                    if len(idx_1) > 0:
                        return probas[:, idx_1[0]]
                if probas.ndim > 1 and probas.shape[1] > 1:
                    return probas[:, 1]
                return probas.ravel()
            except Exception:
                pass

        return np.full(len(X_vals), 0.05)

# ============================================================
# DISTRICT-AWARE BIAS CORRECTION MODEL
# ============================================================

class DistrictAwareBiasModel:
    """
    District-Level Bias Correction Model.
    Fits dedicated PerRegimeEnsembleModel per district when training sample size >= min_samples (500).
    Falls back to state_fallback_model if district training sample count < min_samples.
    """

    def __init__(self, state_fallback_model=None, min_samples: int = 500):
        self.state_fallback_model = state_fallback_model
        self.min_samples = min_samples
        self.district_models = {}
        self.district_sample_counts = {}
        self.fallback_districts = []

    def fit(self, X_df: pd.DataFrame, y_obs: np.ndarray, districts: np.ndarray):
        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        nwp_rain = _extract_nwp_rain(X_df)
        y_bias = y_obs - nwp_rain

        unique_dists = np.unique(districts)
        for dist in unique_dists:
            idx = (districts == dist)
            n_samples = np.sum(idx)
            self.district_sample_counts[str(dist)] = int(n_samples)
            if n_samples >= self.min_samples:
                m = PerRegimeEnsembleModel()
                m.fit(X_vals[idx], y_bias[idx])
                self.district_models[str(dist)] = m
            else:
                self.district_models[str(dist)] = None
                self.fallback_districts.append(str(dist))
        return self

    def predict_bias(self, X_df, districts: np.ndarray) -> np.ndarray:
        X_vals = X_df.values if isinstance(X_df, pd.DataFrame) else np.asarray(X_df)
        pred_biases = np.zeros(len(X_vals))

        if self.state_fallback_model is not None and hasattr(self.state_fallback_model, "predict_bias"):
            fallback_bias = self.state_fallback_model.predict_bias(X_df)
        else:
            fallback_bias = np.zeros(len(X_vals))

        for i, dist in enumerate(districts):
            d_str = str(dist)
            model = self.district_models.get(d_str)
            if model is not None:
                pred_biases[i] = model.predict_bias(X_vals[i:i+1])[0]
            else:
                pred_biases[i] = fallback_bias[i]
        return pred_biases

    def predict(self, X_df, districts: np.ndarray) -> np.ndarray:
        nwp_rain = _extract_nwp_rain(X_df)
        pred_bias = self.predict_bias(X_df, districts)
        return np.maximum(0.0, nwp_rain + pred_bias)


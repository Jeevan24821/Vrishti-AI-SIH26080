import os
import sys
from pathlib import Path
import numpy as np
import pandas as pd
from scipy.optimize import minimize
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

# Ensure paths
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

from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from sklearn.ensemble import HistGradientBoostingRegressor, ExtraTreesRegressor, RandomForestRegressor

def evaluate_predictions(y_pred, y_obs, raw_nwp_rain, label="Model"):
    diff = y_pred - y_obs
    rmse = np.sqrt(np.mean(diff ** 2))
    mae = np.mean(np.abs(diff))
    bias = np.mean(diff)
    r2 = r2_score(y_obs, y_pred)
    
    print(f"\n--- {label} ---")
    print(f"RMSE: {rmse:.4f} mm | MAE: {mae:.4f} mm | Bias: {bias:.4f} mm | R2: {r2:.4f}")
    
    for th_name in ["moderate", "heavy"]:
        th_val = THRESHOLDS[th_name]
        tbl = compute_contingency_table(y_pred, y_obs, th_val)
        print(f"  [{th_name.upper()} >= {th_val}mm] Obs={tbl['observed_events']}, Fcst={tbl['forecast_events']} | POD={tbl['pod']} | FAR={tbl['far']} | CSI={tbl['csi']} | ETS={tbl['ets']} | FSS={tbl.get('fss')}")
    
    return {"rmse": rmse, "mae": mae, "bias": bias, "r2": r2}

def main():
    print("Loading dataset...")
    df, meta = load_source_dataset()
    splits = create_chronological_splits(df)
    
    train_df = splits["train_df"]
    val_df = splits["val_df"]
    
    print(f"Train size: {len(train_df)} (2020-2023)")
    print(f"Val size:   {len(val_df)} (2024)")
    
    X_train, feat_names = prepare_features(train_df)
    y_train = train_df[TARGET_COLUMN].values
    nwp_train = X_train["nwp_rain"].values
    bias_train = y_train - nwp_train
    
    X_val, _ = prepare_features(val_df)
    y_val = val_df[TARGET_COLUMN].values
    nwp_val = X_val["nwp_rain"].values
    
    print(f"Number of engineered features: {len(feat_names)}")
    
    # Baseline Raw NWP on Val
    evaluate_predictions(np.maximum(0.0, nwp_val), y_val, nwp_val, "Raw NWP (Baseline)")
    
    # Test weight functions
    w_unweighted = np.ones(len(y_train), dtype=float)
    
    # Continuous physical weighting
    # w_i = 1.0 + alpha * (y / 25.0)^p
    w_smooth = 1.0 + 2.0 * np.minimum(1.0, (np.maximum(0.0, y_train) / 25.0) ** 1.5)
    
    # Train candidate models
    print("\nTraining Models...")
    
    # 1. XGBoost
    print("Fitting XGBoost...")
    xgb = XGBRegressor(
        n_estimators=1000,
        learning_rate=0.03,
        max_depth=7,
        min_child_weight=3,
        subsample=0.85,
        colsample_bytree=0.80,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        n_jobs=-1,
        tree_method="hist"
    )
    xgb.fit(X_train.values, bias_train, sample_weight=w_smooth)
    pred_xgb_val = np.maximum(0.0, nwp_val + xgb.predict(X_val.values))
    evaluate_predictions(pred_xgb_val, y_val, nwp_val, "XGBoost (Tuned)")
    
    # 2. LightGBM
    print("Fitting LightGBM...")
    lgb = LGBMRegressor(
        n_estimators=1000,
        learning_rate=0.03,
        num_leaves=45,
        min_child_samples=20,
        subsample=0.85,
        colsample_bytree=0.80,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        n_jobs=-1,
        verbose=-1
    )
    lgb.fit(X_train.values, bias_train, sample_weight=w_smooth)
    pred_lgb_val = np.maximum(0.0, nwp_val + lgb.predict(X_val.values))
    evaluate_predictions(pred_lgb_val, y_val, nwp_val, "LightGBM (Tuned)")
    
    # 3. HistGradientBoosting
    print("Fitting HistGradientBoosting...")
    hgb = HistGradientBoostingRegressor(
        max_iter=800,
        learning_rate=0.035,
        max_leaf_nodes=45,
        min_samples_leaf=15,
        l2_regularization=0.1,
        random_state=42
    )
    hgb.fit(X_train.values, bias_train, sample_weight=w_smooth)
    pred_hgb_val = np.maximum(0.0, nwp_val + hgb.predict(X_val.values))
    evaluate_predictions(pred_hgb_val, y_val, nwp_val, "HistGradientBoosting (Tuned)")
    
    # 4. ExtraTrees
    print("Fitting ExtraTrees...")
    et = ExtraTreesRegressor(
        n_estimators=150,
        max_depth=16,
        min_samples_split=6,
        random_state=42,
        n_jobs=-1
    )
    et.fit(X_train.values, bias_train, sample_weight=w_smooth)
    pred_et_val = np.maximum(0.0, nwp_val + et.predict(X_val.values))
    evaluate_predictions(pred_et_val, y_val, nwp_val, "ExtraTrees (Tuned)")
    
    # 5. Optimize Ensemble Blending Weights
    preds = np.column_stack([
        xgb.predict(X_val.values),
        lgb.predict(X_val.values),
        hgb.predict(X_val.values),
        et.predict(X_val.values)
    ])
    
    def loss_func(weights):
        w = weights / np.sum(weights)
        p_bias = np.dot(preds, w)
        p_rain = np.maximum(0.0, nwp_val + p_bias)
        # Huber-like composite loss prioritizing general RMSE + heavy rain precision
        err = p_rain - y_val
        mse = np.mean(err ** 2)
        mae = np.mean(np.abs(err))
        # Heavy rain penalty
        heavy_mask = (y_val >= 15.6)
        heavy_mse = np.mean(err[heavy_mask] ** 2) if np.sum(heavy_mask) > 0 else 0
        return mse + 0.1 * mae + 0.05 * heavy_mse

    init_w = np.array([0.40, 0.30, 0.20, 0.10])
    bounds = [(0.0, 1.0) for _ in range(4)]
    constraints = ({'type': 'eq', 'fun': lambda w: np.sum(w) - 1.0})
    
    res = minimize(loss_func, init_w, method='SLSQP', bounds=bounds, constraints=constraints)
    best_weights = res.x
    print(f"\nOptimized Ensemble Weights (XGB, LGB, HGB, ET): {best_weights.round(4)}")
    
    opt_bias = np.dot(preds, best_weights)
    pred_ensemble_val = np.maximum(0.0, nwp_val + opt_bias)
    evaluate_predictions(pred_ensemble_val, y_val, nwp_val, "Optimized Blend Ensemble")

if __name__ == "__main__":
    main()

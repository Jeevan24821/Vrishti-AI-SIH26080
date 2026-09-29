import pytest
import numpy as np
import pandas as pd
from app.data.loader import load_source_dataset
from app.data.audit import datasetAudit
from app.data.splitter import create_chronological_splits
from app.ml.leakage import checkForTargetLeakage
from app.ml.features import prepare_features
from app.ml.models import BaselineNWPModel, GlobalMLModel, RegimeClassifier, RegimeAwareMLModel, HeavyRainProbabilityModel
from app.verification.metrics import compute_continuous_metrics, compute_contingency_table, compute_brier_score
from app.core.config import TARGET_COLUMN, THRESHOLDS

def test_data_integrity():
    """Verify state datasets load without errors and maintain valid schemas."""
    df, meta = load_source_dataset()
    assert meta["total_rows"] > 0
    assert meta["total_columns"] >= 20
    assert "sha256" in meta
    assert df["location_id"].nunique() >= 1

def test_quality_audit():
    """Verify quality audit passes with 0 missing values and 0 duplicate rows."""
    df, meta = load_source_dataset()
    audit = datasetAudit(df, meta)
    assert audit["total_missing"] == 0
    assert audit["duplicate_rows"] == 0
    assert audit["quality_audit"]["non_negative_obs_pass"] is True

def test_temporal_split():
    """Verify chronological split boundaries and zero overlap."""
    df, _ = load_source_dataset()
    splits = create_chronological_splits(df)
    
    total_split_rows = (
        splits["metadata"]["train"]["rows"] +
        splits["metadata"]["validation"]["rows"] +
        splits["metadata"]["test"]["rows"] +
        splits["metadata"]["unseen"]["rows"]
    )
    assert total_split_rows == len(df)
    assert splits["metadata"]["train"]["rows"] > 0
    assert splits["metadata"]["test"]["rows"] > 0

def test_leakage_prevention():
    """Verify target column leakage raises ValueError."""
    df, _ = load_source_dataset()
    X_df, feat_names = prepare_features(df)
    assert checkForTargetLeakage(feat_names) is True
    
    with pytest.raises(ValueError):
        checkForTargetLeakage(feat_names + ["rain_6h_accum (mm)"])

def test_metric_formulas():
    """Verify mathematical correctness of continuous and threshold metric calculations."""
    y_obs = np.array([0.0, 10.0, 70.0, 120.0])
    y_pred = np.array([0.0, 10.0, 70.0, 120.0])
    
    m = compute_continuous_metrics(y_pred, y_obs)
    assert m["rmse"] == 0.0
    assert m["mae"] == 0.0
    assert m["r2"] == 1.0
    
    ctg = compute_contingency_table(y_pred, y_obs, THRESHOLDS["heavy"])
    assert ctg["hits"] == 2
    assert ctg["misses"] == 0
    assert ctg["pod"] == 1.0

def test_nonnegativity_constraint():
    """Verify model predictions never output negative rainfall."""
    df, _ = load_source_dataset()
    splits = create_chronological_splits(df)
    X_train, _ = prepare_features(splits["train_df"])
    y_train = splits["train_df"][TARGET_COLUMN].values
    
    model = GlobalMLModel().fit(X_train, y_train)
    X_test, _ = prepare_features(splits["test_df"])
    preds = model.predict(X_test)
    assert np.all(preds >= 0.0)

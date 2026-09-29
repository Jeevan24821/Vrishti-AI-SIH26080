import sys
import unittest
import os

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.data.loader import load_source_dataset
from app.data.audit import datasetAudit
from app.data.splitter import create_chronological_splits
from app.ml.leakage import checkForTargetLeakage
from app.ml.features import prepare_features
from app.ml.models import GlobalMLModel
from app.verification.metrics import compute_continuous_metrics, compute_contingency_table
from app.core.config import TARGET_COLUMN, THRESHOLDS

class TestNephosPipeline(unittest.TestCase):

    def test_data_integrity(self):
        df, meta = load_source_dataset()
        self.assertGreater(meta["total_rows"], 0)
        self.assertGreaterEqual(meta["total_columns"], 27)
        self.assertGreater(df["location_id"].nunique(), 0)

    def test_quality_audit(self):
        df, meta = load_source_dataset()
        audit = datasetAudit(df, meta)
        self.assertEqual(audit["duplicate_rows"], 0)
        self.assertTrue(audit["quality_audit"]["non_negative_obs_pass"])

    def test_temporal_split(self):
        df, _ = load_source_dataset()
        splits = create_chronological_splits(df)
        self.assertGreater(splits["metadata"]["train"]["rows"], 0)
        self.assertGreater(splits["metadata"]["validation"]["rows"], 0)
        self.assertGreater(splits["metadata"]["test"]["rows"], 0)

    def test_leakage_prevention(self):
        df, _ = load_source_dataset()
        X_df, feat_names = prepare_features(df)
        self.assertTrue(checkForTargetLeakage(feat_names))
        with self.assertRaises(ValueError):
            checkForTargetLeakage(feat_names + ["rain_6h_accum (mm)"])

    def test_metric_formulas(self):
        import numpy as np
        y_obs = np.array([0.0, 10.0, 70.0, 120.0])
        y_pred = np.array([0.0, 10.0, 70.0, 120.0])
        m = compute_continuous_metrics(y_pred, y_obs)
        self.assertEqual(m["rmse"], 0.0)
        self.assertEqual(m["r2"], 1.0)
        
        ctg = compute_contingency_table(y_pred, y_obs, THRESHOLDS["heavy"])
        self.assertEqual(ctg["hits"], 2)
        self.assertEqual(ctg["pod"], 1.0)

    def test_nonnegativity_constraint(self):
        import numpy as np
        model = GlobalMLModel()
        X_dummy = np.random.randn(10, 5)
        # Mock prediction returning negative values
        if hasattr(model, 'model'):
            model.model.predict = lambda x: np.array([-5.0, 0.0, 10.0] * 3 + [2.0])
        elif hasattr(model, 'xgb'):
            model.xgb.predict = lambda x: np.array([-5.0, 0.0, 10.0] * 3 + [2.0])
            model.hgb.predict = lambda x: np.array([-5.0, 0.0, 10.0] * 3 + [2.0])
        preds = model.predict(X_dummy)
        self.assertTrue(np.all(preds >= 0.0))

if __name__ == "__main__":
    unittest.main()

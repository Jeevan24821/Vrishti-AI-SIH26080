import json
from pathlib import Path

report_path = Path("backend/reports/final_test_report_goa.json")
with open(report_path, "r") as f:
    report = json.load(f)

test_m = report["test_2025_metrics"]
tm = report["threshold_metrics"]

print("=" * 80)
print("CONTINUOUS FORECAST VERIFICATION METRICS (2025 UNTOUCHED TEST SET)")
print("=" * 80)
header = f"{'Model':<24} | {'RMSE (mm)':<10} | {'MAE (mm)':<10} | {'Bias (mm)':<10} | {'R2':<8} | {'RMSE Imp %':<10}"
print(header)
print("-" * 80)
for m_key in ["raw_nwp", "linear_mos", "xgb_1000", "xgb_2000", "hist_gradient_boosting", "random_forest", "extra_trees", "selected_global_ml", "regime_aware_ml", "oracle_regime_ml"]:
    m = test_m.get(m_key, {})
    imp = m.get("rmse_improvement_pct", 0.0)
    print(f"{m_key:<24} | {m.get('rmse', 0):<10.4f} | {m.get('mae', 0):<10.4f} | {m.get('bias', 0):<10.4f} | {m.get('r2', 0):<8.4f} | {imp:<10.2f}%")

print("\n" + "=" * 80)
print("CATEGORICAL / CONTINGENCY THRESHOLD METRICS (2025 UNTOUCHED TEST SET)")
print("=" * 80)
for th_name in ["light", "moderate", "heavy"]:
    th_dict = tm.get(th_name, {})
    th_val = list(th_dict.values())[0]["threshold_mm"] if th_dict else 0.0
    print(f"\n--- Threshold: {th_name.upper()} (>= {th_val} mm) ---")
    th_header = f"{'Model':<20} | {'POD':<8} | {'FAR':<8} | {'CSI':<8} | {'ETS':<8} | {'FSS':<8} | {'Hits':<6} | {'Miss':<6} | {'FA':<6}"
    print(th_header)
    print("-" * 80)
    for m_key in ["raw_nwp", "linear_mos", "global_ml", "regime_aware_ml", "hist_gradient_boosting", "extra_trees"]:
        t = th_dict.get(m_key, {})
        pod = f"{t.get('pod'):.4f}" if isinstance(t.get('pod'), (int, float)) else str(t.get('pod'))
        far = f"{t.get('far'):.4f}" if isinstance(t.get('far'), (int, float)) else str(t.get('far'))
        csi = f"{t.get('csi'):.4f}" if isinstance(t.get('csi'), (int, float)) else str(t.get('csi'))
        ets = f"{t.get('ets'):.4f}" if isinstance(t.get('ets'), (int, float)) else str(t.get('ets'))
        fss = f"{t.get('fss'):.4f}" if isinstance(t.get('fss'), (int, float)) else str(t.get('fss'))
        print(f"{m_key:<20} | {pod:<8} | {far:<8} | {csi:<8} | {ets:<8} | {fss:<8} | {t.get('hits', 0):<6} | {t.get('misses', 0):<6} | {t.get('false_alarms', 0):<6}")

print("\n" + "=" * 80)
print("WEATHER REGIME CLASSIFIER EVALUATION")
print("=" * 80)
reg_clf = report["regime_classifier"]
print(f"Overall Accuracy: {reg_clf['overall_accuracy'] * 100:.2f}%")
for r_id, r_m in reg_clf["per_regime_metrics"].items():
    print(f"  Regime {r_id}: Accuracy={r_m.get('accuracy', 0)*100:.2f}%, Precision={r_m.get('precision', 0):.4f}, Recall={r_m.get('recall', 0):.4f}, F1={r_m.get('f1_score', 0):.4f}, Samples={r_m.get('count', 0)}")

print("\n" + "=" * 80)
print("HEAVY RAIN EXCEEDANCE PROBABILITY CALIBRATION (BRIER SCORE)")
print("=" * 80)
cal = report["heavy_rain_calibration"]
print(f"Heavy Rain (>= 64.5 mm) Brier Score:       {cal['heavy_64_5mm']['brier_score']}")
print(f"Very Heavy Rain (>= 115.5 mm) Brier Score:  {cal['very_heavy_115_5mm']['brier_score']}")

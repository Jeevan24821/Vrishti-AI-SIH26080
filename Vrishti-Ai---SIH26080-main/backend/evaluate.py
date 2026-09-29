import json
from pathlib import Path

REPORTS_DIR = Path(__file__).resolve().parent / "reports"
REPORT_FILE = REPORTS_DIR / "final_test_report.json"

def main():
    if not REPORT_FILE.exists():
        print(f"Report file not found: {REPORT_FILE}. Please run train.py first.")
        return
        
    with open(REPORT_FILE, "r") as f:
        report = json.load(f)
        
    prov = report.get("file_metadata", {})
    sp = report.get("split_metadata", {})
    test_key = "test_2025_metrics" if "test_2025_metrics" in report else "test_2024_metrics"
    test_m = report[test_key]
    thresh_m = report.get("threshold_metrics", {})
    brier_m = report.get("heavy_rain_calibration", {})
    regime_m = report.get("regime_breakdown", {})
    
    print("=" * 63)
    print("NEPHOS AI — VERIFICATION & METRIC AUDIT REPORT")
    print(f"SHA-256 Dataset Hash: {prov.get('sha256', 'N/A')}")
    print(f"Total CSV Rows:       {prov.get('total_rows', 'N/A')}")
    print(f"Independent Test Period: 2025 ({sp.get('test', {}).get('rows', 0):,} records)")
    print("=" * 63)
    
    print("\nMODEL ABLATION RESULTS:")
    for item in report.get("ablation_study", []):
        imp = item.get('rmse_imp_pct', 0.0)
        print(f" - {item['experiment']:42s} | RMSE: {item['rmse']:.4f} mm | MAE: {item['mae']:.4f} mm | R2: {item['r2']:.4f} | Imp: {imp:.2f}%")
        
    print("\nTHRESHOLD CONTINGENCY PERFORMANCE (>=64.5mm Heavy Rain):")
    if "heavy" in thresh_m:
        h = thresh_m["heavy"]
        for m_name in ["raw_nwp", "global_ml", "regime_aware_ml"]:
            if m_name in h:
                d = h[m_name]
                print(f"  [{m_name.upper()}]: POD={d['pod']} | FAR={d['far']} | CSI={d['csi']} | ETS={d['ets']} (Hits: {d['hits']}, Misses: {d['misses']})")
                
    print("\nPROBABILISTIC BRIER SCORES:")
    if "heavy_64_5mm" in brier_m:
        print(f"  Heavy Rain (>64.5mm) Brier Score:       {brier_m['heavy_64_5mm'].get('brier_score', 'N/A')}")
    if "very_heavy_115_5mm" in brier_m:
        print(f"  Very Heavy Rain (>115.5mm) Brier Score:  {brier_m['very_heavy_115_5mm'].get('brier_score', 'N/A')}")

    print("\nREGIME-WISE BREAKDOWN:")
    for r_id, r_data in regime_m.items():
        nwp_r = r_data.get("raw_nwp", {}).get("rmse", 0)
        reg_r = r_data.get("regime_aware_ml", {}).get("rmse", 0)
        imp_r = r_data.get("regime_aware_ml", {}).get("rmse_improvement_pct", 0)
        print(f"  Regime ID {r_id} (N={r_data.get('sample_count', 0)}): Raw NWP RMSE={nwp_r:.4f}mm -> Regime ML RMSE={reg_r:.4f}mm (Imp: {imp_r:.2f}%)")
    print("=" * 63)

if __name__ == "__main__":
    main()

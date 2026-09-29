import sys

try:
    from backend.app.services.pipeline import ScientificPipelineService, MultiStatePipelineService
except ModuleNotFoundError:
    from app.services.pipeline import ScientificPipelineService, MultiStatePipelineService

def main():
    target = sys.argv[1] if len(sys.argv) > 1 else "Goa"
    print("=" * 65)
    print(f"VRISHTI AI — SYSTEM TRAINING & EVALUATION PIPELINE [{target.upper()}]")
    print("=" * 65)
    
    if target.lower() == "all":
        multi_service = MultiStatePipelineService()
        all_reports = multi_service.run_all_pipelines()
    else:
        state_name = target.capitalize()
        pipe = ScientificPipelineService(state_name)
        report = pipe.run_full_pipeline()
        all_reports = {state_name: report}
    
    print("\n" + "=" * 65)
    print("  FINAL MULTI-STATE TEST SET EVALUATION SUMMARY (2025 TEST SET)")
    print("=" * 65)

    for state, report in all_reports.items():
        test_m = report.get("test_2025_metrics", report.get("test_2024_metrics", {}))
        print(f"\n--- STATE: {state.upper()} ---")
        print(f"Raw NWP Baseline RMSE:     {test_m['raw_nwp']['rmse']:.4f} mm | MAE: {test_m['raw_nwp']['mae']:.4f} mm | R2: {test_m['raw_nwp']['r2']:.4f}")
        print(f"Linear MOS Model RMSE:     {test_m['linear_mos']['rmse']:.4f} mm | MAE: {test_m['linear_mos']['mae']:.4f} mm | R2: {test_m['linear_mos']['r2']:.4f} | Imp: {test_m['linear_mos'].get('rmse_improvement_pct', 0.0)}%")
        print(f"Selected Global ML RMSE:   {test_m['selected_global_ml']['rmse']:.4f} mm | MAE: {test_m['selected_global_ml']['mae']:.4f} mm | R2: {test_m['selected_global_ml']['r2']:.4f} | Imp: {test_m['selected_global_ml'].get('rmse_improvement_pct', 0.0)}%")
        print(f"Regime-Aware ML RMSE:      {test_m['regime_aware_ml']['rmse']:.4f} mm | MAE: {test_m['regime_aware_ml']['mae']:.4f} mm | R2: {test_m['regime_aware_ml']['r2']:.4f} | Imp: {test_m['regime_aware_ml'].get('rmse_improvement_pct', 0.0)}%")
        print(f"Oracle Upper Bound RMSE:   {test_m['oracle_regime_ml']['rmse']:.4f} mm | MAE: {test_m['oracle_regime_ml']['mae']:.4f} mm | R2: {test_m['oracle_regime_ml']['r2']:.4f} (Diagnostic Reference)")
        print(f"Regime Classifier Accuracy: {report['regime_classifier']['overall_accuracy'] * 100:.2f}%")
    print("=" * 65)

if __name__ == "__main__":
    main()

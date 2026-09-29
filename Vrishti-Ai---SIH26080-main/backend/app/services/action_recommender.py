"""
VRISHTI AI — Action & Navigation Recommender Service
Dynamically detects data requirements and generates context-preserving
navigation recommendations to other VRISHTI analytical modules.
"""

import re
from typing import Optional, List, Dict, Any

VALID_DESTINATIONS = {
    "map",
    "verification",
    "sandbox",
    "regime",
    "feature_importance",
    "calibration",
    "ablation",
    "audit",
    "forecast",
    "sector"
}

def extract_sandbox_parameters(query_text: str) -> Dict[str, Any]:
    """
    Extracts explicit meteorological values from the user query if present.
    NEVER fabricates or invents values. If user did not provide a value, leaves unset.
    """
    params: Dict[str, Any] = {}
    q = query_text.lower()

    # Relative humidity (e.g., "90% humidity", "humidity 85", "humidity of 92%")
    rh_match = re.search(r'humidity\s*(?:of|is|at|:)?\s*(\d+(?:\.\d+)?)\s*%?', q) or re.search(r'(\d+(?:\.\d+)?)\s*%\s*humidity', q)
    if rh_match:
        try:
            val = float(rh_match.group(1))
            if 0.0 <= val <= 100.0:
                params["relative_humidity_pct"] = val
        except ValueError:
            pass

    # Rainfall (e.g., "rainfall of 40 mm", "50mm rainfall", "rain 30 mm", "intensity increases to 60")
    rain_match = re.search(r'(?:rain|rainfall|precipitation|intensity)\s*(?:of|is|at|increases to|to)?\s*(\d+(?:\.\d+)?)\s*(?:mm)?', q) or re.search(r'(\d+(?:\.\d+)?)\s*mm\s*(?:rain|rainfall)?', q)
    if rain_match:
        try:
            val = float(rain_match.group(1))
            if 0.0 <= val <= 500.0:
                params["raw_nwp_precipitation_mm"] = val
        except ValueError:
            pass

    # Temperature (e.g., "temperature 32 C", "30 degrees", "temp 28")
    temp_match = re.search(r'(?:temperature|temp)\s*(?:of|is|at|:)?\s*(\d+(?:\.\d+)?)\s*(?:c|deg|degrees)?', q)
    if temp_match:
        try:
            val = float(temp_match.group(1))
            if -10.0 <= val <= 60.0:
                params["temperature_2m_c"] = val
        except ValueError:
            pass

    # Wind speed (e.g., "wind speed 45 km/h", "wind 30 kmh")
    wind_match = re.search(r'wind(?:\s*speed)?\s*(?:of|is|at|:)?\s*(\d+(?:\.\d+)?)\s*(?:km/h|kmh)?', q)
    if wind_match:
        try:
            val = float(wind_match.group(1))
            if 0.0 <= val <= 250.0:
                params["wind_speed_10m_kmh"] = val
        except ValueError:
            pass

    # Elevation (e.g., "elevation 800 m", "altitude 1200")
    elev_match = re.search(r'(?:elevation|altitude)\s*(?:of|is|at|:)?\s*(\d+(?:\.\d+)?)\s*(?:m|meters)?', q)
    if elev_match:
        try:
            val = float(elev_match.group(1))
            if 0.0 <= val <= 9000.0:
                params["elevation_m"] = val
        except ValueError:
            pass

    return params


def generate_recommended_actions(
    user_query: str,
    intent: str,
    entities: Dict[str, Any],
    matcher_res: Dict[str, Any],
    context: Optional[Dict[str, Any]] = None,
    eval_result: Optional[Dict[str, Any]] = None
) -> List[Dict[str, Any]]:
    """
    Dynamically generates up to 3 prioritized navigation action recommendations
    based on the user's intent and context.
    """
    actions: List[Dict[str, Any]] = []
    q = user_query.lower().strip()
    norm_q = matcher_res.get("debug_trace", {}).get("normalizedQuery") or q

    # Resolved geography and dates
    state = matcher_res.get("state") or (context.get("state") if context else None) or "Karnataka"
    district = matcher_res.get("district") or (context.get("district") if context else None)
    location_name = matcher_res.get("location_name") or district or state
    date_val = matcher_res.get("display_date") or (context.get("date") if context else None) or "01-06-2024"
    date_term = matcher_res.get("date_term") or "today"

    is_asking_heavy = any(k in norm_q for k in [
        "heavy", "extreme", "flood", "torrential", "alert", "warning", "where will heavy", "downpour"
    ])
    is_asking_map = any(k in norm_q for k in [
        "on the map", "map", "show map", "rainfall map", "where will", "spatial", "across",
        "show it on the map", "distribution", "which districts", "forecast map"
    ]) or intent in ["GRID_FORECAST"]

    is_asking_verification = any(k in norm_q for k in [
        "rmse", "mae", "csi", "pod", "far", "ets", "fss", "accuracy", "skill",
        "how accurate", "how did the model perform", "verification", "ground truth"
    ]) or intent in ["MODEL_VERIFICATION"]

    is_asking_comparison = any(k in norm_q for k in [
        "compare nwp", "nwp vs", "vs raw", "difference between", "versus machine learning",
        "compare models", "compare the models", "which model performs better", "model ablation",
        "xgboost vs random forest", "model architecture"
    ]) or intent in ["MODEL_COMPARISON"]

    is_asking_feature_importance = any(k in norm_q for k in [
        "features influenced", "which features", "what features", "what variables",
        "why did the model increase", "why did the model decrease", "what drove",
        "what caused the prediction", "why did the model make this prediction", "feature importance"
    ])

    is_asking_regime = any(k in norm_q for k in [
        "regime", "active monsoon", "break monsoon", "offshore trough", "synoptic",
        "why was this classified as", "classification"
    ]) or intent in ["WEATHER_REGIME"]

    is_asking_sandbox = any(k in norm_q for k in [
        "what if", "what-if", "what happens if", "sandbox", "experiment",
        "test scenario", "test a scenario", "let me test", "test rainfall inputs",
        "different humidity", "simulate"
    ])

    is_asking_calibration = any(k in norm_q for k in [
        "calibration", "reliability", "probability calibration", "calibration curve",
        "confidence calibration", "observed frequency"
    ])

    is_asking_audit = any(k in norm_q for k in [
        "where did this data come from", "data source", "which dataset", "provenance",
        "data lineage", "sha-256", "sha256", "hash", "scientific audit", "processing history"
    ])

    is_asking_forecast_timeline = any(k in norm_q for k in [
        "detailed forecast", "timeline", "multi-time-step", "hourly", "next 24 hours",
        "forecast table", "show the detailed forecast"
    ])

    # -------------------------------------------------------------
    # 1. MAP ACTION
    # -------------------------------------------------------------
    if is_asking_map or intent in ["GRID_FORECAST", "DISTRICT_FORECAST"] or (
        intent in ["RAINFALL_FORECAST", "HEAVY_RAIN_ALERT"] and not is_asking_verification and not is_asking_comparison
    ):
        map_layer = "heavy_prob" if is_asking_heavy else ("nwp_rain" if "raw nwp" in norm_q else "corrected_rainfall")
        map_label = "View Heavy Rainfall Map" if is_asking_heavy else "View on Map"
        map_reason = (
            f"Exceedance probabilities (>64.5 mm) and high-alert zones in {state} are visualized spatially."
            if is_asking_heavy
            else f"Spatial rainfall distribution across {location_name} is best viewed on the interactive rainfall map."
        )
        actions.append({
            "label": map_label,
            "destination": "map",
            "icon": "map",
            "reason": map_reason,
            "context": {
                "state": state,
                "district": district,
                "location_name": location_name,
                "date": date_val,
                "date_term": date_term,
                "layer": map_layer,
                "forecast_period": "6h"
            }
        })

    # -------------------------------------------------------------
    # 2. VERIFICATION & SKILL ACTION
    # -------------------------------------------------------------
    if is_asking_verification or intent == "MODEL_VERIFICATION" or (is_asking_comparison and "ablation" not in norm_q):
        metric_req = "RMSE" if "rmse" in norm_q else ("CSI" if "csi" in norm_q else ("POD" if "pod" in norm_q else "all"))
        actions.append({
            "label": "Open Verification",
            "destination": "verification",
            "icon": "bar-chart-2",
            "reason": f"Inspect continuous and categorical verification metrics (RMSE, CSI, POD, FAR) for {state}.",
            "context": {
                "state": state,
                "district": district,
                "metric": metric_req,
                "threshold": 64.5 if is_asking_heavy else 2.5,
                "partition": "test"
            }
        })

    # -------------------------------------------------------------
    # 3. NWP VS CORRECTED COMPARISON ACTION
    # -------------------------------------------------------------
    if ("compare" in norm_q and "nwp" in norm_q) or intent == "MODEL_COMPARISON" or "accuracy" in norm_q:
        actions.append({
            "label": "Compare NWP vs Corrected",
            "destination": "verification",
            "icon": "activity",
            "reason": f"Compare raw NWP baseline errors directly against VRISHTI bias-corrected outputs for {state}.",
            "context": {
                "state": state,
                "district": district,
                "mode": "nwp_vs_corrected"
            }
        })

    # -------------------------------------------------------------
    # 4. FEATURE IMPORTANCE ACTION
    # -------------------------------------------------------------
    if is_asking_feature_importance or "what caused" in norm_q or ("why" in norm_q and "increase" in norm_q):
        actions.append({
            "label": "View Feature Importance",
            "destination": "feature_importance",
            "icon": "compass",
            "reason": f"Examine atmospheric predictor importances (RH, CAPE, wind shear, elevation) for {state}.",
            "context": {
                "state": state,
                "district": district,
                "model": "regime_aware_ml"
            }
        })

    # -------------------------------------------------------------
    # 5. MODEL SANDBOX ACTION
    # -------------------------------------------------------------
    if is_asking_sandbox or ("what if" in norm_q) or ("what happens if" in norm_q) or ("test" in norm_q and "scenario" in norm_q):
        extracted_p = extract_sandbox_parameters(user_query)
        actions.append({
            "label": "Open Model Sandbox",
            "destination": "sandbox",
            "icon": "sliders",
            "reason": "Simulate custom atmospheric scenarios and test how the model adjusts precipitation.",
            "context": {
                "state": state,
                "district": district,
                "parameters": extracted_p
            }
        })

    # -------------------------------------------------------------
    # 6. REGIME INTELLIGENCE ACTION
    # -------------------------------------------------------------
    if is_asking_regime or intent == "WEATHER_REGIME":
        actions.append({
            "label": "Open Regime Intelligence",
            "destination": "regime",
            "icon": "layers",
            "reason": f"Explore active monsoon synoptic flow patterns and classifier softmax probabilities in {state}.",
            "context": {
                "state": state,
                "district": district,
                "date": date_val
            }
        })

    # -------------------------------------------------------------
    # 7. MODEL COMPARISON / ABLATION ACTION
    # -------------------------------------------------------------
    if ("compare the models" in norm_q) or ("compare models" in norm_q) or ("ablation" in norm_q) or ("which model performs better" in norm_q):
        actions.append({
            "label": "Open Model Comparison",
            "destination": "ablation",
            "icon": "cpu",
            "reason": f"Compare benchmark performance across raw NWP, Linear MOS, GBDT, and Regime ML for {state}.",
            "context": {
                "state": state
            }
        })

    # -------------------------------------------------------------
    # 8. PROBABILITY CALIBRATION ACTION
    # -------------------------------------------------------------
    if is_asking_calibration:
        actions.append({
            "label": "Open Calibration",
            "destination": "calibration",
            "icon": "shield-check",
            "reason": f"Examine reliability curves and probability calibration metrics for {state}.",
            "context": {
                "state": state
            }
        })

    # -------------------------------------------------------------
    # 9. SCIENTIFIC AUDIT / DATA PROVENANCE ACTION
    # -------------------------------------------------------------
    if is_asking_audit:
        actions.append({
            "label": "Open Scientific Audit",
            "destination": "audit",
            "icon": "file-text",
            "reason": "Inspect AWS station data sources, SHA-256 integrity checksums, and zero-leakage partitions.",
            "context": {
                "state": state,
                "dataset": "AWS_NWP_2024_2025"
            }
        })

    # -------------------------------------------------------------
    # 10. DETAILED FORECAST ACTION
    # -------------------------------------------------------------
    if is_asking_forecast_timeline or (
        intent in ["WEATHER_FORECAST", "CURRENT_WEATHER", "DISTRICT_FORECAST"] and len(actions) < 2
    ):
        actions.append({
            "label": "Open Detailed Forecast",
            "destination": "forecast",
            "icon": "cloud-rain",
            "reason": f"Explore station telemetry, 6-hour accumulation timelines, and exceedance distributions for {location_name}.",
            "context": {
                "state": state,
                "district": district,
                "location_name": location_name,
                "date": date_val,
                "forecast_period": "6h"
            }
        })

    # -------------------------------------------------------------
    # Ensure Safe & Non-Duplicate Actions, Capped at Maximum 3
    # -------------------------------------------------------------
    unique_actions: List[Dict[str, Any]] = []
    seen_destinations = set()

    for act in actions:
        if act["destination"] not in VALID_DESTINATIONS:
            continue
        dest_key = (act["destination"], act["label"])
        if dest_key not in seen_destinations:
            seen_destinations.add(dest_key)
            unique_actions.append(act)
        if len(unique_actions) >= 3:
            break

    return unique_actions

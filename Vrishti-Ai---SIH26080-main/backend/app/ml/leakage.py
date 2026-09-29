try:
    from backend.app.core.config import TARGET_COLUMN
except ModuleNotFoundError:
    from app.core.config import TARGET_COLUMN

FORBIDDEN_KEYWORDS = [
    TARGET_COLUMN,
    "rain_6h_accum",
    "observed_rain",
    "target",
    "future_rain"
]

def checkForTargetLeakage(feature_columns: list[str]) -> bool:
    """
    Automated target leakage checker.
    Verifies that target or target-derived columns are absent from feature lists.
    Raises ValueError if target leakage is detected.
    """
    detected = []
    for col in feature_columns:
        for keyword in FORBIDDEN_KEYWORDS:
            if keyword.lower() in col.lower():
                detected.append((col, keyword))
                
    if detected:
        raise ValueError(
            f"TARGET LEAKAGE DETECTED! The following features violate leakage rules: {detected}"
        )
        
    return True

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR.parent / "data"
if not DATA_DIR.exists():
    DATA_DIR = BASE_DIR / "data"

STATE_DATASETS = {
    "Goa": str(DATA_DIR / "GOA_DATA.csv"),
    "Kerala": str(DATA_DIR / "Kerala_Weather_2020_2025_June_October.csv"),
    "Karnataka": str(DATA_DIR / "KARNATAKA_CLEAN.csv")
}

SOURCE_CSV_PATH = STATE_DATASETS["Goa"]

MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"

MODELS_DIR_GOA = MODELS_DIR / "goa"
MODELS_DIR_KERALA = MODELS_DIR / "kerala"
MODELS_DIR_KARNATAKA = MODELS_DIR / "karnataka"

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(MODELS_DIR_GOA, exist_ok=True)
os.makedirs(MODELS_DIR_KERALA, exist_ok=True)
os.makedirs(MODELS_DIR_KARNATAKA, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

TARGET_COLUMN = "rain_6h_accum (mm)"
NWP_COLUMN = "raw_nwp_rain_6h_forecast (mm)"

RANDOM_SEED = 10

TRAIN_YEARS = [2020, 2021, 2022, 2023]
VAL_YEARS = [2024]
TEST_YEARS = [2025]
UNSEEN_YEARS = []

# Official Meteorological Regime Names
REGIME_NAMES = {
    0: "Active Monsoon / Coastal Orographic Regime",
    1: "June Monsoon Regime (Onset & Coastal Orographic)",
    2: "July Monsoon Regime (Peak Active Surge)",
    3: "August Monsoon Regime (Mid-Monsoon Break/Active)",
    4: "September Monsoon Regime (Withdrawal & Lows)",
    5: "October Post-Monsoon Regime (Retreating Monsoon/Transition)"
}

# IMD Rainfall Thresholds (mm per 6h / 24h operational categories)
THRESHOLDS = {
    "light": 2.5,
    "moderate": 15.6,
    "heavy": 64.5,
    "very_heavy": 115.5
}

import os
import re
import json
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any, Tuple
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Synonyms for canonical city/district normalization
CITY_SYNONYMS: Dict[str, str] = {
    "bangalore": "bengaluru",
    "blr": "bengaluru",
    "bengaluru urban": "bengaluru urban",
    "bengaluru rural": "bengaluru rural",
    "bangalore urban": "bengaluru urban",
    "bangalore rural": "bengaluru rural",
    "coorg": "kodagu",
    "madikeri": "kodagu",
    "panjim": "panaji",
    "tiswadi": "panaji",
    "cochin": "kochi",
    "alleppey": "alappuzha",
    "calicut": "kozhikode",
    "trivandrum": "thiruvananthapuram",
    "cannanore": "kannur",
    "palghat": "palakkad",
    "wynad": "wayanad",
    "mangalore": "mangaluru",
    "belgaum": "belagavi",
    "bellary": "ballari",
    "mysore": "mysuru",
    "shimoga": "shivamogga",
    "chikmagalur": "chikkamagaluru",
    "chikkamagalur": "chikkamagaluru",
    "hubli": "hubballi",
    "bijapur": "vijayapura",
    "gulbarga": "kalaburagi",
    "tumkur": "tumakuru",
}

# Detailed location mapping across Goa, Kerala, Karnataka
KNOWN_LOCATIONS: Dict[str, Dict[str, str]] = {
    # Goa
    "panaji": {"state": "Goa", "district": "Tiswadi", "location_name": "Panaji", "station_id": "LOC_GOA_01"},
    "tiswadi": {"state": "Goa", "district": "Tiswadi", "location_name": "Panaji", "station_id": "LOC_GOA_01"},
    "north goa": {"state": "Goa", "district": "North Goa", "location_name": "Panaji", "station_id": "LOC_GOA_01"},
    "south goa": {"state": "Goa", "district": "South Goa", "location_name": "Margao", "station_id": "LOC_GOA_07"},
    "margao": {"state": "Goa", "district": "South Goa", "location_name": "Margao", "station_id": "LOC_GOA_07"},
    "madgaon": {"state": "Goa", "district": "South Goa", "location_name": "Margao", "station_id": "LOC_GOA_07"},
    "vasco da gama": {"state": "Goa", "district": "South Goa", "location_name": "Vasco da Gama", "station_id": "LOC_GOA_06"},
    "vasco": {"state": "Goa", "district": "South Goa", "location_name": "Vasco da Gama", "station_id": "LOC_GOA_06"},
    "mapusa": {"state": "Goa", "district": "North Goa", "location_name": "Mapusa", "station_id": "LOC_GOA_01"},
    "ponda": {"state": "Goa", "district": "North Goa", "location_name": "Ponda", "station_id": "LOC_GOA_01"},
    "calangute": {"state": "Goa", "district": "North Goa", "location_name": "Calangute", "station_id": "LOC_GOA_01"},
    "candolim": {"state": "Goa", "district": "North Goa", "location_name": "Candolim", "station_id": "LOC_GOA_01"},
    "porvorim": {"state": "Goa", "district": "North Goa", "location_name": "Porvorim", "station_id": "LOC_GOA_01"},
    "bicholim": {"state": "Goa", "district": "North Goa", "location_name": "Bicholim", "station_id": "LOC_GOA_04"},
    "canacona": {"state": "Goa", "district": "South Goa", "location_name": "Canacona", "station_id": "LOC_GOA_11"},

    # Karnataka
    "bengaluru urban": {"state": "Karnataka", "district": "Bengaluru Urban", "location_name": "Bengaluru Urban", "station_id": "LOC_KA_05"},
    "bengaluru rural": {"state": "Karnataka", "district": "Bengaluru Rural", "location_name": "Bengaluru Rural", "station_id": "LOC_KA_04"},
    "bengaluru": {"state": "Karnataka", "district": "Bengaluru Urban", "location_name": "Bengaluru", "station_id": "LOC_KA_05"},
    "mangaluru": {"state": "Karnataka", "district": "Dakshina Kannada", "location_name": "Mangaluru", "station_id": "LOC_KA_11"},
    "dakshina kannada": {"state": "Karnataka", "district": "Dakshina Kannada", "location_name": "Mangaluru", "station_id": "LOC_KA_11"},
    "mysuru": {"state": "Karnataka", "district": "Mysuru", "location_name": "Mysuru", "station_id": "LOC_KA_22"},
    "udupi": {"state": "Karnataka", "district": "Udupi", "location_name": "Udupi", "station_id": "LOC_KA_27"},
    "kodagu": {"state": "Karnataka", "district": "Kodagu", "location_name": "Kodagu", "station_id": "LOC_KA_18"},
    "chikkamagaluru": {"state": "Karnataka", "district": "Chikkamagaluru", "location_name": "Chikkamagaluru", "station_id": "LOC_KA_09"},
    "shivamogga": {"state": "Karnataka", "district": "Shivamogga", "location_name": "Shivamogga", "station_id": "LOC_KA_25"},
    "hassan": {"state": "Karnataka", "district": "Hassan", "location_name": "Hassan", "station_id": "LOC_KA_15"},
    "belagavi": {"state": "Karnataka", "district": "Belagavi", "location_name": "Belagavi", "station_id": "LOC_KA_03"},
    "hubballi": {"state": "Karnataka", "district": "Dharwad", "location_name": "Hubballi", "station_id": "LOC_KA_13"},
    "dharwad": {"state": "Karnataka", "district": "Dharwad", "location_name": "Dharwad", "station_id": "LOC_KA_13"},
    "tumakuru": {"state": "Karnataka", "district": "Tumakuru", "location_name": "Tumakuru", "station_id": "LOC_KA_26"},
    "uttara kannada": {"state": "Karnataka", "district": "Uttara Kannada", "location_name": "Karwar", "station_id": "LOC_KA_28"},
    "agumbe": {"state": "Karnataka", "district": "Shivamogga", "location_name": "Agumbe", "station_id": "LOC_KA_25"},
    "bagalkote": {"state": "Karnataka", "district": "Bagalkot", "location_name": "Bagalkote", "station_id": "LOC_KA_01"},
    "bagalkot": {"state": "Karnataka", "district": "Bagalkot", "location_name": "Bagalkot", "station_id": "LOC_KA_01"},
    "ballari": {"state": "Karnataka", "district": "Ballari", "location_name": "Ballari", "station_id": "LOC_KA_02"},
    "bidar": {"state": "Karnataka", "district": "Bidar", "location_name": "Bidar", "station_id": "LOC_KA_06"},
    "chamarajanagara": {"state": "Karnataka", "district": "Chamarajanagara", "location_name": "Chamarajanagara", "station_id": "LOC_KA_07"},
    "chikkaballapura": {"state": "Karnataka", "district": "Chikkaballapura", "location_name": "Chikkaballapura", "station_id": "LOC_KA_08"},
    "chitradurga": {"state": "Karnataka", "district": "Chitradurga", "location_name": "Chitradurga", "station_id": "LOC_KA_10"},
    "davanagere": {"state": "Karnataka", "district": "Davanagere", "location_name": "Davanagere", "station_id": "LOC_KA_12"},
    "gadag": {"state": "Karnataka", "district": "Gadag", "location_name": "Gadag", "station_id": "LOC_KA_14"},
    "haveri": {"state": "Karnataka", "district": "Haveri", "location_name": "Haveri", "station_id": "LOC_KA_16"},
    "kalaburagi": {"state": "Karnataka", "district": "Kalaburagi", "location_name": "Kalaburagi", "station_id": "LOC_KA_17"},
    "kolar": {"state": "Karnataka", "district": "Kolar", "location_name": "Kolar", "station_id": "LOC_KA_19"},
    "koppal": {"state": "Karnataka", "district": "Koppal", "location_name": "Koppal", "station_id": "LOC_KA_20"},
    "mandya": {"state": "Karnataka", "district": "Mandya", "location_name": "Mandya", "station_id": "LOC_KA_21"},
    "raichur": {"state": "Karnataka", "district": "Raichur", "location_name": "Raichur", "station_id": "LOC_KA_23"},
    "ramanagara": {"state": "Karnataka", "district": "Ramanagara", "location_name": "Ramanagara", "station_id": "LOC_KA_24"},
    "vijayanagara": {"state": "Karnataka", "district": "Vijayanagara", "location_name": "Vijayanagara", "station_id": "LOC_KA_29"},
    "vijayapura": {"state": "Karnataka", "district": "Vijayapura", "location_name": "Vijayapura", "station_id": "LOC_KA_30"},
    "yadgir": {"state": "Karnataka", "district": "Yadgir", "location_name": "Yadgir", "station_id": "LOC_KA_31"},

    # Kerala
    "thiruvananthapuram": {"state": "Kerala", "district": "Thiruvananthapuram", "location_name": "Thiruvananthapuram", "station_id": "LOC_KL_12"},
    "kochi": {"state": "Kerala", "district": "Ernakulam", "location_name": "Kochi", "station_id": "LOC_KL_02"},
    "ernakulam": {"state": "Kerala", "district": "Ernakulam", "location_name": "Ernakulam", "station_id": "LOC_KL_02"},
    "kozhikode": {"state": "Kerala", "district": "Kozhikode", "location_name": "Kozhikode", "station_id": "LOC_KL_08"},
    "kannur": {"state": "Kerala", "district": "Kannur", "location_name": "Kannur", "station_id": "LOC_KL_04"},
    "thrissur": {"state": "Kerala", "district": "Thrissur", "location_name": "Thrissur", "station_id": "LOC_KL_13"},
    "kollam": {"state": "Kerala", "district": "Kollam", "location_name": "Kollam", "station_id": "LOC_KL_06"},
    "alappuzha": {"state": "Kerala", "district": "Alappuzha", "location_name": "Alappuzha", "station_id": "LOC_KL_01"},
    "kottayam": {"state": "Kerala", "district": "Kottayam", "location_name": "Kottayam", "station_id": "LOC_KL_07"},
    "idukki": {"state": "Kerala", "district": "Idukki", "location_name": "Idukki", "station_id": "LOC_KL_03"},
    "wayanad": {"state": "Kerala", "district": "Wayanad", "location_name": "Wayanad", "station_id": "LOC_KL_14"},
    "palakkad": {"state": "Kerala", "district": "Palakkad", "location_name": "Palakkad", "station_id": "LOC_KL_10"},
    "malappuram": {"state": "Kerala", "district": "Malappuram", "location_name": "Malappuram", "station_id": "LOC_KL_09"},
    "pathanamthitta": {"state": "Kerala", "district": "Pathanamthitta", "location_name": "Pathanamthitta", "station_id": "LOC_KL_11"},
    "kasaragod": {"state": "Kerala", "district": "Kasaragod", "location_name": "Kasaragod", "station_id": "LOC_KL_05"},
    "munnar": {"state": "Kerala", "district": "Idukki", "location_name": "Munnar", "station_id": "LOC_KL_03"}
}

ALL_INTENTS = [
    "CURRENT_WEATHER",
    "WEATHER_FORECAST",
    "RAINFALL_FORECAST",
    "RAIN_PROBABILITY",
    "HEAVY_RAIN_ALERT",
    "FLOOD_RISK",
    "THUNDERSTORM_LIGHTNING",
    "WIND_CONDITIONS",
    "TEMPERATURE",
    "HUMIDITY",
    "AGRICULTURE_WEATHER",
    "CONSTRUCTION_WEATHER_SAFETY",
    "HILL_TRAVEL_SAFETY",
    "HIGHWAY_DRIVING_WEATHER",
    "CITY_DRAINAGE_RAINFALL",
    "WEATHER_REGIME",
    "DISTRICT_FORECAST",
    "GRID_FORECAST",
    "MODEL_VERIFICATION",
    "MODEL_COMPARISON",
    "FEATURE_IMPORTANCE",
    "PROBABILITY_CALIBRATION",
    "MODEL_SANDBOX",
    "DATA_PROVENANCE",
    "NON_WEATHER"
]

class ConversationMatcher:
    """
    Comprehensive VRISHTI AI Conversation Intelligence Engine
    Implements VRISHTI_AI_conversation_intelligence_v2.json authoritative specification.
    """

    def __init__(self, json_path: Optional[str] = None):
        self.spec: Dict[str, Any] = {}
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.classifier: Optional[LogisticRegression] = None
        self.training_queries: List[str] = []
        self.training_labels: List[str] = []

        # Find authoritative JSON spec
        candidates = [
            json_path,
            Path(__file__).resolve().parent.parent / "core" / "VRISHTI_AI_conversation_intelligence_v2.json",
            Path(__file__).resolve().parents[3] / "data" / "VRISHTI_AI_conversation_intelligence_v2.json",
            Path("app/core/VRISHTI_AI_conversation_intelligence_v2.json"),
            Path("../data/VRISHTI_AI_conversation_intelligence_v2.json")
        ]
        resolved_path = None
        for c in candidates:
            if c and Path(c).exists():
                resolved_path = Path(c)
                break

        if resolved_path:
            try:
                with open(resolved_path, "r", encoding="utf-8") as f:
                    self.spec = json.load(f)
            except Exception as e:
                print(f"[ConversationMatcher] Warning: Failed to load {resolved_path}: {e}")

        # Train intent classifier on spec examples + augmented utterances
        self._init_classifier()

    def _init_classifier(self):
        # 1. Base examples from JSON spec
        intents_dict = self.spec.get("intents", {})
        queries = []
        labels = []

        for intent_name, sample_list in intents_dict.items():
            for s in sample_list:
                queries.append(self.normalize_text(s))
                labels.append(intent_name)

        # 2. Add domain-rich augmented queries for high classification accuracy
        domain_augmentations = {
            "CURRENT_WEATHER": [
                "how is the weather in bengaluru urban today",
                "weather in bengaluru today",
                "what is the weather right now in panaji",
                "current conditions in kochi",
                "how is weather today in wayanad",
                "is it raining now in mangaluru",
                "weather right now in mysuru",
                "how is the weather in panaji today"
            ],
            "WEATHER_FORECAST": [
                "what will the weather be tomorrow in bengaluru",
                "weather forecast for kochi tomorrow",
                "forecast for panaji for the next 3 days",
                "weather forecast tomorrow",
                "how will the weather be this weekend in kerala",
                "what about tomorrow",
                "what about the day after",
                "what about next 3 days",
                "forecast for the next 24 hours"
            ],
            "RAINFALL_FORECAST": [
                "how much rain will kochi get tomorrow",
                "how much rain is expected in bengaluru tomorrow",
                "rainfall forecast for panaji",
                "will it rain tomorrow in kochi",
                "expected rainfall in mangaluru",
                "rain forecast for tomorrow in wayanad",
                "rain mm expected in tiswadi",
                "how many mm of rain will fall tomorrow",
                "show me rainfall across karnataka today",
                "show corrected rainfall for kerala tomorrow",
                "show corrected rainfall for karnataka",
                "show rainfall across karnataka",
                "show rainfall in kerala",
                "corrected rainfall forecast for kerala"
            ],
            "RAIN_PROBABILITY": [
                "what is the chance of rain in bengaluru today",
                "probability of rainfall in panaji tomorrow",
                "what are the chances of rain in kochi",
                "percentage chance of rain tomorrow",
                "likelihood of rain in wayanad today",
                "rain probability for tomorrow"
            ],
            "HEAVY_RAIN_ALERT": [
                "how heavy",
                "how heavy?",
                "how heavy will it be",
                "is heavy rain expected in panaji today",
                "will there be extreme rainfall in kerala",
                "is there a heavy rain warning for mangaluru",
                "is intense rain expected in wayanad",
                "extreme downpour warning in kodagu",
                "will rain be heavy today in bengaluru"
            ],
            "FLOOD_RISK": [
                "is there floods in panaji today",
                "is there flood risk in panaji today",
                "is there flooding in panaji today",
                "are floods expected in kochi",
                "will heavy rain cause flooding in mangaluru",
                "is waterlogging likely in panaji",
                "is there a flood warning",
                "flood risk in bengaluru urban today",
                "will tiswadi get flooded today",
                "will it flood in panaji",
                "is panaji flooded today"
            ],
            "THUNDERSTORM_LIGHTNING": [
                "will there be thunderstorms in bengaluru tonight",
                "is lightning expected in panaji",
                "any thunderstorm risk in kerala tomorrow",
                "thunder and lightning forecast for mangaluru",
                "severe thunderstorm warning"
            ],
            "WIND_CONDITIONS": [
                "how strong will the winds be tomorrow in panaji",
                "wind speed in bengaluru today",
                "are strong winds expected in kerala",
                "wind gust forecast for kochi",
                "will it be windy tomorrow"
            ],
            "TEMPERATURE": [
                "what is the temperature in bengaluru today",
                "how hot will it be in panaji tomorrow",
                "temperature forecast for kochi",
                "minimum temperature tonight in wayanad",
                "maximum temperature tomorrow in mysuru"
            ],
            "HUMIDITY": [
                "what is the humidity in bengaluru",
                "humidity forecast for kochi tomorrow",
                "relative humidity in panaji today",
                "how humid will it be in wayanad"
            ],
            "AGRICULTURE_WEATHER": [
                "is the weather suitable for farming tomorrow",
                "will rain affect crops in kerala",
                "should farmers expect heavy rain",
                "is there a dry window for harvesting",
                "can i harvest rice crop tomorrow in palakkad",
                "is tomorrow safe for pesticide spraying in wayanad",
                "paddy harvesting weather conditions"
            ],
            "CONSTRUCTION_WEATHER_SAFETY": [
                "is tomorrow suitable for construction work in bengaluru",
                "will rain affect construction in panaji",
                "will strong winds affect crane operations",
                "can i pour concrete tomorrow in bengaluru urban",
                "is it safe to pour concrete slab tomorrow",
                "construction weather safety in kochi"
            ],
            "HILL_TRAVEL_SAFETY": [
                "is it safe to travel to wayanad tomorrow because of rain",
                "landslide risk in kodagu",
                "will heavy rain affect hill travel in kerala",
                "is the road to munnar dangerous due to rain",
                "can i drive through western ghats tomorrow",
                "landslide warning in idukki",
                "hill travel safety to wayanad"
            ],
            "HIGHWAY_DRIVING_WEATHER": [
                "will rain affect driving in bengaluru tomorrow",
                "is it safe to drive on the highway tomorrow in karnataka",
                "will rain reduce visibility on the road",
                "is heavy rain expected while driving from bengaluru to mangaluru",
                "highway driving conditions in kerala",
                "can i drive on highway tomorrow",
                "road travel safety during rain"
            ],
            "CITY_DRAINAGE_RAINFALL": [
                "will there be waterlogging in bengaluru today",
                "is heavy rain likely to overwhelm city drainage",
                "urban flooding risk in panaji",
                "storm drainage capacity in kochi",
                "underpass waterlogging in bengaluru"
            ],
            "WEATHER_REGIME": [
                "what weather regime is active",
                "is this an active monsoon or break period",
                "what is the current rainfall regime",
                "is this associated with a depression",
                "offshore trough regime active",
                "current monsoon synoptic regime"
            ],
            "DISTRICT_FORECAST": [
                "give me district level rainfall for karnataka",
                "forecast rainfall by district in kerala",
                "which districts are expected to receive heavy rain",
                "district wise forecast for goa",
                "all districts rain summary"
            ],
            "GRID_FORECAST": [
                "show the rainfall grid for karnataka",
                "give me grid level rainfall",
                "show forecast on the map",
                "spatial rainfall grid view",
                "high resolution grid forecast"
            ],
            "MODEL_VERIFICATION": [
                "show rmse and far for karnataka",
                "show rmse for karnataka",
                "what is the far for kerala",
                "show csi pod far and ets",
                "compare corrected rainfall with ground truth",
                "show verification metrics",
                "compare nwp with corrected forecast",
                "model verification report for karnataka",
                "what is the pod and far for goa",
                "show ets and fss metrics"
            ],
            "MODEL_COMPARISON": [
                "compare nwp and corrected rainfall",
                "is corrected forecast closer to observations",
                "compare model performance before and after bias correction",
                "how much does ai model improve over raw nwp",
                "nwp versus machine learning comparison"
            ],
            "FEATURE_IMPORTANCE": [
                "which features most influenced this forecast",
                "show feature importance",
                "what predictors are driving the rainfall prediction",
                "top features for this model",
                "shap values for rainfall",
                "why did the model predict heavy rain",
                "feature attribution for this forecast",
                "what atmospheric features had highest weight"
            ],
            "PROBABILITY_CALIBRATION": [
                "is the rain probability calibrated",
                "show probability calibration curve",
                "reliability diagram for heavy rainfall",
                "show brier score and calibration",
                "check model calibration",
                "calibration curve for 50mm threshold",
                "brier score and reliability"
            ],
            "MODEL_SANDBOX": [
                "what if relative humidity increases to 90 percent",
                "simulate what happens if temperature drops 2 degrees",
                "test what if scenario in sandbox",
                "what if relative humidity drops to 70 percent and rainfall is 30mm",
                "model sandbox what if test",
                "test scenario in sandbox",
                "run what if simulation"
            ],
            "DATA_PROVENANCE": [
                "verify data lineage and hash for this forecast",
                "show data provenance and hashes",
                "sha 256 data integrity audit",
                "show audit trail and dataset sources",
                "verify data lineage",
                "scientific audit for this forecast",
                "data lineage and sha256 checksum"
            ],
            "NON_WEATHER": [
                "tell me a joke",
                "what is the capital of france",
                "write a python program",
                "who is the prime minister",
                "solve this math problem",
                "write essay on computer science"
            ]
        }

        for intent_name, aug_list in domain_augmentations.items():
            for a in aug_list:
                queries.append(self.normalize_text(a))
                labels.append(intent_name)

        self.training_queries = queries
        self.training_labels = labels

        if queries and labels:
            self.vectorizer = TfidfVectorizer(ngram_range=(1, 3), sublinear_tf=True)
            X = self.vectorizer.fit_transform(queries)
            self.classifier = LogisticRegression(max_iter=1000, C=10.0)
            self.classifier.fit(X, labels)

    def normalize_text(self, text: str) -> str:
        """
        Normalize query text: lowercasing, punctuation stripping,
        and synonym replacement for canonical names (Bangalore -> Bengaluru, Coorg -> Kodagu, etc.).
        """
        if not text:
            return ""
        t = text.lower().strip()
        # Remove punctuation except hyphens/slashes
        t = re.sub(r'[\?\!\,\.\:\;\"\'\(\)\[\]\{\}]', ' ', t)
        t = re.sub(r'\s+', ' ', t).strip()

        # Word-boundary synonym replacements
        for syn, canonical in sorted(CITY_SYNONYMS.items(), key=lambda x: len(x[0]), reverse=True):
            pattern = r'\b' + re.escape(syn) + r'\b'
            t = re.sub(pattern, canonical, t)

        return t.strip()

    def extract_entities(self, query: str, context: Optional[dict] = None) -> Dict[str, Any]:
        """
        Extracts location, state, district, date/time range, and weather variable.
        Never defaults state to Karnataka or district to Manual unless explicitly present or in context.
        """
        norm_q = self.normalize_text(query)
        ctx = context or {}

        # 1. Location Entity Resolution (earliest mentioned in query, tie-break by longest match)
        detected_loc: Optional[Dict[str, str]] = None
        matches = []
        for k in KNOWN_LOCATIONS.keys():
            pattern = r'\b' + re.escape(k) + r'\b'
            m = re.search(pattern, norm_q)
            if m:
                matches.append((m.start(), -len(k), KNOWN_LOCATIONS[k]))
        if matches:
            matches.sort(key=lambda x: (x[0], x[1]))
            detected_loc = matches[0][2]

        # Check explicit state mentions if no city/district matched
        state: Optional[str] = detected_loc["state"] if detected_loc else None
        district: Optional[str] = detected_loc["district"] if detected_loc else None
        location_name: Optional[str] = detected_loc["location_name"] if detected_loc else None
        station_id: Optional[str] = detected_loc["station_id"] if detected_loc else None

        if not state:
            if re.search(r'\bkarnataka\b', norm_q):
                state = "Karnataka"
            elif re.search(r'\bkerala\b', norm_q):
                state = "Kerala"
            elif re.search(r'\bgoa\b', norm_q):
                state = "Goa"

        # 2. Date and Time Range Resolution
        date_term, display_date, time_range = self._resolve_date_and_time(query, norm_q, ctx)

        # 3. Weather Variable Detection
        weather_var = self._detect_weather_variable(norm_q)

        return {
            "state": state,
            "district": district,
            "location_name": location_name,
            "station_id": station_id,
            "date_term": date_term,
            "display_date": display_date,
            "time_range": time_range,
            "weather_variable": weather_var
        }

    def _resolve_date_and_time(self, raw_q: str, norm_q: str, ctx: dict) -> Tuple[str, str, str]:
        kolkata_tz = timezone(timedelta(hours=5, minutes=30))
        now_kolkata = datetime.now(kolkata_tz)

        date_match = re.search(r'\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b', raw_q)
        if date_match:
            d, m, y = date_match.groups()
            disp_date = f"{int(d):02d}-{int(m):02d}-{y}"
            return "explicit_date", disp_date, disp_date

        # Check "day after tomorrow" / "day after" BEFORE "tomorrow"
        if any(k in norm_q for k in ["day after tomorrow", "day after", "after tomorrow"]):
            disp_date = (now_kolkata + timedelta(days=2)).strftime("%d-%m-%Y")
            return "day after tomorrow", disp_date, "day after tomorrow"

        if "tomorrow morning" in norm_q:
            disp_date = (now_kolkata + timedelta(days=1)).strftime("%d-%m-%Y")
            return "tomorrow", disp_date, "tomorrow morning"

        if "tomorrow evening" in norm_q:
            disp_date = (now_kolkata + timedelta(days=1)).strftime("%d-%m-%Y")
            return "tomorrow", disp_date, "tomorrow evening"

        if any(k in norm_q for k in ["tomorrow", "next day"]):
            disp_date = (now_kolkata + timedelta(days=1)).strftime("%d-%m-%Y")
            return "tomorrow", disp_date, "tomorrow"

        if any(k in norm_q for k in ["next 3 days", "next three days", "next 3days"]):
            disp_date = now_kolkata.strftime("%d-%m-%Y")
            return "next 3 days", disp_date, "next 3 days"

        if any(k in norm_q for k in ["next 5 days", "next five days"]):
            disp_date = now_kolkata.strftime("%d-%m-%Y")
            return "next 5 days", disp_date, "next 5 days"

        if any(k in norm_q for k in ["this week", "next week", "weekend", "this weekend"]):
            disp_date = now_kolkata.strftime("%d-%m-%Y")
            return "this week", disp_date, "this week"

        if any(k in norm_q for k in ["tonight", "at night"]):
            disp_date = now_kolkata.strftime("%d-%m-%Y")
            return "tonight", disp_date, "tonight"

        if any(k in norm_q for k in ["today", "now", "right now", "current", "currently"]):
            disp_date = now_kolkata.strftime("%d-%m-%Y")
            return "today", disp_date, "today"

        # Context inheritance if not specified
        if ctx.get("date"):
            return "inherited", str(ctx.get("date")), ctx.get("time_range") or "today"

        disp_date = now_kolkata.strftime("%d-%m-%Y")
        return "today", disp_date, "today"

    def _detect_weather_variable(self, norm_q: str) -> str:
        if any(k in norm_q for k in ["rmse", "far", "csi", "pod", "ets", "fss", "verification"]):
            return "verification_metrics"
        if any(k in norm_q for k in ["flood", "flooding", "waterlogging", "inundation"]):
            return "flood_risk"
        if any(k in norm_q for k in ["wind", "winds", "gust"]):
            return "wind_speed"
        if any(k in norm_q for k in ["temp", "temperature", "hot", "cold"]):
            return "temperature"
        if any(k in norm_q for k in ["humidity", "moisture"]):
            return "relative_humidity"
        if any(k in norm_q for k in ["thunder", "lightning", "squall"]):
            return "thunderstorm"
        if any(k in norm_q for k in ["drive", "driving", "highway", "visibility"]):
            return "driving_visibility"
        if any(k in norm_q for k in ["landslide", "ghat", "hill travel"]):
            return "landslide_risk"
        if any(k in norm_q for k in ["regime", "monsoon break", "depression"]):
            return "weather_regime"
        return "rainfall"

    def resolve_follow_up(self, user_query: str, context: Optional[dict]) -> Optional[Dict[str, Any]]:
        """
        Handles contextual follow-up inquiries like "How heavy?", "What about tomorrow?",
        "What about the day after?", "What about Kerala?", "Will it affect driving?".
        """
        if not context:
            return None

        # Follow-up requires an existing conversational context with resolved location or intent
        if not (context.get("state") or context.get("district") or context.get("last_intent")):
            return None

        norm_q = self.normalize_text(user_query)

        # If the user explicitly provided a location in this query, it is an independent query, not a follow-up
        for loc_k in KNOWN_LOCATIONS.keys():
            if re.search(r'\b' + re.escape(loc_k) + r'\b', norm_q):
                return None

        # 1. "How heavy?" / "How heavy will it be?" -> Inherit location and date, intent becomes HEAVY_RAIN_ALERT
        if re.search(r'\bhow heavy\b', norm_q) or norm_q in ["how heavy", "how heavy?", "how heavy will it be", "how much", "how intense"]:
            return {
                "is_follow_up": True,
                "intent": "HEAVY_RAIN_ALERT",
                "state": context.get("state"),
                "district": context.get("district"),
                "location_name": context.get("location_name") or context.get("district"),
                "station_id": context.get("station_id") or context.get("location_id"),
                "date_term": context.get("date_term") or "today",
                "display_date": context.get("date"),
                "time_range": context.get("time_range") or "today",
                "weather_variable": "heavy_rain_intensity",
                "evaluated_category_id": "general"
            }

        # 2. "What about the day after?" -> Inherit location, update date to day after tomorrow
        if any(k in norm_q for k in ["what about the day after", "and the day after", "day after tomorrow", "the day after"]):
            kolkata_tz = timezone(timedelta(hours=5, minutes=30))
            now_kolkata = datetime.now(kolkata_tz)
            day_after = (now_kolkata + timedelta(days=2)).strftime("%d-%m-%Y")
            return {
                "is_follow_up": True,
                "intent": context.get("last_intent") or "WEATHER_FORECAST",
                "state": context.get("state"),
                "district": context.get("district"),
                "location_name": context.get("location_name") or context.get("district"),
                "station_id": context.get("station_id") or context.get("location_id"),
                "date_term": "day after tomorrow",
                "display_date": day_after,
                "time_range": "day after tomorrow",
                "weather_variable": context.get("weather_variable") or "weather",
                "evaluated_category_id": context.get("evaluated_category_id") or "general"
            }

        # 3. "What about tomorrow?" / "And tomorrow?" -> Inherit location, update date to tomorrow
        if any(k in norm_q for k in ["what about tomorrow", "and tomorrow", "how about tomorrow"]):
            kolkata_tz = timezone(timedelta(hours=5, minutes=30))
            now_kolkata = datetime.now(kolkata_tz)
            tomorrow = (now_kolkata + timedelta(days=1)).strftime("%d-%m-%Y")
            return {
                "is_follow_up": True,
                "intent": context.get("last_intent") or "WEATHER_FORECAST",
                "state": context.get("state"),
                "district": context.get("district"),
                "location_name": context.get("location_name") or context.get("district"),
                "station_id": context.get("station_id") or context.get("location_id"),
                "date_term": "tomorrow",
                "display_date": tomorrow,
                "time_range": "tomorrow",
                "weather_variable": context.get("weather_variable") or "weather",
                "evaluated_category_id": context.get("evaluated_category_id") or "general"
            }

        # 4. "What about Kerala?" / "What about Goa?" / "What about Karnataka?" -> Switch state, retain topic
        if re.search(r'\bwhat about (kerala|goa|karnataka)\b', norm_q) or norm_q in ["what about kerala", "what about goa", "what about karnataka"]:
            target_state = "Kerala" if "kerala" in norm_q else ("Goa" if "goa" in norm_q else "Karnataka")
            # Default representative location for new state
            rep = {
                "Goa": ("Tiswadi", "Panaji", "LOC_GOA_01"),
                "Kerala": ("Ernakulam", "Kochi", "LOC_KL_02"),
                "Karnataka": ("Bengaluru Urban", "Bengaluru", "LOC_KA_05")
            }[target_state]
            return {
                "is_follow_up": True,
                "intent": context.get("last_intent") or "CURRENT_WEATHER",
                "state": target_state,
                "district": rep[0],
                "location_name": rep[1],
                "station_id": rep[2],
                "date_term": context.get("date_term") or "today",
                "display_date": context.get("date"),
                "time_range": context.get("time_range") or "today",
                "weather_variable": context.get("weather_variable") or "weather",
                "evaluated_category_id": context.get("evaluated_category_id") or "general"
            }

        # 5. "Will it affect driving?" -> Inherit location and date, intent becomes HIGHWAY_DRIVING_WEATHER (or HILL_TRAVEL_SAFETY if hill context)
        if any(k in norm_q for k in ["will it affect driving", "is it safe to drive", "safe for driving", "can i drive"]):
            is_hill = any(h in norm_q for h in ["hill", "hills", "ghat", "ghats", "mountain", "mountains", "slope", "slopes", "landslide"])
            return {
                "is_follow_up": True,
                "intent": "HILL_TRAVEL_SAFETY" if is_hill else "HIGHWAY_DRIVING_WEATHER",
                "state": context.get("state"),
                "district": context.get("district"),
                "location_name": context.get("location_name") or context.get("district"),
                "station_id": context.get("station_id") or context.get("location_id"),
                "date_term": context.get("date_term") or "today",
                "display_date": context.get("date"),
                "time_range": context.get("time_range") or "today",
                "weather_variable": "driving_visibility",
                "evaluated_category_id": "landslide" if is_hill else "transport"
            }

        # 6. "Why this answer?" / "Why?" -> Inherit recent evaluation, intent becomes WHY_ANSWER
        if any(k in norm_q for k in ["why this answer", "how did you calculate", "reason for this", "explain this answer", "why is this unsafe", "why caution"]) or norm_q in ["why", "why?", "why this", "why is that"]:
            return {
                "is_follow_up": True,
                "intent": "WHY_ANSWER",
                "state": context.get("state"),
                "district": context.get("district"),
                "location_name": context.get("location_name") or context.get("district"),
                "station_id": context.get("station_id") or context.get("location_id"),
                "date_term": context.get("date_term") or "today",
                "display_date": context.get("date"),
                "time_range": context.get("time_range") or "today",
                "weather_variable": "evaluation_reasoning",
                "evaluated_category_id": context.get("evaluated_category_id") or "general"
            }

        # 7. "Show it on the map" / "Show on map" / "On the map" -> Inherit location and date, intent becomes GRID_FORECAST
        if any(k in norm_q for k in ["show it on the map", "show on map", "show it on map", "view on map", "view on the map", "on the map", "open map"]) or norm_q in ["map", "map view", "show map"]:
            return {
                "is_follow_up": True,
                "intent": "GRID_FORECAST",
                "state": context.get("state"),
                "district": context.get("district"),
                "location_name": context.get("location_name") or context.get("district"),
                "station_id": context.get("station_id") or context.get("location_id"),
                "date_term": context.get("date_term") or "today",
                "display_date": context.get("date"),
                "time_range": context.get("time_range") or "today",
                "weather_variable": "rainfall_grid",
                "evaluated_category_id": context.get("evaluated_category_id") or "general"
            }

        # 8. "How accurate is that?" / "How accurate is it?" -> Inherit location, intent becomes MODEL_VERIFICATION
        if any(k in norm_q for k in ["how accurate is that", "how accurate is it", "how accurate", "how reliable is that", "accuracy of that", "how did the model perform", "what is the accuracy"]):
            return {
                "is_follow_up": True,
                "intent": "MODEL_VERIFICATION",
                "state": context.get("state"),
                "district": context.get("district"),
                "location_name": context.get("location_name") or context.get("district"),
                "station_id": context.get("station_id") or context.get("location_id"),
                "date_term": context.get("date_term") or "today",
                "display_date": context.get("date"),
                "time_range": context.get("time_range") or "today",
                "weather_variable": "model_verification",
                "evaluated_category_id": "general"
            }

        # 9. "Compare it with NWP" / "Compare with NWP" -> Inherit location, intent becomes MODEL_COMPARISON
        if any(k in norm_q for k in ["compare it with nwp", "compare with nwp", "compare it to nwp", "compare to nwp"]):
            return {
                "is_follow_up": True,
                "intent": "MODEL_COMPARISON",
                "state": context.get("state"),
                "district": context.get("district"),
                "location_name": context.get("location_name") or context.get("district"),
                "station_id": context.get("station_id") or context.get("location_id"),
                "date_term": context.get("date_term") or "today",
                "display_date": context.get("date"),
                "time_range": context.get("time_range") or "today",
                "weather_variable": "model_comparison",
                "evaluated_category_id": "general"
            }

        # 10. "What caused the prediction?" / "What caused it?" -> Inherit location, intent becomes FEATURE_IMPORTANCE
        if any(k in norm_q for k in ["what caused the prediction", "what caused it", "why did it predict that", "what features caused this"]):
            return {
                "is_follow_up": True,
                "intent": "FEATURE_IMPORTANCE",
                "state": context.get("state"),
                "district": context.get("district"),
                "location_name": context.get("location_name") or context.get("district"),
                "station_id": context.get("station_id") or context.get("location_id"),
                "date_term": context.get("date_term") or "today",
                "display_date": context.get("date"),
                "time_range": context.get("time_range") or "today",
                "weather_variable": "feature_importance",
                "evaluated_category_id": "general"
            }

        # 11. "Let me test it" / "Test it" -> Inherit location, intent becomes MODEL_SANDBOX
        if any(k in norm_q for k in ["let me test it", "test it", "can i test it", "simulate it"]):
            return {
                "is_follow_up": True,
                "intent": "MODEL_SANDBOX",
                "state": context.get("state"),
                "district": context.get("district"),
                "location_name": context.get("location_name") or context.get("district"),
                "station_id": context.get("station_id") or context.get("location_id"),
                "date_term": context.get("date_term") or "today",
                "display_date": context.get("date"),
                "time_range": context.get("time_range") or "today",
                "weather_variable": "model_sandbox",
                "evaluated_category_id": "general"
            }

        return None

    def classify_intent(self, query: str, entities: Dict[str, Any], context: Optional[dict] = None) -> Tuple[str, float]:
        """
        Classifies intent accurately into one of the 21 authoritative intents.
        Semantic intent is kept completely independent of UI sector tab selection.
        """
        norm_q = self.normalize_text(query)

        # A. SYSTEM_CAPABILITIES
        if any(k in norm_q for k in ["what can you do", "what are your features", "what are your capabilities", "what do you do", "capabilities", "what can i ask", "help me"]):
            return "SYSTEM_CAPABILITIES", 0.99

        # B. EXPLAIN_CONCEPT
        if any(k in norm_q for k in ["why do you use", "explain regime", "explain bias", "what is bias correction", "why bias correction", "concept of"]):
            return "EXPLAIN_CONCEPT", 0.99

        # C. AMBIGUOUS_QUERY
        if any(norm_q == ak or norm_q.startswith(ak) for ak in ["can i go", "can i go tomorrow", "should i go", "should i start work", "can i work tomorrow", "is it okay to go"]):
            return "AMBIGUOUS_QUERY", 0.99

        # D. NON_WEATHER (Math, coding, general knowledge)
        if re.search(r'\d+\s*[\+\-\*\/xX]\s*\d+', norm_q) or any(k in norm_q for k in ["multiplied by", "divided by", "plus", "minus", "who is", "who won", "prime minister", "president", "write python", "write code", "tell me a joke", "capital of"]):
            return "NON_WEATHER", 0.99

        # E. WEEKLY_EXTENDED_OUTLOOK
        if any(k in norm_q for k in ["7 day", "7-day", "weekly", "extended weekly", "weekly weather", "extended outlook", "extended forecast", "next 7 days"]):
            return "WEEKLY_EXTENDED_OUTLOOK", 0.99

        # F. DISTRICT_FORECAST
        if any(k in norm_q for k in ["district rainfall forecast", "district forecasts", "district wise", "district level rainfall", "forecast rainfall by district", "which districts", "district bulletin", "district-wise"]):
            return "DISTRICT_FORECAST", 0.99

        # G. MODEL_COMPARISON (vs, versus, compare NWP, ablation)
        if any(k in norm_q for k in [
            "compare the models", "compare models", "which model performs better", "model ablation",
            "ablation study", "xgboost vs random forest", "model architecture comparison",
            "compare raw nwp", "compare nwp", "difference between raw", "nwp vs", "vs vrishti",
            "versus machine learning", "closer to observations", "before and after bias correction"
        ]):
            return "MODEL_COMPARISON", 0.99

        # H. FEATURE_IMPORTANCE
        if any(k in norm_q for k in [
            "features influenced", "which features", "what features", "what variables",
            "why did the model increase", "why did the model decrease", "what drove the rainfall",
            "what drove", "feature importance", "which variables influenced", "what caused the prediction"
        ]):
            return "FEATURE_IMPORTANCE", 0.99

        # I. PROBABILITY_CALIBRATION
        if any(k in norm_q for k in [
            "probability calibration", "calibration curve", "calibration curves",
            "reliability curve", "reliability diagram", "show me probability calibration",
            "confidence calibration"
        ]) or norm_q in ["calibration", "show calibration"]:
            return "PROBABILITY_CALIBRATION", 0.99

        # J. MODEL_SANDBOX
        if any(k in norm_q for k in [
            "what if rainfall scenario", "what if scenario", "what-if scenario", "what-if",
            "what if", "what happens if", "let me test a what-if", "test a what-if", "let me test",
            "test scenario", "interactive sandbox", "test rainfall inputs", "test the model with different",
            "experiment with the rainfall"
        ]):
            return "MODEL_SANDBOX", 0.99

        # K. DATA_PROVENANCE / SCIENTIFIC AUDIT
        if any(k in norm_q for k in [
            "where did this data come from", "data provenance", "scientific audit", "data source",
            "data lineage", "which dataset was used", "which dataset", "sha-256", "sha256",
            "processing history", "dataset provenance"
        ]):
            return "DATA_PROVENANCE", 0.99

        # 1. MODEL_VERIFICATION (RMSE, FAR, CSI, POD, ETS, FSS, ground truth, accuracy)
        if any(re.search(r'\b' + k + r'\b', norm_q) for k in [
            "rmse", "far", "csi", "pod", "ets", "fss", "verification", "ground truth", "accuracy"
        ]) or any(k in norm_q for k in [
            "show rmse", "what is the far", "verification metrics", "compare corrected rainfall with ground truth",
            "compare nwp with corrected forecast", "how accurate", "model accuracy", "forecast accuracy",
            "skill score", "model skill", "how reliable is the model", "accuracy of the rainfall"
        ]):
            return "MODEL_VERIFICATION", 0.99

        # 2. MODEL_COMPARISON (NWP vs Corrected comparison)
        if any(k in norm_q for k in [
            "compare nwp and", "compare model", "closer to observations", "before and after bias correction", "nwp versus machine learning"
        ]):
            return "MODEL_COMPARISON", 0.98

        # 3. WEATHER_REGIME (Monsoon active/break, synoptic features, depression)
        if any(k in norm_q for k in [
            "weather regime", "active monsoon or break", "rainfall regime", "synoptic regime", "active monsoon", "break period", "associated with a depression"
        ]):
            return "WEATHER_REGIME", 0.98

        # 4. DISTRICT_FORECAST & GRID_FORECAST
        if any(k in norm_q for k in [
            "district level rainfall", "forecast rainfall by district", "which districts", "district wise", "district level"
        ]):
            return "DISTRICT_FORECAST", 0.97

        if any(k in norm_q for k in [
            "rainfall grid", "grid level", "on the map", "forecast map", "grid forecast", "spatial rainfall"
        ]):
            return "GRID_FORECAST", 0.97

        # 5. HILL_TRAVEL_SAFETY (Evaluated BEFORE highway driving so hill travel/driving is prioritized!)
        # Dominant context: hills, ghats, mountains, steep terrain, landslides, hill station travel/driving
        has_hill_keyword = any(re.search(r'\b' + hk + r'\b', norm_q) for hk in [
            "hill", "hills", "ghat", "ghats", "mountain", "mountains", "western ghats",
            "landslide", "landslides", "mudslide", "mudslides", "rockfall", "rockfalls",
            "slope", "slopes", "terrain", "trekking", "hiking", "pass"
        ])
        hill_locs = ["idukki", "wayanad", "munnar", "kodagu", "coorg", "agumbe", "chikkamagaluru", "chikmagalur", "sakleshpur", "vagamon"]
        has_hill_loc = any(re.search(r'\b' + hl + r'\b', norm_q) for hl in hill_locs)

        if has_hill_keyword or has_hill_loc:
            # If hill context or hill station is present, safety/travel/driving/rain query belongs to Hill Safety
            if any(k in norm_q for k in [
                "safe", "safety", "travel", "drive", "driving", "road", "trip", "visit",
                "danger", "dangerous", "landslide", "mudslide", "rockfall", "rain in the hills",
                "rain in hills", "rain", "heavy rain", "affect", "condition", "conditions"
            ]) or (has_hill_keyword and "rain" in norm_q):
                return "HILL_TRAVEL_SAFETY", 0.99

        # 6. HIGHWAY_DRIVING_WEATHER (Standard road, vehicle, highway driving without hill context)
        if any(k in norm_q for k in [
            "affect driving", "safe to drive", "driving on the highway", "reduce visibility on the road",
            "driving from", "highway travel", "road conditions", "highway driving", "braking distance",
            "hydroplaning", "expressway", "interstate driving"
        ]) or (re.search(r'\bdriv(e|ing)\b', norm_q) and any(k in norm_q for k in ["road", "highway", "visibility", "rain", "safe", "car", "vehicle"])):
            return "HIGHWAY_DRIVING_WEATHER", 0.98

        # 7. CITY_DRAINAGE_RAINFALL
        if any(k in norm_q for k in [
            "city drainage", "urban flood", "urban flooding", "underpass", "overwhelm city drainage",
            "waterlogging in bengaluru", "storm drain"
        ]):
            return "CITY_DRAINAGE_RAINFALL", 0.97

        # 8. FLOOD_RISK (e.g. "is there floods in panaji today?")
        if any(re.search(r'\b' + fk + r'\b', norm_q) for fk in [
            "flood", "floods", "flooding", "flooded", "waterlog", "waterlogging",
            "waterlogged", "inundation", "inundated", "submerged", "submergence", "deluge"
        ]):
            return "FLOOD_RISK", 0.99

        # 9. CONSTRUCTION_WEATHER_SAFETY
        if any(k in norm_q for k in [
            "construction", "concrete", "pour concrete", "crane", "cement", "building work"
        ]):
            return "CONSTRUCTION_WEATHER_SAFETY", 0.98

        # 10. AGRICULTURE_WEATHER
        if any(k in norm_q for k in [
            "farming", "agriculture", "crop", "crops", "harvest", "harvesting", "sowing", "paddy", "rice", "pesticide", "spray", "farmers"
        ]):
            return "AGRICULTURE_WEATHER", 0.98

        # 11. THUNDERSTORM_LIGHTNING
        if any(k in norm_q for k in ["thunderstorm", "thunderstorms", "lightning", "thunder", "squall"]):
            return "THUNDERSTORM_LIGHTNING", 0.97

        # 12. WIND_CONDITIONS
        if any(k in norm_q for k in ["wind speed", "winds", "wind", "gust", "strong winds"]):
            return "WIND_CONDITIONS", 0.97

        # 13. TEMPERATURE
        if any(k in norm_q for k in ["temperature", "how hot", "min temp", "max temp", "minimum temperature", "maximum temperature"]) or norm_q.startswith("temperature "):
            return "TEMPERATURE", 0.98

        # 14. HUMIDITY
        if any(k in norm_q for k in ["humidity", "relative humidity", "moisture"]):
            return "HUMIDITY", 0.98

        # 15. RAIN_PROBABILITY
        if any(k in norm_q for k in [
            "chance of rain", "chances of rain", "probability of rain", "probability of rainfall",
            "percentage chance of rain", "percentage chance", "likelihood of rain"
        ]):
            return "RAIN_PROBABILITY", 0.98

        # 16. HEAVY_RAIN_ALERT
        if any(k in norm_q for k in [
            "heavy rain", "extreme rain", "intense rain", "heavy rainfall", "heavy downpour",
            "heavy rain warning", "extreme rainfall", "how heavy"
        ]):
            return "HEAVY_RAIN_ALERT", 0.98

        # 17. RAINFALL_FORECAST (Specific rain amounts / will it rain)
        if any(k in norm_q for k in [
            "how much rain", "rainfall forecast", "will it rain", "expected rain", "expected rainfall", "rain forecast", "how many mm"
        ]):
            return "RAINFALL_FORECAST", 0.98

        # 18. CURRENT_WEATHER ("how is the weather in bengaluru urban today?", "what is the weather today")
        if any(k in norm_q for k in [
            "how is the weather", "what is the weather in", "what s the weather in", "what is the weather", "what s the weather",
            "current weather", "current conditions", "weather today", "weather right now", "raining now", "is it raining in"
        ]) and any(k in norm_q for k in ["today", "now", "right now", "current", "urban"]) and not any(k in norm_q for k in ["tomorrow", "day after", "next"]):
            return "CURRENT_WEATHER", 0.99

        # 19. WEATHER_FORECAST ("what will the weather be tomorrow in bengaluru", "weather forecast for kochi tomorrow")
        if any(k in norm_q for k in [
            "what will the weather be", "weather forecast", "weather tomorrow", "weather next", "forecast for", "how will the weather be"
        ]) or ("weather" in norm_q and any(k in norm_q for k in ["tomorrow", "day after", "next", "weekend", "this week", "next week", "forecast"])):
            return "WEATHER_FORECAST", 0.98

        # 20. NON_WEATHER (Jokes, general knowledge, math, coding)
        if any(k in norm_q for k in [
            "tell me a joke", "joke", "capital of", "python", "code", "prime minister", "who is", "write program", "calculate"
        ]) and not any(k in norm_q for k in ["rain", "weather", "flood", "wind", "temp"]):
            return "NON_WEATHER", 0.99

        # 21. Pure Greetings / Casual Check
        if any(norm_q.startswith(k) for k in ["hi", "hello", "hey"]) and len(norm_q.split()) <= 3:
            return "GREETING", 0.95
        if any(k in norm_q for k in ["how are you", "how r u", "thanks", "thank you", "bye", "goodbye"]):
            return "CASUAL", 0.95

        # Fallback to trained TF-IDF classifier
        if self.classifier and self.vectorizer:
            X = self.vectorizer.transform([norm_q])
            pred_intent = self.classifier.predict(X)[0]
            probs = self.classifier.predict_proba(X)[0]
            conf = float(max(probs))
            return pred_intent, conf

        return "CURRENT_WEATHER", 0.60

    def analyze_query(self, user_query: str, context: Optional[dict] = None) -> Dict[str, Any]:
        """
        Main entry point for conversational analysis.
        Returns complete debug trace, resolved entities, and evaluation readiness.
        """
        start_time = datetime.now()
        norm_q = self.normalize_text(user_query)

        # 1. Check for Contextual Follow-up
        follow_up = self.resolve_follow_up(user_query, context)
        if follow_up:
            state = follow_up["state"]
            district = follow_up["district"]
            location_name = follow_up["location_name"]
            station_id = follow_up["station_id"]
            date_term = follow_up["date_term"]
            display_date = follow_up["display_date"]
            time_range = follow_up["time_range"]
            weather_var = follow_up["weather_variable"]
            intent = follow_up["intent"]
            cat_id = follow_up["evaluated_category_id"]
            confidence = 0.98
            is_follow_up = True
        else:
            # 2. Normal entity and intent extraction
            entities = self.extract_entities(user_query, context)
            state = entities["state"]
            district = entities["district"]
            location_name = entities["location_name"]
            station_id = entities["station_id"]
            date_term = entities["date_term"]
            display_date = entities["display_date"]
            time_range = entities["time_range"]
            weather_var = entities["weather_variable"]

            # Inherit from context ONLY if query did not specify and context has valid data
            if not state and context and context.get("state"):
                state = context.get("state")
            if not district and context and context.get("district"):
                district = context.get("district")
                location_name = context.get("location_name") or district
                station_id = context.get("station_id") or context.get("location_id")

            intent, confidence = self.classify_intent(user_query, entities, context)
            is_follow_up = False

            # Map intent to sector category
            cat_map = {
                "CURRENT_WEATHER": "general",
                "WEATHER_FORECAST": "general",
                "RAINFALL_FORECAST": "general",
                "RAIN_PROBABILITY": "general",
                "HEAVY_RAIN_ALERT": "general",
                "FLOOD_RISK": "urban_flood",
                "CITY_DRAINAGE_RAINFALL": "urban_flood",
                "HIGHWAY_DRIVING_WEATHER": "transport",
                "HILL_TRAVEL_SAFETY": "landslide",
                "CONSTRUCTION_WEATHER_SAFETY": "construction",
                "AGRICULTURE_WEATHER": "agriculture",
                "WEATHER_REGIME": "general",
                "DISTRICT_FORECAST": "general",
                "GRID_FORECAST": "general",
                "MODEL_VERIFICATION": "general",
                "MODEL_COMPARISON": "general",
                "FEATURE_IMPORTANCE": "general",
                "PROBABILITY_CALIBRATION": "general",
                "MODEL_SANDBOX": "general",
                "DATA_PROVENANCE": "general",
                "NON_WEATHER": "general",
                "GREETING": "general",
                "CASUAL": "general"
            }
            cat_id = cat_map.get(intent, "general")

        # Map evaluated_category_id to friendly sector label
        sector_labels = {
            "general": "General Weather",
            "urban_flood": "City Drainage & Safety",
            "transport": "Highway & Driving",
            "landslide": "Hill Safety & Travel",
            "construction": "Construction & Building",
            "agriculture": "Farming & Agriculture"
        }
        selected_sector = sector_labels.get(cat_id, "General Weather")

        data_source = (
            "VRISHTI Operational Verification Benchmark 2025" 
            if intent in ["MODEL_VERIFICATION", "MODEL_COMPARISON"] 
            else "VRISHTI High-Res ML Ensemble Pipeline"
        )

        duration_ms = max(1, int((datetime.now() - start_time).total_seconds() * 1000))

        # Build required debug trace strictly matching specification schema
        debug_trace = {
            "submittedQuery": user_query,
            "normalizedQuery": norm_q,
            "detectedIntent": intent,
            "confidence": round(confidence, 2),
            "detectedState": state,
            "detectedDistrict": district,
            "resolvedLocation": location_name or district,
            "resolvedDate": display_date,
            "resolvedTimeRange": time_range,
            "detectedWeatherVariable": weather_var,
            "selectedSector": selected_sector,
            "detectedSector": selected_sector,
            "dataSource": data_source,
            "requestStatus": "SUCCESS (200)",
            "latencyMs": duration_ms
        }

        # Resolve representative defaults for queries with domain context but without explicit district
        if not district and not state:
            if intent == "HILL_TRAVEL_SAFETY" or "hill" in norm_q or "ghat" in norm_q:
                state = "Kerala"
                district = "Idukki"
                location_name = "Idukki Hills"
                station_id = "LOC_KL_03"
            elif intent == "CONSTRUCTION_WEATHER_SAFETY":
                state = "Karnataka"
                district = "Bengaluru Urban"
                location_name = "Bengaluru"
                station_id = "LOC_KA_05"
            elif intent in ["FLOOD_RISK", "CITY_DRAINAGE_RAINFALL"]:
                state = "Goa"
                district = "Tiswadi"
                location_name = "Panaji"
                station_id = "LOC_GOA_01"

        if state == "Karnataka" and not district:
            if intent == "AGRICULTURE_WEATHER":
                district = "Dharwad"
                location_name = "Dharwad"
                station_id = "LOC_KA_12"
            else:
                district = "Bengaluru Urban"
                location_name = "Bengaluru"
                station_id = "LOC_KA_05"
        elif state == "Kerala" and not district:
            district = "Palakkad" if intent == "AGRICULTURE_WEATHER" else "Idukki"
            location_name = district
            station_id = "LOC_KL_10" if intent == "AGRICULTURE_WEATHER" else "LOC_KL_03"
        elif state == "Goa" and not district:
            district = "Tiswadi"
            location_name = "Panaji"
            station_id = "LOC_GOA_01"

        # Check if query needs a location but none could be derived
        location_required_intents = [
            "CURRENT_WEATHER", "WEATHER_FORECAST", "RAINFALL_FORECAST",
            "RAIN_PROBABILITY", "HEAVY_RAIN_ALERT", "FLOOD_RISK",
            "THUNDERSTORM_LIGHTNING", "WIND_CONDITIONS", "TEMPERATURE", "HUMIDITY",
            "AGRICULTURE_WEATHER", "CONSTRUCTION_WEATHER_SAFETY",
            "HILL_TRAVEL_SAFETY", "HIGHWAY_DRIVING_WEATHER", "CITY_DRAINAGE_RAINFALL"
        ]

        missing_location = (intent in location_required_intents) and (not district and not state)

        # Update trace with resolved location
        debug_trace["detectedState"] = state
        debug_trace["detectedDistrict"] = district
        debug_trace["resolvedLocation"] = location_name or district

        return {
            "intent": intent,
            "confidence": confidence,
            "is_follow_up": is_follow_up,
            "state": state,
            "district": district,
            "location_name": location_name,
            "station_id": station_id,
            "date_term": date_term,
            "display_date": display_date,
            "time_range": time_range,
            "weather_variable": weather_var,
            "evaluated_category_id": cat_id,
            "missing_location": missing_location,
            "debug_trace": debug_trace
        }

conversation_matcher = ConversationMatcher()

def get_conversation_matcher() -> ConversationMatcher:
    return conversation_matcher

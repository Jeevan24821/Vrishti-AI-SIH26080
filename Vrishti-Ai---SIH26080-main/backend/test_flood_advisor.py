import sys
import os
import re
from datetime import datetime, timezone, timedelta

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.api.routes import evaluate_user_advisor, AdvisorEvaluateRequest

test_queries = [
    # 1. Exact query from user report:
    ("is there floods in panaji today?", "FLOOD_RISK", "Goa", "North Goa", "Panaji", "urban_flood"),
    # 2. Other required variations from prompt:
    ("Is there flooding in Panaji today?", "FLOOD_RISK", "Goa", "North Goa", "Panaji", "urban_flood"),
    ("Are there floods in Panaji?", "FLOOD_RISK", "Goa", "North Goa", "Panaji", "urban_flood"),
    ("Is Panaji flooded today?", "FLOOD_RISK", "Goa", "North Goa", "Panaji", "urban_flood"),
    ("Will Panaji experience flooding today?", "FLOOD_RISK", "Goa", "North Goa", "Panaji", "urban_flood"),
    ("Is there flood in Panaji today?", "FLOOD_RISK", "Goa", "North Goa", "Panaji", "urban_flood"),
    ("waterlogging in panaji today", "FLOOD_RISK", "Goa", "North Goa", "Panaji", "urban_flood"),
    ("drainage risk in panaji", "FLOOD_RISK", "Goa", "North Goa", "Panaji", "urban_flood"),
    ("flood risk in panaji", "FLOOD_RISK", "Goa", "North Goa", "Panaji", "urban_flood"),
    # 3. Road-specific flood query -> transport
    ("are roads flooded in Panaji?", "FLOOD_RISK", "Goa", "North Goa", "Panaji", "transport"),
    # 4. Multi-state flood queries:
    ("waterlogging in Bengaluru today?", "FLOOD_RISK", "Karnataka", "Bengaluru Urban", "Bengaluru", "urban_flood"),
    ("flood risk in Kochi today?", "FLOOD_RISK", "Kerala", "Ernakulam", "Kochi", "urban_flood"),
    # 5. Non-flood weather query regression checks:
    ("how is the weather in bengaluru urban today?", "GENERAL_WEATHER", "Karnataka", "Bengaluru Urban", "Bengaluru Urban", "general"),
    ("Can I pour concrete tomorrow in Palakkad?", "SAFETY_EVALUATION", "Kerala", "Palakkad", "Palakkad", "construction"),
    # 6. Off-topic non-weather check:
    ("tell me a joke", "NON_WEATHER", None, None, None, None),
]

all_passed = True
print("=" * 80)
print("RUNNING VRISHTI AI ADVISOR FLOOD & WEATHER INTENT TEST SUITE")
print("=" * 80)

for query, expected_intent, exp_state, exp_dist, exp_loc, exp_sector in test_queries:
    req = AdvisorEvaluateRequest(activity_text=query)
    data = evaluate_user_advisor(req)

    intent = data.get("intent")
    loc = data.get("location") or {}
    state = loc.get("state")
    dist = loc.get("district_name")
    loc_name = loc.get("location_name")
    sector = data.get("evaluated_category_id")
    fc_date = loc.get("forecast_date")

    intent_ok = (intent == expected_intent)
    state_ok = (exp_state is None) or (state == exp_state)
    dist_ok = (exp_dist is None) or (dist == exp_dist)
    loc_ok = (exp_loc is None) or (loc_name == exp_loc)
    sector_ok = (exp_sector is None) or (sector == exp_sector)

    if intent_ok and state_ok and dist_ok and loc_ok and sector_ok:
        print(f"PASSED: '{query}'")
        print(f"   -> intent: {intent}, state: {state}, dist: {dist}, loc: {loc_name}, sector: {sector}, date: {fc_date}")
    else:
        print(f"FAILED: '{query}'")
        print(f"   Expected: intent={expected_intent}, state={exp_state}, dist={exp_dist}, loc={exp_loc}, sector={exp_sector}")
        print(f"   Actual:   intent={intent}, state={state}, dist={dist}, loc={loc_name}, sector={sector}, date={fc_date}")
        all_passed = False

print("=" * 80)
if all_passed:
    print("ALL TESTS PASSED SUCCESSFULLY!")
else:
    print("SOME TESTS FAILED! Check logs above.")
print("=" * 80)
sys.exit(0 if all_passed else 1)

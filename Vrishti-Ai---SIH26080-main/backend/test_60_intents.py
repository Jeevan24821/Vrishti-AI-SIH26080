import sys
import os
import json
from datetime import datetime, timezone, timedelta

# Ensure backend path is available
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.api.routes import evaluate_user_advisor, AdvisorEvaluateRequest, AdvisorEvaluateContext
from app.services.conversation_matcher import conversation_matcher

matcher = conversation_matcher

kolkata_tz = timezone(timedelta(hours=5, minutes=30))
now_kolkata = datetime.now(kolkata_tz)
today_str = now_kolkata.strftime("%d-%m-%Y")
tomorrow_str = (now_kolkata + timedelta(days=1)).strftime("%d-%m-%Y")
day_after_str = (now_kolkata + timedelta(days=2)).strftime("%d-%m-%Y")

# 65+ Comprehensive Test Cases covering all 21 categories, follow-ups, short, informal, and edge queries
TEST_CASES = [
    # 1. CURRENT_WEATHER
    {"query": "how is the weather in bengaluru urban today?", "expected_intent": "CURRENT_WEATHER", "expected_state": "Karnataka", "expected_dist": "Bengaluru Urban"},
    {"query": "current weather in panaji", "expected_intent": "CURRENT_WEATHER", "expected_state": "Goa", "expected_dist": "North Goa"},
    {"query": "what is the weather right now in kochi", "expected_intent": "CURRENT_WEATHER", "expected_state": "Kerala", "expected_dist": "Ernakulam"},
    {"query": "weather outside in wayanad", "expected_intent": "CURRENT_WEATHER", "expected_state": "Kerala", "expected_dist": "Wayanad"},

    # 2. WEATHER_FORECAST
    {"query": "what is the weather in bengaluru tomorrow?", "expected_intent": "WEATHER_FORECAST", "expected_state": "Karnataka", "expected_dist": "Bengaluru Urban"},
    {"query": "weather forecast for panaji tomorrow", "expected_intent": "WEATHER_FORECAST", "expected_state": "Goa", "expected_dist": "North Goa"},
    {"query": "how will the weather be in kozhikode tomorrow", "expected_intent": "WEATHER_FORECAST", "expected_state": "Kerala", "expected_dist": "Kozhikode"},

    # 3. RAINFALL_FORECAST
    {"query": "how much rain will kochi get tomorrow?", "expected_intent": "RAINFALL_FORECAST", "expected_state": "Kerala", "expected_dist": "Ernakulam"},
    {"query": "rainfall forecast for tiswadi tomorrow", "expected_intent": "RAINFALL_FORECAST", "expected_state": "Goa", "expected_dist": "North Goa"},
    {"query": "expected rain mm in mysuru tomorrow", "expected_intent": "RAINFALL_FORECAST", "expected_state": "Karnataka", "expected_dist": "Mysuru"},
    {"query": "how many mm of rainfall will fall in palakkad", "expected_intent": "RAINFALL_FORECAST", "expected_state": "Kerala", "expected_dist": "Palakkad"},

    # 4. RAIN_PROBABILITY
    {"query": "what is the chance of rain in bengaluru today?", "expected_intent": "RAIN_PROBABILITY", "expected_state": "Karnataka", "expected_dist": "Bengaluru Urban"},
    {"query": "probability of rain in panaji tomorrow", "expected_intent": "RAIN_PROBABILITY", "expected_state": "Goa", "expected_dist": "North Goa"},
    {"query": "what are the chances of rain in alappuzha", "expected_intent": "RAIN_PROBABILITY", "expected_state": "Kerala", "expected_dist": "Alappuzha"},

    # 5. HEAVY_RAIN_ALERT
    {"query": "is heavy rain expected in panaji today?", "expected_intent": "HEAVY_RAIN_ALERT", "expected_state": "Goa", "expected_dist": "North Goa"},
    {"query": "will there be extreme rainfall in idukki tomorrow", "expected_intent": "HEAVY_RAIN_ALERT", "expected_state": "Kerala", "expected_dist": "Idukki"},
    {"query": "heavy downpour alert for mangaluru", "expected_intent": "HEAVY_RAIN_ALERT", "expected_state": "Karnataka", "expected_dist": "Dakshina Kannada"},

    # 6. FLOOD_RISK
    {"query": "is there floods in panaji today?", "expected_intent": "FLOOD_RISK", "expected_state": "Goa", "expected_dist": "North Goa"},
    {"query": "are there floods in kochi today?", "expected_intent": "FLOOD_RISK", "expected_state": "Kerala", "expected_dist": "Ernakulam"},
    {"query": "is panaji flooded today?", "expected_intent": "FLOOD_RISK", "expected_state": "Goa", "expected_dist": "North Goa"},
    {"query": "will heavy rain cause flooding in mangaluru tomorrow?", "expected_intent": "FLOOD_RISK", "expected_state": "Karnataka", "expected_dist": "Dakshina Kannada"},

    # 7. HIGHWAY_DRIVING_WEATHER
    {"query": "will rain affect driving in bengaluru tomorrow?", "expected_intent": "HIGHWAY_DRIVING_WEATHER", "expected_state": "Karnataka", "expected_dist": "Bengaluru Urban"},
    {"query": "is highway driving safe to mysuru tomorrow?", "expected_intent": "HIGHWAY_DRIVING_WEATHER", "expected_state": "Karnataka", "expected_dist": "Mysuru"},
    {"query": "expressway road conditions between palakkad and thrissur", "expected_intent": "HIGHWAY_DRIVING_WEATHER", "expected_state": "Kerala", "expected_dist": "Palakkad"},

    # 8. HILL_TRAVEL_SAFETY
    {"query": "is it safe to travel to wayanad tomorrow because of rain?", "expected_intent": "HILL_TRAVEL_SAFETY", "expected_state": "Kerala", "expected_dist": "Wayanad"},
    {"query": "is there landslide risk in idukki hills tomorrow?", "expected_intent": "HILL_TRAVEL_SAFETY", "expected_state": "Kerala", "expected_dist": "Idukki"},
    {"query": "is ghat road travel safe to kodagu tomorrow?", "expected_intent": "HILL_TRAVEL_SAFETY", "expected_state": "Karnataka", "expected_dist": "Kodagu"},

    # 9. AGRICULTURE_WEATHER
    {"query": "is tomorrow suitable for rice harvesting in south goa?", "expected_intent": "AGRICULTURE_WEATHER", "expected_state": "Goa", "expected_dist": "South Goa"},
    {"query": "can i spray pesticides in palakkad paddy fields tomorrow?", "expected_intent": "AGRICULTURE_WEATHER", "expected_state": "Kerala", "expected_dist": "Palakkad"},
    {"query": "farming and crop sowing conditions in mandya tomorrow", "expected_intent": "AGRICULTURE_WEATHER", "expected_state": "Karnataka", "expected_dist": "Mandya"},

    # 10. CONSTRUCTION_WEATHER_SAFETY
    {"query": "can I pour concrete tomorrow in palakkad?", "expected_intent": "CONSTRUCTION_WEATHER_SAFETY", "expected_state": "Kerala", "expected_dist": "Palakkad"},
    {"query": "is it safe for building roof slab casting in panaji tomorrow?", "expected_intent": "CONSTRUCTION_WEATHER_SAFETY", "expected_state": "Goa", "expected_dist": "North Goa"},
    {"query": "site excavation and cement work in bengaluru tomorrow", "expected_intent": "CONSTRUCTION_WEATHER_SAFETY", "expected_state": "Karnataka", "expected_dist": "Bengaluru Urban"},

    # 11. CITY_DRAINAGE_RAINFALL
    {"query": "will city underpasses flood in bengaluru today?", "expected_intent": "CITY_DRAINAGE_RAINFALL", "expected_state": "Karnataka", "expected_dist": "Bengaluru Urban"},
    {"query": "urban stormwater drainage capacity in kochi during rain", "expected_intent": "CITY_DRAINAGE_RAINFALL", "expected_state": "Kerala", "expected_dist": "Ernakulam"},

    # 12. THUNDERSTORM_LIGHTNING
    {"query": "is there thunderstorm and lightning in idukki today?", "expected_intent": "THUNDERSTORM_LIGHTNING", "expected_state": "Kerala", "expected_dist": "Idukki"},
    {"query": "lightning warning for goa coastal areas today", "expected_intent": "THUNDERSTORM_LIGHTNING", "expected_state": "Goa", "expected_dist": "North Goa"},

    # 13. WIND_CONDITIONS
    {"query": "how strong are the wind speeds in panaji today?", "expected_intent": "WIND_CONDITIONS", "expected_state": "Goa", "expected_dist": "North Goa"},
    {"query": "wind gust forecast for kochi port tomorrow", "expected_intent": "WIND_CONDITIONS", "expected_state": "Kerala", "expected_dist": "Ernakulam"},

    # 14. TEMPERATURE
    {"query": "what is the temperature in bengaluru right now?", "expected_intent": "TEMPERATURE", "expected_state": "Karnataka", "expected_dist": "Bengaluru Urban"},
    {"query": "how hot will it be in panaji tomorrow?", "expected_intent": "TEMPERATURE", "expected_state": "Goa", "expected_dist": "North Goa"},

    # 15. HUMIDITY
    {"query": "what is the relative humidity in kochi today?", "expected_intent": "HUMIDITY", "expected_state": "Kerala", "expected_dist": "Ernakulam"},
    {"query": "humidity percentage in mangaluru right now", "expected_intent": "HUMIDITY", "expected_state": "Karnataka", "expected_dist": "Dakshina Kannada"},

    # 16. WEEKLY_EXTENDED_OUTLOOK
    {"query": "what is the 7 day rainfall outlook for kerala?", "expected_intent": "WEEKLY_EXTENDED_OUTLOOK", "expected_state": "Kerala"},
    {"query": "extended weekly weather forecast for karnataka", "expected_intent": "WEEKLY_EXTENDED_OUTLOOK", "expected_state": "Karnataka"},

    # 17. DISTRICT_FORECAST
    {"query": "show district rainfall forecasts for karnataka", "expected_intent": "DISTRICT_FORECAST", "expected_state": "Karnataka"},
    {"query": "district wise rain bulletin for kerala", "expected_intent": "DISTRICT_FORECAST", "expected_state": "Kerala"},

    # 18. GRID_FORECAST
    {"query": "show high resolution rainfall grid map for goa", "expected_intent": "GRID_FORECAST", "expected_state": "Goa"},
    {"query": "5km spatial grid forecast for karnataka", "expected_intent": "GRID_FORECAST", "expected_state": "Karnataka"},

    # 19. MODEL_VERIFICATION
    {"query": "show RMSE and FAR for Karnataka", "expected_intent": "MODEL_VERIFICATION", "expected_state": "Karnataka"},
    {"query": "what is the POD and CSI score for Goa?", "expected_intent": "MODEL_VERIFICATION", "expected_state": "Goa"},
    {"query": "model verification accuracy report for kerala", "expected_intent": "MODEL_VERIFICATION", "expected_state": "Kerala"},

    # 20. MODEL_COMPARISON
    {"query": "compare raw NWP vs VRISHTI ML for Karnataka", "expected_intent": "MODEL_COMPARISON", "expected_state": "Karnataka"},
    {"query": "difference between raw weather forecast and bias corrected AI for goa", "expected_intent": "MODEL_COMPARISON", "expected_state": "Goa"},

    # 21. WEATHER_REGIME
    {"query": "what is the active monsoon regime right now?", "expected_intent": "WEATHER_REGIME"},
    {"query": "current synoptic weather regime for kerala", "expected_intent": "WEATHER_REGIME", "expected_state": "Kerala"},

    # 22. GREETINGS & CASUAL
    {"query": "hello vrishti", "expected_intent": "GREETING"},
    {"query": "hi", "expected_intent": "GREETING"},
    {"query": "how are you today?", "expected_intent": "CASUAL"},
    {"query": "thank you for the help", "expected_intent": "CASUAL"},
    {"query": "bye", "expected_intent": "CASUAL"},

    # 23. NON_WEATHER
    {"query": "who is the prime minister of india?", "expected_intent": "NON_WEATHER"},
    {"query": "write python code to sort a list", "expected_intent": "NON_WEATHER"},
    {"query": "what is 25 multiplied by 4?", "expected_intent": "NON_WEATHER"},

    # 24. SYSTEM_CAPABILITIES & EXPLAIN_CONCEPT
    {"query": "what can you do?", "expected_intent": "SYSTEM_CAPABILITIES"},
    {"query": "what are your features?", "expected_intent": "SYSTEM_CAPABILITIES"},
    {"query": "why do you use bias correction?", "expected_intent": "EXPLAIN_CONCEPT"},
    {"query": "explain regime aware machine learning", "expected_intent": "EXPLAIN_CONCEPT"},

    # 25. AMBIGUOUS & MISSING LOCATION
    {"query": "can i go tomorrow?", "expected_intent": "AMBIGUOUS_QUERY"},
    {"query": "should i start work?", "expected_intent": "AMBIGUOUS_QUERY"},
    {"query": "will it rain heavily?", "expected_intent": "MISSING_LOCATION"},
    {"query": "how is the weather today?", "expected_intent": "MISSING_LOCATION"},
    {"query": "is there flood risk today?", "expected_intent": "MISSING_LOCATION"},
]

def run_test_suite():
    print(f"============================================================")
    print(f"VRISHTI AI CONVERSATION INTELLIGENCE SUITE — 65+ TESTS")
    print(f"============================================================")
    
    passed = 0
    failed = 0
    errors = []

    for i, test in enumerate(TEST_CASES, start=1):
        q = test["query"]
        expected_intent = test["expected_intent"]
        expected_state = test.get("expected_state")
        expected_dist = test.get("expected_dist")

        req = AdvisorEvaluateRequest(activity_text=q)
        try:
            res = evaluate_user_advisor(req)
            trace = res.get("debug_trace", {})
            actual_intent = res.get("intent")
            actual_state = trace.get("detectedState")
            actual_dist = trace.get("detectedDistrict")

            # Check 1: Intent match
            if actual_intent != expected_intent:
                raise AssertionError(f"Intent mismatch: Expected '{expected_intent}', got '{actual_intent}'")

            # Check 2: State match if specified
            if expected_state and actual_state != expected_state:
                raise AssertionError(f"State mismatch: Expected '{expected_state}', got '{actual_state}'")

            # Check 3: District match if specified
            if expected_dist and actual_dist != expected_dist:
                raise AssertionError(f"District mismatch: Expected '{expected_dist}', got '{actual_dist}'")

            # Check 4: Debug trace 14 fields schema check
            trace_keys = [
                "submittedQuery", "normalizedQuery", "detectedIntent", "confidence",
                "detectedState", "detectedDistrict", "resolvedLocation", "resolvedDate",
                "resolvedTimeRange", "detectedWeatherVariable", "selectedSector",
                "dataSource", "requestStatus", "latencyMs"
            ]
            for k in trace_keys:
                if k not in trace:
                    raise AssertionError(f"Missing debug_trace field: '{k}'")

            # Check 5: Conversational response not empty
            if not res.get("conversational_response"):
                raise AssertionError("Empty conversational_response in return object")

            passed += 1
            print(f"[PASS {passed:02d}] Query: '{q}' -> Intent: {actual_intent}, State: {actual_state}, District: {actual_dist}")

        except Exception as e:
            failed += 1
            err_msg = f"[FAIL {failed:02d}] Query: '{q}' -> Error: {str(e)}"
            print(err_msg)
            errors.append(err_msg)

    # Multi-turn Follow-up Chain 1: (Cases G & H style)
    print("\n--- Testing Multi-Turn Follow-Up Dialogue Chains ---")
    
    # Chain 1: Rain in Panaji -> How heavy?
    req1 = AdvisorEvaluateRequest(activity_text="Will it rain in Panaji today?")
    res1 = evaluate_user_advisor(req1)
    req2 = AdvisorEvaluateRequest(activity_text="How heavy?", context=AdvisorEvaluateContext(**res1["context"]))
    res2 = evaluate_user_advisor(req2)
    assert res2["intent"] == "HEAVY_RAIN_ALERT", f"Chain 1 expected HEAVY_RAIN_ALERT, got {res2['intent']}"
    assert res2["debug_trace"]["detectedState"] == "Goa", f"Chain 1 state expected Goa, got {res2['debug_trace']['detectedState']}"
    passed += 1
    print(f"[PASS {passed:02d}] Multi-turn Chain 1: 'Will it rain in Panaji today?' -> 'How heavy?' (Inherited Goa/Panaji)")

    # Chain 2: Bengaluru tomorrow -> What about the day after?
    req_b1 = AdvisorEvaluateRequest(activity_text="What is the weather in Bengaluru tomorrow?")
    res_b1 = evaluate_user_advisor(req_b1)
    req_b2 = AdvisorEvaluateRequest(activity_text="What about the day after?", context=AdvisorEvaluateContext(**res_b1["context"]))
    res_b2 = evaluate_user_advisor(req_b2)
    assert res_b2["debug_trace"]["resolvedDate"] == day_after_str, f"Chain 2 date expected {day_after_str}, got {res_b2['debug_trace']['resolvedDate']}"
    assert res_b2["debug_trace"]["detectedDistrict"] == "Bengaluru Urban", f"Chain 2 dist expected Bengaluru Urban, got {res_b2['debug_trace']['detectedDistrict']}"
    passed += 1
    print(f"[PASS {passed:02d}] Multi-turn Chain 2: 'What is the weather in Bengaluru tomorrow?' -> 'What about the day after?' (Resolved {day_after_str})")

    # Chain 3: Rain in Kochi -> Will it affect driving?
    req_k1 = AdvisorEvaluateRequest(activity_text="How much rain will Kochi get tomorrow?")
    res_k1 = evaluate_user_advisor(req_k1)
    req_k2 = AdvisorEvaluateRequest(activity_text="Will it affect driving?", context=AdvisorEvaluateContext(**res_k1["context"]))
    res_k2 = evaluate_user_advisor(req_k2)
    assert res_k2["intent"] == "HIGHWAY_DRIVING_WEATHER", f"Chain 3 expected HIGHWAY_DRIVING_WEATHER, got {res_k2['intent']}"
    assert res_k2["debug_trace"]["detectedState"] == "Kerala", f"Chain 3 expected Kerala, got {res_k2['debug_trace']['detectedState']}"
    passed += 1
    print(f"[PASS {passed:02d}] Multi-turn Chain 3: 'Rain in Kochi' -> 'Will it affect driving?' (Intent: HIGHWAY_DRIVING_WEATHER)")

    # Chain 4: Landslide in Wayanad -> Why this answer?
    req_w1 = AdvisorEvaluateRequest(activity_text="Is it safe to travel to Wayanad tomorrow because of rain?")
    res_w1 = evaluate_user_advisor(req_w1)
    req_w2 = AdvisorEvaluateRequest(activity_text="Why this answer?", context=AdvisorEvaluateContext(**res_w1["context"]))
    res_w2 = evaluate_user_advisor(req_w2)
    assert res_w2["intent"] == "WHY_ANSWER", f"Chain 4 expected WHY_ANSWER, got {res_w2['intent']}"
    passed += 1
    print(f"[PASS {passed:02d}] Multi-turn Chain 4: 'Travel to Wayanad' -> 'Why this answer?' (Intent: WHY_ANSWER)")

    print(f"\n============================================================")
    print(f"FINAL RESULT: {passed} PASSED / {failed} FAILED (TOTAL {passed + failed} TESTS)")
    print(f"SUCCESS RATE: {passed / (passed + failed) * 100:.1f}%")
    print(f"============================================================")

    if failed > 0:
        print("\nFailed Tests Summary:")
        for err in errors:
            print("  -", err)
        sys.exit(1)
    else:
        print("\nCONGRATULATIONS: 100% OF INTENT AND CONVERSATION INTELLIGENCE TESTS PASSED!")
        sys.exit(0)

if __name__ == "__main__":
    run_test_suite()

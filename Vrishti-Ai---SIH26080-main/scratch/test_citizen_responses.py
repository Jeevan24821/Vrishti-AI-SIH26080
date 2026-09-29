import urllib.request
import json
import sys

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

test_queries = [
    "Will it rain heavily in Wayanad tomorrow?",
    "Is there a chance of heavy rain in Panaji tonight?",
    "Will it rain in Bengaluru this evening?",
    "will it rain tomorrow in Idukki?",
    "can I pour concrete tomorrow in Palakkad?",
    "Is it safe to drive through the hills in Idukki?"
]

url = "http://127.0.0.1:8000/api/advisor/evaluate"

print("=== VRISHTI USER-FRIENDLY CITIZEN RAINFALL RESPONSES ===\n")
for idx, q in enumerate(test_queries, 1):
    payload = {"activity_text": q, "date": "01-06-2024"}
    req_body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=req_body, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read().decode("utf-8"))
            headline = data.get("headline_text") or (data.get("conversational_summary", {}).get("clear_answer") if data.get("conversational_summary") else data.get("intent"))
            rain = data.get("expected_rain_mm")
            chance = data.get("rain_chance_text")
            period = data.get("forecast_period")
            follow = data.get("follow_up_question")
            prose = data.get("conversational_response")
            
            print(f"[{idx}] User: \"{q}\"")
            print(f"    Headline: {headline}")
            if rain is not None:
                print(f"    Expected Rain: {rain} mm | Chance: {chance} | Period: {period}")
                print(f"    Follow-up: {follow}")
            print(f"    Full Conversational Prose:\n{prose}\n")
            print("-" * 60)
    except Exception as e:
        print(f"[{idx}] User: \"{q}\" -> ERROR: {e}\n")

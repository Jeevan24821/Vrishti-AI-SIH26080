import urllib.request
import json

test_queries = [
    "hi",
    "what can you do?",
    "will it rain tomorrow?",
    "will it rain tomorrow in Idukki?",
    "can I pour concrete tomorrow in Palakkad?",
    "Is it safe to drive through the hills in Idukki?",
    "thanks",
    "tell me a joke",
    "Will it rain heavily in Wayanad tomorrow?"
]

url = "http://127.0.0.1:8000/api/advisor/evaluate"

print("=== VRISHTI LIVE HTTP SERVER TEST SUITE ===")
for idx, q in enumerate(test_queries, 1):
    payload = {"activity_text": q, "date": "01-06-2024"}
    req_body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=req_body, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read().decode("utf-8"))
            intent = data.get("intent")
            loc = data.get("location") or {}
            dist = loc.get("district_name")
            st = loc.get("state")
            sec = data.get("evaluated_category_id")
            resp = str(data.get("conversational_response", ""))[:90].replace("\n", " ")
            print(f"[{idx}/{len(test_queries)}] Query: '{q}'")
            print(f"     -> Intent: {intent} | District: {dist} | State: {st} | Sector: {sec}")
            print(f"     -> Response: {resp}...\n")
    except Exception as e:
        print(f"[{idx}/{len(test_queries)}] Query: '{q}' -> FAILED: {e}\n")

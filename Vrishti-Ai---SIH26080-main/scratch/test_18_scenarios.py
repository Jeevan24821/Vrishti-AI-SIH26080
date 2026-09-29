import urllib.request
import json
import time

time.sleep(2)
BASE_URL = "http://localhost:8000/api/advisor/evaluate"

test_cases = [
    (1, "Show rainfall across Karnataka.", None, "map"),
    (2, "Where will heavy rain occur in Kerala?", None, "map"),
    (3, "Compare NWP and corrected rainfall.", None, "verification"),
    (4, "Show RMSE, CSI and POD for Karnataka.", None, "verification"),
    (5, "How accurate is the rainfall correction?", None, "verification"),
    (6, "Why did the model increase rainfall here?", None, ["feature_importance", "sandbox"]),
    (7, "Which features influenced this prediction?", None, "feature_importance"),
    (8, "What weather regime is active?", None, "regime"),
    (9, "Why was this classified as active monsoon?", None, "regime"),
    (10, "Let me test a what-if rainfall scenario.", None, "sandbox"),
    (11, "Show the detailed forecast for Bengaluru.", None, ["forecast", "map"]),
    (12, "Where did this data come from?", None, "audit"),
    (13, "Show me probability calibration.", None, "calibration"),
    (14, "Compare the models.", None, "ablation"),
]

# Run single turns
passed = 0
total = 18

print("=== TESTING INITIAL 14 SCENARIOS ===")
for num, query, context, expected_dest in test_cases:
    payload = {"activity_text": query, "context": context}
    req = urllib.request.Request(BASE_URL, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        resp = urllib.request.urlopen(req)
        data = json.loads(resp.read().decode('utf-8'))
        actions = data.get("recommended_actions") or []
        destinations = [a["destination"] for a in actions]
        
        ok = False
        if isinstance(expected_dest, list):
            ok = any(d in destinations for d in expected_dest)
        else:
            ok = expected_dest in destinations
            
        print(f"[{'PASS' if ok else 'FAIL'}] #{num}: '{query}' -> Intent: {data.get('intent')} | Actions: {[(a['label'], a['destination']) for a in actions]}")
        if ok:
            passed += 1
        else:
            print(f"   Expected {expected_dest}, got {destinations}")
    except Exception as e:
        print(f"[ERROR] #{num}: '{query}' -> {e}")

# Multi-turn scenarios: 15, 16, 17, 18
print("\n=== TESTING MULTI-TURN CONTEXT SCENARIOS 15, 16, 17, 18 ===")
# Turn 15: "Show corrected rainfall for Kerala tomorrow."
p15 = {"activity_text": "Show corrected rainfall for Kerala tomorrow."}
req15 = urllib.request.Request(BASE_URL, data=json.dumps(p15).encode('utf-8'), headers={'Content-Type': 'application/json'})
resp15 = urllib.request.urlopen(req15)
data15 = json.loads(resp15.read().decode('utf-8'))
ctx15 = data15.get("context")
act15 = data15.get("recommended_actions", [])
dest15 = [a["destination"] for a in act15]
ok15 = "map" in dest15
print(f"[{'PASS' if ok15 else 'FAIL'}] #15: 'Show corrected rainfall for Kerala tomorrow.' -> Actions: {[(a['label'], a['destination']) for a in act15]}")
if ok15:
    passed += 1

# Turn 16: "How accurate is that?" (follow-up on Kerala/tomorrow)
p16 = {"activity_text": "How accurate is that?", "context": ctx15}
req16 = urllib.request.Request(BASE_URL, data=json.dumps(p16).encode('utf-8'), headers={'Content-Type': 'application/json'})
resp16 = urllib.request.urlopen(req16)
data16 = json.loads(resp16.read().decode('utf-8'))
act16 = data16.get("recommended_actions", [])
dest16 = [a["destination"] for a in act16]
ok16 = "verification" in dest16
print(f"[{'PASS' if ok16 else 'FAIL'}] #16: 'How accurate is that?' -> Intent: {data16.get('intent')} | Actions: {[(a['label'], a['destination']) for a in act16]}")
if ok16:
    passed += 1

# Turn 17: "Show it on the map." (follow-up)
p17 = {"activity_text": "Show it on the map.", "context": ctx15}
req17 = urllib.request.Request(BASE_URL, data=json.dumps(p17).encode('utf-8'), headers={'Content-Type': 'application/json'})
resp17 = urllib.request.urlopen(req17)
data17 = json.loads(resp17.read().decode('utf-8'))
act17 = data17.get("recommended_actions", [])
dest17 = [a["destination"] for a in act17]
ok17 = "map" in dest17
print(f"[{'PASS' if ok17 else 'FAIL'}] #17: 'Show it on the map.' -> Intent: {data17.get('intent')} | Actions: {[(a['label'], a['destination']) for a in act17]}")
if ok17:
    passed += 1

# Turn 18: "What caused the prediction?" (follow-up)
p18 = {"activity_text": "What caused the prediction?", "context": ctx15}
req18 = urllib.request.Request(BASE_URL, data=json.dumps(p18).encode('utf-8'), headers={'Content-Type': 'application/json'})
resp18 = urllib.request.urlopen(req18)
data18 = json.loads(resp18.read().decode('utf-8'))
act18 = data18.get("recommended_actions", [])
dest18 = [a["destination"] for a in act18]
ok18 = "feature_importance" in dest18 or "sandbox" in dest18
print(f"[{'PASS' if ok18 else 'FAIL'}] #18: 'What caused the prediction?' -> Intent: {data18.get('intent')} | Actions: {[(a['label'], a['destination']) for a in act18]}")
if ok18:
    passed += 1

print(f"\nTOTAL PASSED: {passed}/{total}")

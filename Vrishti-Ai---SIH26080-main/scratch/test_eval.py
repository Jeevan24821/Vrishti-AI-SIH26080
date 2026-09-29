import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from backend.app.api.routes import evaluate_user_advisor, AdvisorEvaluateRequest

queries = [
    'hi',
    'hello',
    'what can you do?',
    'thanks',
    'tell me a joke',
    'will it rain tomorrow?',
    'will it rain tomorrow in Idukki?',
    'can I pour concrete tomorrow?',
    'is it safe to drive through the hills in Idukki?',
    'is there urban flood risk in Panaji?',
    'is tomorrow suitable for rice harvesting in South Goa?'
]

for q in queries:
    req = AdvisorEvaluateRequest(activity_text=q)
    data = evaluate_user_advisor(req)
    intent = data.get('intent')
    status = data.get('status_code')
    loc = data.get('location')
    dist = loc.get('district_name') if loc else None
    state = loc.get('state') if loc else None
    sector = data.get('evaluated_category_id')
    resp = data.get('conversational_response') or (data.get('conversational_summary', {}).get('clear_answer') if data.get('conversational_summary') else '')
    clean_resp = str(resp)[:120].encode('ascii', errors='ignore').decode('ascii')
    print(f"=== Query: '{q}' ===")
    print(f"Intent: {intent} | Status: {status} | District: {dist} | State: {state} | Sector: {sector}")
    print(f"Response: {clean_resp}...\n")

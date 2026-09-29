import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from backend.app.api.routes import evaluate_user_advisor, AdvisorEvaluateRequest, AdvisorEvaluateContext

queries = [
    "hi",
    "what can you do?",
    "will it rain tomorrow?",
    "will it rain tomorrow in Idukki?",
    "can I pour concrete tomorrow in Palakkad?",
    "Is it safe to drive through the hills in Idukki?",
    "thanks",
    "tell me a joke",
    "Will it rain heavily in Wayanad tomorrow?",
    "Is it safe to drive there tonight?"
]

current_context = None

print("=== VRISHTI AI ASSISTANT QUERY TEST SUITE ===")
for idx, q in enumerate(queries, 1):
    req = AdvisorEvaluateRequest(
        activity_text=q,
        context=current_context
    )
    res = evaluate_user_advisor(req)
    
    if res.get('context'):
        ctx_data = res['context']
        current_context = AdvisorEvaluateContext(**ctx_data)
        
    intent = res.get('intent')
    status = res.get('status_code')
    loc = res.get('location')
    dist = loc.get('district_name') if loc else (current_context.district if current_context else None)
    state = loc.get('state') if loc else (current_context.state if current_context else None)
    sector = res.get('evaluated_category_id')
    resp = res.get('conversational_response') or ''
    clean_resp = str(resp)[:120].replace('\n', ' ').encode('ascii', errors='ignore').decode('ascii')

    print(f"[{idx}/{len(queries)}] Query: '{q}'")
    print(f"      -> Intent: {intent} | Status: {status} | District: {dist} | State: {state} | Sector: {sector}")
    print(f"      -> Output: {clean_resp}...\n")

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from backend.app.api.routes import evaluate_user_advisor, AdvisorEvaluateRequest, AdvisorEvaluateContext

queries = [
    "Will it rain heavily in Wayanad tomorrow?",
    "Is it safe to drive there tonight?",
    "Will it rain in Panaji this evening?",
    "Is there a flood risk?",
    "Can I pour concrete tomorrow in Palakkad?",
    "Is tomorrow suitable for harvesting?",
    "Is it safe to travel through Idukki tonight?",
    "What is the chance of heavy rain?",
    "Why did VRISHTI correct the NWP rainfall?",
    "Hi, how are you?"
]

current_context = None

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
    dist = loc.get('district_name') if loc else None
    state = loc.get('state') if loc else None
    sector = res.get('evaluated_category_id')
    resp = res.get('conversational_response') or (res.get('conversational_summary', {}).get('clear_answer') if res.get('conversational_summary') else '')
    clean_resp = str(resp)[:100].encode('ascii', errors='ignore').decode('ascii')

    print(f"[{idx}/10] Query: '{q}'", flush=True)
    print(f"      -> Intent: {intent} | Status: {status} | District: {dist} | State: {state} | Sector: {sector}", flush=True)
    print(f"      -> Output: {clean_resp}...\n", flush=True)

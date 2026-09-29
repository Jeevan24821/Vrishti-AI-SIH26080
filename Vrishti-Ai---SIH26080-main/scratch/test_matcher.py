import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from backend.app.services.conversation_matcher import ConversationMatcher

matcher = ConversationMatcher()

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
    res = matcher.analyze_query(q)
    print(f"Query: '{q}' -> Intent: {res.get('intent')} | Sector: {res.get('sector')} | District: {res.get('district')} | State: {res.get('state')} | EvalNeeded: {res.get('evaluation_needed')}")

from app.services.conversation_matcher import ConversationMatcher
cm = ConversationMatcher()
queries = [
    "How is the weather in Bengaluru today?",
    "Will rain affect driving in Bengaluru tomorrow?",
    "Is it safe to travel to Idukki?",
    "Is it safe to drive through the hills in Idukki?",
    "Will it rain in the hills tomorrow?",
    "Is there flooding in Panaji today?",
    "Will heavy rain cause waterlogging in Panaji?",
    "Will this rainfall affect agriculture in Karnataka?",
    "Is it safe to continue construction during the rain?",
    "What is the rainfall forecast for Bengaluru?"
]
for q in queries:
    res = cm.analyze_query(q)
    print(f"Query: {q}")
    print(f"  -> Intent: {res.get('intent')}")
    print(f"  -> State: {res.get('state')}, District: {res.get('district')}, Loc: {res.get('location_name')}")
    print("-" * 50)

# VRISHTI AI Assistant Training Pack

This file is designed for the **conversational/intent layer** of VRISHTI AI, not the NWP rainfall-bias-correction model.

## What is included

- The existing VRISHTI weather conversation dataset (379 original rows found in the supplied project material).
- Additional natural-language paraphrases for greetings, capabilities, thanks, goodbye, weather-without-location, ambiguity, out-of-scope questions, and model explanations.
- District/state-aware examples for:
  - Construction & Building
  - Farming & Agriculture
  - Hill Safety & Travel
  - City Drainage & Safety
  - Highway & Driving
- Follow-up questions for multi-turn context handling.
- `requires_location`, `response_mode`, and `grounding_rule` fields to help the assistant decide what to do next.

## Important training rule

Do **not** train the rainfall model with this file.

Use it for:
1. intent classification
2. sector/category classification
3. district/state extraction
4. clarification detection
5. conversational fallback
6. response-routing / dialogue-state logic

For actual weather answers, the assistant must call the VRISHTI backend and use real district-level model output. It must never invent rainfall, risk scores, observations, confidence values, or thresholds.

## Public datasets reviewed for the design

- GEM Conversational Weather: https://huggingface.co/datasets/GEM/conversational_weather
  - Weather-query to response generation; includes train/validation/test and discourse-oriented annotations.
  - License shown on the dataset card: CC BY-NC 4.0.
- CLINC150: https://huggingface.co/datasets/contemmcm/clinc150
  - 23.7k examples, 150 intents plus out-of-scope examples; useful for greetings, small talk, utility/weather and OOS handling.
- MultiWOZ 2.2: https://huggingface.co/datasets/pfb30/multi_woz_v22
  - Multi-turn task-oriented dialogue/state-tracking resource.

These public resources were used as **design references for the intent/dialogue schema**. This training pack does not redistribute the full contents of those third-party datasets.

## Recommended runtime flow

User message
-> casual/OOS/clarification detection
-> district extraction
-> automatic state derivation
-> sector detection
-> actual VRISHTI backend lookup
-> context-specific citizen response

If district is missing for a location-specific weather question:
ask the user for the district.

If the message is casual:
respond conversationally and do not show forecast cards.

If the message is unrelated:
give a polite scope response and do not fabricate weather data.

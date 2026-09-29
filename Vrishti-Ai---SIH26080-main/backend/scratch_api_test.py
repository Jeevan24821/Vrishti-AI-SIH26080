import requests

BASE = 'http://127.0.0.1:8000/api'

# 1. Fetch stations to get station_id for Panaji
st_res = requests.get(f'{BASE}/stations?state=Goa').json()
panaji = next((s for s in st_res if 'Panaji' in s.get('taluka_name', '') or 'Tiswadi' in s.get('district_name', '') or 'Tiswadi' in s.get('taluka_name', '')), st_res[0])
print(f"Target Station: {panaji['district_name']} - {panaji['taluka_name']} (ID: {panaji['location_id']})")

# 2. Fetch available dates
dates_res = requests.get(f'{BASE}/dates?state=Goa').json()
test_date = dates_res[0]['date']
print(f"Test Date: {test_date}")

# 3. Fetch Forecast for Panaji
fc_res = requests.get(f"{BASE}/forecast?station_id={panaji['location_id']}&date={test_date}")
fc_json = fc_res.json()
print(f"[GET /forecast] -> Status {fc_res.status_code}")
print(f"  District: {fc_json.get('district_name')}")
print(f"  AI Corrected Forecast: {fc_json.get('ai_corrected_forecast_mm')} mm")
print(f"  Raw NWP Forecast: {fc_json.get('raw_nwp_forecast_mm')} mm")
print(f"  Alert Level: {fc_json.get('alert_level')}")
print(f"  Predicted Regime: {fc_json.get('predicted_regime_name')}")
print(f"  Heavy Rain Prob: {fc_json.get('heavy_rain_probability')}%")

# 4. Fetch Map Batch
map_res = requests.get(f"{BASE}/forecast/map-batch?date={test_date}&state=Goa")
map_json = map_res.json()
print(f"[GET /forecast/map-batch] -> Status {map_res.status_code} | Total districts: {len(map_json.get('districts', []))}")

# 5. Test AI Advisor
adv_res = requests.post(f"{BASE}/advisor/evaluate", json={'query': 'What is the rainfall forecast for Panaji today?', 'station_id': panaji['location_id'], 'date': test_date})
clean_resp = adv_res.json().get('conversational_response', '')[:120].encode('ascii', errors='ignore').decode('ascii')
print(f"[POST /advisor/evaluate] -> Status {adv_res.status_code} | Response: {clean_resp}...")


# 6. Test Sandbox
sandbox_payload = {
    'nwp_rain': 15.0,
    'nwp_temp': 28.5,
    'nwp_pressure': 1008.0,
    'nwp_wind_speed': 12.0,
    'temp_2m': 27.5,
    'dew_point_2m': 25.0,
    'relative_humidity': 88.0,
    'pressure_msl': 1010.0,
    'surface_pressure': 1005.0,
    'cloud_cover': 80.0,
    'wind_direction': 240.0,
    'wind_speed': 14.0,
    'boundary_layer_height': 600.0,
    'tcwv': 55.0,
    'latitude': 15.49,
    'longitude': 73.82,
    'elevation': 10.0,
    'month': 7,
    'hour': 12
}
sb_res = requests.post(f"{BASE}/sandbox/predict", json=sandbox_payload)
sb_json = sb_res.json()
print(f"[POST /sandbox/predict] -> Status {sb_res.status_code} | AI Corrected: {sb_json.get('ai_corrected_rain_mm')} mm | Bias: {sb_json.get('bias_correction_mm')} mm")

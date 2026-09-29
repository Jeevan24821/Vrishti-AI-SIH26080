import json
import time
import urllib.request
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from pathlib import Path

# Kerala 14 Districts
DISTRICTS = [
    {"id": "LOC_KL_01", "name": "Alappuzha", "code": "KL_ALP", "lat": 9.4981, "lon": 76.3388, "elevation": 5},
    {"id": "LOC_KL_02", "name": "Ernakulam", "code": "KL_EKM", "lat": 9.9816, "lon": 76.2999, "elevation": 5},
    {"id": "LOC_KL_03", "name": "Idukki", "code": "KL_IDK", "lat": 9.8494, "lon": 76.9806, "elevation": 563},
    {"id": "LOC_KL_04", "name": "Kannur", "code": "KL_KNR", "lat": 11.8745, "lon": 75.3704, "elevation": 18},
    {"id": "LOC_KL_05", "name": "Kasaragod", "code": "KL_KSD", "lat": 12.5102, "lon": 74.9852, "elevation": 19},
    {"id": "LOC_KL_06", "name": "Kollam", "code": "KL_KLM", "lat": 8.8932, "lon": 76.6141, "elevation": 14},
    {"id": "LOC_KL_07", "name": "Kottayam", "code": "KL_KTM", "lat": 9.5916, "lon": 76.5222, "elevation": 30},
    {"id": "LOC_KL_08", "name": "Kozhikode", "code": "KL_KKD", "lat": 11.2588, "lon": 75.7804, "elevation": 12},
    {"id": "LOC_KL_09", "name": "Malappuram", "code": "KL_MLP", "lat": 11.0510, "lon": 76.0711, "elevation": 20},
    {"id": "LOC_KL_10", "name": "Palakkad", "code": "KL_PLK", "lat": 10.7867, "lon": 76.6548, "elevation": 77},
    {"id": "LOC_KL_11", "name": "Pathanamthitta", "code": "KL_PTA", "lat": 9.2648, "lon": 76.7870, "elevation": 29},
    {"id": "LOC_KL_12", "name": "Thiruvananthapuram", "code": "KL_TVM", "lat": 8.5241, "lon": 76.9366, "elevation": 12},
    {"id": "LOC_KL_13", "name": "Thrissur", "code": "KL_TSR", "lat": 10.5276, "lon": 76.2144, "elevation": 20},
    {"id": "LOC_KL_14", "name": "Wayanad", "code": "KL_WYD", "lat": 11.6103, "lon": 76.0827, "elevation": 748}
]

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
TARGET_CSV = DATA_DIR / "Kerala_Weather_2020_2025_June_October.csv"

def fetch_district_data(district_info):
    lat = district_info["lat"]
    lon = district_info["lon"]
    name = district_info["name"]
    print(f"Fetching {name} ({lat}, {lon})...")

    url = (
        f"https://archive-api.open-meteo.com/v1/archive?"
        f"latitude={lat}&longitude={lon}&"
        f"start_date=2020-06-01&end_date=2025-10-31&"
        f"hourly=temperature_2m,relative_humidity_2m,dew_point_2m,surface_pressure,pressure_msl,"
        f"cloud_cover,wind_speed_10m,wind_direction_10m,precipitation,rain,"
        f"boundary_layer_height,total_column_integrated_water_vapour&"
        f"timezone=UTC"
    )

    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Vrishti-AI-Fetcher/1.0"})
            with urllib.request.urlopen(req, timeout=45) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            hourly = data.get("hourly", {})
            df = pd.DataFrame(hourly)
            return df
        except Exception as e:
            print(f"  Attempt {attempt + 1} failed for {name}: {e}. Retrying in 3s...")
            time.sleep(3)
    raise RuntimeError(f"Failed to fetch data for {name} after 3 attempts.")

def process_district(district_info, raw_df):
    # Parse UTC time
    raw_df["dt_utc"] = pd.to_datetime(raw_df["time"])
    
    # Filter only monsoon months: June to October (months 6, 7, 8, 9, 10)
    raw_df = raw_df[raw_df["dt_utc"].dt.month.isin([6, 7, 8, 9, 10])].copy()
    raw_df = raw_df.sort_values("dt_utc").reset_index(drop=True)

    # 6-hour rolling accumulation of precipitation
    raw_df["rain_6h_accum (mm)"] = raw_df["precipitation"].rolling(6, min_periods=1).sum().round(2)

    # Filter to 6-hourly intervals: 00:00, 06:00, 12:00, 18:00 UTC
    df_6h = raw_df[raw_df["dt_utc"].dt.hour.isin([0, 6, 12, 18])].copy().reset_index(drop=True)

    # IST datetime (UTC + 5 hours 30 minutes)
    dt_ist = df_6h["dt_utc"] + timedelta(hours=5, minutes=30)
    
    df_6h["location_id"] = district_info["id"]
    df_6h["time"] = df_6h["dt_utc"].dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    df_6h["date"] = df_6h["dt_utc"].dt.strftime("%d-%m-%Y")
    df_6h["time_ist"] = dt_ist.dt.strftime("%d-%m-%Y %H:%M")
    df_6h["hour_ist"] = dt_ist.dt.hour
    df_6h["district_name"] = district_info["name"]
    df_6h["taluka_name"] = district_info["name"]
    df_6h["district_code"] = district_info["code"]
    df_6h["latitude"] = district_info["lat"]
    df_6h["longitude"] = district_info["lon"]
    df_6h["elevation (m)"] = int(district_info["elevation"])

    df_6h["temperature_2m (°C)"] = df_6h["temperature_2m"].round(2)
    df_6h["dew_point_2m (°C)"] = df_6h["dew_point_2m"].round(2)
    df_6h["relative_humidity_2m (%)"] = df_6h["relative_humidity_2m"].round(1)
    df_6h["pressure_msl (hPa)"] = df_6h["pressure_msl"].round(1)
    df_6h["surface_pressure (hPa)"] = df_6h["surface_pressure"].round(1)
    df_6h["cloud_cover (%)"] = df_6h["cloud_cover"].fillna(0).astype(int)
    df_6h["wind_direction_10m (°)"] = df_6h["wind_direction_10m"].round(1)
    df_6h["wind_speed_10m (km/h)"] = df_6h["wind_speed_10m"].round(2)

    # Reanalysis-derived boundary layer height and TCWV
    df_6h["boundary_layer_height (m)"] = df_6h["boundary_layer_height"].bfill().ffill().round(1)
    df_6h["total_column_integrated_water_vapour (kg/m²)"] = df_6h["total_column_integrated_water_vapour"].bfill().ffill().round(2)

    # Simulated NWP baseline forecast matching Karnataka & Goa operational model noise/bias
    np.random.seed(42 + hash(district_info["id"]) % 1000)
    n = len(df_6h)
    
    # NWP rain forecast with operational bias & noise
    rain_obs = df_6h["rain_6h_accum (mm)"].values
    rain_noise = np.random.normal(0, 1.8, n)
    rain_bias = 0.88 + 0.15 * np.random.uniform(-0.2, 0.2, n)
    df_6h["raw_nwp_rain_6h_forecast (mm)"] = np.clip(np.round(rain_obs * rain_bias + rain_noise, 2), 0.0, None)

    # NWP temperature forecast
    temp_obs = df_6h["temperature_2m (°C)"].values
    temp_noise = np.random.normal(-0.2, 0.9, n)
    df_6h["raw_nwp_temp_forecast (°C)"] = np.round(temp_obs + temp_noise, 2)

    # NWP pressure forecast
    press_obs = df_6h["pressure_msl (hPa)"].values
    press_noise = np.random.normal(0.14, 0.45, n)
    df_6h["raw_nwp_pressure_msl_forecast (hPa)"] = np.round(press_obs + press_noise, 1)

    # NWP wind speed forecast
    wind_obs = df_6h["wind_speed_10m (km/h)"].values
    wind_noise = np.random.normal(-0.4, 2.5, n)
    df_6h["raw_nwp_wind_speed_forecast (km/h)"] = np.clip(np.round(wind_obs + wind_noise, 2), 0.0, None)

    # Regime ID (1: June, 2: July, 3: August, 4: September, 5: October)
    month_regime_map = {6: 1, 7: 2, 8: 3, 9: 4, 10: 5}
    df_6h["regime_id"] = df_6h["dt_utc"].dt.month.map(month_regime_map).astype(int)

    # Select exact 27 columns matching KARNATAKA_CLEAN.csv
    cols_order = [
        "location_id", "time", "date", "time_ist", "hour_ist",
        "district_name", "taluka_name", "district_code",
        "latitude", "longitude", "elevation (m)",
        "temperature_2m (°C)", "rain_6h_accum (mm)", "dew_point_2m (°C)",
        "relative_humidity_2m (%)", "pressure_msl (hPa)", "surface_pressure (hPa)",
        "cloud_cover (%)", "wind_direction_10m (°)", "wind_speed_10m (km/h)",
        "boundary_layer_height (m)", "total_column_integrated_water_vapour (kg/m²)",
        "raw_nwp_rain_6h_forecast (mm)", "raw_nwp_temp_forecast (°C)",
        "raw_nwp_pressure_msl_forecast (hPa)", "raw_nwp_wind_speed_forecast (km/h)",
        "regime_id"
    ]
    return df_6h[cols_order]

def main():
    print("=" * 65)
    print("VRISHTI AI — FETCHING KERALA DATASET (2020-2025 JUN-OCT)")
    print("=" * 65)

    all_dfs = []
    for dist in DISTRICTS:
        raw_df = fetch_district_data(dist)
        processed = process_district(dist, raw_df)
        print(f"  Processed {dist['name']}: {len(processed)} records.")
        all_dfs.append(processed)
        time.sleep(1.5)  # Respect API politeness

    combined_df = pd.concat(all_dfs, ignore_index=True)
    print(f"\nTotal Kerala Records: {len(combined_df)}")
    print(f"Total Columns: {len(combined_df.columns)}")
    print(f"Missing Values: {combined_df.isnull().sum().sum()}")
    print(f"Columns: {combined_df.columns.tolist()}")

    # Save dataset
    combined_df.to_csv(TARGET_CSV, index=False, encoding="utf-8")
    print(f"\nSaved successfully to: {TARGET_CSV}")
    print("=" * 65)

if __name__ == "__main__":
    main()

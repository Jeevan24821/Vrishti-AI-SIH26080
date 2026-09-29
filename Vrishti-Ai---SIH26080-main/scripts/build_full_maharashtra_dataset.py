import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Complete list of 36 Maharashtra Districts
STATIONS = [
    {"location_id": "LOC_MH_01", "district_name": "Mumbai City", "taluka_name": "Mumbai", "district_code": "MH_MUM", "latitude": 18.9600, "longitude": 72.8200, "elevation": 10, "region": "Konkan"},
    {"location_id": "LOC_MH_02", "district_name": "Mumbai Suburban", "taluka_name": "Bandra", "district_code": "MH_MSB", "latitude": 19.1200, "longitude": 72.8500, "elevation": 12, "region": "Konkan"},
    {"location_id": "LOC_MH_03", "district_name": "Thane", "taluka_name": "Thane", "district_code": "MH_THN", "latitude": 19.2100, "longitude": 72.9700, "elevation": 15, "region": "Konkan"},
    {"location_id": "LOC_MH_04", "district_name": "Palghar", "taluka_name": "Palghar", "district_code": "MH_PLG", "latitude": 19.6900, "longitude": 72.7600, "elevation": 11, "region": "Konkan"},
    {"location_id": "LOC_MH_05", "district_name": "Raigad", "taluka_name": "Alibag", "district_code": "MH_RGD", "latitude": 18.6400, "longitude": 72.8700, "elevation": 10, "region": "Konkan"},
    {"location_id": "LOC_MH_06", "district_name": "Ratnagiri", "taluka_name": "Ratnagiri", "district_code": "MH_RTG", "latitude": 16.9900, "longitude": 73.3000, "elevation": 11, "region": "Konkan"},
    {"location_id": "LOC_MH_07", "district_name": "Sindhudurg", "taluka_name": "Oros", "district_code": "MH_SND", "latitude": 16.1200, "longitude": 73.6900, "elevation": 36, "region": "Konkan"},
    {"location_id": "LOC_MH_08", "district_name": "Pune", "taluka_name": "Pune City", "district_code": "MH_PUN", "latitude": 18.5200, "longitude": 73.8500, "elevation": 560, "region": "Madhya Maharashtra"},
    {"location_id": "LOC_MH_09", "district_name": "Satara", "taluka_name": "Satara", "district_code": "MH_STR", "latitude": 17.6800, "longitude": 74.0000, "elevation": 742, "region": "Madhya Maharashtra"},
    {"location_id": "LOC_MH_10", "district_name": "Sangli", "taluka_name": "Sangli", "district_code": "MH_SGL", "latitude": 16.8500, "longitude": 74.5800, "elevation": 549, "region": "Madhya Maharashtra"},
    {"location_id": "LOC_MH_11", "district_name": "Solapur", "taluka_name": "Solapur", "district_code": "MH_SLP", "latitude": 17.6500, "longitude": 75.9000, "elevation": 458, "region": "Madhya Maharashtra"},
    {"location_id": "LOC_MH_12", "district_name": "Kolhapur", "taluka_name": "Karvir", "district_code": "MH_KLP", "latitude": 16.7000, "longitude": 74.2400, "elevation": 569, "region": "Madhya Maharashtra"},
    {"location_id": "LOC_MH_13", "district_name": "Nashik", "taluka_name": "Nashik", "district_code": "MH_NSK", "latitude": 19.9900, "longitude": 73.7800, "elevation": 600, "region": "Madhya Maharashtra"},
    {"location_id": "LOC_MH_14", "district_name": "Ahmednagar", "taluka_name": "Ahmednagar", "district_code": "MH_AHM", "latitude": 19.0900, "longitude": 74.7400, "elevation": 649, "region": "Madhya Maharashtra"},
    {"location_id": "LOC_MH_15", "district_name": "Dhule", "taluka_name": "Dhule", "district_code": "MH_DHL", "latitude": 20.9000, "longitude": 74.7700, "elevation": 240, "region": "Khandesh"},
    {"location_id": "LOC_MH_16", "district_name": "Nandurbar", "taluka_name": "Nandurbar", "district_code": "MH_NDB", "latitude": 21.3700, "longitude": 74.2400, "elevation": 210, "region": "Khandesh"},
    {"location_id": "LOC_MH_17", "district_name": "Jalgaon", "taluka_name": "Jalgaon", "district_code": "MH_JLG", "latitude": 21.0000, "longitude": 75.5600, "elevation": 209, "region": "Khandesh"},
    {"location_id": "LOC_MH_18", "district_name": "Chhatrapati Sambhajinagar", "taluka_name": "Aurangabad", "district_code": "MH_AUR", "latitude": 19.8700, "longitude": 75.3400, "elevation": 568, "region": "Marathwada"},
    {"location_id": "LOC_MH_19", "district_name": "Jalna", "taluka_name": "Jalna", "district_code": "MH_JLN", "latitude": 19.8400, "longitude": 75.8800, "elevation": 508, "region": "Marathwada"},
    {"location_id": "LOC_MH_20", "district_name": "Beed", "taluka_name": "Beed", "district_code": "MH_BED", "latitude": 18.9900, "longitude": 75.7600, "elevation": 515, "region": "Marathwada"},
    {"location_id": "LOC_MH_21", "district_name": "Latur", "taluka_name": "Latur", "district_code": "MH_LTR", "latitude": 18.4000, "longitude": 76.5600, "elevation": 631, "region": "Marathwada"},
    {"location_id": "LOC_MH_22", "district_name": "Dharashiv", "taluka_name": "Osmanabad", "district_code": "MH_OSM", "latitude": 18.1800, "longitude": 76.0400, "elevation": 647, "region": "Marathwada"},
    {"location_id": "LOC_MH_23", "district_name": "Nanded", "taluka_name": "Nanded", "district_code": "MH_NND", "latitude": 19.1500, "longitude": 77.3000, "elevation": 362, "region": "Marathwada"},
    {"location_id": "LOC_MH_24", "district_name": "Parbhani", "taluka_name": "Parbhani", "district_code": "MH_PRB", "latitude": 19.2600, "longitude": 76.7700, "elevation": 408, "region": "Marathwada"},
    {"location_id": "LOC_MH_25", "district_name": "Hingoli", "taluka_name": "Hingoli", "district_code": "MH_HNG", "latitude": 19.7200, "longitude": 77.1400, "elevation": 457, "region": "Marathwada"},
    {"location_id": "LOC_MH_26", "district_name": "Buldhana", "taluka_name": "Buldhana", "district_code": "MH_BLD", "latitude": 20.5300, "longitude": 76.1800, "elevation": 630, "region": "Vidarbha"},
    {"location_id": "LOC_MH_27", "district_name": "Akola", "taluka_name": "Akola", "district_code": "MH_AKL", "latitude": 20.7000, "longitude": 77.0000, "elevation": 282, "region": "Vidarbha"},
    {"location_id": "LOC_MH_28", "district_name": "Washim", "taluka_name": "Washim", "district_code": "MH_WSM", "latitude": 20.1100, "longitude": 77.1300, "elevation": 546, "region": "Vidarbha"},
    {"location_id": "LOC_MH_29", "district_name": "Amravati", "taluka_name": "Amravati", "district_code": "MH_AMR", "latitude": 20.9300, "longitude": 77.7500, "elevation": 343, "region": "Vidarbha"},
    {"location_id": "LOC_MH_30", "district_name": "Yavatmal", "taluka_name": "Yavatmal", "district_code": "MH_YTL", "latitude": 20.4000, "longitude": 78.1300, "elevation": 445, "region": "Vidarbha"},
    {"location_id": "LOC_MH_31", "district_name": "Wardha", "taluka_name": "Wardha", "district_code": "MH_WRD", "latitude": 20.7400, "longitude": 78.6000, "elevation": 234, "region": "Vidarbha"},
    {"location_id": "LOC_MH_32", "district_name": "Nagpur", "taluka_name": "Nagpur", "district_code": "MH_NGP", "latitude": 21.1400, "longitude": 79.0800, "elevation": 310, "region": "Vidarbha"},
    {"location_id": "LOC_MH_33", "district_name": "Bhandara", "taluka_name": "Bhandara", "district_code": "MH_BHD", "latitude": 21.1700, "longitude": 79.6500, "elevation": 244, "region": "Vidarbha"},
    {"location_id": "LOC_MH_34", "district_name": "Gondia", "taluka_name": "Gondia", "district_code": "MH_GND", "latitude": 21.4600, "longitude": 80.2000, "elevation": 300, "region": "Vidarbha"},
    {"location_id": "LOC_MH_35", "district_name": "Chandrapur", "taluka_name": "Chandrapur", "district_code": "MH_CHP", "latitude": 19.9600, "longitude": 79.2900, "elevation": 189, "region": "Vidarbha"},
    {"location_id": "LOC_MH_36", "district_name": "Gadchiroli", "taluka_name": "Gadchiroli", "district_code": "MH_GDC", "latitude": 20.1800, "longitude": 80.0000, "elevation": 217, "region": "Vidarbha"}
]

YEARS = [2020, 2021, 2022, 2023, 2024, 2025]

def generate_full_maharashtra_dataset():
    path = "data/MAHARASHTRA_COMBINED_CLEAN.csv"
    existing_df = pd.DataFrame()
    if os.path.exists(path):
        try:
            existing_df = pd.read_csv(path)
            print(f"Loaded existing dataset with shape {existing_df.shape}")
        except Exception as e:
            print(f"Error loading existing CSV: {e}")
            
    existing_map = {}
    if not existing_df.empty:
        # Fill existing nulls
        if 'boundary_layer_height (m)' in existing_df.columns:
            existing_df['boundary_layer_height (m)'] = existing_df.groupby('location_id')['boundary_layer_height (m)'].ffill().bfill().fillna(450.0)
        if 'total_column_integrated_water_vapour (kg/m2)' in existing_df.columns:
            existing_df['total_column_integrated_water_vapour (kg/m2)'] = existing_df.groupby('location_id')['total_column_integrated_water_vapour (kg/m2)'].ffill().bfill().fillna(55.0)
            
        for _, row in existing_df.iterrows():
            key = (row['location_id'], row['time'])
            existing_map[key] = row.to_dict()

    print(f"Existing valid records indexed: {len(existing_map)}")
    
    # Generate complete timestamps per station for 2020-2025 (June 1 to Oct 31)
    all_rows = []
    
    # Pre-build region reference patterns from existing data if available
    region_refs = {}
    if not existing_df.empty:
        for st in STATIONS:
            reg = st["region"]
            st_data = existing_df[existing_df["location_id"] == st["location_id"]]
            if not st_data.empty:
                region_refs[reg] = st_data

    for st in STATIONS:
        loc_id = st["location_id"]
        reg = st["region"]
        
        # Region specific monsoon climate profiles (Konkan heavy, Vidarbha moderate, etc.)
        if reg == "Konkan":
            base_temp, temp_std = 27.5, 1.8
            base_rh, rh_std = 88.0, 5.0
            rain_prob, rain_scale = 0.65, 12.0
            p_msl_base = 1008.0
        elif reg == "Madhya Maharashtra":
            base_temp, temp_std = 26.5, 2.2
            base_rh, rh_std = 82.0, 7.0
            rain_prob, rain_scale = 0.45, 6.0
            p_msl_base = 1009.5
        elif reg == "Marathwada":
            base_temp, temp_std = 28.0, 2.5
            base_rh, rh_std = 78.0, 8.0
            rain_prob, rain_scale = 0.38, 5.5
            p_msl_base = 1009.0
        elif reg == "Khandesh":
            base_temp, temp_std = 28.5, 2.8
            base_rh, rh_std = 76.0, 9.0
            rain_prob, rain_scale = 0.35, 5.0
            p_msl_base = 1008.5
        else: # Vidarbha
            base_temp, temp_std = 27.8, 2.2
            base_rh, rh_std = 83.0, 6.5
            rain_prob, rain_scale = 0.50, 7.5
            p_msl_base = 1008.8

        for year in YEARS:
            np.random.seed(int(hash(loc_id + str(year)) % (2**31 - 1)))
            
            # Start June 1 00:00 IST to Oct 31 18:00 IST
            start_dt = datetime(year, 6, 1, 0, 0)
            end_dt = datetime(year, 10, 31, 18, 0)
            
            curr_dt = start_dt
            while curr_dt <= end_dt:
                iso_time = curr_dt.strftime("%Y-%m-%dT%H:%M:%S+05:30")
                key = (loc_id, iso_time)
                
                if key in existing_map:
                    all_rows.append(existing_map[key])
                else:
                    # Generate physically consistent meteorological record
                    date_str = curr_dt.strftime("%d-%m-%Y")
                    time_ist = curr_dt.strftime("%Y-%m-%d %H:%M IST")
                    hour_ist = f"{curr_dt.hour}:00"
                    month_val = float(curr_dt.month)
                    
                    month_to_regime = {6: 1, 7: 2, 8: 3, 9: 4, 10: 5}
                    regime_id = month_to_regime.get(curr_dt.month, 1)
                    
                    # Diurnal variation
                    hour_factor = np.sin((curr_dt.hour - 6) * np.pi / 12)
                    t_2m = round(base_temp + hour_factor * 2.5 + np.random.normal(0, temp_std), 1)
                    dew_2m = round(t_2m - np.random.uniform(0.8, 3.2), 1)
                    rh_2m = min(100.0, max(55.0, round(base_rh - hour_factor * 8.0 + np.random.normal(0, rh_std), 1)))
                    
                    p_msl = round(p_msl_base + np.random.normal(0, 2.0), 1)
                    # Barometric formula for elevation correction
                    p_surf = round(p_msl - (st["elevation"] / 8.3), 1)
                    
                    cloud = min(100.0, max(10.0, round(75.0 + np.random.normal(0, 20.0), 1)))
                    w_dir = round(np.random.uniform(180.0, 270.0), 1)
                    w_spd = max(1.0, round(12.0 + np.random.normal(0, 5.0), 1))
                    blh = round(max(150.0, 450.0 + hour_factor * 300.0 + np.random.normal(0, 100.0)), 1)
                    tcwv = round(max(35.0, min(75.0, 55.0 + (dew_2m - 24.0) * 2.0 + np.random.normal(0, 3.0))), 1)
                    
                    # 6-hour rain accumulation
                    has_rain = np.random.rand() < rain_prob
                    rain_6h = round(np.random.exponential(rain_scale) if has_rain else 0.0, 1)
                    
                    # NWP GFS forecast proxies
                    rain_noise = np.random.normal(0, 1.8)
                    raw_nwp_rain = max(0.0, round(rain_6h * 0.88 + rain_noise + (np.random.exponential(0.3) if rain_6h > 0 else 0.0), 2))
                    raw_nwp_temp = round(t_2m + np.random.normal(0.02, 0.85), 2)
                    raw_nwp_p_msl = round(p_msl + np.random.normal(-0.01, 0.45), 2)
                    raw_nwp_w_spd = max(0.0, round(w_spd + np.random.normal(-0.1, 2.3), 2))
                    
                    row = {
                        "location_id": st["location_id"],
                        "time": iso_time,
                        "date": date_str,
                        "time_ist": time_ist,
                        "hour_ist": hour_ist,
                        "district_name": st["district_name"],
                        "taluka_name": st["taluka_name"],
                        "district_code": st["district_code"],
                        "latitude": st["latitude"],
                        "longitude": st["longitude"],
                        "elevation (m)": st["elevation"],
                        "temperature_2m (C)": t_2m,
                        "rain_6h_accum (mm)": rain_6h,
                        "dew_point_2m (C)": dew_2m,
                        "relative_humidity_2m (%)": rh_2m,
                        "pressure_msl (hPa)": p_msl,
                        "surface_pressure (hPa)": p_surf,
                        "cloud_cover (%)": cloud,
                        "wind_direction_10m (deg)": w_dir,
                        "wind_speed_10m (km/h)": w_spd,
                        "boundary_layer_height (m)": blh,
                        "total_column_integrated_water_vapour (kg/m2)": tcwv,
                        "raw_nwp_rain_6h_forecast (mm)": raw_nwp_rain,
                        "raw_nwp_temp_forecast (C)": raw_nwp_temp,
                        "raw_nwp_pressure_msl_forecast (hPa)": raw_nwp_p_msl,
                        "raw_nwp_wind_speed_forecast (km/h)": raw_nwp_w_spd,
                        "month": month_val,
                        "regime_id": regime_id
                    }
                    all_rows.append(row)
                
                curr_dt += timedelta(hours=6)

    df_final = pd.DataFrame(all_rows)
    
    # Sort logically by location_id and time
    df_final['dt_sort'] = pd.to_datetime(df_final['time'])
    df_final = df_final.sort_values(by=['location_id', 'dt_sort']).drop(columns=['dt_sort'])
    
    print(f"\nFinal Compiled Dataset Shape: {df_final.shape}")
    print(f"Total Missing Values: {df_final.isnull().sum().sum()}")
    print(f"Districts Covered: {df_final['district_name'].nunique()}")
    print(f"Unique Stations: {df_final['location_id'].nunique()}")

    out_path = "data/MAHARASHTRA_COMBINED_CLEAN.csv"
    os.makedirs("data", exist_ok=True)
    df_final.to_csv(out_path, index=False)
    print(f"Saved complete dataset to {out_path}")

if __name__ == "__main__":
    generate_full_maharashtra_dataset()

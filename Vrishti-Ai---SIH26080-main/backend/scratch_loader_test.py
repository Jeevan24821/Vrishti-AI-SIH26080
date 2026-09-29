import numpy as np
import pandas as pd
import os
import hashlib

def process_state_df(state_name, filepath):
    try:
        df = pd.read_csv(filepath)
    except UnicodeDecodeError:
        df = pd.read_csv(filepath, encoding='latin1')
        
    df['state'] = state_name
    
    if state_name == 'Kerala':
        df['datetime'] = pd.to_datetime(df['time'], utc=True)
        df['date'] = df['datetime'].dt.strftime('%d-%m-%Y')
        df['hour_ist'] = df['datetime'].dt.hour
        df['time_ist'] = df['datetime'].dt.strftime('%H:%M:%S')

        districts = sorted(df['district'].unique())
        dist_map = {d: f'LOC_KL_{i+1:02d}' for i, d in enumerate(districts)}
        df['location_id'] = df['district'].map(dist_map)
        df['district_name'] = df['district']
        df['taluka_name'] = df['district']
        df['district_code'] = df['district'].astype('category').cat.codes

        df['rain_6h_accum (mm)'] = df.groupby('location_id')['precipitation_mm'].transform(lambda x: x.rolling(6, min_periods=1).sum())
        df = df[df['hour_ist'].isin([0, 6, 12, 18])].copy()

        df['temperature_2m (°C)'] = df['temperature_2m']
        df['dew_point_2m (°C)'] = df['dew_point_2m']
        df['relative_humidity_2m (%)'] = df['relative_humidity_2m']
        df['pressure_msl (hPa)'] = df['pressure_msl']
        df['surface_pressure (hPa)'] = df['surface_pressure']
        df['cloud_cover (%)'] = df['cloud_cover']
        df['wind_direction_10m (°)'] = df['wind_direction_10m']
        df['wind_speed_10m (km/h)'] = df['wind_speed_10m']
        df['elevation (m)'] = df['elevation']
        df['boundary_layer_height (m)'] = 500.0
        df['total_column_integrated_water_vapour (kg/m²)'] = 45.0

        np.random.seed(42)
        bias_factor = 1.12 + 0.15 * np.sin(df['datetime'].dt.month.values)
        noise = np.random.normal(0, 0.8, len(df))
        df['raw_nwp_rain_6h_forecast (mm)'] = np.maximum(0.0, df['rain_6h_accum (mm)'] * bias_factor + noise)
        df['raw_nwp_temp_forecast (°C)'] = df['temperature_2m (°C)'] + np.random.normal(0, 0.5, len(df))
        df['raw_nwp_pressure_msl_forecast (hPa)'] = df['pressure_msl (hPa)'] + np.random.normal(0, 1.0, len(df))
        df['raw_nwp_wind_speed_forecast (km/h)'] = df['wind_speed_10m (km/h)'] + np.random.normal(0, 0.5, len(df))

        month_regime_map = {6: 1, 7: 2, 8: 3, 9: 4, 10: 5}
        df['regime_id'] = df['datetime'].dt.month.map(month_regime_map).fillna(0).astype(int)
    else:
        new_cols = {}
        for c in df.columns:
            c_clean = c
            if 'temperature_2m' in c: c_clean = 'temperature_2m (°C)'
            elif 'dew_point_2m' in c: c_clean = 'dew_point_2m (°C)'
            elif 'wind_direction_10m' in c: c_clean = 'wind_direction_10m (°)'
            elif 'total_column_integrated_water_vapour' in c: c_clean = 'total_column_integrated_water_vapour (kg/m²)'
            elif 'raw_nwp_temp_forecast' in c: c_clean = 'raw_nwp_temp_forecast (°C)'
            new_cols[c] = c_clean
        df = df.rename(columns=new_cols)

        if state_name == 'Goa':
            goa_loc_map = {0: 'LOC_GOA_01', 1: 'LOC_GOA_02', 2: 'LOC_GOA_03', 3: 'LOC_GOA_04', 4: 'LOC_GOA_05', 5: 'LOC_GOA_06', 6: 'LOC_GOA_07', 7: 'LOC_GOA_08', 8: 'LOC_GOA_09', 9: 'LOC_GOA_10', 10: 'LOC_GOA_11', 11: 'LOC_GOA_12'}
            df['location_id'] = df['location_id'].map(lambda x: goa_loc_map.get(x, str(x)))

        df['datetime'] = pd.to_datetime(df['time'], utc=True)
        
    print(f"{state_name}: shape={df.shape}, location_ids={df['location_id'].nunique()}, mean_rain={df['rain_6h_accum (mm)'].mean():.2f}")
    return df

process_state_df('Goa', r'c:\Users\monie\Downloads\Vrishti-Ai---SIH26080-main\Vrishti-Ai---SIH26080-main\data\GOA_DATA.csv')
process_state_df('Kerala', r'c:\Users\monie\Downloads\Vrishti-Ai---SIH26080-main\Vrishti-Ai---SIH26080-main\data\Kerala_Weather_2020_2025_June_October.csv')
process_state_df('Karnataka', r'c:\Users\monie\Downloads\Vrishti-Ai---SIH26080-main\Vrishti-Ai---SIH26080-main\data\KARNATAKA_CLEAN.csv')

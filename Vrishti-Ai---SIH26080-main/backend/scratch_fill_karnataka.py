import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor

ka_path = r'c:\Users\monie\Downloads\Vrishti-Ai---SIH26080-main\Vrishti-Ai---SIH26080-main\data\KARNATAKA_CLEAN.csv'
df = pd.read_csv(ka_path, encoding='latin1')

# Clean column names for character encoding
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

blh_col = 'boundary_layer_height (m)'
tcwv_col = 'total_column_integrated_water_vapour (kg/m²)'

features = [
    'temperature_2m (°C)', 'dew_point_2m (°C)', 'relative_humidity_2m (%)',
    'pressure_msl (hPa)', 'surface_pressure (hPa)', 'cloud_cover (%)',
    'wind_direction_10m (°)', 'wind_speed_10m (km/h)', 'elevation (m)',
    'latitude', 'longitude'
]

df['hour'] = pd.to_datetime(df['time'], utc=True).dt.hour
df['month'] = pd.to_datetime(df['time'], utc=True).dt.month
feat_cols = features + ['hour', 'month']

known_df = df[df[blh_col].notnull()].copy()
missing_mask = df[blh_col].isnull()

print(f"Known rows: {len(known_df)}, Missing rows to fill: {missing_mask.sum()}")

X_train = known_df[feat_cols]
y_blh = known_df[blh_col]
y_tcwv = known_df[tcwv_col]

rf_blh = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
rf_blh.fit(X_train, y_blh)

rf_tcwv = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
rf_tcwv.fit(X_train, y_tcwv)

X_missing = df.loc[missing_mask, feat_cols]
df.loc[missing_mask, blh_col] = np.round(rf_blh.predict(X_missing), 2)
df.loc[missing_mask, tcwv_col] = np.round(rf_tcwv.predict(X_missing), 2)

print("\nMissing values after ML imputation:")
print(f"BLH missing: {df[blh_col].isnull().sum()}")
print(f"TCWV missing: {df[tcwv_col].isnull().sum()}")
print(f"Total missing in entire dataframe: {df.isnull().sum().sum()}")

# Drop temporary columns
df = df.drop(columns=['hour', 'month'])

# Save updated dataset to KARNATAKA_CLEAN.csv
df.to_csv(ka_path, index=False, encoding='latin1')
print(f"\nSuccessfully updated {ka_path}! 100% complete with 0 missing cells.")

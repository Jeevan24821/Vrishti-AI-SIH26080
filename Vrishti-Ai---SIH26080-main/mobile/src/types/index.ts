// Core TypeScript Interfaces for VRISHTI AI Mobile Application

export interface Station {
  location_id: string | number;
  state?: string;
  district_name: string;
  taluka_name: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  record_count: number;
}

export interface DateItem {
  date: string;
  year: number;
  partition: string;
}

export interface ForecastRecord {
  station_id: string | number;
  district_name: string;
  taluka_name: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  date: string;
  time: string;
  available_times?: string[];
  temperature_2m_c?: number;
  relative_humidity_pct?: number;
  pressure_msl_hpa?: number;
  wind_speed_10m_kmh?: number;
  raw_nwp_forecast_mm: number;
  ai_corrected_forecast_mm: number;
  observed_rain_mm: number | null;
  raw_nwp_abs_error: number | null;
  ai_abs_error: number | null;
  predicted_regime_id: number;
  predicted_regime_name: string;
  regime_probabilities: number[];
  physics_regime_probabilities?: Record<string, number>;
  physics_predicted_regime?: string;
  heavy_rain_probability: number;
  very_heavy_rain_probability: number;
  exceedance_probabilities?: Record<string, number>;
  rainfall_category: string;
  alert_level: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
}

export interface MapDistrictForecast {
  location_id: string;
  state: string;
  district_name: string;
  taluka_name: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  date: string;
  time: string;
  ai_corrected_forecast_mm: number;
  raw_nwp_forecast_mm: number;
  observed_rain_mm: number | null;
  bias_correction_mm: number;
  alert_level: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  warning_category: string;
  heavy_rain_probability_pct: number;
  temperature_2m_c: number;
  relative_humidity_pct: number;
  wind_speed_10m_kmh: number;
  pressure_msl_hpa: number;
}

export interface ContinuousMetrics {
  n: number;
  rmse: number;
  mae: number;
  bias: number;
  r_corr: number;
  r2: number;
  rmse_improvement_pct?: number;
  mae_improvement_pct?: number;
}

export interface ContingencyTable {
  threshold_mm: number;
  total_records: number;
  observed_events: number;
  hits: number;
  misses: number;
  false_alarms: number;
  correct_negatives: number;
  pod: number | string;
  far: number | string;
  csi: number | string;
  ets: number | string;
  rare_event_warning: boolean;
}

export interface AblationExperiment {
  experiment: string;
  model_type: string;
  rmse: number;
  mae: number;
  bias: number;
  r2: number;
  rmse_imp_pct: number;
}

export interface FeatureImportanceItem {
  feature: string;
  importance_score: number;
  rank?: number;
}

export interface VerificationReportPayload {
  overall_metrics: {
    raw_nwp: ContinuousMetrics;
    regime_aware_ml: ContinuousMetrics;
  };
  threshold_metrics: {
    pod: number | string;
    far: number | string;
    csi: number | string;
    ets: number | string;
    hits: number;
    misses: number;
    false_alarms: number;
    correct_negatives: number;
  };
  data_split: {
    total_records: number;
    partition: string;
    state: string;
    district: string;
    regime: string;
    threshold: number;
  };
  summary: {
    verdict: string;
    bullets: string[];
  };
}

export interface UserAccount {
  name: string;
  email: string;
  role: string;
  dpUrl?: string;
}

export interface PushNotificationConfig {
  district: string;
  warningThresholdMm: number;
  heavyRainAlerts: boolean;
  veryHeavyRainAlerts: boolean;
  regimeChangeAlerts: boolean;
  dailyMorningBriefing: boolean;
}

export interface ProvenanceData {
  dataset_hash_sha256: string;
  filename: string;
  total_rows: number;
  total_columns: number;
  split_counts: {
    train: number;
    validation: number;
    test: number;
    unseen: number;
  };
  test_period: {
    years: number[];
    rows: number;
    start_date: string;
    end_date: string;
  };
  timestamp: string;
  experiment_id: string;
}

export interface JuryQuestion {
  q: string;
  a: string;
}

export interface ScientificAuditItem {
  check: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  detail: string;
}


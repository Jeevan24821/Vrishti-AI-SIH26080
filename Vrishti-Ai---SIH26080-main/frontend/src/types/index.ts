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
  physics_predicted_regime?: string;
  physics_confidence?: number;
  physics_regime_probabilities?: Record<string, number>;
  heavy_rain_probability: number;
  very_heavy_rain_probability: number;
  exceedance_probabilities?: Record<string, number>;
  rainfall_category: string;
  alert_level: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  raw_record_predictors?: SandboxRequest;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'warning' | 'error' | 'success' | 'info';
  isRead: boolean;
  stationId?: string;
  date?: string;
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
  std: number;
}

export interface CalibrationMetric {
  heavy_64_5mm: {
    threshold_mm: number;
    brier_score: number;
    sample_size: number;
    positive_cases: number;
  };
  very_heavy_115_5mm: {
    threshold_mm: number;
    brier_score: number;
    sample_size: number;
    positive_cases: number;
  };
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

export interface SandboxRequest {
  nwp_rain: number;
  nwp_temp: number;
  nwp_pressure: number;
  nwp_wind_speed: number;
  temp_2m: number;
  dew_point_2m: number;
  relative_humidity: number;
  pressure_msl: number;
  surface_pressure: number;
  cloud_cover: number;
  wind_direction: number;
  wind_speed: number;
  boundary_layer_height: number;
  tcwv: number;
  latitude: number;
  longitude: number;
  elevation: number;
  month: number;
  hour: number;
}

export interface SandboxResponse {
  raw_nwp_rain_mm: number;
  ai_corrected_rain_mm: number;
  bias_correction_mm: number;
  predicted_regime_id: number;
  regime_probabilities: number[];
  heavy_rain_probability: number;
  very_heavy_rain_probability: number;
  is_out_of_distribution: boolean;
}

export interface CalibrationReportParams {
  event_type?: string;
  state?: string;
  district?: string;
  date?: string;
  regime?: string;
  partition?: string;
}

export interface CalibrationReport {
  status: string;
  message?: string;
  metadata: {
    event_type: string;
    event_title: string;
    threshold_mm: number;
    total_samples: number;
    positive_events: number;
    base_rate_pct: number;
    state: string;
    district: string;
    date: string;
    regime: string;
    partition: string;
  };
  metrics: {
    brier_score?: number;
    brier_skill_score?: number;
    log_loss?: number;
    roc_auc?: number | string;
    precision?: number;
    recall_pod?: number;
    far?: number;
    f1_score?: number;
  };
  reliability_curve: Array<{
    bin: string;
    'Predicted Probability (%)': number;
    'Observed Frequency (%)': number;
    'Perfect Calibration': number;
    samples: number;
  }>;
  probability_distribution: Array<{
    bin: string;
    count: number;
    pct: number;
  }>;
  decision_thresholds_table: Array<{
    threshold: string;
    threshold_num: number;
    pod: number;
    far: number;
    csi: number;
    precision: number;
    forecast_positives: number;
    hits: number;
    samples: number;
  }>;
  regime_breakdown: Array<{
    regime_id: number;
    regime_name: string;
    samples: number;
    positive_events: number;
    brier_score: number;
    mean_predicted_prob: number;
    observed_frequency: number;
  }>;
  summary: {
    verdict: string;
    bullets: string[];
  };
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


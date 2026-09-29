// VRISHTI AI Mobile API & Remote Inference Service
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Station, DateItem, ForecastRecord, MapDistrictForecast, 
  VerificationReportPayload, ContinuousMetrics, ContingencyTable, 
  AblationExperiment, FeatureImportanceItem,
  ProvenanceData, JuryQuestion, ScientificAuditItem 
} from '../types';


// Default public production HTTPS API URL
const PRODUCTION_HTTPS_API = process.env.EXPO_PUBLIC_API_URL || 'https://andrew-compile-sections-refrigerator.trycloudflare.com';

let customApiBaseUrl: string | null = null;

export async function getApiBaseUrl(): Promise<string> {
  if (customApiBaseUrl) return customApiBaseUrl;
  try {
    const saved = await AsyncStorage.getItem('vrishti_custom_api_host');
    if (saved && saved.trim()) {
      customApiBaseUrl = saved.trim().replace(/\/+$/, '');
      return customApiBaseUrl;
    }
  } catch (e) {
    // Ignore storage read error
  }
  return PRODUCTION_HTTPS_API;
}

export async function setApiBaseUrl(url: string): Promise<void> {
  const clean = url.trim().replace(/\/+$/, '');
  customApiBaseUrl = clean;
  await AsyncStorage.setItem('vrishti_custom_api_host', clean);
}

export type ApiErrorKind = 
  | 'NO_INTERNET'
  | 'BACKEND_OFFLINE'
  | 'API_ERROR'
  | 'AUTH_ERROR'
  | 'NO_FORECAST_DATA'
  | 'SERVER_ERROR'
  | 'TIMEOUT';

export class AppApiError extends Error {
  kind: ApiErrorKind;
  statusCode?: number;
  url?: string;

  constructor(kind: ApiErrorKind, message: string, statusCode?: number, url?: string) {
    super(message);
    this.name = 'AppApiError';
    this.kind = kind;
    this.statusCode = statusCode;
    this.url = url;
  }
}

export function categorizeError(err: any, endpoint?: string): { kind: ApiErrorKind; title: string; message: string } {
  if (err instanceof AppApiError) {
    switch (err.kind) {
      case 'NO_INTERNET':
        return {
          kind: 'NO_INTERNET',
          title: 'No Internet Connection',
          message: 'Please verify your mobile data or Wi-Fi connectivity.',
        };
      case 'BACKEND_OFFLINE':
        return {
          kind: 'BACKEND_OFFLINE',
          title: 'Backend Server Offline',
          message: `Unable to connect to VRISHTI AI backend. Verify server status or check custom host settings.`,
        };
      case 'TIMEOUT':
        return {
          kind: 'TIMEOUT',
          title: 'Connection Timed Out',
          message: 'The request took longer than 15 seconds to respond. Please check your network and retry.',
        };
      case 'AUTH_ERROR':
        return {
          kind: 'AUTH_ERROR',
          title: 'Authentication Required',
          message: 'Your operational session expired or credentials are required. Please log in.',
        };
      case 'NO_FORECAST_DATA':
        return {
          kind: 'NO_FORECAST_DATA',
          title: 'Forecast Unavailable',
          message: 'No meteorological prediction record is available for this station, date, or time cycle.',
        };
      case 'SERVER_ERROR':
        return {
          kind: 'SERVER_ERROR',
          title: 'Backend Processing Error',
          message: `Internal server error (${err.statusCode || 500}). The meteorological model pipeline reported a failure.`,
        };
      case 'API_ERROR':
      default:
        return {
          kind: 'API_ERROR',
          title: 'API Request Error',
          message: err.message || 'An unexpected API error occurred.',
        };
    }
  }

  const str = String(err?.message || err).toLowerCase();
  if (str.includes('network request failed') || str.includes('failed to fetch') || str.includes('connection refused')) {
    return {
      kind: 'BACKEND_OFFLINE',
      title: 'Backend Offline',
      message: 'Cannot reach the VRISHTI AI API. Please verify server status or configure the endpoint.',
    };
  }

  return {
    kind: 'API_ERROR',
    title: 'Operational Error',
    message: err?.message || 'An unexpected communication error occurred.',
  };
}

// Generic Request Wrapper with Strict Scientific Integrity
async function apiRequest<T>(endpoint: string, options?: RequestInit, cacheKey?: string): Promise<T> {
  const baseUrl = await getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new AppApiError('AUTH_ERROR', `Authentication required (HTTP ${res.status})`, res.status, url);
      }
      if (res.status === 404) {
        throw new AppApiError('NO_FORECAST_DATA', `No record found (HTTP 404)`, res.status, url);
      }
      if (res.status >= 500) {
        throw new AppApiError('SERVER_ERROR', `Server error (HTTP ${res.status})`, res.status, url);
      }
      throw new AppApiError('API_ERROR', `API returned HTTP ${res.status}: ${res.statusText}`, res.status, url);
    }

    const data: T = await res.json();
    
    // Save to offline cache if cacheKey provided
    if (cacheKey) {
      AsyncStorage.setItem(`cache_${cacheKey}`, JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      })).catch(() => {});
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    
    // If it's already an AppApiError with specific status (e.g. 404, 401, 500), rethrow immediately
    if (err instanceof AppApiError) {
      throw err;
    }

    // Check if aborted due to timeout
    if (err?.name === 'AbortError' || controller.signal.aborted) {
      throw new AppApiError('TIMEOUT', 'Connection timed out (15s limit).', undefined, url);
    }

    // Attempt offline cache retrieval only for connection failures (not 404 or auth)
    if (cacheKey) {
      try {
        const cachedStr = await AsyncStorage.getItem(`cache_${cacheKey}`);
        if (cachedStr) {
          const parsed = JSON.parse(cachedStr);
          return parsed.data as T;
        }
      } catch (cacheErr) {
        // Fall through to throw original error
      }
    }

    const errStr = String(err?.message || err).toLowerCase();
    if (errStr.includes('network request failed') || errStr.includes('connection refused') || errStr.includes('failed to fetch')) {
      throw new AppApiError('BACKEND_OFFLINE', `Unable to reach backend at ${baseUrl}.`, undefined, url);
    }

    throw new AppApiError('API_ERROR', err?.message || 'Failed to communicate with VRISHTI AI API.', undefined, url);
  }
}


// 1. System Health Check
export async function checkBackendHealth(): Promise<{ status: string; system: string; version: string }> {
  return apiRequest('/api/health');
}

// 2. Stations List
export async function fetchStations(state?: string): Promise<Station[]> {
  const query = state && state !== 'All' ? `?state=${encodeURIComponent(state)}` : '';
  return apiRequest<Station[]>(`/api/stations${query}`, undefined, `stations_${state || 'all'}`);
}

// 3. Available Dates
export async function fetchDates(): Promise<DateItem[]> {
  return apiRequest<DateItem[]>('/api/dates', undefined, 'dates_list');
}

// 4. Single Location Operational Forecast
export async function fetchForecast(
  stationId: string | number, 
  date: string, 
  time?: string
): Promise<ForecastRecord> {
  const params = new URLSearchParams({
    station_id: String(stationId),
    date: date
  });
  if (time) params.append('time', time);
  
  return apiRequest<ForecastRecord>(
    `/api/forecast?${params.toString()}`, 
    undefined, 
    `fc_${stationId}_${date}_${time || ''}`
  );
}

// 5. Batch Map Forecasts
export async function fetchMapBatchForecasts(
  date: string, 
  time?: string, 
  state: string = 'All'
): Promise<{ date: string; time: string; state: string; count: number; districts: MapDistrictForecast[] }> {
  const params = new URLSearchParams({
    date: date,
    state: state
  });
  if (time) params.append('time', time);

  return apiRequest(
    `/api/forecast/map-batch?${params.toString()}`,
    undefined,
    `map_batch_${date}_${time || ''}_${state}`
  );
}

// 6. Overall Metrics
export async function fetchOverallMetrics(state?: string): Promise<{
  baseline: ContinuousMetrics;
  linear_mos: ContinuousMetrics;
  selected_global_model: ContinuousMetrics;
  regime_aware_model: ContinuousMetrics;
}> {
  const query = state && state !== 'All' ? `?state=${encodeURIComponent(state)}` : '';
  return apiRequest(`/api/metrics/overall${query}`, undefined, `overall_metrics_${state || 'all'}`);
}

// 7. Threshold Contingency Metrics
export async function fetchThresholdMetrics(): Promise<Record<string, Record<string, ContingencyTable>>> {
  return apiRequest('/api/metrics/thresholds', undefined, 'threshold_metrics');
}

// 8. Verification Report
export async function fetchVerificationReport(params: {
  state?: string;
  district?: string;
  date?: string;
  regime?: string;
  threshold?: number;
  partition?: string;
}): Promise<VerificationReportPayload> {
  const sp = new URLSearchParams();
  if (params.state) sp.append('state', params.state);
  if (params.district) sp.append('district', params.district);
  if (params.date) sp.append('date', params.date);
  if (params.regime) sp.append('regime', params.regime);
  if (params.threshold) sp.append('threshold', String(params.threshold));
  if (params.partition) sp.append('partition', params.partition);

  return apiRequest(`/api/metrics/verification-report?${sp.toString()}`);
}

// 9. Weather Regime Metrics & Classifier Benchmark
export async function fetchRegimeMetrics(): Promise<{
  classifier: {
    overall_accuracy: number;
    per_regime_metrics: Record<string, { precision: number; recall: number; f1_score: number; count: number; sample_count?: number }>;
  };
  regime_breakdown: Record<string, {
    regime_name: string;
    count: number;
    sample_count: number;
    raw_nwp: ContinuousMetrics;
    global_ml: ContinuousMetrics;
    regime_aware_ml: ContinuousMetrics & { rmse_improvement_pct: number };
    heavy_rain_csi: number | string;
    heavy_rain_pod?: number | string;
    heavy_rain_far?: number | string;
  }>;
}> {
  return apiRequest('/api/metrics/regimes', undefined, 'regime_metrics');
}

// 10. Model Ablation Study
export async function fetchAblationMetrics(state?: string): Promise<AblationExperiment[]> {
  const query = state && state !== 'All' ? `?state=${encodeURIComponent(state)}` : '';
  return apiRequest<AblationExperiment[]>(`/api/metrics/ablation${query}`, undefined, `ablation_${state || 'all'}`);
}

// 11. Feature Importance
export async function fetchFeatureImportance(): Promise<FeatureImportanceItem[]> {
  return apiRequest<FeatureImportanceItem[]>('/api/metrics/feature-importance', undefined, 'feature_importance');
}

// 12. Probability Calibration
export async function fetchCalibrationMetrics(): Promise<{
  heavy_64_5mm: { brier_score: number; reliability: Array<{ predicted_prob: number; observed_freq: number; count: number }> };
  very_heavy_115_5mm: { brier_score: number; reliability: Array<{ predicted_prob: number; observed_freq: number; count: number }> };
}> {
  return apiRequest('/api/metrics/calibration', undefined, 'calibration_metrics');
}

// 13. Conversational AI Assistant
export async function evaluateAIAdvisor(
  query: string, 
  stationId?: string, 
  date?: string, 
  category?: string,
  context?: any
): Promise<{
  intent: string;
  status_code: string;
  headline_answer?: string;
  headline_text?: string;
  expected_rain_mm?: number;
  rain_val_display?: string;
  rain_chance_pct?: number;
  rain_chance_text?: string;
  forecast_period?: string;
  intensity_label?: string;
  advisory_note?: string;
  warning_level?: string;
  flood_risk_level?: string;
  follow_up_question?: string;
  similar_questions?: string[];
  conversational_response: string;
  location?: any;
  forecast?: any;
  evaluation?: any;
  why_this_answer?: string;
  model_evidence?: string;
  conversational_summary?: any;
  debug_trace?: any;
  context?: any;
  recommended_actions?: Array<{
    destination: string;
    label: string;
    reason?: string;
    icon?: string;
    context?: any;
  }>;
  recommendedActions?: Array<{
    destination: string;
    label: string;
    reason?: string;
    icon?: string;
    context?: any;
  }>;
}> {
  return apiRequest('/api/advisor/evaluate', {
    method: 'POST',
    body: JSON.stringify({
      activity_text: query,
      query: query,
      station_id: stationId,
      location_id: stationId,
      date: date,
      category: category,
      context: context || undefined
    })
  });
}

// 14. Interactive Model Sandbox
export async function evaluateSandbox(data: any): Promise<{
  predicted_rainfall_mm: number;
  predicted_bias_mm: number;
  predicted_regime_id: number;
  predicted_regime_name: string;
  heavy_rain_probability: number;
  warning_level: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  explanation: string;
}> {
  return apiRequest('/api/sandbox/evaluate', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// 15. Dataset & Provenance Audit
export async function fetchDatasetAudit(state: string = 'Goa'): Promise<any> {
  return apiRequest(`/api/dataset/audit?state=${encodeURIComponent(state)}`, undefined, `audit_${state}`);
}

// 16. Data Provenance & Methodology
export async function fetchProvenance(): Promise<ProvenanceData> {
  return apiRequest<ProvenanceData>('/api/provenance', undefined, 'provenance_data');
}

// 17. SIH Jury Defense Q&A
export async function fetchJuryDefense(): Promise<JuryQuestion[]> {
  return apiRequest<JuryQuestion[]>('/api/jury-defense', undefined, 'jury_defense_data');
}

// 18. Scientific Audit Items
export async function fetchScientificAudit(): Promise<ScientificAuditItem[]> {
  return apiRequest<ScientificAuditItem[]>('/api/audit', undefined, 'scientific_audit_data');
}

// 19. User Authentication
export async function loginUser(email: string, password: string): Promise<{ user: any; token: string }> {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function registerUser(name: string, email: string, password: string, role: string): Promise<{ user: any; token: string }> {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role })
  });
}



import {
  Station, DateItem, ForecastRecord, AblationExperiment,
  FeatureImportanceItem, CalibrationMetric, ProvenanceData,
  JuryQuestion, ScientificAuditItem, SandboxRequest, SandboxResponse,
  CalibrationReport, CalibrationReportParams
} from '../types';

const API_BASE = '/api';

export async function fetchStations(): Promise<Station[]> {
  const res = await fetch(`${API_BASE}/stations`);
  if (!res.ok) throw new Error('Failed to fetch stations');
  return res.json();
}

export async function fetchDates(): Promise<DateItem[]> {
  const res = await fetch(`${API_BASE}/dates`);
  if (!res.ok) throw new Error('Failed to fetch dates');
  return res.json();
}

export async function fetchForecast(station_id: string | number, date: string, time?: string): Promise<ForecastRecord> {
  let url = `${API_BASE}/forecast?station_id=${station_id}&date=${encodeURIComponent(date)}`;
  if (time) url += `&time=${encodeURIComponent(time)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch forecast');
  return res.json();
}

export async function fetchOverallMetrics(state?: string): Promise<any> {
  const url = state && state !== 'All' 
    ? `${API_BASE}/metrics/overall?state=${encodeURIComponent(state)}` 
    : `${API_BASE}/metrics/overall`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch overall metrics');
  return res.json();
}

export async function fetchThresholdMetrics(): Promise<any> {
  const res = await fetch(`${API_BASE}/metrics/thresholds`);
  if (!res.ok) throw new Error('Failed to fetch threshold metrics');
  return res.json();
}

export async function fetchRegimeMetrics(): Promise<any> {
  const res = await fetch(`${API_BASE}/metrics/regimes`);
  if (!res.ok) throw new Error('Failed to fetch regime metrics');
  return res.json();
}

export async function fetchAblationStudy(): Promise<AblationExperiment[]> {
  const res = await fetch(`${API_BASE}/metrics/ablation`);
  if (!res.ok) throw new Error('Failed to fetch ablation study');
  return res.json();
}

export async function fetchFeatureImportance(): Promise<FeatureImportanceItem[]> {
  const res = await fetch(`${API_BASE}/metrics/features`);
  if (!res.ok) throw new Error('Failed to fetch feature importance');
  return res.json();
}

export async function fetchCalibration(): Promise<CalibrationMetric> {
  const res = await fetch(`${API_BASE}/metrics/calibration`);
  if (!res.ok) throw new Error('Failed to fetch calibration');
  return res.json();
}

export async function fetchProvenance(): Promise<ProvenanceData> {
  const res = await fetch(`${API_BASE}/provenance`);
  if (!res.ok) throw new Error('Failed to fetch provenance');
  return res.json();
}

export async function fetchJuryDefense(): Promise<JuryQuestion[]> {
  const res = await fetch(`${API_BASE}/jury-defense`);
  if (!res.ok) throw new Error('Failed to fetch jury defense Q&A');
  return res.json();
}

export async function fetchScientificAudit(): Promise<ScientificAuditItem[]> {
  const res = await fetch(`${API_BASE}/audit`);
  if (!res.ok) throw new Error('Failed to fetch scientific audit');
  return res.json();
}

export async function postSandboxPredict(req: SandboxRequest): Promise<SandboxResponse> {
  const res = await fetch(`${API_BASE}/sandbox/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  if (!res.ok) throw new Error('Sandbox prediction failed');
  return res.json();
}

export interface VerificationReportParams {
  state?: string;
  district?: string;
  date?: string;
  regime?: string;
  threshold?: number;
  partition?: string;
}

export async function fetchVerificationReport(params: VerificationReportParams = {}): Promise<any> {
  const queryParams = new URLSearchParams();
  if (params.state && params.state !== 'All') queryParams.append('state', params.state);
  else queryParams.append('state', 'All');
  
  if (params.district && params.district !== 'All') queryParams.append('district', params.district);
  if (params.date && params.date !== 'All') queryParams.append('date', params.date);
  if (params.regime && params.regime !== 'all') queryParams.append('regime', params.regime);
  if (params.threshold !== undefined) queryParams.append('threshold', String(params.threshold));
  if (params.partition && params.partition !== 'all') queryParams.append('partition', params.partition);

  const res = await fetch(`${API_BASE}/verification/report?${queryParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch verification report');
  return res.json();
}

export async function fetchDatasetAverages(state?: string, partition?: string): Promise<any> {
  const queryParams = new URLSearchParams();
  if (state && state !== 'All') queryParams.append('state', state);
  if (partition && partition !== 'all') queryParams.append('partition', partition);

  const res = await fetch(`${API_BASE}/metrics/averages?${queryParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch dataset averages');
  return res.json();
}

export async function fetchCalibrationReport(params: CalibrationReportParams = {}): Promise<CalibrationReport> {
  const queryParams = new URLSearchParams();
  if (params.event_type) queryParams.append('event_type', params.event_type);
  if (params.state && params.state !== 'All') queryParams.append('state', params.state);
  else queryParams.append('state', 'All');

  if (params.district && params.district !== 'All') queryParams.append('district', params.district);
  if (params.date && params.date !== 'All') queryParams.append('date', params.date);
  if (params.regime && params.regime !== 'all') queryParams.append('regime', params.regime);
  if (params.partition && params.partition !== 'all') queryParams.append('partition', params.partition);

  const res = await fetch(`${API_BASE}/calibration/report?${queryParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch calibration report');
  return res.json();
}

export async function fetchMapBatchForecasts(date: string, time?: string, state?: string): Promise<{
  status: string;
  date: string;
  time?: string;
  count: number;
  districts: import('../types').MapDistrictForecast[];
}> {
  const queryParams = new URLSearchParams();
  queryParams.append('date', date);
  if (time) queryParams.append('time', time);
  if (state && state !== 'All') queryParams.append('state', state);
  else queryParams.append('state', 'All');

  const res = await fetch(`${API_BASE}/forecast/map-batch?${queryParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch map batch forecasts');
  return res.json();
}





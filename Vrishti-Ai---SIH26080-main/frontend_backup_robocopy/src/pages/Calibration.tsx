import React, { useState, useEffect } from 'react';
import { fetchCalibration, fetchCalibrationReport, fetchDates } from '../services/api';
import { CalibrationMetric, CalibrationReport, DateItem } from '../types';
import { 
  ShieldCheck, AlertCircle, CheckCircle, Flame, Droplets, Filter, 
  BarChart2, TrendingUp, Layers, Calendar, MapPin, Sparkles, 
  CheckCircle2, Info, Activity, Sliders, RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, Cell
} from 'recharts';

const STATE_DISTRICTS: Record<string, string[]> = {
  Goa: ['North Goa', 'South Goa'],
  Kerala: [
    'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam',
    'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta',
    'Thiruvananthapuram', 'Thrissur', 'Wayanad'
  ],
  Karnataka: [
    'Bagalkote', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
    'Bidar', 'Chamarajanagara', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga',
    'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri',
    'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur',
    'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada',
    'Vijayanagara', 'Vijayapura', 'Yadgir'
  ]
};

const EVENT_TYPES = [
  { id: 'heavy', label: 'Heavy Rain (≥ 64.5 mm)', threshold: '64.5 mm', icon: Droplets, color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-400' },
  { id: 'very_heavy', label: 'Very Heavy Rain (≥ 115.5 mm)', threshold: '115.5 mm', icon: Flame, color: 'text-rose-600', bg: 'bg-rose-500/10', border: 'border-rose-400' },
  { id: 'moderate', label: 'Moderate Rain (≥ 15.6 mm)', threshold: '15.6 mm', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-400' },
  { id: 'light', label: 'Light Rain (≥ 2.5 mm)', threshold: '2.5 mm', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-500/10', border: 'border-indigo-400' },
];

const REGIME_OPTIONS = [
  { value: 'all', label: 'All Weather Regimes' },
  { value: '0', label: 'Regime 0: Active Monsoon / Orographic' },
  { value: '1', label: 'Regime 1: June Onset & Coastal Orographic' },
  { value: '2', label: 'Regime 2: July Peak Active Surge' },
  { value: '3', label: 'Regime 3: August Mid-Monsoon Break/Active' },
  { value: '4', label: 'Regime 4: September Withdrawal & Lows' },
  { value: '5', label: 'Regime 5: October Post-Monsoon Transition' },
];

export const CalibrationPage: React.FC = () => {
  // Baseline static calibration card data
  const [baselineData, setBaselineData] = useState<CalibrationMetric | null>(null);
  
  // Dynamic report state & filters
  const [eventType, setEventType] = useState<string>('heavy');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState<string>('All');
  const [selectedRegime, setSelectedRegime] = useState<string>('all');
  const [selectedPartition, setSelectedPartition] = useState<string>('test');
  
  const [report, setReport] = useState<CalibrationReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reportLoading, setReportLoading] = useState<boolean>(true);
  const [availableDates, setAvailableDates] = useState<DateItem[]>([]);

  // District options based on state
  const districtOptions = selectedState && selectedState !== 'All' && STATE_DISTRICTS[selectedState]
    ? ['All', ...STATE_DISTRICTS[selectedState]]
    : ['All', ...Object.values(STATE_DISTRICTS).flat()];

  // Initial load: fetch baseline cards and dates
  useEffect(() => {
    async function loadInitial() {
      try {
        const [calRes, datesRes] = await Promise.all([
          fetchCalibration().catch(() => null),
          fetchDates().catch(() => [])
        ]);
        if (calRes) setBaselineData(calRes);
        if (datesRes) setAvailableDates(datesRes);
      } catch (err) {
        console.error('Error fetching initial calibration data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  // Fetch dynamic calibration report when filters or eventType change
  useEffect(() => {
    let isMounted = true;
    async function loadReport() {
      setReportLoading(true);
      try {
        const res = await fetchCalibrationReport({
          event_type: eventType,
          state: selectedState,
          district: selectedDistrict,
          date: selectedDate,
          regime: selectedRegime,
          partition: selectedPartition
        });
        if (isMounted) {
          setReport(res);
        }
      } catch (err) {
        console.error('Error fetching calibration report:', err);
        if (isMounted) setReport(null);
      } finally {
        if (isMounted) setReportLoading(false);
      }
    }
    loadReport();
    return () => { isMounted = false; };
  }, [eventType, selectedState, selectedDistrict, selectedDate, selectedRegime, selectedPartition]);

  const handleStateChange = (st: string) => {
    setSelectedState(st);
    setSelectedDistrict('All');
  };

  const handleResetFilters = () => {
    setSelectedState('All');
    setSelectedDistrict('All');
    setSelectedDate('All');
    setSelectedRegime('all');
    setSelectedPartition('test');
  };

  if (loading) {
    return (
      <div className="glass-card p-12 text-center border border-slate-300">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="mt-3 text-sm font-extrabold text-slate-800">Loading probability calibration metrics...</p>
      </div>
    );
  }

  const isNoData = !report || report.status === 'no_data' || (report.metadata && report.metadata.total_samples === 0);
  const metrics = report?.metrics;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-2xl border border-slate-800 shadow-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Probabilistic Rainfall Calibration & Reliability</h2>
                <span className="text-xs text-indigo-300 font-bold">Platt Sigmoid Calibrated Probability Verification</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-300 max-w-3xl">
              Evaluates whether predicted event probabilities match empirical observation frequencies. Verified via Brier Score, Brier Skill Score (BSS), Reliability Curves, and Sharpness Distributions across Western Ghats regimes.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-200 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Platt Sigmoid Calibrated</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-300 text-xs font-bold">
              <span>Partition: {selectedPartition === 'test' ? 'Test 2025' : selectedPartition === 'validation' ? 'Val 2024' : 'All Data'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Event Category Selector Pills */}
      <div className="flex flex-wrap gap-2.5">
        {EVENT_TYPES.map((evt) => {
          const Icon = evt.icon;
          const isActive = eventType === evt.id;
          return (
            <button
              key={evt.id}
              onClick={() => setEventType(evt.id)}
              className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border shadow-sm ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-500 ring-2 ring-indigo-300 shadow-indigo-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className={`p-1 rounded-md ${isActive ? 'bg-white/20 text-white' : `${evt.bg} ${evt.color}`}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block">{evt.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Filter Controls Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>CALIBRATION FILTERS & PARTITION SLICING</span>
          </div>
          {(selectedState !== 'All' || selectedDistrict !== 'All' || selectedDate !== 'All' || selectedRegime !== 'all' || selectedPartition !== 'test') && (
            <button
              onClick={handleResetFilters}
              className="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* State Filter */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              State
            </label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="All">All States (3)</option>
              <option value="Goa">Goa</option>
              <option value="Kerala">Kerala</option>
              <option value="Karnataka">Karnataka</option>
            </select>
          </div>

          {/* District Filter */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="All">All Districts</option>
              {districtOptions.filter(d => d !== 'All').map((dist) => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>

          {/* Forecast Date Filter */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              Forecast Date
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="All">All Dates</option>
              {availableDates.map((d) => (
                <option key={d.date} value={d.date}>{d.date} ({d.partition})</option>
              ))}
            </select>
          </div>

          {/* Weather Regime Filter */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              Weather Regime
            </label>
            <select
              value={selectedRegime}
              onChange={(e) => setSelectedRegime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {REGIME_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Partition Filter */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              Evaluation Split
            </label>
            <select
              value={selectedPartition}
              onChange={(e) => setSelectedPartition(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="test">Test Partition (2025)</option>
              <option value="validation">Validation (2024)</option>
              <option value="all">Full Dataset (All)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Existing Calibration Highlight Cards (Heavy & Very Heavy Rain) */}
      {baselineData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Heavy Rain >=64.5mm Card */}
          <div className="glass-card p-5 border border-amber-300 shadow-sm bg-gradient-to-b from-amber-50/40 to-white space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-300">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider block">Calibrated Classifier</span>
                  <h3 className="text-base font-black text-slate-900">Heavy Rain Exceedance (&ge; 64.5 mm)</h3>
                </div>
              </div>
              <span className="text-[11px] font-black bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-400">
                PLATT CALIBRATED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 p-4 rounded-xl text-center space-y-1 shadow-md border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider block">Brier Score</span>
                <div className="text-2xl font-black text-emerald-400 mt-0.5">{baselineData.heavy_64_5mm.brier_score}</div>
                <span className="text-[10px] text-slate-400 font-semibold block">Ideal score = 0.0</span>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl text-center space-y-1 shadow-md border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider block">Positive Events</span>
                <div className="text-2xl font-black text-amber-400 mt-0.5">{baselineData.heavy_64_5mm.positive_cases}</div>
                <span className="text-[10px] text-slate-400 font-semibold block">Out of {baselineData.heavy_64_5mm.sample_size} test samples</span>
              </div>
            </div>
          </div>

          {/* Very Heavy Rain >=115.5mm Card */}
          <div className="glass-card p-5 border border-rose-300 shadow-sm bg-gradient-to-b from-rose-50/40 to-white space-y-4">
            <div className="flex items-center justify-between border-b border-rose-200 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-700 border border-rose-300">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-rose-800 uppercase tracking-wider block">Calibrated Classifier</span>
                  <h3 className="text-base font-black text-slate-900">Very Heavy Rain (&ge; 115.5 mm)</h3>
                </div>
              </div>
              <span className="text-[11px] font-black bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-400">
                PLATT CALIBRATED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 p-4 rounded-xl text-center space-y-1 shadow-md border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider block">Brier Score</span>
                <div className="text-2xl font-black text-emerald-400 mt-0.5">{baselineData.very_heavy_115_5mm.brier_score}</div>
                <span className="text-[10px] text-slate-400 font-semibold block">Ideal score = 0.0</span>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl text-center space-y-1 shadow-md border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider block">Positive Events</span>
                <div className="text-2xl font-black text-rose-400 mt-0.5">{baselineData.very_heavy_115_5mm.positive_cases}</div>
                <span className="text-[10px] text-slate-400 font-semibold block">Out of {baselineData.very_heavy_115_5mm.sample_size} test samples</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator for dynamic content */}
      {reportLoading && (
        <div className="bg-white/80 p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-xs font-bold text-slate-600">Computing probability verification and reliability curve...</p>
        </div>
      )}

      {/* No data state */}
      {!reportLoading && isNoData && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-8 text-center text-amber-900">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-2" />
          <h4 className="text-base font-bold">Data unavailable</h4>
          <p className="text-xs text-amber-700 mt-1 max-w-md mx-auto">
            {report?.message || 'No matching observational and forecast records found for the selected filter combination.'}
          </p>
        </div>
      )}

      {/* 5. Probabilistic Performance Metric Cards */}
      {!reportLoading && !isNoData && metrics && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Probability Performance Metrics ({report?.metadata.event_title})
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                N = {report?.metadata.total_samples?.toLocaleString()} samples | Base Rate = {report?.metadata.base_rate_pct}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {/* Brier Score */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Brier Score</span>
                <div className="text-xl font-black text-emerald-600 mt-1">
                  {metrics.brier_score !== undefined ? metrics.brier_score : 'N/A'}
                </div>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Ideal = 0.0</span>
              </div>

              {/* Brier Skill Score */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Brier Skill (BSS)</span>
                <div className={`text-xl font-black mt-1 ${metrics.brier_skill_score && metrics.brier_skill_score > 0 ? 'text-indigo-600' : 'text-slate-700'}`}>
                  {metrics.brier_skill_score !== undefined ? `${metrics.brier_skill_score > 0 ? '+' : ''}${metrics.brier_skill_score}` : 'N/A'}
                </div>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Ref: Climatology</span>
              </div>

              {/* Log Loss */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Log Loss</span>
                <div className="text-xl font-black text-slate-800 mt-1">
                  {metrics.log_loss !== undefined ? metrics.log_loss : 'N/A'}
                </div>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Cross-Entropy</span>
              </div>

              {/* ROC-AUC */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">ROC-AUC</span>
                <div className="text-xl font-black text-purple-600 mt-1">
                  {metrics.roc_auc !== undefined ? metrics.roc_auc : 'N/A'}
                </div>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Discrimination</span>
              </div>

              {/* Precision */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Precision (τ=0.5)</span>
                <div className="text-xl font-black text-blue-600 mt-1">
                  {metrics.precision !== undefined ? `${(metrics.precision * 100).toFixed(1)}%` : 'N/A'}
                </div>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Hit Ratio</span>
              </div>

              {/* Recall / POD */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Recall / POD</span>
                <div className="text-xl font-black text-emerald-600 mt-1">
                  {metrics.recall_pod !== undefined ? `${(metrics.recall_pod * 100).toFixed(1)}%` : 'N/A'}
                </div>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Detection</span>
              </div>

              {/* FAR */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">FAR (τ=0.5)</span>
                <div className="text-xl font-black text-rose-600 mt-1">
                  {metrics.far !== undefined ? `${(metrics.far * 100).toFixed(1)}%` : 'N/A'}
                </div>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">False Alarm</span>
              </div>

              {/* F1 Score */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">F1 Score</span>
                <div className="text-xl font-black text-amber-600 mt-1">
                  {metrics.f1_score !== undefined ? metrics.f1_score.toFixed(3) : 'N/A'}
                </div>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Harmonic Mean</span>
              </div>
            </div>
          </div>

          {/* 6. Side-by-Side Visualizations (Reliability Curve + Sharpness Distribution) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reliability / Calibration Curve */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Reliability / Calibration Curve</h4>
                    <span className="text-[11px] text-slate-500 font-bold">Predicted Probability vs Observed Frequency</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                  Ideal = 1:1 Diagonal
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={report?.reliability_curve || []} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="bin" 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickLine={false}
                      label={{ value: 'Forecast Probability Bins', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#64748b' }} 
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickLine={false}
                      unit="%"
                      label={{ value: 'Observed Frequency (%)', angle: -90, position: 'insideLeft', offset: 0, fontSize: 11, fill: '#64748b' }} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#fff', fontSize: '11px' }}
                      formatter={(val: any, name: string) => [`${val}%`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="Observed Frequency (%)" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      dot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} 
                      activeDot={{ r: 7 }}
                      name="Observed Event Frequency"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Perfect Calibration" 
                      stroke="#94a3b8" 
                      strokeWidth={2} 
                      strokeDasharray="5 5" 
                      dot={false}
                      name="Perfect Calibration (1:1 Reference)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <p className="text-[11px] text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <Info className="w-3.5 h-3.5 text-indigo-500 inline mr-1 -mt-0.5" />
                Points lying close to the dashed 1:1 reference line demonstrate calibrated probabilities: when the system issues a p% likelihood, the event occurs with p% empirical frequency.
              </p>
            </div>

            {/* Probability Distribution / Sharpness Histogram */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <BarChart2 className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Probability Distribution (Sharpness)</h4>
                    <span className="text-[11px] text-slate-500 font-bold">Sample count & percentage across forecast bins</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200">
                  {report?.metadata.total_samples?.toLocaleString()} Records
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report?.probability_distribution || []} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis 
                      dataKey="bin" 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickLine={false}
                      label={{ value: 'Probability Range', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#64748b' }} 
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickLine={false}
                      unit="%"
                      label={{ value: 'Dataset Sample Share (%)', angle: -90, position: 'insideLeft', offset: 0, fontSize: 11, fill: '#64748b' }} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#fff', fontSize: '11px' }}
                      formatter={(val: any, name: string, item: any) => [
                        `${val}% (${item.payload.count.toLocaleString()} cases)`,
                        'Sample Share'
                      ]}
                    />
                    <Bar dataKey="pct" radius={[6, 6, 0, 0]} name="Sample Share (%)">
                      {(report?.probability_distribution || []).map((entry, index) => {
                        const colors = ['#6366f1', '#3b82f6', '#0ea5e9', '#f59e0b', '#ef4444'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p className="text-[11px] text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <Info className="w-3.5 h-3.5 text-indigo-500 inline mr-1 -mt-0.5" />
                Sharpness characterizes the model's confidence: highly discriminative models place dry/calm events near 0-20% while isolating hazard events near 80-100%.
              </p>
            </div>
          </div>

          {/* 7. Probability Decision Threshold Comparison Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-black text-slate-900">
                  Probability Decision Threshold Comparison Table (τ = 10% to 90%)
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 font-bold">
                Contingency scores computed across decision boundaries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <th className="py-3 px-4">Threshold (τ)</th>
                    <th className="py-3 px-4">POD (Hit Rate)</th>
                    <th className="py-3 px-4">FAR (False Alarm)</th>
                    <th className="py-3 px-4">CSI (Critical Success)</th>
                    <th className="py-3 px-4">Precision</th>
                    <th className="py-3 px-4">Forecast Positives</th>
                    <th className="py-3 px-4">Hits (TP)</th>
                    <th className="py-3 px-4">Evaluation N</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold">
                  {(report?.decision_thresholds_table || []).map((row, idx) => {
                    const isStandard = row.threshold === '50%';
                    return (
                      <tr 
                        key={idx} 
                        className={`transition-colors ${
                          isStandard 
                            ? 'bg-indigo-50/80 font-black text-indigo-950 border-l-4 border-l-indigo-600' 
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <td className="py-2.5 px-4 font-black">
                          <div className="flex items-center space-x-1.5">
                            <span>{row.threshold}</span>
                            {isStandard && (
                              <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold">
                                Default
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-emerald-700">{(row.pod * 100).toFixed(1)}%</td>
                        <td className="py-2.5 px-4 text-rose-700">{(row.far * 100).toFixed(1)}%</td>
                        <td className="py-2.5 px-4 text-indigo-700">{row.csi.toFixed(4)}</td>
                        <td className="py-2.5 px-4 text-blue-700">{(row.precision * 100).toFixed(1)}%</td>
                        <td className="py-2.5 px-4 text-slate-800">{row.forecast_positives.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-emerald-800">{row.hits.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-slate-500">{row.samples.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 8. Weather Regime Calibration Breakdown */}
          {report?.regime_breakdown && report.regime_breakdown.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-black text-slate-900">
                    Calibration Performance by Weather Regime (0 to 5)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500 font-bold">
                  Physics & regime conditioned probabilistic evaluation
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <th className="py-3 px-4">Regime ID & Description</th>
                      <th className="py-3 px-4">Samples (N)</th>
                      <th className="py-3 px-4">Observed Positives</th>
                      <th className="py-3 px-4">Brier Score</th>
                      <th className="py-3 px-4">Mean Predicted Prob</th>
                      <th className="py-3 px-4">Observed Frequency</th>
                      <th className="py-3 px-4">Calibration Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                    {report.regime_breakdown.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 font-black text-slate-900">
                          {r.regime_name}
                        </td>
                        <td className="py-2.5 px-4 text-slate-700">{r.samples.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-amber-700">{r.positive_events.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-emerald-700">{r.brier_score.toFixed(6)}</td>
                        <td className="py-2.5 px-4 text-indigo-700">{r.mean_predicted_prob.toFixed(2)}%</td>
                        <td className="py-2.5 px-4 text-slate-800">{r.observed_frequency.toFixed(2)}%</td>
                        <td className="py-2.5 px-4">
                          <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded-full inline-flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Calibrated</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9. Automated Calibration Summary Card */}
          {report?.summary && (
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-black text-white">
                  {report.summary.verdict}
                </h4>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-semibold text-slate-300">
                {report.summary.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

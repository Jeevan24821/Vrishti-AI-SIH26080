import React, { useState, useEffect } from 'react';
import { 
  fetchOverallMetrics, 
  fetchThresholdMetrics, 
  fetchVerificationReport, 
  fetchDates 
} from '../services/api';
import { 
  BarChart, Bar, AreaChart, Area, LineChart, Line, ReferenceLine, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { 
  BarChart3, Award, TrendingUp, ShieldCheck, CheckCircle2, Map, 
  Maximize2, FileCheck, Filter, ArrowUpRight, ArrowDownRight, 
  AlertCircle, HelpCircle, Layers, Calendar, CloudRain, Activity,
  Info, Sparkles, Check
} from 'lucide-react';
import { GraphModal } from '../components/GraphModal';
import { DateItem } from '../types';

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

const THRESHOLD_OPTIONS = [
  { value: 0.1, label: '0.1 mm', sublabel: 'Trace Drizzle' },
  { value: 2.5, label: '2.5 mm', sublabel: 'Light Rain (Default)' },
  { value: 5.0, label: '5.0 mm', sublabel: 'Field Work Limit' },
  { value: 10.0, label: '10.0 mm', sublabel: 'Safety Threshold' },
  { value: 15.6, label: '15.6 mm', sublabel: 'Moderate Rain' },
  { value: 25.0, label: '25.0 mm', sublabel: 'Convective Surge' },
  { value: 64.5, label: '64.5 mm', sublabel: 'Heavy Rain / Hazard' },
  { value: 115.5, label: '115.5 mm', sublabel: 'Very Heavy Rain' },
];

const REGIME_OPTIONS = [
  { value: 'all', label: 'All Weather Regimes' },
  { value: '0', label: 'Regime 0: Active Monsoon / Coastal Orographic' },
  { value: '1', label: 'Regime 1: June Onset & Coastal Orographic' },
  { value: '2', label: 'Regime 2: July Peak Active Surge' },
  { value: '3', label: 'Regime 3: August Mid-Monsoon Break/Active' },
  { value: '4', label: 'Regime 4: September Withdrawal & Lows' },
  { value: '5', label: 'Regime 5: October Post-Monsoon Transition' },
];

interface VerificationSkillPageProps {
  chartType?: 'area' | 'bar' | 'spline';
  thresholdCutoff?: number;
  confidenceLevel?: string;
  selectedRegimeFilter?: string;
  selectedGeographyFilter?: string;
  selectedPartitionFilter?: string;
  initialState?: string;
  initialMetric?: string;
  initialMode?: string;
}

export const VerificationSkillPage: React.FC<VerificationSkillPageProps> = ({
  chartType = 'bar',
  thresholdCutoff = 25,
  confidenceLevel = '95%',
  selectedRegimeFilter = 'all',
  selectedGeographyFilter = 'all',
  selectedPartitionFilter = 'all',
  initialState,
  initialMetric,
  initialMode,
}) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [thresholds, setThresholds] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>(initialState || 'All');
  const [isGraphModalOpen, setIsGraphModalOpen] = useState<boolean>(false);
  const [availableDates, setAvailableDates] = useState<DateItem[]>([]);

  // Verification Report Dedicated State & Filters
  const [reportState, setReportState] = useState<string>(initialState || 'All');
  const [reportDistrict, setReportDistrict] = useState<string>('All');
  const [reportDate, setReportDate] = useState<string>('All');
  const [reportRegime, setReportRegime] = useState<string>('all');
  const [reportThreshold, setReportThreshold] = useState<number>(2.5);
  const [reportPartition, setReportPartition] = useState<string>('test');
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState<boolean>(true);

  // Load baseline metrics & dates on mount
  useEffect(() => {
    async function initData() {
      try {
        const dList = await fetchDates();
        setAvailableDates(dList);
      } catch (e) {
        console.error('Error fetching dates:', e);
      }
    }
    initData();
  }, []);

  useEffect(() => {
    if (initialState) {
      setSelectedStateFilter(initialState);
      setReportState(initialState);
    }
  }, [initialState]);

  // Fetch overall baseline metrics
  const loadStateMetrics = async (stName: string) => {
    setLoading(true);
    try {
      const [mRes, tRes] = await Promise.all([fetchOverallMetrics(stName), fetchThresholdMetrics()]);
      setMetrics(mRes);
      setThresholds(tRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStateMetrics(selectedStateFilter);
  }, [selectedStateFilter]);

  // Dynamic Verification Report Loader
  const loadVerificationReport = async () => {
    setReportLoading(true);
    try {
      const res = await fetchVerificationReport({
        state: reportState,
        district: reportDistrict,
        date: reportDate,
        regime: reportRegime,
        threshold: reportThreshold,
        partition: reportPartition
      });
      setReportData(res);
    } catch (err) {
      console.error('Error fetching verification report:', err);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    loadVerificationReport();
  }, [reportState, reportDistrict, reportDate, reportRegime, reportThreshold, reportPartition]);

  // Handle State Change -> Reset District to All if invalid
  const handleReportStateChange = (newState: string) => {
    setReportState(newState);
    if (newState === 'All') {
      setReportDistrict('All');
    } else {
      const validDistricts = STATE_DISTRICTS[newState] || [];
      if (!validDistricts.includes(reportDistrict)) {
        setReportDistrict('All');
      }
    }
  };

  // Compute available districts for report filter
  const currentDistrictOptions = reportState === 'All'
    ? Object.values(STATE_DISTRICTS).flat()
    : (STATE_DISTRICTS[reportState] || []);

  if (loading || !metrics) {
    return (
      <div className="glass-card p-12 text-center border border-slate-300">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="mt-3 text-sm text-slate-800 font-extrabold">Loading independent test set verification metrics...</p>
      </div>
    );
  }

  // Active Partition Filter (Validation 2024 vs Test 2025 vs All)
  const targetPartitionM = selectedPartitionFilter === 'validation'
    ? (metrics.val_2024 || metrics.validation_2024 || metrics.validation_2023 || metrics)
    : (metrics.test_2025 || metrics.test_2024 || metrics);

  const rawNwp = targetPartitionM.raw_nwp || { rmse: 'Data unavailable', mae: 'Data unavailable', bias: 'Data unavailable', r_corr: 'Data unavailable', r2: 'Data unavailable', n: 'Data unavailable' };
  const linearMos = targetPartitionM.linear_mos || { rmse: 'Data unavailable', mae: 'Data unavailable', bias: 'Data unavailable', r_corr: 'Data unavailable', r2: 'Data unavailable', rmse_improvement_pct: 'Data unavailable' };
  const globalML = targetPartitionM.selected_global_ml || targetPartitionM.hist_gradient_boosting || targetPartitionM.xgb_2000 || targetPartitionM.global_ml || { rmse: 'Data unavailable', mae: 'Data unavailable', bias: 'Data unavailable', r_corr: 'Data unavailable', r2: 'Data unavailable', rmse_improvement_pct: 'Data unavailable' };
  const regimeAware = targetPartitionM.regime_aware_ml || { rmse: 'Data unavailable', mae: 'Data unavailable', bias: 'Data unavailable', r_corr: 'Data unavailable', r2: 'Data unavailable', rmse_improvement_pct: 'Data unavailable' };
  const oracle = targetPartitionM.oracle_regime_ml || { rmse: 'Data unavailable', mae: 'Data unavailable', bias: 'Data unavailable', r_corr: 'Data unavailable', r2: 'Data unavailable', rmse_improvement_pct: 'Data unavailable' };

  const chartData = [
    { model: 'Raw NWP', rmse: typeof rawNwp.rmse === 'number' ? rawNwp.rmse : 0, mae: typeof rawNwp.mae === 'number' ? rawNwp.mae : 0, r2: typeof rawNwp.r2 === 'number' ? rawNwp.r2 : 0 },
    { model: 'Linear MOS', rmse: typeof linearMos.rmse === 'number' ? linearMos.rmse : 0, mae: typeof linearMos.mae === 'number' ? linearMos.mae : 0, r2: typeof linearMos.r2 === 'number' ? linearMos.r2 : 0 },
    { model: 'Global ML', rmse: typeof globalML.rmse === 'number' ? globalML.rmse : 0, mae: typeof globalML.mae === 'number' ? globalML.mae : 0, r2: typeof globalML.r2 === 'number' ? globalML.r2 : 0 },
    { model: 'Regime-Aware ML', rmse: typeof regimeAware.rmse === 'number' ? regimeAware.rmse : 0, mae: typeof regimeAware.mae === 'number' ? regimeAware.mae : 0, r2: typeof regimeAware.r2 === 'number' ? regimeAware.r2 : 0 },
    { model: 'Oracle Upper Bound', rmse: typeof oracle.rmse === 'number' ? oracle.rmse : 0, mae: typeof oracle.mae === 'number' ? oracle.mae : 0, r2: typeof oracle.r2 === 'number' ? oracle.r2 : 0 },
  ].filter(d => d.rmse > 0 || d.mae > 0);

  return (
    <div className="space-y-8">
      
      {/* ============================================================ */}
      {/* SECTION 1: DEDICATED OFFICIAL VERIFICATION REPORT           */}
      {/* ============================================================ */}
      <section className="space-y-6">
        
        {/* Verification Report Header Banner */}
        <div className="p-6 border border-slate-800 shadow-xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <FileCheck className="w-64 h-64 text-indigo-400" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start space-x-4">
              <div className="p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 shadow-inner">
                <FileCheck className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-900/60 px-2.5 py-0.5 rounded-md border border-indigo-500/30">
                    Scientific Verification Standard
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                    Ground Truth vs NWP vs ML
                  </span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight mt-1.5">
                  Rainfall Forecast Verification Report
                </h2>
                <p className="text-sm text-slate-300 font-semibold mt-1 max-w-2xl">
                  Official evaluation comparing <strong className="text-white">Raw NWP Baseline</strong> against <strong className="text-indigo-300">VRISHTI Regime-Aware ML Corrected</strong> rainfall across independent test observations.
                </p>
              </div>
            </div>

            {/* Live Data Sample Badge */}
            <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 flex items-center space-x-4 shrink-0 shadow-lg">
              <div className="text-right">
                <span className="text-[11px] uppercase font-black tracking-wider text-slate-400 block">Evaluated Records</span>
                <span className="text-2xl font-black text-white block">
                  {reportData?.metadata?.total_records?.toLocaleString() || '0'}
                </span>
                <span className="text-[11px] font-bold text-emerald-400 block">
                  Partition: {reportPartition.toUpperCase()} (Zero Leakage)
                </span>
              </div>
              <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-400/40 text-emerald-400">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Interactive 5-Way Filter Bar */}
          <div className="mt-6 pt-5 border-t border-indigo-800/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            
            {/* Filter 1: State */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
                <Map className="w-3.5 h-3.5 text-indigo-400" /> State:
              </label>
              <select
                value={reportState}
                onChange={(e) => handleReportStateChange(e.target.value)}
                className="w-full bg-slate-900/90 border border-indigo-500/40 text-white text-xs font-black rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="All">All States (Goa, Kerala, KA)</option>
                <option value="Goa">Goa State</option>
                <option value="Kerala">Kerala State</option>
                <option value="Karnataka">Karnataka State</option>
              </select>
            </div>

            {/* Filter 2: District */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> District:
              </label>
              <select
                value={reportDistrict}
                onChange={(e) => setReportDistrict(e.target.value)}
                className="w-full bg-slate-900/90 border border-indigo-500/40 text-white text-xs font-black rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="All">All Districts ({currentDistrictOptions.length})</option>
                {currentDistrictOptions.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Filter 3: Forecast Date */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Forecast Date:
              </label>
              <select
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full bg-slate-900/90 border border-indigo-500/40 text-white text-xs font-black rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="All">All Monsoon Dates</option>
                {availableDates.slice(0, 40).map((d) => (
                  <option key={d.date} value={d.date}>{d.date} ({d.year})</option>
                ))}
              </select>
            </div>

            {/* Filter 4: Weather Regime */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-indigo-400" /> Weather Regime:
              </label>
              <select
                value={reportRegime}
                onChange={(e) => setReportRegime(e.target.value)}
                className="w-full bg-slate-900/90 border border-indigo-500/40 text-white text-xs font-black rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {REGIME_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Filter 5: Partition */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Dataset Split:
              </label>
              <select
                value={reportPartition}
                onChange={(e) => setReportPartition(e.target.value)}
                className="w-full bg-slate-900/90 border border-indigo-500/40 text-white text-xs font-black rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="test">Independent Test Set (2025)</option>
                <option value="validation">Validation Set (2024)</option>
                <option value="all">All Combined Records</option>
              </select>
            </div>

          </div>
        </div>

        {/* Rainfall Threshold Selector Pills */}
        <div className="glass-card p-5 border-slate-300 shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
                Rainfall Threshold Selector ({reportThreshold} mm / 6h)
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-600">
              Categorical skill scores (ETS, CSI, POD, FAR, FSS) dynamically recalculate based on selected threshold
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {THRESHOLD_OPTIONS.map((th) => {
              const isSelected = reportThreshold === th.value;
              return (
                <button
                  key={th.value}
                  onClick={() => setReportThreshold(th.value)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300'
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-indigo-50/50 hover:border-indigo-300'
                  }`}
                >
                  <span className={`text-xs font-black block ${isSelected ? 'text-white' : 'text-slate-950'}`}>
                    &ge; {th.label}
                  </span>
                  <span className={`text-[10px] font-semibold mt-0.5 truncate block ${isSelected ? 'text-indigo-100' : 'text-slate-600'}`}>
                    {th.sublabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading / Content State */}
        {reportLoading ? (
          <div className="glass-card p-12 text-center border border-slate-300">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-3 text-xs text-slate-700 font-extrabold">Evaluating independent test observations & calculating verification metrics...</p>
          </div>
        ) : !reportData || reportData.status === 'no_data' || reportData.metrics_table?.length === 0 ? (
          <div className="glass-card p-10 text-center border border-amber-300 bg-amber-50/60">
            <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-2" />
            <h4 className="text-base font-black text-slate-900">Data Unavailable</h4>
            <p className="text-xs text-slate-700 font-semibold mt-1">
              No matching observational or model forecast records found for this specific filter criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            
            {/* Automatic Verification Summary Card */}
            <div className="glass-card p-6 border-emerald-300 bg-gradient-to-r from-emerald-50/90 via-white to-indigo-50/90 shadow-md space-y-3.5">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase text-emerald-800 tracking-wider block">
                    Automatic Verification Summary
                  </span>
                  <h4 className="text-base font-black text-slate-950">
                    {reportData.summary?.verdict || 'Evaluation Complete'}
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {reportData.summary?.bullets?.map((bullet: string, idx: number) => (
                  <div key={idx} className="bg-white/80 border border-slate-200/80 rounded-xl p-3 shadow-sm flex items-start space-x-2.5">
                    <span className="p-1 rounded-md bg-emerald-100 text-emerald-700 mt-0.5 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-extrabold text-slate-800 leading-snug">
                      {bullet}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Six Metrics Comparison Table & Comparison Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Table: Metric | Raw NWP | VRISHTI ML Corrected | Improvement */}
              <div className="lg:col-span-7 glass-card p-6 border-slate-300 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <Award className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h3 className="text-base font-black text-slate-950">Six Verification Metrics Comparison</h3>
                      <p className="text-[11px] font-bold text-slate-600">Calculated from actual independent test records ({reportThreshold} mm cutoff)</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-indigo-900 bg-indigo-100/80 px-2.5 py-1 rounded-lg border border-indigo-200">
                    N = {reportData.metadata?.total_records?.toLocaleString()}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-900 text-white font-black text-[11px] uppercase tracking-wider">
                        <th className="py-3.5 px-4">Metric</th>
                        <th className="py-3.5 px-4 text-center">Raw NWP</th>
                        <th className="py-3.5 px-4 text-center text-indigo-200">VRISHTI ML Corrected</th>
                        <th className="py-3.5 px-4 text-right">Improvement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white font-semibold text-slate-900">
                      {reportData.metrics_table?.map((row: any) => {
                        const isRmse = row.key === 'rmse';
                        const isImproved = row.status === 'improved';
                        return (
                          <tr key={row.key} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-extrabold text-slate-950 text-xs flex items-center gap-1.5">
                                <span className="font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                                  {row.acronym}
                                </span>
                                <span>{row.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-600 font-bold block mt-0.5">
                                {row.description}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-slate-700 font-mono text-xs">
                              {row.raw_nwp !== 'Data unavailable' ? `${row.raw_nwp} ${row.unit}` : 'Data unavailable'}
                            </td>
                            <td className="py-3 px-4 text-center font-black text-indigo-950 bg-indigo-50/40 font-mono text-xs">
                              {row.vrishti_ml !== 'Data unavailable' ? `${row.vrishti_ml} ${row.unit}` : 'Data unavailable'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {row.improvement !== 'Data unavailable' ? (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black ${
                                  isImproved
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-slate-100 text-slate-800 border border-slate-300'
                                }`}>
                                  {isImproved ? (
                                    isRmse ? <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : null}
                                  {row.improvement}
                                </span>
                              ) : (
                                <span className="text-slate-600 font-bold text-[11px]">Data unavailable</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Contingency Counts Matrix Grid */}
                {reportData.contingency_counts && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider block mb-2">
                      Contingency Matrix Event Counts (&ge; {reportThreshold} mm)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                      <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        <span className="text-emerald-900 font-black block">Hits (True Positives)</span>
                        <span className="text-slate-900 font-extrabold mt-0.5 block">
                          NWP: {reportData.contingency_counts.raw_nwp?.hits?.toLocaleString()} &bull; <strong className="text-emerald-700">ML: {reportData.contingency_counts.vrishti_ml?.hits?.toLocaleString()}</strong>
                        </span>
                      </div>
                      <div className="bg-rose-50 p-2 rounded-lg border border-rose-200">
                        <span className="text-rose-900 font-black block">Misses (Under-forecast)</span>
                        <span className="text-slate-900 font-extrabold mt-0.5 block">
                          NWP: {reportData.contingency_counts.raw_nwp?.misses?.toLocaleString()} &bull; <strong className="text-emerald-700">ML: {reportData.contingency_counts.vrishti_ml?.misses?.toLocaleString()}</strong>
                        </span>
                      </div>
                      <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
                        <span className="text-amber-900 font-black block">False Alarms</span>
                        <span className="text-slate-900 font-extrabold mt-0.5 block">
                          NWP: {reportData.contingency_counts.raw_nwp?.false_alarms?.toLocaleString()} &bull; <strong className="text-indigo-900">ML: {reportData.contingency_counts.vrishti_ml?.false_alarms?.toLocaleString()}</strong>
                        </span>
                      </div>
                      <div className="bg-slate-100 p-2 rounded-lg border border-slate-300">
                        <span className="text-slate-800 font-black block">Correct Negatives</span>
                        <span className="text-slate-900 font-extrabold mt-0.5 block">
                          NWP: {reportData.contingency_counts.raw_nwp?.correct_negatives?.toLocaleString()} &bull; <strong className="text-indigo-900">ML: {reportData.contingency_counts.vrishti_ml?.correct_negatives?.toLocaleString()}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Chart: Raw NWP vs VRISHTI ML for Six Verification Metrics */}
              <div className="lg:col-span-5 glass-card p-6 border-slate-300 shadow-md flex flex-col justify-between space-y-4">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h3 className="text-base font-black text-slate-950">Verification Metrics Comparison Chart</h3>
                      <p className="text-[11px] font-bold text-slate-600">Side-by-side performance across 6 metrics</p>
                    </div>
                  </div>
                </div>

                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData.chart_data || []}
                      margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="metric" 
                        stroke="#0f172a" 
                        fontSize={11} 
                        fontWeight={800}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis stroke="#0f172a" fontSize={11} fontWeight={800} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          borderColor: '#334155', 
                          color: '#ffffff', 
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }} 
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '12px' }} 
                        formatter={(value) => <span className="font-extrabold text-slate-800 text-xs">{value}</span>}
                      />
                      <Bar dataKey="Raw NWP" fill="#64748b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="VRISHTI ML" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 font-bold flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    RMSE: lower is better &bull; ETS, CSI, POD, FSS: higher is better &bull; FAR: lower is better.
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

      </section>

      {/* ============================================================ */}
      {/* SECTION 2: MODEL ARCHITECTURE BENCHMARK & ERROR DECOMPOSITION */}
      {/* ============================================================ */}
      <div className="pt-6 border-t border-slate-300 space-y-6">
        
        {/* State Selector Bar for RMSE & Metrics */}
        <div className="glass-card p-4 border-slate-300 bg-white text-slate-950 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 tracking-tight">Continuous Architecture Benchmark</h3>
              <p className="text-xs text-slate-700 font-bold">Continuous RMSE, MAE, R², and Pearson r across model tiers</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <label className="text-xs font-black uppercase text-slate-900 tracking-wider">Select State for RMSE % Evaluation:</label>
            <select
              value={selectedStateFilter}
              onChange={(e) => setSelectedStateFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-950 text-xs font-black rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white hover:bg-white hover:border-indigo-400 cursor-pointer shadow-sm transition-colors"
            >
              <option value="All" className="bg-white text-slate-950 font-bold">All States Combined (Karnataka, Kerala, Goa)</option>
              <option value="Karnataka" className="bg-white text-slate-950 font-bold">Karnataka State</option>
              <option value="Kerala" className="bg-white text-slate-950 font-bold">Kerala State</option>
              <option value="Goa" className="bg-white text-slate-950 font-bold">Goa State</option>
            </select>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-6 flex flex-col justify-between border-slate-300 shadow-sm">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">RAW NWP BASELINE RMSE</span>
            <div className="text-3xl font-black text-slate-950 mt-3">{rawNwp.rmse} <span className="text-base font-bold text-slate-700">mm</span></div>
            <span className="text-xs text-slate-600 font-semibold mt-3">Unmodified model error</span>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between border-indigo-300 bg-gradient-to-b from-indigo-50/70 to-white shadow-sm">
            <span className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">REGIME-AWARE ML RMSE</span>
            <div className="text-3xl font-black text-indigo-950 mt-3">{regimeAware.rmse} <span className="text-base font-bold text-indigo-800">mm</span></div>
            <span className="text-xs font-black text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-300 inline-flex items-center gap-1 mt-3 self-start">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {regimeAware.rmse_improvement_pct}% RMSE Reduction
            </span>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between border-slate-300 shadow-sm">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">R² SCORE (REGIME-AWARE)</span>
            <div className="text-3xl font-black text-emerald-700 mt-3">{regimeAware.r2}</div>
            <span className="text-xs text-slate-600 font-semibold mt-3">Variance explained ({confidenceLevel} CI)</span>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between border-slate-300 shadow-sm">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">INDEPENDENT TEST SAMPLES</span>
            <div className="text-3xl font-black text-slate-900 mt-3">{rawNwp.n?.toLocaleString()}</div>
            <span className="text-xs text-slate-600 font-semibold mt-3">Independent test records</span>
          </div>
        </div>

        {/* Dynamic Model Error Comparison Chart (Area / Bar / Spline) */}
        <div className="glass-card p-6 border-slate-300 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" /> Error Metric Comparison Across Models (Independent Test Set)
            </h3>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsGraphModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Expand Graph</span>
              </button>
              <span className="text-xs font-black text-indigo-950 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg">
                Mode: {chartType.toUpperCase()} &bull; Cutoff: &gt;{thresholdCutoff}mm &bull; {confidenceLevel} CI
              </span>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rmseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="maeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="model" stroke="#0f172a" fontSize={12} fontWeight={700} />
                  <YAxis stroke="#0f172a" fontSize={12} unit=" mm" fontWeight={700} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="rmse" name="RMSE (mm)" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#rmseGrad)" />
                  <Area type="monotone" dataKey="mae" name="MAE (mm)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#maeGrad)" />
                </AreaChart>
              ) : chartType === 'spline' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="model" stroke="#0f172a" fontSize={12} fontWeight={700} />
                  <YAxis stroke="#0f172a" fontSize={12} unit=" mm" fontWeight={700} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="rmse" name="RMSE (mm)" stroke="#2563eb" strokeWidth={3.5} dot={{ r: 6 }} />
                  <Line type="monotone" dataKey="mae" name="MAE (mm)" stroke="#10b981" strokeWidth={3.5} dot={{ r: 6 }} />
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="model" stroke="#0f172a" fontSize={12} fontWeight={700} />
                  <YAxis stroke="#0f172a" fontSize={12} unit=" mm" fontWeight={700} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="rmse" name="RMSE (mm)" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="mae" name="MAE (mm)" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Continuous Verification Table */}
        <div className="glass-card p-6 border-slate-300 shadow-md">
          <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" /> Official Continuous Verification Table (Independent Test Set)
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="droit-table w-full text-xs text-left">
              <thead>
                <tr>
                  <th className="py-3.5 px-4">Model Architecture</th>
                  <th className="py-3.5 px-4">RMSE (mm)</th>
                  <th className="py-3.5 px-4">MAE (mm)</th>
                  <th className="py-3.5 px-4">Bias (mm)</th>
                  <th className="py-3.5 px-4">Pearson r</th>
                  <th className="py-3.5 px-4">R² Score</th>
                  <th className="py-3.5 px-4">RMSE Imp. (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white font-semibold text-slate-900">
                <tr>
                  <td className="font-extrabold text-slate-900">Raw NWP Baseline</td>
                  <td>{rawNwp.rmse}</td>
                  <td>{rawNwp.mae}</td>
                  <td>{rawNwp.bias}</td>
                  <td>{rawNwp.r_corr}</td>
                  <td>{rawNwp.r2}</td>
                  <td className="text-slate-600 font-bold">Baseline</td>
                </tr>
                <tr>
                  <td className="font-extrabold text-slate-900">Linear MOS Model</td>
                  <td>{linearMos.rmse}</td>
                  <td>{linearMos.mae}</td>
                  <td>{linearMos.bias}</td>
                  <td>{linearMos.r_corr}</td>
                  <td>{linearMos.r2}</td>
                  <td className="font-black text-emerald-700">+{linearMos.rmse_improvement_pct}%</td>
                </tr>
                <tr>
                  <td className="font-extrabold text-slate-900">Global ML Regressor</td>
                  <td>{globalML.rmse}</td>
                  <td>{globalML.mae}</td>
                  <td>{globalML.bias}</td>
                  <td>{globalML.r_corr}</td>
                  <td>{globalML.r2}</td>
                  <td className="font-black text-emerald-700">+{globalML.rmse_improvement_pct}%</td>
                </tr>
                <tr className="highlight-row">
                  <td className="font-black text-indigo-900">Regime-Aware ML (Operational)</td>
                  <td className="font-black">{regimeAware.rmse}</td>
                  <td className="font-black">{regimeAware.mae}</td>
                  <td className="font-black">{regimeAware.bias}</td>
                  <td className="font-black">{regimeAware.r_corr}</td>
                  <td className="font-black">{regimeAware.r2}</td>
                  <td className="font-black text-emerald-700">+{regimeAware.rmse_improvement_pct}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <GraphModal
        isOpen={isGraphModalOpen}
        onClose={() => setIsGraphModalOpen(false)}
        title="Error Metric Comparison Across Models"
        subtitle={`State: ${selectedStateFilter} | Partition: ${selectedPartitionFilter.toUpperCase()} | Regime: ${selectedRegimeFilter}`}
        data={chartData}
        chartType={chartType}
        thresholdCutoff={thresholdCutoff}
        confidenceLevel={confidenceLevel}
        dataKeys={[
          { key: 'rmse', name: 'RMSE (mm)', color: '#2563eb' },
          { key: 'mae', name: 'MAE (mm)', color: '#10b981' }
        ]}
        xAxisKey="model"
        unit=" mm"
      />

    </div>
  );
};

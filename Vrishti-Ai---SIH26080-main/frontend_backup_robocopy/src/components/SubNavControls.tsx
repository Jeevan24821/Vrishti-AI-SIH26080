import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Filter, Sliders, ShieldCheck, Thermometer, Droplets, 
  Wind, Gauge, RotateCcw, Check, Sparkles, Loader2 
} from 'lucide-react';
import { fetchDatasetAverages } from '../services/api';

interface SubNavControlsProps {
  activeFilterTab: string;
  setActiveFilterTab: (tab: string) => void;
  
  // Configuration state
  thresholdCutoff: number;
  setThresholdCutoff: (val: number) => void;
  chartType: 'area' | 'bar' | 'spline';
  setChartType: (type: 'area' | 'bar' | 'spline') => void;
  confidenceLevel: string;
  setConfidenceLevel: (conf: string) => void;
  
  // Filter state
  selectedRegimeFilter: string;
  setSelectedRegimeFilter: (regime: string) => void;
  selectedGeographyFilter: string;
  setSelectedGeographyFilter: (geo: string) => void;
  selectedPartitionFilter: string;
  setSelectedPartitionFilter: (part: string) => void;
}

export const SubNavControls: React.FC<SubNavControlsProps> = ({
  activeFilterTab,
  setActiveFilterTab,
  thresholdCutoff,
  setThresholdCutoff,
  chartType,
  setChartType,
  confidenceLevel,
  setConfidenceLevel,
  selectedRegimeFilter,
  setSelectedRegimeFilter,
  selectedGeographyFilter,
  setSelectedGeographyFilter,
  selectedPartitionFilter,
  setSelectedPartitionFilter,
}) => {
  const [averagesData, setAveragesData] = useState<any>(null);
  const [loadingAverages, setLoadingAverages] = useState<boolean>(false);

  useEffect(() => {
    if (activeFilterTab === 'average') {
      setLoadingAverages(true);
      fetchDatasetAverages('All', selectedPartitionFilter)
        .then((res) => {
          setAveragesData(res);
        })
        .catch((err) => {
          console.error('Failed to load dataset averages:', err);
          setAveragesData(null);
        })
        .finally(() => {
          setLoadingAverages(false);
        });
    }
  }, [activeFilterTab, selectedPartitionFilter]);

  // 1. Value Comparison Active Indicator (Removed to free vertical space for the dashboard)
  if (activeFilterTab === 'value') {
    return null;
  }

  // 2. Average Values Tab
  if (activeFilterTab === 'average') {
    return (
      <div className="glass-card p-6 border-slate-300 shadow-md space-y-5 animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shrink-0">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950">Dataset & Empirical Mean Averages</h3>
              <p className="text-xs text-slate-600 font-bold">
                Calculated directly from {averagesData?.total_records?.toLocaleString() || 'all'} independent observations & model predictions
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveFilterTab('value')}
            className="text-xs text-indigo-700 font-black hover:underline cursor-pointer"
          >
            Switch to Value Comparison
          </button>
        </div>

        {loadingAverages ? (
          <div className="py-8 flex items-center justify-center space-x-2 text-indigo-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-bold text-slate-700">Calculating empirical averages across active dataset records...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-300 shadow-sm">
              <span className="text-xs text-slate-600 uppercase font-black block">Mean NWP Rain</span>
              <span className="text-lg font-black text-slate-950 mt-1 block">
                {averagesData?.mean_nwp_rain_mm !== undefined && averagesData.mean_nwp_rain_mm !== 'Data unavailable' 
                  ? `${averagesData.mean_nwp_rain_mm} mm` 
                  : 'Data unavailable'}
              </span>
            </div>
            <div className="bg-indigo-50 p-3.5 rounded-xl border border-indigo-200 shadow-sm">
              <span className="text-xs text-indigo-900 uppercase font-black block">Mean AI Rain</span>
              <span className="text-lg font-black text-indigo-950 mt-1 block">
                {averagesData?.mean_ml_rain_mm !== undefined && averagesData.mean_ml_rain_mm !== 'Data unavailable' 
                  ? `${averagesData.mean_ml_rain_mm} mm` 
                  : 'Data unavailable'}
              </span>
            </div>
            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 shadow-sm">
              <span className="text-xs text-emerald-900 uppercase font-black block">Mean Observed</span>
              <span className="text-lg font-black text-emerald-950 mt-1 block">
                {averagesData?.mean_obs_rain_mm !== undefined && averagesData.mean_obs_rain_mm !== 'Data unavailable' 
                  ? `${averagesData.mean_obs_rain_mm} mm` 
                  : 'Data unavailable'}
              </span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-300 shadow-sm">
              <span className="text-xs text-slate-600 uppercase font-black block">Avg 2m Temp</span>
              <span className="text-lg font-black text-slate-950 mt-1 block">
                {averagesData?.avg_temp_c !== undefined && averagesData.avg_temp_c !== 'Data unavailable' 
                  ? `${averagesData.avg_temp_c} °C` 
                  : 'Data unavailable'}
              </span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-300 shadow-sm">
              <span className="text-xs text-slate-600 uppercase font-black block">Avg Humidity</span>
              <span className="text-lg font-black text-slate-950 mt-1 block">
                {averagesData?.avg_rh_pct !== undefined && averagesData.avg_rh_pct !== 'Data unavailable' 
                  ? `${averagesData.avg_rh_pct} %` 
                  : 'Data unavailable'}
              </span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-300 shadow-sm">
              <span className="text-xs text-slate-600 uppercase font-black block">Avg Pressure</span>
              <span className="text-lg font-black text-slate-950 mt-1 block">
                {averagesData?.avg_pressure_hpa !== undefined && averagesData.avg_pressure_hpa !== 'Data unavailable' 
                  ? `${averagesData.avg_pressure_hpa} hPa` 
                  : 'Data unavailable'}
              </span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-300 shadow-sm">
              <span className="text-xs text-slate-600 uppercase font-black block">Avg Wind Speed</span>
              <span className="text-lg font-black text-slate-950 mt-1 block">
                {averagesData?.avg_wind_speed_kmh !== undefined && averagesData.avg_wind_speed_kmh !== 'Data unavailable' 
                  ? `${averagesData.avg_wind_speed_kmh} km/h` 
                  : 'Data unavailable'}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Configure Analysis Tab
  if (activeFilterTab === 'configure') {
    return (
      <div className="glass-card p-6 border-indigo-300 bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/80 shadow-md space-y-5 animate-fade-in">
        <div className="flex items-center justify-between border-b border-indigo-200 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-indigo-950">Interactive Analysis Configuration</h3>
              <p className="text-xs text-indigo-800 font-bold">Adjust exceedance cutoffs, confidence intervals, and plot modes</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setThresholdCutoff(25);
              setChartType('area');
              setConfidenceLevel('95%');
            }}
            className="flex items-center space-x-1.5 text-xs text-indigo-700 font-black hover:text-indigo-900 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          
          {/* Threshold Cutoff */}
          <div className="space-y-2">
            <label className="font-black text-slate-950 uppercase text-xs tracking-wider block">
              Exceedance Threshold Cutoff ({thresholdCutoff} mm)
            </label>
            <div className="flex items-center space-x-2">
              {[10, 25, 50, 75].map((val) => (
                <button
                  key={val}
                  onClick={() => setThresholdCutoff(val)}
                  className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs border transition-all cursor-pointer ${
                    thresholdCutoff === val
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  &gt;{val}mm
                </button>
              ))}
            </div>
          </div>

          {/* Chart Display Mode */}
          <div className="space-y-2">
            <label className="font-black text-slate-950 uppercase text-xs tracking-wider block">
              Chart Representation Mode
            </label>
            <div className="flex items-center space-x-2">
              {[
                { id: 'area', label: 'Area Trend' },
                { id: 'bar', label: 'Bar Comparison' },
                { id: 'spline', label: 'Smooth Spline' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setChartType(m.id as any)}
                  className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs border transition-all cursor-pointer ${
                    chartType === m.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Confidence Interval */}
          <div className="space-y-2">
            <label className="font-black text-slate-950 uppercase text-xs tracking-wider block">
              Confidence Interval Band
            </label>
            <div className="flex items-center space-x-2">
              {['90%', '95%', '99%'].map((conf) => (
                <button
                  key={conf}
                  onClick={() => setConfidenceLevel(conf)}
                  className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs border transition-all cursor-pointer ${
                    confidenceLevel === conf
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {conf} CI
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // 4. Filter Analysis Tab
  if (activeFilterTab === 'filter') {
    const hasActiveFilters = selectedRegimeFilter !== 'all' || selectedGeographyFilter !== 'all' || selectedPartitionFilter !== 'all';

    return (
      <div className="glass-card p-6 border-emerald-300 bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/80 shadow-md space-y-5 animate-fade-in">
        <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl text-white shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-emerald-950">Active Analysis Data Filters</h3>
              <p className="text-xs text-emerald-800 font-bold">Filter forecast views by regime, elevation, or partition</p>
            </div>
          </div>
          {hasActiveFilters && (
            <button 
              onClick={() => {
                setSelectedRegimeFilter('all');
                setSelectedGeographyFilter('all');
                setSelectedPartitionFilter('all');
              }}
              className="flex items-center space-x-1.5 text-xs text-rose-600 font-black hover:underline cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          
          {/* Regime Filter */}
          <div className="space-y-2">
            <label className="font-black text-slate-950 uppercase text-xs tracking-wider block">
              Rainfall Regime
            </label>
            <select
              value={selectedRegimeFilter}
              onChange={(e) => setSelectedRegimeFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-950 font-extrabold rounded-xl px-3.5 h-[44px] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
            >
              <option value="all">All Regimes (0 to 5)</option>
              <option value="0">Regime 0 — Active Monsoon / Orographic Lift</option>
              <option value="1">Regime 1 — June Monsoon Onset & Coastal Orographic</option>
              <option value="2">Regime 2 — July Peak Active Surge</option>
              <option value="3">Regime 3 — August Mid-Monsoon Break/Active</option>
              <option value="4">Regime 4 — September Withdrawal & Lows</option>
              <option value="5">Regime 5 — October Post-Monsoon Transition</option>
            </select>
          </div>

          {/* Geography / Elevation Filter */}
          <div className="space-y-2">
            <label className="font-black text-slate-950 uppercase text-xs tracking-wider block">
              Station Geography / Altitude
            </label>
            <select
              value={selectedGeographyFilter}
              onChange={(e) => setSelectedGeographyFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-950 font-extrabold rounded-xl px-3.5 h-[44px] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Stations (Coastal & Western Ghats)</option>
              <option value="coastal">Coastal Plains (&lt; 20m Elevation)</option>
              <option value="inland">Inland / Orographic Ghats (&gt; 20m Elevation)</option>
            </select>
          </div>

          {/* Partition Filter */}
          <div className="space-y-2">
            <label className="font-black text-slate-950 uppercase text-xs tracking-wider block">
              Evaluation Partition
            </label>
            <select
              value={selectedPartitionFilter}
              onChange={(e) => setSelectedPartitionFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-950 font-extrabold rounded-xl px-3.5 h-[44px] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Records (Validation & Test)</option>
              <option value="validation">Validation Period [2024]</option>
              <option value="test">Independent Test Set [2025]</option>
            </select>
          </div>

        </div>
      </div>
    );
  }

  return null;
};

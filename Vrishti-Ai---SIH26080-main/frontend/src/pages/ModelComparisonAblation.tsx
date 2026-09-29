import React, { useState, useEffect } from 'react';
import { fetchAblationStudy } from '../services/api';
import { AblationExperiment } from '../types';
import { Cpu, ShieldCheck, Filter } from 'lucide-react';

export const ModelComparisonAblationPage: React.FC = () => {
  const [ablation, setAblation] = useState<AblationExperiment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchAblationStudy();
        setAblation(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-12 text-center border border-slate-300">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="mt-3 text-sm text-slate-800 font-extrabold">Loading operational model evaluation data...</p>
      </div>
    );
  }

  // Filter out candidate research steps when showActiveOnly is true
  const filteredAblation = showActiveOnly
    ? ablation.filter((exp) => {
        const title = exp.experiment.toLowerCase();
        // Keep: Raw NWP Baseline, Linear MOS, Selected Global ML, Regime-Aware ML
        return (
          (title.startsWith('a.') && title.includes('raw nwp')) ||
          (title.startsWith('b.') && title.includes('linear mos')) ||
          (title.startsWith('c.') && title.includes('selected global')) ||
          (title.startsWith('d.') && title.includes('regime-aware') && !title.includes('oracle'))
        );
      })
    : ablation;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-slate-800 shadow-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
              <Cpu className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {showActiveOnly ? 'Active Operational Model Comparison' : 'Full Research Ablation Study Trajectory'}
            </h2>
          </div>
          <p className="text-sm font-semibold text-slate-300 max-w-3xl">
            {showActiveOnly 
              ? 'Comparing the active operational AI/ML models evaluated on the independent test set (2025).' 
              : 'Displaying complete 10-step research model ablation trajectory evaluated on the independent test set (2025).'}
          </p>
        </div>
        
        {/* Toggle Filter Button */}
        <div className="flex items-center space-x-3 z-10">
          <button
            onClick={() => setShowActiveOnly(!showActiveOnly)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition shadow-md border border-indigo-400/40 cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span>{showActiveOnly ? 'Show All Research Steps' : 'Show Active Operational Models Only'}</span>
          </button>
          <div className="flex items-center gap-2 px-3.5 py-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-200 text-xs font-black shrink-0">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>{filteredAblation.length} {showActiveOnly ? 'Operational Models' : 'Research Steps'}</span>
          </div>
        </div>
      </div>

      {/* Models Table */}
      <div className="glass-card p-6 border-slate-300 shadow-md">
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="droit-table w-full text-xs text-left">
            <thead>
              <tr>
                <th className="py-3.5 px-4">Model Pipeline Step</th>
                <th className="py-3.5 px-4">Architecture</th>
                <th className="py-3.5 px-4">RMSE (mm)</th>
                <th className="py-3.5 px-4">MAE (mm)</th>
                <th className="py-3.5 px-4">Bias (mm)</th>
                <th className="py-3.5 px-4">R² Score</th>
                <th className="py-3.5 px-4">RMSE Improvement (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white font-semibold text-slate-900">
              {filteredAblation.map((exp, idx) => {
                const isOperational = exp.experiment.includes('Regime-Aware ML');
                const isSelectedGlobal = exp.experiment.includes('Selected Global ML');
                const isOracle = exp.experiment.includes('Oracle');
                return (
                  <tr
                    key={idx}
                    className={
                      isOperational
                        ? 'highlight-row bg-blue-50/80 border-l-4 border-indigo-600'
                        : isSelectedGlobal
                        ? 'bg-indigo-50/70 text-slate-900'
                        : isOracle
                        ? 'bg-slate-100 text-slate-700 italic'
                        : 'hover:bg-indigo-50/50 transition'
                    }
                  >
                    <td className="font-extrabold text-slate-900 py-3.5 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>{exp.experiment}</span>
                        {isOperational && <span className="bg-indigo-700 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">PRIMARY OPERATIONAL</span>}
                        {isSelectedGlobal && <span className="bg-emerald-700 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">GLOBAL ENSEMBLE</span>}
                        {isOracle && <span className="bg-slate-800 text-slate-200 text-[10px] font-black px-2 py-0.5 rounded-md">DIAGNOSTIC BOUND</span>}
                      </div>
                    </td>
                    <td className="font-mono font-bold text-slate-800 py-3.5 px-4">{exp.model_type}</td>
                    <td className="font-black py-3.5 px-4">{exp.rmse}</td>
                    <td className="py-3.5 px-4">{exp.mae}</td>
                    <td className="py-3.5 px-4">{exp.bias}</td>
                    <td className="font-extrabold py-3.5 px-4">{exp.r2}</td>
                    <td className="font-black text-emerald-700 py-3.5 px-4">
                      {exp.rmse_imp_pct > 0 ? `+${exp.rmse_imp_pct}%` : `${exp.rmse_imp_pct}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

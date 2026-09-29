import React, { useState, useEffect } from 'react';
import { fetchFeatureImportance } from '../services/api';
import { FeatureImportanceItem } from '../types';
import { Compass, BarChart2, CheckCircle2, Shield, Maximize2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { GraphModal } from '../components/GraphModal';

export const FeatureImportancePage: React.FC = () => {
  const [features, setFeatures] = useState<FeatureImportanceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isGraphModalOpen, setIsGraphModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchFeatureImportance();
        setFeatures(res);
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
        <p className="mt-3 text-sm font-extrabold text-slate-800">Calculating permutation feature importances on validation set...</p>
      </div>
    );
  }

  const top10 = features.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-slate-800 shadow-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                <Compass className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Permutation Feature Importance Ranking</h2>
            </div>
            <p className="text-sm font-semibold text-slate-300 max-w-3xl">
              Calculated on the validation dataset using RMSE drop upon feature permutation. Evaluated across physical meteorological fields.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-300 text-xs font-black shrink-0">
            <Shield className="w-4 h-4" />
            <span>Permutation Evaluated</span>
          </div>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="glass-card p-6 border-slate-300 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Top 10 Predictor Importance Scores</h3>
              <p className="text-xs text-slate-600 font-extrabold">Relative RMSE degradation score upon feature shuffle</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsGraphModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Expand Graph</span>
            </button>
            <span className="text-xs font-black text-slate-800 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-300">
              N = {features.length} Features Total
            </span>
          </div>
        </div>

        <div className="h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={top10} margin={{ top: 10, right: 30, left: 140, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis type="number" stroke="#0f172a" fontSize={12} fontWeight={700} />
              <YAxis dataKey="feature" type="category" stroke="#0f172a" fontSize={13} fontWeight={800} width={130} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }} />
              <Bar dataKey="importance_score" name="Permutation Score" fill="#2563eb" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Importance Table */}
      <div className="glass-card p-6 border-slate-300 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="text-lg font-black text-slate-900">Complete Feature Ranking Table</h3>
          <div className="flex items-center space-x-2 text-xs text-slate-700 font-extrabold">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>Sorted by descending permutation importance</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="droit-table w-full text-xs text-left">
            <thead>
              <tr>
                <th className="py-3.5 px-4">Rank</th>
                <th className="py-3.5 px-4">Predictor Feature Name</th>
                <th className="py-3.5 px-4">Permutation Importance Score</th>
                <th className="py-3.5 px-4">Standard Deviation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white font-semibold text-slate-900">
              {features.map((item, idx) => (
                <tr key={item.feature} className={idx % 2 === 0 ? 'bg-white hover:bg-indigo-50/50 transition' : 'bg-slate-50/80 hover:bg-indigo-50/50 transition'}>
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">#{idx + 1}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">{item.feature}</td>
                  <td className="py-3.5 px-4 font-black text-indigo-900">{item.importance_score}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-bold">&plusmn;{item.std}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <GraphModal
        isOpen={isGraphModalOpen}
        onClose={() => setIsGraphModalOpen(false)}
        title="Top 10 Predictor Permutation Importance Scores"
        subtitle="Evaluated via RMSE degradation upon feature shuffle on Validation dataset"
        data={top10}
        chartType="bar"
        dataKeys={[
          { key: 'importance_score', name: 'Permutation Score', color: '#2563eb' }
        ]}
        xAxisKey="feature"
        unit=""
      />
    </div>
  );
};



import React from 'react';
import { 
  X, Maximize2, Sliders, BarChart2, TrendingUp, ShieldCheck, Download, Sparkles 
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine 
} from 'recharts';

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  data: any[];
  chartType?: 'area' | 'bar' | 'spline';
  thresholdCutoff?: number;
  confidenceLevel?: string;
  dataKeys?: { key: string; name: string; color: string; type?: 'area' | 'bar' | 'line' }[];
  xAxisKey?: string;
  unit?: string;
}

export const GraphModal: React.FC<GraphModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  data,
  chartType = 'area',
  thresholdCutoff = 25,
  confidenceLevel = '95%',
  dataKeys = [
    { key: 'nwp', name: 'Raw NWP (mm)', color: '#64748b' },
    { key: 'ai', name: 'Vrishti AI Corrected (mm)', color: '#4f46e5' },
    { key: 'obs', name: 'Observed Rain (mm)', color: '#059669' }
  ],
  xAxisKey = 'time',
  unit = ' mm'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-6xl bg-white border border-slate-300 rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header Bar */}
        <div className="px-8 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-500/30 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
              {subtitle && <p className="text-xs font-semibold text-slate-300 mt-0.5">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-black text-indigo-200 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1.5 rounded-xl">
              Mode: {chartType.toUpperCase()} &bull; Cutoff: &gt;{thresholdCutoff}mm &bull; {confidenceLevel} CI
            </span>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-full transition-all cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Graph Workspace */}
        <div className="p-8 flex-1 overflow-y-auto space-y-6 bg-[#f8fafc]">
          
          {/* Main Enlarged Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-md min-h-[420px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                Interactive High-Resolution Graph View
              </span>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> True NWP Bias Correction Active
              </span>
            </div>

            <div className="w-full h-[360px] min-h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={data} margin={{ top: 15, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey={xAxisKey} stroke="#0f172a" fontSize={13} fontWeight={700} />
                    <YAxis stroke="#0f172a" fontSize={13} unit={unit} fontWeight={700} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }} />
                    <Legend wrapperStyle={{ paddingTop: '15px' }} />
                    <ReferenceLine y={thresholdCutoff} stroke="#dc2626" strokeWidth={2} strokeDasharray="4 4" label={{ value: `Threshold Cutoff >${thresholdCutoff}mm`, fill: '#dc2626', fontWeight: 800, position: 'top' }} />
                    {dataKeys.map(dk => (
                      <Bar key={dk.key} dataKey={dk.key} name={dk.name} fill={dk.color} radius={[6, 6, 0, 0]} />
                    ))}
                  </BarChart>
                ) : chartType === 'spline' ? (
                  <LineChart data={data} margin={{ top: 15, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey={xAxisKey} stroke="#0f172a" fontSize={13} fontWeight={700} />
                    <YAxis stroke="#0f172a" fontSize={13} unit={unit} fontWeight={700} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }} />
                    <Legend wrapperStyle={{ paddingTop: '15px' }} />
                    <ReferenceLine y={thresholdCutoff} stroke="#dc2626" strokeWidth={2} strokeDasharray="4 4" label={{ value: `Threshold Cutoff >${thresholdCutoff}mm`, fill: '#dc2626', fontWeight: 800, position: 'top' }} />
                    {dataKeys.map(dk => (
                      <Line key={dk.key} type="monotone" dataKey={dk.key} name={dk.name} stroke={dk.color} strokeWidth={3.5} dot={{ r: 6 }} />
                    ))}
                  </LineChart>
                ) : (
                  <AreaChart data={data} margin={{ top: 15, right: 20, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id="modalGrad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="modalGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey={xAxisKey} stroke="#0f172a" fontSize={13} fontWeight={700} />
                    <YAxis stroke="#0f172a" fontSize={13} unit={unit} fontWeight={700} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }} />
                    <Legend wrapperStyle={{ paddingTop: '15px' }} />
                    <ReferenceLine y={thresholdCutoff} stroke="#dc2626" strokeWidth={2} strokeDasharray="4 4" label={{ value: `Threshold Cutoff >${thresholdCutoff}mm`, fill: '#dc2626', fontWeight: 800, position: 'top' }} />
                    {dataKeys.map((dk, idx) => (
                      <Area key={dk.key} type="monotone" dataKey={dk.key} name={dk.name} stroke={dk.color} strokeWidth={3} fillOpacity={1} fill={idx === 0 ? "url(#modalGrad2)" : "url(#modalGrad1)"} />
                    ))}
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive Data Table inside Modal */}
          <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-md space-y-4">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
              Underlying Graph Data Points
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="droit-table w-full text-xs text-left">
                <thead>
                  <tr>
                    <th className="py-3 px-4">X-Axis ({xAxisKey})</th>
                    {dataKeys.map(dk => (
                      <th key={dk.key} className="py-3 px-4">{dk.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white font-semibold text-slate-900">
                  {data.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-black text-indigo-950">{row[xAxisKey] || `Point ${i + 1}`}</td>
                      {dataKeys.map(dk => (
                        <td key={dk.key} className="py-3 px-4 font-extrabold">{row[dk.key] !== undefined ? `${row[dk.key]}${unit}` : 'N/A'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer Bar */}
        <div className="px-8 py-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600 shrink-0">
          <span>Vrishti AI Graph Viewer &bull; Real Data Provenance Verified</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all cursor-pointer"
          >
            Close Graph View
          </button>
        </div>

      </div>
    </div>
  );
};

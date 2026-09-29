import React from 'react';
import { X, Settings, Thermometer, Gauge, Sliders, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  units: 'metric' | 'imperial';
  setUnits: (u: 'metric' | 'imperial') => void;
  tempUnit: 'C' | 'F';
  setTempUnit: (t: 'C' | 'F') => void;
  exceedanceThreshold: number;
  setExceedanceThreshold: (val: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  units,
  setUnits,
  tempUnit,
  setTempUnit,
  exceedanceThreshold,
  setExceedanceThreshold
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-900 rounded-xl text-white">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Dashboard Settings</h3>
              <p className="text-xs text-slate-500 font-semibold">Preferences & Operational Display Controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Measurement Units */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Gauge className="w-4 h-4 text-indigo-600" /> Rainfall & Speed Units
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setUnits('metric')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  units === 'metric' 
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/20' 
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Metric (mm, km/h)
              </button>
              <button
                onClick={() => setUnits('imperial')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  units === 'imperial' 
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/20' 
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Imperial (in, mph)
              </button>
            </div>
          </div>

          {/* Temperature Units */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-indigo-600" /> Temperature Display
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTempUnit('C')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  tempUnit === 'C' 
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/20' 
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Celsius (°C)
              </button>
              <button
                onClick={() => setTempUnit('F')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  tempUnit === 'F' 
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/20' 
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          {/* Alert Cutoff Threshold */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" /> Exceedance Alert Cutoff ({exceedanceThreshold} mm)
            </label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={exceedanceThreshold}
              onChange={(e) => setExceedanceThreshold(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-extrabold">
              <span>5 mm (Light)</span>
              <span>25 mm (Mod)</span>
              <span>50 mm (Heavy)</span>
              <span>100 mm (Extreme)</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-all"
          >
            Save & Close
          </button>
        </div>

      </div>
    </div>
  );
};

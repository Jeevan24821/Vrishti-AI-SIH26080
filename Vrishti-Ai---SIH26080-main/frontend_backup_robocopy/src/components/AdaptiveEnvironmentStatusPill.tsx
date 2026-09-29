import React from 'react';
import { CloudRain, Sparkles, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { AdaptiveEnvironmentConfig } from '../theme/adaptiveEnvironment';

interface Props {
  config: AdaptiveEnvironmentConfig;
}

export const AdaptiveEnvironmentStatusPill: React.FC<Props> = ({ config }) => {
  return (
    <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border shadow-md text-xs font-mono font-bold uppercase transition-all duration-500 ${config.badgeStyle}`}>
      <span className="text-sm shrink-0">{config.environmentIconEmoji}</span>
      <span className="truncate">{config.themeLabel}</span>
      <span className="opacity-40">|</span>
      <span className="flex items-center gap-1 font-sans text-[11px] font-semibold tracking-normal capitalize text-slate-200">
        {config.intensity === 'EXTREME' && <Zap className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
        {config.intensity === 'HEAVY' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
        {config.intensity === 'MODERATE' && <CloudRain className="w-3.5 h-3.5 text-cyan-400" />}
        {config.intensity === 'CALM' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
        <span>{config.weatherAtmosphereDesc}</span>
      </span>
    </div>
  );
};

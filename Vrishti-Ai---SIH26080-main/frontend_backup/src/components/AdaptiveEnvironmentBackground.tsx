import React from 'react';
import { AdaptiveEnvironmentConfig } from '../theme/adaptiveEnvironment';

interface Props {
  config: AdaptiveEnvironmentConfig;
}

export const AdaptiveEnvironmentBackground: React.FC<Props> = ({ config }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0 transition-all duration-700">
      
      {/* 1. Subtle Ambient Spotlight Glow */}
      <div className={`absolute -top-36 left-1/2 -translate-x-1/2 w-[800px] h-[400px] ${config.spotlightGlow} rounded-full pointer-events-none transition-all duration-1000`}></div>

      {/* 2. Soft Mist Fog Layer (very subtle translucent fog, slow drift) */}
      {config.showMistLayer && (
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-slate-900/10 opacity-40 animate-mist-drift pointer-events-none"></div>
      )}

      {/* 3. Soft Natural Rain Streaks (thin 1px low opacity, slow movement, NO blocky shapes) */}
      {config.showRainParticles && (
        <div className="absolute inset-0 opacity-25 overflow-hidden pointer-events-none z-0">
          <div className={`w-full h-[200%] ${config.rainParticleSpeed === 'fast' ? 'animate-rain-heavy' : 'animate-rain-light'}`}>
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <g stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" fill="none">
                <line x1="8%" y1="10" x2="7%" y2="50" />
                <line x1="22%" y1="140" x2="21%" y2="180" />
                <line x1="38%" y1="30" x2="37%" y2="70" />
                <line x1="52%" y1="180" x2="51%" y2="230" />
                <line x1="68%" y1="70" x2="67%" y2="120" />
                <line x1="82%" y1="220" x2="81%" y2="270" />
                <line x1="94%" y1="90" x2="93%" y2="130" />
              </g>
            </svg>
          </div>
        </div>
      )}

      {/* 4. Subtle Thunder Ambient Pulse for High Risk */}
      {config.showThunderFlash && (
        <div className="absolute inset-0 bg-indigo-400/5 pointer-events-none animate-thunder-flash"></div>
      )}

    </div>
  );
};

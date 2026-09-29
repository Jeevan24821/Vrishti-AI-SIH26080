import React from 'react';
import { 
  CloudRain, BarChart3, ShieldCheck, Cpu, Sliders, 
  Layers, Compass, LogOut, LogIn, ChevronRight, Sprout, Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: { name: string; email: string; role: string; dpUrl?: string } | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout
}) => {
  const groups = [
    {
      title: 'OPERATIONAL & FORECAST',
      items: [
        { id: 'advisor', label: 'AI Assistant', icon: Sparkles },
        { id: 'forecast', label: 'Operational Forecast', icon: CloudRain },
        { id: 'verification', label: 'Verification & Skill', icon: BarChart3 },
      ]
    },
    {
      title: 'ANALYTICS & INTELLIGENCE',
      items: [
        { id: 'sector-intelligence', label: 'Sector Intelligence', icon: Sprout },
        { id: 'regimes', label: 'Regime Intelligence', icon: Layers },
        { id: 'ablation', label: 'Ablation & Models', icon: Cpu },
        { id: 'features', label: 'Feature Importance', icon: Compass },
        { id: 'calibration', label: 'Probability Calibration', icon: ShieldCheck },
      ]
    },
    {
      title: 'TOOLS & SANDBOX',
      items: [
        { id: 'sandbox', label: 'Model Sandbox', icon: Sliders },
      ]
    }
  ];

  const avatarSrc = user?.dpUrl || (user?.email ? `https://unavatar.io/${encodeURIComponent(user.email)}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff&bold=true` : undefined);

  return (
    <aside className="w-[260px] min-w-[260px] bg-gradient-to-b from-[#0B1220] via-[#0E162B] to-[#111B35] text-white min-h-screen flex flex-col justify-between p-4 border-r border-[#94a3b8]/20 backdrop-blur-[20px] shadow-2xl z-30 flex-shrink-0">
      <div className="space-y-6">
        
        {/* Vrishti AI Brand Header — Animated */}
        <div className="flex items-center space-x-3 px-2 py-4 border-b border-slate-800/80 group">

          {/* Icon box: rotating gradient + pulsing glow ring + bouncing rain icon */}
          <div className="relative flex-shrink-0">
            {/* Pulsing halo */}
            <div
              className="absolute -inset-1 rounded-2xl opacity-40"
              style={{
                background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            {/* Icon container with animated gradient */}
            <div
              className="relative w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 overflow-hidden vrishti-logo-box"
            >
              {/* Shimmer sweep inside icon */}
              <div className="absolute inset-0 vrishti-logo-shimmer" />
              <CloudRain
                className="w-6 h-6 relative z-10 vrishti-rain-icon"
              />
            </div>
          </div>

          {/* Text section */}
          <div className="overflow-hidden">
            {/* Wordmark with shimmer */}
            <div className="font-black text-xl tracking-tight leading-none vrishti-wordmark">
              Vrishti AI
            </div>
            {/* Subtitle with animated live-dot */}
            <div className="flex items-center gap-1.5 mt-1">
              <div
                className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 vrishti-live-dot"
              />
              <p className="text-xs text-slate-400 font-bold">Operational Intelligence</p>
            </div>
          </div>
        </div>

        {/* Keyframe animations */}
        <style>{`
          .vrishti-logo-box {
            background: linear-gradient(135deg, #4f46e5, #2563eb, #7c3aed);
            animation: vrLogoGrad 4s ease-in-out infinite alternate;
          }
          .vrishti-logo-shimmer {
            background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%);
            background-size: 200% 100%;
            animation: vrShimmer 2.5s ease-in-out infinite;
            opacity: 0.35;
          }
          .vrishti-rain-icon {
            animation: vrRainBounce 1.8s ease-in-out infinite;
          }
          .vrishti-wordmark {
            background: linear-gradient(90deg, #ffffff 0%, #a5b4fc 35%, #38bdf8 55%, #ffffff 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: vrTextShimmer 3s linear infinite;
          }
          .vrishti-live-dot {
            box-shadow: 0 0 6px #34d399;
            animation: vrPulse 1.5s ease-in-out infinite;
          }

          @keyframes vrLogoGrad {
            0%   { background: linear-gradient(135deg, #4f46e5, #2563eb, #7c3aed); box-shadow: 0 4px 20px rgba(99,102,241,0.4); }
            33%  { background: linear-gradient(135deg, #3b82f6, #6366f1, #0ea5e9); box-shadow: 0 4px 20px rgba(59,130,246,0.5); }
            66%  { background: linear-gradient(135deg, #8b5cf6, #4f46e5, #06b6d4); box-shadow: 0 4px 20px rgba(139,92,246,0.4); }
            100% { background: linear-gradient(135deg, #6366f1, #7c3aed, #2563eb); box-shadow: 0 4px 24px rgba(99,102,241,0.6); }
          }
          @keyframes vrRainBounce {
            0%,100% { transform: translateY(0px) rotate(0deg);  opacity: 1;    }
            25%      { transform: translateY(-3px) rotate(-4deg); opacity: 0.8;  }
            50%      { transform: translateY(1px) rotate(0deg);  opacity: 1;    }
            75%      { transform: translateY(-1px) rotate(3deg); opacity: 0.9;  }
          }
          @keyframes vrShimmer {
            0%   { background-position: -200% center; }
            100% { background-position:  200% center; }
          }
          @keyframes vrTextShimmer {
            0%   { background-position: 0%   center; }
            100% { background-position: 200% center; }
          }
          @keyframes vrPulse {
            0%,100% { opacity: 1;   transform: scale(1);    }
            50%      { opacity: 0.5; transform: scale(0.75); }
          }
        `}</style>

        {/* Navigation Categories */}
        <nav className="space-y-6">
          {groups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <span className="px-3 text-xs font-black tracking-wider text-slate-400 uppercase block">
                {group.title}
              </span>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 h-[46px] text-[15px] font-bold rounded-xl transition-all duration-200 relative cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600/90 to-blue-600/90 text-white shadow-md shadow-indigo-500/20 border border-indigo-400/40 font-extrabold'
                          : 'text-slate-200 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isActive && <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] shrink-0"></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Profile Card */}
      <div className="pt-4 border-t border-slate-800">
        {user ? (
          <div className="bg-slate-900/90 rounded-xl p-3 flex items-center justify-between border border-slate-800 shadow-inner">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              {avatarSrc ? (
                <img 
                  src={avatarSrc} 
                  alt={user.name} 
                  className="w-10 h-10 rounded-xl object-cover border border-indigo-400/50 shadow-md flex-shrink-0 bg-slate-800"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-base shadow-md flex-shrink-0">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="truncate text-left">
                <div className="text-xs font-extrabold text-white truncate">{user.name}</div>
                <div className="text-[11px] text-slate-300 font-semibold truncate">{user.email}</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all ml-1 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onOpenAuth('login')}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-[46px] px-3.5 rounded-xl flex items-center justify-between text-xs font-black transition-all shadow-md cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <LogIn className="w-4 h-4 text-emerald-400" />
              <span>Sign In to Vrishti AI</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};

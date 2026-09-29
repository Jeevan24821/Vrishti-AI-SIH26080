import React, { useState, useEffect } from 'react';
import { Search, Bell, Settings, ShieldCheck, Filter, Sliders, BarChart2, Clock } from 'lucide-react';

interface NavbarProps {
  sha256Hash?: string;
  activeFilterTab: string;
  setActiveFilterTab: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onNavigate: (tab: string) => void;
  hasUnreadNotifications?: boolean;
  user?: { name: string; email: string; role: string; dpUrl?: string } | null;
  onOpenAuth?: (mode: 'login' | 'register') => void;
  activeMainTab?: string;
}
const searchItems = [
  {
    title: 'AI Assistant',
    description: 'Citizen weather safety assistant, permissible work durations, precautions & emergency stop warnings',
    keywords: 'ai assistant ai work advisor citizen safety portal advisor farming agriculture concrete construction hill landslide highway driving precautions work stop limit safety advice',
    tab: 'advisor'
  },
  {
    title: 'Operational Forecast',
    description: 'NWP, corrected rainfall, observed rainfall and forecast analysis',
    keywords: 'forecast operational rainfall nwp corrected observed precipitation prediction',
    tab: 'forecast'
  },
  {
    title: 'Verification & Skill',
    description: 'Model verification and rainfall forecast skill metrics',
    keywords: 'verification skill rmse csi ets pod far fss accuracy metrics',
    tab: 'verification'
  },
  {
    title: 'Sector Intelligence',
    description: 'Sectoral rainfall impact & thresholds analysis for agriculture, construction, landslide, urban flood and transport',
    keywords: 'sector intelligence agriculture construction building transport urban flood thresholds',
    tab: 'sector-intelligence'
  },
  {
    title: 'Regime Intelligence',
    description: 'Active monsoon, break monsoon and depression regime analysis',
    keywords: 'regime weather active monsoon break monsoon depression weather regime classification',
    tab: 'regimes'
  },
  {
    title: 'Ablation & Models',
    description: 'Compare models and evaluate ablation experiments',
    keywords: 'ablation models comparison machine learning xgboost random forest model comparison research steps',
    tab: 'ablation'
  },
  {
    title: 'Feature Importance',
    description: 'Analyze the importance of meteorological and model features',
    keywords: 'features feature importance variables shap predictors meteorological',
    tab: 'features'
  },
  {
    title: 'Probability Calibration',
    description: 'Calibration of rainfall exceedance probabilities and confidence',
    keywords: 'probability calibration exceedance probability confidence threshold reliability',
    tab: 'calibration'
  },
  {
    title: 'Model Sandbox',
    description: 'Interactive rainfall prediction and model experimentation',
    keywords: 'sandbox interactive experiment prediction model testing simulation',
    tab: 'sandbox'
  },
  {
    title: 'Weather Station',
    description: 'Station, district, taluka and elevation information',
    keywords: 'weather station station district taluka elevation geography location',
    tab: 'forecast'
  }
];
export const Navbar: React.FC<NavbarProps> = ({
  sha256Hash,
  activeFilterTab,
  setActiveFilterTab,
  searchQuery,
  setSearchQuery,
  onOpenNotifications,
  onOpenSettings,
  onNavigate,
  hasUnreadNotifications,
  user,
  onOpenAuth,
  activeMainTab
}) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const istDateStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(now);

  const istTimeStr = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(now);

  const filteredSearchItems = searchItems.filter((item) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return false;

    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.keywords.toLowerCase().includes(query)
    );
  });
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-300 sticky top-0 z-20 px-8 py-5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* LEFT: Clean Scientific Title */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">
            Vrishti AI Operational <br />
            Intelligence
          </h1>
          <p className="text-sm lg:text-base font-bold text-slate-700 mt-1">
            Regime-Aware Rainfall Bias-Correction & Exceedance Probabilities
          </p>
        </div>

        {/* CENTER/RIGHT: Search + Live Clock IST + Notifications + Settings */}
        <div className="flex items-center space-x-3 shrink-0">
          
          {/* Search Box */}
          <div className="relative">

            <Search className="w-5 h-5 text-slate-600 absolute left-3.5 top-3.5 pointer-events-none" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parameters or data..."
              className="bg-slate-50 border border-slate-300 text-slate-950 placeholder-slate-500 text-sm lg:text-base font-bold rounded-[12px] pl-11 pr-10 h-[46px] w-64 lg:w-80 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all shadow-sm"
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            )}

            {searchQuery.trim() !== '' && (
              <div className="absolute top-[52px] right-0 z-[9999] w-80 bg-white border border-slate-300 rounded-xl shadow-2xl overflow-hidden">

                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                  <p className="text-xs font-black uppercase text-slate-500">
                    Search Results
                  </p>
                </div>

                <div className="p-2">

                  {filteredSearchItems.length > 0 ? (
                    filteredSearchItems.map((item) => (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => {
                          onNavigate(item.tab);
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-3 rounded-lg hover:bg-indigo-50 active:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        <p className="font-black text-slate-900">
                          {item.title}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {item.description}
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm font-bold text-slate-700">
                        No results found
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        Try rainfall, regime, station, RMSE, CSI or forecast
                      </p>
                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

          {/* Live Indian Standard Time (IST) Date & Continuous Clock Component */}
          <div 
            title="Real-Time Live Indian Standard Time (IST)"
            className="flex items-center space-x-2.5 bg-slate-950 text-white text-xs lg:text-sm px-4 h-[46px] rounded-[12px] border border-slate-800 shadow-sm cursor-default"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
            <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="flex items-center space-x-2 font-mono font-bold">
              <span className="text-emerald-400 text-xs font-black tracking-wider">{istDateStr}</span>
              <span className="text-slate-600 font-extrabold">|</span>
              <span className="text-white text-xs font-black tracking-wider">{istTimeStr} IST</span>
            </div>
          </div>

          {/* Notifications Button */}
          <button 
            onClick={onOpenNotifications}
            title="Notifications & System Alerts"
            className="h-[46px] w-[46px] flex items-center justify-center text-slate-800 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-[12px] border border-slate-300 relative transition-all shadow-sm cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {hasUnreadNotifications && (
              <span className="w-2.5 h-2.5 bg-rose-600 rounded-full absolute top-3 right-3 ring-2 ring-white animate-pulse"></span>
            )}
          </button>

          {/* Settings Button */}
          <button 
            onClick={onOpenSettings}
            title="Settings & Display Options"
            className="h-[46px] w-[46px] flex items-center justify-center text-white bg-slate-950 hover:bg-slate-800 rounded-[12px] shadow-sm transition-all cursor-pointer"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* User Profile Badge / DP */}
          {user ? (
            <div 
              title={`Logged in as ${user.name} (${user.email})`}
              className="h-[46px] flex items-center space-x-2.5 bg-slate-900 text-white rounded-[12px] px-3.5 border border-slate-800 shadow-sm cursor-default shrink-0"
            >
              <img 
                src={user.dpUrl || `https://unavatar.io/${encodeURIComponent(user.email)}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff&bold=true`} 
                alt={user.name} 
                className="w-7 h-7 rounded-lg object-cover border border-indigo-400/50 shadow-sm shrink-0 bg-slate-800"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-black text-white leading-tight truncate max-w-[130px]">{user.name}</div>
                <div className="text-[10px] font-bold text-indigo-400 leading-tight truncate">{user.role}</div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth && onOpenAuth('login')}
              className="h-[46px] bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-4 rounded-[12px] shadow-sm transition-all flex items-center space-x-2 cursor-pointer shrink-0"
            >
              <span>Sign In</span>
            </button>
          )}

        </div>
      </div>

      {/* Navigation Sub-Tab Bar (Exclusive to Verification & Skill Tab) */}
      {activeMainTab === 'verification' && (
        <div className="flex items-center space-x-2 mt-5 pt-3 border-t border-slate-200 overflow-x-auto scrollbar-none">
          {[
            { id: 'value', label: 'Value comparison', icon: BarChart2 },
            { id: 'average', label: 'Average values', icon: Filter },
            { id: 'configure', label: 'Configure analysis', icon: Sliders },
            { id: 'filter', label: 'Filter analysis', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilterTab(tab.id)}
                className={`flex items-center gap-2.5 h-[48px] px-5 text-[15px] font-extrabold transition-all border-b-2 whitespace-nowrap rounded-t-xl cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-950 font-black bg-indigo-50/80 shadow-sm'
                    : 'border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-600'}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 ml-1"></span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

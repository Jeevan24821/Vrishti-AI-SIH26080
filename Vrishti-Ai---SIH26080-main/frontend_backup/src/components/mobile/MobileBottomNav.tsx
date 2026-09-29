import React from 'react';
import { Sparkles, CloudRain, BarChart3, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMobileMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu
}) => {
  const navItems = [
    { id: 'advisor', label: 'AI Assistant', icon: Sparkles },
    { id: 'forecast', label: 'Forecast', icon: CloudRain },
    { id: 'verification', label: 'Verification', icon: BarChart3 }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0B1220] border-t border-slate-800 flex items-center justify-around pb-safe pt-2 px-2 z-50 lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${
              isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 mb-1 ${isActive ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]' : ''}`} />
            <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
          </button>
        );
      })}
      
      {/* Menu button to open full side drawer */}
      <button
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all text-slate-400 hover:text-slate-200"
      >
        <Menu className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-bold tracking-wide">Menu</span>
      </button>
    </div>
  );
};

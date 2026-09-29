import React, { useState, useEffect, useCallback } from 'react';
import { Mail } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { NotificationsModal } from './components/NotificationsModal';
import { SettingsModal } from './components/SettingsModal';
import { SubNavControls } from './components/SubNavControls';

import { OperationalForecastPage } from './pages/OperationalForecast';
import { VerificationSkillPage } from './pages/VerificationSkill';
import { SectorIntelligencePage } from './pages/SectorIntelligence';
import { AIAdvisorPage } from './pages/AIAdvisor';
import { RegimeIntelligencePage } from './pages/RegimeIntelligence';
import { MobileBottomNav } from './components/mobile/MobileBottomNav';
import { ModelComparisonAblationPage } from './pages/ModelComparisonAblation';
import { FeatureImportancePage } from './pages/FeatureImportance';
import { CalibrationPage } from './pages/Calibration';
import { InteractiveSandboxPage } from './pages/InteractiveSandbox';
import { fetchProvenance } from './services/api';
import { Shield, Sparkles } from 'lucide-react';
import { AppNotification, ForecastRecord } from './types';

function generateStationNotifications(forecast: ForecastRecord): AppNotification[] {
  const list: AppNotification[] = [];
  const stName = `${forecast.taluka_name}, ${forecast.district_name}`;

  if (forecast.alert_level === 'RED' || forecast.alert_level === 'ORANGE' || forecast.ai_corrected_forecast_mm >= 64.5) {
    list.push({
      id: `alert-rain-${forecast.station_id}-${forecast.date}`,
      title: `Extreme Rainfall Warning (${forecast.rainfall_category})`,
      description: `High precipitation alert: ${stName} recorded ${forecast.ai_corrected_forecast_mm} mm AI corrected forecast on ${forecast.date}. Alert Level: ${forecast.alert_level}.`,
      time: 'Live Record',
      type: forecast.alert_level === 'RED' ? 'error' : 'warning',
      isRead: false,
      stationId: String(forecast.station_id),
      date: forecast.date
    });
  }

  if (forecast.wind_speed_10m_kmh && forecast.wind_speed_10m_kmh >= 20.0) {
    list.push({
      id: `alert-wind-${forecast.station_id}-${forecast.date}`,
      title: `High Wind Speed Alert (${forecast.wind_speed_10m_kmh} km/h)`,
      description: `Unusual wind velocity of ${forecast.wind_speed_10m_kmh} km/h recorded at ${stName} on ${forecast.date}.`,
      time: 'Live Record',
      type: 'warning',
      isRead: false,
      stationId: String(forecast.station_id),
      date: forecast.date
    });
  }

  if (forecast.relative_humidity_pct && forecast.relative_humidity_pct >= 90.0) {
    list.push({
      id: `alert-rh-${forecast.station_id}-${forecast.date}`,
      title: `Moisture Saturation Alert (${forecast.relative_humidity_pct}%)`,
      description: `Relative humidity at ${stName} reached ${forecast.relative_humidity_pct}% on ${forecast.date}.`,
      time: 'Live Record',
      type: 'info',
      isRead: false,
      stationId: String(forecast.station_id),
      date: forecast.date
    });
  }

  if (forecast.raw_nwp_abs_error !== null && forecast.ai_abs_error !== null && forecast.ai_abs_error < forecast.raw_nwp_abs_error) {
    list.push({
      id: `alert-bias-${forecast.station_id}-${forecast.date}`,
      title: `Vrishti AI Error Correction (-${(forecast.raw_nwp_abs_error - forecast.ai_abs_error).toFixed(2)} mm)`,
      description: `Regime-aware post-processing reduced raw NWP error from ${forecast.raw_nwp_abs_error.toFixed(2)}mm down to ${forecast.ai_abs_error.toFixed(2)}mm at ${stName}.`,
      time: 'Live Record',
      type: 'success',
      isRead: false,
      stationId: String(forecast.station_id),
      date: forecast.date
    });
  }

  list.push({
    id: `alert-regime-${forecast.station_id}-${forecast.date}`,
    title: `Weather Regime: ${forecast.predicted_regime_name}`,
    description: `Calibrated classifier routed station ${stName} (${forecast.date}) to ${forecast.predicted_regime_name}.`,
    time: 'Live Record',
    type: 'info',
    isRead: false,
    stationId: String(forecast.station_id),
    date: forecast.date
  });

  return list;
}

export function App() {
  const [activeTab, setActiveTab] = useState<string>('advisor');
  const [activeFilterTab, setActiveFilterTab] = useState<string>('value');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sha256, setSha256] = useState<string>('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  // User Authentication State (Starts unauthenticated on fresh dashboard opening)
  const [user, setUser] = useState<{ name: string; email: string; role: string; dpUrl?: string } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'verify_code'>('login');

  // Notifications & Settings Modals
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Dashboard Display Settings
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [exceedanceThreshold, setExceedanceThreshold] = useState<number>(50);

  // Analysis Configuration & Filters State
  const [thresholdCutoff, setThresholdCutoff] = useState<number>(25);
  const [chartType, setChartType] = useState<'area' | 'bar' | 'spline'>('area');
  const [confidenceLevel, setConfidenceLevel] = useState<string>('95%');

  const [selectedRegimeFilter, setSelectedRegimeFilter] = useState<string>('all');
  const [selectedGeographyFilter, setSelectedGeographyFilter] = useState<string>('all');
  const [selectedPartitionFilter, setSelectedPartitionFilter] = useState<string>('all');
  const [emailToast, setEmailToast] = useState<{ email: string; code: string } | null>(null);

  useEffect(() => {
    fetchProvenance()
      .then(p => setSha256(p.dataset_hash_sha256))
      .catch(console.error);

    const handleEmailDispatched = (e: any) => {
      if (e.detail) {
        setEmailToast({ email: e.detail.email, code: e.detail.code });
      }
    };
    window.addEventListener('vrishti_email_dispatched', handleEmailDispatched);
    return () => window.removeEventListener('vrishti_email_dispatched', handleEmailDispatched);
  }, []);

  const handleForecastLoaded = useCallback((forecast: ForecastRecord) => {
    const alerts = generateStationNotifications(forecast);
    setNotifications(alerts);
  }, []);

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const hasUnreadNotifications = notifications.some(n => !n.isRead);

  const handleOpenAuth = (mode: 'login' | 'register' | 'forgot' | 'verify_code') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLoginSuccess = (loggedUser: { name: string; email: string; role: string; dpUrl?: string }) => {
    setUser(loggedUser);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('vrishti_active_user');
      sessionStorage.removeItem('vrishti_active_user');
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
  };

  const [navContext, setNavContext] = useState<any>(null);

  const handleNavigateWithContext = (destination: string, context?: any) => {
    setNavContext(context || null);
    const dest = (destination || '').toLowerCase();
    if (dest === 'map' || dest === 'forecast') {
      setActiveTab('forecast');
    } else if (dest === 'verification' || dest === 'audit' || dest === 'provenance') {
      setActiveTab('verification');
    } else if (dest === 'sandbox') {
      setActiveTab('sandbox');
    } else if (dest === 'regime' || dest === 'regimes') {
      setActiveTab('regimes');
    } else if (dest === 'feature_importance' || dest === 'features') {
      setActiveTab('features');
    } else if (dest === 'calibration') {
      setActiveTab('calibration');
    } else if (dest === 'ablation') {
      setActiveTab('ablation');
    } else {
      setActiveTab('forecast');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'advisor':
        return <AIAdvisorPage onNavigate={handleNavigateWithContext} />;

      case 'forecast':
        return (
          <OperationalForecastPage 
            searchQuery={searchQuery} 
            onForecastLoaded={handleForecastLoaded}
            thresholdCutoff={thresholdCutoff}
            chartType={chartType}
            confidenceLevel={confidenceLevel}
            selectedRegimeFilter={selectedRegimeFilter}
            selectedGeographyFilter={selectedGeographyFilter}
            selectedPartitionFilter={selectedPartitionFilter}
            initialState={navContext?.state}
            initialDistrict={navContext?.district}
            initialStation={navContext?.station_id}
            initialDate={navContext?.date}
            initialLayer={navContext?.layer}
            initialScrollToMap={navContext?.scroll_to_map}
          />
        );

      case 'verification':
        return (
          <VerificationSkillPage 
            thresholdCutoff={thresholdCutoff}
            chartType={chartType}
            confidenceLevel={confidenceLevel}
            selectedRegimeFilter={selectedRegimeFilter}
            selectedGeographyFilter={selectedGeographyFilter}
            selectedPartitionFilter={selectedPartitionFilter}
            initialState={navContext?.state}
            initialMetric={navContext?.metric}
            initialMode={navContext?.mode}
          />
        );

      case 'sector-intelligence':
        return <SectorIntelligencePage />;

      case 'regimes':
        return <RegimeIntelligencePage />;

      case 'ablation':
        return <ModelComparisonAblationPage />;

      case 'features':
        return <FeatureImportancePage />;

      case 'calibration':
        return <CalibrationPage />;

      case 'sandbox':
        return (
          <InteractiveSandboxPage 
            initialParameters={navContext?.scenario_parameters}
            initialStation={navContext?.station_id}
            initialDate={navContext?.date}
          />
        );

      default:
        return (
          <OperationalForecastPage 
            searchQuery={searchQuery} 
            onForecastLoaded={handleForecastLoaded}
            thresholdCutoff={thresholdCutoff}
            chartType={chartType}
            confidenceLevel={confidenceLevel}
            selectedRegimeFilter={selectedRegimeFilter}
            selectedGeographyFilter={selectedGeographyFilter}
            selectedPartitionFilter={selectedPartitionFilter}
            initialState={navContext?.state}
            initialDistrict={navContext?.district}
            initialStation={navContext?.station_id}
            initialDate={navContext?.date}
            initialLayer={navContext?.layer}
            initialScrollToMap={navContext?.scroll_to_map}
          />
        );
    }
  };

  // Guard: If no active user session, force full-screen Auth Login
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <AuthModal
          isOpen={true}
          initialMode="login"
          canClose={false}
          onClose={() => {}}
          onSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-row font-sans overflow-x-hidden">
      
      {/* Left Sidebar (Desktop) / Off-canvas Menu (Mobile) */}
      <div className={`fixed inset-0 z-40 lg:static lg:z-auto ${isMobileMenuOpen ? 'flex' : 'hidden lg:flex'}`}>
        {/* Backdrop for mobile */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        <div className={`relative ${isMobileMenuOpen ? 'w-[280px]' : ''}`}>
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setIsMobileMenuOpen(false);
            }}
            user={user}
            onOpenAuth={handleOpenAuth}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <Navbar
          sha256Hash={sha256}
          activeFilterTab={activeFilterTab}
          setActiveFilterTab={setActiveFilterTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onNavigate={(tab) => setActiveTab(tab)}
          hasUnreadNotifications={hasUnreadNotifications}
          user={user}
          onOpenAuth={handleOpenAuth}
          activeMainTab={activeTab}
        />

        {/* Main Canvas Workspace */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-8 space-y-6 pb-24 lg:pb-8">
          
          {/* Sub-Nav Filter Controls (Value comparison / Average values / Configure analysis / Filter analysis) */}
          {activeTab === 'verification' && (
            <SubNavControls
              activeFilterTab={activeFilterTab}
              setActiveFilterTab={setActiveFilterTab}
              thresholdCutoff={thresholdCutoff}
              setThresholdCutoff={setThresholdCutoff}
              chartType={chartType}
              setChartType={setChartType}
              confidenceLevel={confidenceLevel}
              setConfidenceLevel={setConfidenceLevel}
              selectedRegimeFilter={selectedRegimeFilter}
              setSelectedRegimeFilter={setSelectedRegimeFilter}
              selectedGeographyFilter={selectedGeographyFilter}
              setSelectedGeographyFilter={setSelectedGeographyFilter}
              selectedPartitionFilter={selectedPartitionFilter}
              setSelectedPartitionFilter={setSelectedPartitionFilter}
            />
          )}

          {renderContent()}
        </main>

        {/* Clean Scientific Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 text-xs font-semibold text-slate-600 px-8">
          <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>
                &copy; 2026 <strong className="text-slate-900 font-extrabold">Vrishti AI</strong> &bull; Operational Intelligence Board &bull; Multi-Region Coverage
              </span>
            </div>
          </div>
        </footer>

      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Operational Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllAsRead}
      />

      {/* System Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        units={units}
        setUnits={setUnits}
        tempUnit={tempUnit}
        setTempUnit={setTempUnit}
        exceedanceThreshold={exceedanceThreshold}
        setExceedanceThreshold={setExceedanceThreshold}
      />

      {/* Live Email Dispatch Toast Popup */}
      {emailToast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-950 text-white border border-indigo-500/60 rounded-2xl p-4 shadow-2xl flex items-start space-x-3.5 max-w-sm animate-fade-in mb-16 lg:mb-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md">
            <Mail className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-indigo-400 uppercase tracking-wider">📩 Email Sent to Inbox</span>
              <button 
                onClick={() => setEmailToast(null)} 
                className="text-slate-400 hover:text-white font-black text-xs p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-300 font-semibold truncate">
              Verification email sent to <strong className="text-white">{emailToast.email}</strong>.
            </p>
            <p className="text-[11px] text-slate-400 mt-1 font-semibold">
              Please check your email inbox and spam folder for the code.
            </p>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
    </div>
  );
}

export default App;

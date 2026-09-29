export type SectorType = 'construction' | 'agriculture' | 'landslide' | 'urban_flood' | 'transport' | 'general';
export type WeatherIntensity = 'CALM' | 'MODERATE' | 'HEAVY' | 'EXTREME';

export interface AdaptiveEnvironmentConfig {
  sector: SectorType;
  intensity: WeatherIntensity;
  rainMm: number;
  regime: string;
  statusLabel: string;
  
  // Visual Styles
  containerBg: string;
  spotlightGlow: string;
  bannerGradient: string;
  cardBg: string;
  badgeStyle: string;
  accentColor: string;
  themeLabel: string;
  patternClass: string;
  
  // Dynamic Environment Badges
  environmentTitle: string;
  environmentIconEmoji: string;
  weatherAtmosphereDesc: string;
  
  // Layer Toggles
  showRainParticles: boolean;
  rainParticleSpeed: 'slow' | 'fast';
  showMistLayer: boolean;
  showThunderFlash: boolean;
  showGridOverlay: boolean;
}

export const computeAdaptiveTheme = (
  sectorId: string,
  result: any | null,
  loading: boolean,
  submittedQuery: string
): AdaptiveEnvironmentConfig => {
  // 1. Determine Effective Sector
  const effectiveSector: SectorType = 
    (sectorId === 'agriculture' || sectorId === 'construction' || sectorId === 'landslide' || sectorId === 'urban_flood' || sectorId === 'transport')
      ? (sectorId as SectorType)
      : 'general';

  // 2. Determine Weather Intensity strictly from REAL VRISHTI forecast data
  let rainMm = 0.0;
  let status = 'SAFE';
  let regime = 'Standard Monsoon Flow';

  if (result?.forecast) {
    rainMm = floatOrZero(result.forecast.ai_corrected_rain_6h_mm);
    regime = result.forecast.predicted_regime_name || regime;
  }
  if (result?.evaluation) {
    status = result.evaluation.status_code || status;
  }

  let intensity: WeatherIntensity = 'CALM';
  if (rainMm > 20.0 || status === 'UNSAFE' || status === 'DANGER' || result?.status_code === 'CRITICAL') {
    intensity = 'EXTREME';
  } else if (rainMm > 8.0 || status === 'UNSAFE') {
    intensity = 'HEAVY';
  } else if (rainMm > 1.5 || status === 'CAUTION') {
    intensity = 'MODERATE';
  } else {
    intensity = 'CALM';
  }

  // 3. Construct Sector + Weather State Environment
  return getThemeForSectorAndIntensity(effectiveSector, intensity, rainMm, regime, status);
};

const floatOrZero = (val: any): number => {
  const n = parseFloat(val);
  return isNaN(n) ? 0.0 : n;
};

const getThemeForSectorAndIntensity = (
  sector: SectorType,
  intensity: WeatherIntensity,
  rainMm: number,
  regime: string,
  status: string
): AdaptiveEnvironmentConfig => {
  const glassCard = "bg-[#081228]/95 border border-slate-700/60 shadow-2xl";
  const glassBanner = "bg-[#081228]/92 border border-slate-700/60 shadow-xl";

  switch (sector) {
    case 'construction': {
      if (intensity === 'EXTREME' || intensity === 'HEAVY') {
        return {
          sector, intensity, rainMm, regime, statusLabel: status,
          containerBg: "border-rose-500/40 shadow-rose-950/40",
          spotlightGlow: "bg-rose-500/20 shadow-rose-500/30",
          bannerGradient: glassBanner,
          cardBg: glassCard,
          badgeStyle: "bg-rose-500/20 text-rose-300 border-rose-500/50",
          accentColor: "text-indigo-400",
          themeLabel: "🏗️ Blueprint & Heavy Rain Storm",
          patternClass: "",
          environmentTitle: "Engineering & Steel Infrastructure",
          environmentIconEmoji: "🏗️",
          weatherAtmosphereDesc: `Heavy Rain (${rainMm.toFixed(1)} mm/6h) • Wash-out Risk`,
          showRainParticles: true, rainParticleSpeed: 'fast', showMistLayer: true, showThunderFlash: true, showGridOverlay: false
        };
      } else if (intensity === 'MODERATE') {
        return {
          sector, intensity, rainMm, regime, statusLabel: status,
          containerBg: "border-indigo-500/40 shadow-indigo-950/40",
          spotlightGlow: "bg-indigo-500/20",
          bannerGradient: glassBanner,
          cardBg: glassCard,
          badgeStyle: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
          accentColor: "text-indigo-400",
          themeLabel: "🏗️ Blueprint & Drizzle Atmosphere",
          patternClass: "",
          environmentTitle: "Structural Steel & Concrete Site",
          environmentIconEmoji: "🏗️",
          weatherAtmosphereDesc: `Moderate Rain (${rainMm.toFixed(1)} mm/6h) • Moisture Control`,
          showRainParticles: true, rainParticleSpeed: 'slow', showMistLayer: false, showThunderFlash: false, showGridOverlay: false
        };
      } else {
        return {
          sector, intensity, rainMm, regime, statusLabel: status,
          containerBg: "border-indigo-500/30 shadow-indigo-950/30",
          spotlightGlow: "bg-cyan-500/15",
          bannerGradient: glassBanner,
          cardBg: glassCard,
          badgeStyle: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
          accentColor: "text-indigo-400",
          themeLabel: "🏗️ Construction Site Theme",
          patternClass: "",
          environmentTitle: "Architectural & Engineering Works",
          environmentIconEmoji: "🏗️",
          weatherAtmosphereDesc: `Dry/Calm (${rainMm.toFixed(1)} mm/6h) • Full Workability`,
          showRainParticles: false, rainParticleSpeed: 'slow', showMistLayer: false, showThunderFlash: false, showGridOverlay: false
        };
      }
    }

    case 'agriculture': {
      if (intensity === 'EXTREME' || intensity === 'HEAVY') {
        return {
          sector, intensity, rainMm, regime, statusLabel: status,
          containerBg: "border-emerald-500/40 shadow-emerald-950/40",
          spotlightGlow: "bg-emerald-500/20",
          bannerGradient: glassBanner,
          cardBg: glassCard,
          badgeStyle: "bg-amber-500/20 text-amber-300 border-amber-500/50",
          accentColor: "text-emerald-400",
          themeLabel: "🌾 Agricultural Fields & Downpour",
          patternClass: "",
          environmentTitle: "Monsoon Paddy & Agricultural Terrain",
          environmentIconEmoji: "🌾",
          weatherAtmosphereDesc: `Heavy Downpour (${rainMm.toFixed(1)} mm/6h) • Waterlogging Risk`,
          showRainParticles: true, rainParticleSpeed: 'fast', showMistLayer: true, showThunderFlash: true, showGridOverlay: false
        };
      } else {
        return {
          sector, intensity, rainMm, regime, statusLabel: status,
          containerBg: "border-emerald-500/30 shadow-emerald-950/30",
          spotlightGlow: "bg-emerald-500/15",
          bannerGradient: glassBanner,
          cardBg: glassCard,
          badgeStyle: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
          accentColor: "text-emerald-400",
          themeLabel: "🌾 Farming & Agriculture Theme",
          patternClass: "",
          environmentTitle: "Paddy & Agro-Climatic Canopy",
          environmentIconEmoji: "🌾",
          weatherAtmosphereDesc: `Optimal Field Conditions (${rainMm.toFixed(1)} mm/6h)`,
          showRainParticles: false, rainParticleSpeed: 'slow', showMistLayer: false, showThunderFlash: false, showGridOverlay: false
        };
      }
    }

    case 'landslide': {
      if (intensity === 'EXTREME' || intensity === 'HEAVY') {
        return {
          sector, intensity, rainMm, regime, statusLabel: status,
          containerBg: "border-amber-500/50 shadow-amber-950/50",
          spotlightGlow: "bg-amber-500/25",
          bannerGradient: glassBanner,
          cardBg: glassCard,
          badgeStyle: "bg-rose-500/25 text-rose-300 border-rose-500/60",
          accentColor: "text-amber-400",
          themeLabel: "🏔️ Western Ghats Storm & Slope Hazard",
          patternClass: "",
          environmentTitle: "Western Ghats Mountain & Slope Terrain",
          environmentIconEmoji: "🏔️",
          weatherAtmosphereDesc: `Mountain Downpour (${rainMm.toFixed(1)} mm/6h) • Landslide Alert`,
          showRainParticles: true, rainParticleSpeed: 'fast', showMistLayer: true, showThunderFlash: true, showGridOverlay: false
        };
      } else if (intensity === 'MODERATE') {
        return {
          sector, intensity, rainMm, regime, statusLabel: status,
          containerBg: "border-amber-500/30 shadow-amber-950/30",
          spotlightGlow: "bg-amber-500/15",
          bannerGradient: glassBanner,
          cardBg: glassCard,
          badgeStyle: "bg-amber-500/20 text-amber-300 border-amber-500/50",
          accentColor: "text-amber-400",
          themeLabel: "🏔️ Mountain Mist & Ghat Road",
          patternClass: "",
          environmentTitle: "High-Altitude Ghat Pass & Misty Slopes",
          environmentIconEmoji: "🏔️",
          weatherAtmosphereDesc: `Mountain Rain (${rainMm.toFixed(1)} mm/6h) • Traction Caution`,
          showRainParticles: true, rainParticleSpeed: 'slow', showMistLayer: true, showThunderFlash: false, showGridOverlay: false
        };
      } else {
        return {
          sector, intensity, rainMm, regime, statusLabel: status,
          containerBg: "border-amber-500/30 shadow-amber-950/30",
          spotlightGlow: "bg-amber-500/10",
          bannerGradient: glassBanner,
          cardBg: glassCard,
          badgeStyle: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          accentColor: "text-amber-400",
          themeLabel: "🏔️ Hill Safety & Travel Theme",
          patternClass: "",
          environmentTitle: "Western Ghats Mountain Ridge",
          environmentIconEmoji: "🏔️",
          weatherAtmosphereDesc: `Misty conditions • Variable rainfall • Landslide risk`,
          showRainParticles: false, rainParticleSpeed: 'slow', showMistLayer: true, showThunderFlash: false, showGridOverlay: false
        };
      }
    }

    case 'urban_flood': {
      return {
        sector, intensity, rainMm, regime, statusLabel: status,
        containerBg: "border-cyan-500/30 shadow-cyan-950/30",
        spotlightGlow: "bg-cyan-500/15",
        bannerGradient: glassBanner,
        cardBg: glassCard,
        badgeStyle: "bg-cyan-500/20 text-cyan-300 border-cyan-500/50",
        accentColor: "text-cyan-400",
        themeLabel: "🏙️ City Drainage & Safety Theme",
        patternClass: "",
        environmentTitle: "City Drainage & Stormwater Corridors",
        environmentIconEmoji: "🏙️",
        weatherAtmosphereDesc: `Urban Runoff (${rainMm.toFixed(1)} mm/6h)`,
        showRainParticles: intensity !== 'CALM', rainParticleSpeed: 'slow', showMistLayer: false, showThunderFlash: false, showGridOverlay: false
      };
    }

    case 'transport': {
      return {
        sector, intensity, rainMm, regime, statusLabel: status,
        containerBg: "border-rose-500/30 shadow-rose-950/30",
        spotlightGlow: "bg-rose-500/15",
        bannerGradient: glassBanner,
        cardBg: glassCard,
        badgeStyle: "bg-rose-500/20 text-rose-300 border-rose-500/50",
        accentColor: "text-rose-400",
        themeLabel: "🚚 Highway & Logistics Driving Theme",
        patternClass: "",
        environmentTitle: "Highway & Transport Infrastructure",
        environmentIconEmoji: "🚚",
        weatherAtmosphereDesc: `Road Traction (${rainMm.toFixed(1)} mm/6h)`,
        showRainParticles: intensity !== 'CALM', rainParticleSpeed: 'slow', showMistLayer: false, showThunderFlash: false, showGridOverlay: false
      };
    }

    default: {
      return {
        sector: 'general', intensity, rainMm, regime, statusLabel: status,
        containerBg: "border-indigo-500/30 shadow-indigo-950/30",
        spotlightGlow: "bg-indigo-500/15",
        bannerGradient: glassBanner,
        cardBg: glassCard,
        badgeStyle: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
        accentColor: "text-indigo-400",
        themeLabel: "☁️ General Weather Theme",
        patternClass: "",
        environmentTitle: "VRISHTI Synoptic Weather Intelligence",
        environmentIconEmoji: "☁️",
        weatherAtmosphereDesc: `General Monsoonal Forecast (${rainMm.toFixed(1)} mm/6h)`,
        showRainParticles: intensity !== 'CALM', rainParticleSpeed: 'slow', showMistLayer: false, showThunderFlash: false, showGridOverlay: false
      };
    }
  }
};

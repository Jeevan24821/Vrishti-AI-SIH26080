export interface ThemeConfigItem {
  id: string;
  name: string;
  category: string;
  badgeLabel: string;
  badgeEmoji: string;
  accentColor: string;
  glowColor: string;
  clearImage: string;
  rainImage: string;
  defaultImage: string;
  overlayGradient: string;
  cardGlassBg: string;
  headerBannerBg: string;
}

export const THEME_CONFIG: Record<string, ThemeConfigItem> = {
  default: {
    id: 'default',
    name: 'VRISHTI Weather Intelligence',
    category: 'default',
    badgeLabel: 'VRISHTI WEATHER INTELLIGENCE',
    badgeEmoji: '🛰️',
    accentColor: 'text-indigo-400',
    glowColor: 'bg-indigo-500/15',
    clearImage: '/assets/vrishti/themes/default.webp',
    rainImage: '/assets/vrishti/themes/default.webp',
    defaultImage: '/assets/vrishti/themes/default.webp',
    overlayGradient: 'from-slate-950/90 via-slate-950/75 to-indigo-950/60',
    cardGlassBg: 'bg-[#081228]/95 border border-indigo-500/30 shadow-2xl',
    headerBannerBg: 'from-slate-900 via-indigo-950/90 to-slate-900 border-indigo-500/40 shadow-xl'
  },
  construction: {
    id: 'construction',
    name: 'Construction & Building',
    category: 'construction',
    badgeLabel: 'BUILDING & INFRASTRUCTURE THEME',
    badgeEmoji: '🏗️',
    accentColor: 'text-indigo-400',
    glowColor: 'bg-indigo-500/15',
    clearImage: '/assets/vrishti/themes/construction-rain.webp',
    rainImage: '/assets/vrishti/themes/construction-rain.webp',
    defaultImage: '/assets/vrishti/themes/construction-rain.webp',
    overlayGradient: 'from-slate-950/90 via-slate-950/75 to-indigo-950/60',
    cardGlassBg: 'bg-[#081228]/95 border border-indigo-500/30 shadow-2xl',
    headerBannerBg: 'from-slate-900 via-indigo-950/90 to-slate-900 border-indigo-500/40 shadow-xl'
  },
  agriculture: {
    id: 'agriculture',
    name: 'Farming & Agriculture',
    category: 'agriculture',
    badgeLabel: 'FARMING & AGRICULTURE THEME',
    badgeEmoji: '🌾',
    accentColor: 'text-emerald-400',
    glowColor: 'bg-emerald-500/15',
    clearImage: '/assets/vrishti/themes/agriculture-rain.webp',
    rainImage: '/assets/vrishti/themes/agriculture-rain.webp',
    defaultImage: '/assets/vrishti/themes/agriculture-rain.webp',
    overlayGradient: 'from-slate-950/90 via-slate-950/75 to-emerald-950/60',
    cardGlassBg: 'bg-[#081228]/95 border border-emerald-500/30 shadow-2xl',
    headerBannerBg: 'from-slate-900 via-emerald-950/90 to-slate-900 border-emerald-500/40 shadow-xl'
  },
  landslide: {
    id: 'landslide',
    name: 'Hill Safety & Travel',
    category: 'landslide',
    badgeLabel: 'WESTERN GHATS HILL SAFETY THEME',
    badgeEmoji: '🏔️',
    accentColor: 'text-amber-400',
    glowColor: 'bg-amber-500/15',
    clearImage: '/assets/vrishti/themes/hill-safety.webp',
    rainImage: '/assets/vrishti/themes/hill-safety.webp',
    defaultImage: '/assets/vrishti/themes/hill-safety.webp',
    overlayGradient: 'from-slate-950/90 via-slate-950/75 to-amber-950/60',
    cardGlassBg: 'bg-[#081228]/95 border border-amber-500/30 shadow-2xl',
    headerBannerBg: 'from-stone-950 via-amber-950/90 to-slate-900 border-amber-500/40 shadow-xl'
  },
  urban_flood: {
    id: 'urban_flood',
    name: 'City Drainage & Safety',
    category: 'urban_flood',
    badgeLabel: 'CITY DRAINAGE & URBAN SAFETY THEME',
    badgeEmoji: '🏙️',
    accentColor: 'text-cyan-400',
    glowColor: 'bg-cyan-500/15',
    clearImage: '/assets/vrishti/themes/city-rain.webp',
    rainImage: '/assets/vrishti/themes/city-rain.webp',
    defaultImage: '/assets/vrishti/themes/city-rain.webp',
    overlayGradient: 'from-slate-950/90 via-slate-950/75 to-cyan-950/60',
    cardGlassBg: 'bg-[#081228]/95 border border-cyan-500/30 shadow-2xl',
    headerBannerBg: 'from-slate-950 via-cyan-950/90 to-slate-900 border-cyan-500/40 shadow-xl'
  },
  transport: {
    id: 'transport',
    name: 'Highway & Driving',
    category: 'transport',
    badgeLabel: 'HIGHWAY & ROAD LOGISTICS THEME',
    badgeEmoji: '🚚',
    accentColor: 'text-rose-400',
    glowColor: 'bg-rose-500/15',
    clearImage: '/assets/vrishti/themes/highway-rain.webp',
    rainImage: '/assets/vrishti/themes/highway-rain.webp',
    defaultImage: '/assets/vrishti/themes/highway-rain.webp',
    overlayGradient: 'from-slate-950/90 via-slate-950/75 to-rose-950/60',
    cardGlassBg: 'bg-[#081228]/95 border border-rose-500/30 shadow-2xl',
    headerBannerBg: 'from-slate-950 via-rose-950/90 to-slate-900 border-rose-500/40 shadow-xl'
  },
  general: {
    id: 'general',
    name: 'General Weather',
    category: 'general',
    badgeLabel: 'SYNOPTIC WEATHER METEOROLOGY THEME',
    badgeEmoji: '☁️',
    accentColor: 'text-indigo-400',
    glowColor: 'bg-indigo-500/15',
    clearImage: '/assets/vrishti/themes/default.webp',
    rainImage: '/assets/vrishti/themes/default.webp',
    defaultImage: '/assets/vrishti/themes/default.webp',
    overlayGradient: 'from-slate-950/90 via-slate-950/75 to-indigo-950/60',
    cardGlassBg: 'bg-[#081228]/95 border border-indigo-500/30 shadow-2xl',
    headerBannerBg: 'from-slate-900 via-indigo-950/90 to-slate-900 border-indigo-500/40 shadow-xl'
  }
};

export const getThemeConfig = (sectorId?: string | null): ThemeConfigItem => {
  if (!sectorId) return THEME_CONFIG.default;
  return THEME_CONFIG[sectorId] || THEME_CONFIG.default;
};

export const getThemeImageUrl = (sectorId?: string | null, rainMm: number = 0.0): string => {
  const cfg = getThemeConfig(sectorId);
  return cfg.defaultImage || '/assets/vrishti/themes/default.webp';
};

// Preload all theme images into browser memory cache on app load
export const preloadThemeAssets = () => {
  Object.values(THEME_CONFIG).forEach((cfg) => {
    [cfg.clearImage, cfg.rainImage, cfg.defaultImage].forEach((url) => {
      if (url) {
        const img = new Image();
        img.src = url;
      }
    });
  });
};

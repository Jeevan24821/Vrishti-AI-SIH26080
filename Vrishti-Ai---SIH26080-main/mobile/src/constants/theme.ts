// VRISHTI AI Mobile Theme & Master Design Tokens (Source of Truth: Desktop Web Dashboard)

export type WarningLevel = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';

export const COLORS = {
  background: '#030712',          // Deep Space Navy legacy
  canvasBg: '#f4f7fb',            // Master Desktop Background (#f4f7fb)
  surface: '#ffffff',             // Crisp White Card
  card: '#ffffff',                // Standard Glass Card
  cardElevated: '#ffffff',        // Elevated Card
  cardAlt: '#1e293b',             // Slate 800 Elevated
  border: '#cbd5e1',              // Slate 300 Master Border
  borderLight: '#334155',         // Slate 700 Border
  borderSubtle: '#e2e8f0',        // Slate 200 Subtle Border

  // High-Contrast Scientific Typography
  textPrimary: '#020617',         // Slate 950 High Contrast Text
  textSecondary: '#1e293b',       // Slate 800 Secondary Text
  textMuted: '#475569',           // Slate 600 Body & Subtitle Text
  textLight: '#94a3b8',           // Slate 400 Light Text

  // Brand Accents
  primary: '#4f46e5',             // Master Indigo Accent (Indigo-600)
  primaryBlue: '#2563eb',         // Blue-600
  primaryDark: '#3730a3',         // Deep Indigo
  accent: '#f97316',              // Warning Amber/Orange
  success: '#059669',             // Emerald-600
  danger: '#dc2626',              // Rose-600
  warning: '#d97706',             // Amber-600
  cyan: '#06b6d4',                // Atmospheric Cyan
  purple: '#7c3aed',              // Violet-600

  // Command Center / Dark Surface (for AI Copilot & Bottom Nav)
  darkBg: '#030712',              // Deep Command Navy (#030712)
  darkSurface: '#0b1220',         // Nav & Header Base (#0b1220)
  darkCard: '#0f172a',            // Dark Glass Card (#0f172a)
  darkCardAlt: '#111c35',         // Dark Card Elevated (#111c35)
  darkBorder: '#1e293b',          // Dark Border (#1e293b)
  darkBorderLight: 'rgba(255, 255, 255, 0.15)',
  darkText: '#f8fafc',
  darkTextMuted: '#94a3b8',

  // Gradient KPI Card Colors
  kpiNwpBg: '#eff6ff',
  kpiNwpBorder: '#93c5fd',
  kpiAiBg: '#eef2ff',
  kpiAiBorder: '#a5b4fc',
  kpiObsBg: '#ecfdf5',
  kpiObsBorder: '#6ee7b7',

  // Weather Condition Cards
  tempBg: '#fffbeb',
  tempBorder: '#fde68a',
  tempText: '#d97706',

  rhBg: '#eff6ff',
  rhBorder: '#bfdbfe',
  rhText: '#2563eb',

  windBg: '#ecfdf5',
  windBorder: '#a7f3d0',
  windText: '#059669',

  pressBg: '#eef2ff',
  pressBorder: '#c7d2fe',
  pressText: '#4f46e5',
};

export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 34,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 22,
  full: 9999,
};

export const IMD_WARNINGS: Record<WarningLevel, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  action: string;
  rainfall: string;
}> = {
  GREEN: {
    label: 'NO WARNING (NORMAL)',
    color: '#059669',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    action: 'No specific action required by emergency services.',
    rainfall: 'Rainfall < 15.6 mm / 6h (Light / Normal)',
  },
  YELLOW: {
    label: 'WATCH (BE UPDATED)',
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    action: 'Keep track of localized weather forecasts and radar updates.',
    rainfall: 'Rainfall 15.6 - 64.4 mm / 6h (Moderate)',
  },
  ORANGE: {
    label: 'ALERT (BE PREPARED)',
    color: '#ea580c',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    action: 'Prepare for potential waterlogging, transport disruptions, and local flooding.',
    rainfall: 'Rainfall 64.5 - 115.5 mm / 6h (Heavy Precipitation)',
  },
  RED: {
    label: 'WARNING (TAKE ACTION)',
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    action: 'Action required: High risk of severe flooding, landslides, and infrastructure damage.',
    rainfall: 'Rainfall > 115.5 mm / 6h (Very Heavy to Extreme)',
  },
};

export function getWarningColor(rainMm: number): string {
  if (rainMm >= 115.5) return IMD_WARNINGS.RED.color;
  if (rainMm >= 64.5) return IMD_WARNINGS.ORANGE.color;
  if (rainMm >= 15.6) return IMD_WARNINGS.YELLOW.color;
  return IMD_WARNINGS.GREEN.color;
}

export const THEME = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  radius: RADIUS,
  warnings: IMD_WARNINGS,
};

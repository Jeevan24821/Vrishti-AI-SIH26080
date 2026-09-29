import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { X, ArrowRight, Droplets, Thermometer, Wind, Gauge, Compass } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../constants/theme';
import { MapDistrictForecast } from '../types';
import { WarningBadge } from './WarningBadge';

interface SelectedDistrictSheetProps {
  district: MapDistrictForecast | null;
  onClose: () => void;
  onViewDeepForecast?: (district: MapDistrictForecast) => void;
}

export const SelectedDistrictSheet: React.FC<SelectedDistrictSheetProps> = ({
  district,
  onClose,
  onViewDeepForecast,
}) => {
  if (!district) return null;

  const bias = district.bias_correction_mm || (district.ai_corrected_forecast_mm - district.raw_nwp_forecast_mm);
  const isReduction = bias < 0;

  return (
    <View style={styles.container}>
      {/* Handle / Header */}
      <View style={styles.topRow}>
        <View style={styles.headerTitleArea}>
          <View style={styles.titleRow}>
            <Text style={styles.talukaName}>{district.taluka_name}</Text>
            {district.state && (
              <View style={styles.statePill}>
                <Text style={styles.statePillText}>{district.state}</Text>
              </View>
            )}
          </View>
          <Text style={styles.districtName}>District: {district.district_name} • Elev: {Math.round(district.elevation_m || 0)}m</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <X size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Warning Status & Key Forecast Metrics */}
      <View style={styles.metricGrid}>
        {/* Warning Badge */}
        <View style={styles.warningBox}>
          <WarningBadge level={district.alert_level} size="md" />
          <Text style={styles.warningSub}>{district.warning_category || 'IMD Classification'}</Text>
        </View>

        {/* AI Corrected vs NWP */}
        <View style={styles.forecastBox}>
          <Text style={styles.boxLabel}>AI CORRECTED (6H)</Text>
          <View style={styles.rainRow}>
            <Text style={styles.rainValue}>
              {district.ai_corrected_forecast_mm !== undefined && district.ai_corrected_forecast_mm !== null
                ? district.ai_corrected_forecast_mm.toFixed(1)
                : 'N/A'}
            </Text>
            <Text style={styles.rainUnit}>mm</Text>
          </View>
          <Text style={styles.rawNwp}>Raw NWP: {district.raw_nwp_forecast_mm?.toFixed(1) || '0.0'} mm</Text>
        </View>

        {/* Bias Correction Delta */}
        <View style={styles.deltaBox}>
          <Text style={styles.boxLabel}>BIAS DELTA (Δ)</Text>
          <Text style={[styles.deltaVal, { color: isReduction ? COLORS.primary : COLORS.accent }]}>
            {bias > 0 ? `+${bias.toFixed(1)}` : bias.toFixed(1)} mm
          </Text>
          <Text style={styles.deltaDesc}>{isReduction ? 'NWP Overprediction' : 'Underprediction'}</Text>
        </View>

        {/* Heavy Rain Probability */}
        <View style={styles.probBox}>
          <Text style={styles.boxLabel}>HEAVY RAIN P(&gt;64.5mm)</Text>
          <Text style={styles.probVal}>{Math.round(district.heavy_rain_probability_pct || 0)}%</Text>
          <Text style={styles.probDesc}>Calibrated probability</Text>
        </View>
      </View>

      {/* Environmental Telemetry */}
      <View style={styles.telemetryRow}>
        <View style={styles.telItem}>
          <Thermometer size={12} color="#f97316" />
          <Text style={styles.telText}>{district.temperature_2m_c ? `${district.temperature_2m_c.toFixed(1)}°C` : 'N/A'}</Text>
        </View>
        <View style={styles.telItem}>
          <Droplets size={12} color="#38bdf8" />
          <Text style={styles.telText}>{district.relative_humidity_pct ? `${district.relative_humidity_pct.toFixed(0)}%` : 'N/A'}</Text>
        </View>
        <View style={styles.telItem}>
          <Wind size={12} color="#a855f7" />
          <Text style={styles.telText}>{district.wind_speed_10m_kmh ? `${district.wind_speed_10m_kmh.toFixed(1)} km/h` : 'N/A'}</Text>
        </View>
        <View style={styles.telItem}>
          <Gauge size={12} color="#06b6d4" />
          <Text style={styles.telText}>{district.pressure_msl_hpa ? `${district.pressure_msl_hpa.toFixed(0)} hPa` : 'N/A'}</Text>
        </View>
      </View>

      {/* Action Button */}
      {onViewDeepForecast && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onViewDeepForecast(district)}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>Load in Forecast Station Dashboard</Text>
          <ArrowRight size={14} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  headerTitleArea: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  talukaName: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
  },
  statePill: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statePillText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary,
  },
  districtName: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  warningBox: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    justifyContent: 'center',
  },
  warningSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  forecastBox: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
  },
  boxLabel: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
    letterSpacing: 0.4,
  },
  rainRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginTop: 2,
  },
  rainValue: {
    fontSize: 18,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
  },
  rainUnit: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  rawNwp: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  deltaBox: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
  },
  deltaVal: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginTop: 2,
  },
  deltaDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  probBox: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
  },
  probVal: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.accent,
    marginTop: 2,
  },
  probDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  telItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  telText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textSecondary,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: RADIUS.sm,
    paddingVertical: 10,
  },
  actionBtnText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary,
  },
});

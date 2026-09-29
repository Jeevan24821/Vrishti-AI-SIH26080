import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Thermometer, Droplets, Wind, Gauge, Compass, Mountain } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../constants/theme';
import { ForecastRecord } from '../types';

interface WeatherConditionsCardProps {
  forecast?: ForecastRecord | null;
}

export const WeatherConditionsCard: React.FC<WeatherConditionsCardProps> = ({ forecast }) => {
  if (!forecast) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>ATMOSPHERIC & SURFACE TELEMETRY</Text>
        <Text style={styles.noDataText}>Atmospheric telemetry not available for this record.</Text>
      </View>
    );
  }

  const items = [
    {
      label: '2M TEMPERATURE',
      value: forecast.temperature_2m_c !== undefined && forecast.temperature_2m_c !== null
        ? `${forecast.temperature_2m_c.toFixed(1)}°C`
        : 'N/A',
      icon: Thermometer,
      iconColor: '#f97316',
    },
    {
      label: 'RELATIVE HUMIDITY',
      value: forecast.relative_humidity_pct !== undefined && forecast.relative_humidity_pct !== null
        ? `${forecast.relative_humidity_pct.toFixed(0)}%`
        : 'N/A',
      icon: Droplets,
      iconColor: '#38bdf8',
    },
    {
      label: '10M WIND SPEED',
      value: forecast.wind_speed_10m_kmh !== undefined && forecast.wind_speed_10m_kmh !== null
        ? `${forecast.wind_speed_10m_kmh.toFixed(1)} km/h`
        : 'N/A',
      icon: Wind,
      iconColor: '#a855f7',
    },
    {
      label: 'MSL PRESSURE',
      value: forecast.pressure_msl_hpa !== undefined && forecast.pressure_msl_hpa !== null
        ? `${forecast.pressure_msl_hpa.toFixed(1)} hPa`
        : 'N/A',
      icon: Gauge,
      iconColor: '#06b6d4',
    },
    {
      label: 'ELEVATION',
      value: forecast.elevation_m !== undefined && forecast.elevation_m !== null
        ? `${forecast.elevation_m.toFixed(0)} m MSL`
        : 'N/A',
      icon: Mountain,
      iconColor: '#10b981',
    },
    {
      label: 'COORDINATES',
      value: forecast.latitude && forecast.longitude
        ? `${forecast.latitude.toFixed(2)}°N, ${forecast.longitude.toFixed(2)}°E`
        : 'N/A',
      icon: Compass,
      iconColor: '#eab308',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>ATMOSPHERIC & SURFACE TELEMETRY</Text>
        <Text style={styles.cycleBadge}>{forecast.time || '00:00 UTC'}</Text>
      </View>

      <View style={styles.grid}>
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <View key={idx} style={styles.gridItem}>
              <View style={[styles.iconBox, { backgroundColor: `${item.iconColor}15` }]}>
                <Icon size={14} color={item.iconColor} />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={styles.itemValue}>{item.value}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  cycleBadge: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.primary,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: SPACING.sm,
  },
  gridItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingRight: SPACING.xs,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
    letterSpacing: 0.4,
  },
  itemValue: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  noDataText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
});

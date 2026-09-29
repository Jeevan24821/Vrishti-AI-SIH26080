import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloudRain, Wifi, WifiOff, MapPin, Calendar, Server, ChevronDown, Clock } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { useForecast } from '../context/ForecastContext';
import { formatDisplayDate, formatDisplayLocation } from '../utils/dateFormatter';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLocationBar?: boolean;
  onOpenLocationPicker?: () => void;
  onOpenDatePicker?: () => void;
  onOpenServerConfig?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showLocationBar = true,
  onOpenLocationPicker,
  onOpenDatePicker,
  onOpenServerConfig,
}) => {
  const insets = useSafeAreaInsets();
  const { isOnline, selectedStation, selectedDate, selectedPeriod, stationMetadata } = useForecast();

  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(now) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const locationText = formatDisplayLocation(stationMetadata);
  const dateText = formatDisplayDate(selectedDate, selectedPeriod);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0) }]}>
      {/* Top Bar: Brand Logo & Status */}
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <CloudRain size={20} color="#ffffff" />
          </View>
          <View>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandName}>VRISHTI</Text>
              <Text style={styles.brandAI}>AI</Text>
              <View style={styles.opsTag}>
                <Text style={styles.opsTagText}>OPS</Text>
              </View>
            </View>
            <Text style={styles.brandSub}>AI Rainfall & Warning System</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {/* Live IST Clock */}
          {timeStr ? (
            <View style={styles.clockPill}>
              <Clock size={11} color={COLORS.textLight} />
              <Text style={styles.clockText}>{timeStr}</Text>
            </View>
          ) : null}

          {/* Server / Online indicator */}
          <TouchableOpacity
            style={[styles.statusPill, isOnline ? styles.statusOnline : styles.statusOffline]}
            onPress={onOpenServerConfig}
            activeOpacity={0.7}
          >
            {isOnline ? (
              <>
                <View style={styles.onlineDot} />
                <Text style={styles.statusText}>LIVE</Text>
              </>
            ) : (
              <>
                <WifiOff size={11} color={COLORS.danger} />
                <Text style={[styles.statusText, { color: COLORS.danger }]}>OFFLINE</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Screen Title (if provided) */}
      {title && (
        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>{title}</Text>
          {subtitle && <Text style={styles.screenSubtitle}>{subtitle}</Text>}
        </View>
      )}

      {/* Location & Date Selector Bar (Desktop Sub-Nav Responsive Equivalent) */}
      {showLocationBar && (
        <View style={styles.selectorBar}>
          {/* District / Station Selector */}
          <TouchableOpacity
            style={styles.selectorItem}
            onPress={onOpenLocationPicker}
            activeOpacity={0.7}
          >
            <View style={styles.selectorIconWrap}>
              <MapPin size={14} color={COLORS.primary} />
            </View>
            <View style={styles.selectorTextContainer}>
              <Text style={styles.selectorLabel}>DISTRICT / STATION</Text>
              <Text style={styles.selectorValue} numberOfLines={1}>
                {locationText}
              </Text>
            </View>
            <ChevronDown size={14} color={COLORS.textLight} />
          </TouchableOpacity>

          <View style={styles.selectorDivider} />

          {/* Forecast Cycle & Period Selector */}
          <TouchableOpacity
            style={styles.selectorItem}
            onPress={onOpenDatePicker}
            activeOpacity={0.7}
          >
            <View style={styles.selectorIconWrap}>
              <Calendar size={14} color={COLORS.accent} />
            </View>
            <View style={styles.selectorTextContainer}>
              <Text style={styles.selectorLabel}>FORECAST CYCLE</Text>
              <Text style={styles.selectorValue} numberOfLines={1}>
                {dateText}
              </Text>
            </View>
            <ChevronDown size={14} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0b1220',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandName: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  brandAI: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 18,
    fontWeight: '900',
    color: '#38bdf8',
    letterSpacing: 0.5,
  },
  opsTag: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#38bdf8',
    marginLeft: 2,
  },
  opsTagText: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 11,
    color: '#94a3b8',
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  clockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  clockText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#cbd5e1',
    fontWeight: '700',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  statusOnline: {
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    borderColor: 'rgba(5, 150, 105, 0.4)',
  },
  statusOffline: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderColor: 'rgba(220, 38, 38, 0.4)',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: '800',
    color: '#34d399',
    letterSpacing: 0.5,
  },
  titleSection: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  screenTitle: {
    fontSize: 20,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: '900',
    color: '#ffffff',
  },
  screenSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  selectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    paddingVertical: 7,
    paddingHorizontal: SPACING.sm,
    marginTop: SPACING.xs,
    gap: 4,
  },
  selectorItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectorIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorTextContainer: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.4,
  },
  selectorValue: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: '700',
    color: '#f8fafc',
  },
  selectorDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(148, 163, 184, 0.25)',
    marginHorizontal: 4,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WifiOff, RefreshCw, Server, AlertTriangle, AlertCircle, Clock, Info } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { useForecast } from '../context/ForecastContext';

interface OfflineNoticeProps {
  onOpenServerConfig?: () => void;
}

export const OfflineNotice: React.FC<OfflineNoticeProps> = ({ onOpenServerConfig }) => {
  const { isOnline, apiError, activeHost, refreshData } = useForecast();

  // If online and no error, do not render banner
  if (isOnline && !apiError) return null;

  const getErrorDetails = () => {
    if (!apiError) {
      return {
        icon: WifiOff,
        title: 'OFFLINE MODE',
        sub: 'Showing cached data. Backend unreachable.',
        color: COLORS.danger,
        bgColor: 'rgba(239, 68, 68, 0.12)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
      };
    }

    switch (apiError.kind) {
      case 'NO_INTERNET':
        return {
          icon: WifiOff,
          title: 'NO INTERNET CONNECTION',
          sub: 'Please check your mobile data or Wi-Fi network.',
          color: COLORS.danger,
          bgColor: 'rgba(239, 68, 68, 0.14)',
          borderColor: 'rgba(239, 68, 68, 0.35)',
        };
      case 'BACKEND_OFFLINE':
        return {
          icon: Server,
          title: 'BACKEND SERVER OFFLINE',
          sub: `Cannot reach API at ${activeHost || 'https://api.vrishti.ai'}. Tap to configure host.`,
          color: COLORS.accent,
          bgColor: 'rgba(249, 115, 22, 0.14)',
          borderColor: 'rgba(249, 115, 22, 0.35)',
          canConfigure: true,
        };
      case 'TIMEOUT':
        return {
          icon: Clock,
          title: 'REQUEST TIMED OUT (15s)',
          sub: 'The server took too long to respond. Tap to retry.',
          color: COLORS.warning,
          bgColor: 'rgba(234, 179, 8, 0.14)',
          borderColor: 'rgba(234, 179, 8, 0.35)',
        };
      case 'NO_FORECAST_DATA':
        return {
          icon: Info,
          title: 'FORECAST RECORD UNAVAILABLE',
          sub: 'No observation or forecast cycle found for this station/date.',
          color: COLORS.primary,
          bgColor: 'rgba(56, 189, 248, 0.12)',
          borderColor: 'rgba(56, 189, 248, 0.3)',
        };
      case 'SERVER_ERROR':
        return {
          icon: AlertTriangle,
          title: 'BACKEND SERVER ERROR',
          sub: 'The VRISHTI AI model pipeline reported an internal error.',
          color: COLORS.danger,
          bgColor: 'rgba(239, 68, 68, 0.14)',
          borderColor: 'rgba(239, 68, 68, 0.35)',
        };
      case 'AUTH_ERROR':
        return {
          icon: AlertCircle,
          title: 'AUTHENTICATION REQUIRED',
          sub: 'Operational session expired. Please sign in.',
          color: COLORS.warning,
          bgColor: 'rgba(234, 179, 8, 0.14)',
          borderColor: 'rgba(234, 179, 8, 0.35)',
        };
      case 'API_ERROR':
      default:
        return {
          icon: AlertCircle,
          title: 'API COMMUNICATION ERROR',
          sub: apiError.message || 'An unexpected API error occurred.',
          color: COLORS.danger,
          bgColor: 'rgba(239, 68, 68, 0.12)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
        };
    }
  };

  const details = getErrorDetails();
  const Icon = details.icon;

  return (
    <View style={[styles.banner, { backgroundColor: details.bgColor, borderBottomColor: details.borderColor }]}>
      <TouchableOpacity
        style={styles.leftRow}
        activeOpacity={details.canConfigure && onOpenServerConfig ? 0.7 : 1}
        onPress={details.canConfigure && onOpenServerConfig ? onOpenServerConfig : undefined}
      >
        <Icon size={16} color={details.color} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: details.color }]}>{details.title}</Text>
          <Text style={styles.sub} numberOfLines={2}>
            {details.sub}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actionRow}>
        {details.canConfigure && onOpenServerConfig && (
          <TouchableOpacity style={styles.configBtn} onPress={onOpenServerConfig}>
            <Text style={styles.configBtnText}>Config Host</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.refreshBtn} onPress={refreshData}>
          <RefreshCw size={13} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    borderBottomWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  title: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    letterSpacing: 0.5,
  },
  sub: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
    marginTop: 1,
    lineHeight: 14,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  configBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  configBtnText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#ffffff',
  },
  refreshBtn: {
    padding: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});

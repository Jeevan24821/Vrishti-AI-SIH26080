import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Layers, Wind, Droplets, Sun, AlertTriangle } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../constants/theme';

interface RegimeCardProps {
  regimeId?: number;
  regimeName?: string;
  probabilities?: number[];
}

const REGIME_INFO: Record<number, { title: string; desc: string; icon: any; color: string; badge: string }> = {
  0: {
    title: 'Dry / Suppressed Convection',
    desc: 'High atmospheric stability, low low-level moisture convergence, weak convective available potential energy (CAPE). Negligible precipitation expected.',
    icon: Sun,
    color: '#eab308',
    badge: 'SUPPRESSED',
  },
  1: {
    title: 'Moderate / Coastal Showers',
    desc: 'Moderate southwesterly flow along the Western Ghats with localized coastal wind convergence and orographic forcing. Intermittent moderate rainfall.',
    icon: Droplets,
    color: '#06b6d4',
    badge: 'OROGRAPHIC',
  },
  2: {
    title: 'Active Monsoon / Deep Convection',
    desc: 'Offshore trough presence, strong mid-tropospheric shear, high precipitable water (>55mm), and persistent moisture advection. High risk of heavy to very heavy rainfall.',
    icon: AlertTriangle,
    color: '#f97316',
    badge: 'DEEP CONVECTION',
  },
};

export const RegimeCard: React.FC<RegimeCardProps> = ({
  regimeId = 0,
  regimeName,
  probabilities,
}) => {
  const info = REGIME_INFO[regimeId] || {
    title: regimeName || `Regime ${regimeId}`,
    desc: 'Atmospheric pattern classified by Random Forest physics-guided regime classifier.',
    icon: Layers,
    color: COLORS.primary,
    badge: `REGIME ${regimeId}`,
  };

  const Icon = info.icon;

  return (
    <View style={[styles.container, { borderColor: `${info.color}40` }]}>
      <View style={styles.topRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: `${info.color}15` }]}>
            <Icon size={16} color={info.color} />
          </View>
          <View>
            <Text style={styles.subTitle}>SYNOPTIC REGIME CLASSIFICATION</Text>
            <Text style={styles.title}>{info.title}</Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: `${info.color}20`, borderColor: `${info.color}50` }]}>
          <Text style={[styles.badgeText, { color: info.color }]}>{info.badge}</Text>
        </View>
      </View>

      <Text style={styles.desc}>{info.desc}</Text>

      {/* Probabilities Breakdown */}
      {probabilities && probabilities.length >= 3 && (
        <View style={styles.probContainer}>
          <Text style={styles.probHeader}>REGIME POSTERIOR PROBABILITIES</Text>
          <View style={styles.probBars}>
            {probabilities.map((prob, idx) => {
              const regNames = ['Dry (R0)', 'Moderate (R1)', 'Active (R2)'];
              const regColors = ['#eab308', '#06b6d4', '#f97316'];
              const pct = Math.round(prob * 100);
              return (
                <View key={idx} style={styles.probRow}>
                  <View style={styles.probLabelRow}>
                    <Text style={styles.probName}>{regNames[idx] || `R${idx}`}</Text>
                    <Text style={[styles.probPct, { color: regColors[idx] }]}>{pct}%</Text>
                  </View>
                  <View style={styles.track}>
                    <View
                      style={[
                        styles.fill,
                        {
                          width: `${Math.max(pct, 2)}%`,
                          backgroundColor: regColors[idx],
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
    paddingRight: SPACING.xs,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTitle: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    letterSpacing: 0.5,
  },
  desc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
    marginTop: 4,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  probContainer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  probHeader: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  probBars: {
    gap: 6,
  },
  probRow: {
    gap: 2,
  },
  probLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  probName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  probPct: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  track: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});

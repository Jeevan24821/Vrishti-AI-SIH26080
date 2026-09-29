import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../constants/theme';

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  deltaValue?: number;
  deltaLabel?: string;
  badgeText?: string;
  badgeColor?: string;
  highlight?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  unit,
  subtitle,
  icon: Icon,
  iconColor = COLORS.primary,
  deltaValue,
  deltaLabel,
  badgeText,
  badgeColor = COLORS.primary,
  highlight = false,
}) => {
  return (
    <View style={[styles.card, highlight && styles.highlightCard]}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        {Icon && (
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
            <Icon size={16} color={iconColor} />
          </View>
        )}
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.value}>
          {value !== undefined && value !== null ? String(value) : 'N/A'}
        </Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>

      {/* Delta indicator if present */}
      {deltaValue !== undefined && (
        <View style={styles.deltaRow}>
          <Text style={[
            styles.deltaText,
            { color: deltaValue > 0 ? COLORS.accent : deltaValue < 0 ? COLORS.primary : COLORS.textMuted }
          ]}>
            {deltaValue > 0 ? `+${deltaValue.toFixed(1)}` : deltaValue.toFixed(1)} {unit}
          </Text>
          {deltaLabel && <Text style={styles.deltaLabel}>({deltaLabel})</Text>}
        </View>
      )}

      {/* Badge if present */}
      {badgeText && (
        <View style={[styles.badge, { backgroundColor: `${badgeColor}20`, borderColor: `${badgeColor}40` }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeText}</Text>
        </View>
      )}

      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    flex: 1,
  },
  highlightCard: {
    borderColor: 'rgba(56, 189, 248, 0.4)',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  iconContainer: {
    width: 26,
    height: 26,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontSize: 22,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
  },
  unit: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textMuted,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  deltaText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  deltaLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 6,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
});

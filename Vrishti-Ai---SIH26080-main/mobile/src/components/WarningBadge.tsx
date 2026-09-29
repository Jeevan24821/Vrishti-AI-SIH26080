import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react-native';
import { IMD_WARNINGS, WarningLevel, COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../constants/theme';

interface WarningBadgeProps {
  level: WarningLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
}

export const WarningBadge: React.FC<WarningBadgeProps> = ({
  level,
  size = 'md',
  showDescription = false,
}) => {
  const normLevel = (level?.toUpperCase() || 'GREEN') as WarningLevel;
  const config = IMD_WARNINGS[normLevel] || IMD_WARNINGS.GREEN;

  const getIcon = () => {
    const iconSize = size === 'sm' ? 12 : size === 'md' ? 16 : 22;
    switch (normLevel) {
      case 'RED':
        return <ShieldAlert size={iconSize} color={config.color} />;
      case 'ORANGE':
        return <AlertTriangle size={iconSize} color={config.color} />;
      case 'YELLOW':
        return <AlertCircle size={iconSize} color={config.color} />;
      case 'GREEN':
      default:
        return <CheckCircle size={iconSize} color={config.color} />;
    }
  };

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
      },
      isSmall && styles.containerSmall,
      isLarge && styles.containerLarge,
    ]}>
      <View style={styles.headerRow}>
        {getIcon()}
        <Text style={[
          styles.labelText,
          { color: config.color },
          isSmall && styles.labelTextSmall,
          isLarge && styles.labelTextLarge,
        ]}>
          {config.label}
        </Text>
      </View>

      {showDescription && (
        <View style={styles.descContainer}>
          <Text style={styles.actionText}>{config.action}</Text>
          <Text style={styles.criteriaText}>{config.rainfall}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  containerSmall: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  containerLarge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.sm,
    letterSpacing: 0.5,
  },
  labelTextSmall: {
    fontSize: 10,
  },
  labelTextLarge: {
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  descContainer: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  criteriaText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});

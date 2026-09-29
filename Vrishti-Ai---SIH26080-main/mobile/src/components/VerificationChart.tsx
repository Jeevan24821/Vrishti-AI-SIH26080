import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../constants/theme';
import { ContinuousMetrics, ContingencyTable } from '../types';

interface VerificationChartProps {
  rawNwp: ContinuousMetrics;
  aiModel: ContinuousMetrics;
  contingency?: ContingencyTable | null;
  title?: string;
}

export const VerificationChart: React.FC<VerificationChartProps> = ({
  rawNwp,
  aiModel,
  contingency,
  title = 'CONTINUOUS ERROR METRICS COMPARISON',
}) => {
  const metrics = [
    { label: 'RMSE (mm)', raw: rawNwp.rmse, ai: aiModel.rmse, isLowerBetter: true },
    { label: 'MAE (mm)', raw: rawNwp.mae, ai: aiModel.mae, isLowerBetter: true },
    { label: 'BIAS (mm)', raw: rawNwp.bias, ai: aiModel.bias, isLowerBetter: true, isAbsBetter: true },
    { label: 'PEARSON r', raw: rawNwp.r_corr, ai: aiModel.r_corr, isLowerBetter: false },
    { label: 'R² SCORE', raw: rawNwp.r2, ai: aiModel.r2, isLowerBetter: false },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Raw ECMWF NWP vs VRISHTI AI Corrected (N = {aiModel.n || rawNwp.n || 'N/A'})</Text>

      {/* Metrics Bar Comparison Table */}
      <View style={styles.metricsTable}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colHeader, { flex: 2 }]}>METRIC</Text>
          <Text style={[styles.colHeader, { flex: 1.5, textAlign: 'right' }]}>RAW NWP</Text>
          <Text style={[styles.colHeader, { flex: 1.5, textAlign: 'right', color: COLORS.primary }]}>VRISHTI AI</Text>
          <Text style={[styles.colHeader, { flex: 1.5, textAlign: 'right', color: COLORS.accent }]}>DELTA</Text>
        </View>

        {metrics.map((m, idx) => {
          const rawVal = m.raw !== undefined && m.raw !== null ? Number(m.raw) : null;
          const aiVal = m.ai !== undefined && m.ai !== null ? Number(m.ai) : null;
          let diffStr = 'N/A';
          let isImproved = false;

          if (rawVal !== null && aiVal !== null) {
            const diff = aiVal - rawVal;
            if (m.isLowerBetter) {
              isImproved = diff < 0;
            } else {
              isImproved = diff > 0;
            }
            diffStr = diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);
          }

          return (
            <View key={idx} style={[styles.tableRow, idx % 2 === 0 && styles.rowAlt]}>
              <Text style={[styles.colCell, { flex: 2, fontFamily: TYPOGRAPHY.fontFamily.medium }]}>
                {m.label}
              </Text>
              <Text style={[styles.colCell, { flex: 1.5, textAlign: 'right', color: COLORS.textMuted }]}>
                {rawVal !== null ? rawVal.toFixed(2) : 'N/A'}
              </Text>
              <Text style={[styles.colCell, { flex: 1.5, textAlign: 'right', fontFamily: TYPOGRAPHY.fontFamily.bold, color: COLORS.primary }]}>
                {aiVal !== null ? aiVal.toFixed(2) : 'N/A'}
              </Text>
              <Text style={[
                styles.colCell,
                {
                  flex: 1.5,
                  textAlign: 'right',
                  fontFamily: TYPOGRAPHY.fontFamily.bold,
                  color: isImproved ? COLORS.success : COLORS.textMuted,
                }
              ]}>
                {diffStr}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Contingency 2x2 Matrix if available */}
      {contingency && (
        <View style={styles.matrixSection}>
          <Text style={styles.matrixTitle}>
            CONTINGENCY MATRIX ({contingency.threshold_mm}mm THRESHOLD)
          </Text>
          <View style={styles.matrixGrid}>
            <View style={styles.matrixRow}>
              <View style={[styles.matrixCell, styles.hitCell]}>
                <Text style={styles.cellLabel}>HITS (A)</Text>
                <Text style={styles.cellValue}>{contingency.hits}</Text>
              </View>
              <View style={[styles.matrixCell, styles.faCell]}>
                <Text style={styles.cellLabel}>FALSE ALARMS (B)</Text>
                <Text style={styles.cellValue}>{contingency.false_alarms}</Text>
              </View>
            </View>
            <View style={styles.matrixRow}>
              <View style={[styles.matrixCell, styles.missCell]}>
                <Text style={styles.cellLabel}>MISSES (C)</Text>
                <Text style={styles.cellValue}>{contingency.misses}</Text>
              </View>
              <View style={[styles.matrixCell, styles.cnCell]}>
                <Text style={styles.cellLabel}>CORRECT NEG (D)</Text>
                <Text style={styles.cellValue}>{contingency.correct_negatives}</Text>
              </View>
            </View>
          </View>

          {/* Skill Scores */}
          <View style={styles.skillsRow}>
            <View style={styles.skillBadge}>
              <Text style={styles.skillLabel}>POD / RECALL</Text>
              <Text style={styles.skillVal}>
                {typeof contingency.pod === 'number' ? contingency.pod.toFixed(3) : String(contingency.pod || 'N/A')}
              </Text>
            </View>
            <View style={styles.skillBadge}>
              <Text style={styles.skillLabel}>FAR</Text>
              <Text style={styles.skillVal}>
                {typeof contingency.far === 'number' ? contingency.far.toFixed(3) : String(contingency.far || 'N/A')}
              </Text>
            </View>
            <View style={styles.skillBadge}>
              <Text style={styles.skillLabel}>CSI / THREAT</Text>
              <Text style={[styles.skillVal, { color: COLORS.accent }]}>
                {typeof contingency.csi === 'number' ? contingency.csi.toFixed(3) : String(contingency.csi || 'N/A')}
              </Text>
            </View>
            <View style={styles.skillBadge}>
              <Text style={styles.skillLabel}>ETS</Text>
              <Text style={styles.skillVal}>
                {typeof contingency.ets === 'number' ? contingency.ets.toFixed(3) : String(contingency.ets || 'N/A')}
              </Text>
            </View>
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
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  title: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  metricsTable: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  colHeader: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  rowAlt: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  colCell: {
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  matrixSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  matrixTitle: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  matrixGrid: {
    gap: 4,
  },
  matrixRow: {
    flexDirection: 'row',
    gap: 4,
  },
  matrixCell: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  hitCell: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  faCell: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  missCell: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  cnCell: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  cellLabel: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
  },
  cellValue: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  skillsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  skillBadge: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  skillLabel: {
    fontSize: 8,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
  },
  skillVal: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
});

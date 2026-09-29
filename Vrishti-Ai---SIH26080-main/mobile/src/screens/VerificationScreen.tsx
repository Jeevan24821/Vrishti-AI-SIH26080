import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Award, Filter, ShieldCheck, CheckCircle2 } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { Header } from '../components/Header';
import { VerificationChart } from '../components/VerificationChart';
import { EmptyState } from '../components/EmptyState';
import { OfflineNotice } from '../components/OfflineNotice';
import { fetchVerificationReport } from '../services/api';
import { VerificationReportPayload } from '../types';

const THRESHOLDS = [
  { val: 0.1, label: '>0.1mm (Any Rain)' },
  { val: 15.6, label: '>15.6mm (Moderate)' },
  { val: 64.5, label: '>64.5mm (Heavy)' },
  { val: 115.5, label: '>115.5mm (Very Heavy)' },
];

const STATES = ['All', 'Goa', 'Karnataka', 'Kerala'];

export const VerificationScreen: React.FC = () => {
  const [report, setReport] = useState<VerificationReportPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedThreshold, setSelectedThreshold] = useState<number>(64.5);
  const [selectedPartition, setSelectedPartition] = useState<string>('test');

  const loadReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchVerificationReport({
        state: selectedState === 'All' ? undefined : selectedState,
        threshold: selectedThreshold,
        partition: selectedPartition,
      });
      setReport(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load verification report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [selectedState, selectedThreshold, selectedPartition]);

  return (
    <View style={styles.container}>
      <Header
        title="SCIENTIFIC VERIFICATION"
        subtitle="Operational Model Skill & Error Metrics"
        showLocationBar={false}
      />

      <OfflineNotice />

      {/* Filter Controls Bar */}
      <View style={styles.filterBar}>
        {/* State Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stateRow}>
          {STATES.map((st) => {
            const isActive = selectedState === st;
            return (
              <TouchableOpacity
                key={st}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setSelectedState(st)}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{st}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Threshold Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.threshRow}>
          {THRESHOLDS.map((t) => {
            const isActive = selectedThreshold === t.val;
            return (
              <TouchableOpacity
                key={t.val}
                style={[styles.threshChip, isActive && styles.threshChipActive]}
                onPress={() => setSelectedThreshold(t.val)}
              >
                <Text style={[styles.threshChipText, isActive && styles.threshChipTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadReport}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {isLoading && !report ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
        ) : error && !report ? (
          <EmptyState
            title="Verification Unavailable"
            message={error}
            onRetry={loadReport}
          />
        ) : report ? (
          <>
            {/* Verdict Card */}
            {report.summary && (
              <View style={styles.verdictCard}>
                <View style={styles.verdictHeader}>
                  <ShieldCheck size={18} color={COLORS.success} />
                  <Text style={styles.verdictTitle}>SCIENTIFIC AUDIT VERDICT</Text>
                </View>
                <Text style={styles.verdictText}>{report.summary.verdict}</Text>
                {report.summary.bullets && report.summary.bullets.map((b: string, i: number) => (
                  <View key={i} style={styles.bulletRow}>
                    <CheckCircle2 size={13} color={COLORS.primary} style={{ marginTop: 2 }} />
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Continuous Metrics Chart & Contingency Matrix */}
            <VerificationChart
              rawNwp={report.overall_metrics.raw_nwp}
              aiModel={report.overall_metrics.regime_aware_ml}
              contingency={{
                threshold_mm: report.data_split.threshold || selectedThreshold,
                total_records: report.data_split.total_records,
                observed_events: (report.threshold_metrics.hits as number) + (report.threshold_metrics.misses as number),
                hits: report.threshold_metrics.hits as number,
                misses: report.threshold_metrics.misses as number,
                false_alarms: report.threshold_metrics.false_alarms as number,
                correct_negatives: report.threshold_metrics.correct_negatives as number,
                pod: report.threshold_metrics.pod,
                far: report.threshold_metrics.far,
                csi: report.threshold_metrics.csi,
                ets: report.threshold_metrics.ets,
                rare_event_warning: false,
              }}
            />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterBar: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 6,
  },
  stateRow: {
    paddingHorizontal: SPACING.md,
    gap: 6,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textMuted,
  },
  filterChipTextActive: {
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  threshRow: {
    paddingHorizontal: SPACING.md,
    gap: 6,
    paddingTop: 4,
  },
  threshChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  threshChipActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: COLORS.accent,
  },
  threshChipText: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textMuted,
  },
  threshChipTextActive: {
    color: COLORS.accent,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  verdictCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  verdictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  verdictTitle: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.success,
    letterSpacing: 0.5,
  },
  verdictText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 4,
  },
  bulletText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    flex: 1,
    lineHeight: 16,
  },
});

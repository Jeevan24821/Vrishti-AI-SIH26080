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
import { Layers, ShieldCheck, Activity, Award, CheckCircle, Info } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { Header } from '../components/Header';
import { EmptyState } from '../components/EmptyState';
import { OfflineNotice } from '../components/OfflineNotice';
import { fetchRegimeMetrics } from '../services/api';

export const RegimeScreen: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRegimes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchRegimeMetrics();
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load regime metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRegimes();
  }, []);

  const classifier = data?.classifier;
  const breakdown = data?.regime_breakdown || {};

  return (
    <View style={styles.container}>
      <Header
        title="SYNOPTIC REGIMES"
        subtitle="Physics-Guided Weather Regime Partitioning"
        showLocationBar={false}
      />

      <OfflineNotice />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadRegimes}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {isLoading && !data ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
        ) : error && !data ? (
          <EmptyState
            title="Unable to Load Regimes"
            message={error}
            onRetry={loadRegimes}
          />
        ) : (
          <>
            {/* Classifier Benchmark Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Award size={18} color={COLORS.primary} />
                <View>
                  <Text style={styles.cardTitle}>REGIME CLASSIFIER BENCHMARK</Text>
                  <Text style={styles.cardSubtitle}>Physics-Guided Random Forest Ensemble</Text>
                </View>
              </View>

              {classifier && (
                <>
                  <View style={styles.accBanner}>
                    <Text style={styles.accLabel}>OVERALL TEST ACCURACY</Text>
                    <Text style={styles.accValue}>
                      {typeof classifier.overall_accuracy === 'number'
                        ? `${(classifier.overall_accuracy * 100).toFixed(1)}%`
                        : `${classifier.overall_accuracy}%`}
                    </Text>
                  </View>

                  {/* Per-regime Classification Metrics */}
                  <View style={styles.table}>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.th, { flex: 2 }]}>REGIME</Text>
                      <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>PREC.</Text>
                      <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>REC.</Text>
                      <Text style={[styles.th, { flex: 1.2, textAlign: 'right', color: COLORS.primary }]}>F1-SCORE</Text>
                      <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>N</Text>
                    </View>

                    {Object.entries(classifier.per_regime_metrics || {}).map(([rKey, m]: [string, any], idx) => {
                      const regNames: Record<string, string> = {
                        '0': 'Regime 0 (Dry)',
                        '1': 'Regime 1 (Moderate)',
                        '2': 'Regime 2 (Active)',
                      };
                      return (
                        <View key={rKey} style={[styles.tr, idx % 2 === 0 && styles.trAlt]}>
                          <Text style={[styles.td, { flex: 2, fontFamily: TYPOGRAPHY.fontFamily.medium }]}>
                            {regNames[rKey] || `Regime ${rKey}`}
                          </Text>
                          <Text style={[styles.td, { flex: 1, textAlign: 'right', color: COLORS.textMuted }]}>
                            {typeof m.precision === 'number' ? m.precision.toFixed(2) : String(m.precision)}
                          </Text>
                          <Text style={[styles.td, { flex: 1, textAlign: 'right', color: COLORS.textMuted }]}>
                            {typeof m.recall === 'number' ? m.recall.toFixed(2) : String(m.recall)}
                          </Text>
                          <Text style={[styles.td, { flex: 1.2, textAlign: 'right', fontFamily: TYPOGRAPHY.fontFamily.bold, color: COLORS.primary }]}>
                            {typeof m.f1_score === 'number' ? m.f1_score.toFixed(2) : String(m.f1_score)}
                          </Text>
                          <Text style={[styles.td, { flex: 1, textAlign: 'right', color: COLORS.textSecondary }]}>
                            {m.sample_count || m.count || '—'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </>
              )}
            </View>

            {/* Per-Regime Test Verification Table */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Activity size={18} color={COLORS.accent} />
                <View>
                  <Text style={styles.cardTitle}>PER-REGIME TEST VERIFICATION</Text>
                  <Text style={styles.cardSubtitle}>Regime-Aware ML vs Raw ECMWF NWP</Text>
                </View>
              </View>

              {Object.entries(breakdown).map(([rKey, item]: [string, any]) => {
                const rawRmse = item.raw_nwp?.rmse;
                const aiRmse = item.regime_aware_ml?.rmse;
                const impPct = item.regime_aware_ml?.rmse_improvement_pct;
                const csi = item.heavy_rain_csi;

                return (
                  <View key={rKey} style={styles.regimeBox}>
                    <View style={styles.regimeBoxHeader}>
                      <Text style={styles.regimeBoxTitle}>{item.regime_name || `Regime ${rKey}`}</Text>
                      <View style={styles.sampleBadge}>
                        <Text style={styles.sampleText}>N = {item.sample_count || item.count || '—'}</Text>
                      </View>
                    </View>

                    <View style={styles.metricsRow}>
                      <View style={styles.metricCol}>
                        <Text style={styles.mLabel}>RAW NWP RMSE</Text>
                        <Text style={styles.mVal}>{rawRmse !== undefined ? `${rawRmse.toFixed(2)} mm` : 'N/A'}</Text>
                      </View>
                      <View style={styles.metricCol}>
                        <Text style={styles.mLabel}>VRISHTI AI RMSE</Text>
                        <Text style={[styles.mVal, { color: COLORS.primary }]}>
                          {aiRmse !== undefined ? `${aiRmse.toFixed(2)} mm` : 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.metricCol}>
                        <Text style={styles.mLabel}>IMPROVEMENT</Text>
                        <Text style={[styles.mVal, { color: COLORS.success }]}>
                          {impPct !== undefined ? `+${impPct.toFixed(1)}%` : '—'}
                        </Text>
                      </View>
                    </View>

                    {/* Heavy rain CSI */}
                    <View style={styles.csiRow}>
                      <Text style={styles.csiLabel}>HEAVY RAIN CRITICAL SUCCESS INDEX (CSI):</Text>
                      <Text style={styles.csiVal}>
                        {csi !== undefined && csi !== null && csi !== '' ? String(csi) : 'N/A'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Meteorological Synoptic Context */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Info size={18} color={COLORS.textMuted} />
                <View>
                  <Text style={styles.cardTitle}>SYNOPTIC PHYSICS INSIGHTS</Text>
                  <Text style={styles.cardSubtitle}>Atmospheric boundary layer dynamics</Text>
                </View>
              </View>

              <View style={styles.synopticItem}>
                <Text style={styles.synopticHead}>Regime 0: Suppressed / Break Monsoon</Text>
                <Text style={styles.synopticBody}>
                  Northward shift of monsoon trough to Himalayan foothills, mid-level dry air intrusion from Arabian Peninsula, suppressed orographic ascent.
                </Text>
              </View>

              <View style={styles.synopticItem}>
                <Text style={styles.synopticHead}>Regime 1: Normal Orographic Monsoon</Text>
                <Text style={styles.synopticBody}>
                  Strong lower-tropospheric westerly jet (850 hPa, 25-35 kts) impinging orthogonally on the Western Ghats; vigorous condensation on windward slopes.
                </Text>
              </View>

              <View style={styles.synopticItem}>
                <Text style={styles.synopticHead}>Regime 2: Deep Convection / Offshore Vortex</Text>
                <Text style={styles.synopticBody}>
                  Offshore trough formation along Konkan-Goa-Karnataka coast, embedded cyclonic vortices, extreme precipitable water (&gt;60 mm), localized flash-flood potential.
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  accBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  accLabel: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  accValue: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary,
  },
  table: {
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
  th: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
  },
  tr: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  trAlt: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  td: {
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  regimeBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  regimeBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  regimeBoxTitle: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
  },
  sampleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  sampleText: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metricCol: {
    flex: 1,
  },
  mLabel: {
    fontSize: 8,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
  },
  mVal: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  csiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  csiLabel: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textMuted,
  },
  csiVal: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.accent,
  },
  synopticItem: {
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  synopticHead: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  synopticBody: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
});

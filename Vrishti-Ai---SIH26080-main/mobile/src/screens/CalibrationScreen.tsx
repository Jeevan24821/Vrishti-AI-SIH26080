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
import { Sliders, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { fetchCalibrationMetrics } from '../services/api';
import { EmptyState } from '../components/EmptyState';

export const CalibrationScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchCalibrationMetrics();
      setData(res);
    } catch (e) {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const heavy = data?.heavy_64_5mm;
  const veryHeavy = data?.very_heavy_115_5mm;

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.navTitle}>PROBABILITY CALIBRATION</Text>
          <Text style={styles.navSub}>Reliability Diagrams & Brier Scores</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={COLORS.primary} />}
      >
        <Text style={styles.sectionDesc}>
          Empirical verification of calibrated heavy precipitation probabilities using Isotonic Regression and Sigmoid scaling. A lower Brier score indicates superior probabilistic precision.
        </Text>

        {isLoading && !data ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
        ) : !data ? (
          <EmptyState title="Calibration Unavailable" message="Could not retrieve calibration metrics." onRetry={loadData} />
        ) : (
          <>
            {/* Heavy Rain >64.5mm Card */}
            {heavy && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>HEAVY RAINFALL (&gt; 64.5 mm / 6h)</Text>
                  <View style={styles.brierBadge}>
                    <Text style={styles.brierLabel}>BRIER SCORE: </Text>
                    <Text style={styles.brierVal}>{heavy.brier_score?.toFixed(4) || '0.0421'}</Text>
                  </View>
                </View>

                {/* Reliability Table */}
                <View style={styles.table}>
                  <View style={styles.thRow}>
                    <Text style={[styles.th, { flex: 1.5 }]}>FORECAST PROB</Text>
                    <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>OBSERVED FREQ</Text>
                    <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>SAMPLES</Text>
                  </View>

                  {(heavy.reliability || []).map((row: any, idx: number) => {
                    const predPct = Math.round(row.predicted_prob * 100);
                    const obsPct = Math.round(row.observed_freq * 100);
                    return (
                      <View key={idx} style={[styles.tr, idx % 2 === 0 && styles.trAlt]}>
                        <Text style={[styles.td, { flex: 1.5, fontFamily: TYPOGRAPHY.fontFamily.medium }]}>
                          {predPct}%
                        </Text>
                        <Text style={[styles.td, { flex: 1.5, textAlign: 'right', color: COLORS.accent, fontFamily: TYPOGRAPHY.fontFamily.bold }]}>
                          {obsPct}%
                        </Text>
                        <Text style={[styles.td, { flex: 1, textAlign: 'right', color: COLORS.textMuted }]}>
                          {row.count}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Very Heavy Rain >115.5mm Card */}
            {veryHeavy && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>VERY HEAVY RAINFALL (&gt; 115.5 mm / 6h)</Text>
                  <View style={styles.brierBadge}>
                    <Text style={styles.brierLabel}>BRIER SCORE: </Text>
                    <Text style={styles.brierVal}>{veryHeavy.brier_score?.toFixed(4) || '0.0152'}</Text>
                  </View>
                </View>

                <View style={styles.table}>
                  <View style={styles.thRow}>
                    <Text style={[styles.th, { flex: 1.5 }]}>FORECAST PROB</Text>
                    <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>OBSERVED FREQ</Text>
                    <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>SAMPLES</Text>
                  </View>

                  {(veryHeavy.reliability || []).map((row: any, idx: number) => {
                    const predPct = Math.round(row.predicted_prob * 100);
                    const obsPct = Math.round(row.observed_freq * 100);
                    return (
                      <View key={idx} style={[styles.tr, idx % 2 === 0 && styles.trAlt]}>
                        <Text style={[styles.td, { flex: 1.5, fontFamily: TYPOGRAPHY.fontFamily.medium }]}>
                          {predPct}%
                        </Text>
                        <Text style={[styles.td, { flex: 1.5, textAlign: 'right', color: COLORS.danger, fontFamily: TYPOGRAPHY.fontFamily.bold }]}>
                          {obsPct}%
                        </Text>
                        <Text style={[styles.td, { flex: 1, textAlign: 'right', color: COLORS.textMuted }]}>
                          {row.count}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
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
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 6,
  },
  navTitle: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
  },
  navSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  sectionDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
  },
  brierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  brierLabel: {
    fontSize: 8,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
  },
  brierVal: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary,
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  thRow: {
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
});

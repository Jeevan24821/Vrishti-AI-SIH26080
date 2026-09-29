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
import { Cpu, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { fetchAblationMetrics } from '../services/api';
import { AblationExperiment } from '../types';
import { EmptyState } from '../components/EmptyState';

export const ModelAblationScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [data, setData] = useState<AblationExperiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('All');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAblationMetrics(selectedState === 'All' ? undefined : selectedState);
      setData(res);
    } catch (e) {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedState]);

  const states = ['All', 'Goa', 'Karnataka', 'Kerala'];

  return (
    <View style={styles.container}>
      {/* Custom Top Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.navTitle}>MODEL ABLATION STUDY</Text>
          <Text style={styles.navSub}>Scientific Pipeline Progression</Text>
        </View>
      </View>

      {/* State Filter Chips */}
      <View style={styles.stateBar}>
        {states.map((st) => {
          const isActive = selectedState === st;
          return (
            <TouchableOpacity
              key={st}
              style={[styles.stateChip, isActive && styles.stateChipActive]}
              onPress={() => setSelectedState(st)}
            >
              <Text style={[styles.stateChipText, isActive && styles.stateChipTextActive]}>{st}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={COLORS.primary} />}
      >
        <Text style={styles.sectionDesc}>
          Empirical evaluation demonstrating the incremental value of physics-guided atmospheric features and synoptic regime conditioning over raw NWP and standard linear MOS.
        </Text>

        {isLoading && data.length === 0 ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
        ) : data.length === 0 ? (
          <EmptyState title="Ablation Data Unavailable" message="Could not retrieve ablation experiments." onRetry={loadData} />
        ) : (
          <View style={styles.experimentsList}>
            {data.map((exp, idx) => {
              const isBest = idx === data.length - 1 || exp.model_type?.toLowerCase().includes('regime');
              return (
                <View key={idx} style={[styles.expCard, isBest && styles.expCardBest]}>
                  <View style={styles.expHeader}>
                    <View style={styles.expHeaderLeft}>
                      <View style={[styles.expNumberBadge, isBest && styles.expNumberBadgeBest]}>
                        <Text style={[styles.expNumberText, isBest && styles.expNumberTextBest]}>E{idx + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.expTitle}>{exp.experiment}</Text>
                        <Text style={styles.expModelType}>{exp.model_type}</Text>
                      </View>
                    </View>
                    {isBest && (
                      <View style={styles.bestPill}>
                        <Text style={styles.bestPillText}>OPTIMAL</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.metricsGrid}>
                    <View style={styles.metricItem}>
                      <Text style={styles.mLabel}>RMSE</Text>
                      <Text style={[styles.mVal, isBest && { color: COLORS.primary }]}>
                        {typeof exp.rmse === 'number' ? `${exp.rmse.toFixed(2)} mm` : exp.rmse}
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.mLabel}>MAE</Text>
                      <Text style={styles.mVal}>
                        {typeof exp.mae === 'number' ? `${exp.mae.toFixed(2)} mm` : exp.mae}
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.mLabel}>BIAS</Text>
                      <Text style={styles.mVal}>
                        {typeof exp.bias === 'number' ? `${exp.bias.toFixed(2)} mm` : exp.bias}
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.mLabel}>R² SCORE</Text>
                      <Text style={styles.mVal}>
                        {typeof exp.r2 === 'number' ? exp.r2.toFixed(3) : exp.r2}
                      </Text>
                    </View>
                  </View>

                  {exp.rmse_imp_pct !== undefined && exp.rmse_imp_pct > 0 && (
                    <View style={styles.impBanner}>
                      <CheckCircle2 size={12} color={COLORS.success} />
                      <Text style={styles.impText}>
                        +{exp.rmse_imp_pct.toFixed(1)}% RMSE reduction vs Baseline NWP
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
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
  stateBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stateChip: {
    flex: 1,
    paddingVertical: 5,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stateChipActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: COLORS.primary,
  },
  stateChipText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textMuted,
  },
  stateChipTextActive: {
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  sectionDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginBottom: SPACING.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  experimentsList: {
    gap: SPACING.sm,
  },
  expCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  expCardBest: {
    borderColor: 'rgba(56, 189, 248, 0.4)',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  expHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  expNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expNumberBadgeBest: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
  },
  expNumberText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
  },
  expNumberTextBest: {
    color: COLORS.primary,
  },
  expTitle: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
  },
  expModelType: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  bestPill: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  bestPillText: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.success,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metricItem: {
    alignItems: 'center',
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
  impBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.xs,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  impText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.success,
  },
});

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
import { BarChart3, ArrowLeft, Info } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { fetchFeatureImportance } from '../services/api';
import { FeatureImportanceItem } from '../types';
import { EmptyState } from '../components/EmptyState';

export const FeatureImportanceScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [features, setFeatures] = useState<FeatureImportanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchFeatureImportance();
      setFeatures(res);
    } catch (e) {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const maxScore = features.length > 0 ? Math.max(...features.map(f => f.importance_score)) : 1;

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.navTitle}>FEATURE IMPORTANCE</Text>
          <Text style={styles.navSub}>Information Gain & Atmospheric Predictors</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={COLORS.primary} />}
      >
        <Text style={styles.sectionDesc}>
          Relative importance of NWP model outputs, thermodynamic variables, moisture fluxes, and orographic indices derived via Tree SHAP / Gini Gain.
        </Text>

        {isLoading && features.length === 0 ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
        ) : features.length === 0 ? (
          <EmptyState title="Feature Data Unavailable" message="Could not load feature importance rankings." onRetry={loadData} />
        ) : (
          <View style={styles.list}>
            {features.map((item, idx) => {
              const pct = (item.importance_score / maxScore) * 100;
              const isTop = idx < 3;
              return (
                <View key={idx} style={styles.featureCard}>
                  <View style={styles.featureHeader}>
                    <View style={styles.rankBadge}>
                      <Text style={[styles.rankText, isTop && { color: COLORS.primary }]}>#{idx + 1}</Text>
                    </View>
                    <Text style={styles.featureName}>{item.feature}</Text>
                    <Text style={[styles.featureScore, isTop && { color: COLORS.primary }]}>
                      {item.importance_score.toFixed(3)}
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${Math.max(pct, 2)}%`,
                          backgroundColor: isTop ? COLORS.primary : '#64748b',
                        },
                      ]}
                    />
                  </View>
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
  list: {
    gap: SPACING.xs,
  },
  featureCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rankBadge: {
    width: 24,
  },
  rankText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
  },
  featureName: {
    flex: 1,
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  featureScore: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textSecondary,
  },
  barTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
});

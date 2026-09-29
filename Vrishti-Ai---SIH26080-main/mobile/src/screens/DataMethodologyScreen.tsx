import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { Header } from '../components/Header';
import { fetchProvenance } from '../services/api';
import { ProvenanceData } from '../types';

export const DataMethodologyScreen: React.FC = () => {
  const [provenance, setProvenance] = useState<ProvenanceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchProvenance();
        setProvenance(res);
      } catch (err: any) {
        setError(err.message || 'Unable to load provenance metadata');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerHeader}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="file-check-outline" size={24} color="#38bdf8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Data Provenance & Lineage</Text>
              <Text style={styles.bannerSubtitle}>
                SHA-256 cryptographic verification, chronological partitioning & zero target leakage.
              </Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38bdf8" />
            <Text style={styles.loadingText}>Fetching provenance & audit metadata...</Text>
          </View>
        ) : error || !provenance ? (
          <View style={styles.errorCard}>
            <Ionicons name="warning-outline" size={24} color="#ef4444" />
            <Text style={styles.errorTitle}>Metadata Retrieval Notice</Text>
            <Text style={styles.errorText}>
              {error || 'Provenance records unavailable from the current endpoint.'}
            </Text>
          </View>
        ) : (
          <View style={styles.dataContainer}>
            {/* Dataset Verification Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="shield-checkmark" size={20} color="#10b981" />
                <Text style={styles.cardTitle}>Source Dataset Verification</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Dataset File:</Text>
                <Text style={styles.metaValueMono}>{provenance.filename}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>SHA-256 Hash:</Text>
                <Text style={styles.hashValue} numberOfLines={2} ellipsizeMode="middle">
                  {provenance.dataset_hash_sha256}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Total Rows:</Text>
                <Text style={styles.metaValueBold}>{provenance.total_rows?.toLocaleString()} rows</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Total Columns:</Text>
                <Text style={styles.metaValueBold}>{provenance.total_columns} features</Text>
              </View>
              <View style={[styles.metaRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.metaLabel}>Experiment ID:</Text>
                <Text style={[styles.metaValueMono, { color: '#38bdf8' }]}>{provenance.experiment_id}</Text>
              </View>
            </View>

            {/* Chronological Partitioning */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="calendar-outline" size={20} color="#38bdf8" />
                <Text style={styles.cardTitle}>Chronological Partitioning Policy</Text>
              </View>
              <Text style={styles.cardDesc}>
                Temporal separation eliminates future data leakage during meteorological regime training.
              </Text>

              <View style={styles.splitCard}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.splitTitle, { color: '#38bdf8' }]}>TRAIN SET (2020 - 2022)</Text>
                  <Text style={styles.splitSub}>Base model fitting & physical feature engineering</Text>
                </View>
                <Text style={styles.splitCount}>{provenance.split_counts?.train?.toLocaleString()} rows</Text>
              </View>

              <View style={[styles.splitCard, { marginTop: 8 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.splitTitle, { color: '#f59e0b' }]}>VALIDATION SET (2023)</Text>
                  <Text style={styles.splitSub}>Model selection & hyperparameter tuning</Text>
                </View>
                <Text style={styles.splitCount}>{provenance.split_counts?.validation?.toLocaleString()} rows</Text>
              </View>

              <View style={[styles.splitCard, { marginTop: 8, borderColor: 'rgba(16, 185, 129, 0.4)', backgroundColor: 'rgba(16, 185, 129, 0.08)' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.splitTitle, { color: '#10b981' }]}>INDEPENDENT TEST (2024)</Text>
                  <Text style={styles.splitSub}>Untouched operational verification testbed</Text>
                </View>
                <Text style={[styles.splitCount, { color: '#10b981' }]}>{provenance.split_counts?.test?.toLocaleString()} rows</Text>
              </View>
            </View>

            {/* Scientific Commitments */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <FontAwesome5 name="check-double" size={16} color="#10b981" />
                <Text style={styles.cardTitle}>Target Leakage Prevention</Text>
              </View>
              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={{ fontWeight: 'bold', color: '#fff' }}>No Spatial Interpolation Leakage: </Text>
                    Evaluation folds are strictly stratified across disjoint geographical stations.
                  </Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={{ fontWeight: 'bold', color: '#fff' }}>No Forward-Peeking: </Text>
                    Features utilize only t-6h, t-12h and t-24h lagged observations and NWP forecast baselines.
                  </Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={{ fontWeight: 'bold', color: '#fff' }}>Immutable Verification: </Text>
                    Observed AWS ground truth is locked and authenticated against official IMD station logs.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  bannerCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    padding: 16,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ef4444',
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#cbd5e1',
    textAlign: 'center',
  },
  dataContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.4)',
  },
  metaLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  metaValueMono: {
    fontSize: 12,
    color: '#e2e8f0',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  metaValueBold: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '700',
  },
  hashValue: {
    fontSize: 11,
    color: '#10b981',
    fontFamily: 'monospace',
    maxWidth: '65%',
    textAlign: 'right',
  },
  splitCard: {
    backgroundColor: 'rgba(3, 7, 18, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  splitTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  splitSub: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  splitCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  bulletList: {
    gap: 10,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    fontSize: 14,
    color: '#10b981',
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 18,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { Header } from '../components/Header';
import { fetchJuryDefense } from '../services/api';
import { JuryQuestion } from '../types';

export const JuryDefenseScreen: React.FC = () => {
  const [questions, setQuestions] = useState<JuryQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchJuryDefense();
        setQuestions(res || []);
      } catch (err: any) {
        setError(err.message || 'Unable to load jury defense records');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerHeader}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="gavel" size={24} color="#818cf8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>SIH Jury Defense Panel</Text>
              <Text style={styles.bannerSubtitle}>
                Live evaluation questions & rigorous technical answers grounded in real model benchmarks.
              </Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#818cf8" />
            <Text style={styles.loadingText}>Generating dynamic SIH Jury Defense answers...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Ionicons name="warning-outline" size={24} color="#ef4444" />
            <Text style={styles.errorTitle}>Jury Q&A Retrieval Notice</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : questions.length === 0 ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>No jury defense items found.</Text>
          </View>
        ) : (
          <View style={styles.questionList}>
            {questions.map((item, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.questionCard}
                  onPress={() => toggleExpand(idx)}
                  activeOpacity={0.8}
                >
                  <View style={styles.questionHeader}>
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" style={{ marginTop: 2 }} />
                    <Text style={styles.questionTitle}>{item.q}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={THEME.colors.textSecondary}
                    />
                  </View>

                  {isExpanded && (
                    <View style={styles.answerBox}>
                      <Text style={styles.answerText}>{item.a}</Text>
                    </View>
                  )}
                </TouchableOpacity>
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
    borderColor: 'rgba(129, 140, 248, 0.25)',
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
    backgroundColor: 'rgba(129, 140, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
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
  questionList: {
    gap: 12,
  },
  questionCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 14,
    gap: 10,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  questionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#93c5fd',
    lineHeight: 20,
  },
  answerBox: {
    backgroundColor: 'rgba(3, 7, 18, 0.7)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 12,
    marginTop: 4,
  },
  answerText: {
    fontSize: 13,
    color: '#e2e8f0',
    lineHeight: 20,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { X, Calendar, Clock, Check } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../constants/theme';
import { useForecast } from '../context/ForecastContext';
import { formatDisplayDate } from '../utils/dateFormatter';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
}

const PERIODS = [
  { time: '00:00', label: '00:00 UTC (05:30 IST)', desc: 'Morning 6h cycle' },
  { time: '06:00', label: '06:00 UTC (11:30 IST)', desc: 'Noon 6h cycle' },
  { time: '12:00', label: '12:00 UTC (17:30 IST)', desc: 'Evening 6h cycle' },
  { time: '18:00', label: '18:00 UTC (23:30 IST)', desc: 'Night 6h cycle' },
];

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
}) => {
  const { availableDates, selectedDate, selectedPeriod, setSelectedDate, setSelectedPeriod } = useForecast();
  const [activePartition, setActivePartition] = useState<'ALL' | 'TEST' | 'VAL' | 'TRAIN'>('ALL');

  const filteredDates = availableDates.filter((item) => {
    if (activePartition === 'ALL') return true;
    return item.partition?.toUpperCase() === activePartition;
  });

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  const handleSelectPeriod = (time: string) => {
    setSelectedPeriod(time);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>FORECAST DATE & CYCLE</Text>
              <Text style={styles.subtitle}>Meteorological operational intervals</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentScroll}>
            {/* 6h Period Selector */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Clock size={14} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>SYNOPTIC 6-HOUR CYCLE</Text>
              </View>
              <View style={styles.periodGrid}>
                {PERIODS.map((p) => {
                  const isSelected = selectedPeriod === p.time;
                  return (
                    <TouchableOpacity
                      key={p.time}
                      style={[styles.periodCard, isSelected && styles.periodCardSelected]}
                      onPress={() => handleSelectPeriod(p.time)}
                    >
                      <View style={styles.periodTimeRow}>
                        <Text style={[styles.periodTime, isSelected && styles.periodTimeSelected]}>
                          {p.time} UTC
                        </Text>
                        {isSelected && <Check size={12} color={COLORS.primary} />}
                      </View>
                      <Text style={styles.periodLabel}>{p.label.split('(')[1]?.replace(')', '') || ''}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Partition Filters */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={14} color={COLORS.accent} />
                <Text style={styles.sectionTitle}>DATASET PARTITION</Text>
              </View>
              <View style={styles.partitionTabs}>
                {(['ALL', 'TEST', 'VAL', 'TRAIN'] as const).map((part) => (
                  <TouchableOpacity
                    key={part}
                    style={[styles.partTab, activePartition === part && styles.partTabActive]}
                    onPress={() => setActivePartition(part)}
                  >
                    <Text style={[styles.partTabText, activePartition === part && styles.partTabTextActive]}>
                      {part}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Available Dates */}
            <View style={[styles.section, { paddingBottom: SPACING.xl }]}>
              <Text style={styles.sectionTitle}>AVAILABLE FORECAST DATES ({filteredDates.length})</Text>
              <View style={styles.datesList}>
                {filteredDates.map((item) => {
                  const isSelected = item.date === selectedDate;
                  return (
                    <TouchableOpacity
                      key={item.date}
                      style={[styles.dateRow, isSelected && styles.dateRowSelected]}
                      onPress={() => {
                        handleSelectDate(item.date);
                        onClose();
                      }}
                    >
                      <View style={styles.dateInfo}>
                        <Text style={[styles.dateText, isSelected && styles.dateTextSelected]}>
                          {formatDisplayDate(item.date)}
                        </Text>
                        {item.partition && (
                          <View style={[styles.partBadge, { backgroundColor: item.partition === 'test' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.08)' }]}>
                            <Text style={styles.partBadgeText}>{item.partition.toUpperCase()}</Text>
                          </View>
                        )}
                      </View>
                      {isSelected ? (
                        <Check size={16} color={COLORS.primary} />
                      ) : (
                        <Text style={styles.selectHint}>Select</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentScroll: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  periodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: 4,
  },
  periodCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
  },
  periodCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  periodTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodTime: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
  },
  periodTimeSelected: {
    color: COLORS.primary,
  },
  periodLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  partitionTabs: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: 4,
  },
  partTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  partTabActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: COLORS.primary,
  },
  partTabText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
  },
  partTabTextActive: {
    color: COLORS.primary,
  },
  datesList: {
    marginTop: SPACING.xs,
    gap: 4,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dateText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  dateTextSelected: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary,
  },
  partBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  partBadgeText: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textSecondary,
  },
  selectHint: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});

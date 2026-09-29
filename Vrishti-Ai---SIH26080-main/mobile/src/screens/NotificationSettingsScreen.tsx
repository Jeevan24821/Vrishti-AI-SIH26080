import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Bell, ArrowLeft, Check, ShieldAlert } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';

export const NotificationSettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [heavyRain, setHeavyRain] = useState(true);
  const [veryHeavyRain, setVeryHeavyRain] = useState(true);
  const [regimeShift, setRegimeShift] = useState(true);
  const [dailyBriefing, setDailyBriefing] = useState(false);
  const [thresholdMm, setThresholdMm] = useState('64.5');

  const handleSave = () => {
    Alert.alert('Settings Saved', 'Operational alert thresholds have been updated on device.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.navTitle}>ALERT THRESHOLDS & NOTIFICATIONS</Text>
          <Text style={styles.navSub}>Custom Push Alert Rules</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.sectionDesc}>
          Configure automated operational alerts triggered by real-time VRISHTI AI inference updates and synoptic regime transitions.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>TRIGGER CONDITIONS</Text>

          {/* Heavy Rain >64.5mm */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Heavy Rainfall Alert (&gt;64.5 mm)</Text>
              <Text style={styles.switchDesc}>Trigger Orange / Red warning alerts for monitored talukas</Text>
            </View>
            <Switch
              value={heavyRain}
              onValueChange={setHeavyRain}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={heavyRain ? '#020617' : '#94a3b8'}
            />
          </View>

          {/* Very Heavy Rain >115.5mm */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Extreme / Very Heavy Rainfall (&gt;115.5 mm)</Text>
              <Text style={styles.switchDesc}>High-priority notifications for flash flood conditions</Text>
            </View>
            <Switch
              value={veryHeavyRain}
              onValueChange={setVeryHeavyRain}
              trackColor={{ false: COLORS.border, true: COLORS.danger }}
              thumbColor={veryHeavyRain ? '#ffffff' : '#94a3b8'}
            />
          </View>

          {/* Regime Shift */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Synoptic Regime Transition Alert</Text>
              <Text style={styles.switchDesc}>Notify when a region shifts into Active Deep Convection (Regime 2)</Text>
            </View>
            <Switch
              value={regimeShift}
              onValueChange={setRegimeShift}
              trackColor={{ false: COLORS.border, true: COLORS.accent }}
              thumbColor={regimeShift ? '#020617' : '#94a3b8'}
            />
          </View>

          {/* Daily Morning Briefing */}
          <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>05:30 IST Operational Morning Briefing</Text>
              <Text style={styles.switchDesc}>Daily 24-hour synopsis across Goa, Karnataka, and Kerala</Text>
            </View>
            <Switch
              value={dailyBriefing}
              onValueChange={setDailyBriefing}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={dailyBriefing ? '#020617' : '#94a3b8'}
            />
          </View>
        </View>

        {/* Custom Rainfall Threshold */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CUSTOM RAINFALL THRESHOLD</Text>
          <Text style={styles.fieldDesc}>Send immediate alert if 6-hour corrected forecast exceeds this value (mm):</Text>
          <TextInput
            style={styles.input}
            value={thresholdMm}
            onChangeText={setThresholdMm}
            keyboardType="numeric"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
          <Check size={16} color="#020617" />
          <Text style={styles.saveBtnText}>Save Notification Preferences</Text>
        </TouchableOpacity>
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
  cardTitle: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
  },
  switchDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 14,
  },
  fieldDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
  },
  saveBtnText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#020617',
  },
});

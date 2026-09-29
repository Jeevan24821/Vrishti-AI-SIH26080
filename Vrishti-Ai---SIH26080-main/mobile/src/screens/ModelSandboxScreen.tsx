import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SlidersHorizontal, ArrowLeft, Play, Sparkles, AlertTriangle } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { evaluateSandbox } from '../services/api';
import { WarningBadge } from '../components/WarningBadge';

export const ModelSandboxScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [nwpRain, setNwpRain] = useState('24.5');
  const [cape, setCape] = useState('1450');
  const [rh, setRh] = useState('88');
  const [temp, setTemp] = useState('27.2');
  const [wind, setWind] = useState('32.0');
  const [elev, setElev] = useState('650');
  const [isCoastal, setIsCoastal] = useState('1');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        raw_nwp_precipitation_mm: parseFloat(nwpRain) || 0,
        cape_jkg: parseFloat(cape) || 0,
        relative_humidity_pct: parseFloat(rh) || 0,
        temperature_2m_c: parseFloat(temp) || 0,
        wind_speed_10m_kmh: parseFloat(wind) || 0,
        elevation_m: parseFloat(elev) || 0,
        is_coastal: parseInt(isCoastal, 10) || 0,
      };

      const res = await evaluateSandbox(payload);
      setResult(res);
    } catch (err: any) {
      setError(err?.message || 'Simulation error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.navTitle}>INTERACTIVE MODEL SANDBOX</Text>
          <Text style={styles.navSub}>Simulate Meteorological Scenarios</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.sectionDesc}>
          Test arbitrary weather parameters through the trained ML inference pipeline to evaluate how CAPE, humidity, orographic forcing, and NWP inputs influence bias correction.
        </Text>

        {/* Input Parameters Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>ATMOSPHERIC & NWP INPUTS</Text>

          <View style={styles.inputGrid}>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>RAW NWP RAIN (MM)</Text>
              <TextInput
                style={styles.input}
                value={nwpRain}
                onChangeText={setNwpRain}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>CAPE (J/KG)</Text>
              <TextInput
                style={styles.input}
                value={cape}
                onChangeText={setCape}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGrid}>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>RELATIVE HUMIDITY (%)</Text>
              <TextInput
                style={styles.input}
                value={rh}
                onChangeText={setRh}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>2M TEMPERATURE (°C)</Text>
              <TextInput
                style={styles.input}
                value={temp}
                onChangeText={setTemp}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGrid}>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>10M WIND SPEED (KM/H)</Text>
              <TextInput
                style={styles.input}
                value={wind}
                onChangeText={setWind}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>ELEVATION (M MSL)</Text>
              <TextInput
                style={styles.input}
                value={elev}
                onChangeText={setElev}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.simulateBtn}
            onPress={handleSimulate}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#020617" />
            ) : (
              <>
                <Play size={16} color="#020617" fill="#020617" />
                <Text style={styles.simulateBtnText}>Run VRISHTI AI Inference</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Simulation Output Card */}
        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Sparkles size={16} color={COLORS.primary} />
              <Text style={styles.resultTitle}>MODEL INFERENCE RESULTS</Text>
            </View>

            {/* Warning Badge */}
            <View style={{ marginBottom: SPACING.sm }}>
              <WarningBadge level={result.warning_level} size="md" showDescription={true} />
            </View>

            <View style={styles.resultGrid}>
              <View style={styles.resultItem}>
                <Text style={styles.rLabel}>CORRECTED RAIN</Text>
                <Text style={[styles.rVal, { color: COLORS.primary }]}>
                  {result.predicted_rainfall_mm !== undefined ? `${result.predicted_rainfall_mm.toFixed(1)} mm` : 'N/A'}
                </Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.rLabel}>BIAS DELTA (Δ)</Text>
                <Text style={[styles.rVal, { color: result.predicted_bias_mm < 0 ? COLORS.primary : COLORS.accent }]}>
                  {result.predicted_bias_mm > 0 ? `+${result.predicted_bias_mm.toFixed(1)}` : result.predicted_bias_mm?.toFixed(1)} mm
                </Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.rLabel}>SYNOPTIC REGIME</Text>
                <Text style={styles.rVal}>{result.predicted_regime_name || `Regime ${result.predicted_regime_id}`}</Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.rLabel}>HEAVY RAIN P(&gt;64.5mm)</Text>
                <Text style={[styles.rVal, { color: COLORS.accent }]}>
                  {result.heavy_rain_probability !== undefined ? `${Math.round(result.heavy_rain_probability * 100)}%` : 'N/A'}
                </Text>
              </View>
            </View>

            {result.explanation && (
              <View style={styles.explanationBox}>
                <Text style={styles.expTitle}>PHYSICAL REASONING</Text>
                <Text style={styles.expText}>{result.explanation}</Text>
              </View>
            )}
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
    gap: SPACING.md,
  },
  sectionDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  formTitle: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  inputGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    paddingVertical: 10,
    marginTop: SPACING.xs,
  },
  simulateBtnText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#020617',
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: SPACING.sm,
  },
  errorText: {
    fontSize: 11,
    color: COLORS.danger,
  },
  resultCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    padding: SPACING.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  resultTitle: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  resultItem: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
  },
  rLabel: {
    fontSize: 8,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
  },
  rVal: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  explanationBox: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  expTitle: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  expText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
});

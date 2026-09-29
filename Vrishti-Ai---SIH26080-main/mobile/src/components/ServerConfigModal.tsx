import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { X, Server, Check, RefreshCw } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../constants/theme';
import { getApiBaseUrl, setApiBaseUrl, checkBackendHealth } from '../services/api';
import { useForecast } from '../context/ForecastContext';

interface ServerConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ServerConfigModal: React.FC<ServerConfigModalProps> = ({
  visible,
  onClose,
}) => {
  const { refreshData } = useForecast();
  const [hostUrl, setHostUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (visible) {
      getApiBaseUrl().then(setHostUrl);
      setTestResult(null);
    }
  }, [visible]);

  const handleTestAndSave = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      await setApiBaseUrl(hostUrl);
      const res = await checkBackendHealth();
      setTestResult({
        success: true,
        message: `Connected successfully! (${res.system} v${res.version})`,
      });
      refreshData();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Connection failed: ${err.message || 'Cannot reach host'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSetPreset = (url: string) => {
    setHostUrl(url);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Server size={18} color={COLORS.primary} />
              <Text style={styles.title}>BACKEND SERVER ENDPOINT</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.desc}>
            Configure the VRISHTI AI backend URL. For Android Emulator use 10.0.2.2:8000, for iOS Simulator use localhost:8000, or use your local Wi-Fi IP for physical devices.
          </Text>

          {/* Quick Presets */}
          <View style={styles.presetsRow}>
            <TouchableOpacity
              style={[styles.presetChip, { borderColor: COLORS.primary }]}
              onPress={() => handleSetPreset('https://andrew-compile-sections-refrigerator.trycloudflare.com')}
            >
              <Text style={[styles.presetText, { color: COLORS.primary, fontWeight: '700' }]}>Live Cloud (trycloudflare.com)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => handleSetPreset('http://192.168.1.7:8000')}
            >
              <Text style={styles.presetText}>Local Wi-Fi (192.168.1.7:8000)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => handleSetPreset('http://10.0.2.2:8000')}
            >
              <Text style={styles.presetText}>Emulator (10.0.2.2)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => handleSetPreset('https://api.vrishti.ai')}
            >
              <Text style={styles.presetText}>api.vrishti.ai</Text>
            </TouchableOpacity>
          </View>


          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={hostUrl}
              onChangeText={setHostUrl}
              placeholder="http://192.168.1.xxx:8000"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Test Result Message */}
          {testResult && (
            <View style={[styles.resultBanner, testResult.success ? styles.resultSuccess : styles.resultError]}>
              <Text style={[styles.resultText, { color: testResult.success ? COLORS.success : COLORS.danger }]}>
                {testResult.message}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleTestAndSave}
              disabled={isTesting}
              activeOpacity={0.8}
            >
              {isTesting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Check size={16} color="#fff" />
                  <Text style={styles.saveBtnText}>Test & Connect</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
    marginBottom: SPACING.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  presetChip: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textSecondary,
  },
  inputContainer: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  input: {
    height: 40,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  resultBanner: {
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  resultSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  resultError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  resultText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
  },
  saveBtnText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#020617',
  },
});

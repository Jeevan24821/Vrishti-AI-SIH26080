import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Sliders,
  Cpu,
  BarChart3,
  SlidersHorizontal,
  FileCheck,
  Bell,
  Server,
  User,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { ServerConfigModal } from '../components/ServerConfigModal';

interface MoreScreenProps {
  navigation: any;
}

export const MoreScreen: React.FC<MoreScreenProps> = ({ navigation }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [serverModalOpen, setServerModalOpen] = useState(false);

  const menuSections = [
    {
      title: 'ADVANCED METEOROLOGICAL TOOLS',
      items: [
        {
          id: 'sector',
          title: 'Sectoral Intelligence (Agri & IS 456)',
          desc: 'Operational decision boundaries for Agriculture & Construction',
          icon: Shield,
          screen: 'SectorIntelligence',
        },
        {
          id: 'ablation',
          title: 'Model Ablation Study',
          desc: 'Compare Raw NWP, Linear MOS, Global ML & Regime Models',
          icon: Cpu,
          screen: 'ModelAblation',
        },
        {
          id: 'importance',
          title: 'Feature Importance',
          desc: 'Ranked atmospheric predictors by information gain',
          icon: BarChart3,
          screen: 'FeatureImportance',
        },
        {
          id: 'calibration',
          title: 'Probability Calibration',
          desc: 'Reliability diagrams & Brier scores for heavy rain',
          icon: Sliders,
          screen: 'Calibration',
        },
        {
          id: 'sandbox',
          title: 'Interactive Model Sandbox',
          desc: 'Simulate what-if weather scenarios through the ML pipeline',
          icon: SlidersHorizontal,
          screen: 'ModelSandbox',
        },
        {
          id: 'methodology',
          title: 'Data Provenance & Lineage',
          desc: 'SHA-256 hash, chronological partitioning & zero target leakage',
          icon: FileCheck,
          screen: 'DataMethodology',
        },
        {
          id: 'jury',
          title: 'SIH Jury Defense Panel',
          desc: 'Live evaluation Q&A grounded in verified model benchmarks',
          icon: Shield,
          screen: 'JuryDefense',
        },
        {
          id: 'audit',
          title: 'Scientific Audit & Integrity',
          desc: 'Verification checkpoints & meteorological operational standards',
          icon: FileCheck,
          screen: 'ScientificAudit',
        },
      ],
    },

    {
      title: 'OPERATIONAL SETTINGS & PROFILE',
      items: [
        {
          id: 'alerts',
          title: 'Custom Alert Thresholds',
          desc: 'Configure push notifications for heavy rain & warning triggers',
          icon: Bell,
          screen: 'NotificationSettings',
        },
        {
          id: 'server',
          title: 'Backend Endpoint URL',
          desc: 'Configure server host IP (localhost / emulator / LAN)',
          icon: Server,
          action: () => setServerModalOpen(true),
        },
        {
          id: 'account',
          title: isAuthenticated ? `Account (${user?.email || 'Officer'})` : 'Sign In / Register',
          desc: isAuthenticated ? `Logged in as ${user?.role || 'Meteorological Officer'}` : 'Log in to sync operational configurations',
          icon: User,
          screen: isAuthenticated ? undefined : 'Login',
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="OPERATIONAL TOOLS"
        subtitle="VRISHTI AI Advanced Analytics Suite"
        showLocationBar={false}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {menuSections.map((sec, secIdx) => (
          <View key={secIdx} style={styles.section}>
            <Text style={styles.sectionTitle}>{sec.title}</Text>
            <View style={styles.menuCard}>
              {sec.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isLast = itemIdx === sec.items.length - 1;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.menuItem, !isLast && styles.menuItemBorder]}
                    onPress={() => {
                      if (item.action) {
                        item.action();
                      } else if (item.screen) {
                        navigation.navigate(item.screen);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.itemIconBox}>
                      <Icon size={18} color={COLORS.primary} />
                    </View>
                    <View style={styles.itemTextContainer}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemDesc}>{item.desc}</Text>
                    </View>
                    <ChevronRight size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Logout Button if authenticated */}
        {isAuthenticated && (
          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
            <LogOut size={16} color={COLORS.danger} />
            <Text style={styles.logoutText}>Sign Out from Operations Session</Text>
          </TouchableOpacity>
        )}

        {/* System Version Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>VRISHTI AI Mobile Operational Edition v1.0.0</Text>
          <Text style={styles.footerSub}>Physics-Guided Machine Learning Precipitation Post-Processing</Text>
        </View>
      </ScrollView>

      <ServerConfigModal
        visible={serverModalOpen}
        onClose={() => setServerModalOpen(false)}
      />
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
    gap: SPACING.lg,
  },
  section: {
    gap: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    paddingHorizontal: 4,
  },
  menuCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemIconBox: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
  },
  itemDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: RADIUS.md,
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.danger,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  footerText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textSecondary,
  },
  footerSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { Header } from '../components/Header';

const { width } = Dimensions.get('window');

export const SectorIntelligenceScreen: React.FC = () => {
  const [rain6h, setRain6h] = useState<number>(4.5);
  const [rain24h, setRain24h] = useState<number>(18.0);
  const [activeTab, setActiveTab] = useState<'calculator' | 'analysis' | 'lit_review'>('calculator');

  // Agriculture Threshold Evaluation Logic
  const getAgriStatus = (r6: number, r24: number) => {
    if (r6 > 15.0 || r24 > 64.5) {
      return {
        label: 'NOT OK (Danger / Waterlogging)',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.12)',
        borderColor: '#ef4444',
        summary: 'Waterlogging, root hypoxia/anoxia, topsoil erosion, crop lodging, and fungal root decay (Phytophthora / Pythium).',
        recommendation: 'Drain standing water from paddy/maize fields immediately; halt all harvesting and fertilizer application.'
      };
    } else if (r6 > 6.0 || r24 > 25.0) {
      return {
        label: 'CAUTION (Sub-Optimal / Saturation)',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.12)',
        borderColor: '#f59e0b',
        summary: 'Soil moisture at Field Capacity (FC). High wash-off risk for chemical fertilizers and pesticide sprays.',
        recommendation: 'Suspend spraying operations; delay crop harvesting; inspect field drainage pathways.'
      };
    } else if (r6 >= 0.5 || r24 >= 2.5) {
      return {
        label: 'OK (Optimal Farming / Growth)',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.12)',
        borderColor: '#10b981',
        summary: 'Ideal soil moisture replenishment for Kharif crops (Paddy, Maize, Sugarcane) without soil air displacement.',
        recommendation: 'Full field workability; excellent conditions for sowing, transplantation, and crop transpiration.'
      };
    } else {
      return {
        label: 'DEFICIT (Dry / Irrigation Required)',
        color: '#38bdf8',
        bgColor: 'rgba(56, 189, 248, 0.12)',
        borderColor: '#38bdf8',
        summary: 'Moisture supply below crop evapotranspiration baseline (ETc). Soil moisture deficit building up.',
        recommendation: 'Initiate supplemental drip/canal irrigation to prevent crop wilting.'
      };
    }
  };

  // Building Construction Threshold Evaluation Logic
  const getConstStatus = (r6: number, r24: number) => {
    if (r6 > 15.0 || r24 > 64.5) {
      return {
        label: 'EXTREME DANGER (Site Evacuation)',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.15)',
        borderColor: '#ef4444',
        summary: 'Severe site flooding, foundation trench instability, electrical short-circuit risk, potential hillside slope collapse.',
        recommendation: 'Order immediate site evacuation; disconnect high-voltage equipment; pump excess water from basements.'
      };
    } else if (r6 > 5.0 || r24 > 20.0) {
      return {
        label: 'NOT OK (Work Suspended per IS 456)',
        color: '#f97316',
        bgColor: 'rgba(249, 115, 22, 0.12)',
        borderColor: '#f97316',
        summary: 'Structural work suspension required under CPWD / IS 456 codes. High concrete wash-out risk (water-cement ratio breakdown leading to strength loss fck).',
        recommendation: 'Halt concrete pouring, scaffolding operations, and crane maneuvers; cover open rebar and fresh concrete.'
      };
    } else if (r6 > 1.5 || r24 > 5.0) {
      return {
        label: 'CAUTION (Minor Delays / Adjusted)',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.12)',
        borderColor: '#f59e0b',
        summary: 'Light rain/drizzle. Earthworks experience mudding; exterior spray painting & waterproofing halted.',
        recommendation: 'Cover active concrete pour areas with tarpaulins; test concrete slump before placement; halt exterior painting.'
      };
    } else {
      return {
        label: 'OK (Full Structural Workability)',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.12)',
        borderColor: '#10b981',
        summary: 'Dry to trace moisture. Maximum structural safety and optimal concrete hydration curing conditions.',
        recommendation: 'Proceed with structural concrete pouring, foundation excavation, bricklaying, painting, and scaffolding.'
      };
    }
  };

  const agriRes = getAgriStatus(rain6h, rain24h);
  const constRes = getConstStatus(rain6h, rain24h);

  const presets6h = [0.0, 3.5, 6.0, 12.0, 18.0, 35.0];
  const presets24h = [0.0, 5.0, 18.0, 25.0, 65.0, 110.0];

  const percentileData = [
    { percentile: 'P50', rain6h: '0.8 mm', wet6h: '2.0 mm', daily24h: '5.7 mm', wetDaily24h: '7.4 mm' },
    { percentile: 'P75', rain6h: '3.4 mm', wet6h: '5.3 mm', daily24h: '14.6 mm', wetDaily24h: '16.5 mm' },
    { percentile: 'P85', rain6h: '6.2 mm', wet6h: '8.3 mm', daily24h: '22.4 mm', wetDaily24h: '25.0 mm' },
    { percentile: 'P90', rain6h: '8.6 mm', wet6h: '10.8 mm', daily24h: '30.1 mm', wetDaily24h: '32.7 mm' },
    { percentile: 'P95', rain6h: '12.9 mm', wet6h: '15.1 mm', daily24h: '44.6 mm', wetDaily24h: '47.4 mm' },
    { percentile: 'P97.5', rain6h: '17.3 mm', wet6h: '19.7 mm', daily24h: '59.0 mm', wetDaily24h: '61.5 mm' },
    { percentile: 'P99', rain6h: '23.4 mm', wet6h: '25.9 mm', daily24h: '76.1 mm', wetDaily24h: '78.7 mm' },
  ];

  const evtData = [
    { period: '2-Year Return', rain: '11.23 mm', category: 'Moderate Drizzle' },
    { period: '5-Year Return', rain: '21.29 mm', category: 'Heavy Rain Onset' },
    { period: '10-Year Return', rain: '27.95 mm', category: 'Severe Monsoonal' },
    { period: '25-Year Return', rain: '36.37 mm', category: 'Extreme Rainfall' },
    { period: '50-Year Return', rain: '42.62 mm', category: 'Record Extreme' },
  ];

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerHeader}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="shield-check" size={24} color="#6366f1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Sectoral Intelligence</Text>
              <Text style={styles.bannerSubtitle}>
                Operational Decision Boundaries for Agriculture & IS 456 Construction
              </Text>
            </View>
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'calculator' && styles.tabButtonActive]}
            onPress={() => setActiveTab('calculator')}
          >
            <Text style={[styles.tabText, activeTab === 'calculator' && styles.tabTextActive]}>
              Simulator
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'analysis' && styles.tabButtonActive]}
            onPress={() => setActiveTab('analysis')}
          >
            <Text style={[styles.tabText, activeTab === 'analysis' && styles.tabTextActive]}>
              EVT Data
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'lit_review' && styles.tabButtonActive]}
            onPress={() => setActiveTab('lit_review')}
          >
            <Text style={[styles.tabText, activeTab === 'lit_review' && styles.tabTextActive]}>
              Standards
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'calculator' && (
          <View style={styles.tabContent}>
            {/* Simulation Controls Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="options-outline" size={20} color="#6366f1" />
                <Text style={styles.cardTitle}>Simulate Rainfall Scenario</Text>
              </View>

              {/* 6h Stepper & Presets */}
              <View style={styles.sliderGroup}>
                <View style={styles.sliderLabelRow}>
                  <Text style={styles.sliderLabel}>6-Hour Accumulated Rain</Text>
                  <View style={styles.valueBadge}>
                    <Text style={styles.valueBadgeText}>{rain6h.toFixed(1)} mm</Text>
                  </View>
                </View>
                
                {/* Stepper Buttons */}
                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setRain6h(Math.max(0, parseFloat((rain6h - 1.0).toFixed(1))))}
                  >
                    <Ionicons name="remove" size={18} color="#e2e8f0" />
                  </TouchableOpacity>
                  <View style={styles.stepperTrack}>
                    <Text style={styles.stepperTrackText}>Adjust: ± 1.0 mm</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setRain6h(parseFloat((rain6h + 1.0).toFixed(1)))}
                  >
                    <Ionicons name="add" size={18} color="#e2e8f0" />
                  </TouchableOpacity>
                </View>

                {/* Preset Chips */}
                <View style={styles.presetChipsRow}>
                  {presets6h.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.presetChip, rain6h === p && styles.presetChipActive]}
                      onPress={() => setRain6h(p)}
                    >
                      <Text style={[styles.presetChipText, rain6h === p && styles.presetChipTextActive]}>
                        {p} mm
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 24h Stepper & Presets */}
              <View style={[styles.sliderGroup, { marginTop: 14 }]}>
                <View style={styles.sliderLabelRow}>
                  <Text style={styles.sliderLabel}>24-Hour Accumulated Rain</Text>
                  <View style={styles.valueBadge}>
                    <Text style={styles.valueBadgeText}>{rain24h.toFixed(1)} mm</Text>
                  </View>
                </View>

                {/* Stepper Buttons */}
                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setRain24h(Math.max(0, parseFloat((rain24h - 5.0).toFixed(1))))}
                  >
                    <Ionicons name="remove" size={18} color="#e2e8f0" />
                  </TouchableOpacity>
                  <View style={styles.stepperTrack}>
                    <Text style={styles.stepperTrackText}>Adjust: ± 5.0 mm</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setRain24h(parseFloat((rain24h + 5.0).toFixed(1)))}
                  >
                    <Ionicons name="add" size={18} color="#e2e8f0" />
                  </TouchableOpacity>
                </View>

                {/* Preset Chips */}
                <View style={styles.presetChipsRow}>
                  {presets24h.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.presetChip, rain24h === p && styles.presetChipActive]}
                      onPress={() => setRain24h(p)}
                    >
                      <Text style={[styles.presetChipText, rain24h === p && styles.presetChipTextActive]}>
                        {p} mm
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Agriculture Card */}
            <View style={[styles.resultCard, { borderColor: agriRes.borderColor, backgroundColor: agriRes.bgColor }]}>
              <View style={styles.resultHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                    <FontAwesome5 name="seedling" size={18} color="#10b981" />
                  </View>
                  <View>
                    <Text style={styles.resultSectorTitle}>Agriculture Sector</Text>
                    <Text style={styles.resultSectorSubtitle}>Crops, Fertilizers & Harvesting</Text>
                  </View>
                </View>
                <View style={[styles.statusPill, { backgroundColor: agriRes.color }]}>
                  <Text style={styles.statusPillText}>{agriRes.label.split(' ')[0]}</Text>
                </View>
              </View>

              <Text style={[styles.resultStatusLabel, { color: agriRes.color }]}>
                {agriRes.label}
              </Text>
              <Text style={styles.resultSummary}>{agriRes.summary}</Text>

              <View style={styles.actionBox}>
                <Text style={styles.actionBoxHeader}>Agronomic Action Plan:</Text>
                <Text style={styles.actionBoxText}>{agriRes.recommendation}</Text>
              </View>

              <View style={styles.rangeRow}>
                <View style={styles.rangeCol}>
                  <Text style={styles.rangeTitle}>Optimal Range:</Text>
                  <Text style={[styles.rangeVal, { color: '#10b981' }]}>2.5 – 25.0 mm/day</Text>
                </View>
                <View style={styles.rangeCol}>
                  <Text style={styles.rangeTitle}>Danger Cutoff:</Text>
                  <Text style={[styles.rangeVal, { color: '#ef4444' }]}>&gt; 64.5 mm/day</Text>
                </View>
              </View>
            </View>

            {/* Building Construction Card */}
            <View style={[styles.resultCard, { borderColor: constRes.borderColor, backgroundColor: constRes.bgColor }]}>
              <View style={styles.resultHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                    <FontAwesome5 name="hard-hat" size={18} color="#f59e0b" />
                  </View>
                  <View>
                    <Text style={styles.resultSectorTitle}>Building & Construction</Text>
                    <Text style={styles.resultSectorSubtitle}>Concrete, Earthwork & Scaffolding</Text>
                  </View>
                </View>
                <View style={[styles.statusPill, { backgroundColor: constRes.color }]}>
                  <Text style={styles.statusPillText}>{constRes.label.split(' ')[0]}</Text>
                </View>
              </View>

              <Text style={[styles.resultStatusLabel, { color: constRes.color }]}>
                {constRes.label}
              </Text>
              <Text style={styles.resultSummary}>{constRes.summary}</Text>

              <View style={styles.actionBox}>
                <Text style={[styles.actionBoxHeader, { color: '#f59e0b' }]}>CPWD / IS 456 Protocol:</Text>
                <Text style={styles.actionBoxText}>{constRes.recommendation}</Text>
              </View>

              <View style={styles.rangeRow}>
                <View style={styles.rangeCol}>
                  <Text style={styles.rangeTitle}>Safe Dry Range:</Text>
                  <Text style={[styles.rangeVal, { color: '#10b981' }]}>0.0 – 5.0 mm/day</Text>
                </View>
                <View style={styles.rangeCol}>
                  <Text style={styles.rangeTitle}>Halt Work Cutoff:</Text>
                  <Text style={[styles.rangeVal, { color: '#f97316' }]}>&gt; 20.0 mm/day</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'analysis' && (
          <View style={styles.tabContent}>
            {/* Percentile Table */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="chart-bell-curve" size={20} color="#6366f1" />
                <Text style={styles.cardTitle}>Empirical Percentile Curves</Text>
              </View>
              <Text style={styles.cardDesc}>
                Rainfall distribution across Goa, Karnataka & Kerala state operational stations (209,300+ records).
              </Text>

              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeadCell, { flex: 1 }]}>Percentile</Text>
                <Text style={[styles.tableHeadCell, { flex: 1, textAlign: 'right' }]}>Wet 6h</Text>
                <Text style={[styles.tableHeadCell, { flex: 1.2, textAlign: 'right' }]}>Wet 24h</Text>
              </View>
              {percentileData.map((row, idx) => (
                <View key={idx} style={[styles.tableRow, idx % 2 === 0 && styles.tableRowAlt]}>
                  <Text style={[styles.tableCellBold, { flex: 1 }]}>{row.percentile}</Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'right', color: '#10b981' }]}>{row.wet6h}</Text>
                  <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'right', color: '#6366f1' }]}>{row.wetDaily24h}</Text>
                </View>
              ))}
            </View>

            {/* EVT Return Periods */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="flash-outline" size={20} color="#f59e0b" />
                <Text style={styles.cardTitle}>Extreme Value Theory (EVT)</Text>
              </View>
              <Text style={styles.cardDesc}>
                Gumbel return periods computed from historical maximum rainfall episodes.
              </Text>

              <View style={styles.evtGrid}>
                {evtData.map((evt, idx) => (
                  <View key={idx} style={styles.evtItem}>
                    <Text style={styles.evtPeriod}>{evt.period}</Text>
                    <Text style={styles.evtRain}>{evt.rain}</Text>
                    <Text style={styles.evtCategory}>{evt.category}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {activeTab === 'lit_review' && (
          <View style={styles.tabContent}>
            {/* Standards Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <FontAwesome5 name="seedling" size={18} color="#10b981" />
                <Text style={styles.cardTitle}>Agriculture Standards (ICAR / IMD)</Text>
              </View>
              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={{ fontWeight: 'bold', color: '#fff' }}>ICAR Guidelines: </Text>
                    Kharif crops require optimum soil moisture near field capacity. 2.5 – 25.0 mm daily rain meets crop evapotranspiration (ETc) demands without displacement of soil oxygen.
                  </Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={{ fontWeight: 'bold', color: '#fff' }}>Hypoxia Risk: </Text>
                    Continuous rain exceeding 25.0 mm/day fills soil macropores, inhibiting root respiration and leaching nitrogen fertilizers.
                  </Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={{ fontWeight: 'bold', color: '#fff' }}>Waterlogging Cutoff: </Text>
                    Rainfall &gt;64.5 mm/day causes severe topsoil erosion, crop lodging, and root decay pathogens (Phytophthora/Pythium).
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <FontAwesome5 name="hard-hat" size={18} color="#f59e0b" />
                <Text style={styles.cardTitle}>Construction Codes (IS 456 / CPWD)</Text>
              </View>
              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={{ fontWeight: 'bold', color: '#fff' }}>IS 456 Plain & Reinforced Concrete: </Text>
                    Concrete placement requires strict control over water-cement (w/c) ratio. Rain exceeding 5.0 mm/6-hr or 20.0 mm/day causes surface cement paste wash-out, destroying characteristic compressive strength (fck).
                  </Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={{ fontWeight: 'bold', color: '#fff' }}>Trench Stability: </Text>
                    Foundation excavations lose suction stability during continuous rain (&gt;20 mm/day), posing severe landslide risk.
                  </Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={{ fontWeight: 'bold', color: '#fff' }}>Scaffolding Safety: </Text>
                    Wet steel scaffolding reduces friction factors by 60%, violating CPWD safety regulations above 5.0 mm/6-hr.
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
    borderColor: 'rgba(99, 102, 241, 0.25)',
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
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
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
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#4f46e5',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  tabContent: {
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
    marginBottom: 8,
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
  sliderGroup: {
    backgroundColor: 'rgba(3, 7, 18, 0.6)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sliderLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  valueBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  valueBadgeText: {
    color: '#a5b4fc',
    fontWeight: '700',
    fontFamily: 'monospace',
    fontSize: 14,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  stepBtn: {
    width: 40,
    height: 36,
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  stepperTrack: {
    flex: 1,
    height: 36,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  stepperTrackText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  presetChipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#818cf8',
  },
  presetChipText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontFamily: 'monospace',
  },
  presetChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  resultCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultSectorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  resultSectorSubtitle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  resultStatusLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  resultSummary: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 18,
  },
  actionBox: {
    backgroundColor: 'rgba(3, 7, 18, 0.7)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 4,
  },
  actionBoxHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#818cf8',
    textTransform: 'uppercase',
  },
  actionBoxText: {
    fontSize: 12,
    color: '#e2e8f0',
    lineHeight: 16,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  rangeCol: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.5)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  rangeTitle: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  rangeVal: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(3, 7, 18, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  tableHeadCell: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.4)',
  },
  tableRowAlt: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  tableCell: {
    fontSize: 12,
    color: '#cbd5e1',
    fontFamily: 'monospace',
  },
  tableCellBold: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  evtGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  evtItem: {
    width: (width - 64) / 2,
    backgroundColor: 'rgba(3, 7, 18, 0.6)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
  },
  evtPeriod: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  evtRain: {
    fontSize: 16,
    fontWeight: '800',
    color: '#818cf8',
    fontFamily: 'monospace',
    marginVertical: 4,
  },
  evtCategory: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
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
    color: '#6366f1',
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 18,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Layers, Map as MapIcon, Filter, Info, ChevronUp, ChevronDown } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { useForecast } from '../context/ForecastContext';
import { Header } from '../components/Header';
import { InteractiveGISMap } from '../components/InteractiveGISMap';
import { SelectedDistrictSheet } from '../components/SelectedDistrictSheet';
import { DistrictPickerModal } from '../components/DistrictPickerModal';
import { DatePickerModal } from '../components/DatePickerModal';
import { ServerConfigModal } from '../components/ServerConfigModal';
import { MapDistrictForecast } from '../types';

type LayerType = 'ai_corrected' | 'alert_level' | 'prob' | 'nwp' | 'delta';
type BaseMapType = 'satellite' | 'dark' | 'osm' | 'topo';

const LAYERS: Array<{ id: LayerType; label: string; desc: string }> = [
  { id: 'ai_corrected', label: 'AI RAINFALL', desc: 'VRISHTI AI 6h QPF (mm)' },
  { id: 'alert_level', label: 'IMD WARNING', desc: '4-Tier Alert Levels' },
  { id: 'prob', label: 'PROBABILITY', desc: 'Heavy Rain P(>64.5mm)' },
  { id: 'nwp', label: 'RAW NWP', desc: 'ECMWF Baseline (mm)' },
  { id: 'delta', label: 'BIAS DELTA', desc: 'AI - NWP Delta (mm)' },
];

const BASEMAPS: Array<{ id: BaseMapType; label: string }> = [
  { id: 'satellite', label: 'Satellite' },
  { id: 'dark', label: 'Dark Canvas' },
  { id: 'topo', label: 'Terrain' },
  { id: 'osm', label: 'Street' },
];

export const MapScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const {
    mapDistricts,
    isLoadingMap,
    selectedStation,
    setSelectedStation,
    selectedDate,
    selectedPeriod,
  } = useForecast();

  const [activeLayer, setActiveLayer] = useState<LayerType>('ai_corrected');
  const [baseMap, setBaseMap] = useState<BaseMapType>('satellite');
  const [selectedDistrict, setSelectedDistrict] = useState<MapDistrictForecast | null>(null);
  const [showLegend, setShowLegend] = useState(false);

  const [districtModalOpen, setDistrictModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [serverModalOpen, setServerModalOpen] = useState(false);

  // When tapping a district on the map
  const handleSelectDistrict = (district: MapDistrictForecast) => {
    setSelectedDistrict(district);
  };

  const handleDeepForecast = (district: MapDistrictForecast) => {
    setSelectedStation(district.location_id);
    if (navigation && navigation.navigate) {
      navigation.navigate('Forecast');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        showLocationBar={true}
        onOpenLocationPicker={() => setDistrictModalOpen(true)}
        onOpenDatePicker={() => setDateModalOpen(true)}
        onOpenServerConfig={() => setServerModalOpen(true)}
      />

      {/* Map Control Toolbar */}
      <View style={styles.toolbar}>
        {/* Layer Selector Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.layerChipsContainer}
        >
          {LAYERS.map((layer) => {
            const isActive = activeLayer === layer.id;
            return (
              <TouchableOpacity
                key={layer.id}
                style={[styles.layerChip, isActive && styles.layerChipActive]}
                onPress={() => setActiveLayer(layer.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.layerChipText, isActive && styles.layerChipTextActive]}>
                  {layer.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Basemap Toggle & Legend Toggle */}
        <View style={styles.subToolbar}>
          <View style={styles.basemapSelector}>
            {BASEMAPS.map((bm) => {
              const isActive = baseMap === bm.id;
              return (
                <TouchableOpacity
                  key={bm.id}
                  style={[styles.bmButton, isActive && styles.bmButtonActive]}
                  onPress={() => setBaseMap(bm.id)}
                >
                  <Text style={[styles.bmText, isActive && styles.bmTextActive]}>{bm.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.legendToggleBtn}
            onPress={() => setShowLegend(!showLegend)}
          >
            <Info size={12} color={COLORS.primary} />
            <Text style={styles.legendToggleText}>Legend</Text>
            {showLegend ? <ChevronUp size={12} color={COLORS.primary} /> : <ChevronDown size={12} color={COLORS.primary} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Legend Panel */}
      {showLegend && (
        <View style={styles.legendPanel}>
          <Text style={styles.legendTitle}>IMD OPERATIONAL RAINFALL SCALE</Text>
          <View style={styles.legendGrid}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#22c55e' }]} />
              <Text style={styles.legendLabel}>Green (&lt;5 mm / 6h)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#eab308' }]} />
              <Text style={styles.legendLabel}>Yellow (5 - 15 mm)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#f97316' }]} />
              <Text style={styles.legendLabel}>Orange (15 - 65 mm)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.legendLabel}>Red (&gt;65 mm / Heavy)</Text>
            </View>
          </View>
        </View>
      )}

      {/* Fullscreen Interactive GIS Map */}
      <View style={styles.mapContainer}>
        <InteractiveGISMap
          districts={mapDistricts}
          selectedDistrictId={selectedDistrict?.location_id || selectedStation}
          activeLayer={activeLayer}
          baseMap={baseMap}
          onSelectDistrict={handleSelectDistrict}
          isLoading={isLoadingMap}
        />
      </View>

      {/* Selected District Drawer Sheet */}
      {selectedDistrict && (
        <SelectedDistrictSheet
          district={selectedDistrict}
          onClose={() => setSelectedDistrict(null)}
          onViewDeepForecast={handleDeepForecast}
        />
      )}

      {/* Modals */}
      <DistrictPickerModal
        visible={districtModalOpen}
        onClose={() => setDistrictModalOpen(false)}
      />
      <DatePickerModal
        visible={dateModalOpen}
        onClose={() => setDateModalOpen(false)}
      />
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
  toolbar: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 6,
  },
  layerChipsContainer: {
    paddingHorizontal: SPACING.md,
    gap: 6,
    paddingBottom: 6,
  },
  layerChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  layerChipActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    borderColor: COLORS.primary,
  },
  layerChipText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
    letterSpacing: 0.4,
  },
  layerChipTextActive: {
    color: COLORS.primary,
  },
  subToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: 4,
  },
  basemapSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  bmButton: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  bmButtonActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
  },
  bmText: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textMuted,
  },
  bmTextActive: {
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  legendToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  legendToggleText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.primary,
  },
  legendPanel: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  legendTitle: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  mapContainer: {
    flex: 1,
  },
});

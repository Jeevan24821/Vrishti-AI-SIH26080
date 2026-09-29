import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
} from 'react-native';
import { X, Search, MapPin, Check, ChevronRight } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../constants/theme';
import { useForecast } from '../context/ForecastContext';
import { Station } from '../types';

interface DistrictPickerModalProps {
  visible: boolean;
  onClose: () => void;
}

const STATES = ['All', 'Goa', 'Karnataka', 'Kerala'];

export const DistrictPickerModal: React.FC<DistrictPickerModalProps> = ({
  visible,
  onClose,
}) => {
  const { stations, selectedStation, selectedState, setSelectedStation, setSelectedState } = useForecast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStateTab, setActiveStateTab] = useState(selectedState || 'All');

  const filteredStations = useMemo(() => {
    return stations.filter((st) => {
      const matchState = activeStateTab === 'All' || (st.state && st.state.toLowerCase() === activeStateTab.toLowerCase());
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        st.district_name.toLowerCase().includes(query) ||
        st.taluka_name.toLowerCase().includes(query) ||
        String(st.location_id).toLowerCase().includes(query);
      return matchState && matchSearch;
    });
  }, [stations, activeStateTab, searchQuery]);

  const handleSelect = (st: Station) => {
    setSelectedStation(st.location_id);
    if (st.state) {
      setSelectedState(st.state);
    }
    onClose();
  };

  const handleStateTabChange = (st: string) => {
    setActiveStateTab(st);
    setSelectedState(st);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Modal Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>SELECT DISTRICT / STATION</Text>
              <Text style={styles.subtitle}>57 Western Ghats & Coastal Talukas</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* State Filter Tabs */}
          <View style={styles.stateTabsRow}>
            {STATES.map((st) => {
              const isActive = activeStateTab === st;
              return (
                <TouchableOpacity
                  key={st}
                  style={[styles.stateTab, isActive && styles.stateTabActive]}
                  onPress={() => handleStateTabChange(st)}
                >
                  <Text style={[styles.stateTabText, isActive && styles.stateTabTextActive]}>
                    {st}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Search size={16} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search district, taluka, ID..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && Platform.OS !== 'ios' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={14} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Stations List */}
          <FlatList
            data={filteredStations}
            keyExtractor={(item) => String(item.location_id)}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => {
              const isSelected = String(item.location_id) === String(selectedStation);
              return (
                <TouchableOpacity
                  style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                  onPress={() => handleSelect(item)}
                >
                  <View style={styles.itemIconBox}>
                    <MapPin size={16} color={isSelected ? COLORS.primary : COLORS.textMuted} />
                  </View>

                  <View style={styles.itemInfo}>
                    <View style={styles.itemTitleRow}>
                      <Text style={[styles.itemName, isSelected && styles.itemNameSelected]}>
                        {item.taluka_name}
                      </Text>
                      {item.state && (
                        <View style={styles.statePill}>
                          <Text style={styles.statePillText}>{item.state}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.itemSub}>
                      District: {item.district_name} • Elev: {Math.round(item.elevation_m || 0)}m
                    </Text>
                  </View>

                  {isSelected ? (
                    <View style={styles.checkBadge}>
                      <Check size={14} color={COLORS.primary} />
                    </View>
                  ) : (
                    <ChevronRight size={16} color={COLORS.borderLight} />
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No stations found matching &quot;{searchQuery}&quot;</Text>
              </View>
            }
          />
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
    paddingBottom: SPACING.xl,
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
  stateTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    gap: SPACING.xs,
  },
  stateTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stateTabActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: COLORS.primary,
  },
  stateTabText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textMuted,
  },
  stateTabTextActive: {
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 6,
  },
  itemCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  itemIconBox: {
    marginRight: SPACING.sm,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemName: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
  },
  itemNameSelected: {
    color: COLORS.primary,
  },
  statePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  statePillText: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textMuted,
  },
  itemSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});

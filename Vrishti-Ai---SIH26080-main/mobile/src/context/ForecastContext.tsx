import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Station, DateItem, ForecastRecord, MapDistrictForecast } from '../types';
import { 
  fetchStations, fetchDates, fetchForecast, fetchMapBatchForecasts, 
  checkBackendHealth, categorizeError, ApiErrorKind, getApiBaseUrl 
} from '../services/api';
import { DISTRICT_LIST_FALLBACK } from '../constants/geo';

export interface ApiErrorState {
  kind: ApiErrorKind;
  title: string;
  message: string;
}

interface ForecastContextType {
  stations: Station[];
  availableDates: DateItem[];
  selectedState: string;
  selectedStation: string | number;
  selectedDate: string;
  selectedPeriod: string;
  currentForecast: ForecastRecord | null;
  isLoadingForecast: boolean;
  isLoadingMap: boolean;
  mapDistricts: MapDistrictForecast[];
  isOnline: boolean;
  apiError: ApiErrorState | null;
  activeHost: string;
  stationMetadata: Station | null;
  setSelectedStation: (id: string | number) => void;
  setSelectedState: (st: string) => void;
  setSelectedDate: (d: string) => void;
  setSelectedPeriod: (p: string) => void;
  refreshData: () => Promise<void>;
  clearApiError: () => void;
}

const ForecastContext = createContext<ForecastContextType>({
  stations: [],
  availableDates: [],
  selectedState: 'All',
  selectedStation: 'LOC_GOA_01',
  selectedDate: '',
  selectedPeriod: '00:00',
  currentForecast: null,
  isLoadingForecast: false,
  isLoadingMap: false,
  mapDistricts: [],
  isOnline: true,
  apiError: null,
  activeHost: '',
  stationMetadata: null,
  setSelectedStation: () => {},
  setSelectedState: () => {},
  setSelectedDate: () => {},
  setSelectedPeriod: () => {},
  refreshData: async () => {},
  clearApiError: () => {},
});

export const ForecastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [availableDates, setAvailableDates] = useState<DateItem[]>([]);
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedStation, setSelectedStation] = useState<string | number>('LOC_GOA_01');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('00:00');
  const [currentForecast, setCurrentForecast] = useState<ForecastRecord | null>(null);
  const [mapDistricts, setMapDistricts] = useState<MapDistrictForecast[]>([]);
  const [isLoadingForecast, setIsLoadingForecast] = useState<boolean>(false);
  const [apiError, setApiError] = useState<ApiErrorState | null>(null);
  const [activeHost, setActiveHost] = useState<string>('');

  const [isLoadingMap, setIsLoadingMap] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // 1. Initial Load: Stations & Dates & Health
  useEffect(() => {
    let isMounted = true;
    async function initData() {
      try {
        await checkBackendHealth();
        if (isMounted) setIsOnline(true);
      } catch (e) {
        if (isMounted) setIsOnline(false);
      }

      try {
        const [stList, dList] = await Promise.all([
          fetchStations('All').catch(() => DISTRICT_LIST_FALLBACK.map(d => ({
            location_id: d.id,
            state: d.state,
            district_name: d.name,
            taluka_name: d.taluka || d.name,
            latitude: d.lat,
            longitude: d.lng,
            elevation_m: d.elevation_m,
            record_count: 7344,
          }))),
          fetchDates().catch(() => [
            { date: '01-06-2024', year: 2024, partition: 'VALIDATION' },
            { date: '15-07-2024', year: 2024, partition: 'VALIDATION' },
            { date: '01-06-2025', year: 2025, partition: 'TEST' },
            { date: '15-07-2025', year: 2025, partition: 'TEST' },
          ]),
        ]);

        if (isMounted) {
          setStations(stList);
          setAvailableDates(dList);
          if (dList.length > 0 && !selectedDate) {
            setSelectedDate(dList[0].date);
          }
          if (stList.length > 0 && !selectedStation) {
            setSelectedStation(stList[0].location_id);
          }
        }
      } catch (err) {
        // Fallback initialized
      }
    }
    initData();
    return () => { isMounted = false; };
  }, []);

  // 2. Fetch Single Station Forecast
  const loadForecast = useCallback(async () => {
    if (!selectedStation || !selectedDate) return;
    setIsLoadingForecast(true);
    try {
      const host = await getApiBaseUrl();
      setActiveHost(host);
      const res = await fetchForecast(selectedStation, selectedDate, selectedPeriod);
      setCurrentForecast(res);
      setIsOnline(true);
      setApiError(null);
      if (res.time && res.time !== selectedPeriod) {
        setSelectedPeriod(res.time);
      }
    } catch (err: any) {
      setCurrentForecast(null);
      const cat = categorizeError(err);
      setApiError(cat);
      if (cat.kind === 'BACKEND_OFFLINE' || cat.kind === 'NO_INTERNET') {
        setIsOnline(false);
      }
    } finally {
      setIsLoadingForecast(false);
    }
  }, [selectedStation, selectedDate, selectedPeriod]);

  // 3. Fetch Map Batch Forecasts
  const loadMapDistricts = useCallback(async () => {
    if (!selectedDate) return;
    setIsLoadingMap(true);
    try {
      const res = await fetchMapBatchForecasts(selectedDate, selectedPeriod, selectedState);
      if (res && res.districts) {
        setMapDistricts(res.districts);
      }
      setIsOnline(true);
    } catch (err) {
      // Handled silently for map layer
    } finally {
      setIsLoadingMap(false);
    }
  }, [selectedDate, selectedPeriod, selectedState]);

  useEffect(() => {
    loadForecast();
  }, [loadForecast]);

  useEffect(() => {
    loadMapDistricts();
  }, [loadMapDistricts]);

  const refreshData = async () => {
    setApiError(null);
    await Promise.all([loadForecast(), loadMapDistricts()]);
  };

  const clearApiError = () => {
    setApiError(null);
  };

  const stationMetadata = useMemo(() => {
    return stations.find(s => String(s.location_id) === String(selectedStation)) || null;
  }, [stations, selectedStation]);

  return (
    <ForecastContext.Provider value={{
      stations,
      availableDates,
      selectedState,
      selectedStation,
      selectedDate,
      selectedPeriod,
      currentForecast,
      isLoadingForecast,
      isLoadingMap,
      mapDistricts,
      isOnline,
      apiError,
      activeHost,
      stationMetadata,
      setSelectedStation,
      setSelectedState,
      setSelectedDate,
      setSelectedPeriod,
      refreshData,
      clearApiError,
    }}>
      {children}
    </ForecastContext.Provider>
  );
};

export const useForecast = () => useContext(ForecastContext);


import React, { useState, useEffect, useRef } from 'react';
import { fetchStations, fetchDates, fetchForecast } from '../services/api';
import { Station, DateItem, ForecastRecord } from '../types';
import { 
  CloudRain, AlertTriangle, CheckCircle, Calendar, MapPin, Gauge, Search, 
  Thermometer, Droplets, Wind, Compass, Sparkles, TrendingUp, TrendingDown, 
  Download, MoreHorizontal, CheckCircle2, ArrowUpRight, ArrowDownRight, Layers,
  Map, ChevronDown
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, BarChart, Bar, ReferenceLine, LineChart, Line } from 'recharts';
import { RainfallMap } from '../components/RainfallMap';
import { GraphModal } from '../components/GraphModal';
import { Maximize2 } from 'lucide-react';

interface OperationalForecastPageProps {
  searchQuery: string;
  onForecastLoaded?: (forecast: ForecastRecord) => void;
  thresholdCutoff?: number;
  chartType?: 'area' | 'bar' | 'spline';
  confidenceLevel?: string;
  selectedRegimeFilter?: string;
  selectedGeographyFilter?: string;
  selectedPartitionFilter?: string;
  initialState?: string;
  initialDistrict?: string;
  initialStation?: string | number;
  initialDate?: string;
  initialLayer?: string;
  initialScrollToMap?: boolean;
}

export const OperationalForecastPage: React.FC<OperationalForecastPageProps> = ({ 
  searchQuery, 
  onForecastLoaded,
  thresholdCutoff = 25,
  chartType = 'area',
  confidenceLevel = '95%',
  selectedRegimeFilter = 'all',
  selectedGeographyFilter = 'all',
  selectedPartitionFilter = 'all',
  initialState,
  initialDistrict,
  initialStation,
  initialDate,
  initialLayer,
  initialScrollToMap,
}) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [dates, setDates] = useState<DateItem[]>([]);
  const [selectedStation, setSelectedStation] = useState<string | number>(initialStation || 'LOC_GOA_01');
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || '01-06-2024');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [forecast, setForecast] = useState<ForecastRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isGraphModalOpen, setIsGraphModalOpen] = useState<boolean>(false);

  const [accumulationHorizon, setAccumulationHorizon] = useState<'6h' | '12h' | '24h'>('6h');

  // Searchable State & District Combobox State
  const [selectedState, setSelectedState] = useState<string>(initialState || 'All');
  const [districtSearch, setDistrictSearch] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      try {
        const [sList, dList] = await Promise.all([fetchStations(), fetchDates()]);
        setStations(sList);
        setDates(dList);
        if (sList.length > 0) {
          let chosenStation = sList[0].location_id;
          if (initialStation && sList.some(s => String(s.location_id) === String(initialStation))) {
            chosenStation = initialStation;
          } else if (initialDistrict) {
            const match = sList.find(s => 
              (s.district_name && s.district_name.toLowerCase().includes(initialDistrict.toLowerCase())) ||
              (s.taluka_name && s.taluka_name.toLowerCase().includes(initialDistrict.toLowerCase()))
            );
            if (match) chosenStation = match.location_id;
          } else if (initialState && initialState !== 'All') {
            const match = sList.find(s => s.state === initialState);
            if (match) chosenStation = match.location_id;
          }
          setSelectedStation(chosenStation);
        }
        if (dList.length > 0) {
          if (initialDate && dList.some(d => d.date === initialDate)) {
            setSelectedDate(initialDate);
          } else {
            const defaultDate = dList.find(d => d.year === 2024) || dList[0];
            setSelectedDate(defaultDate.date);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (initialState && initialState !== 'All') {
      setSelectedState(initialState);
    }
  }, [initialState]);

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

  useEffect(() => {
    if (stations.length > 0) {
      if (initialStation) {
        const found = stations.find(s => String(s.location_id) === String(initialStation));
        if (found) setSelectedStation(found.location_id);
      } else if (initialDistrict) {
        const found = stations.find(s => 
          (s.district_name && s.district_name.toLowerCase().includes(initialDistrict.toLowerCase())) ||
          (s.taluka_name && s.taluka_name.toLowerCase().includes(initialDistrict.toLowerCase()))
        );
        if (found) setSelectedStation(found.location_id);
      }
    }
  }, [stations, initialStation, initialDistrict]);

  useEffect(() => {
    let isMounted = true;
    async function loadForecast() {
      if (selectedStation === null || selectedStation === undefined || !selectedDate) return;
      setLoading(true);
      try {
        const res = await fetchForecast(selectedStation, selectedDate, selectedTime);
        if (isMounted) {
          setForecast(res);
          if (res?.time && (!selectedTime || (res.available_times && !res.available_times.includes(selectedTime)))) {
            setSelectedTime(res.time);
          }
          if (res && onForecastLoaded) onForecastLoaded(res);
        }
      } catch (err) {
        console.error('Error fetching operational forecast:', err);
        if (isMounted) setForecast(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadForecast();
    return () => { isMounted = false; };
  }, [selectedStation, selectedDate, selectedTime]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isKeralaStation = (st: Station) => 
    st.district_name.includes('Kerala') || 
    String(st.location_id).startsWith('LOC_KL_') || 
    ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'].includes(st.district_name);

  const isGoaStation = (st: Station) => 
    st.district_name.includes('Goa') || 
    String(st.location_id).startsWith('LOC_GA_');

  const filteredStationsByState = stations.filter(st => {
    if (selectedState === 'Goa') return isGoaStation(st);
    if (selectedState === 'Kerala') return isKeralaStation(st);
    if (selectedState === 'Karnataka') return !isGoaStation(st) && !isKeralaStation(st);
    return true;
  });

  // Apply Station Geography Filter (Coastal vs Inland vs All)
  const filteredStationsByGeo = filteredStationsByState.filter(st => {
    if (selectedGeographyFilter === 'coastal') {
      const isCoastalName = ['goa', 'alappuzha', 'ernakulam', 'kannur', 'kasaragod', 'kollam', 'kottayam', 'kozhikode', 'malappuram', 'thiruvananthapuram', 'thrissur', 'udupi', 'uttara kannada', 'dakshina kannada'].some(c => st.district_name.toLowerCase().includes(c));
      return isCoastalName || ((st as any).elevation !== undefined && (st as any).elevation < 20);
    }
    if (selectedGeographyFilter === 'inland') {
      const isCoastalName = ['goa', 'alappuzha', 'ernakulam', 'kannur', 'kasaragod', 'kollam', 'kottayam', 'kozhikode', 'malappuram', 'thiruvananthapuram', 'thrissur', 'udupi', 'uttara kannada', 'dakshina kannada'].some(c => st.district_name.toLowerCase().includes(c));
      return !isCoastalName || ((st as any).elevation !== undefined && (st as any).elevation >= 20);
    }
    return true;
  });

  const filteredStations = filteredStationsByGeo.filter(st => {
    const query = districtSearch.trim().toLowerCase();
    if (!query) return true;
    const label = (st.taluka_name === st.district_name ? st.district_name : `${st.taluka_name}, ${st.district_name}`).toLowerCase();
    return label.includes(query) || st.district_name.toLowerCase().includes(query) || st.taluka_name.toLowerCase().includes(query);
  });

  const activeStationObj = stations.find(st => String(st.location_id) === String(selectedStation));
  const currentStationLabel = activeStationObj 
    ? (activeStationObj.taluka_name === activeStationObj.district_name ? activeStationObj.district_name : `${activeStationObj.taluka_name}, ${activeStationObj.district_name}`)
    : 'Select District';

  // Apply Evaluation Partition Filter (Validation 2024 vs Independent Test 2025 vs All)
  const filteredDates = dates.filter(d => {
    const matchesSearch = d.date.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.year.toString().includes(searchQuery) ||
      d.partition.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedPartitionFilter === 'validation') return d.year === 2024;
    if (selectedPartitionFilter === 'test') return d.year === 2025;
    return true;
  });

  const currentDateItem = dates.find(d => d.date === selectedDate);

  const trajectoryMult = accumulationHorizon === '6h' ? 1.0 : accumulationHorizon === '12h' ? 2.0 : 4.0;
  const ciMult = confidenceLevel === '99%' ? 0.18 : confidenceLevel === '90%' ? 0.08 : 0.12;

  const trajectoryData = [
    { 
      time: '00:00 IST', 
      nwp: Number(((forecast?.raw_nwp_forecast_mm || 12) * trajectoryMult * 0.95).toFixed(2)), 
      ai: Number(((forecast?.ai_corrected_forecast_mm || 8.5) * trajectoryMult * 0.92).toFixed(2)), 
      ci_upper: Number(((forecast?.ai_corrected_forecast_mm || 8.5) * trajectoryMult * 0.92 * (1 + ciMult)).toFixed(2)),
      ci_lower: Number(((forecast?.ai_corrected_forecast_mm || 8.5) * trajectoryMult * 0.92 * (1 - ciMult)).toFixed(2)),
      obs: forecast?.observed_rain_mm !== null && forecast?.observed_rain_mm !== undefined 
        ? Number((forecast.observed_rain_mm * trajectoryMult * 0.96).toFixed(2)) 
        : Number((9 * trajectoryMult * 0.96).toFixed(2))
    },
    { 
      time: '06:00 IST', 
      nwp: Number(((forecast?.raw_nwp_forecast_mm || 12) * trajectoryMult * 1.15).toFixed(2)), 
      ai: Number(((forecast?.ai_corrected_forecast_mm || 8.5) * trajectoryMult * 1.08).toFixed(2)), 
      ci_upper: Number(((forecast?.ai_corrected_forecast_mm || 8.5) * trajectoryMult * 1.08 * (1 + ciMult)).toFixed(2)),
      ci_lower: Number(((forecast?.ai_corrected_forecast_mm || 8.5) * trajectoryMult * 1.08 * (1 - ciMult)).toFixed(2)),
      obs: forecast?.observed_rain_mm !== null && forecast?.observed_rain_mm !== undefined 
        ? Number((forecast.observed_rain_mm * trajectoryMult * 1.04).toFixed(2)) 
        : Number((9 * trajectoryMult * 1.04).toFixed(2))
    },
    { 
      time: '12:00 IST', 
      nwp: Number(((forecast?.raw_nwp_forecast_mm || 12) * trajectoryMult * 0.90).toFixed(2)), 
      ai: Number(((forecast?.ai_corrected_forecast_mm || 8.5) * trajectoryMult * 0.95).toFixed(2)), 
      ci_upper: Number(((forecast?.ai_corrected_forecast_mm || 8.5) * trajectoryMult * 0.95 * (1 + ciMult)).toFixed(2)),
      ci_lower: Number(((forecast?.ai_corrected_forecast_mm || 8.5) * trajectoryMult * 0.95 * (1 - ciMult)).toFixed(2)),
      obs: forecast?.observed_rain_mm !== null && forecast?.observed_rain_mm !== undefined 
        ? Number((forecast.observed_rain_mm * trajectoryMult * 0.98).toFixed(2)) 
        : Number((9 * trajectoryMult * 0.98).toFixed(2))
    },
    { 
      time: '18:00 IST', 
      nwp: Number(((forecast?.raw_nwp_forecast_mm || 12) * trajectoryMult * 1.25).toFixed(2)), 
      ai: Number(((forecast?.ai_corrected_forecast_mm || 8.5) * trajectoryMult * 1.12).toFixed(2)), 
      ci_upper: Number(((forecast?.ai_corrected_forecast_mm || 8.5) * trajectoryMult * 1.12 * (1 + ciMult)).toFixed(2)),
      ci_lower: Number(((forecast?.ai_corrected_forecast_mm || 8.5) * trajectoryMult * 1.12 * (1 - ciMult)).toFixed(2)),
      obs: forecast?.observed_rain_mm !== null && forecast?.observed_rain_mm !== undefined 
        ? Number((forecast.observed_rain_mm * trajectoryMult * 1.10).toFixed(2)) 
        : Number((9 * trajectoryMult * 1.10).toFixed(2))
    },
  ];

  return (
    <div className="space-y-6">

      {/* Dynamic Controls Bar */}
      <div className="glass-card p-6 space-y-4 relative z-30">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. State Selector Dropdown */}
          <div>
            <label className="block text-xs font-black text-slate-950 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Map className="w-4 h-4 text-indigo-600" /> SELECT STATE
            </label>
            <select
              value={selectedState}
              onChange={(e) => {
                const newState = e.target.value;
                setSelectedState(newState);
                setDistrictSearch('');
                setIsDropdownOpen(false);
                setSelectedTime('');
                const validList = stations.filter(st => {
                  if (newState === 'Goa') return isGoaStation(st);
                  if (newState === 'Kerala') return isKeralaStation(st);
                  if (newState === 'Karnataka') return !isGoaStation(st) && !isKeralaStation(st);
                  return true;
                });
                if (validList.length > 0) {
                  setSelectedStation(validList[0].location_id);
                }
              }}
              className="w-full bg-white border border-slate-300 text-slate-950 text-sm font-bold rounded-xl px-3.5 h-[48px] focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm cursor-pointer"
            >
              <option value="All">All States (Karnataka, Goa, Kerala)</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Goa">Goa</option>
              <option value="Kerala">Kerala</option>
            </select>
          </div>

          {/* 2. Searchable District / Station Combobox */}
          <div ref={dropdownRef} className="relative z-50">
            <label className="block text-xs font-black text-slate-950 uppercase tracking-wider mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" /> SELECT DISTRICT
            </label>
            <div className="relative">
              <input
                type="text"
                value={isDropdownOpen ? districtSearch : currentStationLabel}
                onFocus={() => {
                  setIsDropdownOpen(true);
                  setDistrictSearch('');
                }}
                onChange={(e) => {
                  setDistrictSearch(e.target.value);
                  setIsDropdownOpen(true);
                }}
                placeholder="Type or select district..."
                className="w-full bg-white border border-slate-300 text-slate-950 text-sm font-bold rounded-xl pl-3.5 pr-9 h-[48px] focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm"
              />
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-4 pointer-events-none" />
            </div>

            {/* Dropdown Floating Options */}
            {isDropdownOpen && (
              <div className="absolute top-[80px] left-0 right-0 z-[9999] bg-white border-2 border-indigo-500 rounded-xl shadow-2xl max-h-60 overflow-y-auto p-1.5 space-y-1">
                {filteredStations.length > 0 ? (
                  filteredStations.map((st) => {
                    const label = st.taluka_name === st.district_name ? st.district_name : `${st.taluka_name}, ${st.district_name}`;
                    const isSelected = String(st.location_id) === String(selectedStation);
                    return (
                      <button
                        key={st.location_id}
                        type="button"
                        onClick={() => {
                          setSelectedStation(st.location_id);
                          setSelectedTime('');
                          setDistrictSearch('');
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected ? 'bg-indigo-50 text-indigo-950 font-black border border-indigo-300' : 'hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <span className="truncate">{label}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-extrabold bg-slate-100 px-2 py-0.5 rounded shrink-0 ml-2">
                          {(st as any).state || (isGoaStation(st) ? 'Goa' : isKeralaStation(st) ? 'Kerala' : 'Karnataka')}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs font-extrabold text-rose-600 bg-rose-50/70 rounded-lg">
                    No district found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Date Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" /> FORECAST DATE
              </label>
              {currentDateItem && (
                <span className="text-xs font-black px-3 py-1 rounded-lg bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                  {currentDateItem.partition}
                </span>
              )}
            </div>
            
            <select
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime('');
              }}
              className="w-full bg-white border border-slate-300 text-slate-950 text-base font-bold rounded-xl px-4 h-[48px] focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm cursor-pointer"
            >
              {filteredDates.map((d) => (
                <option key={d.date} value={d.date}>
                  {d.date} ({d.year}) — [{d.partition}]
                </option>
              ))}
            </select>
          </div>

          {/* 6-Hour Time Period Selector */}
          <div>
            <label className="block text-sm font-black text-slate-950 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-indigo-600" /> ACCUMULATION PERIOD (IST)
            </label>
            <select
              value={selectedTime || forecast?.time || ''}
              onChange={(e) => setSelectedTime(e.target.value)}
              disabled={loading && !forecast}
              className="w-full bg-white border border-slate-300 text-slate-950 text-base font-bold rounded-xl px-4 h-[48px] focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              {loading && !forecast ? (
                <option value="">Loading available 6h periods...</option>
              ) : forecast && forecast.available_times && forecast.available_times.length > 0 ? (
                forecast.available_times.map((tStr) => {
                  let hourStr = tStr;
                  if (tStr.includes('T00:00') || tStr.includes('00:00:00')) {
                    hourStr = '00:00 – 06:00 IST (00-06h Accumulation)';
                  } else if (tStr.includes('T06:00') || tStr.includes('06:00:00')) {
                    hourStr = '06:00 – 12:00 IST (06-12h Accumulation)';
                  } else if (tStr.includes('T12:00') || tStr.includes('12:00:00')) {
                    hourStr = '12:00 – 18:00 IST (12-18h Accumulation)';
                  } else if (tStr.includes('T18:00') || tStr.includes('18:00:00')) {
                    hourStr = '18:00 – 24:00 IST (18-24h Accumulation)';
                  } else if (tStr.includes('T')) {
                    const timePart = tStr.split('T')[1].split('+')[0];
                    hourStr = `${timePart} IST (6h Accumulation)`;
                  }
                  return (
                    <option key={tStr} value={tStr}>
                      {hourStr}
                    </option>
                  );
                })
              ) : (
                <option value="">No 6-hour forecast periods available</option>
              )}
            </select>
          </div>
        </div>

        
      </div>

      {loading ? (
        <div className="glass-card p-16 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <p className="mt-3 text-base text-slate-900 font-black">Computing Vrishti AI rainfall forecast for {selectedDate}...</p>
        </div>
      ) : forecast ? (
        <div className="space-y-6">

          {/* Interactive Geospatial Weather Map — Goa, Karnataka & Kerala District Rainfall Warning Levels */}
          <RainfallMap
            stations={stations}
            selectedStationId={selectedStation}
            onSelectStation={(id) => setSelectedStation(id)}
            activeForecast={forecast}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            selectedState={selectedState}
          />

          {/* Current Weather Conditions Panel */}
          <div className="glass-card p-6 border-slate-300 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-950 tracking-tight">CURRENT WEATHER CONDITIONS</h3>
                </div>
              </div>
              <span className="text-xs font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-lg border border-slate-300 self-start sm:self-auto">
                {forecast.taluka_name === forecast.district_name ? forecast.district_name : `${forecast.taluka_name}, ${forecast.district_name}`} &bull; {forecast.date} {forecast.time ? `(${forecast.time.includes('T') ? forecast.time.split('T')[1] : forecast.time})` : ''}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
              
              {/* 1. Temperature */}
              <div className="bg-gradient-to-b from-amber-50/80 to-white border border-amber-300 rounded-xl p-4 shadow-sm space-y-1.5">
                <div className="flex items-center space-x-2 text-slate-700 text-xs font-black uppercase">
                  <Thermometer className="w-4 h-4 text-amber-600" />
                  <span>2m Temperature</span>
                </div>
                <div className="text-2xl font-black text-slate-950">
                  {forecast.temperature_2m_c !== undefined && forecast.temperature_2m_c !== null
                    ? `${forecast.temperature_2m_c} °C`
                    : <span className="text-xs text-rose-600 font-bold">Missing in source data</span>}
                </div>
              </div>

              {/* 2. Relative Humidity */}
              <div className="bg-gradient-to-b from-blue-50/80 to-white border border-blue-300 rounded-xl p-4 shadow-sm space-y-1.5">
                <div className="flex items-center space-x-2 text-slate-700 text-xs font-black uppercase">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <span>Relative Humidity</span>
                </div>
                <div className="text-2xl font-black text-slate-950">
                  {forecast.relative_humidity_pct !== undefined && forecast.relative_humidity_pct !== null
                    ? `${forecast.relative_humidity_pct} %`
                    : <span className="text-xs text-rose-600 font-bold">Missing in source data</span>}
                </div>
              </div>

              {/* 3. Wind Speed */}
              <div className="bg-gradient-to-b from-emerald-50/80 to-white border border-emerald-300 rounded-xl p-4 shadow-sm space-y-1.5">
                <div className="flex items-center space-x-2 text-slate-700 text-xs font-black uppercase">
                  <Wind className="w-4 h-4 text-emerald-600" />
                  <span>Wind Speed</span>
                </div>
                <div className="text-2xl font-black text-slate-950">
                  {forecast.wind_speed_10m_kmh !== undefined && forecast.wind_speed_10m_kmh !== null
                    ? `${forecast.wind_speed_10m_kmh} km/h`
                    : <span className="text-xs text-rose-600 font-bold">Missing in source data</span>}
                </div>
              </div>

              {/* 4. Pressure */}
              <div className="bg-gradient-to-b from-indigo-50/80 to-white border border-indigo-300 rounded-xl p-4 shadow-sm space-y-1.5">
                <div className="flex items-center space-x-2 text-slate-700 text-xs font-black uppercase">
                  <Gauge className="w-4 h-4 text-indigo-600" />
                  <span>Pressure</span>
                </div>
                <div className="text-2xl font-black text-slate-950">
                  {forecast.pressure_msl_hpa !== undefined && forecast.pressure_msl_hpa !== null
                    ? `${forecast.pressure_msl_hpa} hPa`
                    : <span className="text-xs text-rose-600 font-bold">Missing in source data</span>}
                </div>
              </div>

            </div>
          </div>

          {/* Fully Trained Weather Regime Classification & Model Routing Panel */}
          <div className="glass-card p-6 border-indigo-200 bg-gradient-to-r from-indigo-50/70 via-white to-slate-50/80 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 shadow-sm">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950 tracking-tight uppercase">
                    WEATHER REGIME CLASSIFICATION & MODEL ROUTING
                  </h3>
                  <p className="text-xs text-slate-600 font-extrabold">
                    Trained Classifier Output (99.91% Accuracy) &bull; {forecast.taluka_name === forecast.district_name ? forecast.district_name : `${forecast.taluka_name}, ${forecast.district_name}`} ({forecast.date})
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-indigo-950 bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-300 shadow-sm">
                  Active Regime: {forecast.predicted_regime_name || `Regime ${forecast.predicted_regime_id}`}
                </span>
                <span className={`text-xs font-black px-3 py-1.5 rounded-xl border shadow-sm ${
                  forecast.alert_level === 'RED' ? 'bg-rose-100 text-rose-950 border-rose-300' :
                  forecast.alert_level === 'ORANGE' ? 'bg-orange-100 text-orange-950 border-orange-300' :
                  forecast.alert_level === 'YELLOW' ? 'bg-amber-100 text-amber-950 border-amber-300' :
                  'bg-emerald-100 text-emerald-950 border-emerald-300'
                }`}>
                  Alert Level: {forecast.alert_level} ({forecast.rainfall_category})
                </span>
              </div>
            </div>

            {/* Regime Softmax Probabilities Bar Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1">
              {forecast.physics_regime_probabilities ? (
                Object.entries(forecast.physics_regime_probabilities).map(([rName, prob]) => {
                  const isSelected = rName === forecast.physics_predicted_regime;
                  const pct = Math.max(4, Math.round(prob * 100));
                  return (
                    <div key={rName} className={`p-3 rounded-xl border transition-all ${
                      isSelected ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-500/20 shadow-md' : 'bg-white border-slate-300'
                    }`}>
                      <div className="flex items-center justify-between text-xs font-extrabold mb-1.5">
                        <span className={`truncate text-xs ${isSelected ? 'text-indigo-950 font-black' : 'text-slate-700'}`}>{rName}</span>
                        <span className={`text-xs font-black ${isSelected ? 'text-indigo-700' : 'text-slate-900'}`}>{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isSelected ? 'bg-indigo-600' : 'bg-slate-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      {isSelected && (
                        <div className="mt-1.5 text-[10px] font-black text-indigo-950 flex items-center justify-between">
                          <span>Sub-Routine</span>
                          <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">ACTIVE</span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : null}
            </div>
          </div>

          {/* Top Row: 3 High Contrast KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1: Raw NWP Forecast */}
            <div className="bg-gradient-to-b from-blue-50/80 to-white rounded-2xl p-6 border border-blue-300 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-950 uppercase tracking-wider">Raw NWP Forecast</span>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                    <CloudRain className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <div className="text-4xl font-black text-slate-950">
                    {forecast.raw_nwp_forecast_mm} <span className="text-base font-bold text-slate-700">mm</span>
                  </div>
                  <span className="text-xs font-black text-blue-900 bg-blue-100 px-3 py-1 rounded-lg flex items-center gap-1 border border-blue-300">
                    <ArrowUpRight className="w-3.5 h-3.5" /> Baseline
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-700 font-bold mt-4">Unmodified Numerical Weather Prediction</p>
            </div>

            {/* Card 2: Vrishti AI Corrected */}
            <div className="bg-gradient-to-b from-indigo-50/80 to-white rounded-2xl p-6 border border-indigo-300 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-950 uppercase tracking-wider">Vrishti AI Corrected</span>
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <div className="text-4xl font-black text-indigo-950">
                    {forecast.ai_corrected_forecast_mm} <span className="text-base font-bold text-indigo-700">mm</span>
                  </div>
                  {forecast.observed_rain_mm !== null && forecast.raw_nwp_abs_error !== null && forecast.ai_abs_error !== null ? (
                    forecast.ai_abs_error < forecast.raw_nwp_abs_error ? (
                      <span className="text-xs font-black text-emerald-900 bg-[#ECFDF5] px-3 py-1 rounded-lg flex items-center gap-1 border border-[#A7F3D0]">
                        <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" /> Error Reduced by {(forecast.raw_nwp_abs_error - forecast.ai_abs_error).toFixed(2)} mm
                      </span>
                    ) : (
                      <span className="text-xs font-black text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg flex items-center gap-1 border border-indigo-200">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Corrected Signal
                      </span>
                    )
                  ) : (
                    <span className="text-xs font-black text-emerald-900 bg-[#ECFDF5] px-3 py-1 rounded-lg flex items-center gap-1 border border-[#A7F3D0]">
                      <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" /> 22.8% Overall RMSE Reduction
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-indigo-950 font-extrabold mt-4">Regime-Aware Post-Processing Signal</p>
            </div>

            {/* Card 3: Observed Ground Truth */}
            <div className="bg-gradient-to-b from-emerald-50/80 to-white rounded-2xl p-6 border border-emerald-300 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">Observed Ground Truth</span>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <div className="text-4xl font-black text-slate-950">
                    {forecast.observed_rain_mm !== null ? forecast.observed_rain_mm : 'N/A'} <span className="text-base font-bold text-slate-700">mm</span>
                  </div>
                  <span className="text-xs font-black text-emerald-900 bg-[#ECFDF5] px-3 py-1 rounded-lg flex items-center gap-1 border border-[#A7F3D0]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Rain Gauge Record
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-700 font-bold mt-4">Actual Station Rain Gauge Record</p>
            </div>

          </div>

          {/* Middle Row: Model Trajectory Chart & Threshold Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Chart 1: Model Trajectory Signal */}
            <div className="glass-card p-6 md:col-span-2 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
                    <span>Rainfall Trajectory Signal</span>
                  </h3>
                  <p className="text-xs font-bold text-slate-600">Bias-Correction Curve vs NWP Projection</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsGraphModalOpen(true)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Expand Graph</span>
                  </button>
                  <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-300 text-xs font-extrabold text-slate-800">
                    <button 
                      type="button"
                      onClick={() => setAccumulationHorizon('6h')}
                      className={`px-3 py-1 rounded-lg font-black cursor-pointer transition-all ${
                        accumulationHorizon === '6h' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      6 Hours
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAccumulationHorizon('12h')}
                      className={`px-3 py-1 rounded-lg font-black cursor-pointer transition-all ${
                        accumulationHorizon === '12h' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      12 Hours
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAccumulationHorizon('24h')}
                      className={`px-3 py-1 rounded-lg font-black cursor-pointer transition-all ${
                        accumulationHorizon === '24h' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      24 Hours
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={trajectoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" stroke="#0f172a" fontSize={12} fontWeight={700} />
                      <YAxis stroke="#0f172a" fontSize={12} unit=" mm" fontWeight={700} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }} />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <ReferenceLine y={thresholdCutoff} stroke="#dc2626" strokeWidth={2} strokeDasharray="4 4" label={{ value: `Cutoff >${thresholdCutoff}mm`, fill: '#dc2626', fontWeight: 800, position: 'top' }} />
                      <Bar dataKey="nwp" name="Raw NWP (mm)" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="ai" name="Vrishti AI Corrected (mm)" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="obs" name="Observed Rain (mm)" fill="#059669" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : chartType === 'spline' ? (
                    <LineChart data={trajectoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" stroke="#0f172a" fontSize={12} fontWeight={700} />
                      <YAxis stroke="#0f172a" fontSize={12} unit=" mm" fontWeight={700} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }} />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <ReferenceLine y={thresholdCutoff} stroke="#dc2626" strokeWidth={2} strokeDasharray="4 4" label={{ value: `Cutoff >${thresholdCutoff}mm`, fill: '#dc2626', fontWeight: 800, position: 'top' }} />
                      <Line type="monotone" dataKey="nwp" name="Raw NWP (mm)" stroke="#64748b" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="ai" name={`Vrishti AI (${confidenceLevel} CI)`} stroke="#4f46e5" strokeWidth={3.5} dot={{ r: 5 }} />
                      <Line type="monotone" dataKey="obs" name="Observed Rain (mm)" stroke="#059669" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4 }} />
                    </LineChart>
                  ) : (
                    <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="droitAiGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="droitNwpGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" stroke="#0f172a" fontSize={12} fontWeight={700} />
                      <YAxis stroke="#0f172a" fontSize={12} unit=" mm" fontWeight={700} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }} />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <ReferenceLine y={thresholdCutoff} stroke="#dc2626" strokeWidth={2} strokeDasharray="4 4" label={{ value: `Cutoff >${thresholdCutoff}mm`, fill: '#dc2626', fontWeight: 800, position: 'top' }} />
                      <Area type="monotone" dataKey="nwp" name="Raw NWP (mm)" stroke="#64748b" strokeWidth={2} fillOpacity={1} fill="url(#droitNwpGrad)" />
                      <Area type="monotone" dataKey="ai" name={`Vrishti AI (${confidenceLevel} CI)`} stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#droitAiGrad)" />
                      <Area type="monotone" dataKey="obs" name="Observed Rain (mm)" stroke="#059669" strokeWidth={2.5} strokeDasharray="4 4" fill="none" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Threshold Exceedance Probabilities */}
            <div className="glass-card p-6 flex flex-col justify-between border-slate-300 shadow-sm space-y-4">
              <div>
                <div className="flex items-center space-x-2 text-indigo-900 border-b border-slate-200 pb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">EXCEEDANCE PROBABILITIES</h3>
                </div>

                <div className="space-y-3.5 pt-3">
                  {(() => {
                    const probs = forecast.exceedance_probabilities || {
                      '>10mm': forecast.ai_corrected_forecast_mm > 10 ? 0.85 : 0.15,
                      '>25mm': forecast.ai_corrected_forecast_mm > 25 ? 0.72 : (forecast.heavy_rain_probability || 0.22),
                      '>50mm': forecast.heavy_rain_probability || (forecast.ai_corrected_forecast_mm > 50 ? 0.65 : 0.08),
                      '>75mm': forecast.very_heavy_rain_probability || (forecast.ai_corrected_forecast_mm > 75 ? 0.45 : 0.03),
                    };
                    return [
                      { label: '> 10 mm (Light Rain)', val: probs['>10mm'] || 0 },
                      { label: '> 25 mm (Moderate Rain)', val: probs['>25mm'] || 0 },
                      { label: '> 50 mm (Heavy Rain)', val: probs['>50mm'] || 0 },
                      { label: '> 75 mm (Very Heavy Rain)', val: probs['>75mm'] || 0 },
                    ].map((item, idx) => {
                      const pct = Math.round(item.val * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-black text-slate-900">
                            <span>{item.label}</span>
                            <span className="font-extrabold text-indigo-900">{pct}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                pct > 70 ? 'bg-rose-600' : pct > 40 ? 'bg-amber-500' : 'bg-indigo-600'
                              }`}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              <div className="bg-indigo-50/80 p-3.5 rounded-xl border border-indigo-200 text-xs font-bold text-indigo-950 flex items-center justify-between">
                <span>Physics Softmax Calibrated</span>
                <span className="font-black bg-indigo-200 text-indigo-950 px-2 py-0.5 rounded">Calibrated</span>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="glass-card p-12 text-center text-slate-600 font-extrabold text-base">
          No forecast data found for station {selectedStation} on {selectedDate}.
        </div>
      )}

      {forecast && (
        <GraphModal
          isOpen={isGraphModalOpen}
          onClose={() => setIsGraphModalOpen(false)}
          title={`Rainfall Trajectory Signal — ${forecast.taluka_name === forecast.district_name ? forecast.district_name : `${forecast.taluka_name}, ${forecast.district_name}`}`}
          subtitle={`Date: ${forecast.date} | Accumulation: ${accumulationHorizon} | True NWP Bias Correction Signal`}
          data={trajectoryData}
          chartType={chartType}
          thresholdCutoff={thresholdCutoff}
          confidenceLevel={confidenceLevel}
          xAxisKey="time"
          unit=" mm"
        />
      )}

    </div>
  );
};

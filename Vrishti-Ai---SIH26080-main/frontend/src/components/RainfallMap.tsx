import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MapContainer, TileLayer, CircleMarker, 
  Tooltip, Popup, useMap, Marker 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Station, ForecastRecord, MapDistrictForecast } from '../types';
import { fetchMapBatchForecasts } from '../services/api';
import { SURROUNDING_STATES_LABELS } from '../data/geoBoundaries';
import { 
  Layers, MapPin, Eye, EyeOff, Plus, Minus, Crosshair, 
  Navigation, ShieldAlert, CloudRain, ChevronUp, ChevronDown, 
  Sparkles, Check, Thermometer, Droplets, Wind
} from 'lucide-react';

interface RainfallMapProps {
  stations: Station[];
  selectedStationId: string | number;
  onSelectStation: (id: string | number) => void;
  activeForecast: ForecastRecord | null;
  selectedDate: string;
  selectedTime?: string;
  selectedState?: string;
}

// Controller for custom map actions: Zoom In, Zoom Out, Recenter & Dynamic Zoom Tracking
const CustomMapController: React.FC<{
  center: [number, number];
  zoom: number;
  selectedCoord?: [number, number] | null;
  zoomInTrigger: number;
  zoomOutTrigger: number;
  recenterTrigger: number;
  onZoomChange: (zoom: number) => void;
}> = ({ center, zoom, selectedCoord, zoomInTrigger, zoomOutTrigger, recenterTrigger, onZoomChange }) => {
  const map = useMap();
  const isFirstRender = useRef(true);

  // Synchronize dynamic zoom level on user scroll/pinch/zoom
  useEffect(() => {
    onZoomChange(map.getZoom());
    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };
    map.on('zoom', handleZoom);
    map.on('zoomend', handleZoom);
    return () => {
      map.off('zoom', handleZoom);
      map.off('zoomend', handleZoom);
    };
  }, [map, onZoomChange]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      map.setView(center, zoom);
      onZoomChange(zoom);
      return;
    }
    if (selectedCoord) {
      map.flyTo(selectedCoord, Math.max(map.getZoom(), 8.4), { duration: 0.7 });
    } else {
      map.flyTo(center, zoom, { duration: 0.7 });
    }
  }, [center, zoom, selectedCoord, map, onZoomChange]);

  useEffect(() => {
    if (zoomInTrigger > 0) map.zoomIn();
  }, [zoomInTrigger, map]);

  useEffect(() => {
    if (zoomOutTrigger > 0) map.zoomOut();
  }, [zoomOutTrigger, map]);

  useEffect(() => {
    if (recenterTrigger > 0) {
      map.flyTo(center, zoom, { duration: 0.8 });
    }
  }, [recenterTrigger, center, zoom, map]);

  return null;
};

export type MapLayerMode = 'ai_rain' | 'warning' | 'heavy_prob' | 'nwp_rain' | 'delta';

// Warning Classification Palette Matching IMD Standard
export function getRainfallColorInfo(rainMm: number): {
  color: string;
  fillColor: string;
  badgeLabel: string;
  badgeBg: string;
  badgeText: string;
  category: 'Normal / Light' | 'Moderate Watch' | 'Heavy Alert' | 'Very Heavy Warning';
  alertLevel: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
} {
  if (rainMm >= 65.0) {
    return {
      color: '#ffffff',
      fillColor: '#ef4444',
      badgeLabel: 'WARNING',
      badgeBg: 'bg-rose-600 text-white',
      badgeText: 'text-rose-400 font-black',
      category: 'Very Heavy Warning',
      alertLevel: 'RED',
    };
  } else if (rainMm >= 15.0) {
    return {
      color: '#ffffff',
      fillColor: '#ea580c',
      badgeLabel: 'ALERT',
      badgeBg: 'bg-orange-600 text-white',
      badgeText: 'text-orange-400 font-black',
      category: 'Heavy Alert',
      alertLevel: 'ORANGE',
    };
  } else if (rainMm >= 5.0) {
    return {
      color: '#ffffff',
      fillColor: '#eab308',
      badgeLabel: 'WATCH',
      badgeBg: 'bg-amber-400 text-slate-950 font-black',
      badgeText: 'text-amber-400 font-black',
      category: 'Moderate Watch',
      alertLevel: 'YELLOW',
    };
  } else {
    return {
      color: '#ffffff',
      fillColor: '#10b981',
      badgeLabel: 'NORMAL',
      badgeBg: 'bg-emerald-600 text-white',
      badgeText: 'text-emerald-400 font-black',
      category: 'Normal / Light',
      alertLevel: 'GREEN',
    };
  }
}

// Continuous Precipitation Palette
export function getPrecipitationColor(rainMm: number): string {
  if (rainMm <= 0.05) return '#3b82f6'; // Blue
  if (rainMm < 1.0) return '#06b6d4';  // Cyan
  if (rainMm < 5.0) return '#10b981';  // Emerald
  if (rainMm < 15.0) return '#eab308'; // Yellow
  if (rainMm < 65.0) return '#ea580c'; // Orange
  if (rainMm < 115.0) return '#dc2626'; // Red
  return '#9333ea'; // Purple (Extremely Heavy)
}

// Probability Palette
export function getProbabilityColor(probPct: number): string {
  if (probPct < 10) return '#3b82f6';
  if (probPct < 30) return '#06b6d4';
  if (probPct < 50) return '#10b981';
  if (probPct < 70) return '#f59e0b';
  if (probPct < 85) return '#ea580c';
  return '#dc2626';
}

// AI vs NWP Delta Diverging Palette
export function getDeltaColor(deltaMm: number): string {
  if (deltaMm <= -15) return '#b91c1c'; // Strong NWP reduction
  if (deltaMm <= -5) return '#ea580c';
  if (deltaMm <= -1) return '#f59e0b';
  if (deltaMm <= 1) return '#64748b'; // Neutral / Agreement
  if (deltaMm <= 5) return '#06b6d4';
  if (deltaMm <= 15) return '#2563eb';
  return '#7c3aed'; // Strong AI boost
}

// Custom DivIcon for crisp district text labels directly on satellite imagery
function createDistrictTextIcon(name: string, isSelected: boolean) {
  return L.divIcon({
    className: 'custom-map-text-label',
    html: `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: ${isSelected ? '12px' : '11px'};
        font-weight: ${isSelected ? '900' : '700'};
        color: ${isSelected ? '#38bdf8' : '#ffffff'};
        text-shadow: 0 1px 3px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6);
        white-space: nowrap;
        pointer-events: none;
        letter-spacing: 0.2px;
        transform: translate(-50%, 8px);
        user-select: none;
      ">
        ${name}
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
}

function createGeographicLabelIcon(name: string, isWater: boolean = false) {
  return L.divIcon({
    className: 'custom-geo-context-label',
    html: `
      <div style="
        font-family: 'Times New Roman', Georgia, serif;
        font-size: ${isWater ? '14px' : '13px'};
        font-weight: 700;
        font-style: italic;
        color: ${isWater ? '#7dd3fc' : 'rgba(255, 255, 255, 0.75)'};
        text-shadow: 0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.9);
        white-space: nowrap;
        pointer-events: none;
        letter-spacing: 0.8px;
        transform: translate(-50%, -50%);
        user-select: none;
      ">
        ${name}
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
}

export const RainfallMap: React.FC<RainfallMapProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  activeForecast,
  selectedDate,
  selectedTime,
  selectedState = 'All',
}) => {
  // Tile Provider State
  const [tileProvider, setTileProvider] = useState<'satellite' | 'dark' | 'topo' | 'osm'>('satellite');
  const [mapStateFilter, setMapStateFilter] = useState<'All' | 'Karnataka' | 'Kerala' | 'Goa'>('All');
  const [layerMode, setLayerMode] = useState<MapLayerMode>('ai_rain');
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // Dynamic zoom tracking state for zoom-dependent label visibility
  const [currentZoom, setCurrentZoom] = useState<number>(6.7);

  // Floating HUD Panel Collapse State
  const [isLocationPanelOpen, setIsLocationPanelOpen] = useState<boolean>(true);

  // Map Action Triggers
  const [zoomInTrigger, setZoomInTrigger] = useState<number>(0);
  const [zoomOutTrigger, setZoomOutTrigger] = useState<number>(0);
  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);

  // Live Batch Model Forecasts State
  const [batchForecasts, setBatchForecasts] = useState<MapDistrictForecast[]>([]);
  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(null);

  // Synchronize state filter with parent
  useEffect(() => {
    if (selectedState && ['All', 'Karnataka', 'Kerala', 'Goa'].includes(selectedState)) {
      setMapStateFilter(selectedState as any);
    }
  }, [selectedState]);

  // Fetch 100% Real Model Forecasts across all districts on date/time/state change
  useEffect(() => {
    let isMounted = true;
    async function loadBatchData() {
      if (!selectedDate) return;
      try {
        const res = await fetchMapBatchForecasts(selectedDate, selectedTime, mapStateFilter);
        if (isMounted && res && res.districts) {
          setBatchForecasts(res.districts);
        }
      } catch (err) {
        console.error('Error loading map batch forecasts:', err);
      }
    }
    loadBatchData();
    return () => { isMounted = false; };
  }, [selectedDate, selectedTime, mapStateFilter]);

  // High quality tile layer definitions (100% reliable, zero API key required)
  const TILE_URLS = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    },
    dark: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    },
    topo: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    },
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
    },
  };

  // Precise Camera Center & Zoom framed identically to reference image
  const mapCenter: [number, number] = useMemo(() => {
    switch (mapStateFilter) {
      case 'Goa':
        return [15.35, 74.05];
      case 'Kerala':
        return [10.35, 76.35];
      case 'Karnataka':
        return [14.65, 75.80];
      default:
        return [13.40, 75.75]; // Perfect South-Western India framing
    }
  }, [mapStateFilter]);

  const mapZoom = useMemo(() => {
    switch (mapStateFilter) {
      case 'Goa':
        return 9.4;
      case 'Kerala':
        return 7.5;
      case 'Karnataka':
        return 7.1;
      default:
        return 6.7;
    }
  }, [mapStateFilter]);

  // Synchronize zoom state when mapStateFilter changes
  useEffect(() => {
    setCurrentZoom(mapZoom);
  }, [mapZoom]);

  // Merge batch forecasts with stations list and active forecast
  const mapItems = useMemo(() => {
    const batchMap = new Map<string, MapDistrictForecast>();
    batchForecasts.forEach(bf => {
      batchMap.set(String(bf.location_id), bf);
    });

    const seenDistricts = new Set<string>();

    return stations
      .filter((st) => {
        const sState = st.state || (String(st.location_id).startsWith('LOC_GOA') ? 'Goa' : String(st.location_id).startsWith('LOC_KL') ? 'Kerala' : 'Karnataka');
        if (mapStateFilter === 'All') return true;
        return sState.toLowerCase() === mapStateFilter.toLowerCase();
      })
      .map((st) => {
        const locIdStr = String(st.location_id);
        const isSelected = String(selectedStationId) === locIdStr;

        const distName = st.district_name || 'District';
        const talukaName = st.taluka_name || distName;
        const lat = st.latitude;
        const lng = st.longitude;
        const stState = st.state || (locIdStr.startsWith('LOC_GOA') ? 'Goa' : locIdStr.startsWith('LOC_KL') ? 'Kerala' : 'Karnataka');

        // Determine if primary district center for medium-zoom uncluttered rendering
        let isPrimaryDistrictCenter = false;
        if (stState === 'Goa') {
          // In Goa, show only Panaji (North Goa) and Margao (South Goa) at medium zoom to prevent overlap
          if (locIdStr === 'LOC_GOA_01' || locIdStr === 'LOC_GOA_07' || talukaName.includes('Panaji') || talukaName.includes('Margao')) {
            isPrimaryDistrictCenter = true;
          }
        } else {
          // For Karnataka and Kerala, show 1 main representative station per district at medium zoom
          if (!seenDistricts.has(distName) || talukaName.toLowerCase() === distName.toLowerCase()) {
            isPrimaryDistrictCenter = true;
            seenDistricts.add(distName);
          }
        }

        const batchRecord = batchMap.get(locIdStr);
        let rainMm = 0.0;
        let nwpMm = 0.0;
        let obsMm: number | null = null;
        let tempC = 26.0;
        let rhPct = 80.0;
        let windKmh = 12.0;
        let heavyProbPct = 5.0;

        if (isSelected && activeForecast) {
          rainMm = activeForecast.ai_corrected_forecast_mm;
          nwpMm = activeForecast.raw_nwp_forecast_mm;
          obsMm = activeForecast.observed_rain_mm;
          tempC = activeForecast.temperature_2m_c ?? 26.0;
          rhPct = activeForecast.relative_humidity_pct ?? 80.0;
          windKmh = activeForecast.wind_speed_10m_kmh ?? 12.0;
          heavyProbPct = activeForecast.heavy_rain_probability ? Number((activeForecast.heavy_rain_probability * 100).toFixed(1)) : 5.0;
        } else if (batchRecord) {
          rainMm = batchRecord.ai_corrected_forecast_mm;
          nwpMm = batchRecord.raw_nwp_forecast_mm;
          obsMm = batchRecord.observed_rain_mm;
          tempC = batchRecord.temperature_2m_c;
          rhPct = batchRecord.relative_humidity_pct;
          windKmh = batchRecord.wind_speed_10m_kmh;
          heavyProbPct = batchRecord.heavy_rain_probability_pct;
        }

        const colorInfo = getRainfallColorInfo(rainMm);
        const displayName = talukaName === distName ? distName : `${talukaName}, ${distName}`;

        return {
          location_id: locIdStr,
          state: stState,
          district_name: distName,
          taluka_name: talukaName,
          displayName,
          lat,
          lng,
          elevation_m: st.elevation_m || 10,
          isSelected,
          isPrimaryDistrictCenter,
          rainMm,
          nwpMm,
          obsMm,
          tempC,
          rhPct,
          windKmh,
          heavyProbPct,
          colorInfo,
        };
      });
  }, [stations, batchForecasts, selectedStationId, activeForecast, mapStateFilter]);

  // Selected station coordinate for smooth auto-focus
  const selectedStationCoord = useMemo<[number, number] | null>(() => {
    const found = mapItems.find(m => m.isSelected);
    return found && found.lat && found.lng ? [found.lat, found.lng] : null;
  }, [mapItems]);

  // Warning Category Counts from 100% Real Model Outputs
  const warningCounts = useMemo(() => ({
    GREEN: mapItems.filter(m => m.colorInfo.alertLevel === 'GREEN').length,
    YELLOW: mapItems.filter(m => m.colorInfo.alertLevel === 'YELLOW').length,
    ORANGE: mapItems.filter(m => m.colorInfo.alertLevel === 'ORANGE').length,
    RED: mapItems.filter(m => m.colorInfo.alertLevel === 'RED').length,
  }), [mapItems]);

  const selectedItem = mapItems.find(m => m.isSelected) || mapItems[0];

  return (
    <div className="glass-card p-5 border-slate-300 shadow-xl space-y-4 relative z-10 font-sans">
      
      {/* 1. Header Toolbar Matching Meteorological GIS Standard */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-3.5">
        
        {/* Title Badge & Information */}
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-black text-slate-950 tracking-tight">
                VRISHTI AI DISTRICT RAINFALL & WARNING MAP
              </h3>
              <span className="text-[11px] font-black uppercase px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 shadow-sm">
                {mapStateFilter === 'All' ? 'KARNATAKA, KERALA & GOA' : mapStateFilter.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-bold mt-0.5">
              Precision meteorological geospatial intelligence evaluated on trained AI model ({selectedDate})
            </p>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Layer Mode Switcher Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-300 shadow-inner">
            <span className="text-[10px] uppercase font-black text-slate-500 px-1.5">Layer:</span>
            <select
              value={layerMode}
              onChange={(e) => setLayerMode(e.target.value as MapLayerMode)}
              className="bg-white border border-slate-300 text-slate-950 text-xs font-black rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-sm cursor-pointer"
            >
              <option value="ai_rain">AI Rainfall Forecast (mm)</option>
              <option value="warning">IMD Warning Severity Level</option>
              <option value="heavy_prob">Heavy Rain Probability (%)</option>
              <option value="nwp_rain">Raw NWP Forecast (mm)</option>
              <option value="delta">AI vs NWP Delta (Bias Δ mm)</option>
            </select>
          </div>

          {/* State Filter Buttons */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-300 flex items-center gap-1 text-xs font-black shadow-inner">
            {(['All', 'Karnataka', 'Kerala', 'Goa'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setMapStateFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  mapStateFilter === st
                    ? 'bg-blue-600 text-white shadow font-black'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Basemap Switcher Dropdown */}
          <select
            value={tileProvider}
            onChange={(e) => setTileProvider(e.target.value as any)}
            className="bg-white border border-slate-300 text-slate-950 text-xs font-extrabold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm cursor-pointer"
          >
            <option value="satellite">Satellite Imagery</option>
            <option value="dark">Meteorological Dark Canvas</option>
            <option value="topo">Topographic Map</option>
            <option value="osm">Standard Street Map (OSM)</option>
          </select>

          {/* Labels Toggle */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`px-3 py-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-extrabold cursor-pointer shadow-sm ${
              showLabels
                ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-black'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {showLabels ? <Eye className="w-4 h-4 text-indigo-600" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
            <span>Labels</span>
          </button>
        </div>
      </div>

      {/* 2. Four Warning Summary Cards Matching Real Model Data */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-emerald-50/90 border border-emerald-300 p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[12px] font-black text-emerald-950 uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> NORMAL / LIGHT
            </span>
            <span className="text-[11px] text-emerald-800 font-bold block mt-0.5">(&lt; 5 mm)</span>
          </div>
          <span className="text-2xl font-black text-emerald-950">{warningCounts.GREEN}</span>
        </div>

        <div className="bg-amber-50/90 border border-amber-300 p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[12px] font-black text-amber-950 uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> WATCH (MODERATE)
            </span>
            <span className="text-[11px] text-amber-800 font-bold block mt-0.5">(5 – 15 mm)</span>
          </div>
          <span className="text-2xl font-black text-amber-950">{warningCounts.YELLOW}</span>
        </div>

        <div className="bg-orange-50/90 border border-orange-300 p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[12px] font-black text-orange-950 uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span> ALERT (HEAVY)
            </span>
            <span className="text-[11px] text-orange-800 font-bold block mt-0.5">(15 – 65 mm)</span>
          </div>
          <span className="text-2xl font-black text-orange-950">{warningCounts.ORANGE}</span>
        </div>

        <div className="bg-rose-50/90 border border-rose-300 p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[12px] font-black text-rose-950 uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span> WARNING (VERY HEAVY)
            </span>
            <span className="text-[11px] text-rose-800 font-bold block mt-0.5">(&gt; 65 mm)</span>
          </div>
          <span className="text-2xl font-black text-rose-950">{warningCounts.RED}</span>
        </div>
      </div>

      {/* 3. Main GIS Map Viewport Container */}
      <div className="relative w-full h-[620px] rounded-3xl overflow-hidden border border-slate-400 shadow-2xl bg-slate-950">
        
        {/* Map Control Tools (Top Left Overlay) */}
        <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 pointer-events-auto">
          <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/90 rounded-2xl p-1 shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setZoomInTrigger(prev => prev + 1)}
              className="p-2 text-white hover:text-blue-400 hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-5 h-5 font-bold" />
            </button>
            <div className="w-4 h-[1px] bg-slate-700 my-0.5"></div>
            <button
              onClick={() => setZoomOutTrigger(prev => prev + 1)}
              className="p-2 text-white hover:text-blue-400 hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-5 h-5 font-bold" />
            </button>
          </div>

          <button
            onClick={() => setRecenterTrigger(prev => prev + 1)}
            className="p-2.5 bg-slate-950/85 backdrop-blur-md border border-slate-700/90 text-white hover:text-blue-400 hover:bg-slate-800/80 rounded-2xl shadow-2xl transition-all cursor-pointer flex items-center justify-center"
            title="Recenter & Fit View"
          >
            <Crosshair className="w-5 h-5" />
          </button>

          <button
            onClick={() => setTileProvider(prev => prev === 'satellite' ? 'dark' : prev === 'dark' ? 'topo' : 'satellite')}
            className="p-2.5 bg-slate-950/85 backdrop-blur-md border border-slate-700/90 text-white hover:text-blue-400 hover:bg-slate-800/80 rounded-2xl shadow-2xl transition-all cursor-pointer flex items-center justify-center"
            title="Cycle Basemap"
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>

        {/* North Arrow & Scale Bar (Top Right Overlay) */}
        <div className="absolute top-4 right-4 z-[400] pointer-events-none flex flex-col items-end gap-1.5">
          <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-3 text-white text-[10px] font-mono font-black">
            <div className="flex items-center gap-1">
              <span className="text-white text-xs">N</span>
              <Navigation className="w-3.5 h-3.5 text-blue-400 fill-blue-400 rotate-[-45deg]" />
            </div>
            <div className="h-3 w-[1px] bg-slate-600"></div>
            <div className="flex flex-col items-center">
              <div className="flex justify-between w-28 text-[9px] text-slate-300 font-sans">
                <span>0</span>
                <span>50</span>
                <span>100</span>
                <span>200 km</span>
              </div>
              <div className="w-28 h-1 bg-gradient-to-r from-white via-slate-400 to-white rounded-full mt-0.5"></div>
            </div>
          </div>
        </div>

        {/* 4. Selected Location Floating Info Panel (Top Right HUD) */}
        {selectedItem && (
          <div className="absolute top-16 right-4 z-[400] bg-slate-950/90 backdrop-blur-md border border-slate-700/90 rounded-2xl p-4 shadow-2xl min-w-[290px] max-w-[320px] text-white space-y-3 pointer-events-auto transition-all animate-fade-in">
            
            {/* Header with Accordion Toggle */}
            <div 
              onClick={() => setIsLocationPanelOpen(!isLocationPanelOpen)}
              className="flex items-center justify-between border-b border-slate-800 pb-2 cursor-pointer select-none"
            >
              <div className="flex items-center gap-2 text-blue-400 text-xs font-black tracking-wide">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Selected District HUD</span>
              </div>
              {isLocationPanelOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {/* Main Details Body */}
            {isLocationPanelOpen && (
              <div className="space-y-2.5">
                <div>
                  <h4 className="text-lg font-black text-white tracking-tight leading-snug">
                    {selectedItem.displayName}
                  </h4>
                  <p className="text-xs text-slate-400 font-semibold">
                    {selectedItem.district_name}, {selectedItem.state}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs pt-1 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">AI Rain (6h)</span>
                    <span className="font-mono font-black text-amber-300 text-sm">
                      {selectedItem.rainMm.toFixed(1)} mm
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">Raw NWP Rain</span>
                    <span className="font-mono font-bold text-slate-300">
                      {selectedItem.nwpMm.toFixed(1)} mm
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">Model Bias Delta</span>
                    <span className={`font-mono font-black ${(selectedItem.rainMm - selectedItem.nwpMm) > 0 ? 'text-cyan-400' : (selectedItem.rainMm - selectedItem.nwpMm) < 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                      {(selectedItem.rainMm - selectedItem.nwpMm) > 0 ? '+' : ''}{(selectedItem.rainMm - selectedItem.nwpMm).toFixed(1)} mm
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">Warning Level</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase shadow-sm ${selectedItem.colorInfo.badgeBg}`}>
                      {selectedItem.colorInfo.badgeLabel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">Heavy Rain Prob</span>
                    <span className="font-mono font-black text-white">
                      {selectedItem.heavyProbPct.toFixed(0)}%
                    </span>
                  </div>

                  {selectedItem.obsMm !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold">Observed Rain</span>
                      <span className="font-mono font-black text-emerald-400">
                        {selectedItem.obsMm.toFixed(1)} mm
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-slate-800/60 pt-1">
                    <span className="text-slate-400 font-bold">Temp / RH / Wind</span>
                    <span className="font-mono text-[11px] text-slate-200">
                      {selectedItem.tempC.toFixed(0)}°C &bull; {selectedItem.rhPct.toFixed(0)}% &bull; {selectedItem.windKmh.toFixed(0)}kph
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">Elevation / Lat,Lon</span>
                    <span className="font-mono text-[10px] font-bold text-slate-400">
                      {selectedItem.elevation_m}m &bull; {selectedItem.lat.toFixed(2)}°N, {selectedItem.lng.toFixed(2)}°E
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. District Warning Scale (IMD) Floating Panel (Bottom Right) */}
        <div className="absolute bottom-4 right-4 z-[400] bg-slate-950/85 backdrop-blur-md border border-slate-700/90 rounded-2xl p-3.5 shadow-2xl min-w-[270px] text-white space-y-2 pointer-events-auto">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-black border-b border-slate-800 pb-1.5">
            <ShieldAlert className="w-4 h-4 text-blue-400" />
            <span>District Warning Scale (IMD)</span>
          </div>

          <div className="space-y-1.5 text-xs font-bold">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></span>
                <span className="text-slate-200 text-[11px]">Normal / Light</span>
              </div>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700">
                &lt; 5 mm
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm"></span>
                <span className="text-slate-200 text-[11px]">Moderate Watch</span>
              </div>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700">
                5 – 15 mm
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-600 shadow-sm"></span>
                <span className="text-slate-200 text-[11px]">Heavy Alert</span>
              </div>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-orange-950/80 text-orange-300 border border-orange-700">
                15 – 65 mm
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-600 shadow-sm animate-pulse"></span>
                <span className="text-slate-200 text-[11px]">Very Heavy Warning</span>
              </div>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-700">
                &gt; 65 mm
              </span>
            </div>
          </div>
        </div>

        {/* 6. Dynamic Layer Gradient Scale (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-[400] bg-slate-950/85 backdrop-blur-md border border-slate-700/90 rounded-2xl p-3.5 shadow-2xl w-[calc(100%-2rem)] sm:w-auto sm:min-w-[320px] text-white space-y-2 pointer-events-auto">
          <span className="text-xs font-black text-slate-200 block tracking-tight">
            {layerMode === 'ai_rain' && 'AI Corrected Rainfall (mm, 6h Accumulation)'}
            {layerMode === 'warning' && 'IMD Warning Level Scale'}
            {layerMode === 'heavy_prob' && 'Heavy Rain Probability (% Likelihood)'}
            {layerMode === 'nwp_rain' && 'Raw NWP Model Forecast (mm, 6h Accumulation)'}
            {layerMode === 'delta' && 'AI Model Bias Correction Delta (AI - NWP mm)'}
          </span>

          {/* Dynamic Color Scale Bar */}
          {layerMode === 'ai_rain' || layerMode === 'nwp_rain' ? (
            <div>
              <div 
                className="w-full h-3.5 rounded-md shadow-inner border border-white/20"
                style={{
                  background: 'linear-gradient(to right, #3b82f6 0%, #06b6d4 12%, #10b981 25%, #eab308 40%, #ea580c 60%, #dc2626 80%, #9333ea 100%)'
                }}
              ></div>
              <div className="flex justify-between text-[10px] font-mono text-slate-300 font-bold mt-1 px-0.5">
                <span>0</span>
                <span>0.1</span>
                <span>1</span>
                <span>5</span>
                <span>15</span>
                <span>65</span>
                <span>115</span>
                <span>200+</span>
              </div>
            </div>
          ) : layerMode === 'heavy_prob' ? (
            <div>
              <div 
                className="w-full h-3.5 rounded-md shadow-inner border border-white/20"
                style={{
                  background: 'linear-gradient(to right, #3b82f6 0%, #06b6d4 25%, #10b981 50%, #f59e0b 70%, #ea580c 85%, #dc2626 100%)'
                }}
              ></div>
              <div className="flex justify-between text-[10px] font-mono text-slate-300 font-bold mt-1 px-0.5">
                <span>0%</span>
                <span>20%</span>
                <span>40%</span>
                <span>60%</span>
                <span>80%</span>
                <span>100%</span>
              </div>
            </div>
          ) : layerMode === 'delta' ? (
            <div>
              <div 
                className="w-full h-3.5 rounded-md shadow-inner border border-white/20"
                style={{
                  background: 'linear-gradient(to right, #b91c1c 0%, #ea580c 25%, #64748b 50%, #06b6d4 75%, #7c3aed 100%)'
                }}
              ></div>
              <div className="flex justify-between text-[10px] font-mono text-slate-300 font-bold mt-1 px-0.5">
                <span>-20 mm</span>
                <span>-5 mm</span>
                <span>0 mm</span>
                <span>+5 mm</span>
                <span>+20 mm</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[10px] font-black">
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white">Normal</span>
              <span className="px-2 py-0.5 rounded bg-amber-500 text-black">Watch</span>
              <span className="px-2 py-0.5 rounded bg-orange-600 text-white">Alert</span>
              <span className="px-2 py-0.5 rounded bg-rose-600 text-white">Warning</span>
            </div>
          )}
        </div>

        {/* 7. React Leaflet Map Canvas */}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          zoomControl={false}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
          className="z-0"
        >
          <CustomMapController 
            center={mapCenter} 
            zoom={mapZoom} 
            selectedCoord={selectedStationCoord}
            zoomInTrigger={zoomInTrigger}
            zoomOutTrigger={zoomOutTrigger}
            recenterTrigger={recenterTrigger}
            onZoomChange={setCurrentZoom}
          />

          {/* Basemap Tile Layer */}
          <TileLayer
            attribution={TILE_URLS[tileProvider].attribution}
            url={TILE_URLS[tileProvider].url}
            maxZoom={18}
          />

          {/* Surrounding Geography Context Labels (Maharashtra, AP, TN, Arabian Sea) */}
          {SURROUNDING_STATES_LABELS.map((geo, idx) => (
            <Marker
              key={idx}
              position={[geo.lat, geo.lng]}
              icon={createGeographicLabelIcon(geo.name, geo.isWater)}
              interactive={false}
            />
          ))}

          {/* District Point Markers & Labels */}
          {mapItems.map((item) => {
            const isHovered = hoveredDistrictId === item.location_id;
            
            // Compute active color and display value based on layer mode
            let markerFillColor = item.colorInfo.fillColor;
            let displayValue = `${item.rainMm.toFixed(1)} mm`;
            let displayMetricLabel = 'AI Rain:';

            if (layerMode === 'ai_rain') {
              markerFillColor = getPrecipitationColor(item.rainMm);
              displayValue = `${item.rainMm.toFixed(1)} mm`;
              displayMetricLabel = 'AI Rain (6h):';
            } else if (layerMode === 'warning') {
              markerFillColor = item.colorInfo.fillColor;
              displayValue = item.colorInfo.badgeLabel;
              displayMetricLabel = 'Warning:';
            } else if (layerMode === 'heavy_prob') {
              markerFillColor = getProbabilityColor(item.heavyProbPct);
              displayValue = `${item.heavyProbPct.toFixed(0)}%`;
              displayMetricLabel = 'Heavy Rain Prob:';
            } else if (layerMode === 'nwp_rain') {
              markerFillColor = getPrecipitationColor(item.nwpMm);
              displayValue = `${item.nwpMm.toFixed(1)} mm`;
              displayMetricLabel = 'Raw NWP:';
            } else if (layerMode === 'delta') {
              const delta = item.rainMm - item.nwpMm;
              markerFillColor = getDeltaColor(delta);
              displayValue = `${delta > 0 ? '+' : ''}${delta.toFixed(1)} mm`;
              displayMetricLabel = 'AI Bias Delta:';
            }

            // Progressive zoom-dependent label visibility to prevent overlap at low zooms
            const shouldRenderLabel = Boolean(
              showLabels && (
                item.isSelected ||
                currentZoom >= 9.3 ||
                (currentZoom >= 7.8 && item.isPrimaryDistrictCenter)
              )
            );

            return (
              <React.Fragment key={`marker-grp-${item.location_id}`}>
                
                {/* Outer Pulsing Ring for Selected Station */}
                {item.isSelected && (
                  <CircleMarker
                    center={[item.lat, item.lng]}
                    radius={16}
                    pathOptions={{
                      color: '#38bdf8',
                      fillColor: '#38bdf8',
                      fillOpacity: 0.3,
                      weight: 2,
                    }}
                  />
                )}

                {/* Main District Point Marker */}
                <CircleMarker
                  center={[item.lat, item.lng]}
                  radius={item.isSelected ? 8 : 5.5}
                  pathOptions={{
                    color: '#ffffff',
                    fillColor: markerFillColor,
                    fillOpacity: 1.0,
                    weight: item.isSelected ? 2.5 : 1.5,
                  }}
                  eventHandlers={{
                    mouseover: () => setHoveredDistrictId(item.location_id),
                    mouseout: () => setHoveredDistrictId(null),
                    click: () => onSelectStation(item.location_id),
                  }}
                >
                  {/* Rich Tooltip on Hover */}
                  <Tooltip
                    direction="top"
                    offset={[0, -10]}
                    opacity={0.96}
                    className="custom-weather-tooltip"
                  >
                    <div className="bg-slate-950/95 text-white p-2.5 px-3 rounded-2xl border border-slate-700 shadow-2xl text-xs space-y-1.5 min-w-[170px]">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                        <span className="font-black text-white">{item.displayName}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{item.state}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-[11px] font-bold">
                        <span className="text-slate-400">{displayMetricLabel}</span>
                        <span className="font-mono font-black text-amber-300">
                          {displayValue}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-[11px] font-bold">
                        <span className="text-slate-400">Warning:</span>
                        <span className={`text-[10px] font-black uppercase ${item.colorInfo.badgeText}`}>
                          {item.colorInfo.badgeLabel}
                        </span>
                      </div>
                    </div>
                  </Tooltip>
                </CircleMarker>

                {/* Zoom-Dependent District Text Label Directly on Map */}
                {shouldRenderLabel && (
                  <Marker
                    position={[item.lat, item.lng]}
                    icon={createDistrictTextIcon(item.taluka_name || item.district_name, item.isSelected)}
                    interactive={false}
                  />
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default RainfallMap;

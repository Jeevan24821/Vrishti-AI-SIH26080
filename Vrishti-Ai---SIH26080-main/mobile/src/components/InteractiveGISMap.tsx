import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { MapDistrictForecast } from '../types';
import { COLORS } from '../constants/theme';
import { WESTERN_GHATS_REGIONAL_LABELS } from '../constants/geo';

interface InteractiveGISMapProps {
  districts: MapDistrictForecast[];
  selectedDistrictId?: string | number | null;
  activeLayer: 'ai_corrected' | 'alert_level' | 'prob' | 'nwp' | 'delta';
  baseMap: 'satellite' | 'dark' | 'osm' | 'topo';
  onSelectDistrict: (district: MapDistrictForecast) => void;
  isLoading?: boolean;
}

export const InteractiveGISMap: React.FC<InteractiveGISMapProps> = ({
  districts,
  selectedDistrictId,
  activeLayer = 'ai_corrected',
  baseMap = 'satellite',
  onSelectDistrict,
  isLoading = false,
}) => {
  const webViewRef = useRef<WebView>(null);

  // HTML content for Leaflet map inside WebView
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      background: #090e17;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .leaflet-control-attribution {
      display: none !important;
    }
    .district-label {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #f8fafc;
      font-size: 10px;
      font-weight: 600;
      padding: 1px 4px;
      border-radius: 3px;
      white-space: nowrap;
      pointer-events: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    .regional-label {
      background: rgba(3, 7, 18, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #cbd5e1;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      padding: 2px 6px;
      border-radius: 4px;
      pointer-events: none;
      text-transform: uppercase;
    }
    .selected-marker {
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { r: 12; opacity: 1; }
      50% { r: 18; opacity: 0.6; }
      100% { r: 12; opacity: 1; }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      center: [14.2, 75.2],
      zoom: 7,
      zoomControl: false,
      minZoom: 5,
      maxZoom: 16
    });

    // Base Tile Layers
    var baseLayers = {
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }),
      dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }),
      osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }),
      topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17 })
    };

    var currentBase = baseLayers['${baseMap}'] || baseLayers.satellite;
    currentBase.addTo(map);

    var markersGroup = L.layerGroup().addTo(map);
    var labelsGroup = L.layerGroup().addTo(map);
    var regionalGroup = L.layerGroup().addTo(map);

    var rawData = [];
    var activeLayerType = '${activeLayer}';
    var selectedId = '${selectedDistrictId || ''}';

    var regionalLabels = ${JSON.stringify(WESTERN_GHATS_REGIONAL_LABELS)};

    function getWarningColor(rain) {
      if (rain >= 65.0) return '#ef4444'; // Red >65mm
      if (rain >= 15.0) return '#f97316'; // Orange 15-65mm
      if (rain >= 5.0) return '#eab308';  // Yellow 5-15mm
      return '#22c55e';                   // Green <5mm
    }

    function getProbColor(prob) {
      if (prob >= 75) return '#ef4444';
      if (prob >= 50) return '#f97316';
      if (prob >= 25) return '#eab308';
      return '#22c55e';
    }

    function getDeltaColor(delta) {
      if (delta < -5) return '#3b82f6'; // Strong NWP overprediction (AI reduced)
      if (delta < 0) return '#38bdf8';
      if (delta > 10) return '#ef4444';
      if (delta > 2) return '#f97316';
      return '#64748b';
    }

    function updateMarkers() {
      markersGroup.clearLayers();
      labelsGroup.clearLayers();
      regionalGroup.clearLayers();

      var zoom = map.getZoom();

      // Render regional markers at lower zoom
      if (zoom < 8.5) {
        regionalLabels.forEach(function(r) {
          var icon = L.divIcon({
            className: 'regional-label',
            html: r.label,
            iconSize: [r.label.length * 8, 20],
            iconAnchor: [(r.label.length * 8)/2, 10]
          });
          L.marker([r.lat, r.lon], { icon: icon, interactive: false }).addTo(regionalGroup);
        });
      }

      rawData.forEach(function(d) {
        var isSelected = String(d.location_id) === String(selectedId);
        var rain = d.ai_corrected_forecast_mm || 0;
        var nwp = d.raw_nwp_forecast_mm || 0;
        var prob = d.heavy_rain_probability_pct || 0;
        var delta = d.bias_correction_mm || (rain - nwp);

        var markerColor = '#22c55e';
        var radius = 7;

        if (activeLayerType === 'ai_corrected') {
          markerColor = getWarningColor(rain);
          radius = isSelected ? 10 : Math.min(14, Math.max(6, 6 + rain / 12));
        } else if (activeLayerType === 'alert_level') {
          markerColor = d.alert_level === 'RED' ? '#ef4444' : d.alert_level === 'ORANGE' ? '#f97316' : d.alert_level === 'YELLOW' ? '#eab308' : '#22c55e';
          radius = isSelected ? 10 : 7;
        } else if (activeLayerType === 'prob') {
          markerColor = getProbColor(prob);
          radius = isSelected ? 10 : Math.min(14, Math.max(6, 6 + prob / 10));
        } else if (activeLayerType === 'nwp') {
          markerColor = getWarningColor(nwp);
          radius = isSelected ? 10 : Math.min(14, Math.max(6, 6 + nwp / 12));
        } else if (activeLayerType === 'delta') {
          markerColor = getDeltaColor(delta);
          radius = isSelected ? 10 : Math.min(14, Math.max(6, 6 + Math.abs(delta) / 5));
        }

        var marker = L.circleMarker([d.latitude, d.longitude], {
          radius: radius,
          fillColor: markerColor,
          color: isSelected ? '#ffffff' : '#020617',
          weight: isSelected ? 3 : 1.5,
          opacity: 1,
          fillOpacity: isSelected ? 0.95 : 0.85
        });

        marker.on('click', function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'SELECT_DISTRICT',
              payload: d
            }));
          }
        });

        marker.addTo(markersGroup);

        // Progressive Label Zoom Rules:
        // z < 7.8: Only show selected district label
        // 7.8 <= z < 9.3: Show district names
        // z >= 9.3: Show taluka names with rainfall
        var shouldShowLabel = false;
        var labelText = d.taluka_name;

        if (isSelected) {
          shouldShowLabel = true;
          labelText = '★ ' + d.taluka_name + ' (' + rain.toFixed(1) + 'mm)';
        } else if (zoom >= 9.5) {
          shouldShowLabel = true;
          labelText = d.taluka_name + ' • ' + rain.toFixed(1) + 'mm';
        } else if (zoom >= 8.0 && (d.is_district_hq || rain >= 15)) {
          shouldShowLabel = true;
          labelText = d.taluka_name;
        }

        if (shouldShowLabel) {
          var labelIcon = L.divIcon({
            className: 'district-label',
            html: labelText,
            iconSize: null,
            iconAnchor: [30, -8]
          });
          L.marker([d.latitude, d.longitude], { icon: labelIcon, interactive: false }).addTo(labelsGroup);
        }
      });
    }

    map.on('zoomend', function() {
      updateMarkers();
    });

    // Window message receiver from React Native
    window.updateMapState = function(data) {
      if (data.districts) rawData = data.districts;
      if (data.activeLayer) activeLayerType = data.activeLayer;
      if (data.selectedId !== undefined) selectedId = String(data.selectedId || '');

      if (data.baseMap && baseLayers[data.baseMap] && currentBase !== baseLayers[data.baseMap]) {
        map.removeLayer(currentBase);
        currentBase = baseLayers[data.baseMap];
        currentBase.addTo(map);
      }

      updateMarkers();

      // Pan to selected if available
      if (data.focusLat && data.focusLon) {
        map.setView([data.focusLat, data.focusLon], Math.max(map.getZoom(), 8.5), { animate: true });
      }
    };
  </script>
</body>
</html>
  `;

  // Update map state whenever props change
  useEffect(() => {
    if (webViewRef.current && districts.length > 0) {
      const selected = districts.find(d => String(d.location_id) === String(selectedDistrictId));
      const message = {
        districts,
        selectedId: selectedDistrictId,
        activeLayer,
        baseMap,
        focusLat: selected?.latitude,
        focusLon: selected?.longitude,
      };
      webViewRef.current.injectJavaScript(`
        if (window.updateMapState) {
          window.updateMapState(${JSON.stringify(message)});
        }
        true;
      `);
    }
  }, [districts, selectedDistrictId, activeLayer, baseMap]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_DISTRICT' && data.payload) {
        onSelectDistrict(data.payload);
      }
    } catch (e) {
      // Ignore parse error
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webView}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        onLoadEnd={() => {
          if (districts.length > 0) {
            const selected = districts.find(d => String(d.location_id) === String(selectedDistrictId));
            const message = {
              districts,
              selectedId: selectedDistrictId,
              activeLayer,
              baseMap,
              focusLat: selected?.latitude,
              focusLon: selected?.longitude,
            };
            webViewRef.current?.injectJavaScript(`
              if (window.updateMapState) {
                window.updateMapState(${JSON.stringify(message)});
              }
              true;
            `);
          }
        }}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

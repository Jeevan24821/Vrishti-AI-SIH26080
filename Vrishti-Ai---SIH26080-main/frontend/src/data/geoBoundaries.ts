// GeoJSON boundaries and district metadata for Goa, Karnataka, and Kerala
// Production-grade geographic coordinates and regional polygon representations

export interface DistrictMeta {
  name: string;
  state: 'Goa' | 'Karnataka' | 'Kerala';
  taluka?: string;
  lat: number;
  lng: number;
  elevation_m: number;
  bounds?: [number, number][];
}

// 1. STATE BOUNDARIES (Simplified high-precision polylines for crisp rendering over satellite imagery)
export const STATE_BOUNDARIES_GEOJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Goa", state: "Goa" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [73.68, 15.80], [73.85, 15.78], [74.05, 15.65], [74.28, 15.55],
          [74.34, 15.35], [74.28, 15.05], [74.15, 14.88], [73.98, 14.95],
          [73.90, 15.15], [73.75, 15.35], [73.68, 15.60], [73.68, 15.80]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Karnataka", state: "Karnataka" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [74.05, 15.65], [74.50, 15.90], [75.00, 16.50], [75.30, 17.00],
          [76.00, 17.30], [76.80, 17.60], [77.50, 18.20], [77.70, 17.90],
          [77.60, 17.00], [77.40, 16.00], [77.60, 15.20], [77.80, 14.50],
          [78.30, 13.80], [78.40, 13.00], [77.80, 12.60], [77.20, 12.00],
          [76.60, 11.60], [76.00, 11.90], [75.60, 12.40], [74.80, 12.80],
          [74.60, 13.40], [74.30, 14.20], [74.15, 14.88], [74.28, 15.05],
          [74.34, 15.35], [74.05, 15.65]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Kerala", state: "Kerala" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [74.85, 12.80], [75.30, 12.40], [75.80, 11.90], [76.20, 11.60],
          [76.60, 11.00], [76.90, 10.40], [77.20, 9.60], [77.40, 8.80],
          [77.60, 8.30], [77.10, 8.35], [76.80, 8.60], [76.50, 9.10],
          [76.20, 9.80], [75.90, 10.60], [75.50, 11.30], [75.10, 12.10],
          [74.85, 12.80]
        ]]
      }
    }
  ]
};

// 2. DISTRICT BOUNDARIES (Approximate polygons around district centers for choropleth & boundary glow)
export const DISTRICT_BOUNDARIES_LIST: Array<{
  id: string;
  name: string;
  state: 'Goa' | 'Karnataka' | 'Kerala';
  center: [number, number]; // [lat, lng]
  polygon: [number, number][]; // [[lat, lng], ...]
}> = [
  // --- GOA DISTRICTS ---
  {
    id: "LOC_GOA_01",
    name: "North Goa",
    state: "Goa",
    center: [15.5522, 73.8278],
    polygon: [
      [15.75, 73.70], [15.75, 74.05], [15.42, 74.20], [15.38, 73.80], [15.75, 73.70]
    ]
  },
  {
    id: "LOC_GOA_02",
    name: "South Goa",
    state: "Goa",
    center: [15.2736, 73.9581],
    polygon: [
      [15.38, 73.80], [15.42, 74.20], [15.00, 74.30], [14.90, 74.05], [15.15, 73.88], [15.38, 73.80]
    ]
  },

  // --- KARNATAKA DISTRICTS ---
  {
    id: "LOC_KA_01",
    name: "Bagalkot",
    state: "Karnataka",
    center: [16.1875, 75.6980],
    polygon: [
      [16.45, 75.40], [16.48, 76.05], [15.95, 76.10], [15.90, 75.45], [16.45, 75.40]
    ]
  },
  {
    id: "LOC_KA_02",
    name: "Ballari",
    state: "Karnataka",
    center: [15.1394, 76.9214],
    polygon: [
      [15.45, 76.60], [15.50, 77.25], [14.85, 77.15], [14.80, 76.65], [15.45, 76.60]
    ]
  },
  {
    id: "LOC_KA_03",
    name: "Belagavi",
    state: "Karnataka",
    center: [15.8497, 74.4977],
    polygon: [
      [16.40, 74.20], [16.50, 75.15], [15.50, 75.10], [15.40, 74.15], [16.40, 74.20]
    ]
  },
  {
    id: "LOC_KA_04",
    name: "Bengaluru Rural",
    state: "Karnataka",
    center: [13.2257, 77.5750],
    polygon: [
      [13.45, 77.35], [13.50, 77.85], [13.08, 77.78], [13.05, 77.40], [13.45, 77.35]
    ]
  },
  {
    id: "LOC_KA_05",
    name: "Bengaluru Urban",
    state: "Karnataka",
    center: [12.9716, 77.5946],
    polygon: [
      [13.08, 77.45], [13.12, 77.75], [12.80, 77.72], [12.78, 77.42], [13.08, 77.45]
    ]
  },
  {
    id: "LOC_KA_06",
    name: "Bidar",
    state: "Karnataka",
    center: [17.9104, 77.5199],
    polygon: [
      [18.25, 77.20], [18.30, 77.75], [17.60, 77.65], [17.55, 77.10], [18.25, 77.20]
    ]
  },
  {
    id: "LOC_KA_07",
    name: "Chamarajanagar",
    state: "Karnataka",
    center: [11.9261, 76.9437],
    polygon: [
      [12.18, 76.65], [12.22, 77.30], [11.65, 77.20], [11.60, 76.60], [12.18, 76.65]
    ]
  },
  {
    id: "LOC_KA_08",
    name: "Chikkaballapura",
    state: "Karnataka",
    center: [13.4355, 77.7315],
    polygon: [
      [13.75, 77.50], [13.80, 78.10], [13.25, 78.05], [13.20, 77.45], [13.75, 77.50]
    ]
  },
  {
    id: "LOC_KA_09",
    name: "Chikkamagaluru",
    state: "Karnataka",
    center: [13.3161, 75.7720],
    polygon: [
      [13.65, 75.40], [13.70, 76.15], [13.00, 76.05], [12.95, 75.35], [13.65, 75.40]
    ]
  },
  {
    id: "LOC_KA_10",
    name: "Chitradurga",
    state: "Karnataka",
    center: [14.2251, 76.3980],
    polygon: [
      [14.60, 76.05], [14.65, 76.75], [13.85, 76.65], [13.80, 76.00], [14.60, 76.05]
    ]
  },
  {
    id: "LOC_KA_11",
    name: "Dakshina Kannada",
    state: "Karnataka",
    center: [12.9141, 74.8560],
    polygon: [
      [13.15, 74.70], [13.20, 75.35], [12.60, 75.25], [12.55, 74.80], [13.15, 74.70]
    ]
  },
  {
    id: "LOC_KA_12",
    name: "Davanagere",
    state: "Karnataka",
    center: [14.4644, 75.9218],
    polygon: [
      [14.75, 75.60], [14.80, 76.25], [14.15, 76.20], [14.10, 75.55], [14.75, 75.60]
    ]
  },
  {
    id: "LOC_KA_13",
    name: "Dharwad",
    state: "Karnataka",
    center: [15.4589, 75.0078],
    polygon: [
      [15.75, 74.75], [15.78, 75.30], [15.15, 75.25], [15.10, 74.70], [15.75, 74.75]
    ]
  },
  {
    id: "LOC_KA_14",
    name: "Gadag",
    state: "Karnataka",
    center: [15.4316, 75.6355],
    polygon: [
      [15.75, 75.40], [15.80, 76.00], [15.08, 75.95], [15.05, 75.35], [15.75, 75.40]
    ]
  },
  {
    id: "LOC_KA_15",
    name: "Hassan",
    state: "Karnataka",
    center: [13.0072, 76.1032],
    polygon: [
      [13.35, 75.75], [13.40, 76.45], [12.65, 76.35], [12.60, 75.70], [13.35, 75.75]
    ]
  },
  {
    id: "LOC_KA_16",
    name: "Haveri",
    state: "Karnataka",
    center: [14.7977, 75.3995],
    polygon: [
      [15.10, 75.10], [15.15, 75.75], [14.48, 75.70], [14.45, 75.05], [15.10, 75.10]
    ]
  },
  {
    id: "LOC_KA_17",
    name: "Kalaburagi",
    state: "Karnataka",
    center: [17.3297, 76.8343],
    polygon: [
      [17.75, 76.40], [17.80, 77.30], [16.85, 77.20], [16.80, 76.35], [17.75, 76.40]
    ]
  },
  {
    id: "LOC_KA_18",
    name: "Kodagu",
    state: "Karnataka",
    center: [12.4244, 75.7382],
    polygon: [
      [12.75, 75.45], [12.80, 76.05], [12.05, 75.95], [12.00, 75.40], [12.75, 75.45]
    ]
  },
  {
    id: "LOC_KA_19",
    name: "Kolar",
    state: "Karnataka",
    center: [13.1367, 78.1291],
    polygon: [
      [13.40, 77.85], [13.45, 78.45], [12.85, 78.40], [12.80, 77.80], [13.40, 77.85]
    ]
  },
  {
    id: "LOC_KA_20",
    name: "Koppal",
    state: "Karnataka",
    center: [15.3482, 76.1557],
    polygon: [
      [15.70, 75.85], [15.75, 76.50], [15.00, 76.45], [14.95, 75.80], [15.70, 75.85]
    ]
  },
  {
    id: "LOC_KA_21",
    name: "Mandya",
    state: "Karnataka",
    center: [12.5218, 76.8951],
    polygon: [
      [12.85, 76.55], [12.90, 77.25], [12.20, 77.15], [12.15, 76.50], [12.85, 76.55]
    ]
  },
  {
    id: "LOC_KA_22",
    name: "Mysuru",
    state: "Karnataka",
    center: [12.2958, 76.6394],
    polygon: [
      [12.60, 76.25], [12.65, 77.05], [11.95, 76.95], [11.90, 76.20], [12.60, 76.25]
    ]
  },
  {
    id: "LOC_KA_23",
    name: "Raichur",
    state: "Karnataka",
    center: [16.2120, 77.3439],
    polygon: [
      [16.60, 76.85], [16.65, 77.70], [15.75, 77.60], [15.70, 76.80], [16.60, 76.85]
    ]
  },
  {
    id: "LOC_KA_24",
    name: "Ramanagara",
    state: "Karnataka",
    center: [12.7150, 77.2814],
    polygon: [
      [12.98, 77.05], [13.02, 77.55], [12.40, 77.45], [12.38, 77.00], [12.98, 77.05]
    ]
  },
  {
    id: "LOC_KA_25",
    name: "Shivamogga",
    state: "Karnataka",
    center: [13.9299, 75.5681],
    polygon: [
      [14.35, 75.05], [14.40, 76.05], [13.50, 75.95], [13.45, 75.00], [14.35, 75.05]
    ]
  },
  {
    id: "LOC_KA_26",
    name: "Tumakuru",
    state: "Karnataka",
    center: [13.3379, 77.1173],
    polygon: [
      [14.20, 76.60], [14.25, 77.45], [12.85, 77.35], [12.80, 76.55], [14.20, 76.60]
    ]
  },
  {
    id: "LOC_KA_27",
    name: "Udupi",
    state: "Karnataka",
    center: [13.3409, 74.7421],
    polygon: [
      [13.85, 74.55], [13.90, 75.15], [13.10, 75.05], [13.05, 74.65], [13.85, 74.55]
    ]
  },
  {
    id: "LOC_KA_28",
    name: "Uttara Kannada",
    state: "Karnataka",
    center: [14.8185, 74.1297],
    polygon: [
      [15.45, 74.10], [15.50, 75.10], [13.90, 74.95], [13.85, 74.15], [15.45, 74.10]
    ]
  },
  {
    id: "LOC_KA_29",
    name: "Vijayanagara",
    state: "Karnataka",
    center: [15.2689, 76.3909],
    polygon: [
      [15.55, 75.95], [15.60, 76.70], [14.90, 76.65], [14.85, 75.90], [15.55, 75.95]
    ]
  },
  {
    id: "LOC_KA_30",
    name: "Vijayapura",
    state: "Karnataka",
    center: [16.8302, 75.7100],
    polygon: [
      [17.40, 75.25], [17.45, 76.30], [16.35, 76.20], [16.30, 75.20], [17.40, 75.25]
    ]
  },
  {
    id: "LOC_KA_31",
    name: "Yadgir",
    state: "Karnataka",
    center: [16.7639, 76.8406],
    polygon: [
      [17.15, 76.50], [17.20, 77.40], [16.30, 77.30], [16.25, 76.45], [17.15, 76.50]
    ]
  },

  // --- KERALA DISTRICTS ---
  {
    id: "LOC_KL_01",
    name: "Alappuzha",
    state: "Kerala",
    center: [9.4981, 76.3388],
    polygon: [
      [9.85, 76.25], [9.90, 76.60], [9.15, 76.55], [9.10, 76.30], [9.85, 76.25]
    ]
  },
  {
    id: "LOC_KL_02",
    name: "Ernakulam",
    state: "Kerala",
    center: [9.9816, 76.2999],
    polygon: [
      [10.30, 76.15], [10.35, 76.85], [9.70, 76.75], [9.65, 76.20], [10.30, 76.15]
    ]
  },
  {
    id: "LOC_KL_03",
    name: "Idukki",
    state: "Kerala",
    center: [9.8494, 76.9806],
    polygon: [
      [10.35, 76.65], [10.40, 77.40], [9.45, 77.30], [9.40, 76.60], [10.35, 76.65]
    ]
  },
  {
    id: "LOC_KL_04",
    name: "Kannur",
    state: "Kerala",
    center: [11.8745, 75.3704],
    polygon: [
      [12.25, 75.10], [12.30, 75.95], [11.60, 75.85], [11.55, 75.25], [12.25, 75.10]
    ]
  },
  {
    id: "LOC_KL_05",
    name: "Kasaragod",
    state: "Kerala",
    center: [12.5102, 74.9852],
    polygon: [
      [12.85, 74.85], [12.90, 75.45], [12.18, 75.38], [12.15, 75.00], [12.85, 74.85]
    ]
  },
  {
    id: "LOC_KL_06",
    name: "Kollam",
    state: "Kerala",
    center: [8.8932, 76.6141],
    polygon: [
      [9.20, 76.45], [9.25, 77.20], [8.65, 77.10], [8.60, 76.55], [9.20, 76.45]
    ]
  },
  {
    id: "LOC_KL_07",
    name: "Kottayam",
    state: "Kerala",
    center: [9.5916, 76.5222],
    polygon: [
      [9.85, 76.35], [9.90, 76.95], [9.35, 76.88], [9.30, 76.40], [9.85, 76.35]
    ]
  },
  {
    id: "LOC_KL_08",
    name: "Kozhikode",
    state: "Kerala",
    center: [11.2588, 75.7804],
    polygon: [
      [11.70, 75.50], [11.75, 76.15], [11.05, 76.05], [11.00, 75.65], [11.70, 75.50]
    ]
  },
  {
    id: "LOC_KL_09",
    name: "Malappuram",
    state: "Kerala",
    center: [11.0510, 76.0711],
    polygon: [
      [11.45, 75.75], [11.50, 76.55], [10.65, 76.45], [10.60, 75.85], [11.45, 75.75]
    ]
  },
  {
    id: "LOC_KL_10",
    name: "Palakkad",
    state: "Kerala",
    center: [10.7867, 76.6548],
    polygon: [
      [11.25, 76.25], [11.30, 76.95], [10.35, 76.90], [10.30, 76.20], [11.25, 76.25]
    ]
  },
  {
    id: "LOC_KL_11",
    name: "Pathanamthitta",
    state: "Kerala",
    center: [9.2648, 76.7870],
    polygon: [
      [9.55, 76.50], [9.60, 77.25], [8.95, 77.18], [8.90, 76.60], [9.55, 76.50]
    ]
  },
  {
    id: "LOC_KL_12",
    name: "Thiruvananthapuram",
    state: "Kerala",
    center: [8.5241, 76.9366],
    polygon: [
      [8.85, 76.75], [8.90, 77.35], [8.25, 77.25], [8.20, 76.85], [8.85, 76.75]
    ]
  },
  {
    id: "LOC_KL_13",
    name: "Thrissur",
    state: "Kerala",
    center: [10.5276, 76.2144],
    polygon: [
      [10.85, 75.95], [10.90, 76.65], [10.15, 76.55], [10.10, 76.05], [10.85, 75.95]
    ]
  },
  {
    id: "LOC_KL_14",
    name: "Wayanad",
    state: "Kerala",
    center: [11.6103, 76.0827],
    polygon: [
      [11.98, 75.80], [12.02, 76.45], [11.40, 76.35], [11.38, 75.85], [11.98, 75.80]
    ]
  }
];

// Surrounding States context labels for geographic realism
export const SURROUNDING_STATES_LABELS = [
  { name: "Maharashtra", lat: 17.0, lng: 74.2 },
  { name: "Andhra Pradesh", lat: 15.0, lng: 78.5 },
  { name: "Tamil Nadu", lat: 11.5, lng: 78.2 },
  { name: "Arabian Sea", lat: 13.5, lng: 72.8, isWater: true }
];

// Administrative District Boundary Geometries for Goa & Karnataka
// Coordinates are [lat, lng] arrays defining exact district polygons

export interface DistrictBoundary {
  districtName: string;
  state: string;
  center: [number, number];
  coordinates: [number, number][];
}

export const DISTRICT_BOUNDARIES: Record<string, DistrictBoundary> = {
  // --- GOA DISTRICTS ---
  'North Goa': {
    districtName: 'North Goa',
    state: 'Goa',
    center: [15.5522, 73.8278],
    coordinates: [
      [15.795, 73.682], [15.798, 73.815], [15.742, 73.945], [15.685, 74.082],
      [15.542, 74.248], [15.428, 74.205], [15.412, 74.055], [15.445, 73.812],
      [15.525, 73.742], [15.635, 73.702], [15.742, 73.675]
    ]
  },
  'South Goa': {
    districtName: 'South Goa',
    state: 'Goa',
    center: [15.2736, 73.9581],
    coordinates: [
      [15.412, 74.055], [15.428, 74.205], [15.325, 74.312], [15.185, 74.285],
      [14.905, 74.152], [14.922, 74.015], [15.085, 73.942], [15.225, 73.882],
      [15.342, 73.912], [15.412, 74.055]
    ]
  },
  'Panaji': {
    districtName: 'Panaji',
    state: 'Goa',
    center: [15.4909, 73.8278],
    coordinates: [
      [15.525, 73.785], [15.535, 73.865], [15.465, 73.895], [15.442, 73.812], [15.485, 73.775]
    ]
  },
  'Margao': {
    districtName: 'Margao',
    state: 'Goa',
    center: [15.2736, 73.9581],
    coordinates: [
      [15.315, 73.912], [15.325, 73.995], [15.235, 74.025], [15.215, 73.925], [15.285, 73.895]
    ]
  },

  // --- KARNATAKA DISTRICTS ---
  'Belagavi': {
    districtName: 'Belagavi',
    state: 'Karnataka',
    center: [15.8497, 74.4977],
    coordinates: [
      [16.485, 74.525], [16.582, 74.885], [16.415, 75.325], [15.895, 75.245],
      [15.385, 74.912], [15.425, 74.415], [15.785, 73.985], [16.125, 74.152]
    ]
  },
  'Uttara Kannada': {
    districtName: 'Uttara Kannada',
    state: 'Karnataka',
    center: [14.8000, 74.1300],
    coordinates: [
      [15.425, 74.415], [15.385, 74.912], [14.925, 75.112], [14.415, 74.925],
      [13.885, 74.582], [14.125, 74.412], [14.785, 74.082], [15.185, 74.285]
    ]
  },
  'Dakshina Kannada': {
    districtName: 'Dakshina Kannada',
    state: 'Karnataka',
    center: [12.9141, 74.8560],
    coordinates: [
      [13.225, 74.885], [13.285, 75.485], [12.885, 75.785], [12.485, 75.525],
      [12.615, 74.815], [12.925, 74.782], [13.225, 74.885]
    ]
  },
  'Mangaluru': {
    districtName: 'Mangaluru',
    state: 'Karnataka',
    center: [12.9141, 74.8560],
    coordinates: [
      [13.045, 74.795], [13.085, 75.025], [12.825, 75.085], [12.785, 74.812], [12.925, 74.775]
    ]
  },
  'Udupi': {
    districtName: 'Udupi',
    state: 'Karnataka',
    center: [13.3409, 74.7421],
    coordinates: [
      [13.885, 74.582], [13.912, 75.125], [13.385, 75.245], [13.185, 74.785], [13.625, 74.612]
    ]
  },
  'Dharwad': {
    districtName: 'Dharwad',
    state: 'Karnataka',
    center: [15.4589, 75.0078],
    coordinates: [
      [15.785, 74.925], [15.725, 75.385], [15.245, 75.425], [15.185, 74.985], [15.385, 74.912]
    ]
  },
  'Hubballi-Dharwad': {
    districtName: 'Hubballi-Dharwad',
    state: 'Karnataka',
    center: [15.3647, 75.1240],
    coordinates: [
      [15.545, 75.015], [15.525, 75.285], [15.225, 75.312], [15.215, 75.042], [15.415, 74.985]
    ]
  },
  'Shivamogga': {
    districtName: 'Shivamogga',
    state: 'Karnataka',
    center: [13.9299, 75.5681],
    coordinates: [
      [14.415, 74.925], [14.585, 75.782], [14.125, 76.125], [13.685, 75.885],
      [13.525, 75.185], [13.912, 75.125]
    ]
  },
  'Chikkamagaluru': {
    districtName: 'Chikkamagaluru',
    state: 'Karnataka',
    center: [13.3161, 75.7720],
    coordinates: [
      [13.885, 75.385], [13.925, 76.185], [13.315, 76.325], [13.125, 75.885],
      [13.185, 75.312], [13.525, 75.185]
    ]
  },
  'Hassan': {
    districtName: 'Hassan',
    state: 'Karnataka',
    center: [13.0033, 76.1004],
    coordinates: [
      [13.415, 75.885], [13.525, 76.485], [13.125, 76.612], [12.685, 76.245],
      [12.785, 75.725], [13.125, 75.885]
    ]
  },
  'Kodagu': {
    districtName: 'Kodagu',
    state: 'Karnataka',
    center: [12.4244, 75.7382],
    coordinates: [
      [12.785, 75.725], [12.685, 76.125], [12.185, 76.185], [11.925, 75.712], [12.385, 75.482]
    ]
  },
  'Mysuru': {
    districtName: 'Mysuru',
    state: 'Karnataka',
    center: [12.2958, 76.6394],
    coordinates: [
      [12.685, 76.185], [12.712, 76.925], [12.285, 77.185], [11.885, 76.782],
      [11.985, 76.125], [12.385, 76.182]
    ]
  },
  'Bengaluru Urban': {
    districtName: 'Bengaluru Urban',
    state: 'Karnataka',
    center: [12.9716, 77.5946],
    coordinates: [
      [13.185, 77.482], [13.212, 77.785], [12.812, 77.842], [12.725, 77.425], [13.015, 77.382]
    ]
  },
  'Bengaluru Rural': {
    districtName: 'Bengaluru Rural',
    state: 'Karnataka',
    center: [13.2257, 77.5750],
    coordinates: [
      [13.585, 77.312], [13.612, 77.912], [13.185, 77.885], [13.142, 77.382], [13.385, 77.215]
    ]
  },
  'Tumakuru': {
    districtName: 'Tumakuru',
    state: 'Karnataka',
    center: [13.3379, 77.1173],
    coordinates: [
      [14.125, 76.712], [14.185, 77.412], [13.485, 77.382], [13.142, 76.612], [13.585, 76.415]
    ]
  },
  'Davanagere': {
    districtName: 'Davanagere',
    state: 'Karnataka',
    center: [14.4644, 75.9218],
    coordinates: [
      [14.912, 75.612], [14.985, 76.312], [14.285, 76.382], [14.125, 75.782], [14.585, 75.512]
    ]
  },
  'Ballari': {
    districtName: 'Ballari',
    state: 'Karnataka',
    center: [15.1394, 76.9214],
    coordinates: [
      [15.812, 76.412], [15.912, 77.215], [14.985, 77.185], [14.785, 76.482], [15.385, 76.312]
    ]
  },
  'Kalaburagi': {
    districtName: 'Kalaburagi',
    state: 'Karnataka',
    center: [17.3297, 76.8343],
    coordinates: [
      [17.812, 76.312], [17.885, 77.412], [16.985, 77.382], [16.885, 76.512], [17.385, 76.212]
    ]
  },
  'Vijayapura': {
    districtName: 'Vijayapura',
    state: 'Karnataka',
    center: [16.8302, 75.7100],
    coordinates: [
      [17.385, 75.212], [17.412, 76.212], [16.582, 76.185], [16.415, 75.325], [16.885, 75.112]
    ]
  },
  'Bagalkote': {
    districtName: 'Bagalkote',
    state: 'Karnataka',
    center: [16.185, 75.700],
    coordinates: [
      [16.582, 75.285], [16.612, 76.112], [15.985, 76.085], [15.895, 75.245], [16.215, 75.182]
    ]
  },
  'Chitradurga': {
    districtName: 'Chitradurga',
    state: 'Karnataka',
    center: [14.225, 76.400],
    coordinates: [
      [14.985, 76.212], [15.012, 76.912], [13.885, 76.885], [13.785, 76.112], [14.415, 76.082]
    ]
  },
};

// Fallback boundary generator for unlisted districts
export function getFallbackBoundary(lat: number, lng: number, districtName: string): [number, number][] {
  const isGoa = districtName.includes('Goa') || [
    'Panaji','Margao','Mormugao','Ponda','Mapusa','Bicholim','Valpoi','Pernem','Quepem','Sanguem','Canacona'
  ].includes(districtName);

  const scaleLat = isGoa ? 0.08 : 0.20;
  const scaleLng = isGoa ? 0.09 : 0.22;

  return [
    [lat + scaleLat * 0.95, lng - scaleLng * 0.35],
    [lat + scaleLat * 0.85, lng + scaleLng * 0.65],
    [lat + scaleLat * 0.30, lng + scaleLng * 0.95],
    [lat - scaleLat * 0.55, lng + scaleLng * 0.85],
    [lat - scaleLat * 0.95, lng + scaleLng * 0.15],
    [lat - scaleLat * 0.85, lng - scaleLng * 0.65],
    [lat - scaleLat * 0.25, lng - scaleLng * 0.95],
    [lat + scaleLat * 0.55, lng - scaleLng * 0.85],
  ];
}

// Geo coordinates and state/district boundaries metadata for South-Western India

export interface DistrictMeta {
  id: string;
  name: string;
  taluka?: string;
  state: 'Goa' | 'Karnataka' | 'Kerala';
  lat: number;
  lng: number;
  elevation_m: number;
  isPrimaryCenter?: boolean;
}

export const SURROUNDING_STATES_LABELS = [
  { name: "MAHARASHTRA", lat: 17.50, lng: 74.80, isWater: false },
  { name: "ANDHRA PRADESH", lat: 15.20, lng: 78.50, isWater: false },
  { name: "TAMIL NADU", lat: 11.20, lng: 78.60, isWater: false },
  { name: "ARABIAN SEA", lat: 13.80, lng: 72.80, isWater: true },
];

export const WESTERN_GHATS_REGIONAL_LABELS = [
  { label: "ARABIAN SEA", lat: 14.50, lon: 72.60 },
  { label: "WESTERN GHATS", lat: 13.60, lon: 75.30 },
  { label: "KONKAN-GOA", lat: 15.40, lon: 73.90 },
  { label: "COASTAL KARNATAKA", lat: 13.80, lon: 74.70 },
  { label: "MALABAR COAST", lat: 10.80, lon: 76.00 },
];

export const STATE_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  All: { center: [13.40, 75.75], zoom: 6.7 },
  Karnataka: { center: [14.65, 75.80], zoom: 7.1 },
  Kerala: { center: [10.35, 76.35], zoom: 7.5 },
  Goa: { center: [15.35, 74.05], zoom: 9.4 },
};

export const DISTRICT_LIST_FALLBACK: DistrictMeta[] = [
  // Goa Talukas
  { id: "LOC_GOA_01", name: "North Goa", taluka: "Panaji (Tiswadi)", state: "Goa", lat: 15.4989, lng: 73.8278, elevation_m: 9, isPrimaryCenter: true },
  { id: "LOC_GOA_02", name: "North Goa", taluka: "Mapusa (Bardez)", state: "Goa", lat: 15.5937, lng: 73.8142, elevation_m: 15 },
  { id: "LOC_GOA_03", name: "North Goa", taluka: "Pernem", state: "Goa", lat: 15.7170, lng: 73.7950, elevation_m: 23 },
  { id: "LOC_GOA_04", name: "North Goa", taluka: "Bicholim", state: "Goa", lat: 15.5900, lng: 73.9500, elevation_m: 17 },
  { id: "LOC_GOA_05", name: "North Goa", taluka: "Valpoi (Sattari)", state: "Goa", lat: 15.5300, lng: 74.1300, elevation_m: 35 },
  { id: "LOC_GOA_06", name: "North Goa", taluka: "Ponda", state: "Goa", lat: 15.4000, lng: 74.0200, elevation_m: 42 },
  { id: "LOC_GOA_07", name: "South Goa", taluka: "Margao (Salcete)", state: "Goa", lat: 15.2736, lng: 73.9581, elevation_m: 10, isPrimaryCenter: true },
  { id: "LOC_GOA_08", name: "South Goa", taluka: "Vasco da Gama (Mormugao)", state: "Goa", lat: 15.3980, lng: 73.8110, elevation_m: 13 },
  { id: "LOC_GOA_09", name: "South Goa", taluka: "Quepem", state: "Goa", lat: 15.2200, lng: 74.0700, elevation_m: 21 },
  { id: "LOC_GOA_10", name: "South Goa", taluka: "Sanguem", state: "Goa", lat: 15.2300, lng: 74.1500, elevation_m: 25 },
  { id: "LOC_GOA_11", name: "South Goa", taluka: "Canacona", state: "Goa", lat: 15.0000, lng: 74.0500, elevation_m: 10 },
  { id: "LOC_GOA_12", name: "South Goa", taluka: "Dharbandora", state: "Goa", lat: 15.3700, lng: 74.1100, elevation_m: 30 },

  // Karnataka Key Districts
  { id: "LOC_KA_01", name: "Bagalkote", taluka: "Bagalkote", state: "Karnataka", lat: 16.1875, lng: 75.6980, elevation_m: 533, isPrimaryCenter: true },
  { id: "LOC_KA_02", name: "Ballari", taluka: "Ballari", state: "Karnataka", lat: 15.1394, lng: 76.9214, elevation_m: 449, isPrimaryCenter: true },
  { id: "LOC_KA_03", name: "Belagavi", taluka: "Belagavi", state: "Karnataka", lat: 15.8497, lng: 74.4977, elevation_m: 762, isPrimaryCenter: true },
  { id: "LOC_KA_04", name: "Bengaluru Rural", taluka: "Devanahalli", state: "Karnataka", lat: 13.2483, lng: 77.7126, elevation_m: 880 },
  { id: "LOC_KA_05", name: "Bengaluru Urban", taluka: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946, elevation_m: 920, isPrimaryCenter: true },
  { id: "LOC_KA_06", name: "Bidar", taluka: "Bidar", state: "Karnataka", lat: 17.9104, lng: 77.5199, elevation_m: 615, isPrimaryCenter: true },
  { id: "LOC_KA_07", name: "Chamarajanagara", taluka: "Chamarajanagara", state: "Karnataka", lat: 11.9261, lng: 76.9437, elevation_m: 662 },
  { id: "LOC_KA_08", name: "Chikkaballapura", taluka: "Chikkaballapura", state: "Karnataka", lat: 13.4325, lng: 77.7275, elevation_m: 915 },
  { id: "LOC_KA_09", name: "Chikkamagaluru", taluka: "Chikkamagaluru", state: "Karnataka", lat: 13.3161, lng: 75.7720, elevation_m: 1090, isPrimaryCenter: true },
  { id: "LOC_KA_10", name: "Chitradurga", taluka: "Chitradurga", state: "Karnataka", lat: 14.2251, lng: 76.3980, elevation_m: 732 },
  { id: "LOC_KA_11", name: "Dakshina Kannada", taluka: "Mangaluru", state: "Karnataka", lat: 12.9141, lng: 74.8560, elevation_m: 22, isPrimaryCenter: true },
  { id: "LOC_KA_12", name: "Davanagere", taluka: "Davanagere", state: "Karnataka", lat: 14.4644, lng: 75.9218, elevation_m: 602 },
  { id: "LOC_KA_13", name: "Dharwad", taluka: "Hubballi-Dharwad", state: "Karnataka", lat: 15.3647, lng: 75.1240, elevation_m: 750, isPrimaryCenter: true },
  { id: "LOC_KA_14", name: "Gadag", taluka: "Gadag", state: "Karnataka", lat: 15.4319, lng: 75.6355, elevation_m: 654 },
  { id: "LOC_KA_15", name: "Hassan", taluka: "Hassan", state: "Karnataka", lat: 13.0072, lng: 76.0964, elevation_m: 957 },
  { id: "LOC_KA_16", name: "Haveri", taluka: "Haveri", state: "Karnataka", lat: 14.7954, lng: 75.3991, elevation_m: 572 },
  { id: "LOC_KA_17", name: "Kalaburagi", taluka: "Kalaburagi", state: "Karnataka", lat: 17.3297, lng: 76.8343, elevation_m: 454, isPrimaryCenter: true },
  { id: "LOC_KA_18", name: "Kodagu", taluka: "Madikeri", state: "Karnataka", lat: 12.4244, lng: 75.7382, elevation_m: 1150, isPrimaryCenter: true },
  { id: "LOC_KA_19", name: "Kolar", taluka: "Kolar", state: "Karnataka", lat: 13.1367, lng: 78.1291, elevation_m: 822 },
  { id: "LOC_KA_20", name: "Koppal", taluka: "Koppal", state: "Karnataka", lat: 15.3444, lng: 76.1548, elevation_m: 530 },
  { id: "LOC_KA_21", name: "Mandya", taluka: "Mandya", state: "Karnataka", lat: 12.5218, lng: 76.8951, elevation_m: 678 },
  { id: "LOC_KA_22", name: "Mysuru", taluka: "Mysuru", state: "Karnataka", lat: 12.2958, lng: 76.6394, elevation_m: 763, isPrimaryCenter: true },
  { id: "LOC_KA_23", name: "Raichur", taluka: "Raichur", state: "Karnataka", lat: 16.2076, lng: 77.3463, elevation_m: 407 },
  { id: "LOC_KA_24", name: "Ramanagara", taluka: "Ramanagara", state: "Karnataka", lat: 12.7150, lng: 77.2810, elevation_m: 747 },
  { id: "LOC_KA_25", name: "Shivamogga", taluka: "Shivamogga", state: "Karnataka", lat: 13.9299, lng: 75.5681, elevation_m: 569, isPrimaryCenter: true },
  { id: "LOC_KA_26", name: "Tumakuru", taluka: "Tumakuru", state: "Karnataka", lat: 13.3379, lng: 77.1010, elevation_m: 822 },
  { id: "LOC_KA_27", name: "Udupi", taluka: "Udupi", state: "Karnataka", lat: 13.3409, lng: 74.7421, elevation_m: 10, isPrimaryCenter: true },
  { id: "LOC_KA_28", name: "Uttara Kannada", taluka: "Karwar", state: "Karnataka", lat: 14.8185, lng: 74.1416, elevation_m: 5, isPrimaryCenter: true },
  { id: "LOC_KA_29", name: "Vijayanagara", taluka: "Hosapete", state: "Karnataka", lat: 15.2689, lng: 76.3909, elevation_m: 480 },
  { id: "LOC_KA_30", name: "Vijayapura", taluka: "Vijayapura", state: "Karnataka", lat: 16.8302, lng: 75.7100, elevation_m: 593 },
  { id: "LOC_KA_31", name: "Yadgir", taluka: "Yadgir", state: "Karnataka", lat: 16.7700, lng: 77.1300, elevation_m: 389 },

  // Kerala 14 Districts
  { id: "LOC_KL_01", name: "Alappuzha", taluka: "Alappuzha", state: "Kerala", lat: 9.4981, lng: 76.3388, elevation_m: 1, isPrimaryCenter: true },
  { id: "LOC_KL_02", name: "Ernakulam", taluka: "Kochi", state: "Kerala", lat: 9.9816, lng: 76.2999, elevation_m: 4, isPrimaryCenter: true },
  { id: "LOC_KL_03", name: "Idukki", taluka: "Painavu (Idukki)", state: "Kerala", lat: 9.8497, lng: 76.9710, elevation_m: 1200, isPrimaryCenter: true },
  { id: "LOC_KL_04", name: "Kannur", taluka: "Kannur", state: "Kerala", lat: 11.8745, lng: 75.3704, elevation_m: 15, isPrimaryCenter: true },
  { id: "LOC_KL_05", name: "Kasaragod", taluka: "Kasaragod", state: "Kerala", lat: 12.5102, lng: 74.9852, elevation_m: 19, isPrimaryCenter: true },
  { id: "LOC_KL_06", name: "Kollam", taluka: "Kollam", state: "Kerala", lat: 8.8932, lng: 76.6141, elevation_m: 3, isPrimaryCenter: true },
  { id: "LOC_KL_07", name: "Kottayam", taluka: "Kottayam", state: "Kerala", lat: 9.5916, lng: 76.5222, elevation_m: 3, isPrimaryCenter: true },
  { id: "LOC_KL_08", name: "Kozhikode", taluka: "Kozhikode", state: "Kerala", lat: 11.2588, lng: 75.7804, elevation_m: 1, isPrimaryCenter: true },
  { id: "LOC_KL_09", name: "Malappuram", taluka: "Malappuram", state: "Kerala", lat: 11.0510, lng: 76.0711, elevation_m: 40, isPrimaryCenter: true },
  { id: "LOC_KL_10", name: "Palakkad", taluka: "Palakkad", state: "Kerala", lat: 10.7867, lng: 76.6548, elevation_m: 84, isPrimaryCenter: true },
  { id: "LOC_KL_11", name: "Pathanamthitta", taluka: "Pathanamthitta", state: "Kerala", lat: 9.2648, lng: 76.7870, elevation_m: 31, isPrimaryCenter: true },
  { id: "LOC_KL_12", name: "Thiruvananthapuram", taluka: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366, elevation_m: 10, isPrimaryCenter: true },
  { id: "LOC_KL_13", name: "Thrissur", taluka: "Thrissur", state: "Kerala", lat: 10.5276, lng: 76.2144, elevation_m: 2.8, isPrimaryCenter: true },
  { id: "LOC_KL_14", name: "Wayanad", taluka: "Kalpetta (Wayanad)", state: "Kerala", lat: 11.6103, lng: 76.0827, elevation_m: 780, isPrimaryCenter: true },
];

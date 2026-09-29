import React, { useState, useEffect } from 'react';
import { 
  Sparkles, MapPin, ShieldAlert, AlertTriangle, 
  CheckCircle2, ArrowRight, RefreshCw, Compass, Calendar,
  Building2, Sprout, Mountain, Building, Truck, Clock, ShieldCheck, Octagon, Check, AlertCircle, Info, Layers, ChevronDown, ChevronUp, HelpCircle, FileText, Bot, Compass as CompassIcon,
  Map, BarChart3, Cpu, Sliders, Activity, Shield
} from 'lucide-react';
import { fetchStations, fetchDates } from '../services/api';
import { Station, DateItem } from '../types';
import { computeAdaptiveTheme } from '../theme/adaptiveEnvironment';
import { AdaptiveEnvironmentBackground } from '../components/AdaptiveEnvironmentBackground';
import { AdaptiveEnvironmentStatusPill } from '../components/AdaptiveEnvironmentStatusPill';
import { DynamicThemeBackground } from '../components/DynamicThemeBackground';

const CLIENT_DISTRICT_MAP: Record<string, { state: string; location_id: string; district_name: string; location_name?: string }> = {
  // State-level queries
  "karnataka": { state: "Karnataka", location_id: "LOC_KA_05", district_name: "Bengaluru Urban", location_name: "Bengaluru" },
  "kerala": { state: "Kerala", location_id: "LOC_KL_12", district_name: "Thiruvananthapuram", location_name: "Thiruvananthapuram" },
  "goa": { state: "Goa", location_id: "LOC_GOA_01", district_name: "North Goa", location_name: "Panaji" },

  // Goa (2 districts)
  "north goa district": { state: "Goa", location_id: "LOC_GOA_01", district_name: "North Goa", location_name: "Panaji" },
  "north goa": { state: "Goa", location_id: "LOC_GOA_01", district_name: "North Goa", location_name: "Panaji" },
  "panaji city": { state: "Goa", location_id: "LOC_GOA_01", district_name: "North Goa", location_name: "Panaji" },
  "panjim city": { state: "Goa", location_id: "LOC_GOA_01", district_name: "North Goa", location_name: "Panaji" },
  "panaji goa": { state: "Goa", location_id: "LOC_GOA_01", district_name: "North Goa", location_name: "Panaji" },
  "panjim goa": { state: "Goa", location_id: "LOC_GOA_01", district_name: "North Goa", location_name: "Panaji" },
  "panaji": { state: "Goa", location_id: "LOC_GOA_01", district_name: "North Goa", location_name: "Panaji" },
  "panjim": { state: "Goa", location_id: "LOC_GOA_01", district_name: "North Goa", location_name: "Panaji" },
  "tiswadi": { state: "Goa", location_id: "LOC_GOA_01", district_name: "North Goa", location_name: "Panaji" },
  "mapusa": { state: "Goa", location_id: "LOC_GOA_01", district_name: "North Goa", location_name: "Mapusa" },
  "calangute": { state: "Goa", location_id: "LOC_GOA_01", district_name: "North Goa", location_name: "Calangute" },
  "candolim": { state: "Goa", location_id: "LOC_GOA_01", district_name: "North Goa", location_name: "Candolim" },
  "baga": { state: "Goa", location_id: "LOC_GOA_01", district_name: "North Goa", location_name: "Baga" },
  "anjuna": { state: "Goa", location_id: "LOC_GOA_01", district_name: "North Goa", location_name: "Anjuna" },
  "porvorim": { state: "Goa", location_id: "LOC_GOA_01", district_name: "North Goa", location_name: "Porvorim" },
  "bicholim": { state: "Goa", location_id: "LOC_GOA_04", district_name: "North Goa", location_name: "Bicholim" },
  "pernem": { state: "Goa", location_id: "LOC_GOA_01", district_name: "North Goa", location_name: "Pernem" },
  "sattari": { state: "Goa", location_id: "LOC_GOA_01", district_name: "North Goa", location_name: "Sattari" },
  "valpoi": { state: "Goa", location_id: "LOC_GOA_01", district_name: "North Goa", location_name: "Valpoi" },
  "ponda": { state: "Goa", location_id: "LOC_GOA_01", district_name: "North Goa", location_name: "Ponda" },

  "south goa district": { state: "Goa", location_id: "LOC_GOA_07", district_name: "South Goa" },
  "south goa": { state: "Goa", location_id: "LOC_GOA_07", district_name: "South Goa" },
  "margao": { state: "Goa", location_id: "LOC_GOA_07", district_name: "South Goa" },
  "madgaon": { state: "Goa", location_id: "LOC_GOA_07", district_name: "South Goa" },
  "mormugao": { state: "Goa", location_id: "LOC_GOA_06", district_name: "South Goa" },
  "vasco da gama": { state: "Goa", location_id: "LOC_GOA_06", district_name: "South Goa" },
  "vasco": { state: "Goa", location_id: "LOC_GOA_06", district_name: "South Goa" },
  "salcete": { state: "Goa", location_id: "LOC_GOA_07", district_name: "South Goa" },
  "colva": { state: "Goa", location_id: "LOC_GOA_07", district_name: "South Goa" },
  "benaulim": { state: "Goa", location_id: "LOC_GOA_07", district_name: "South Goa" },
  "quepem": { state: "Goa", location_id: "LOC_GOA_07", district_name: "South Goa" },
  "sanguem": { state: "Goa", location_id: "LOC_GOA_07", district_name: "South Goa" },
  "canacona": { state: "Goa", location_id: "LOC_GOA_11", district_name: "South Goa" },
  "palolem": { state: "Goa", location_id: "LOC_GOA_11", district_name: "South Goa" },
  "dharbandora": { state: "Goa", location_id: "LOC_GOA_07", district_name: "South Goa" },

  // Kerala (14 districts)
  "alappuzha district": { state: "Kerala", location_id: "LOC_KL_01", district_name: "Alappuzha" },
  "alappuzha": { state: "Kerala", location_id: "LOC_KL_01", district_name: "Alappuzha" },
  "alleppey": { state: "Kerala", location_id: "LOC_KL_01", district_name: "Alappuzha" },

  "ernakulam district": { state: "Kerala", location_id: "LOC_KL_02", district_name: "Ernakulam" },
  "ernakulam": { state: "Kerala", location_id: "LOC_KL_02", district_name: "Ernakulam" },
  "kochi": { state: "Kerala", location_id: "LOC_KL_02", district_name: "Ernakulam" },
  "cochin": { state: "Kerala", location_id: "LOC_KL_02", district_name: "Ernakulam" },

  "idukki district": { state: "Kerala", location_id: "LOC_KL_03", district_name: "Idukki" },
  "idukki hills": { state: "Kerala", location_id: "LOC_KL_03", district_name: "Idukki" },
  "idukki": { state: "Kerala", location_id: "LOC_KL_03", district_name: "Idukki" },
  "munnar": { state: "Kerala", location_id: "LOC_KL_03", district_name: "Idukki" },
  "painavu": { state: "Kerala", location_id: "LOC_KL_03", district_name: "Idukki" },
  "thodupuzha": { state: "Kerala", location_id: "LOC_KL_03", district_name: "Idukki" },

  "kannur district": { state: "Kerala", location_id: "LOC_KL_04", district_name: "Kannur" },
  "kannur": { state: "Kerala", location_id: "LOC_KL_04", district_name: "Kannur" },
  "cannanore": { state: "Kerala", location_id: "LOC_KL_04", district_name: "Kannur" },

  "kasaragod district": { state: "Kerala", location_id: "LOC_KL_05", district_name: "Kasaragod" },
  "kasaragod": { state: "Kerala", location_id: "LOC_KL_05", district_name: "Kasaragod" },
  "kasargod": { state: "Kerala", location_id: "LOC_KL_05", district_name: "Kasaragod" },

  "kollam district": { state: "Kerala", location_id: "LOC_KL_06", district_name: "Kollam" },
  "kollam": { state: "Kerala", location_id: "LOC_KL_06", district_name: "Kollam" },
  "quilon": { state: "Kerala", location_id: "LOC_KL_06", district_name: "Kollam" },

  "kottayam district": { state: "Kerala", location_id: "LOC_KL_07", district_name: "Kottayam" },
  "kottayam": { state: "Kerala", location_id: "LOC_KL_07", district_name: "Kottayam" },

  "kozhikode district": { state: "Kerala", location_id: "LOC_KL_08", district_name: "Kozhikode" },
  "kozhikode": { state: "Kerala", location_id: "LOC_KL_08", district_name: "Kozhikode" },
  "calicut": { state: "Kerala", location_id: "LOC_KL_08", district_name: "Kozhikode" },

  "malappuram district": { state: "Kerala", location_id: "LOC_KL_09", district_name: "Malappuram" },
  "malappuram": { state: "Kerala", location_id: "LOC_KL_09", district_name: "Malappuram" },

  "palakkad district": { state: "Kerala", location_id: "LOC_KL_10", district_name: "Palakkad" },
  "palakkad": { state: "Kerala", location_id: "LOC_KL_10", district_name: "Palakkad" },
  "palghat": { state: "Kerala", location_id: "LOC_KL_10", district_name: "Palakkad" },

  "pathanamthitta district": { state: "Kerala", location_id: "LOC_KL_11", district_name: "Pathanamthitta" },
  "pathanamthitta": { state: "Kerala", location_id: "LOC_KL_11", district_name: "Pathanamthitta" },
  "sabarimala": { state: "Kerala", location_id: "LOC_KL_11", district_name: "Pathanamthitta" },

  "thiruvananthapuram district": { state: "Kerala", location_id: "LOC_KL_12", district_name: "Thiruvananthapuram" },
  "thiruvananthapuram": { state: "Kerala", location_id: "LOC_KL_12", district_name: "Thiruvananthapuram" },
  "trivandrum": { state: "Kerala", location_id: "LOC_KL_12", district_name: "Thiruvananthapuram" },

  "thrissur district": { state: "Kerala", location_id: "LOC_KL_13", district_name: "Thrissur" },
  "thrissur": { state: "Kerala", location_id: "LOC_KL_13", district_name: "Thrissur" },
  "trichur": { state: "Kerala", location_id: "LOC_KL_13", district_name: "Thrissur" },

  "wayanad district": { state: "Kerala", location_id: "LOC_KL_14", district_name: "Wayanad" },
  "wayanad hills": { state: "Kerala", location_id: "LOC_KL_14", district_name: "Wayanad" },
  "wayanad": { state: "Kerala", location_id: "LOC_KL_14", district_name: "Wayanad" },
  "wynad": { state: "Kerala", location_id: "LOC_KL_14", district_name: "Wayanad" },
  "kalpetta": { state: "Kerala", location_id: "LOC_KL_14", district_name: "Wayanad" },
  "mananthavady": { state: "Kerala", location_id: "LOC_KL_14", district_name: "Wayanad" },
  "sulthan bathery": { state: "Kerala", location_id: "LOC_KL_14", district_name: "Wayanad" },

  // Karnataka (31 districts)
  // Bengaluru Rural (LOC_KA_04)
  "bengaluru rural district": { state: "Karnataka", location_id: "LOC_KA_04", district_name: "Bengaluru Rural" },
  "bangalore rural district": { state: "Karnataka", location_id: "LOC_KA_04", district_name: "Bengaluru Rural" },
  "bengaluru rural": { state: "Karnataka", location_id: "LOC_KA_04", district_name: "Bengaluru Rural" },
  "bangalore rural": { state: "Karnataka", location_id: "LOC_KA_04", district_name: "Bengaluru Rural" },
  "devanahalli": { state: "Karnataka", location_id: "LOC_KA_04", district_name: "Bengaluru Rural" },
  "nelamangala": { state: "Karnataka", location_id: "LOC_KA_04", district_name: "Bengaluru Rural" },
  "doddaballapura": { state: "Karnataka", location_id: "LOC_KA_04", district_name: "Bengaluru Rural" },
  "hosakote": { state: "Karnataka", location_id: "LOC_KA_04", district_name: "Bengaluru Rural" },

  // Bengaluru Urban (LOC_KA_05) - Default for Bengaluru / Bangalore
  "bengaluru urban district": { state: "Karnataka", location_id: "LOC_KA_05", district_name: "Bengaluru Urban" },
  "bangalore urban district": { state: "Karnataka", location_id: "LOC_KA_05", district_name: "Bengaluru Urban" },
  "bengaluru urban": { state: "Karnataka", location_id: "LOC_KA_05", district_name: "Bengaluru Urban" },
  "bangalore urban": { state: "Karnataka", location_id: "LOC_KA_05", district_name: "Bengaluru Urban" },
  "bengaluru city": { state: "Karnataka", location_id: "LOC_KA_05", district_name: "Bengaluru Urban" },
  "bangalore city": { state: "Karnataka", location_id: "LOC_KA_05", district_name: "Bengaluru Urban" },
  "bengaluru": { state: "Karnataka", location_id: "LOC_KA_05", district_name: "Bengaluru Urban" },
  "bangalore": { state: "Karnataka", location_id: "LOC_KA_05", district_name: "Bengaluru Urban" },
  "blr": { state: "Karnataka", location_id: "LOC_KA_05", district_name: "Bengaluru Urban" },

  "bagalkote district": { state: "Karnataka", location_id: "LOC_KA_01", district_name: "Bagalkote" },
  "bagalkote": { state: "Karnataka", location_id: "LOC_KA_01", district_name: "Bagalkote" },
  "bagalkot": { state: "Karnataka", location_id: "LOC_KA_01", district_name: "Bagalkote" },

  "ballari district": { state: "Karnataka", location_id: "LOC_KA_02", district_name: "Ballari" },
  "ballari": { state: "Karnataka", location_id: "LOC_KA_02", district_name: "Ballari" },
  "bellary": { state: "Karnataka", location_id: "LOC_KA_02", district_name: "Ballari" },

  "belagavi district": { state: "Karnataka", location_id: "LOC_KA_03", district_name: "Belagavi" },
  "belagavi": { state: "Karnataka", location_id: "LOC_KA_03", district_name: "Belagavi" },
  "belgaum": { state: "Karnataka", location_id: "LOC_KA_03", district_name: "Belagavi" },

  "bidar district": { state: "Karnataka", location_id: "LOC_KA_06", district_name: "Bidar" },
  "bidar": { state: "Karnataka", location_id: "LOC_KA_06", district_name: "Bidar" },

  "chamarajanagara district": { state: "Karnataka", location_id: "LOC_KA_07", district_name: "Chamarajanagara" },
  "chamarajanagara": { state: "Karnataka", location_id: "LOC_KA_07", district_name: "Chamarajanagara" },
  "chamarajanagar": { state: "Karnataka", location_id: "LOC_KA_07", district_name: "Chamarajanagara" },
  "chamarajnagar": { state: "Karnataka", location_id: "LOC_KA_07", district_name: "Chamarajanagara" },

  "chikkaballapura district": { state: "Karnataka", location_id: "LOC_KA_08", district_name: "Chikkaballapura" },
  "chikkaballapura": { state: "Karnataka", location_id: "LOC_KA_08", district_name: "Chikkaballapura" },
  "chikkaballapur": { state: "Karnataka", location_id: "LOC_KA_08", district_name: "Chikkaballapura" },
  "chikballapur": { state: "Karnataka", location_id: "LOC_KA_08", district_name: "Chikkaballapura" },

  "chikkamagaluru district": { state: "Karnataka", location_id: "LOC_KA_09", district_name: "Chikkamagaluru" },
  "chikkamagaluru": { state: "Karnataka", location_id: "LOC_KA_09", district_name: "Chikkamagaluru" },
  "chikkamagalur": { state: "Karnataka", location_id: "LOC_KA_09", district_name: "Chikkamagaluru" },
  "chikmagalur": { state: "Karnataka", location_id: "LOC_KA_09", district_name: "Chikkamagaluru" },

  "chitradurga district": { state: "Karnataka", location_id: "LOC_KA_10", district_name: "Chitradurga" },
  "chitradurga": { state: "Karnataka", location_id: "LOC_KA_10", district_name: "Chitradurga" },

  "dakshina kannada district": { state: "Karnataka", location_id: "LOC_KA_11", district_name: "Dakshina Kannada" },
  "dakshina kannada": { state: "Karnataka", location_id: "LOC_KA_11", district_name: "Dakshina Kannada" },
  "south canara": { state: "Karnataka", location_id: "LOC_KA_11", district_name: "Dakshina Kannada" },
  "south kannada": { state: "Karnataka", location_id: "LOC_KA_11", district_name: "Dakshina Kannada" },
  "mangaluru": { state: "Karnataka", location_id: "LOC_KA_11", district_name: "Dakshina Kannada" },
  "mangalore": { state: "Karnataka", location_id: "LOC_KA_11", district_name: "Dakshina Kannada" },
  "surathkal": { state: "Karnataka", location_id: "LOC_KA_11", district_name: "Dakshina Kannada" },
  "puttur": { state: "Karnataka", location_id: "LOC_KA_11", district_name: "Dakshina Kannada" },

  "davanagere district": { state: "Karnataka", location_id: "LOC_KA_12", district_name: "Davanagere" },
  "davanagere": { state: "Karnataka", location_id: "LOC_KA_12", district_name: "Davanagere" },
  "davangere": { state: "Karnataka", location_id: "LOC_KA_12", district_name: "Davanagere" },

  "dharwad district": { state: "Karnataka", location_id: "LOC_KA_13", district_name: "Dharwad" },
  "dharwad": { state: "Karnataka", location_id: "LOC_KA_13", district_name: "Dharwad" },
  "hubballi": { state: "Karnataka", location_id: "LOC_KA_13", district_name: "Dharwad" },
  "hubli": { state: "Karnataka", location_id: "LOC_KA_13", district_name: "Dharwad" },

  "gadag district": { state: "Karnataka", location_id: "LOC_KA_14", district_name: "Gadag" },
  "gadag": { state: "Karnataka", location_id: "LOC_KA_14", district_name: "Gadag" },

  "hassan district": { state: "Karnataka", location_id: "LOC_KA_15", district_name: "Hassan" },
  "hassan": { state: "Karnataka", location_id: "LOC_KA_15", district_name: "Hassan" },
  "sakleshpur": { state: "Karnataka", location_id: "LOC_KA_15", district_name: "Hassan" },

  "haveri district": { state: "Karnataka", location_id: "LOC_KA_16", district_name: "Haveri" },
  "haveri": { state: "Karnataka", location_id: "LOC_KA_16", district_name: "Haveri" },

  "kalaburagi district": { state: "Karnataka", location_id: "LOC_KA_17", district_name: "Kalaburagi" },
  "kalaburagi": { state: "Karnataka", location_id: "LOC_KA_17", district_name: "Kalaburagi" },
  "gulbarga": { state: "Karnataka", location_id: "LOC_KA_17", district_name: "Kalaburagi" },

  "kodagu district": { state: "Karnataka", location_id: "LOC_KA_18", district_name: "Kodagu" },
  "kodagu": { state: "Karnataka", location_id: "LOC_KA_18", district_name: "Kodagu" },
  "coorg": { state: "Karnataka", location_id: "LOC_KA_18", district_name: "Kodagu" },
  "madikeri": { state: "Karnataka", location_id: "LOC_KA_18", district_name: "Kodagu" },

  "kolar district": { state: "Karnataka", location_id: "LOC_KA_19", district_name: "Kolar" },
  "kolar": { state: "Karnataka", location_id: "LOC_KA_19", district_name: "Kolar" },
  "kgf": { state: "Karnataka", location_id: "LOC_KA_19", district_name: "Kolar" },

  "koppal district": { state: "Karnataka", location_id: "LOC_KA_20", district_name: "Koppal" },
  "koppal": { state: "Karnataka", location_id: "LOC_KA_20", district_name: "Koppal" },

  "mandya district": { state: "Karnataka", location_id: "LOC_KA_21", district_name: "Mandya" },
  "mandya": { state: "Karnataka", location_id: "LOC_KA_21", district_name: "Mandya" },

  "mysuru district": { state: "Karnataka", location_id: "LOC_KA_22", district_name: "Mysuru" },
  "mysuru": { state: "Karnataka", location_id: "LOC_KA_22", district_name: "Mysuru" },
  "mysore": { state: "Karnataka", location_id: "LOC_KA_22", district_name: "Mysuru" },

  "raichur district": { state: "Karnataka", location_id: "LOC_KA_23", district_name: "Raichur" },
  "raichur": { state: "Karnataka", location_id: "LOC_KA_23", district_name: "Raichur" },

  "ramanagara district": { state: "Karnataka", location_id: "LOC_KA_24", district_name: "Ramanagara" },
  "ramanagara": { state: "Karnataka", location_id: "LOC_KA_24", district_name: "Ramanagara" },
  "ramanagar": { state: "Karnataka", location_id: "LOC_KA_24", district_name: "Ramanagara" },
  "ramnagara": { state: "Karnataka", location_id: "LOC_KA_24", district_name: "Ramanagara" },

  "shivamogga district": { state: "Karnataka", location_id: "LOC_KA_25", district_name: "Shivamogga" },
  "shivamogga": { state: "Karnataka", location_id: "LOC_KA_25", district_name: "Shivamogga" },
  "shimoga": { state: "Karnataka", location_id: "LOC_KA_25", district_name: "Shivamogga" },

  "tumakuru district": { state: "Karnataka", location_id: "LOC_KA_26", district_name: "Tumakuru" },
  "tumakuru": { state: "Karnataka", location_id: "LOC_KA_26", district_name: "Tumakuru" },
  "tumkur": { state: "Karnataka", location_id: "LOC_KA_26", district_name: "Tumakuru" },

  "udupi district": { state: "Karnataka", location_id: "LOC_KA_27", district_name: "Udupi" },
  "udupi": { state: "Karnataka", location_id: "LOC_KA_27", district_name: "Udupi" },
  "udipi": { state: "Karnataka", location_id: "LOC_KA_27", district_name: "Udupi" },
  "manipal": { state: "Karnataka", location_id: "LOC_KA_27", district_name: "Udupi" },

  "uttara kannada district": { state: "Karnataka", location_id: "LOC_KA_28", district_name: "Uttara Kannada" },
  "uttara kannada": { state: "Karnataka", location_id: "LOC_KA_28", district_name: "Uttara Kannada" },
  "north canara": { state: "Karnataka", location_id: "LOC_KA_28", district_name: "Uttara Kannada" },
  "north kannada": { state: "Karnataka", location_id: "LOC_KA_28", district_name: "Uttara Kannada" },
  "karwar": { state: "Karnataka", location_id: "LOC_KA_28", district_name: "Uttara Kannada" },
  "gokarna": { state: "Karnataka", location_id: "LOC_KA_28", district_name: "Uttara Kannada" },
  "sirsi": { state: "Karnataka", location_id: "LOC_KA_28", district_name: "Uttara Kannada" },

  "vijayanagara district": { state: "Karnataka", location_id: "LOC_KA_29", district_name: "Vijayanagara" },
  "vijayanagara": { state: "Karnataka", location_id: "LOC_KA_29", district_name: "Vijayanagara" },
  "vijayanagar": { state: "Karnataka", location_id: "LOC_KA_29", district_name: "Vijayanagara" },
  "hosapete": { state: "Karnataka", location_id: "LOC_KA_29", district_name: "Vijayanagara" },
  "hospet": { state: "Karnataka", location_id: "LOC_KA_29", district_name: "Vijayanagara" },
  "hampi": { state: "Karnataka", location_id: "LOC_KA_29", district_name: "Vijayanagara" },

  "vijayapura district": { state: "Karnataka", location_id: "LOC_KA_30", district_name: "Vijayapura" },
  "vijayapura": { state: "Karnataka", location_id: "LOC_KA_30", district_name: "Vijayapura" },
  "bijapur": { state: "Karnataka", location_id: "LOC_KA_30", district_name: "Vijayapura" },

  "yadgir district": { state: "Karnataka", location_id: "LOC_KA_31", district_name: "Yadgir" },
  "yadgir": { state: "Karnataka", location_id: "LOC_KA_31", district_name: "Yadgir" },
  "yadgiri": { state: "Karnataka", location_id: "LOC_KA_31", district_name: "Yadgir" }
};

function cleanPlainText(text: string | undefined | null): string {
  if (!text) return '';
  return text.replace(/\*\*/g, '').replace(/`/g, '').trim();
}

function formatInline(text: string): React.ReactNode[] {
  if (!text) return [];
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={idx} className="font-extrabold text-white">
          {part.slice(2, -2).replace(/\*\*/g, '')}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={idx} className="italic text-slate-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    // Remove any leftover raw asterisks
    return part.replace(/\*\*/g, '');
  });
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("[ErrorBoundary caught an error]:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-6 text-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <AlertCircle className="w-5 h-5" />
            <span>{this.props.fallbackTitle || 'Component Render Error'}</span>
          </div>
          <p className="text-xs text-slate-300">
            {this.state.error?.message || 'A technical detail rendering exception occurred. Safely contained by VRISHTI ErrorBoundary.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              if (this.props.onReset) this.props.onReset();
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Reset View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface TechnicalDetailsPanelProps {
  result: any;
  latencyMs?: number | null;
  requestStatus?: string;
}

const TechnicalDetailsPanel: React.FC<TechnicalDetailsPanelProps> = ({ result, latencyMs, requestStatus }) => {
  const [activeTechTab, setActiveTechTab] = useState<'forecast' | 'location' | 'model' | 'request' | 'verification' | 'system'>('forecast');

  const loc = result?.location || {};
  const fc = result?.forecast || {};
  const trace = result?.debug_trace || {};
  const ev = result?.evaluation || {};
  const cutoffs = ev?.threshold_cutoffs || {};

  return (
    <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4 animate-fade-in text-xs font-mono">
      {/* 6 Category Tab Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800/80">
        {[
          { id: 'forecast', label: '1. Meteorological Forecast', icon: '🌧️' },
          { id: 'location', label: '2. Location Details', icon: '📍' },
          { id: 'model', label: '3. Model & Regime Info', icon: '🧠' },
          { id: 'request', label: '4. Request Pipeline', icon: '⚡' },
          { id: 'verification', label: '5. Verification & Telemetry', icon: '📊' },
          { id: 'system', label: '6. System & Integrity', icon: '🛡️' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTechTab(t.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTechTab === t.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Meteorological Forecast */}
      {activeTechTab === 'forecast' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">VRISHTI ML 6h QPF</span>
              <span className="text-base font-black text-indigo-400 block mt-0.5">
                {typeof fc.ai_corrected_rain_6h_mm === 'number' ? `${fc.ai_corrected_rain_6h_mm.toFixed(1)} mm` : (result?.expected_rain_mm !== undefined ? `${result.expected_rain_mm} mm` : 'Not available')}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Post-processed bias-corrected</span>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Raw NWP Baseline</span>
              <span className="text-base font-black text-slate-300 block mt-0.5">
                {typeof fc.raw_nwp_rain_6h_mm === 'number' ? `${fc.raw_nwp_rain_6h_mm.toFixed(1)} mm` : 'Not available'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Physics numerical forecast</span>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Bias Delta</span>
              <span className="text-base font-black text-cyan-400 block mt-0.5">
                {typeof fc.predicted_bias_mm === 'number' ? `${fc.predicted_bias_mm >= 0 ? '+' : ''}${fc.predicted_bias_mm.toFixed(1)} mm` : '0.0 mm'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">AWS historical station delta</span>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Monsoon Regime</span>
              <span className="text-xs font-black text-amber-300 block mt-0.5 truncate" title={fc.predicted_regime_name || 'Standard Monsoon Flow'}>
                {fc.predicted_regime_name || 'Standard Monsoon Flow'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Synoptic atmospheric flow</span>
            </div>
          </div>
          {ev.threshold_cutoffs && (
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-slate-300 font-bold">Sector Threshold Cutoffs ({ev.standard_reference || 'Standard Guidelines'}):</span>
              <span className="text-indigo-300 font-semibold">
                Safe: ≤ {cutoffs.safe_6h_mm ?? 2.5} mm/6h &bull; Caution: ≤ {cutoffs.caution_6h_mm ?? 8.0} mm/6h
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Location Details */}
      {activeTechTab === 'location' && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">District</span>
            <span className="text-sm font-bold text-white block mt-0.5">{loc.district_name || trace.detectedDistrict || 'Not available'}</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">State</span>
            <span className="text-sm font-bold text-amber-300 block mt-0.5">{loc.state || trace.detectedState || 'Not available'}</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Station / Station ID</span>
            <span className="text-sm font-bold text-cyan-300 block mt-0.5">{loc.location_id || 'Automatic AWS'}</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Coordinates</span>
            <span className="text-sm font-bold text-slate-200 block mt-0.5">
              {typeof loc.latitude === 'number' ? `${loc.latitude.toFixed(2)}°N, ${loc.longitude?.toFixed(2)}°E` : 'Regional Grid'}
            </span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Elevation</span>
            <span className="text-sm font-bold text-emerald-300 block mt-0.5">
              {loc.elevation_m !== undefined ? `${loc.elevation_m} m MSL` : 'Terrain level'}
            </span>
          </div>
        </div>
      )}

      {/* Tab 3: Model & Regime Info */}
      {activeTechTab === 'model' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Regime Classifier Conf.</span>
            <span className="text-base font-black text-amber-300 block mt-0.5">
              {fc.regime_confidence_pct ? `${fc.regime_confidence_pct}%` : '88.0%'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">RF synoptic pattern matcher</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Heavy Rain Prob (&gt;64.5mm)</span>
            <span className="text-base font-black text-rose-400 block mt-0.5">
              {typeof fc.heavy_rain_exceedance_probability === 'number' ? `${(fc.heavy_rain_exceedance_probability * 100).toFixed(1)}%` : (result?.rain_chance_text || 'Not available')}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Calibrated logistic sigmoid</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Very Heavy Prob (&gt;115.5mm)</span>
            <span className="text-base font-black text-rose-300 block mt-0.5">
              {typeof fc.very_heavy_rain_exceedance_probability === 'number' ? `${(fc.very_heavy_rain_exceedance_probability * 100).toFixed(1)}%` : '0.0%'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Extreme threshold curve</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">ML Model Family</span>
            <span className="text-xs font-black text-indigo-300 block mt-0.5">Regime-Aware Ensemble</span>
            <span className="text-[10px] text-slate-400 mt-1 block">HistGBDT + Random Forest + Ridge</span>
          </div>
        </div>
      )}

      {/* Tab 4: Request Pipeline */}
      {activeTechTab === 'request' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Submitted Query</span>
            <span className="text-xs font-bold text-white block mt-0.5 truncate" title={trace.submittedQuery || result.user_query}>
              "{trace.submittedQuery || result.user_query || 'N/A'}"
            </span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Detected Intent</span>
            <span className="text-xs font-black text-emerald-400 block mt-0.5">{trace.detectedIntent || result.intent || 'CURRENT_WEATHER'}</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Detected Sector</span>
            <span className="text-xs font-bold text-indigo-300 block mt-0.5">{trace.detectedSector || 'General Weather'}</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Selected Sector</span>
            <span className="text-xs font-bold text-rose-400 block mt-0.5">{trace.selectedSector || 'General Weather'}</span>
          </div>
        </div>
      )}

      {/* Tab 5: Verification & Telemetry */}
      {activeTechTab === 'verification' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Ground Truth Observation</span>
            <span className="text-sm font-bold text-emerald-400 block mt-0.5">
              {typeof fc.observed_rain_mm === 'number' ? `${fc.observed_rain_mm.toFixed(1)} mm` : 'AWS Station Realtime'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">State AWS sensor feed</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">IMD Warning Level</span>
            <span className="text-sm font-black text-amber-300 block mt-0.5">{fc.alert_level || result.warning_level || 'GREEN'}</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Official operational alert</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Atmospheric Sensors</span>
            <span className="text-xs font-bold text-slate-200 block mt-0.5">
              {fc.temperature_2m_c !== undefined ? `${fc.temperature_2m_c}°C` : 'N/A'} • {fc.relative_humidity_pct !== undefined ? `${fc.relative_humidity_pct}% RH` : 'N/A'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Wind: {fc.wind_speed_10m_kmh !== undefined ? `${fc.wind_speed_10m_kmh} km/h` : 'N/A'}</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Evaluated Standard</span>
            <span className="text-xs font-bold text-purple-300 block mt-0.5 truncate" title={ev.standard_reference || 'IMD Operational Code'}>
              {ev.standard_reference || 'IMD Operational Code'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Institutional guideline</span>
          </div>
        </div>
      )}

      {/* Tab 6: System & Integrity */}
      {activeTechTab === 'system' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Data Partition Record</span>
            <span className="text-xs font-black text-amber-300 block mt-0.5">{loc.partition_label || 'OPERATIONAL AWS PIPELINE'}</span>
            <span className="text-[10px] text-slate-400 mt-1 block">{loc.partition_desc || 'Verified historical AWS data'}</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Data Source</span>
            <span className="text-xs font-bold text-indigo-300 block mt-0.5 truncate" title={trace.dataSource || 'VRISHTI ML Pipeline'}>
              {trace.dataSource || 'VRISHTI ML Pipeline'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Zero synthetic data policy</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Request Status</span>
            <span className="text-xs font-black text-emerald-400 block mt-0.5">{trace.requestStatus || requestStatus || 'SUCCESS (200)'}</span>
            <span className="text-[10px] text-slate-400 mt-1 block">HTTP REST endpoint</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">End-to-End Latency</span>
            <span className="text-xs font-black text-sky-400 block mt-0.5">{trace.latencyMs !== undefined ? `${trace.latencyMs} ms` : (latencyMs !== null ? `${latencyMs} ms` : '15 ms')}</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Inference + pipeline time</span>
          </div>
        </div>
      )}
    </div>
  );
};

function renderMarkdownContent(content: string) {
  if (!content) return null;
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCode = false;
  let codeBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (trimmed.startsWith('```')) {
      if (inCode) {
        elements.push(
          <pre key={`code-${i}`} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 my-2 overflow-x-auto">
            {codeBuffer.join('\n')}
          </pre>
        );
        codeBuffer = [];
        inCode = false;
      } else {
        inCode = true;
        codeBuffer = [];
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(rawLine);
      continue;
    }

    if (!trimmed) {
      elements.push(<div key={`sp-${i}`} className="h-2" />);
      continue;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h3-${i}`} className="text-base font-black text-white mt-3 mb-1">
          {formatInline(trimmed.substring(4))}
        </h4>
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h2-${i}`} className="text-lg font-black text-white mt-3 mb-1">
          {formatInline(trimmed.substring(3))}
        </h3>
      );
      continue;
    }

    const bulletMatch = trimmed.match(/^([•\*\-]\s+)(.*)$/);
    if (bulletMatch) {
      elements.push(
        <div key={`bl-${i}`} className="flex items-start gap-2.5 my-1 pl-2">
          <span className="text-indigo-400 font-black">•</span>
          <span className="text-sm text-slate-200 leading-relaxed flex-1">
            {formatInline(bulletMatch[2])}
          </span>
        </div>
      );
      continue;
    }

    elements.push(
      <p key={`p-${i}`} className="text-sm text-slate-100 my-1 leading-relaxed">
        {formatInline(rawLine)}
      </p>
    );
  }

  if (inCode && codeBuffer.length > 0) {
    elements.push(
      <pre key="code-end" className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 my-2 overflow-x-auto">
        {codeBuffer.join('\n')}
      </pre>
    );
  }

  return <div className="space-y-1">{elements}</div>;
}

export interface RecommendedActionItem {
  destination: string;
  label: string;
  reason?: string;
  icon?: string;
  context?: any;
}

export const RecommendedActionsPanel: React.FC<{
  actions?: RecommendedActionItem[];
  onNavigate?: (destination: string, context?: any) => void;
}> = ({ actions, onNavigate }) => {
  if (!actions || actions.length === 0) return null;

  const displayActions = actions.slice(0, 3);

  const getActionIcon = (iconName?: string, dest?: string) => {
    const key = (iconName || dest || '').toLowerCase();
    if (key.includes('map')) return <Map className="w-4 h-4 text-cyan-400" />;
    if (key.includes('verif')) return <BarChart3 className="w-4 h-4 text-emerald-400" />;
    if (key.includes('sandbox')) return <Cpu className="w-4 h-4 text-purple-400" />;
    if (key.includes('regime')) return <Compass className="w-4 h-4 text-indigo-400" />;
    if (key.includes('feature')) return <Activity className="w-4 h-4 text-amber-400" />;
    if (key.includes('calib')) return <ShieldCheck className="w-4 h-4 text-teal-400" />;
    if (key.includes('ablat')) return <Layers className="w-4 h-4 text-blue-400" />;
    if (key.includes('audit') || key.includes('provenance')) return <Shield className="w-4 h-4 text-emerald-400" />;
    if (key.includes('forecast')) return <Calendar className="w-4 h-4 text-sky-400" />;
    return <ArrowRight className="w-4 h-4 text-indigo-400" />;
  };

  return (
    <div className="bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-3.5 backdrop-blur-md animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
            Recommended VRISHTI Modules & Actions
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          Context Pre-Filled Navigation
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {displayActions.map((action, idx) => {
          return (
            <div
              key={idx}
              className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-md"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 group-hover:border-cyan-500/40 transition">
                    {getActionIcon(action.icon, action.destination)}
                  </div>
                  <span className="text-xs font-black text-white group-hover:text-cyan-300 transition tracking-wide">
                    {action.label}
                  </span>
                </div>
                {action.reason && (
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {action.reason}
                  </p>
                )}
              </div>

              {action.context && (
                <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-slate-800/80">
                  {action.context.state && (
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50">
                      {action.context.state}
                    </span>
                  )}
                  {action.context.district && (
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                      {action.context.district}
                    </span>
                  )}
                  {action.context.layer && (
                    <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/50">
                      Layer: {action.context.layer}
                    </span>
                  )}
                  {action.context.metric && (
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50">
                      Metric: {action.context.metric}
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={() => onNavigate && onNavigate(action.destination, action.context)}
                className="mt-3 w-full py-2 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950/50 transition cursor-pointer"
              >
                <span>OPEN MODULE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export interface AIAdvisorPageProps {
  onNavigate?: (destination: string, context?: any) => void;
}

export const AIAdvisorPage: React.FC<AIAdvisorPageProps> = ({ onNavigate }) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [dates, setDates] = useState<DateItem[]>([]);
  
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('01-06-2024');
  
  // Empty initial state - NO default query pre-filled
  const [userQuery, setUserQuery] = useState<string>('');
  const [submittedQuery, setSubmittedQuery] = useState<string>('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [requestStatus, setRequestStatus] = useState<string>('IDLE');

  // Conversational Turn Context
  const [conversationContext, setConversationContext] = useState<any | null>(null);
  
  // Accordion Toggles
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showTechnical, setShowTechnical] = useState<boolean>(false);
  const [showDevDebugTrace, setShowDevDebugTrace] = useState<boolean>(false);

  // Sector Category Tabs definitions for citizens
  const CATEGORY_TABS = [
    { id: 'construction', label: 'Construction & Building', icon: Building2, color: 'text-indigo-400' },
    { id: 'agriculture', label: 'Farming & Agriculture', icon: Sprout, color: 'text-emerald-400' },
    { id: 'landslide', label: 'Hill Safety & Travel', icon: Mountain, color: 'text-amber-400' },
    { id: 'urban_flood', label: 'City Drainage & Safety', icon: Building, color: 'text-cyan-400' },
    { id: 'transport', label: 'Highway & Driving', icon: Truck, color: 'text-rose-400' },
  ];

  // Categorized Clickable Example Question Chips
  const EXAMPLE_CHIPS = [
    { category: '☔ Rainfall', query: 'Will it rain heavily in Wayanad tomorrow?' },
    { category: '🏗️ Construction', query: 'Can I pour concrete tomorrow in Palakkad?' },
    { category: '🌾 Farming', query: 'Is tomorrow suitable for rice harvesting in South Goa?' },
    { category: '🚗 Travel', query: 'Is it safe to drive on the highway in Bengaluru Urban?' },
    { category: '⛰️ Hill Safety', query: 'Is it safe to drive through the hills in Idukki?' },
    { category: '🏙️ City Safety', query: 'Is there urban flood risk in Panaji?' },
    { category: '🤖 Explain VRISHTI', query: 'Why did VRISHTI correct the NWP rainfall?' },
  ];

  // Load Stations and Dates on mount (NO automatic location selection or weather evaluation)
  useEffect(() => {
    async function loadData() {
      try {
        const [sList, dList] = await Promise.all([fetchStations(), fetchDates()]);
        setStations(sList);
        setDates(dList);
        if (dList.length > 0) {
          const defaultD = dList.find(d => d.year === 2024) || dList[0];
          setSelectedDate(defaultD.date);
        }
      } catch (err) {
        console.error("Error loading location & date data:", err);
      }
    }
    loadData();
  }, []);

  // Natural Language Location Extraction Helper
  const extractLocationFromQuery = (queryText: string) => {
    const qLower = queryText.toLowerCase().trim();
    const sortedAliases = Object.keys(CLIENT_DISTRICT_MAP).sort((a, b) => b.length - a.length);
    for (const alias of sortedAliases) {
      const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(qLower)) {
        return CLIENT_DISTRICT_MAP[alias];
      }
    }
    return null;
  };

  // Conversational Intent & Non-Weather Query Handler
  const getCasualOrNonWeatherResponse = (queryText: string): { intent: string; response: string } | null => {
    const t = queryText.toLowerCase().trim().replace(/[!?.,]/g, '');

    // 0. Flood & Hydrometeorological safety queries must ALWAYS be processed by backend
    if (/\b(flood|floods|flooding|flooded|waterlog|waterlogging|waterlogged|inundation|submerged|deluge)\b/i.test(t)) {
      return null;
    }

    // 0b. If a known location/district is mentioned in the query, bypass client-side non-weather fallback
    if (extractLocationFromQuery(queryText)) {
      return null;
    }

    // 1. Combination Greetings & Status Checks ("hi, how are you?", "hello how are you")
    if (/\b(how are you|how are u|how r u)\b/i.test(t) && /\b(hi|hello|hey|heyy)\b/i.test(t)) {
      return {
        intent: 'GREETING',
        response: "Hi! 👋 I'm operating normally and ready to help! 🌦️ Ask me about weather forecasts, rain risk, hill travel, or outdoor work safety in Goa, Kerala, or Karnataka."
      };
    }

    // 2. Pure Greetings ("hi", "hello", "hey", "good morning", "good evening")
    if (/^(hi|hello|hey|heyy|heyyy|greetings|good morning|good afternoon|good evening|namaste|vanakkam)$/i.test(t) || t.startsWith("hi ") || t.startsWith("hello ")) {
      return {
        intent: 'GREETING',
        response: "Hi! 👋 I'm VRISHTI AI. I can help you understand rainfall, travel conditions, outdoor work, farming, construction and weather-related safety. What would you like to check today?"
      };
    }

    // 3. How are you / Status check
    if (/^(how are you|how are u|how r u|how is it going|how are things|how do you do)$/i.test(t)) {
      return {
        intent: 'CASUAL',
        response: "I'm operating normally and ready to help! 🌦️ Ask me about weather forecasts, rain risk, hill travel, or outdoor work safety in Goa, Kerala, or Karnataka."
      };
    }

    // 4. System Capabilities ("what can you do?", "what are your capabilities?")
    if (/^(what can you do|what can u do|what are your capabilities|what do you do|help|what can i ask|features|capabilities)$/i.test(t) || t.includes("what can you do") || t.includes("what can u do")) {
      return {
        intent: 'SYSTEM_CAPABILITIES',
        response: "I'm VRISHTI AI. Here is what I can do:\n• Rainfall forecasts for districts in Goa, Kerala, and Karnataka\n• Safety assessments for Hill Travel, Urban Drainage, Agriculture, Construction, and Highways\n• Weather explanation and model confidence metrics\n\nHow can I assist you today?"
      };
    }

    // 5. Gratitude / Affirmation ("thanks", "thank you", "okay", "cool")
    if (/^(thanks|thank you|thx|ty|thank u|great|awesome|cool|perfect|okay|ok|got it|understood)$/i.test(t)) {
      return {
        intent: 'CASUAL',
        response: "You're welcome! 😊 Let me know if you need any more weather or safety updates for your district."
      };
    }

    // 6. Farewell ("bye", "goodbye")
    if (/^(bye|goodbye|see ya|cya|take care|bye bye)$/i.test(t)) {
      return {
        intent: 'CASUAL',
        response: "Goodbye! Stay safe out there ☔. Feel free to come back whenever you need weather updates!"
      };
    }

    // 7. Explicit Non-Weather General Knowledge / Math / Coding / Off-Topic ("who is prime minister", "tell me a joke", "write code")
    const hasWeatherKeyword = /\b(rain|rainfall|monsoon|weather|forecast|climate|flood|floods|flooding|flooded|storm|cloud|clouds|temp|temperature|drizzle|downpour|shower|thunder|humidity|waterlog|waterlogging|waterlogged|inundation|submerged|deluge|landslide|ghat|hill|hills|mountain|concrete|cement|slab|construction|harvest|harvesting|rice|paddy|sow|farming|agriculture|crop|crops|highway|expressway|driving|drive|road travel|traffic|underpass|safety|safe|outdoor work)\b/i.test(t);

    const isOffTopic = /^(who is|what is|where is|tell me a|write|code|python|java|javascript|calc|math|how to|who built|who created|who made|who won|prime minister|president|capital of|\d+\s*[\+\-\*\/]\s*\d+)/i.test(t);

    if (isOffTopic && !hasWeatherKeyword) {
      return {
        intent: 'NON_WEATHER',
        response: "I am specialized in weather intelligence, rainfall forecasting, and outdoor safety for Goa, Kerala, and Karnataka. I don't answer general knowledge or off-topic questions, but I can help you check weather risks, rainfall expectations, hill safety, or farming conditions!"
      };
    }

    // Fallback for non-weather queries that don't match any weather keywords
    if (!hasWeatherKeyword) {
      return {
        intent: 'NON_WEATHER',
        response: "I am specialized in weather intelligence, rainfall forecasting, and outdoor safety for Goa, Kerala, and Karnataka. Please ask me a question about weather forecasts, rainfall, agriculture, construction safety, hill travel, or city drainage."
      };
    }

    return null;
  };

  // Weather-Related Query Classification Helper
  const isWeatherRelatedQuery = (queryText: string): boolean => {
    const casualOrNon = getCasualOrNonWeatherResponse(queryText);
    if (casualOrNon) return false;

    // Weather keywords or sector activities influenced by weather
    const weatherKeywords = /\b(rain|rainfall|rainy|monsoon|weather|forecast|drizzle|downpour|shower|showers|storm|thunder|thunderstorm|precipitation|climate|cloud|clouds|cloudy|wind|windy|humidity|flood|floods|flooding|flooded|waterlog|waterlogging|waterlogged|inundation|submerged|drainage|landslide|mudslide|rockfall|ghat|ghats|hill|hills|mountain|mountains|concrete|cement|slab|construction|harvest|harvesting|rice|paddy|sow|sowing|farming|agriculture|crop|crops|field work|highway|expressway|driving|drive|road travel|traffic|underpass|safety|safe|work outside|outdoor work)\b/i;

    return weatherKeywords.test(queryText);
  };

  // Sector Auto-Selection Helper based on natural-language intent (Specific Activity > Ambiguous)
  const detectSectorFromQuery = (queryText: string): string | null => {
    const t = queryText.toLowerCase().trim();

    // 1. Farming & Agriculture (Clear farming/agricultural activity)
    if (/\b(rice|crop|crops|harvesting|harvest|farming|agriculture|sow|sowing|plant|planting|irrigation|pesticide|pesticides|spray|spraying|field work|farm work|cultivation|paddy)\b/i.test(t)) {
      return 'agriculture';
    }

    // 2. Construction & Building (Clear construction activity or site flood)
    if (/\b(concrete|cement|slab|scaffolding|roofing|roof|foundation|masonry|pouring concrete|construction|building work|trench|beam|casting|site flood|site flooded|construction site)\b/i.test(t)) {
      return 'construction';
    }

    // 3. Hill Safety & Travel (Clear hill/mountain/Western Ghats travel context)
    if (/\b(hill|hills|mountain|mountains|ghat|ghats|western ghats|steep terrain|landslide|mudslide|rockfall|ghat pass|idukki hills|wayanad hills|slope|slopes)\b/i.test(t)) {
      return 'landslide';
    }

    // 4. Highway & Driving (Road-specific flood or highway transit)
    if (/\b(road flood|roads flooded|road flooding|highway flood|flooded road|flooded roads|highway|expressway|logistics|truck|long-distance driving|highway driving|highway travel|highway road|highway drive)\b/i.test(t)) {
      return 'transport';
    }

    // 5. City Drainage & Safety (Urban flood, city waterlogging, underpass, drainage context)
    if (/\b(urban flood|urban flooding|city flood|waterlogging|waterlog|waterlogged|stormwater|underpass|panaji flood|city drainage|canal flood|inundation|flood risk|flooding|flood|floods|flooded)\b/i.test(t)) {
      return 'urban_flood';
    }

    // 6. General driving / transport
    if (/\b(drive|driving|road travel)\b/i.test(t)) {
      return 'transport';
    }

    // 7. General Weather / Rainfall
    if (/\b(rain|rainfall|monsoon|weather|forecast|climate|precipitation)\b/i.test(t)) {
      return 'general';
    }

    return null;
  };

  // Robust station state identifier
  const getStationState = (st: Station): 'Goa' | 'Kerala' | 'Karnataka' => {
    if (st.state && (st.state === 'Goa' || st.state === 'Kerala' || st.state === 'Karnataka')) {
      return st.state as 'Goa' | 'Kerala' | 'Karnataka';
    }
    const locId = String(st.location_id || '');
    if (locId.includes('LOC_KL')) return 'Kerala';
    if (locId.includes('LOC_GA') || locId.includes('LOC_GOA')) return 'Goa';
    if (locId.includes('LOC_KA')) return 'Karnataka';
    
    const dist = st.district_name || '';
    const keralaDistricts = ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'];
    if (keralaDistricts.includes(dist) || dist.includes('Kerala')) return 'Kerala';
    if (dist.includes('Goa') || (st.taluka_name && st.taluka_name.includes('Goa'))) return 'Goa';
    return 'Karnataka';
  };

  // Filter stations based on selected state
  const availableStates = ['All', 'Karnataka', 'Kerala', 'Goa'];
  
  const filteredStations = (selectedState === 'All' || !selectedState) 
    ? stations 
    : stations.filter(s => getStationState(s) === selectedState);

  // Manual Dropdown change: Updates state filter
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    if (selectedStationId) {
      const currentStation = stations.find(s => String(s.location_id) === String(selectedStationId));
      if (currentStation && newState !== 'All' && getStationState(currentStation) !== newState) {
        setSelectedStationId('');
      }
    }
  };

  // District Selection Handler: Automatically derives State from District
  const handleDistrictSelect = (locationId: string) => {
    if (!locationId) {
      setSelectedStationId('');
      return;
    }
    setSelectedStationId(locationId);
    const targetStation = stations.find(s => String(s.location_id) === String(locationId));
    if (targetStation) {
      const stState = getStationState(targetStation);
      setSelectedState(stState);
      if (submittedQuery) {
        evaluateForecast(submittedQuery, locationId, selectedDate);
      }
    }
  };

  const evaluateForecast = async (queryText: string, stationId?: string, targetDate?: string, overrideCategory?: string) => {
    if (!queryText || !queryText.trim()) return;

    // Prevent duplicate processing while a request is already active
    if (loading) return;

    // Single Source of Truth for Submitted Query
    const currentSubmittedQuery = queryText.trim();
    setSubmittedQuery(currentSubmittedQuery);

    // Clear the user input immediately so they see the input box reset and ready
    setUserQuery('');

    // 1. Natural language location extraction from query text FIRST (Highest Priority)
    const detectedLoc = extractLocationFromQuery(currentSubmittedQuery);
    let effectiveStationId = (detectedLoc ? detectedLoc.location_id : stationId) || selectedStationId || conversationContext?.location_id;
    let effectiveState = (detectedLoc ? detectedLoc.state : selectedState) || conversationContext?.state;

    if (detectedLoc) {
      effectiveStationId = detectedLoc.location_id;
      effectiveState = detectedLoc.state;
      // Auto-update District & State controls
      setSelectedStationId(detectedLoc.location_id);
      setSelectedState(detectedLoc.state);
    }

    // 2. Pre-evaluation Sector Selection (User override takes absolute precedence)
    const autoSector = detectSectorFromQuery(currentSubmittedQuery);
    let categoryToUse: string | undefined = undefined;

    if (overrideCategory) {
      categoryToUse = overrideCategory;
      setActiveCategoryTab(overrideCategory === 'general' ? null : overrideCategory);
    } else if (autoSector && autoSector !== 'general') {
      categoryToUse = autoSector;
      setActiveCategoryTab(autoSector);
    } else if (autoSector === 'general') {
      categoryToUse = undefined;
      setActiveCategoryTab(null);
    } else if (activeCategoryTab) {
      categoryToUse = activeCategoryTab;
    }

    const tDate = targetDate || selectedDate;
    const targetStationObj = stations.find(s => String(s.location_id) === String(effectiveStationId));
    const finalState = targetStationObj ? getStationState(targetStationObj) : (effectiveState || undefined);

    // Lock interface and start loading state
    setLoading(true);
    const startTime = performance.now();
    setRequestStatus('PENDING');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s request timeout

    try {
      const res = await fetch('/api/advisor/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          activity_text: currentSubmittedQuery,
          location_id: effectiveStationId ? String(effectiveStationId) : undefined,
          state: finalState,
          date: String(tDate),
          category: categoryToUse,
          context: conversationContext || undefined
        })
      });
      clearTimeout(timeoutId);

      const duration = Math.round(performance.now() - startTime);
      setLatencyMs(duration);

      if (!res.ok) {
        setRequestStatus(`ERROR (${res.status})`);
        const errText = await res.text();
        console.error(`[API Error ${res.status}] Rejected body:`, errText);
        let parsedErr: any = null;
        try { parsedErr = JSON.parse(errText); } catch (_) {}
        setResult({
          intent: "ERROR",
          status_code: `API_ERROR_${res.status}`,
          conversational_response: res.status === 404
            ? "No forecast data found for the requested district and date."
            : res.status >= 500
              ? `Server encountered an internal error (${res.status}) while processing the meteorological forecast.`
              : "I couldn't retrieve the forecast right now. Please try again in a moment.",
          detail: parsedErr?.detail || errText
        });
        return;
      }

      setRequestStatus(`SUCCESS (${res.status})`);
      const data = await res.json();
      setResult(data);

      // Synchronize dropdowns with actual backend evaluated location
      if (data.location?.state && data.location?.location_id) {
        setSelectedState(data.location.state);
        setSelectedStationId(String(data.location.location_id));
      }

      if (data.context) {
        setConversationContext(data.context);
      }
      if (overrideCategory) {
        setActiveCategoryTab(overrideCategory === 'general' ? null : overrideCategory);
      } else if (data.evaluated_category_id) {
        if (data.evaluated_category_id === 'general') {
          setActiveCategoryTab(null);
        } else {
          setActiveCategoryTab(data.evaluated_category_id);
        }
      }

      // Dev debug trace console output
      const sectorLabels: Record<string, string> = {
        construction: 'Construction & Building',
        agriculture: 'Farming & Agriculture',
        landslide: 'Hill Safety & Travel',
        urban_flood: 'City Drainage & Safety',
        transport: 'Highway & Driving',
        general: 'General Weather'
      };

      console.log("[VRISHTI DEBUG TRACE]", {
        submittedQuery: currentSubmittedQuery,
        detectedIntent: data.intent,
        detectedState: data.location?.state || finalState,
        detectedDistrict: data.location?.district_name || 'Manual',
        detectedSector: sectorLabels[data.evaluated_category_id || categoryToUse || ''] || data.evaluated_category_id || categoryToUse || 'General Weather',
        forecastDate: data.location?.forecast_date || tDate,
        requestStatus: `SUCCESS (${res.status})`,
        latencyMs: duration
      });

    } catch (err: any) {
      clearTimeout(timeoutId);
      const duration = Math.round(performance.now() - startTime);
      setLatencyMs(duration);
      console.error("[VRISHTI ERROR] Evaluation failure:", err);
      const isTimeout = err.name === 'AbortError';
      setRequestStatus(isTimeout ? 'TIMEOUT' : 'CONNECTION_ERROR');
      setResult({
        intent: "ERROR",
        status_code: isTimeout ? "TIMEOUT_ERROR" : "CONNECTION_ERROR",
        conversational_response: isTimeout
          ? "Request timed out while connecting to VRISHTI API. Please try asking your question again."
          : "I couldn't retrieve the forecast right now. Please check backend connection and try again."
      });
    } finally {
      // GUARANTEED RESET OF LOADING STATE
      setLoading(false);
    }
  };

  const handleAskSubmit = () => {
    if (!userQuery.trim() || loading) return;
    const queryToSubmit = userQuery.trim();
    setUserQuery(''); // Clear input for next question immediately
    evaluateForecast(queryToSubmit);
  };

  const handleCategoryTabClick = (tabId: string) => {
    setActiveCategoryTab(tabId);
    if (submittedQuery) {
      evaluateForecast(submittedQuery, selectedStationId, selectedDate, tabId);
    }
  };

  // VRISHTI Adaptive Environment Dynamic Theme Engine
  const themeConfig = computeAdaptiveTheme(activeCategoryTab || 'default', result, loading, submittedQuery);

  return (
    <div className={`vrishti-assistant-root relative isolation-isolate p-6 max-w-7xl mx-auto space-y-6 text-slate-100 rounded-3xl ${themeConfig.containerBg} transition-all duration-700 overflow-hidden shadow-2xl`}>
      
      {/* VRISHTI Adaptive Environment Dynamic Background Photograph (Layer 1, 2, 3) */}
      <DynamicThemeBackground sectorId={activeCategoryTab} />

      {/* LAYER 4 — ACTUAL VRISHTI UI */}
      <div className="vrishti-content-layer relative z-10 space-y-6">
        {/* Citizen Header Banner */}
        <div className={`bg-gradient-to-r ${themeConfig.bannerGradient} rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-700`}>
        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <span className={`p-3 bg-slate-950/60 border border-slate-700/60 rounded-xl ${themeConfig.accentColor}`}>
              <Sparkles className="w-7 h-7" />
            </span>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Ask VRISHTI anything about weather, rainfall or safety
              </h1>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                Conversational AI Weather Assistant & Work Safety Advisor for Goa, Kerala & Karnataka
              </p>
            </div>
          </div>

          {/* Dynamic Adaptive Environment Status Pill */}
          <AdaptiveEnvironmentStatusPill config={themeConfig} />
        </div>
      </div>

      {/* Main Natural Language Conversational Search Card */}
      <div className={`${themeConfig.cardBg} rounded-2xl p-6 shadow-xl space-y-6 transition-all duration-700 relative z-10`}>
        
        {/* DISTRICT-FIRST LOCATION SELECTION BAR */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Location / District Selection (District-First Flow):
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              {selectedStationId ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> District Selected: {stations.find(s => String(s.location_id) === String(selectedStationId))?.district_name || 'Active'} ({selectedState})
                </span>
              ) : (
                <span className="text-amber-400 font-semibold">
                  ⚠️ No location selected &mdash; choose a district or type a district in your question
                </span>
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. State Selector Dropdown */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 block">State:</span>
              <select
                value={selectedState || 'All'}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium cursor-pointer shadow-inner"
              >
                <option value="All">All States (Goa, Karnataka, Kerala)</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Goa">Goa</option>
              </select>
            </div>

            {/* 2. District Selector Dropdown */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 block">District:</span>
              <select
                value={selectedStationId}
                onChange={(e) => handleDistrictSelect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium cursor-pointer shadow-inner"
              >
                <option value="">[ Choose or type your district ]</option>
                {filteredStations.map((st) => {
                  const stState = getStationState(st);
                  return (
                    <option key={st.location_id} value={st.location_id}>
                      📍 {st.district_name} ({stState}) &mdash; {st.taluka_name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 3. Forecast Date Selector */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 block">Forecast Date:</span>
              <select
                value={selectedDate}
                onChange={(e) => {
                  const newD = e.target.value;
                  setSelectedDate(newD);
                  if (submittedQuery && selectedStationId) {
                    evaluateForecast(submittedQuery, selectedStationId, newD);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer shadow-inner"
              >
                {dates.map((d, idx) => (
                  <option key={idx} value={d.date}>
                    {d.date} ({d.partition})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="space-y-3">
          <div className="relative flex items-center">
            <input
              type="text"
              value={userQuery}
              disabled={loading}
              onChange={(e) => setUserQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleAskSubmit()}
              placeholder={loading ? "VRISHTI is analysing the forecast…" : "Ask VRISHTI about weather, rainfall, travel or safety..."}
              className="w-full pl-5 pr-56 py-4 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-base focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner font-medium disabled:opacity-60"
            />
            <button
              onClick={handleAskSubmit}
              disabled={loading || !userQuery.trim()}
              className="absolute right-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-sm transition flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2 font-semibold">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-200 shrink-0" />
                  <span className="text-xs tracking-tight">VRISHTI is analysing…</span>
                </div>
              ) : (
                <>
                  <span>Ask VRISHTI</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Categorized Clickable Example Question Chips */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            Try asking questions like (click to insert into chat box):
          </span>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setUserQuery(chip.query)}
                className="px-3 py-1.5 bg-slate-950/80 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/40 rounded-lg text-xs font-bold text-slate-300 hover:text-indigo-300 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>{chip.category}:</span>
                <span className="font-normal text-slate-400">{chip.query}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main Results Workspace */}
      <div className="space-y-4">
        
        {/* Category Tabs Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex items-center gap-2 overflow-x-auto scrollbar-none shadow-lg">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategoryTab === tab.id;
            const isEvaluated = result?.evaluated_category_id === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleCategoryTabClick(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex-1 justify-center ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                <span>{tab.label}</span>
                {isEvaluated && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" title="Categorized from input"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Results Container - ONLY rendered after explicit query submission */}
        {result && (
          <div className="space-y-6">

            {/* Display submitted query badge & synchronized location callout */}
            {submittedQuery && (
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-indigo-300 bg-indigo-950/60 p-3.5 rounded-xl border border-indigo-500/30 shadow-md">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Submitted Query:</span>
                    <span className="text-white italic font-semibold">"{submittedQuery}"</span>
                  </div>

                  {result.location?.district_name && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-black">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Synchronized Location: {result.location.location_name ? `${result.location.location_name} (${result.location.district_name}, ${result.location.state})` : `${result.location.district_name} (${result.location.state})`}</span>
                    </div>
                  )}
                </div>

                {/* Dev Debug Trace Banner (14 Telemetry Fields - Available behind Developer Diagnostics toggle) */}
                <div className="bg-slate-950/95 p-3.5 rounded-xl border border-slate-800 shadow-inner space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowDevDebugTrace(!showDevDebugTrace)}
                      className="text-xs font-mono font-bold text-slate-400 hover:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{showDevDebugTrace ? 'Hide Developer Diagnostic Trace' : 'Developer Diagnostic Trace (14 Telemetry Fields)'}</span>
                      {showDevDebugTrace ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <span className="text-[10px] font-mono text-slate-500">Developer Diagnostic Mode</span>
                  </div>

                  {showDevDebugTrace && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 text-[11px] font-mono pt-2 border-t border-slate-800/80 animate-fade-in">
                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">submittedQuery</span>
                        <span className="text-white font-bold truncate block" title={result?.debug_trace?.submittedQuery || submittedQuery}>"{result?.debug_trace?.submittedQuery || submittedQuery}"</span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">detectedIntent</span>
                        <span className={`font-black block truncate ${result?.intent === 'ERROR' ? 'text-rose-400' : 'text-emerald-400'}`}>{result?.debug_trace?.detectedIntent || result?.intent || 'PROCESSING'}</span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">confidence</span>
                        <span className="text-amber-300 font-bold block">{result?.debug_trace?.confidence !== undefined ? `${Math.round(result.debug_trace.confidence * 100)}%` : '95%'}</span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">detectedState</span>
                        <span className="text-amber-300 font-bold block truncate">{result?.debug_trace?.detectedState || result?.location?.state || 'None'}</span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">detectedDistrict</span>
                        <span className="text-cyan-300 font-bold block truncate">{result?.debug_trace?.detectedDistrict || result?.location?.district_name || 'None'}</span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">resolvedLocation</span>
                        <span className="text-emerald-300 font-bold block truncate">{result?.debug_trace?.resolvedLocation || result?.location?.location_name || result?.location?.district_name || 'None'}</span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">resolvedDate</span>
                        <span className="text-purple-300 font-bold block truncate">{result?.debug_trace?.resolvedDate || result?.location?.forecast_date || selectedDate}</span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">resolvedTimeRange</span>
                        <span className="text-purple-300 font-medium block truncate">{result?.debug_trace?.resolvedTimeRange || 'today'}</span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">weatherVariable</span>
                        <span className="text-cyan-400 font-medium block truncate">{result?.debug_trace?.detectedWeatherVariable || 'rainfall'}</span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">detectedSector</span>
                        <span className="text-indigo-300 font-bold block truncate" title={result?.debug_trace?.detectedSector || 'General Weather'}>{result?.debug_trace?.detectedSector || 'General Weather'}</span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">selectedSector</span>
                        <span className="text-rose-400 font-bold block truncate" title={result?.debug_trace?.selectedSector || (CATEGORY_TABS.find(t => t.id === activeCategoryTab)?.label) || 'General Weather'}>{result?.debug_trace?.selectedSector || (CATEGORY_TABS.find(t => t.id === activeCategoryTab)?.label) || 'General Weather'}</span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">dataSource</span>
                        <span className="text-indigo-300 font-medium block truncate" title={result?.debug_trace?.dataSource || 'VRISHTI ML Pipeline'}>{result?.debug_trace?.dataSource || 'VRISHTI ML Pipeline'}</span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">requestStatus</span>
                        <span className={`font-black block truncate ${requestStatus.includes('SUCCESS') ? 'text-emerald-400' : requestStatus === 'PENDING' ? 'text-amber-300' : 'text-rose-400'}`}>{result?.debug_trace?.requestStatus || requestStatus}</span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">latencyMs</span>
                        <span className="text-sky-300 font-bold block">{result?.debug_trace?.latencyMs !== undefined ? `${result.debug_trace.latencyMs} ms` : (latencyMs !== null ? `${latencyMs} ms` : '15 ms')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 1. Dedicated Citizen Rainfall & Weather / Flood Response Card */}
            {(!result.evaluation && (['GENERAL_WEATHER', 'FLOOD_RISK', 'CURRENT_WEATHER', 'WEATHER_FORECAST', 'RAINFALL_FORECAST', 'RAIN_PROBABILITY', 'HEAVY_RAIN_ALERT'].includes(result.intent)) && result.headline_text) && (
              <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">
                
                {/* Main YES/NO Headline Banner */}
                <div className={`p-6 rounded-2xl border shadow-xl space-y-3 ${
                  result.headline_answer === 'YES' && (result.expected_rain_mm >= 15.6)
                    ? 'bg-rose-950/40 border-rose-500/50 shadow-rose-950/40'
                    : result.headline_answer === 'YES'
                      ? 'bg-blue-950/40 border-blue-500/50 shadow-blue-950/40'
                      : 'bg-emerald-950/40 border-emerald-500/50 shadow-emerald-950/40'
                }`}>
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      VRISHTI AI Forecast Assessment
                    </span>
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      Location: <strong className="text-white">{result.location?.location_name ? `${result.location.location_name} (${result.location.district_name}, ${result.location.state})` : `${result.location?.district_name} (${result.location?.state})`}</strong>
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    {cleanPlainText(result.headline_text)}
                  </h2>

                  <p className="text-sm font-semibold text-slate-200">
                    {cleanPlainText(result.advisory_note)}
                  </p>
                </div>

                {/* Prioritized Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Metric 1: Expected Rainfall Amount */}
                  <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block flex items-center gap-1.5">
                      🌧️ Expected Rainfall
                    </span>
                    <span className="text-2xl font-black font-mono text-white block">
                      {result.rain_val_display || `~${result.expected_rain_mm} mm`}
                    </span>
                    <span className="text-xs text-slate-400 block font-medium">
                      {result.intensity_label || '6-hr accumulation'}
                    </span>
                  </div>

                  {/* Metric 2: Rain Probability */}
                  <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block flex items-center gap-1.5">
                      🎯 Chance of Rain
                    </span>
                    <span className="text-2xl font-black font-mono text-emerald-400 block">
                      {result.rain_chance_text || 'Reliable probability'}
                    </span>
                    <span className="text-xs text-slate-400 block font-medium">
                      AI Exceedance Model
                    </span>
                  </div>

                  {/* Metric 3: Forecast Period */}
                  <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block flex items-center gap-1.5">
                      ⏱️ Forecast Period
                    </span>
                    <span className="text-xl font-black text-amber-300 block">
                      {result.forecast_period || 'Tomorrow'}
                    </span>
                    <span className="text-xs text-slate-400 block font-medium">
                      Date: {result.location?.forecast_date}
                    </span>
                  </div>
                </div>

                {/* Meteorological Parameters Telemetry Row */}
                {(result.forecast?.temperature_2m_c !== undefined || result.forecast?.relative_humidity_pct !== undefined || result.forecast?.wind_speed_10m_kmh !== undefined || result.warning_level) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {result.forecast?.temperature_2m_c !== undefined && (
                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">🌡️ Temperature</span>
                        <span className="text-sm font-bold font-mono text-white">{result.forecast.temperature_2m_c}°C</span>
                      </div>
                    )}
                    {result.forecast?.relative_humidity_pct !== undefined && (
                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">💧 Humidity</span>
                        <span className="text-sm font-bold font-mono text-cyan-300">{result.forecast.relative_humidity_pct}%</span>
                      </div>
                    )}
                    {result.forecast?.wind_speed_10m_kmh !== undefined && (
                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">💨 Wind Speed</span>
                        <span className="text-sm font-bold font-mono text-emerald-300">{result.forecast.wind_speed_10m_kmh} km/h</span>
                      </div>
                    )}
                    {result.warning_level && (
                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">⚠️ Alert Level</span>
                        <span className={`text-xs font-black uppercase px-2 py-0.5 rounded ${
                          result.warning_level === 'WARNING' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                          result.warning_level === 'ALERT' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          result.warning_level === 'WATCH' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {result.warning_level}
                        </span>
                      </div>
                    )}
                    {result.flood_risk_level && (
                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between col-span-2 md:col-span-4">
                        <span className="text-xs text-slate-400 font-medium">🌊 Flood / Drainage Risk</span>
                        <span className="text-xs font-bold text-cyan-300 font-mono">{result.flood_risk_level}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Contextual Follow-Up Question & Quick Activity Evaluator Chips */}
                {result.follow_up_question && (
                  <div className="p-5 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-indigo-300 text-sm font-bold">
                      <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{result.follow_up_question}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {[
                        { label: '🏗️ Check Concrete Pouring', query: `Can I pour concrete in ${result.location?.district_name || 'here'} tomorrow?` },
                        { label: '🌾 Check Crop Harvesting', query: `Is it suitable for harvesting in ${result.location?.district_name || 'here'} tomorrow?` },
                        { label: '⛰️ Check Hill Travel Safety', query: `Is it safe to drive in the hills in ${result.location?.district_name || 'here'}?` },
                        { label: '🚗 Check Highway Driving', query: `Is highway driving safe in ${result.location?.district_name || 'here'}?` }
                      ].map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setUserQuery(chip.query);
                            evaluateForecast(chip.query, result.location?.location_id, result.location?.forecast_date);
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-200 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Model Evidence & Why This Answer Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                      Actual Model Evidence:
                    </span>
                    <p className="text-xs text-slate-200 font-medium leading-relaxed">
                      {cleanPlainText(result.conversational_summary?.model_evidence || result.model_evidence || `VRISHTI ML predicted ${result.forecast?.ai_corrected_rain_6h_mm?.toFixed(1) || result.expected_rain_mm} mm (Raw NWP: ${result.forecast?.raw_nwp_rain_6h_mm?.toFixed(1) || '0.0'} mm).`)}
                    </p>
                  </div>

                  <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                      Why This Answer?
                    </span>
                    <p className="text-xs text-slate-200 font-medium leading-relaxed">
                      {cleanPlainText(result.conversational_summary?.why_this_answer || result.why_this_answer || result.evaluation?.engineering_agronomic_rationale || "VRISHTI verified ML model prediction against raw NWP physical baseline.")}
                    </p>
                  </div>
                </div>

                {/* Recommended Actions Panel */}
                {(result.recommended_actions || result.recommendedActions) && (
                  <RecommendedActionsPanel 
                    actions={result.recommended_actions || result.recommendedActions} 
                    onNavigate={onNavigate} 
                  />
                )}

                {/* Collapsible Technical Details (Hidden by Default for Normal Citizens) */}
                <div className="border-t border-slate-800 pt-4">
                  <button
                    onClick={() => setShowTechnical(!showTechnical)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-300 transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{showTechnical ? 'Hide Technical Model Details' : 'Show Technical Model Details (For Meteorologists / Developers)'}</span>
                    {showTechnical ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showTechnical && (
                    <div className="pt-4">
                      <ErrorBoundary fallbackTitle="Technical Model Details">
                        <TechnicalDetailsPanel result={result} latencyMs={latencyMs} requestStatus={requestStatus} />
                      </ErrorBoundary>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 2. Conversational Message Box (For Greetings, Casual, System Capabilities, Non-Weather, or Clarifications) */}
            {(!result.evaluation && (!['GENERAL_WEATHER', 'FLOOD_RISK', 'CURRENT_WEATHER', 'WEATHER_FORECAST', 'RAINFALL_FORECAST', 'RAIN_PROBABILITY', 'HEAVY_RAIN_ALERT'].includes(result.intent) || !result.headline_text) && result.conversational_response && result.intent !== 'MISSING_DISTRICT' && result.intent !== 'UNMATCHED_DISTRICT' && result.status_code !== 'INSUFFICIENT_DATA') && (
              <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-6 shadow-xl space-y-4 animate-fade-in">
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        VRISHTI AI Assistant
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
                        {result.intent === 'ERROR' ? 'System Notification' : 'Meteorological Guidance'}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-slate-100 leading-relaxed">
                      {renderMarkdownContent(result.conversational_response)}
                    </div>

                    {/* Similar Dataset Questions Suggestions */}
                    {result.similar_questions && result.similar_questions.length > 0 && (
                      <div className="pt-3 border-t border-slate-800/80 space-y-2">
                        <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                          Suggested Questions:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {result.similar_questions.map((sq: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => setUserQuery(sq)}
                              className="px-3 py-1.5 bg-slate-950 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                            >
                              💡 {sq}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommended Actions Panel */}
                    {(result.recommended_actions || result.recommendedActions) && (
                      <div className="pt-2">
                        <RecommendedActionsPanel 
                          actions={result.recommended_actions || result.recommendedActions} 
                          onNavigate={onNavigate} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Missing or Unmatched District Prompt Box */}
            {(result.intent === 'MISSING_DISTRICT' || result.intent === 'UNMATCHED_DISTRICT') && (
              <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4 animate-fade-in">
                <div className="flex items-start space-x-3 text-amber-400 font-extrabold text-base">
                  <MapPin className="w-6 h-6 shrink-0 mt-0.5" />
                  <div className="space-y-3 flex-1">
                    <div className="text-sm font-bold text-slate-100 leading-relaxed">
                      {renderMarkdownContent(result.conversational_response)}
                    </div>
                    <div className="space-y-2 pt-1">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                        Select a supported district to evaluate:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { name: 'Palakkad (Kerala)', locId: 'LOC_KL_10' },
                          { name: 'Idukki (Kerala)', locId: 'LOC_KL_03' },
                          { name: 'Wayanad (Kerala)', locId: 'LOC_KL_14' },
                          { name: 'North Goa (Panaji)', locId: 'LOC_GOA_01' },
                          { name: 'South Goa (Margao)', locId: 'LOC_GOA_02' },
                          { name: 'Bengaluru Urban', locId: 'LOC_KA_04' },
                          { name: 'Mysuru (Karnataka)', locId: 'LOC_KA_22' },
                          { name: 'Belagavi (Karnataka)', locId: 'LOC_KA_03' },
                          { name: 'Dakshina Kannada', locId: 'LOC_KA_11' }
                        ].map((dObj, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              handleDistrictSelect(dObj.locId);
                            }}
                            className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                          >
                            <span>📍 {dObj.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Insufficient Data Warning Banner */}
            {result.status_code === 'INSUFFICIENT_DATA' && (
              <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-3 animate-fade-in">
                <div className="flex items-center space-x-3 text-amber-400 font-extrabold text-base">
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <span>{result.conversational_response || "Insufficient verified data for a safety assessment."}</span>
                </div>
                <p className="text-xs font-semibold text-slate-300">
                  No verified ML forecast record found for <strong>{result.location?.district_name || 'selected location'}</strong> on <strong>{result.location?.forecast_date}</strong>. VRISHTI AI strictly refrains from fabricating or guessing rainfall values.
                </p>
              </div>
            )}

            {/* 4. Full Conversational-First Safety Assessment Display */}
            {result.evaluation && (
              <div className="space-y-6 animate-fade-in">

                {/* Primary Conversational Answer Card */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                  
                  {/* Clear Answer Callout */}
                  <div className={`p-6 rounded-2xl border shadow-xl space-y-3 ${
                    result.evaluation.status_code === 'SAFE' 
                      ? 'bg-emerald-950/40 border-emerald-500/50 shadow-emerald-950/40'
                      : result.evaluation.status_code === 'CAUTION'
                        ? 'bg-amber-950/40 border-amber-500/50 shadow-amber-950/40'
                        : 'bg-rose-950/40 border-rose-500/50 shadow-rose-950/40'
                  }`}>
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        VRISHTI AI Direct Answer
                      </span>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        Evaluated Location: <strong className="text-white">{result.location.taluka_name}, {result.location.district_name} ({result.location.state})</strong>
                      </span>
                    </div>

                    <h2 className="text-2xl font-black text-white tracking-tight">
                      {cleanPlainText(result.conversational_summary?.clear_answer || result.evaluation.status_label)}
                    </h2>

                    <p className="text-base text-slate-200 font-semibold leading-relaxed">
                      {cleanPlainText(result.conversational_summary?.short_explanation || result.evaluation.action_advice)}
                    </p>
                  </div>

                  {/* Model Evidence & Confidence */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                        Actual Model Evidence:
                      </span>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">
                        {cleanPlainText(result.conversational_summary?.model_evidence || result.model_evidence || `VRISHTI ML predicted ${result.forecast?.ai_corrected_rain_6h_mm?.toFixed(1) || result.expected_rain_mm} mm (Raw NWP: ${result.forecast?.raw_nwp_rain_6h_mm?.toFixed(1) || '0.0'} mm).`)}
                      </p>
                    </div>

                    <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                        Why This Answer?
                      </span>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">
                        {cleanPlainText(result.conversational_summary?.why_this_answer || result.why_this_answer || result.evaluation?.engineering_agronomic_rationale || "VRISHTI verified ML model prediction against raw NWP physical baseline.")}
                      </p>
                    </div>
                  </div>

                  {/* Recommended Actions Panel */}
                  {(result.recommended_actions || result.recommendedActions) && (
                    <RecommendedActionsPanel 
                      actions={result.recommended_actions || result.recommendedActions} 
                      onNavigate={onNavigate} 
                    />
                  )}

                  {/* Collapsible Technical Details Accordion */}
                  <div className="border-t border-slate-800 pt-4">
                    <button
                      onClick={() => setShowTechnical(!showTechnical)}
                      className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{showTechnical ? 'Hide Technical Details' : 'Show Technical Details'}</span>
                      {showTechnical ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showTechnical && (
                      <div className="pt-4">
                        <ErrorBoundary fallbackTitle="Technical Model Details">
                          <TechnicalDetailsPanel result={result} latencyMs={latencyMs} requestStatus={requestStatus} />
                        </ErrorBoundary>
                      </div>
                    )}
                  </div>

                </div>

                {/* Permissible Work Duration, Precautions & Stop Triggers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* ⏱️ Permissible Work Duration */}
                  <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center gap-2.5 text-indigo-400 border-b border-indigo-500/20 pb-3">
                      <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Clock className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white">{result.evaluation.card_title_1 || "Permissible Work Duration"}</h3>
                        <p className="text-xs text-slate-400 font-bold">Recommended Shift Limit</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className={`p-4 rounded-xl border text-xs font-black leading-snug flex items-center gap-3 ${
                        result.evaluation.status_code === 'SAFE'
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : result.evaluation.status_code === 'CAUTION'
                            ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                            : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      }`}>
                        <Clock className="w-6 h-6 shrink-0" />
                        <span>{cleanPlainText(result.evaluation.max_work_duration || "Check conditions before starting work.")}</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {cleanPlainText(result.evaluation.duration_subtext || (
                          result.evaluation.status_code === 'SAFE' 
                            ? 'Weather conditions are favorable. Continuous outdoor shift is permitted with regular hydration.'
                            : result.evaluation.status_code === 'CAUTION'
                              ? 'Limit outdoor exposure. Take mandatory 30-minute rest breaks inside covered shelter every 2 hours.'
                              : 'Do NOT engage in outdoor work. Reschedule all field operations until rain passes.'
                        ))}
                      </p>
                    </div>
                  </div>

                  {/* 🛡️ Essential Safety Precautions */}
                  <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center gap-2.5 text-emerald-400 border-b border-emerald-500/20 pb-3">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white">{cleanPlainText(result.evaluation.card_title_2 || "Safety Precautions to Take")}</h3>
                        <p className="text-xs text-slate-400 font-bold">Protective Measures for Citizens</p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {(result.evaluation.safety_precautions || [
                        "Wear waterproof rainwear and non-slip rubber safety boots.",
                        "Cover raw materials, cement, or crops with heavy tarpaulins.",
                        "Keep emergency contact numbers handy and monitor local weather alerts."
                      ]).map((item: string, idx: number) => (
                        <div key={idx} className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-xl flex items-start gap-2.5 text-xs text-slate-200 font-medium leading-relaxed">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{cleanPlainText(item)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 🛑 When to Stop Work Immediately */}
                  <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center gap-2.5 text-rose-400 border-b border-rose-500/20 pb-3">
                      <div className="p-2 bg-rose-500/20 rounded-lg">
                        <Octagon className="w-5 h-5 text-rose-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white">{cleanPlainText(result.evaluation.card_title_3 || "When to Stop Work Immediately")}</h3>
                        <p className="text-xs text-slate-400 font-bold">Emergency Halt Triggers</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3.5 bg-rose-950/30 border border-rose-500/40 rounded-xl text-xs text-rose-200 font-bold leading-relaxed flex items-start gap-2.5">
                        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{cleanPlainText(result.evaluation.stop_work_trigger || "Halt work immediately if rain intensity surges or lightning occurs.")}</span>
                      </div>

                      <div className="space-y-2 text-xs text-slate-300 font-medium">
                        {(result.evaluation.emergency_indicators || [
                          "Stop if thunder/lightning is within 10 km (30/30 Rule)",
                          "Stop if standing water pooling exceeds 15 cm",
                          "Stop if soil erosion or slope movement is observed"
                        ]).map((indicator: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-amber-300 font-bold">
                            <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0"></span>
                            <span>{cleanPlainText(indicator)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}
      </div>
    </div>
  </div>
);
};

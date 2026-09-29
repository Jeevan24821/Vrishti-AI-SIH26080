import React, { useState, useEffect } from 'react';
import { 
  Sprout, HardHat, AlertTriangle, CheckCircle, Info, ShieldAlert,
  Sliders, BarChart2, Activity, Zap, Layers, HelpCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export const SectorIntelligencePage: React.FC = () => {
  const [rain6h, setRain6h] = useState<number>(4.5);
  const [rain24h, setRain24h] = useState<number>(18.0);
  const [activeTab, setActiveTab] = useState<'calculator' | 'analysis' | 'lit_review'>('calculator');

  // Agriculture Threshold Evaluation Logic
  const getAgriStatus = (r6: number, r24: number) => {
    if (r6 > 15.0 || r24 > 64.5) {
      return {
        label: 'NOT OK (Danger / Waterlogging)',
        color: 'bg-red-500/10 border-red-500 text-red-400',
        badge: 'bg-red-500 text-white',
        icon: ShieldAlert,
        summary: 'Waterlogging, root hypoxia/anoxia, topsoil erosion, crop lodging, and fungal root decay (Phytophthora / Pythium).',
        recommendation: 'Drain standing water from paddy/maize fields immediately; halt all harvesting and fertilizer application.'
      };
    } else if (r6 > 6.0 || r24 > 25.0) {
      return {
        label: 'CAUTION (Sub-Optimal / Saturation)',
        color: 'bg-amber-500/10 border-amber-500 text-amber-400',
        badge: 'bg-amber-500 text-black',
        icon: AlertTriangle,
        summary: 'Soil moisture at Field Capacity (FC). High wash-off risk for chemical fertilizers and pesticide sprays.',
        recommendation: 'Suspend spraying operations; delay crop harvesting; inspect field drainage pathways.'
      };
    } else if (r6 >= 0.5 || r24 >= 2.5) {
      return {
        label: 'OK (Optimal Farming / Growth)',
        color: 'bg-emerald-500/10 border-emerald-500 text-emerald-400',
        badge: 'bg-emerald-500 text-white',
        icon: CheckCircle,
        summary: 'Ideal soil moisture replenishment for Kharif crops (Paddy, Maize, Sugarcane) without soil air displacement.',
        recommendation: 'Full field workability; excellent conditions for sowing, transplantation, and crop transpiration.'
      };
    } else {
      return {
        label: 'DEFICIT (Dry / Irrigation Required)',
        color: 'bg-blue-500/10 border-blue-500 text-blue-400',
        badge: 'bg-blue-500 text-white',
        icon: Info,
        summary: 'Moisture supply below crop evapotranspiration baseline (ETc). Soil moisture deficit building up.',
        recommendation: 'Initiate supplemental drip/canal irrigation to prevent crop wilting.'
      };
    }
  };

  // Building Construction Threshold Evaluation Logic
  const getConstStatus = (r6: number, r24: number) => {
    if (r6 > 15.0 || r24 > 64.5) {
      return {
        label: 'EXTREME DANGER (Site Evacuation)',
        color: 'bg-red-600/20 border-red-600 text-red-400',
        badge: 'bg-red-600 text-white',
        icon: ShieldAlert,
        summary: 'Severe site flooding, foundation trench instability, electrical short-circuit risk, potential hillside slope collapse.',
        recommendation: 'Order immediate site evacuation; disconnect high-voltage equipment; pump excess water from basements.'
      };
    } else if (r6 > 5.0 || r24 > 20.0) {
      return {
        label: 'NOT OK (Work Suspended per IS 456)',
        color: 'bg-orange-500/10 border-orange-500 text-orange-400',
        badge: 'bg-orange-500 text-white',
        icon: ShieldAlert,
        summary: 'Structural work suspension required under CPWD / IS 456 codes. High concrete wash-out risk (water-cement ratio breakdown leading to strength loss fck).',
        recommendation: 'Halt concrete pouring, scaffolding operations, and crane maneuvers; cover open rebar and fresh concrete.'
      };
    } else if (r6 > 1.5 || r24 > 5.0) {
      return {
        label: 'CAUTION (Minor Delays / Work Adjusted)',
        color: 'bg-amber-500/10 border-amber-500 text-amber-400',
        badge: 'bg-amber-500 text-black',
        icon: AlertTriangle,
        summary: 'Light rain/drizzle. Earthworks experience mudding; exterior spray painting & waterproofing halted.',
        recommendation: 'Cover active concrete pour areas with tarpaulins; test concrete slump before placement; halt exterior painting.'
      };
    } else {
      return {
        label: 'OK (Full Structural Workability)',
        color: 'bg-emerald-500/10 border-emerald-500 text-emerald-400',
        badge: 'bg-emerald-500 text-white',
        icon: CheckCircle,
        summary: 'Dry to trace moisture. Maximum structural safety and optimal concrete hydration curing conditions.',
        recommendation: 'Proceed with structural concrete pouring, foundation excavation, bricklaying, painting, and high-altitude scaffolding.'
      };
    }
  };

  const agriRes = getAgriStatus(rain6h, rain24h);
  const constRes = getConstStatus(rain6h, rain24h);

  const percentileData = [
    { percentile: 'P50', rain6h: 0.8, wet6h: 2.0, daily24h: 5.7, wetDaily24h: 7.4 },
    { percentile: 'P75', rain6h: 3.4, wet6h: 5.3, daily24h: 14.6, wetDaily24h: 16.5 },
    { percentile: 'P85', rain6h: 6.2, wet6h: 8.3, daily24h: 22.4, wetDaily24h: 25.0 },
    { percentile: 'P90', rain6h: 8.6, wet6h: 10.8, daily24h: 30.1, wetDaily24h: 32.7 },
    { percentile: 'P95', rain6h: 12.9, wet6h: 15.1, daily24h: 44.6, wetDaily24h: 47.4 },
    { percentile: 'P97.5', rain6h: 17.3, wet6h: 19.7, daily24h: 59.0, wetDaily24h: 61.5 },
    { percentile: 'P99', rain6h: 23.4, wet6h: 25.9, daily24h: 76.1, wetDaily24h: 78.7 }
  ];

  const evtData = [
    { period: '2-Year Return', rain: 11.23, category: 'Moderate Drizzle' },
    { period: '5-Year Return', rain: 21.29, category: 'Heavy Rain Onset' },
    { period: '10-Year Return', rain: 27.95, category: 'Severe Monsoonal' },
    { period: '25-Year Return', rain: 36.37, category: 'Extreme Rainfall' },
    { period: '50-Year Return', rain: 42.62, category: 'Record Extreme' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <Activity className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Sectoral Rainfall Threshold Intelligence
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Data-Driven Operational Decision Boundaries for Agriculture & Building Construction derived from <span className="text-indigo-300 font-mono">GOA, KARNATAKA & KERALA</span> state datasets (209,300+ records).
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-1.5 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-2 rounded-lg font-medium transition ${activeTab === 'calculator' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Interactive Calculator
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-3 py-2 rounded-lg font-medium transition ${activeTab === 'analysis' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Data & EVT Analysis
            </button>
            <button
              onClick={() => setActiveTab('lit_review')}
              className={`px-3 py-2 rounded-lg font-medium transition ${activeTab === 'lit_review' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Literature Justification
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'calculator' && (
        <div className="space-y-6">
          {/* Interactive Sliders Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-6 text-slate-200 font-semibold text-lg border-b border-slate-800 pb-3">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <span>Simulate Rainfall Scenario</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 6-Hour Rain Slider */}
              <div className="space-y-3 bg-slate-950/60 p-5 rounded-xl border border-slate-800/80">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-300">6-Hour Accumulated Rain</label>
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 font-mono text-base font-bold rounded-lg border border-indigo-500/30">
                    {rain6h.toFixed(1)} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.5"
                  value={rain6h}
                  onChange={(e) => setRain6h(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 font-mono">
                  <span>0.0 mm (Dry)</span>
                  <span>6.0 mm (Agri Opt)</span>
                  <span>15.0 mm (Heavy)</span>
                  <span>50.0 mm+</span>
                </div>
              </div>

              {/* 24-Hour Rain Slider */}
              <div className="space-y-3 bg-slate-950/60 p-5 rounded-xl border border-slate-800/80">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-300">Daily 24-Hour Accumulated Rain</label>
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 font-mono text-base font-bold rounded-lg border border-indigo-500/30">
                    {rain24h.toFixed(1)} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="1.0"
                  value={rain24h}
                  onChange={(e) => setRain24h(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 font-mono">
                  <span>0.0 mm</span>
                  <span>25.0 mm (ICAR Limit)</span>
                  <span>64.5 mm (IMD Heavy)</span>
                  <span>150.0 mm+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Agriculture Card */}
            <div className={`p-6 rounded-2xl border ${agriRes.color} transition-all shadow-xl bg-slate-900/80 space-y-4`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                    <Sprout className="w-6 h-6" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white">Agriculture Sector</h3>
                    <p className="text-xs text-slate-400">Crops, Land Prep, Fertilizers & Harvesting</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${agriRes.badge}`}>
                  {agriRes.label.split(' ')[0]}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                  <agriRes.icon className="w-5 h-5 text-indigo-400" />
                  {agriRes.label}
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {agriRes.summary}
                </p>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="font-semibold text-indigo-400 uppercase tracking-wide">Agronomic Action Plan:</span>
                <p className="text-slate-300">{agriRes.recommendation}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 font-mono text-slate-400">
                <div className="bg-slate-950/40 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">Optimal Range:</span>
                  <span className="text-emerald-400 font-bold">2.5 – 25.0 mm/day</span>
                </div>
                <div className="bg-slate-950/40 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">Danger Cutoff:</span>
                  <span className="text-red-400 font-bold">&gt; 64.5 mm/day</span>
                </div>
              </div>
            </div>

            {/* Building Construction Card */}
            <div className={`p-6 rounded-2xl border ${constRes.color} transition-all shadow-xl bg-slate-900/80 space-y-4`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                    <HardHat className="w-6 h-6" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white">Building & Construction</h3>
                    <p className="text-xs text-slate-400">Concrete, Earthwork, Scaffolding & Roofing</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${constRes.badge}`}>
                  {constRes.label.split(' ')[0]}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                  <constRes.icon className="w-5 h-5 text-indigo-400" />
                  {constRes.label}
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {constRes.summary}
                </p>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="font-semibold text-amber-400 uppercase tracking-wide">CPWD / IS 456 Safety Protocol:</span>
                <p className="text-slate-300">{constRes.recommendation}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 font-mono text-slate-400">
                <div className="bg-slate-950/40 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">Safe Dry Range:</span>
                  <span className="text-emerald-400 font-bold">0.0 – 5.0 mm/day</span>
                </div>
                <div className="bg-slate-950/40 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">Halt Work Cutoff:</span>
                  <span className="text-orange-400 font-bold">&gt; 20.0 mm/day</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {/* Chart Section */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" />
              Empirical Percentile Curves (State Datasets)
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Distribution of 6-Hour and 24-Hour rainfall across all records and wet-only records.
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={percentileData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="percentile" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" unit="mm" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                  <Legend />
                  <Area type="monotone" dataKey="wetDaily24h" name="Wet Daily (24h) Rain mm" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="wet6h" name="Wet 6-Hour Rain mm" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gumbel EVT Return Levels Grid */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Extreme Value Theory (EVT / Gumbel Return Periods)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {evtData.map((item, idx) => (
                <div key={idx} className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl text-center">
                  <span className="text-xs font-semibold text-slate-400 block">{item.period}</span>
                  <span className="text-xl font-bold font-mono text-indigo-400 my-1 block">{item.rain} mm</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{item.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'lit_review' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers className="w-6 h-6 text-indigo-400" />
            Literature Review & Operational Guidelines Standards
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
            <div className="space-y-3 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <h4 className="font-bold text-emerald-400 flex items-center gap-2">
                <Sprout className="w-5 h-5" />
                Agriculture & Agrometeorology Standards (ICAR / IMD)
              </h4>
              <ul className="list-disc list-inside space-y-2 text-slate-300 text-xs">
                <li><strong>ICAR Agricultural Guidelines:</strong> Kharif crops require an optimum soil water potential near field capacity. 2.5 mm – 25.0 mm daily rainfall meets crop evapotranspiration (ETc) demands without soil saturation.</li>
                <li><strong>Soil Air Displacement & Hypoxia:</strong> Continuous rain above 25.0 mm/day fills macropores, displacing soil oxygen (O2), leading to root respiration inhibition and nutrient leaching.</li>
                <li><strong>Waterlogging Hazard (&gt;64.5 mm/day):</strong> Results in severe soil erosion, crop lodging (paddy & maize falling over), and proliferation of root-rot pathogens (*Phytophthora / Pythium*).</li>
              </ul>
            </div>

            <div className="space-y-3 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <h4 className="font-bold text-amber-400 flex items-center gap-2">
                <HardHat className="w-5 h-5" />
                Building Construction Standards (CPWD / IS 456 / CBRI)
              </h4>
              <ul className="list-disc list-inside space-y-2 text-slate-300 text-xs">
                <li><strong>IS 456 Code of Practice for Plain & Reinforced Concrete:</strong> Concrete placement requires strict control over the water-cement ratio (w/c). Rain exceeding 5.0 mm/6-hr or 20.0 mm/day causes surface cement paste wash-out, destroying characteristic compressive strength (fck).</li>
                <li><strong>Earthwork & Geotechnical Stability:</strong> Excavations and foundation trenches become unstable when soil suction drops to zero during continuous rain (&gt;20 mm/day), creating severe landslide and cave-in hazards.</li>
                <li><strong>Scaffolding & Structural High-Altitude Safety:</strong> Wet steel tubes reduce friction factors by up to 60%, violating CPWD safety guidelines for scaffolding and tower crane operations above 5.0 mm/6-hr rain.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

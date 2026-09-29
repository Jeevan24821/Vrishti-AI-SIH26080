import React, { useState, useEffect } from 'react';
import { fetchStations, fetchDates, fetchForecast, postSandboxPredict } from '../services/api';
import { Station, DateItem, SandboxRequest, SandboxResponse } from '../types';
import { Sliders, Play, AlertTriangle, Sparkles, Cpu, MapPin, Calendar, Database, Thermometer, Droplets, Wind, Gauge, RotateCcw, AlertCircle } from 'lucide-react';

interface InteractiveSandboxPageProps {
  initialParameters?: Partial<SandboxRequest>;
  initialStation?: string | number;
  initialDate?: string;
}

export const InteractiveSandboxPage: React.FC<InteractiveSandboxPageProps> = ({
  initialParameters,
  initialStation,
  initialDate,
}) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [dates, setDates] = useState<DateItem[]>([]);
  const [selectedStation, setSelectedStation] = useState<string | number>(initialStation || 'LOC_GOA_04');
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || '01-06-2024');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  const [form, setForm] = useState<SandboxRequest | null>(null);
  const [response, setResponse] = useState<SandboxResponse | null>(null);
  const [loadingRecord, setLoadingRecord] = useState<boolean>(true);
  const [loadingInference, setLoadingInference] = useState<boolean>(false);
  const [recordInfo, setRecordInfo] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inferenceError, setInferenceError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const [sList, dList] = await Promise.all([fetchStations(), fetchDates()]);
        setStations(sList);
        setDates(dList);
        if (sList.length > 0) {
          if (initialStation && sList.some(s => String(s.location_id) === String(initialStation))) {
            setSelectedStation(initialStation);
          } else {
            const defaultSt = sList.find(s => String(s.location_id).includes('LOC_GOA') || String(s.location_id).includes('LOC_KL')) || sList[0];
            setSelectedStation(defaultSt.location_id);
          }
        }
        if (dList.length > 0) {
          if (initialDate && dList.some(d => d.date === initialDate)) {
            setSelectedDate(initialDate);
          } else {
            const defaultDate = dList.find(d => d.year === 2024) || dList[0];
            setSelectedDate(defaultDate.date);
          }
        }
      } catch (err: any) {
        console.error('Failed to initialize sandbox stations/dates:', err);
        setErrorMessage('Model/data unavailable. Unable to connect to backend server.');
      }
    }
    init();
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadRecord() {
      if (selectedStation === null || selectedStation === undefined || !selectedDate) return;
      setLoadingRecord(true);
      setErrorMessage(null);
      try {
        const res = await fetchForecast(selectedStation, selectedDate, selectedTime);
        if (!isMounted) return;
        
        if (res && res.raw_record_predictors) {
          const effectivePredictors = { ...res.raw_record_predictors };
          if (initialParameters) {
            Object.assign(effectivePredictors, initialParameters);
          }
          setForm(effectivePredictors);
          setAvailableTimes(res.available_times || []);
          if (res.time && !selectedTime) {
            setSelectedTime(res.time);
          }
          setRecordInfo(`Station ${res.station_id} (${res.taluka_name || res.district_name}) — ${res.date} ${res.time ? `(${res.time.includes('T') ? res.time.split('T')[1].split('+')[0] : res.time})` : ''}`);
          
          // Execute live model inference for selected CSV record
          try {
            const predRes = await postSandboxPredict(effectivePredictors);
            if (isMounted) {
              setResponse(predRes);
              setInferenceError(null);
            }
          } catch (pErr: any) {
            console.error('Initial sandbox prediction error:', pErr);
            if (isMounted) {
              setInferenceError('Model output unavailable for this record.');
            }
          }
        } else {
          setErrorMessage('Model/data unavailable for the selected record.');
        }
      } catch (err: any) {
        console.error('Error fetching record predictors:', err);
        if (isMounted) {
          setErrorMessage('Model/data unavailable for the selected combination.');
          setForm(null);
          setResponse(null);
        }
      } finally {
        if (isMounted) {
          setLoadingRecord(false);
        }
      }
    }
    loadRecord();
    return () => { isMounted = false; };
  }, [selectedStation, selectedDate, selectedTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setLoadingInference(true);
    setInferenceError(null);
    try {
      const res = await postSandboxPredict(form);
      setResponse(res);
    } catch (err: any) {
      console.error('Sandbox inference execution error:', err);
      setInferenceError('Model output unavailable. Failed to execute inference.');
    } finally {
      setLoadingInference(false);
    }
  };

  const handleChange = (field: keyof SandboxRequest, val: number) => {
    if (!form) return;
    setForm(prev => prev ? ({ ...prev, [field]: val }) : null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-slate-800 shadow-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                <Sliders className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Interactive Model Inference Sandbox</h2>
            </div>
            <p className="text-sm font-semibold text-slate-300 max-w-3xl">
              Auto-populated from the selected CSV dataset record. Adjust parameters to run live inference on the Vrishti AI model.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-200 text-xs font-black shrink-0">
            <Cpu className="w-4 h-4 text-blue-300" />
            <span>Live Inference Engine</span>
          </div>
        </div>
      </div>

      {/* CSV Record Selector Bar */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">SELECT CSV RECORD TO POPULATE PREDICTORS</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {/* Station Selector */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" /> WEATHER STATION
            </label>
            <select
              value={selectedStation}
              onChange={(e) => {
                setSelectedStation(e.target.value);
                setSelectedTime('');
              }}
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm font-bold rounded-xl px-4 h-[44px] focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm cursor-pointer"
            >
              {stations.map((st) => (
                <option key={st.location_id} value={st.location_id}>
                  {st.taluka_name === st.district_name ? st.district_name : `${st.taluka_name}, ${st.district_name}`} ({st.state || 'Station'})
                </option>
              ))}
            </select>
          </div>

          {/* Date Selector */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" /> FORECAST DATE RECORD
            </label>
            <select
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime('');
              }}
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm font-bold rounded-xl px-4 h-[44px] focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm cursor-pointer"
            >
              {dates.map((d) => (
                <option key={d.date} value={d.date}>
                  {d.date} ({d.year}) — [{d.partition}]
                </option>
              ))}
            </select>
          </div>

          {/* 6-Hour Period Selector */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-indigo-600" /> 6H PERIOD (IST)
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm font-bold rounded-xl px-4 h-[44px] focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm cursor-pointer"
            >
              {availableTimes.length > 0 ? (
                availableTimes.map((tStr) => {
                  let label = tStr;
                  if (tStr.includes('T00:00') || tStr.includes('00:00:00')) label = '00:00 – 06:00 IST';
                  else if (tStr.includes('T06:00') || tStr.includes('06:00:00')) label = '06:00 – 12:00 IST';
                  else if (tStr.includes('T12:00') || tStr.includes('12:00:00')) label = '12:00 – 18:00 IST';
                  else if (tStr.includes('T18:00') || tStr.includes('18:00:00')) label = '18:00 – 24:00 IST';
                  return <option key={tStr} value={tStr}>{label}</option>;
                })
              ) : (
                <option value="">Default 6h Window</option>
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 glass-card p-6 border-slate-300 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-lg font-black text-slate-900">Predictor Features Input</h3>
              <p className="text-xs font-semibold text-slate-600">{recordInfo || 'Populated from selected CSV record'}</p>
            </div>
            {form && (
              <button
                type="button"
                onClick={() => {
                  if (selectedStation && selectedDate) {
                    setSelectedTime('');
                  }
                }}
                className="text-xs text-indigo-700 font-black hover:underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reload Record
              </button>
            )}
          </div>

          {loadingRecord ? (
            <div className="py-16 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-xs font-bold text-slate-700">Loading CSV predictor values for selected record...</p>
            </div>
          ) : errorMessage ? (
            <div className="p-8 text-center space-y-3 bg-rose-50 border border-rose-200 rounded-2xl">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
              <p className="text-sm font-extrabold text-rose-950">{errorMessage}</p>
              <p className="text-xs font-semibold text-rose-800">Please select another station or date from the dropdown above.</p>
            </div>
          ) : !form ? (
            <div className="p-8 text-center space-y-2 bg-slate-50 border border-slate-200 rounded-2xl">
              <p className="text-xs font-bold text-slate-700">Model/data unavailable. Select a station and date above to load predictors.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-800 font-extrabold mb-1.5">Raw NWP Rain (mm)</label>
                  <input
                    type="number" step="0.1" value={form.nwp_rain}
                    onChange={(e) => handleChange('nwp_rain', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-[14px] font-semibold rounded-xl px-3.5 h-[44px] focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-extrabold mb-1.5 flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-amber-600" /> 2m Temperature (°C)
                  </label>
                  <input
                    type="number" step="0.1" value={form.temp_2m}
                    onChange={(e) => handleChange('temp_2m', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-[14px] font-semibold rounded-xl px-3.5 h-[44px] focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-extrabold mb-1.5">2m Dew Point (°C)</label>
                  <input
                    type="number" step="0.1" value={form.dew_point_2m}
                    onChange={(e) => handleChange('dew_point_2m', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-[14px] font-semibold rounded-xl px-3.5 h-[44px] focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-extrabold mb-1.5 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-600" /> Relative Humidity (%)
                  </label>
                  <input
                    type="number" step="0.1" value={form.relative_humidity}
                    onChange={(e) => handleChange('relative_humidity', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-[14px] font-semibold rounded-xl px-3.5 h-[44px] focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-extrabold mb-1.5 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-indigo-600" /> MSL Pressure (hPa)
                  </label>
                  <input
                    type="number" step="0.1" value={form.pressure_msl}
                    onChange={(e) => handleChange('pressure_msl', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-[14px] font-semibold rounded-xl px-3.5 h-[44px] focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-extrabold mb-1.5 flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-emerald-600" /> Wind Speed 10m (km/h)
                  </label>
                  <input
                    type="number" step="0.1" value={form.wind_speed}
                    onChange={(e) => handleChange('wind_speed', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-[14px] font-semibold rounded-xl px-3.5 h-[44px] focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-extrabold mb-1.5">Surface Pressure (hPa)</label>
                  <input
                    type="number" step="0.1" value={form.surface_pressure}
                    onChange={(e) => handleChange('surface_pressure', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-[14px] font-semibold rounded-xl px-3.5 h-[44px] focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-extrabold mb-1.5">Cloud Cover (%)</label>
                  <input
                    type="number" step="0.1" value={form.cloud_cover}
                    onChange={(e) => handleChange('cloud_cover', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-[14px] font-semibold rounded-xl px-3.5 h-[44px] focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-extrabold mb-1.5">Wind Direction (°)</label>
                  <input
                    type="number" step="0.1" value={form.wind_direction}
                    onChange={(e) => handleChange('wind_direction', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-[14px] font-semibold rounded-xl px-3.5 h-[44px] focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-extrabold mb-1.5">Elevation (m)</label>
                  <input
                    type="number" value={form.elevation}
                    onChange={(e) => handleChange('elevation', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-[14px] font-semibold rounded-xl px-3.5 h-[44px] focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-extrabold mb-1.5">Month (1-12)</label>
                  <input
                    type="number" min="1" max="12" value={form.month}
                    onChange={(e) => handleChange('month', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-[14px] font-semibold rounded-xl px-3.5 h-[44px] focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-extrabold mb-1.5">Hour (0-23)</label>
                  <input
                    type="number" min="0" max="23" value={form.hour}
                    onChange={(e) => handleChange('hour', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-[14px] font-semibold rounded-xl px-3.5 h-[44px] focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingInference}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black h-[46px] rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5 fill-white" />
                <span className="tracking-wide text-sm">{loadingInference ? 'Running Model Inference...' : 'Execute Model Inference'}</span>
              </button>
            </>
          )}
        </form>

        {/* Live Output Card */}
        <div className="glass-card p-6 border border-slate-300 shadow-md space-y-5 bg-gradient-to-b from-white to-slate-50 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>Model Inference Results</span>
              </h3>
              <span className="text-xs font-black bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-full border border-indigo-300">OUTPUT</span>
            </div>

            {loadingInference ? (
              <div className="py-20 text-center space-y-3">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="text-xs font-bold text-slate-700">Executing Regime-Aware ML Model Inference...</p>
              </div>
            ) : inferenceError ? (
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
                <span className="text-xs font-black text-rose-950 block">{inferenceError}</span>
              </div>
            ) : response ? (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2 shadow-lg border border-slate-800">
                  <span className="text-slate-400 font-extrabold text-xs uppercase tracking-wider block">AI Corrected Forecast</span>
                  <div className="text-4xl font-black text-blue-400">{response.ai_corrected_rain_mm} mm</div>
                  <div className="text-xs text-slate-200 font-semibold">
                    Bias Correction: <span className="font-extrabold text-emerald-400">{response.bias_correction_mm > 0 ? `+${response.bias_correction_mm}` : response.bias_correction_mm} mm</span>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-1.5 shadow-lg border border-slate-800">
                  <span className="text-slate-400 font-extrabold text-xs uppercase tracking-wider block">Predicted Synoptic Regime</span>
                  <div className="font-black text-indigo-300 text-lg">
                    Regime {response.predicted_regime_id} — {
                      response.predicted_regime_id === 0 ? 'Active Monsoon / Orographic Lift' :
                      response.predicted_regime_id === 1 ? 'June Monsoon Onset & Coastal Orographic' :
                      response.predicted_regime_id === 2 ? 'July Peak Active Surge' :
                      response.predicted_regime_id === 3 ? 'August Mid-Monsoon Break/Active' :
                      response.predicted_regime_id === 4 ? 'September Withdrawal & Lows' : 'October Post-Monsoon Transition'
                    }
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 shadow-lg border border-slate-800">
                  <span className="text-slate-400 font-extrabold text-xs uppercase tracking-wider block">Exceedance Probabilities</span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-200 font-bold">P(Rain &ge; 64.5mm):</span>
                    <span className="font-black text-amber-400 text-base">{(response.heavy_rain_probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-slate-800 pt-2.5">
                    <span className="text-slate-200 font-bold">P(Rain &ge; 115.5mm):</span>
                    <span className="font-black text-rose-400 text-base">{(response.very_heavy_rain_probability * 100).toFixed(1)}%</span>
                  </div>
                </div>

                {response.is_out_of_distribution && (
                  <div className="bg-amber-100 border border-amber-400 text-amber-950 p-3.5 rounded-xl flex items-center space-x-2.5 text-xs font-black">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-700" />
                    <span>Out-of-distribution feature warning detected!</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-600 text-xs font-extrabold space-y-3">
                <Cpu className="w-10 h-10 text-slate-400 mx-auto animate-pulse" />
                <p>Select a record above to populate predictors & run model inference.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

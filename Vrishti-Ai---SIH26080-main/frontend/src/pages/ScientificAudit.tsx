import React, { useState, useEffect } from 'react';
import { fetchScientificAudit } from '../services/api';
import { ScientificAuditItem } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';

export const ScientificAuditPage: React.FC = () => {
  const [items, setItems] = useState<ScientificAuditItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchScientificAudit();
        setItems(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="bg-navy-800 p-12 rounded-xl text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-sm text-slate-400">Running automated scientific audit checks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-navy-800 p-5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white">Automated Scientific Integrity Audit</h2>
        </div>
        <p className="text-xs text-slate-400">
          Automated scanner verifying zero synthetic data generators, zero target leakage, non-negativity physical constraints, and 2024 test set isolation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map((item, idx) => {
          const isPass = item.status === 'PASS';
          const isWarn = item.status === 'WARNING';
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex items-start justify-between ${
                isPass
                  ? 'bg-emerald-950/20 border-emerald-800'
                  : isWarn
                  ? 'bg-yellow-950/20 border-yellow-800'
                  : 'bg-red-950/20 border-red-800'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {isPass && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {isWarn && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                  {!isPass && !isWarn && <XCircle className="w-4 h-4 text-red-400" />}
                  <span className="font-bold text-sm text-white">{item.check}</span>
                </div>
                <p className="text-xs text-slate-300 pl-6">{item.detail}</p>
              </div>

              <span
                className={`text-xs font-black px-2.5 py-1 rounded ${
                  isPass
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                    : isWarn
                    ? 'bg-yellow-950 text-yellow-400 border border-yellow-700'
                    : 'bg-red-950 text-red-400 border border-red-700'
                }`}
              >
                {item.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

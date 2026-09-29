import React, { useState, useEffect } from 'react';
import { fetchJuryDefense } from '../services/api';
import { JuryQuestion } from '../types';
import { HelpCircle, CheckCircle2 } from 'lucide-react';

export const JuryDefensePage: React.FC = () => {
  const [questions, setQuestions] = useState<JuryQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchJuryDefense();
        setQuestions(res);
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
        <p className="mt-2 text-sm text-slate-400">Generating dynamic SIH Jury Defense answers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-navy-800 p-5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white">Smart India Hackathon (SIH) Jury Defense Panel</h2>
        </div>
        <p className="text-xs text-slate-400">
          Rigorous answers to key evaluation questions, generated live from backend metadata and model evaluation logs.
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((item, idx) => (
          <div key={idx} className="bg-navy-800 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="text-sm font-bold text-blue-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{item.q}</span>
            </div>
            <p className="text-xs text-slate-300 pl-6 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

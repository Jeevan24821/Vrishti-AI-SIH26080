import React, { useState, useEffect } from 'react';
import { fetchProvenance } from '../services/api';
import { ProvenanceData } from '../types';
import { FileCheck, Shield, Database, Calendar } from 'lucide-react';

export const DataMethodologyPage: React.FC = () => {
  const [provenance, setProvenance] = useState<ProvenanceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchProvenance();
        setProvenance(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !provenance) {
    return (
      <div className="bg-navy-800 p-12 rounded-xl text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-sm text-slate-400">Loading dataset provenance metadata...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-navy-800 p-5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center space-x-2">
          <FileCheck className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white">Data Provenance & Scientific Methodology</h2>
        </div>
        <p className="text-xs text-slate-400">
          Complete transparency on data lineage, SHA-256 verification hash, chronological partitioning, and target leakage controls.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Dataset Provenance */}
        <div className="bg-navy-800 p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Database className="w-4 h-4 text-emerald-400" /> Source Dataset Verification
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Filename:</span>
              <span className="font-mono text-slate-200">{provenance.filename}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">SHA-256 Hash:</span>
              <span className="font-mono text-emerald-400 text-[11px]">{provenance.dataset_hash_sha256}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Total Rows:</span>
              <span className="font-bold text-slate-200">{provenance.total_rows.toLocaleString()} rows</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Total Columns:</span>
              <span className="font-bold text-slate-200">{provenance.total_columns} columns</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Experiment ID:</span>
              <span className="font-mono text-blue-400">{provenance.experiment_id}</span>
            </div>
          </div>
        </div>

        {/* Temporal Partition Breakdown */}
        <div className="bg-navy-800 p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Calendar className="w-4 h-4 text-blue-400" /> Chronological Partitioning Policy
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-blue-400 uppercase">TRAIN SET (2020-2022)</span>
                <p className="text-[11px] text-slate-400">Model fitting & feature engineering</p>
              </div>
              <span className="font-bold text-slate-200">{provenance.split_counts.train.toLocaleString()} rows</span>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-yellow-400 uppercase">VALIDATION SET (2023)</span>
                <p className="text-[11px] text-slate-400">Model selection & feature importance</p>
              </div>
              <span className="font-bold text-slate-200">{provenance.split_counts.validation.toLocaleString()} rows</span>
            </div>

            <div className="p-2.5 bg-emerald-950/40 rounded-lg border border-emerald-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-emerald-400 uppercase">INDEPENDENT TEST (2024)</span>
                <p className="text-[11px] text-emerald-300/80">Untouched test set for final verification</p>
              </div>
              <span className="font-bold text-emerald-300">{provenance.split_counts.test.toLocaleString()} rows</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

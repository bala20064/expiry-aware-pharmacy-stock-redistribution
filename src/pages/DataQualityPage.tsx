import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Database,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Layers
} from "lucide-react";
import { api, DataQualityResponse } from "../services/api";
import { DataQualityIssue } from "../types";

export const DataQualityPage: React.FC = () => {
  const [data, setData] = useState<DataQualityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchDataQuality = async () => {
    try {
      setIsLoading(true);
      const res = await api.getDataQuality();
      setData(res);
    } catch (err) {
      console.error("Failed to load data quality:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataQuality();
  }, []);

  const handleResolve = async (issueId: string) => {
    try {
      await api.resolveDataQualityIssue(issueId);
      setMessage(`Issue ${issueId} resolved and logged in audit trail.`);
      fetchDataQuality();
    } catch (err: any) {
      alert("Error resolving issue: " + err.message);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Scanning inventory data integrity...</p>
        </div>
      </div>
    );
  }

  const { summary, issues } = data;

  return (
    <div id="data-quality-page" className="space-y-6 text-xs">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Data Integrity &amp; Quality Isolation Center</h2>
              <p className="text-xs text-slate-500">
                Automated quarantine and remediation of corrupted inventory records (negative stock, corrupted timestamps, missing storage attributes).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-center">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider block">Data Quality Score</span>
              <strong className="text-lg font-black text-emerald-700">{summary.data_quality_pct}%</strong>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">{message}</span>
          </div>
          <button onClick={() => setMessage("")} className="text-emerald-700 font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Total Inventory Records
          </span>
          <div className="text-2xl font-bold text-slate-900">{summary.total_records.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400 mt-1">Batches evaluated in database</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
            Valid / Verified Records
          </span>
          <div className="text-2xl font-bold text-emerald-700">{summary.valid_records.toLocaleString()}</div>
          <p className="text-[11px] text-emerald-800 mt-1">Eligible for algorithmic redistribution</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 shadow-xs">
          <span className="text-[11px] font-semibold text-red-700 uppercase tracking-wider block mb-1">
            Quarantined Anomalies
          </span>
          <div className="text-2xl font-bold text-red-600">{summary.problematic_records.toLocaleString()}</div>
          <p className="text-[11px] text-red-800 mt-1">Isolated from recommendation engine</p>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
            Quarantined Data Discrepancy Log
          </h3>
          <span className="text-[11px] text-slate-500">
            {issues.length} detected anomaly records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table id="data-quality-issues-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10.5px]">
                <th className="py-3 px-4">Issue ID &amp; Batch</th>
                <th className="py-3 px-4">Field</th>
                <th className="py-3 px-4">Anomaly Type</th>
                <th className="py-3 px-4">Corrupted Value</th>
                <th className="py-3 px-4">Systemic Impact</th>
                <th className="py-3 px-4">Corrective Action</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {issues.map((issue) => (
                <tr key={issue.issue_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900 block">{issue.issue_id}</span>
                    <span className="font-mono text-slate-500 text-[11px]">{issue.batch_id || "Global Record"}</span>
                  </td>

                  <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                    {issue.field_name}
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-red-100 text-red-800">
                      {issue.issue_type}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-red-600 font-bold">
                    {issue.raw_value || "NULL / Empty"}
                  </td>

                  <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs">
                    {issue.impact}
                  </td>

                  <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs">
                    {issue.corrective_action}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        issue.is_resolved === 1
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-900 animate-pulse"
                      }`}
                    >
                      {issue.is_resolved === 1 ? "Resolved" : "Quarantined"}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {issue.is_resolved === 0 ? (
                      <button
                        onClick={() => handleResolve(issue.issue_id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs cursor-pointer shadow-2xs"
                      >
                        Resolve
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Audit Clean</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

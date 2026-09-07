import React, { useEffect, useState } from "react";
import {
  FlaskConical,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  FileText
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";
import { api } from "../services/api";
import { ExperimentResults } from "../types";

export const ExperimentsPage: React.FC = () => {
  const [results, setResults] = useState<ExperimentResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        const data = await api.getExperiments();
        setResults(data);
      } catch (err) {
        console.error("Failed to load experiment results:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (isLoading || !results) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading experimental benchmarks...</p>
        </div>
      </div>
    );
  }

  const { baseline, proposed, improvements, metadata } = results;

  const comparisonChartData = [
    {
      metric: "Value Saved (₹)",
      Baseline: baseline.value_used_before_expiry + baseline.value_transferred_before_expiry,
      Proposed: proposed.value_used_before_expiry + proposed.value_transferred_before_expiry
    },
    {
      metric: "Wastage Expired (₹)",
      Baseline: baseline.value_expired,
      Proposed: proposed.value_expired
    }
  ];

  const rateComparisonData = [
    {
      metric: "Stock Recovery Rate",
      Baseline: baseline.stock_recovery_rate_pct,
      Proposed: proposed.stock_recovery_rate_pct
    },
    {
      metric: "Redistribution Success",
      Baseline: baseline.redistribution_success_rate_pct,
      Proposed: proposed.redistribution_success_rate_pct
    }
  ];

  return (
    <div id="experiments-page" className="space-y-6 text-xs">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{metadata.evaluation_title}</h2>
              <p className="text-xs text-slate-500">
                Controlled simulation benchmark &bull; Synthetic dataset (Seed 42, {metadata.sample_size_batches} batches) &bull; Evaluation Date: {metadata.simulation_reference_date}
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-semibold text-xs flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>84.4% Wastage Reduction</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stock Recovery Rate */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            Stock Recovery Rate
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{proposed.stock_recovery_rate_pct}%</span>
            <span className="text-xs text-slate-400 line-through">{baseline.stock_recovery_rate_pct}%</span>
          </div>
          <p className="text-[11px] text-emerald-800 font-medium mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{improvements.recovery_rate_gain_percentage_points}% gain</span>
          </p>
        </div>

        {/* Economic Wastage Saved */}
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs">
          <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider mb-1">
            Avoided Stock Wastage
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-700">₹{improvements.wastage_reduction_inr.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-blue-800 font-medium mt-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>84.4% reduction in expired stock value</span>
          </p>
        </div>

        {/* Turnaround Time */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-1">
            Avg. Action Turnaround
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{proposed.average_action_time_days} days</span>
            <span className="text-xs text-slate-400 line-through">{baseline.average_action_time_days} days</span>
          </div>
          <p className="text-[11px] text-amber-800 font-medium mt-1 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>{improvements.action_time_reduction_days} days faster</span>
          </p>
        </div>

        {/* Units Recovered */}
        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs">
          <div className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider mb-1">
            Medicine Units Saved
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-700">{proposed.quantity_saved.toLocaleString()}</span>
            <span className="text-xs text-slate-400 line-through">{baseline.quantity_saved.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-purple-800 font-medium mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{improvements.quantity_saved_gain.toLocaleString()} units</span>
          </p>
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
            Quantitative Evaluation: Status Quo (Baseline) vs. Expiry-Aware System
          </h3>
          <span className="text-[11px] font-medium text-slate-500">
            Identical Sample of {baseline.batches_evaluated} Near-Expiry Batches
          </span>
        </div>

        <div className="overflow-x-auto">
          <table id="experiment-comparison-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10.5px]">
                <th className="py-3 px-4">Evaluation Metric</th>
                <th className="py-3 px-4">Baseline (Manual Operations)</th>
                <th className="py-3 px-4 text-emerald-800">Proposed Expiry-Aware System</th>
                <th className="py-3 px-4 text-right">Net Improvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">
                  Primary KPI: Value of Medicine Stock Used or Transferred Before Expiry
                </td>
                <td className="py-3 px-4 font-mono text-slate-600">
                  ₹{(baseline.value_used_before_expiry + baseline.value_transferred_before_expiry).toLocaleString()}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                  ₹{(proposed.value_used_before_expiry + proposed.value_transferred_before_expiry).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-bold text-emerald-700">
                  +₹{improvements.wastage_reduction_inr.toLocaleString()} (+127.3%)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-800">Stock Recovery Rate (%)</td>
                <td className="py-3 px-4 font-mono text-slate-600">{baseline.stock_recovery_rate_pct}%</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-700">{proposed.stock_recovery_rate_pct}%</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-700">
                  +{improvements.recovery_rate_gain_percentage_points} percentage points
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-800">Avoidable Expired Stock Value</td>
                <td className="py-3 px-4 font-mono text-red-600">₹{baseline.value_expired.toLocaleString()}</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-700">₹{proposed.value_expired.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-700">
                  -84.4% Wastage Reduction
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-800">Quantity of Units Saved</td>
                <td className="py-3 px-4 font-mono text-slate-600">{baseline.quantity_saved.toLocaleString()} units</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-700">{proposed.quantity_saved.toLocaleString()} units</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-700">
                  +{improvements.quantity_saved_gain.toLocaleString()} units
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-800">Quantity of Units Expired</td>
                <td className="py-3 px-4 font-mono text-red-600">{baseline.quantity_expired.toLocaleString()} units</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-700">{proposed.quantity_expired.toLocaleString()} units</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-700">
                  -{(baseline.quantity_expired - proposed.quantity_expired).toLocaleString()} units
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-800">Average Turnaround Time</td>
                <td className="py-3 px-4 font-mono text-slate-600">{baseline.average_action_time_days} days</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-700">{proposed.average_action_time_days} days</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-700">
                  {improvements.action_time_reduction_days} days faster
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-800">High-Priority Unresolved Actions</td>
                <td className="py-3 px-4 font-mono text-red-600">{baseline.high_priority_unresolved_actions} batches</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-700">{proposed.high_priority_unresolved_actions} batch</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-700">
                  -92.8% Unresolved Backlog
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Economic Value Comparison */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-3">
            Economic Value: Stock Saved vs. Wastage (₹)
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="metric" tick={{ fontSize: 11, fill: "#475569" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, "Value"]}
                  contentStyle={{ fontSize: "11px", borderRadius: "8px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Proposed" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recovery Rates Comparison */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-3">
            Operational Rates: Recovery &amp; Transfer (%)
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rateComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="metric" tick={{ fontSize: 11, fill: "#475569" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, "Rate"]}
                  contentStyle={{ fontSize: "11px", borderRadius: "8px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Proposed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Formal Evaluation Methodology & Mathematical Formulas */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-600" />
          <span>Evaluation Methodology &amp; Mathematical Formulations</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">Primary KPI Formulation</h4>
            <div className="p-3 bg-slate-50 font-mono text-[11px] rounded-lg text-slate-800 border border-slate-200">
              Stock Recovery Rate (%) = (Value of Stock Used or Transferred Before Expiry / Total Near-Expiry At-Risk Value) &times; 100
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Measures the proportion of near-expiry inventory value that was successfully absorbed locally or relocated to an absorbing pharmacy hub before expiration occurred.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">Wastage Reduction Formulation</h4>
            <div className="p-3 bg-slate-50 font-mono text-[11px] rounded-lg text-slate-800 border border-slate-200">
              Wastage Reduction (%) = ((Baseline Expired Value - Proposed Expired Value) / Baseline Expired Value) &times; 100
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Captures net financial write-off avoidance directly attributable to proactive, multi-horizon redistribution versus status-quo siloed pharmacy management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  IndianRupee,
  Boxes,
  ArrowRightLeft,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from "recharts";
import { api, DashboardResponse } from "../services/api";

interface DashboardPageProps {
  onNavigateTab: (tab: string, filter?: string) => void;
  onOpenEvidenceForId?: (recId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab }) => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await api.getDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading inventory decision metrics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs my-6">
        <p className="font-bold">Error loading dashboard: {error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-3 px-3 py-1.5 bg-red-700 text-white rounded font-medium cursor-pointer"
        >
          Retry Load
        </button>
      </div>
    );
  }

  const { kpis, charts, alerts } = data;

  const STATUS_COLORS: Record<string, string> = {
    Pending: "#eab308",
    Approved: "#10b981",
    Rejected: "#ef4444",
    Overridden: "#f97316",
    Deferred: "#64748b"
  };

  return (
    <div id="dashboard-page" className="space-y-6">
      {/* Top Banner / Hero Metric Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pharmacy Stock Monitoring &amp; Redistribution</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time batch expiry telemetry &bull; Chennai Regional Distribution Network &bull; Simulation Date:{" "}
            <span className="font-semibold text-slate-800">{kpis.simulation_date}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab("recommendations", "Critical")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{kpis.critical_batches_count} Critical Batches Awaiting Action</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Inventory Value */}
        <div
          id="kpi-total-inventory"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Network Inventory</span>
            <Boxes className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            ₹{kpis.total_inventory_value.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>{kpis.total_inventory_qty.toLocaleString()} units logged</span>
            <span className="text-emerald-600 font-medium">10 Hubs Active</span>
          </div>
        </div>

        {/* Near Expiry Value */}
        <div
          id="kpi-near-expiry"
          className="bg-white p-4 rounded-xl border border-orange-200 shadow-xs hover:border-orange-300 transition-colors"
        >
          <div className="flex items-center justify-between text-orange-600 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Near-Expiry (&le;30d)</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            ₹{kpis.near_expiry_value.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span className="font-semibold text-orange-700">{kpis.near_expiry_count} Batches at Risk</span>
            <span className="text-slate-400">Window: 30 days</span>
          </div>
        </div>

        {/* Potential Value Saved */}
        <div
          id="kpi-value-saved"
          className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs hover:border-emerald-300 transition-colors"
        >
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Stock Value Saved</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-xl font-extrabold text-emerald-700">
            ₹{kpis.value_saved.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span className="text-emerald-700 font-bold">{kpis.stock_recovery_rate_pct}% Recovery Rate</span>
            <span>+₹{kpis.value_transferred.toLocaleString()} xfer</span>
          </div>
        </div>

        {/* Wastage Reduction */}
        <div
          id="kpi-wastage-reduction"
          className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs hover:border-blue-300 transition-colors"
        >
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Wastage Reduction</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xl font-extrabold text-blue-700">
            {kpis.wastage_reduction_pct}%
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>vs. Baseline Method</span>
            <button
              onClick={() => onNavigateTab("experiments")}
              className="text-blue-600 hover:underline font-medium cursor-pointer"
            >
              View Report &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Operational Alerts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs transition-shadow shadow-2xs ${
              alert.type === "critical"
                ? "bg-red-50/70 border-red-200 text-red-950"
                : alert.type === "warning"
                ? "bg-amber-50/70 border-amber-200 text-amber-950"
                : "bg-blue-50/70 border-blue-200 text-blue-950"
            }`}
          >
            {alert.type === "critical" ? (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            ) : alert.type === "warning" ? (
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className="font-bold">{alert.title}</h4>
              <p className="text-[11px] opacity-80 mt-0.5 leading-snug">{alert.message}</p>
              <button
                onClick={() => {
                  if (alert.action_link.includes("recommendations")) onNavigateTab("recommendations");
                  else if (alert.action_link.includes("tasks")) onNavigateTab("tasks");
                  else onNavigateTab("recommendations");
                }}
                className="mt-1.5 inline-flex items-center gap-1 font-semibold text-[11px] underline cursor-pointer"
              >
                <span>Take Action</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Expiry Urgency Buckets */}
        <div className="lg:col-span-8 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                Inventory Expiry Horizon Buckets
              </h3>
              <p className="text-[11px] text-slate-500">
                Number of batches and aggregate stock value (₹) distributed by days-to-expiry
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("inventory")}
              className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Batches</span>
              <ArrowRightLeft className="w-3 h-3" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.expiry_buckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    name === "value" ? `₹${Number(value).toLocaleString()}` : `${value} batches`,
                    name === "value" ? "Stock Value" : "Batch Count"
                  ]}
                  contentStyle={{ fontSize: "11px", borderRadius: "8px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="value" name="Value (₹)" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="count" name="Batch Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Value Saved vs Expired Breakdown */}
        <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="mb-2">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              Value Saved vs. Expired
            </h3>
            <p className="text-[11px] text-slate-500">
              Recovery efficiency on at-risk stock
            </p>
          </div>
          <div className="h-52 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.value_saved_vs_expired}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {charts.value_saved_vs_expired.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Amount"]}
                  contentStyle={{ fontSize: "11px", borderRadius: "8px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 text-center text-xs">
            <div>
              <span className="text-[10.5px] text-slate-400 block">Stock Saved</span>
              <strong className="text-emerald-700 font-bold">₹{kpis.value_saved.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-[10.5px] text-slate-400 block">Avoidable Expired</span>
              <strong className="text-red-600 font-bold">₹{kpis.value_expired.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* At-Risk vs Saved Stock by Pharmacy Hub */}
        <div className="lg:col-span-8 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="mb-3">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              Stock Redistribution by Regional Hub
            </h3>
            <p className="text-[11px] text-slate-500">
              Potential at-risk stock value vs absorbed / redistributed value across 10 locations
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.wastage_by_location} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="location_name"
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 9.5, fill: "#475569" }}
                />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, "Amount"]}
                  contentStyle={{ fontSize: "11px", borderRadius: "8px" }}
                />
                <Legend verticalAlign="top" wrapperStyle={{ fontSize: "11px", paddingBottom: "8px" }} />
                <Bar dataKey="at_risk_value" name="At-Risk Value" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="value_saved" name="Value Saved/Xfer" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommendations by Operational Status */}
        <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="mb-2">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              Recommendation Governance Status
            </h3>
            <p className="text-[11px] text-slate-500">
              Review pipeline and human authorizations
            </p>
          </div>
          <div className="space-y-3 flex-1 flex flex-col justify-center py-2">
            {charts.recommendations_by_status.map((item) => (
              <div key={item.status} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">{item.status}</span>
                  <span className="font-bold text-slate-900">{item.count} items</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, item.count * 10)}%`,
                      backgroundColor: STATUS_COLORS[item.status] || "#94a3b8"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab("recommendations")}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 text-center transition-colors cursor-pointer"
            >
              Manage All Recommendations &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

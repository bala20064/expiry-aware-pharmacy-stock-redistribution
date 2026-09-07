import React, { useEffect, useState } from "react";
import {
  ArrowRightLeft,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  Sparkles,
  MapPin,
  IndianRupee,
  FileCheck2
} from "lucide-react";
import { api, RecommendationsResponse } from "../services/api";
import { Recommendation, UserRole } from "../types";

interface RecommendationsPageProps {
  currentRole: UserRole;
  onOpenEvidence: (rec: Recommendation) => void;
  onOpenApprove: (rec: Recommendation) => void;
  onOpenOverride: (rec: Recommendation) => void;
  initialPriority?: string;
}

export const RecommendationsPage: React.FC<RecommendationsPageProps> = ({
  currentRole,
  onOpenEvidence,
  onOpenApprove,
  onOpenOverride,
  initialPriority = ""
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState(initialPriority);
  const [status, setStatus] = useState("");
  const [action, setAction] = useState("");
  const [humanOnly, setHumanOnly] = useState(false);

  // Status message
  const [toastMessage, setToastMessage] = useState("");

  const fetchRecommendations = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const res = await api.getRecommendations({
        page,
        limit: pagination.limit,
        search,
        priority,
        status,
        action,
        human_only: humanOnly
      });
      setRecommendations(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error("Failed to load recommendations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(1);
  }, [search, priority, status, action, humanOnly]);

  const handleQuickReject = async (rec: Recommendation) => {
    if (!confirm(`Are you sure you want to reject recommendation ${rec.recommendation_id}?`)) return;
    try {
      await api.rejectRecommendation(rec.recommendation_id, {
        reviewer_name: currentRole,
        reason: "Discretionary rejection by inventory supervisor"
      });
      setToastMessage(`Recommendation ${rec.recommendation_id} marked as Rejected.`);
      fetchRecommendations(pagination.page);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleQuickDefer = async (rec: Recommendation) => {
    try {
      await api.deferRecommendation(rec.recommendation_id, {
        reviewer_name: currentRole,
        reason: "Deferred for secondary regional review cycle"
      });
      setToastMessage(`Recommendation ${rec.recommendation_id} deferred.`);
      fetchRecommendations(pagination.page);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div id="recommendations-page" className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage("")} className="text-emerald-700 hover:text-emerald-900">
            &times;
          </button>
        </div>
      )}

      {/* Filter and Control Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Redistribution &amp; Action Recommendations</h2>
            <p className="text-xs text-slate-500">
              Rule-based deterministic decision-support suggestions for near-expiry medicine inventory.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                id="filter-human-only"
                checked={humanOnly}
                onChange={(e) => setHumanOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Human Confirmation Mandate Only</span>
            </label>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="recommendations-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Medicine, Rec ID, Batch ID..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Priority Filter */}
          <div>
            <select
              id="recommendations-priority-filter"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <select
              id="recommendations-action-filter"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Recommended Actions</option>
              <option value="TRANSFER">TRANSFER (Inter-branch)</option>
              <option value="USE_LOCALLY">USE_LOCALLY (Internal prioritization)</option>
              <option value="URGENT_REVIEW">URGENT_REVIEW (Expedited local action)</option>
              <option value="NO_ACTION">NO_ACTION</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              id="recommendations-status-filter"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Workflow Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Overridden">Overridden</option>
              <option value="Deferred">Deferred</option>
            </select>
          </div>

          {/* Reset button */}
          <div>
            <button
              onClick={() => {
                setSearch("");
                setPriority("");
                setStatus("");
                setAction("");
                setHumanOnly(false);
              }}
              className="w-full py-1.5 px-3 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
            <div className="inline-block w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2" />
            Loading recommendations...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500">
            No redistribution recommendations match the active filter criteria.
          </div>
        ) : (
          recommendations.map((rec) => (
            <div
              key={rec.recommendation_id}
              id={`rec-card-${rec.recommendation_id}`}
              className={`bg-white rounded-xl border p-4 shadow-xs transition-shadow hover:shadow-sm ${
                rec.priority === "Critical"
                  ? "border-red-200 bg-red-50/10"
                  : rec.priority === "High"
                  ? "border-orange-200 bg-orange-50/10"
                  : "border-slate-200"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Block: Medicine, Batch, IDs */}
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {rec.recommendation_id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                        rec.priority === "Critical"
                          ? "bg-red-100 text-red-800"
                          : rec.priority === "High"
                          ? "bg-orange-100 text-orange-800"
                          : rec.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {rec.priority}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                        rec.recommended_action === "TRANSFER"
                          ? "bg-emerald-100 text-emerald-800"
                          : rec.recommended_action === "USE_LOCALLY"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {rec.recommended_action}
                    </span>
                    {rec.requires_human_confirmation === 1 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                        Human Sign-off Compulsory
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{rec.medicine_name}</h3>
                  <p className="text-xs text-slate-500">
                    Batch: <span className="font-mono text-slate-700">{rec.batch_id}</span> &bull; {rec.generic_name} &bull; {rec.storage_type}
                  </p>
                </div>

                {/* Middle Block: Route & Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex-1">
                  <div>
                    <span className="text-[10.5px] text-slate-400 block">Routing</span>
                    <span className="font-medium text-slate-800 text-[11px] block truncate" title={rec.source_name}>
                      {rec.source_name.split(" ")[0]} &rarr; {rec.dest_name ? rec.dest_name.split(" ")[0] : "Local Hub"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {rec.dest_name ? `${rec.distance_km} km away` : "No viable destination"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10.5px] text-slate-400 block">Quantity &amp; Expiry</span>
                    <span className="font-bold text-slate-900 text-[11px] block">
                      {rec.quantity.toLocaleString()} units
                    </span>
                    <span className={`text-[10px] font-semibold ${rec.days_to_expiry <= 7 ? "text-red-600" : "text-slate-500"}`}>
                      {rec.days_to_expiry} days left ({rec.expiry_date})
                    </span>
                  </div>

                  <div>
                    <span className="text-[10.5px] text-slate-400 block">Stock Value at Risk</span>
                    <span className="font-bold text-slate-900 text-[11px] block">
                      ₹{rec.estimated_stock_value.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">
                      Est. saved: ₹{(rec.estimated_stock_value * 0.92).toFixed(0)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10.5px] text-slate-400 block">Score &amp; Status</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-emerald-600 text-sm">
                        {rec.recommendation_score}
                      </span>
                      <span className="text-[10px] text-slate-400">/ 100</span>
                    </div>
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                        rec.status === "Approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : rec.status === "Pending"
                          ? "bg-amber-100 text-amber-800"
                          : rec.status === "Overridden"
                          ? "bg-orange-100 text-orange-800"
                          : rec.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>
                </div>

                {/* Right Block: Action Buttons */}
                <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-end gap-1.5 shrink-0">
                  <button
                    onClick={() => onOpenEvidence(rec)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Evidence</span>
                  </button>

                  {rec.status === "Pending" && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenApprove(rec)}
                        className="px-2.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition-colors shadow-2xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onOpenOverride(rec)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg cursor-pointer transition-colors"
                      >
                        Override
                      </button>
                      <button
                        onClick={() => handleQuickReject(rec)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Reject Recommendation"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Justification summary line */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <p className="truncate max-w-3xl">
                  <strong className="text-slate-700">Reason:</strong> {rec.reason}
                </p>
                <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                  {rec.rules_triggered?.length || 0} rules checked
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div>
          Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} recommendations
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchRecommendations(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-medium text-slate-800">
            Page {pagination.page} of {pagination.total_pages || 1}
          </span>
          <button
            onClick={() => fetchRecommendations(pagination.page + 1)}
            disabled={pagination.page >= pagination.total_pages}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

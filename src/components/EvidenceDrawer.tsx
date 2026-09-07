import React from "react";
import {
  X,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  IndianRupee,
  Clock,
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";
import { Recommendation } from "../types";

interface EvidenceDrawerProps {
  recommendation: Recommendation | null;
  onClose: () => void;
  onApprove: (rec: Recommendation) => void;
  onReject: (rec: Recommendation) => void;
  onOverride: (rec: Recommendation) => void;
  onDefer: (rec: Recommendation) => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  recommendation,
  onClose,
  onApprove,
  onReject,
  onOverride,
  onDefer
}) => {
  if (!recommendation) return null;

  const rec = recommendation;
  const breakdown = rec.score_breakdown || {
    urgency: 0,
    destination_demand: 0,
    excess_stock: 0,
    stock_value: 0,
    distance_suitability: 0,
    total: 0
  };

  const rules = rec.rules_triggered || [];

  return (
    <div
      id="evidence-drawer-overlay"
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex justify-end transition-opacity"
      onClick={onClose}
    >
      <div
        id="evidence-drawer-container"
        className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                {rec.recommendation_id}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  rec.priority === "Critical"
                    ? "bg-red-100 text-red-800"
                    : rec.priority === "High"
                    ? "bg-orange-100 text-orange-800"
                    : rec.priority === "Medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {rec.priority} Priority
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Action: {rec.recommended_action}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">{rec.medicine_name}</h2>
            <p className="text-xs text-slate-500">
              Batch: {rec.batch_id} • Generic: {rec.generic_name} • Storage: {rec.storage_type}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1 text-xs">
          {/* Decision Support Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <p className="font-semibold text-xs">Non-Clinical Decision-Support Scope</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                This evidence report provides inventory, batch expiry, and transport optimization facts only. It does NOT make prescribing, dosing, or clinical treatment determinations. Human authorization is compulsory before transit dispatch.
              </p>
            </div>
          </div>

          {/* Core Transfer Routing Overview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
              Redistribution Route &amp; Parameters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px] mb-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Source Location</span>
                </div>
                <p className="font-bold text-slate-900 text-sm">{rec.source_name}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Forecast Local Demand: <strong className="text-slate-800">{rec.source_demand} units</strong>
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-[11px] mb-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Proposed Destination</span>
                </div>
                <p className="font-bold text-slate-900 text-sm">
                  {rec.dest_name ? rec.dest_name : "No Suitable Destination Found"}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {rec.dest_name ? (
                    <>
                      Demand Absorption: <strong className="text-emerald-700">{rec.destination_demand} units</strong> • Transit: {rec.distance_km} km
                    </>
                  ) : (
                    <span className="text-amber-700 font-medium">Flagged for immediate local review</span>
                  )}
                </p>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <span className="text-slate-400 text-[10.5px] block">Batch Quantity</span>
                <span className="text-sm font-bold text-slate-900">{rec.quantity.toLocaleString()} units</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <span className="text-slate-400 text-[10.5px] block">Days to Expiry</span>
                <span className={`text-sm font-bold ${rec.days_to_expiry <= 7 ? "text-red-600" : "text-slate-900"}`}>
                  {rec.days_to_expiry} days
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <span className="text-slate-400 text-[10.5px] block">Stock Value</span>
                <span className="text-sm font-bold text-slate-900">₹{rec.estimated_stock_value.toLocaleString()}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <span className="text-slate-400 text-[10.5px] block">Recommendation Score</span>
                <span className="text-sm font-bold text-emerald-600">{rec.recommendation_score}/100</span>
              </div>
            </div>
          </div>

          {/* Explainable Recommendation Narrative */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Why This Recommendation?</span>
            </div>
            <p className="text-slate-700 leading-relaxed text-xs">
              {rec.reason}
            </p>
            <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap items-center gap-3 text-[11px] text-emerald-950 font-medium">
              <span>Confidence Score: {rec.recommendation_score}%</span>
              <span>•</span>
              <span>Batch Expiry Stamp: {rec.expiry_date}</span>
              <span>•</span>
              <span>Excess Over Local Consumption: {Math.max(0, rec.quantity - rec.source_demand).toFixed(0)} units</span>
            </div>
          </div>

          {/* Mathematical Score Breakdown */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Explainable Scoring Formula Breakdown</span>
              <span className="text-emerald-700 font-bold">{rec.recommendation_score} / 100</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Deterministic rule weighting: Urgency (35%) + Destination Demand (30%) + Excess Stock (20%) + Stock Value (10%) + Distance (5%).
            </p>

            <div className="space-y-2 pt-1">
              <div>
                <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-1">
                  <span>1. Expiry Urgency ({rec.days_to_expiry} days remaining)</span>
                  <span className="font-bold">{breakdown.urgency} / 35</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full"
                    style={{ width: `${(breakdown.urgency / 35) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-1">
                  <span>2. Destination Absorption Demand</span>
                  <span className="font-bold">{breakdown.destination_demand} / 30</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${(breakdown.destination_demand / 30) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-1">
                  <span>3. Excess Stock Above Local Catchment</span>
                  <span className="font-bold">{breakdown.excess_stock} / 20</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${(breakdown.excess_stock / 20) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-1">
                  <span>4. Economic Stock Value at Risk</span>
                  <span className="font-bold">{breakdown.stock_value} / 10</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${(breakdown.stock_value / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-1">
                  <span>5. Transit Distance Suitability ({rec.distance_km} km)</span>
                  <span className="font-bold">{breakdown.distance_suitability} / 5</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${(breakdown.distance_suitability / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rules Triggered Checklist */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Governance Rules Triggered
            </h3>
            <div className="space-y-2">
              {rules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 text-[11px]">{rule.rule}</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Human Confirmation Advisory */}
          {rec.requires_human_confirmation === 1 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-900">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="text-[11.5px] leading-relaxed">
                <strong>High-Impact Human Confirmation Mandate:</strong> This recommendation exceeds high-impact thresholds (Quantity &ge; 100 units, Value &ge; ₹5,000, or Expiry &le; 7 days). Algorithmic auto-dispatch is locked; manual human sign-off is compulsory.
              </div>
            </div>
          )}
        </div>

        {/* Drawer Action Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 sticky bottom-0 z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOverride(rec)}
              className="px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg cursor-pointer transition-colors"
            >
              Override Logic
            </button>
            <button
              onClick={() => onDefer(rec)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors"
            >
              Defer Action
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onReject(rec)}
              className="px-3 py-2 text-xs font-semibold text-red-700 bg-white hover:bg-red-50 border border-red-200 rounded-lg cursor-pointer transition-colors"
            >
              Reject
            </button>
            <button
              onClick={() => onApprove(rec)}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Recommendation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

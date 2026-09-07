import React from "react";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  Truck,
  Database,
  Lock,
  Warehouse,
  TrendingUp,
  ShieldCheck,
  HelpCircle
} from "lucide-react";

export const ErrorAnalysisPage: React.FC = () => {
  const failureModes = [
    {
      id: "err-1",
      title: "Failure Mode 1: Demand Spike / Surge in Consumption",
      icon: TrendingUp,
      errorType: "Demand Forecast Undershoot",
      expectedRecommendation: "System recommends TRANSFER to distant hub based on historical low velocity at source.",
      actualOutcome: "Sudden local fever outbreak causes local demand to surge by +300%, leaving source hub prematurely depleted after transfer dispatch.",
      impact: "Temporary localized stockout at source branch requiring emergency inter-depot re-order.",
      correctiveAction: "Incorporate real-time outbreak signals and implement dynamic local reserve buffers (minimum 7-day safety stock retained even during critical expiry windows).",
      classification: "Operational / Supply Chain Risk (Non-Clinical)"
    },
    {
      id: "err-2",
      title: "Failure Mode 2: Data Quality Anomaly (Negative Qty or Corrupted Expiry)",
      icon: Database,
      errorType: "Input Data Corruption / Inversion",
      expectedRecommendation: "Normal algorithm would process record and compute bogus priority or negative financial values.",
      actualOutcome: "System detects invalid date ('2023-14-45') or negative stock (-45 units). Instead of generating an invalid transfer, it flags record as DATA_QUALITY_ISSUE and isolates it.",
      impact: "Zero erroneous transfer orders dispatched; inventory discrepancy quarantined for manual physical count audit.",
      correctiveAction: "Strict pre-validation pipeline: automatic isolation of invalid records, automated ticket generation in data quality queue, and physical barcode audit prompt.",
      classification: "Data Governance / Integrity Guardrail (Non-Clinical)"
    },
    {
      id: "err-3",
      title: "Failure Mode 3: Fleet Logistics & Transport Disruption",
      icon: Truck,
      errorType: "Logistics Routing Latency",
      expectedRecommendation: "Inter-branch TRANSFER recommended with expected transit window of 12 hours.",
      actualOutcome: "Cold chain transport vehicle breakdown or severe monsoon road flooding delays transit by 72 hours, consuming remaining shelf life before arrival.",
      impact: "Transferred batch arrives at destination with < 24 hours of viable expiry remaining, risking transit spoilage.",
      correctiveAction: "Logistics buffer rule: minimum remaining shelf life must exceed (Transit Duration &times; 3). Cold chain vehicle telematics integrated to cancel transit recommendations if refrigerated fleet is offline.",
      classification: "Physical Logistics Risk (Non-Clinical)"
    },
    {
      id: "err-4",
      title: "Failure Mode 4: Storage Capacity & Temperature Constraint Exceeded",
      icon: Warehouse,
      errorType: "Destination Storage Capacity Constraint",
      expectedRecommendation: "Candidate destination selected based strictly on patient demand absorption.",
      actualOutcome: "Destination pharmacy's refrigerated vaccine/insulin cabinet is at 98% capacity; incoming 300-unit transfer cannot be physically stored under required 2–8°C conditions.",
      impact: "Risk of temperature excursion or physical congestion at receiving dispensary.",
      correctiveAction: "Strict destination storage capacity validation. The engine checks current occupancy against maximum cold storage volume before proposing destination routing.",
      classification: "Physical Storage Compliance (Non-Clinical)"
    },
    {
      id: "err-5",
      title: "Failure Mode 5: Pre-Allocated or Clinically Reserved Stock",
      icon: Lock,
      errorType: "Allocation State Collision",
      expectedRecommendation: "Engine identifies 200 units of oncology supportive care as excess and recommends transfer.",
      actualOutcome: "Stock was physically held/reserved for registered scheduled chemotherapy patients visiting next week, though not yet decremented by billing ERP.",
      impact: "Potential cancellation of confirmed appointments if stock is transferred out.",
      correctiveAction: "Batch status verification: only batches marked 'Available' are eligible for automated redistribution recommendations. 'Reserved' batches require supervisor override and patient confirmation.",
      classification: "Inventory Reservation Protocol (Non-Clinical)"
    }
  ];

  return (
    <div id="error-analysis-page" className="space-y-6 text-xs">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-100 text-red-800 rounded-xl">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Systemic Error Analysis &amp; Failure Modes</h2>
            <p className="text-xs text-slate-500">
              Rigorous documentation of edge cases, operational failure modes, and automated risk mitigations.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Scope Clarification */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-950 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-xs">Zero Clinical Risk Architecture</h4>
          <p className="text-[11.5px] leading-relaxed text-amber-900">
            Because this decision-support system strictly optimizes inventory shelf-life, supply routing, and storeroom quantities, its failure modes belong entirely to <strong>supply chain, logistics, and data governance</strong> domains. At no point does a failure mode risk patient diagnosis, therapeutic substitution, or medical prescribing.
          </p>
        </div>
      </div>

      {/* 5 Failure Mode Cards */}
      <div className="space-y-4">
        {failureModes.map((fm) => {
          const Icon = fm.icon;
          return (
            <div
              key={fm.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{fm.title}</h3>
                    <span className="text-[11px] font-semibold text-red-700">{fm.errorType}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[10.5px] font-semibold">
                  {fm.classification}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                  <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
                    Expected Recommendation
                  </span>
                  <p className="text-slate-800 leading-relaxed">{fm.expectedRecommendation}</p>
                </div>

                <div className="bg-red-50/50 p-3 rounded-lg border border-red-100 space-y-1">
                  <span className="text-[10.5px] font-bold text-red-800 uppercase tracking-wider block">
                    Actual Failure Outcome
                  </span>
                  <p className="text-slate-800 leading-relaxed">{fm.actualOutcome}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                <div className="bg-amber-50/40 p-3 rounded-lg border border-amber-100 space-y-1">
                  <span className="text-[10.5px] font-bold text-amber-900 uppercase tracking-wider block">
                    Operational Impact
                  </span>
                  <p className="text-slate-700 leading-relaxed">{fm.impact}</p>
                </div>

                <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 space-y-1">
                  <span className="text-[10.5px] font-bold text-emerald-900 uppercase tracking-wider block">
                    Implemented Corrective Guardrail
                  </span>
                  <p className="text-slate-800 leading-relaxed">{fm.correctiveAction}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

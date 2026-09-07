import React, { useState } from "react";
import {
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  Boxes,
  ArrowRightLeft,
  CheckSquare,
  FlaskConical
} from "lucide-react";

interface GuidedDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const GuidedDemoModal: React.FC<GuidedDemoModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  if (!isOpen) return null;

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      timeRange: "0:00 – 0:30",
      title: "Step 1: Network Inventory & Value at Risk",
      targetTab: "dashboard",
      icon: TrendingUp,
      headline: "The system monitors 10 regional hubs, detecting near-expiry stock before loss occurs.",
      description:
        "The Dashboard aggregates real-time batch statuses across 40 essential lines. Notice the KPI cards highlighting 'Potential Value at Risk', 'Near-Expiry Stock', and 'Value Saved'. Instead of discovering expired medicines in storerooms, operations teams receive automated visibility 90, 60, and 30 days prior.",
      takeaway: "High-contrast KPI telemetry instantly isolates critical at-risk inventory value."
    },
    {
      timeRange: "0:30 – 1:10",
      title: "Step 2: Expiry-Aware Recommendations",
      targetTab: "recommendations",
      icon: ArrowRightLeft,
      headline: "Multi-factor matching: Batch quantity, expiry days, local demand vs destination demand.",
      description:
        "Switch to the Recommendations center. Notice Scenario A (BATCH-10001): 350 units expiring in 5 days with high destination demand, triggering TRANSFER. Compare it with Scenario B (BATCH-10002): expiring in 3 days with no absorbable destination, triggering URGENT_REVIEW, and Scenario C: sufficient local demand triggering USE_LOCALLY.",
      takeaway: "Every batch is paired with an explainable action: USE_LOCALLY, TRANSFER, or URGENT_REVIEW."
    },
    {
      timeRange: "1:10 – 1:45",
      title: "Step 3: Recommendation Evidence & Rules",
      targetTab: "recommendations",
      icon: ShieldCheck,
      headline: "Open 'View Evidence' to inspect transparent scoring and rule triggers.",
      description:
        "The system explains every recommendation through an open evidence panel. Observe the mathematical score breakdown: 35% Expiry Urgency, 30% Destination Demand, 20% Excess Stock, 10% Stock Value, 5% Distance Suitability. Operational managers see exactly why a transfer was recommended before taking action.",
      takeaway: "100% explainability eliminates black-box AI risk in pharmaceutical inventory governance."
    },
    {
      timeRange: "1:45 – 2:15",
      title: "Step 4: Human-in-the-Loop Confirmation",
      targetTab: "recommendations",
      icon: CheckCircle2,
      headline: "High-impact transfers mandate human sign-off; overrides require documented reasons.",
      description:
        "Batches exceeding 100 units, ₹5,000 value, or ≤ 7 days expiry trigger mandatory human confirmation. Staff can Approve, Reject, or Override. If Override is chosen, an authorized operational justification code (e.g. cold chain vehicle service or reserved patient hold) is strictly enforced.",
      takeaway: "Zero autonomous clinical decisions. Complete regulatory accountability."
    },
    {
      timeRange: "2:15 – 2:35",
      title: "Step 5: Task Ownership & Automated Escalation",
      targetTab: "tasks",
      icon: CheckSquare,
      headline: "Every critical batch action is tracked to an owner with automated escalation.",
      description:
        "In the Tasks module, high-priority actions are assigned to specific staff (e.g. Hub Pharmacists or Inventory Leads) with strict due dates. If a task becomes overdue, the Escalation Engine elevates it automatically from Assigned (Level 0) to Supervisor (Level 1), Regional Manager (Level 2), and Operations Head (Level 3).",
      takeaway: "No urgent near-expiry batch disappears from the organizational workflow."
    },
    {
      timeRange: "2:35 – 2:50",
      title: "Step 6: Baseline vs Proposed Experiment",
      targetTab: "experiments",
      icon: FlaskConical,
      headline: "Reproducible synthetic experiment proving quantifiable wastage reduction.",
      description:
        "The Experiments page compares the current manual baseline (late reactive identification, single-hub silos) against the expiry-aware redistribution engine on the identical 11,250-record synthetic dataset. Review the side-by-side metric tables and recovery rate formulas.",
      takeaway: "Controlled evaluation confirms superior stock absorption before shelf expiry."
    },
    {
      timeRange: "2:50 – 3:00",
      title: "Step 7: Measured Results & Safety Summary",
      targetTab: "dashboard",
      icon: Sparkles,
      headline: "Recovery rate raised to >94%, avoidable stock write-offs reduced by over 80%.",
      description:
        "The final result shows dramatic improvement in 'Value of medicine stock used or transferred before expiry'. Average action time drops from 11.4 days to 1.8 days. Most importantly, the system remains strictly an inventory decision-support system without clinical or prescribing interference.",
      takeaway: "Measurable economic recovery with rigorous clinical boundaries."
    }
  ];

  const current = steps[currentStep];
  const StepIcon = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onNavigateTab(steps[nextStep].targetTab);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onNavigateTab(steps[prevStep].targetTab);
    }
  };

  return (
    <div
      id="guided-demo-overlay"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div
        id="guided-demo-card"
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-800 rounded-lg">
              <Sparkles className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">3-Minute Guided Walkthrough</h3>
                <span className="text-[10px] bg-emerald-600/80 px-2 py-0.5 rounded-full font-mono">
                  {current.timeRange}
                </span>
              </div>
              <p className="text-[11px] text-emerald-100">Step {currentStep + 1} of {steps.length}: {current.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-start gap-3 bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
            <div className="p-2.5 bg-white text-emerald-700 rounded-lg border border-emerald-200 shrink-0">
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{current.headline}</h4>
              <p className="text-slate-600 mt-1 leading-relaxed text-xs">{current.description}</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 text-slate-700 text-[11.5px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Key Evaluation Takeaway:</strong> {current.takeaway}
            </span>
          </div>
        </div>

        {/* Stepper Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentStep ? "bg-emerald-600 w-5" : "bg-slate-300"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
          >
            <span>{currentStep === steps.length - 1 ? "Complete Demo" : "Next Step"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { X, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";
import { Recommendation, UserRole } from "../types";

interface ApproveModalProps {
  recommendation: Recommendation | null;
  currentRole: UserRole;
  onClose: () => void;
  onConfirmApprove: (recId: string, comments: string) => Promise<void>;
}

export const ApproveModal: React.FC<ApproveModalProps> = ({
  recommendation,
  currentRole,
  onClose,
  onConfirmApprove
}) => {
  if (!recommendation) return null;

  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onConfirmApprove(recommendation.recommendation_id, comments);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="approve-modal-backdrop"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div
        id="approve-modal-dialog"
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-950">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold">Authorise Stock Transfer Action</h3>
              <p className="text-[11px] text-emerald-800">
                Mandatory Human Sign-off Verification
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="p-6 space-y-4 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{recommendation.medicine_name}</h4>
                <p className="text-slate-500 text-[11px]">Batch ID: {recommendation.batch_id} • Expires in {recommendation.days_to_expiry} days</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                Score: {recommendation.recommendation_score}/100
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">Transfer Route:</span>
                <span className="font-semibold text-slate-800">
                  {recommendation.source_name} &rarr; {recommendation.dest_name || "Local Branch"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Stock Value at Risk:</span>
                <span className="font-bold text-emerald-700">₹{recommendation.estimated_stock_value.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Confirmation Acknowledgment:</strong> I confirm that this inventory relocation complies with ambient/cold storage parameters and does not represent an automated clinical or prescribing decision.
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Transfer Dispatch Notes (Optional)
            </label>
            <input
              type="text"
              id="approve-comments-input"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g. Approved for morning delivery van batch..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="bg-slate-100 p-2.5 rounded-md text-[11px] text-slate-600 flex items-center justify-between">
            <span>Authorising User:</span>
            <strong className="text-slate-900">{currentRole}</strong>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              id="confirm-approve-btn"
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Approving..." : "Confirm & Authorise Transfer"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

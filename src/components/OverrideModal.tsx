import React, { useState } from "react";
import { X, AlertTriangle, ShieldCheck } from "lucide-react";
import { Recommendation, UserRole } from "../types";

interface OverrideModalProps {
  recommendation: Recommendation | null;
  currentRole: UserRole;
  onClose: () => void;
  onSubmitOverride: (recId: string, reason: string, comments: string) => Promise<void>;
}

const OVERRIDE_REASONS = [
  "Storage constraints (Destination cold chain/ambient bay full)",
  "Transport unavailable (Fleet vehicle maintenance/disruption)",
  "Destination capacity issue (Local depot shelving limits)",
  "Stock reserved (Prescription hold for home delivery order)",
  "Data quality issue (Discrepancy in physical vs ERP tally)",
  "Operational policy (Regional quarantine protocol active)",
  "Manual verification required (Blister seal inspection pending)",
  "Other operational reason"
];

export const OverrideModal: React.FC<OverrideModalProps> = ({
  recommendation,
  currentRole,
  onClose,
  onSubmitOverride
}) => {
  if (!recommendation) return null;

  const [selectedReason, setSelectedReason] = useState("");
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason.trim()) {
      setError("Please select a mandatory operational override justification code.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await onSubmitOverride(recommendation.recommendation_id, selectedReason, comments);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to process override");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="override-modal-backdrop"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div
        id="override-modal-dialog"
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold">Manual Recommendation Override</h3>
              <p className="text-[11px] text-amber-800">
                Governance Audit Trail: Justification is strictly mandatory.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
            <p className="font-semibold text-slate-800">{recommendation.medicine_name}</p>
            <p className="text-slate-500 text-[11px]">
              Rec: {recommendation.recommendation_id} • Action: {recommendation.recommended_action} • Value: ₹{recommendation.estimated_stock_value.toLocaleString()}
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Select Mandatory Justification Reason <span className="text-red-500">*</span>
            </label>
            <select
              id="override-reason-select"
              value={selectedReason}
              onChange={(e) => {
                setSelectedReason(e.target.value);
                setError("");
              }}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="">-- Select Justification Category --</option>
              {OVERRIDE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Authorised Operational Notes &amp; Comments
            </label>
            <textarea
              id="override-comments-textarea"
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide specific context (e.g. cold chain van temperature issue, reserved for patient order ID)..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="bg-slate-100 p-2.5 rounded-md text-[11px] text-slate-600 flex items-center justify-between">
            <span>Authorising User Role:</span>
            <strong className="text-slate-900">{currentRole}</strong>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

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
              id="confirm-override-btn"
              className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Logging Override..." : "Confirm & Save Override"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

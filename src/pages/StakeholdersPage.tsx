import React, { useEffect, useState } from "react";
import {
  Users,
  Star,
  MessageSquare,
  CheckCircle2,
  Send,
  Sparkles,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { api } from "../services/api";
import { StakeholderFeedback } from "../types";

export const StakeholdersPage: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<StakeholderFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // New feedback state
  const [role, setRole] = useState("Hospital Pharmacist");
  const [taskTested, setTaskTested] = useState("Redistribution Approval & Evidence Inspection");
  const [easeOfUse, setEaseOfUse] = useState(5);
  const [recommendationClarity, setRecommendationClarity] = useState(5);
  const [evidenceClarity, setEvidenceClarity] = useState(5);
  const [trustScore, setTrustScore] = useState(5);
  const [humanApprovalClarity, setHumanApprovalClarity] = useState(5);
  const [followUpUsability, setFollowUpUsability] = useState(4);
  const [comments, setComments] = useState("");

  const fetchFeedback = async () => {
    try {
      setIsLoading(true);
      const res = await api.getStakeholders();
      setFeedbackList(res.entries);
    } catch (err) {
      console.error("Failed to load feedback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setMessage("");
      await api.submitStakeholderFeedback({
        role,
        task_tested: taskTested,
        ease_of_use: easeOfUse,
        recommendation_clarity: recommendationClarity,
        evidence_clarity: evidenceClarity,
        trust_score: trustScore,
        human_approval_clarity: humanApprovalClarity,
        follow_up_usability: followUpUsability,
        comments
      });
      setMessage("Stakeholder feedback recorded successfully.");
      setComments("");
      fetchFeedback();
    } catch (err: any) {
      setMessage("Failed to submit feedback: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAverage = (field: keyof StakeholderFeedback) => {
    if (feedbackList.length === 0) return 0;
    const sum = feedbackList.reduce((acc, curr) => acc + (Number(curr[field]) || 0), 0);
    return Math.round((sum / feedbackList.length) * 10) / 10;
  };

  return (
    <div id="stakeholders-page" className="space-y-6 text-xs">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Prototype Validation &amp; Stakeholder Feedback</h2>
            <p className="text-xs text-slate-500">
              Structured evaluation across clinical pharmacists, inventory managers, and supply chain directors.
            </p>
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

      {/* Aggregate Metric Ratings */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Ease of Use", val: calculateAverage("ease_of_use") },
          { label: "Rec. Clarity", val: calculateAverage("recommendation_clarity") },
          { label: "Evidence Clarity", val: calculateAverage("evidence_clarity") },
          { label: "Trust Score", val: calculateAverage("trust_score") },
          { label: "Approval Clarity", val: calculateAverage("human_approval_clarity") },
          { label: "Task Usability", val: calculateAverage("follow_up_usability") }
        ].map((m, i) => (
          <div key={i} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-center">
            <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              {m.label}
            </span>
            <div className="flex items-center justify-center gap-1">
              <span className="text-xl font-extrabold text-slate-900">{m.val}</span>
              <span className="text-slate-400 text-xs">/ 5.0</span>
            </div>
            <div className="flex items-center justify-center gap-0.5 mt-1 text-amber-500">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout: Feedback List & Submit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Existing Reviews */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Documented User Feedback Records</h3>
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
              Loading user feedback...
            </div>
          ) : feedbackList.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
              No feedback records submitted yet.
            </div>
          ) : (
            feedbackList.map((fb) => (
              <div
                key={fb.feedback_id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-xs">{fb.role}</span>
                  </div>
                  <span className="text-[10.5px] text-slate-400 font-mono">{fb.created_at}</span>
                </div>

                <div className="text-[11px] text-slate-500 font-medium">
                  Tested: <span className="text-slate-800">{fb.task_tested}</span>
                </div>

                <div className="flex flex-wrap gap-2 text-[10.5px]">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    Ease: {fb.ease_of_use}/5
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    Evidence: {fb.evidence_clarity}/5
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    Trust: {fb.trust_score}/5
                  </span>
                </div>

                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic text-[11.5px]">
                  &ldquo;{fb.comments}&rdquo;
                </p>
              </div>
            ))
          )}
        </div>

        {/* Submit Form */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Submit Prototype Test Evaluation</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Evaluator Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 text-xs"
              >
                <option value="Hospital Pharmacist">Hospital Pharmacist</option>
                <option value="Inventory Stock Lead">Inventory Stock Lead</option>
                <option value="Operations Director">Operations Director</option>
                <option value="Quality & Compliance Auditor">Quality &amp; Compliance Auditor</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Task Tested</label>
              <input
                type="text"
                value={taskTested}
                onChange={(e) => setTaskTested(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <label className="block text-slate-600 mb-0.5">Ease of Use (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={easeOfUse}
                  onChange={(e) => setEaseOfUse(Number(e.target.value))}
                  className="w-full p-1.5 border border-slate-300 rounded text-center"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-0.5">Rec. Clarity (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={recommendationClarity}
                  onChange={(e) => setRecommendationClarity(Number(e.target.value))}
                  className="w-full p-1.5 border border-slate-300 rounded text-center"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-0.5">Evidence Clarity (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={evidenceClarity}
                  onChange={(e) => setEvidenceClarity(Number(e.target.value))}
                  className="w-full p-1.5 border border-slate-300 rounded text-center"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-0.5">Trust Score (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={trustScore}
                  onChange={(e) => setTrustScore(Number(e.target.value))}
                  className="w-full p-1.5 border border-slate-300 rounded text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Evaluator Comments &amp; Notes</label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Observed benefits, workflow remarks, safety compliance..."
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Submitting..." : "Submit Evaluation Feedback"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

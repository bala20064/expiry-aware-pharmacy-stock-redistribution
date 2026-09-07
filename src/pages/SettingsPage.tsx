import React, { useEffect, useState } from "react";
import {
  Settings,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  ShieldCheck,
  Info
} from "lucide-react";
import { api } from "../services/api";
import { AppSetting } from "../types";

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [originalSettings, setOriginalSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await api.getSettings();
      const mapped: Record<string, string> = {};
      res.settings.forEach((s) => {
        mapped[s.setting_key] = s.setting_value;
      });
      setSettings(mapped);
      setOriginalSettings(mapped);
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setMessage("");
      await api.updateSettings(settings);
      setMessage("Settings successfully updated and recommendations re-calculated with new parameters.");
      setOriginalSettings(settings);
    } catch (err: any) {
      setMessage("Error updating settings: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading governance parameters...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="settings-page" className="space-y-6 text-xs">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Configurable Governance Rules &amp; Scoring Weights</h2>
            <p className="text-xs text-slate-500">
              Customize multi-criteria recommendation scoring weights, high-impact human review thresholds, and escalation SLAs.
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Scoring Weights Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Deterministic Recommendation Scoring Weights</h3>
              <p className="text-[11px] text-slate-500">
                Weights must sum up to 1.0 (100%). These weights control multi-criteria ranking.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Sum: {(
                Number(settings.weight_urgency || 0.35) +
                Number(settings.weight_destination_demand || 0.30) +
                Number(settings.weight_excess_stock || 0.20) +
                Number(settings.weight_stock_value || 0.10) +
                Number(settings.weight_distance || 0.05)
              ).toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Expiry Urgency Weight (0–1)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={settings.weight_urgency || "0.35"}
                onChange={(e) => handleChange("weight_urgency", e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <span className="text-[10.5px] text-slate-400 mt-1 block">Default: 0.35 (35%)</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Destination Demand Weight
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={settings.weight_destination_demand || "0.30"}
                onChange={(e) => handleChange("weight_destination_demand", e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <span className="text-[10.5px] text-slate-400 mt-1 block">Default: 0.30 (30%)</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Excess Stock Weight
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={settings.weight_excess_stock || "0.20"}
                onChange={(e) => handleChange("weight_excess_stock", e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <span className="text-[10.5px] text-slate-400 mt-1 block">Default: 0.20 (20%)</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Stock Value Weight
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={settings.weight_stock_value || "0.10"}
                onChange={(e) => handleChange("weight_stock_value", e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <span className="text-[10.5px] text-slate-400 mt-1 block">Default: 0.10 (10%)</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Distance Suitability Weight
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={settings.weight_distance || "0.05"}
                onChange={(e) => handleChange("weight_distance", e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <span className="text-[10.5px] text-slate-400 mt-1 block">Default: 0.05 (5%)</span>
            </div>
          </div>
        </div>

        {/* Operational & Governance Thresholds */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Operational Horizons &amp; Mandatory Human Confirmation</h3>
            <p className="text-[11px] text-slate-500">
              Thresholds defining when a batch enters critical review or mandates explicit human supervisor authorization.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Critical Expiry Horizon (Days)
              </label>
              <input
                type="number"
                value={settings.critical_expiry_days || "7"}
                onChange={(e) => handleChange("critical_expiry_days", e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <span className="text-[10.5px] text-slate-400 mt-1 block">Batches &le; this require daily review</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                High Impact Quantity Threshold (Units)
              </label>
              <input
                type="number"
                value={settings.high_impact_quantity_threshold || "100"}
                onChange={(e) => handleChange("high_impact_quantity_threshold", e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <span className="text-[10.5px] text-slate-400 mt-1 block">Transfers &ge; this require human sign-off</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                High Impact Stock Value Threshold (₹)
              </label>
              <input
                type="number"
                value={settings.high_impact_value_threshold || "5000"}
                onChange={(e) => handleChange("high_impact_value_threshold", e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <span className="text-[10.5px] text-slate-400 mt-1 block">Batches &ge; this require supervisor approval</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Max Feasible Transfer Distance (km)
              </label>
              <input
                type="number"
                value={settings.max_transfer_distance_km || "45"}
                onChange={(e) => handleChange("max_transfer_distance_km", e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <span className="text-[10.5px] text-slate-400 mt-1 block">Maximum road transit corridor</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Task Escalation SLA (Hours)
              </label>
              <input
                type="number"
                value={settings.escalation_hours_level_1 || "24"}
                onChange={(e) => handleChange("escalation_hours_level_1", e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <span className="text-[10.5px] text-slate-400 mt-1 block">Time before overdue task escalates to Level 1</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
          >
            Reset Changes
          </button>
          <button
            type="submit"
            disabled={isSaving}
            id="save-settings-btn"
            className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving & Re-scoring..." : "Apply & Recalculate Matrix"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

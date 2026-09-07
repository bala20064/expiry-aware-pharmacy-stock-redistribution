import React from "react";
import { ShieldAlert, AlertTriangle } from "lucide-react";

export const SafetyBanner: React.FC = () => {
  return (
    <div
      id="safety-decision-banner"
      className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between shadow-xs sticky top-0 z-40"
    >
      <div className="flex items-center gap-2 max-w-5xl">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
        <p className="font-medium leading-relaxed">
          <strong className="font-semibold text-amber-950">Decision-support only:</strong> This system does not make autonomous diagnostic, prescribing, or treatment decisions. Inventory actions require authorised human confirmation.
        </p>
      </div>
      <div className="hidden md:flex items-center gap-1.5 text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded text-[11px] font-medium shrink-0">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        <span>Inventory Scope Only</span>
      </div>
    </div>
  );
};

export const SafetyFooter: React.FC = () => {
  return (
    <footer id="app-operational-footer" className="bg-slate-900 text-slate-400 py-6 px-6 border-t border-slate-800 text-xs mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-3xl">
          <p className="text-slate-200 font-semibold text-sm">
            Operational Decision Support Only
          </p>
          <p className="text-slate-400 leading-relaxed text-[11.5px]">
            This system provides inventory and stock redistribution recommendations based on expiry, quantity, demand and location data. It does not diagnose conditions, prescribe medicines, recommend treatments or dosages, modify prescriptions, or make autonomous clinical decisions. High-impact inventory actions require authorised human confirmation.
          </p>
        </div>
        <div className="text-right shrink-0 text-slate-500 text-[11px] flex flex-col md:items-end">
          <span className="text-emerald-400 font-medium">Synthetic Simulation Environment</span>
          <span>Seed: 42 (Reproducible 11,250 records)</span>
          <span>Chennai Regional Hub Network</span>
        </div>
      </div>
    </footer>
  );
};

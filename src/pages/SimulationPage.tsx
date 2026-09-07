import React, { useState, useEffect } from "react";
import {
  SlidersHorizontal,
  Calendar,
  Truck,
  TrendingUp,
  AlertTriangle,
  Play,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Info
} from "lucide-react";
import { api } from "../services/api";

interface SimulationPageProps {
  onSimulationUpdated?: () => void;
}

export const SimulationPage: React.FC<SimulationPageProps> = ({ onSimulationUpdated }) => {
  const [simulationDate, setSimulationDate] = useState("2026-09-10");
  const [scenario, setScenario] = useState("Normal Demand");
  const [transportStatus, setTransportStatus] = useState("Available");
  const [isRunning, setIsRunning] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const SCENARIOS = [
    {
      id: "Normal Demand",
      name: "Normal Seasonal Baseline",
      desc: "Standard consumption velocity across metropolitan and suburban dispensaries."
    },
    {
      id: "High Demand",
      name: "Epidemic / Seasonal Spike",
      desc: "Surge in fever/monsoon ailments (+35% antibiotics and paracetamol consumption)."
    },
    {
      id: "Low Demand",
      name: "Low Clinic Footfall",
      desc: "Reduced patient visitations (-20%), creating higher risk of excess stock expiration."
    },
    {
      id: "Demand Spike",
      name: "Regional Hub Outbreak Demand",
      desc: "Localized demand jump at Chennai Central and Anna Nagar hubs."
    },
    {
      id: "Transport Disruption",
      name: "Fleet Transport Delay / Roadblock",
      desc: "48-hour delivery delay; cold chain vehicles constrained to short-haul trips."
    },
    {
      id: "Storage Constraint",
      name: "Storage Capacity Threshold Exceeded",
      desc: "Target dispensaries have >90% storage occupancy; strict intake limit."
    }
  ];

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsRunning(true);
      setResultMessage("");
      const res = await api.runSimulation({
        simulation_date: simulationDate,
        scenario,
        transport_status: transportStatus
      });
      setResultMessage(res.message);
      if (onSimulationUpdated) onSimulationUpdated();
    } catch (err: any) {
      setResultMessage("Simulation failed: " + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div id="simulation-page" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Interactive What-If Simulation Sandbox</h2>
            <p className="text-xs text-slate-500">
              Stress-test the redistribution engine under varying demand shocks, calendar dates, and logistics bottlenecks.
            </p>
          </div>
        </div>
      </div>

      {resultMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl text-xs flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1 font-medium">{resultMessage}</div>
        </div>
      )}

      {/* Main Simulation Form */}
      <form onSubmit={handleRunSimulation} className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Parameters Column */}
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Simulation Parameters</h3>

          {/* Date Picker */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Simulation Reference Date</span>
            </label>
            <input
              type="date"
              id="sim-date-input"
              value={simulationDate}
              onChange={(e) => setSimulationDate(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Shifts the evaluation timeline forward or backward against fixed batch expiry stamps.
            </p>
          </div>

          {/* Transport Condition */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-slate-500" />
              <span>Logistics &amp; Transport Fleet Status</span>
            </label>
            <select
              id="sim-transport-select"
              value={transportStatus}
              onChange={(e) => setTransportStatus(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Available">Available (Normal dispatch)</option>
              <option value="Disrupted">Disrupted / Restricted (Severe weather, road blocks)</option>
              <option value="ColdChainOffline">Cold Chain Van Temporarily Offline</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isRunning}
              id="run-simulation-submit-btn"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Recalculating Decision Matrix...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute What-If Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scenarios Selection Column */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Select Demand &amp; Operational Shock Scenario</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SCENARIOS.map((sc) => (
              <div
                key={sc.id}
                onClick={() => setScenario(sc.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  scenario === sc.id
                    ? "border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
                }`}
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-slate-900 text-xs">{sc.name}</h4>
                  <input
                    type="radio"
                    name="scenario"
                    checked={scenario === sc.id}
                    onChange={() => setScenario(sc.id)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{sc.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[11.5px] leading-relaxed">
              When simulation runs, the Python recommendation engine re-scores all 11,250 database records in real-time, regenerates priority ranks, updates destination matches, and produces comparative recovery KPIs.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

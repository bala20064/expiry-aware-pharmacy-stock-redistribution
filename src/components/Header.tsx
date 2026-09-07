import React, { useState } from "react";
import {
  Pill,
  Bell,
  Search,
  Sparkles,
  Download,
  RotateCcw,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet
} from "lucide-react";
import { UserRole } from "../types";

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onStartDemo: () => void;
  onResetDemo: () => void;
  onGlobalSearch: (term: string) => void;
  activeNav: string;
  onNavSelect: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onStartDemo,
  onResetDemo,
  onGlobalSearch,
  activeNav,
  onNavSelect
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onGlobalSearch(searchTerm.trim());
    }
  };

  const notifications = [
    {
      id: "n-1",
      title: "BATCH-10001 requires transfer authorization",
      type: "critical",
      time: "2m ago",
      tab: "recommendations"
    },
    {
      id: "n-2",
      title: "TASK-1002 is past due date (Level 1 Escalation)",
      type: "warning",
      time: "15m ago",
      tab: "tasks"
    },
    {
      id: "n-3",
      title: "Negative quantity recorded in BATCH-10012",
      type: "info",
      time: "1h ago",
      tab: "data-quality"
    }
  ];

  return (
    <header id="main-app-header" className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => onNavSelect("dashboard")}>
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                  PharmEx Redistribution
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  Decision Support
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Expiry-Aware Pharmacy Stock Redistribution &amp; Monitoring
              </p>
            </div>
          </div>

          {/* Global Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="global-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Medicine, Batch ID, Location, Rec ID..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder-slate-400 transition-all"
              />
            </div>
          </form>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Guided Demo Button */}
            <button
              id="start-demo-btn"
              onClick={onStartDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Start 3-Min Demo</span>
              <span className="sm:hidden">Demo</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                id="export-reports-btn"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Export Reports"
              >
                <Download className="w-4 h-4" />
              </button>

              {showExportMenu && (
                <div
                  id="export-dropdown-menu"
                  className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 text-xs"
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Export CSV Data
                  </div>
                  <a
                    href="/api/export/inventory"
                    download="inventory.csv"
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                    Inventory Report (CSV)
                  </a>
                  <a
                    href="/api/export/recommendations"
                    download="recommendations.csv"
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    Redistribution Recommendations
                  </a>
                  <a
                    href="/api/export/tasks"
                    download="tasks.csv"
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                    Follow-up Tasks Report
                  </a>
                  <a
                    href="/api/export/audit"
                    download="audit_log.csv"
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                    Governance Audit Trail
                  </a>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                id="notifications-bell-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>

              {showNotifications && (
                <div
                  id="notifications-panel"
                  className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50 text-xs"
                >
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-800">Operational Alerts</span>
                    <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">3 Active</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          onNavSelect(n.tab);
                          setShowNotifications(false);
                        }}
                        className="px-3 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          {n.type === "critical" ? (
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          ) : n.type === "warning" ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium text-slate-800 leading-tight">{n.title}</p>
                            <span className="text-[10px] text-slate-400 mt-1 inline-block">{n.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-3 pt-2 pb-1 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        onNavSelect("tasks");
                        setShowNotifications(false);
                      }}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      View All Operational Tasks →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <UserCheck className="w-4 h-4 text-slate-400 hidden sm:block" />
              <select
                id="user-role-select"
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Pharmacist / Supervisor">Role: Pharmacist (Reviewer)</option>
                <option value="Operations Manager">Role: Operations Manager</option>
                <option value="Inventory Staff">Role: Inventory Staff</option>
              </select>
            </div>

            {/* Reset Demo Button */}
            <button
              id="reset-demo-btn"
              onClick={onResetDemo}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Reset Simulation State"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

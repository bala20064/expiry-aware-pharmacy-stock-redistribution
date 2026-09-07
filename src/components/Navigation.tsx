import React from "react";
import {
  LayoutDashboard,
  Boxes,
  ArrowRightLeft,
  CheckSquare,
  SlidersHorizontal,
  FlaskConical,
  AlertOctagon,
  ShieldCheck,
  History,
  Settings,
  Users,
  Terminal
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  openTasksCount?: number;
  criticalRecsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  openTasksCount = 0,
  criticalRecsCount = 0
}) => {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "inventory", label: "Inventory", icon: Boxes },
    {
      id: "recommendations",
      label: "Recommendations",
      icon: ArrowRightLeft,
      badge: criticalRecsCount > 0 ? criticalRecsCount : undefined,
      badgeColor: "bg-red-500"
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: CheckSquare,
      badge: openTasksCount > 0 ? openTasksCount : undefined,
      badgeColor: "bg-amber-500"
    },
    { id: "simulation", label: "Simulation", icon: SlidersHorizontal },
    { id: "experiments", label: "Experiments", icon: FlaskConical },
    { id: "error-analysis", label: "Error Analysis", icon: AlertOctagon },
    { id: "data-quality", label: "Data Quality", icon: ShieldCheck },
    { id: "audit-log", label: "Audit Log", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "stakeholders", label: "Stakeholders", icon: Users },
    { id: "tests", label: "System Tests", icon: Terminal }
  ];

  return (
    <nav id="primary-navigation" className="bg-slate-50 border-b border-slate-200 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                    isActive ? "bg-white text-emerald-800" : `${tab.badgeColor} text-white`
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

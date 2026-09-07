import React, { useState, useEffect } from "react";
import { UserRole, Recommendation } from "./types";
import { api } from "./services/api";

// Components
import { SafetyBanner, SafetyFooter } from "./components/SafetyBanner";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { EvidenceDrawer } from "./components/EvidenceDrawer";
import { ApproveModal } from "./components/ApproveModal";
import { OverrideModal } from "./components/OverrideModal";
import { GuidedDemoModal } from "./components/GuidedDemoModal";

// Pages
import { DashboardPage } from "./pages/DashboardPage";
import { InventoryPage } from "./pages/InventoryPage";
import { RecommendationsPage } from "./pages/RecommendationsPage";
import { TasksPage } from "./pages/TasksPage";
import { SimulationPage } from "./pages/SimulationPage";
import { ExperimentsPage } from "./pages/ExperimentsPage";
import { ErrorAnalysisPage } from "./pages/ErrorAnalysisPage";
import { DataQualityPage } from "./pages/DataQualityPage";
import { AuditLogPage } from "./pages/AuditLogPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StakeholdersPage } from "./pages/StakeholdersPage";
import { TestsPage } from "./pages/TestsPage";

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>("Pharmacist / Supervisor");
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [globalSearchTerm, setGlobalSearchTerm] = useState<string>("");

  // Modals & Drawers
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [selectedForEvidence, setSelectedForEvidence] = useState<Recommendation | null>(null);
  const [selectedForApprove, setSelectedForApprove] = useState<Recommendation | null>(null);
  const [selectedForOverride, setSelectedForOverride] = useState<Recommendation | null>(null);

  // Sub-filters triggered across views
  const [recPriorityFilter, setRecPriorityFilter] = useState("");
  const [tasksFilterTab, setTasksFilterTab] = useState("all");

  // Badge counts
  const [criticalRecsCount, setCriticalRecsCount] = useState(1);
  const [openTasksCount, setOpenTasksCount] = useState(2);

  const fetchBadgeCounts = async () => {
    try {
      const d = await api.getDashboard();
      setCriticalRecsCount(d.kpis.critical_batches_count);
      setOpenTasksCount(d.kpis.open_high_priority_actions);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchBadgeCounts();
  }, [activeTab]);

  const handleGlobalSearch = (term: string) => {
    setGlobalSearchTerm(term);
    // If user searches for a batch or rec, route to recommendations or inventory
    if (term.toUpperCase().startsWith("REC") || term.toUpperCase().startsWith("BAT")) {
      setActiveTab("recommendations");
    } else {
      setActiveTab("inventory");
    }
  };

  const handleTabNavigation = (tab: string, filter?: string) => {
    setActiveTab(tab);
    if (tab === "recommendations" && filter) {
      setRecPriorityFilter(filter);
    } else {
      setRecPriorityFilter("");
    }
    if (tab === "tasks" && filter) {
      setTasksFilterTab(filter);
    } else {
      setTasksFilterTab("all");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetDemo = async () => {
    if (confirm("Reset simulation database to initial pristine demonstration state?")) {
      try {
        await api.resetDemo();
        alert("Demo environment refreshed with original baseline records.");
        window.location.reload();
      } catch (err: any) {
        alert("Failed to reset demo: " + err.message);
      }
    }
  };

  const handleConfirmApprove = async (recId: string, comments: string) => {
    await api.approveRecommendation(recId, {
      reviewer_name: currentRole,
      comments
    });
    fetchBadgeCounts();
  };

  const handleConfirmOverride = async (recId: string, reason: string, comments: string) => {
    await api.overrideRecommendation(recId, {
      reviewer_name: currentRole,
      override_reason: reason,
      comments
    });
    fetchBadgeCounts();
  };

  const handleQuickDefer = async (rec: Recommendation) => {
    await api.deferRecommendation(rec.recommendation_id, {
      reviewer_name: currentRole,
      reason: "Deferred from evidence drawer"
    });
    setSelectedForEvidence(null);
    fetchBadgeCounts();
  };

  const handleQuickReject = async (rec: Recommendation) => {
    if (!confirm(`Reject recommendation ${rec.recommendation_id}?`)) return;
    await api.rejectRecommendation(rec.recommendation_id, {
      reviewer_name: currentRole,
      reason: "Rejected in evidence inspection"
    });
    setSelectedForEvidence(null);
    fetchBadgeCounts();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-200">
      {/* 1. Mandatory Safety Banner */}
      <SafetyBanner />

      {/* 2. Top Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onStartDemo={() => setIsDemoOpen(true)}
        onResetDemo={handleResetDemo}
        onGlobalSearch={handleGlobalSearch}
        activeNav={activeTab}
        onNavSelect={handleTabNavigation}
      />

      {/* 3. Primary Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={handleTabNavigation}
        openTasksCount={openTasksCount}
        criticalRecsCount={criticalRecsCount}
      />

      {/* 4. Main Page View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "dashboard" && (
          <DashboardPage
            onNavigateTab={handleTabNavigation}
            onOpenEvidenceForId={async (recId) => {
              const fullRec = await api.getRecommendation(recId);
              setSelectedForEvidence(fullRec);
            }}
          />
        )}

        {activeTab === "inventory" && (
          <InventoryPage
            initialSearch={globalSearchTerm}
            onSelectBatchForRecommendation={() => setActiveTab("recommendations")}
          />
        )}

        {activeTab === "recommendations" && (
          <RecommendationsPage
            currentRole={currentRole}
            initialPriority={recPriorityFilter}
            onOpenEvidence={(rec) => setSelectedForEvidence(rec)}
            onOpenApprove={(rec) => setSelectedForApprove(rec)}
            onOpenOverride={(rec) => setSelectedForOverride(rec)}
          />
        )}

        {activeTab === "tasks" && (
          <TasksPage
            currentRole={currentRole}
            initialFilterTab={tasksFilterTab}
            onNavigateRec={() => setActiveTab("recommendations")}
          />
        )}

        {activeTab === "simulation" && (
          <SimulationPage onSimulationUpdated={fetchBadgeCounts} />
        )}

        {activeTab === "experiments" && <ExperimentsPage />}

        {activeTab === "error-analysis" && <ErrorAnalysisPage />}

        {activeTab === "data-quality" && <DataQualityPage />}

        {activeTab === "audit-log" && <AuditLogPage />}

        {activeTab === "settings" && <SettingsPage />}

        {activeTab === "stakeholders" && <StakeholdersPage />}

        {activeTab === "tests" && <TestsPage />}
      </main>

      {/* 5. Modals & Drawers */}
      <EvidenceDrawer
        recommendation={selectedForEvidence}
        onClose={() => setSelectedForEvidence(null)}
        onApprove={(rec) => {
          setSelectedForEvidence(null);
          setSelectedForApprove(rec);
        }}
        onReject={handleQuickReject}
        onOverride={(rec) => {
          setSelectedForEvidence(null);
          setSelectedForOverride(rec);
        }}
        onDefer={handleQuickDefer}
      />

      <ApproveModal
        recommendation={selectedForApprove}
        currentRole={currentRole}
        onClose={() => setSelectedForApprove(null)}
        onConfirmApprove={handleConfirmApprove}
      />

      <OverrideModal
        recommendation={selectedForOverride}
        currentRole={currentRole}
        onClose={() => setSelectedForOverride(null)}
        onSubmitOverride={handleConfirmOverride}
      />

      <GuidedDemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onNavigateTab={handleTabNavigation}
      />

      {/* 6. Mandatory Operational Safety Footer */}
      <SafetyFooter />
    </div>
  );
}

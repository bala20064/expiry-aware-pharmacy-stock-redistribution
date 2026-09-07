import {
  DashboardKpis,
  DashboardCharts,
  InventoryBatch,
  Recommendation,
  FollowUpTask,
  AuditLogEntry,
  DataQualityIssue,
  ExperimentResults,
  AppSetting,
  StakeholderFeedback
} from "../types";

export interface DashboardResponse {
  kpis: DashboardKpis;
  charts: DashboardCharts;
  alerts: { id: string; type: string; title: string; message: string; action_link: string }[];
}

export interface InventoryResponse {
  data: InventoryBatch[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    total_stock_value: number;
  };
}

export interface RecommendationsResponse {
  data: Recommendation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface DataQualityResponse {
  summary: {
    total_records: number;
    valid_records: number;
    problematic_records: number;
    data_quality_pct: number;
  };
  issues: DataQualityIssue[];
}

export const api = {
  async getDashboard(): Promise<DashboardResponse> {
    const res = await fetch("/api/dashboard");
    if (!res.ok) throw new Error("Failed to fetch dashboard metrics");
    return res.json();
  },

  async getInventory(params: Record<string, string | number>): Promise<InventoryResponse> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`/api/inventory?${query}`);
    if (!res.ok) throw new Error("Failed to fetch inventory");
    return res.json();
  },

  async getInventoryBatch(id: string): Promise<{ batch: InventoryBatch; recommendation: Recommendation | null }> {
    const res = await fetch(`/api/inventory/${id}`);
    if (!res.ok) throw new Error("Failed to fetch batch details");
    return res.json();
  },

  async getRecommendations(params: Record<string, string | number | boolean>): Promise<RecommendationsResponse> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`/api/recommendations?${query}`);
    if (!res.ok) throw new Error("Failed to fetch recommendations");
    return res.json();
  },

  async getRecommendation(id: string): Promise<Recommendation & { reviews: any[]; audit_trail: AuditLogEntry[] }> {
    const res = await fetch(`/api/recommendations/${id}`);
    if (!res.ok) throw new Error("Failed to fetch recommendation");
    return res.json();
  },

  async approveRecommendation(id: string, payload: { reviewer_name: string; comments?: string }) {
    const res = await fetch(`/api/recommendations/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to approve recommendation");
    }
    return res.json();
  },

  async rejectRecommendation(id: string, payload: { reviewer_name: string; reason: string; comments?: string }) {
    const res = await fetch(`/api/recommendations/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to reject recommendation");
    }
    return res.json();
  },

  async overrideRecommendation(id: string, payload: { reviewer_name: string; override_reason: string; comments?: string }) {
    const res = await fetch(`/api/recommendations/${id}/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.error || "Override failed. Reason is required.");
    }
    return res.json();
  },

  async deferRecommendation(id: string, payload: { reviewer_name: string; reason?: string; comments?: string }) {
    const res = await fetch(`/api/recommendations/${id}/defer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to defer recommendation");
    }
    return res.json();
  },

  async getTasks(filterTab: string = "all", search: string = ""): Promise<{ tasks: FollowUpTask[] }> {
    const params = new URLSearchParams({ filterTab, search }).toString();
    const res = await fetch(`/api/tasks?${params}`);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return res.json();
  },

  async createTask(payload: { recommendation_id: string; owner: string; due_date: string; priority: string }) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to create task");
    return res.json();
  },

  async updateTask(id: string, payload: { status?: string; owner?: string; escalation_level?: number }) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to update task");
    return res.json();
  },

  async runEscalationCheck(): Promise<{ success: boolean; escalated_count: number }> {
    const res = await fetch("/api/tasks/escalate-check", { method: "POST" });
    if (!res.ok) throw new Error("Failed to check escalations");
    return res.json();
  },

  async getAuditLogs(params: Record<string, string | number> = {}): Promise<{ logs: AuditLogEntry[] }> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`/api/audit?${query}`);
    if (!res.ok) throw new Error("Failed to fetch audit trail");
    return res.json();
  },

  async getExperiments(): Promise<ExperimentResults> {
    const res = await fetch("/api/experiments");
    if (!res.ok) throw new Error("Failed to fetch experiment results");
    return res.json();
  },

  async runSimulation(payload: { simulation_date: string; scenario: string; transport_status: string }) {
    const res = await fetch("/api/simulation/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Simulation run failed");
    return res.json();
  },

  async getDataQuality(): Promise<DataQualityResponse> {
    const res = await fetch("/api/data-quality");
    if (!res.ok) throw new Error("Failed to fetch data quality metrics");
    return res.json();
  },

  async resolveDataQualityIssue(id: string) {
    const res = await fetch(`/api/data-quality/${id}/resolve`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to resolve issue");
    return res.json();
  },

  async getSettings(): Promise<{ settings: AppSetting[] }> {
    const res = await fetch("/api/settings");
    if (!res.ok) throw new Error("Failed to load settings");
    return res.json();
  },

  async updateSettings(settings: Record<string, string>) {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings })
    });
    if (!res.ok) throw new Error("Failed to save settings");
    return res.json();
  },

  async getStakeholders(): Promise<{ entries: StakeholderFeedback[] }> {
    const res = await fetch("/api/stakeholders");
    if (!res.ok) throw new Error("Failed to fetch stakeholder feedback");
    return res.json();
  },

  async submitStakeholderFeedback(payload: Omit<StakeholderFeedback, "feedback_id" | "created_at">) {
    const res = await fetch("/api/stakeholders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to submit feedback");
    return res.json();
  },

  async runTests(): Promise<{ success: boolean; tests: { name: string; suite: string; status: string }[]; raw_logs: string }> {
    const res = await fetch("/api/tests/run");
    if (!res.ok) throw new Error("Test run failed");
    return res.json();
  },

  async resetDemo() {
    const res = await fetch("/api/demo/reset", { method: "POST" });
    if (!res.ok) throw new Error("Demo reset failed");
    return res.json();
  }
};

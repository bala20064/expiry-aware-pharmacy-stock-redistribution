// TypeScript domain definitions for Expiry-Aware Pharmacy Stock Redistribution

export type UserRole = "Inventory Staff" | "Pharmacist / Supervisor" | "Operations Manager";

export type ExpiryPriority = "Critical" | "High" | "Medium" | "Low" | "Normal";

export type RecommendedAction = "USE_LOCALLY" | "TRANSFER" | "MONITOR" | "URGENT_REVIEW" | "NO_ACTION";

export type RecommendationStatus = "Pending" | "Approved" | "Rejected" | "Overridden" | "Deferred" | "Executed";

export type TaskStatus = "Open" | "In Progress" | "Completed" | "Overdue" | "Escalated";

export interface Medicine {
  medicine_id: string;
  medicine_name: string;
  generic_name: string;
  category: string;
  unit_price: number;
  pack_size: number;
  storage_type: "Ambient" | "Cold Storage (2-8C)" | "Controlled";
}

export interface Location {
  location_id: string;
  location_name: string;
  city: string;
  latitude: number;
  longitude: number;
  storage_capacity: number;
  current_occupancy: number;
}

export interface InventoryBatch {
  batch_id: string;
  medicine_id: string;
  location_id: string;
  quantity: number;
  expiry_date: string;
  received_date: string;
  unit_price: number;
  batch_status: "Available" | "Reserved" | "Near Expiry" | "Expired" | "Transferred" | "Consumed";
  is_data_corrupted: number;
  corruption_reason: string | null;
  medicine_name?: string;
  generic_name?: string;
  category?: string;
  storage_type?: string;
  location_name?: string;
  stock_value: number;
  days_to_expiry: number;
  priority: ExpiryPriority;
  expiry_bucket: string;
}

export interface RuleTriggered {
  rule: string;
  description: string;
}

export interface ScoreBreakdown {
  urgency: number;
  destination_demand: number;
  excess_stock: number;
  stock_value: number;
  distance_suitability: number;
  total: number;
}

export interface Recommendation {
  recommendation_id: string;
  batch_id: string;
  medicine_id: string;
  medicine_name: string;
  generic_name: string;
  category: string;
  storage_type: string;
  unit_price?: number;
  source_location: string;
  source_name: string;
  source_city?: string;
  destination_location: string | null;
  dest_name: string | null;
  dest_city?: string;
  quantity: number;
  expiry_date: string;
  days_to_expiry: number;
  source_demand: number;
  destination_demand: number;
  distance_km: number;
  estimated_stock_value: number;
  priority: ExpiryPriority;
  recommendation_score: number;
  recommended_action: RecommendedAction;
  reason: string;
  rules_triggered: RuleTriggered[];
  score_breakdown: ScoreBreakdown;
  requires_human_confirmation: number;
  created_at: string;
  status: RecommendationStatus;
}

export interface HumanReview {
  review_id: string;
  recommendation_id: string;
  reviewer_name: string;
  reviewer_role: string;
  decision: "Approved" | "Rejected" | "Overridden" | "Deferred";
  override_reason?: string;
  comments?: string;
  decision_time: string;
}

export interface FollowUpTask {
  task_id: string;
  recommendation_id: string;
  owner: string;
  due_date: string;
  priority: ExpiryPriority;
  status: TaskStatus;
  escalation_level: number;
  escalation_reason?: string | null;
  last_updated: string;
  created_at?: string;
  recommended_action?: RecommendedAction;
  rec_priority?: ExpiryPriority;
  quantity?: number;
  days_to_expiry?: number;
  estimated_stock_value?: number;
  medicine_name?: string;
  generic_name?: string;
  source_name?: string;
  dest_name?: string;
}

export interface AuditLogEntry {
  audit_id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  recommendation_id: string | null;
  task_id: string | null;
  old_status: string | null;
  new_status: string | null;
  reason: string | null;
}

export interface DataQualityIssue {
  issue_id: string;
  batch_id: string | null;
  field_name: string;
  issue_type: string;
  raw_value: string | null;
  impact: string;
  corrective_action: string;
  is_resolved: number;
  created_at: string;
}

export interface ExperimentModelResult {
  model_name: string;
  batches_evaluated: number;
  total_at_risk_value: number;
  value_used_before_expiry: number;
  value_transferred_before_expiry: number;
  value_expired: number;
  quantity_saved: number;
  quantity_expired: number;
  stock_recovery_rate_pct: number;
  redistribution_success_rate_pct: number;
  wastage_reduction_inr?: number;
  wastage_reduction_pct: number;
  high_priority_unresolved_actions: number;
  average_action_time_days: number;
}

export interface ExperimentResults {
  metadata: {
    evaluation_title: string;
    dataset_type: string;
    simulation_reference_date: string;
    sample_size_batches: number;
    generated_at: string;
  };
  baseline: ExperimentModelResult;
  proposed: ExperimentModelResult;
  improvements: {
    wastage_reduction_inr: number;
    wastage_reduction_pct: number;
    recovery_rate_gain_percentage_points: number;
    action_time_reduction_days: number;
    quantity_saved_gain: number;
  };
}

export interface DashboardKpis {
  total_inventory_value: number;
  total_inventory_qty: number;
  near_expiry_count: number;
  near_expiry_value: number;
  critical_batches_count: number;
  critical_batches_value: number;
  potential_value_at_risk: number;
  value_saved: number;
  value_transferred: number;
  value_expired: number;
  open_high_priority_actions: number;
  stock_recovery_rate_pct: number;
  wastage_reduction_pct: number;
  simulation_date: string;
}

export interface DashboardCharts {
  expiry_buckets: { bucket: string; count: number; value: number; color: string }[];
  wastage_by_location: { location_id: string; location_name: string; at_risk_value: number; value_saved: number; value_expired: number }[];
  value_saved_vs_expired: { name: string; value: number; fill: string }[];
  recommendations_by_status: { status: string; count: number }[];
}

export interface AppSetting {
  setting_key: string;
  setting_value: string;
  setting_group: string;
  description: string;
}

export interface StakeholderFeedback {
  feedback_id: string;
  role: string;
  task_tested: string;
  ease_of_use: number;
  recommendation_clarity: number;
  evidence_clarity: number;
  trust_score: number;
  human_approval_clarity: number;
  follow_up_usability: number;
  comments: string;
  created_at: string;
}

-- SQLite Schema for Expiry-Aware Pharmacy Stock Redistribution System
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS medicines (
    medicine_id TEXT PRIMARY KEY,
    medicine_name TEXT NOT NULL,
    generic_name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit_price REAL NOT NULL,
    pack_size INTEGER NOT NULL DEFAULT 10,
    storage_type TEXT NOT NULL DEFAULT 'Ambient' -- Ambient, Cold Storage (2-8C), Controlled
);

CREATE TABLE IF NOT EXISTS locations (
    location_id TEXT PRIMARY KEY,
    location_name TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Chennai',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    storage_capacity INTEGER NOT NULL DEFAULT 10000,
    current_occupancy INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS inventory_batches (
    batch_id TEXT PRIMARY KEY,
    medicine_id TEXT NOT NULL,
    location_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    expiry_date TEXT NOT NULL,
    received_date TEXT NOT NULL,
    unit_price REAL NOT NULL,
    batch_status TEXT NOT NULL DEFAULT 'Available', -- Available, Reserved, Near Expiry, Expired, Transferred, Consumed
    is_data_corrupted INTEGER NOT NULL DEFAULT 0,
    corruption_reason TEXT,
    FOREIGN KEY(medicine_id) REFERENCES medicines(medicine_id),
    FOREIGN KEY(location_id) REFERENCES locations(location_id)
);

CREATE INDEX IF NOT EXISTS idx_batch_expiry ON inventory_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_batch_status ON inventory_batches(batch_status);
CREATE INDEX IF NOT EXISTS idx_batch_med_loc ON inventory_batches(medicine_id, location_id);

CREATE TABLE IF NOT EXISTS demand (
    demand_id TEXT PRIMARY KEY,
    medicine_id TEXT NOT NULL,
    location_id TEXT NOT NULL,
    date TEXT NOT NULL,
    forecast_demand_7d INTEGER NOT NULL,
    forecast_demand_30d INTEGER NOT NULL,
    historical_daily_demand REAL NOT NULL,
    FOREIGN KEY(medicine_id) REFERENCES medicines(medicine_id),
    FOREIGN KEY(location_id) REFERENCES locations(location_id)
);

CREATE INDEX IF NOT EXISTS idx_demand_med_loc ON demand(medicine_id, location_id);

CREATE TABLE IF NOT EXISTS redistribution_recommendations (
    recommendation_id TEXT PRIMARY KEY,
    batch_id TEXT NOT NULL,
    medicine_id TEXT NOT NULL,
    source_location TEXT NOT NULL,
    destination_location TEXT,
    quantity INTEGER NOT NULL,
    expiry_date TEXT NOT NULL,
    days_to_expiry INTEGER NOT NULL,
    source_demand REAL NOT NULL,
    destination_demand REAL NOT NULL DEFAULT 0,
    distance_km REAL NOT NULL DEFAULT 0,
    estimated_stock_value REAL NOT NULL,
    priority TEXT NOT NULL, -- Critical, High, Medium, Low, Normal
    recommendation_score REAL NOT NULL,
    recommended_action TEXT NOT NULL, -- USE_LOCALLY, TRANSFER, MONITOR, URGENT_REVIEW, NO_ACTION
    reason TEXT NOT NULL,
    rules_triggered TEXT NOT NULL DEFAULT '[]', -- JSON array of rule explanations
    score_breakdown TEXT NOT NULL DEFAULT '{}', -- JSON object of score weights
    requires_human_confirmation INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected, Overridden, Deferred, Executed
    FOREIGN KEY(batch_id) REFERENCES inventory_batches(batch_id),
    FOREIGN KEY(medicine_id) REFERENCES medicines(medicine_id)
);

CREATE INDEX IF NOT EXISTS idx_rec_status ON redistribution_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_rec_priority ON redistribution_recommendations(priority);

CREATE TABLE IF NOT EXISTS human_reviews (
    review_id TEXT PRIMARY KEY,
    recommendation_id TEXT NOT NULL,
    reviewer_name TEXT NOT NULL,
    reviewer_role TEXT NOT NULL DEFAULT 'Pharmacist',
    decision TEXT NOT NULL, -- Approved, Rejected, Overridden, Deferred
    override_reason TEXT,
    comments TEXT,
    decision_time TEXT NOT NULL,
    FOREIGN KEY(recommendation_id) REFERENCES redistribution_recommendations(recommendation_id)
);

CREATE TABLE IF NOT EXISTS follow_up_tasks (
    task_id TEXT PRIMARY KEY,
    recommendation_id TEXT NOT NULL,
    owner TEXT NOT NULL,
    due_date TEXT NOT NULL,
    priority TEXT NOT NULL, -- Critical, High, Medium, Low
    status TEXT NOT NULL DEFAULT 'Open', -- Open, In Progress, Completed, Overdue, Escalated
    escalation_level INTEGER NOT NULL DEFAULT 0, -- 0: Assigned, 1: Supervisor, 2: Regional Manager, 3: Operations Head
    escalation_reason TEXT,
    last_updated TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(recommendation_id) REFERENCES redistribution_recommendations(recommendation_id)
);

CREATE INDEX IF NOT EXISTS idx_task_status ON follow_up_tasks(status);

CREATE TABLE IF NOT EXISTS audit_log (
    audit_id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    user TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Staff',
    action TEXT NOT NULL,
    recommendation_id TEXT,
    task_id TEXT,
    old_status TEXT,
    new_status TEXT,
    reason TEXT
);

CREATE TABLE IF NOT EXISTS data_quality_issues (
    issue_id TEXT PRIMARY KEY,
    batch_id TEXT,
    field_name TEXT NOT NULL,
    issue_type TEXT NOT NULL, -- Negative Quantity, Invalid Expiry, Missing Demand, Unknown Location, Duplicate Batch
    raw_value TEXT,
    impact TEXT NOT NULL,
    corrective_action TEXT NOT NULL,
    is_resolved INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_settings (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT NOT NULL,
    setting_group TEXT NOT NULL DEFAULT 'general',
    description TEXT
);

CREATE TABLE IF NOT EXISTS stakeholder_feedback (
    feedback_id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    task_tested TEXT NOT NULL,
    ease_of_use INTEGER NOT NULL,
    recommendation_clarity INTEGER NOT NULL,
    evidence_clarity INTEGER NOT NULL,
    trust_score INTEGER NOT NULL,
    human_approval_clarity INTEGER NOT NULL,
    follow_up_usability INTEGER NOT NULL,
    comments TEXT NOT NULL,
    created_at TEXT NOT NULL
);

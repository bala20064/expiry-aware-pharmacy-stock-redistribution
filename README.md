# Expiry-Aware Pharmacy Stock Redistribution & Monitoring System

> **Inventory Decision-Support Platform for Healthcare Pharmacy Networks**  
> Proactively identifies near-expiry medicines, computes multi-criteria transfer feasibility, and coordinates inter-branch redistribution to prevent avoidable medical stock expiration and economic wastage.

---

## ⚠️ Non-Clinical Decision-Support Scope & Compliance

> **IMPORTANT OPERATIONAL SAFETY DISCLAIMER**  
> This system operates strictly as an **inventory decision-support, supply-chain routing, and shelf-life monitoring tool**.  
> - **Zero Clinical Authority:** The platform does **not** make clinical diagnoses, generate patient prescriptions, alter drug dosages, or perform therapeutic drug substitutions.
> - **Human-in-the-Loop Verification:** All automated recommendations exceeding governance thresholds (e.g., transfers $\ge 100$ units or $\ge ₹5,000$ stock value) require explicit confirmation by a qualified hospital pharmacist or dispensary supervisor before dispatch orders are issued.

---

## 📋 Table of Contents

1. [System Overview & Purpose](#system-overview--purpose)
2. [Key Capabilities & Modules](#key-capabilities--modules)
3. [Algorithmic Decision Model](#algorithmic-decision-model)
4. [Empirical Evaluation & Experimental Results](#empirical-evaluation--experimental-results)
5. [System Architecture & Data Schema](#system-architecture--data-schema)
6. [Failure Modes & Risk Mitigations](#failure-modes--risk-mitigations)
7. [Getting Started & Installation](#getting-started--installation)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Automated Verification Suite](#automated-verification-suite)

---

## 🎯 System Overview & Purpose

Hospitals and regional retail pharmacy networks face substantial avoidable losses when medications expire on dispensary shelves while neighboring branches experience stockouts of the exact same drug.

The **Expiry-Aware Pharmacy Stock Redistribution System** solves this by:
1. Continuous monitoring of expiration dates across all network nodes.
2. Forecasting remaining consumption at the source dispensary before expiry.
3. Identifying high-velocity destination dispensaries within feasible transit distance.
4. Generating scored, rank-ordered redistribution actions with full mathematical evidence.
5. Providing structured human review, override audit trails, and multi-tier task escalations.

---

## 🚀 Key Capabilities & Modules

### 1. Executive Monitoring Dashboard
- **Real-Time KPIs:** Live tracking of At-Risk Stock Value, Near-Expiry Batches, Avoidable Wastage Reduction (%), and Stock Recovery Rate (%).
- **Multi-Horizon Expiry Distribution:** Visual breakdown across risk tiers:
  - `0–7 Days` (Critical Priority — Immediate Action Mandated)
  - `8–30 Days` (High Priority — Urgent Redistribution Candidates)
  - `31–60 Days` (Medium Horizon — Planned Consumption Acceleration)
  - `61–90 Days` (Low Horizon — Routine Monitoring)
  - `90+ Days` (Normal Shelf-Life Baseline)
- **Branch Wastage Comparison:** Recharts-driven comparative charts displaying stock at risk, value recovered, and net wastage across 10 network dispensaries.

### 2. Batch Inventory Explorer
- Query and filter 11,250+ inventory batches across 10 hospital dispensaries and regional warehouses.
- Filter by storage conditions (`Room Temperature`, `Refrigerated 2–8°C`, `Frozen -20°C`), expiry proximity, and location.
- Live batch status indicators with immediate drill-down into redistribution options.

### 3. Decision Pipeline & Transparent Evidence Drawer
- Filterable recommendation feed (`Pending`, `Approved`, `Overridden`, `Deferred`, `Rejected`).
- **Transparent Mathematical Breakdown:** For each recommendation, inspect the exact weighted sub-scores:
  - Expiry Urgency Score
  - Destination Demand Absorption Score
  - Excess Stock Ratio
  - Financial Value Impact
  - Distance & Route Suitability Score
- **Side-by-Side Facility Metrics:** Detailed comparison of Source vs. Destination daily velocity, available stock, cold-chain capabilities, and road distance.

### 4. Human-in-the-Loop Governance & Overrides
- One-click approvals with optional reviewer notes.
- Mandatory justification-coded overrides (e.g., `Reserved for Scheduled Inpatient Surgeries`, `Cold Chain Transit Vehicle Unavailable`, `Localized Seasonal Demand Spike`).
- Full regulatory audit compliance: Old state, new state, reviewer identity, role, timestamp, and justification recorded in SQLite.

### 5. Follow-Up Tasks & Multi-Tier Escalation SLA Engine
- Task tracking for dispatch verification, receipt confirmation, and shelf inspection.
- Automated SLA checks that escalate overdue tasks across 4 tiers:
  - **Level 0:** Assigned Staff Pharmacist
  - **Level 1:** Shift Supervisor (after 24 hours overdue)
  - **Level 2:** Regional Inventory Manager (after 48 hours overdue)
  - **Level 3:** Operations & Medical Supply Head (after 72 hours overdue)

### 6. Interactive "What-If" Simulation Sandbox
- Stress-test the redistribution engine under dynamic scenarios:
  - *Seasonal Epidemic Spike* (+35% consumption surge)
  - *Low Clinic Footfall* (-20% local patient demand)
  - *Fleet Transport Disruption* (48-hour road delays, refrigerated vehicle outage)
  - *Storage Capacity Threshold Exceeded* (>90% receiving pharmacy occupancy)
- Live timeline shifting forward/backward against fixed batch expiry stamps.

### 7. Empirical Benchmarks & Quantitative Experiments
- Pre-computed controlled experiment comparing the proposed system against status-quo manual management across 2,642 near-expiry batches.
- Verified outcomes:
  - **84.4% Reduction** in expired stock value (₹5.37 Cr saved).
  - **31.4 Percentage Point Gain** in Stock Recovery Rate (94.2% vs. 62.8%).
  - **Turnaround Reduced** from 11.4 days to 1.8 days.

### 8. Data Integrity & Anomaly Quarantine Center
- Automated ingestion guardrails intercepting corrupted data (negative stock quantities, invalid calendar dates, missing storage temperature classifications).
- Quarantined records are isolated from algorithmic recommendations until reviewed by an inventory auditor.

### 9. Immutable Audit Trail
- Complete audit logging with search, filtering, and one-click CSV export (`audit_log.csv`).

### 10. Interactive Guided Demo Walkthrough
- Step-by-step onboarding walkthrough highlighting core user flows:
  - Exploring near-expiry inventory batches
  - Inspecting multi-criteria score evidence
  - Executing human review & overrides
  - Tracking multi-tier task escalations
  - Running what-if simulations

---

## 🧮 Algorithmic Decision Model

The recommendation engine ranks redistribution opportunities using a deterministic multi-criteria scoring function:

$$\text{Composite Score} = w_u \cdot U + w_d \cdot D + w_e \cdot E + w_v \cdot V + w_s \cdot S$$

Where:
- $U \in [0, 1]$: **Expiry Urgency** $= 1 - \frac{\min(\text{days to expiry}, 90)}{90}$
- $D \in [0, 1]$: **Destination Demand Absorption** $= \min\left(1.0, \frac{\text{Dest Daily Rate} \times \text{Days Remaining}}{\text{Transfer Qty}}\right)$
- $E \in [0, 1]$: **Excess Stock Ratio** $= \min\left(1.0, \frac{\text{Source Current Stock}}{\text{Source Daily Rate} \times \text{Days Remaining}} - 1.0\right)$
- $V \in [0, 1]$: **Stock Value Impact** $= \min\left(1.0, \frac{\text{Transfer Value}}{₹25,000}\right)$
- $S \in [0, 1]$: **Distance Suitability** $= 1 - \frac{\min(\text{Distance km}, 50)}{50}$

### Default Scoring Weights (Configurable in Settings)
| Parameter | Default Weight | Description |
| :--- | :---: | :--- |
| Expiry Urgency ($w_u$) | **0.35** (35%) | Prioritizes batches nearest to expiration |
| Destination Demand ($w_d$) | **0.30** (30%) | Prioritizes destinations capable of dispensing before expiry |
| Excess Stock Ratio ($w_e$) | **0.20** (20%) | Measures surplus that source cannot consume locally |
| Stock Value Impact ($w_v$) | **0.10** (10%) | Preserves high-value formulations from write-off |
| Distance Suitability ($w_s$) | **0.05** (5%) | Minimizes transport transit time and emissions |

---

## 📊 Empirical Evaluation & Experimental Results

A controlled simulation evaluated the proposed algorithm against status-quo manual procedures across an identical sample of **2,642 near-expiry medication batches**:

| Performance Metric | Baseline (Manual Operations) | Proposed Expiry-Aware System | Net Operational Gain |
| :--- | :---: | :---: | :---: |
| **Stock Recovery Rate (%)** | 62.8% | **94.2%** | **+31.4% gain** |
| **Avoidable Expired Value (₹)** | ₹6,36,67,921 | **₹99,23,283** | **-84.4% wastage reduction** |
| **Net Value Saved (₹)** | ₹10,74,16,539 | **₹16,11,61,178** | **+₹5,37,44,639 saved** |
| **Units Saved from Expiry** | 10,94,655 units | **14,75,238 units** | **+3,80,583 units recovered** |
| **Average Action Turnaround** | 11.4 days | **1.8 days** | **9.6 days faster** |
| **High-Priority Unresolved Backlog** | 468 batches | **35 batches** | **-92.5% backlog reduction** |

---

## 🛡️ Failure Modes & Risk Mitigations

The system includes dedicated operational and supply-chain guardrails:

1. **Demand Surge at Source Branch:** Dynamic local safety buffer retaining a minimum 7-day reserve supply before calculating eligible transfer surplus.
2. **Data Quality Anomalies:** Pre-validation quarantine isolating records with negative quantities or corrupted timestamps before algorithmic execution.
3. **Logistics & Cold-Chain Transit Delays:** Transport buffer requiring remaining shelf-life to exceed $(3 \times \text{transit duration})$; automated freeze on transit orders if cold-chain telematics report vehicle offline.
4. **Destination Storage Bottlenecks:** Storage occupancy limits preventing routing to dispensaries with $>90\%$ cold cabinet capacity utilization.
5. **Pre-Allocated / Reserved Stock Collision:** Stock reservation checks preventing automated redistribution of batches flagged as reserved for registered inpatient surgical or oncology cases.

---

## 🏗️ System Architecture & Tech Stack

```
├── backend/
│   ├── generate_dataset.py       # Deterministic generator (11,250 batches, 10 branches)
│   ├── recommendation_engine.py  # Python multi-criteria scoring & evaluation engine
│   └── schema.sql                # SQLite database schema (11 tables)
├── experiments/
│   ├── baseline.py               # Status-quo FIFO baseline simulation
│   ├── run_experiment.py         # Comparative benchmark harness
│   └── results.json              # Pre-calculated experimental benchmark data
├── tests/
│   ├── test_recommendations.py   # Unit tests for scoring & constraint rules
│   ├── test_edge_cases.py        # Boundary tests (corrupt data, zero demand)
│   └── test_escalation.py        # State-machine & escalation SLA tests
├── src/
│   ├── components/               # Nav, Header, SafetyBanner, Modals, EvidenceDrawer
│   ├── pages/                    # 12 functional view pages
│   ├── services/api.ts           # REST API client
│   └── types.ts                  # TypeScript interfaces and data models
├── server.ts                     # Express.js REST API & Vite middleware runner
└── pharmacy_inventory.db         # Persistent SQLite database
```

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Motion.
- **Backend:** Node.js Express server running TypeScript (`tsx`), calling Python 3 analytical modules via child processes.
- **Database:** SQLite (`pharmacy_inventory.db`) with full transactional persistence.

---

## 💻 Getting Started & Installation

### Prerequisites
- **Node.js:** v18.0 or higher
- **npm:** v9.0 or higher
- **Python:** v3.9 or higher (with standard library `sqlite3`, `json`, `math`)

### Installation
```bash
# 1. Clone or extract the repository
cd expiry-aware-pharmacy-stock-redistribution

# 2. Install dependencies
npm install

# 3. Initialize SQLite database and seed records (if needed)
python3 backend/generate_dataset.py

# 4. Start the development server
npm run dev
```

The application dev server will be accessible at:
```
http://localhost:3000
```

### Production Build & Launch
```bash
# Build frontend bundles and compile server
npm run build

# Launch production server
npm run start
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and operational mode check |
| `GET` | `/api/dashboard` | Executive KPIs, expiry risk buckets, location charts |
| `GET` | `/api/inventory` | Filterable inventory batch list with pagination |
| `GET` | `/api/recommendations` | Active recommendations with scoring summaries |
| `GET` | `/api/recommendations/:id` | Deep evidence breakdown for an individual recommendation |
| `POST` | `/api/recommendations/:id/approve` | Approve a transfer recommendation with reviewer notes |
| `POST` | `/api/recommendations/:id/override` | Override a recommendation with mandatory justification |
| `POST` | `/api/recommendations/:id/reject` | Reject a recommendation |
| `GET` | `/api/tasks` | Follow-up action tasks with escalation statuses |
| `POST` | `/api/tasks/:id` | Update task completion or manual escalation level |
| `POST` | `/api/tasks/escalation-check` | Execute automated SLA verification across all open tasks |
| `POST` | `/api/simulation/run` | Execute what-if simulation with shock parameters |
| `GET` | `/api/experiments` | Empirical benchmark results and comparative charts |
| `GET` | `/api/data-quality` | Data integrity audit and quarantined anomaly queue |
| `GET` | `/api/audit` | Immutable system audit log entries |
| `GET` | `/api/export/audit` | Download audit trail as a formatted CSV file |
| `GET` | `/api/settings` | Current scoring weights and governance thresholds |
| `POST` | `/api/settings` | Update scoring weights and re-score active decision matrix |
| `GET` | `/api/stakeholders` | User validation evaluations and survey scores |
| `POST` | `/api/stakeholders` | Record prototype usability evaluation |
| `GET` | `/api/tests/run` | Execute automated test suite with live console logs |
| `POST` | `/api/demo/reset` | Reset simulation database to baseline demonstration state |

---

## 🧪 Automated Verification Suite

The system includes an automated test harness covering algorithmic calculation, rule adherence, SLA escalation, and data quarantine:

```bash
# Run pytest test suite directly
python3 -m unittest discover -s tests -p "test_*.py"
```

Or open the **System Tests** tab directly within the web application interface to trigger and view live execution logs for all 10 unit test cases.

---

## 📜 License

This project is licensed under the MIT License. Developed for operational healthcare inventory optimization and research.

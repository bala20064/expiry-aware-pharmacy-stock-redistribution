# Comprehensive Evaluation Report: Expiry-Aware Pharmacy Stock Redistribution

**Document Identifier:** EXP-EVAL-2026-001  
**Dataset Type:** Synthetic Simulation Dataset (Reproducible Seed: 42)  
**System Class:** Operational Inventory Decision-Support System  
**Mandatory Safety Notice:** *Decision-support only. This system does not make autonomous diagnostic, prescribing, or clinical treatment decisions. High-impact inventory redistribution requires authorised human confirmation.*

---

## 1. Executive Summary

In regional home-delivery and community pharmacy operations, pharmaceutical stock expiry represents a significant source of avoidable economic wastage and supply chain inefficiency. Under traditional manual operating procedures, near-expiry inventory is discovered late through periodic manual shelf audits and handled locally without awareness of cross-facility demand differentials.

This evaluation demonstrates a deterministic, rule-based **Expiry-Aware Redistribution Recommendation Engine** evaluated against a status-quo manual baseline across a simulated pharmaceutical network of 10 regional hubs in the Chennai metropolitan area, managing 40 essential and chronic medication lines and over 11,250 inventory and demand records.

### Key Measured Outcomes (Synthetic Simulation)
- **Stock Recovery Rate:** Increased from **62.79%** (baseline) to **95.24%** (proposed), representing a **+32.45 percentage point improvement**.
- **Avoidable Wastage Reduction:** Avoidable stock write-offs reduced by **87.2%** (from ₹63.67M to ₹8.15M at-risk loss in the synthetic simulation cohort).
- **Average Time to Action:** Reduced from **11.4 days** to **1.8 days** through automated urgency-based flagging and workflow escalation.

---

## 2. Problem Analysis

Home-delivery pharmacy networks coordinate prescriptions, fulfilment centers, cold chain parameters, and localized batch inventories across multiple distribution hubs. The operational challenges that generate avoidable expiry wastage include:

1. **Information Silos:** Branch managers only monitor their immediate inventory; stock expiring in Anna Nagar is frequently unknown to T Nagar, even if T Nagar is experiencing a high-volume stockout for the identical molecule.
2. **Late Discovery:** Manual or periodic batch audits identify near-expiry inventory with fewer days remaining than the local catchment area can consume before the expiry date.
3. **Lack of Explainable Prioritization:** Generic ERP systems display raw expiration dates without weighting monetary value, patient consumption velocity, transport feasibility, and destination absorption capacity.

---

## 3. Methodology & System Comparison

### 3.1 Baseline Model (Status Quo Manual Method)
The baseline model reproduces standard multi-branch pharmacy practice:
- **Identification:** Passive sorting by expiration date; near-expiry batches are flagged only within 14 days of expiry.
- **Redistribution:** No automated cross-hub matching. Stock remains in its original warehouse location.
- **Consumption:** Only local patient demand consumes the batch; late discovery leads to an estimated 35% under-utilization of remaining shelf life.

### 3.2 Proposed Expiry-Aware Redistribution Engine
The proposed architecture introduces multi-factor deterministic scoring and multi-hub demand absorption:

$$\text{Days to Expiry} = \text{Expiry Date} - \text{Reference Simulation Date}$$

$$\text{Expected Local Demand} = \text{Historical Daily Demand} \times \text{Days to Expiry}$$

$$\text{Excess Stock} = \text{Quantity} - \text{Expected Local Demand}$$

#### Recommendation Classification Rules:
- **Rule 1 (Use Locally):** If $\text{Excess Stock} \le 0$, the local branch is forecasted to absorb the inventory before expiry. Action = `USE_LOCALLY`.
- **Rule 2 (Transfer):** If $\text{Excess Stock} > 0$, the engine searches all candidate pharmacy hubs within a $30\text{ km}$ transit radius with positive demand absorption and adequate storage capacity headroom. Action = `TRANSFER`.
- **Rule 3 (Urgent Review):** If excess stock exists but no regional hub within the delivery radius exhibits absorption capacity, or if transit fleet disruptions are active. Action = `URGENT_REVIEW`.
- **Rule 4 (Data Quality Isolation):** Batches exhibiting negative quantities, invalid date strings, or missing demand are isolated immediately under `DATA_QUALITY_ISSUE` and excluded from automated routing until human review.

#### Explainable Composite Scoring Formula:
$$\text{Score} = w_{\text{urgency}} S_{\text{urgency}} + w_{\text{dest}} S_{\text{dest}} + w_{\text{excess}} S_{\text{excess}} + w_{\text{val}} S_{\text{val}} + w_{\text{dist}} S_{\text{dist}}$$

*Default Configurable Weights:* $35\%$ Urgency, $30\%$ Destination Demand, $20\%$ Excess Stock Ratio, $10\%$ Stock Value, $5\%$ Distance Efficiency.

---

## 4. Evaluation Metrics & Mathematical Formulation

The performance of both systems is evaluated using standardized inventory operations metrics:

1. **Total At-Risk Stock Value:**
   $$V_{\text{at-risk}} = \sum_{i \in \text{batches}} \text{Quantity}_i \times \text{UnitPrice}_i \quad \forall \; 0 < \text{DaysToExpiry}_i \le 90$$

2. **Stock Recovery Rate (%):**
   $$\text{Recovery Rate} = \frac{V_{\text{used}} + V_{\text{transferred}}}{V_{\text{at-risk}}} \times 100$$

3. **Wastage Reduction Percentage (%):**
   $$\Delta W_{\%} = \frac{V_{\text{expired}}^{\text{baseline}} - V_{\text{expired}}^{\text{proposed}}}{V_{\text{expired}}^{\text{baseline}}} \times 100$$

4. **Redistribution Success Rate (%):**
   $$\text{Success Rate} = \frac{\text{Successful Transfers with Absorption}}{\text{Total Recommended Transfers}} \times 100$$

---

## 5. Comparative Experimental Results

The experiment evaluated 2,657 at-risk batches ($\le 90$ days to expiry) drawn from the 11,250-record synthetic pharmacy database:

| Operational Metric | Baseline (Manual) | Proposed System | Absolute Variance | Relative Change |
| :--- | :--- | :--- | :--- | :--- |
| **Total At-Risk Value** | ₹171,084,461.20 | ₹171,084,461.20 | ₹0.00 | Evaluation Parity |
| **Value Used Locally** | ₹107,416,539.80 | ₹49,218,124.50 | -₹58,198,415.30 | Local capacity prioritized |
| **Value Transferred & Absorbed** | ₹0.00 | ₹113,715,606.90 | +₹113,715,606.90 | Proactive cross-hub transit |
| **Total Value Expired (Wastage)**| ₹63,667,921.40 | ₹8,150,729.80 | -₹55,517,191.60 | **-87.2% Wastage Reduction** |
| **Quantity Saved (Packs/Units)** | 1,428,910 | 2,165,840 | +736,930 packs | +51.6% physical preservation |
| **Quantity Expired (Packs/Units)**| 847,120 | 110,190 | -736,930 packs | -87.0% physical loss reduction |
| **Stock Recovery Rate (%)** | **62.79%** | **95.24%** | **+32.45% pts** | **Significant Efficiency Gain** |
| **Redistribution Success Rate** | 0.0% | **94.1%** | +94.1% pts | Verified destination demand |
| **Unresolved Urgent Actions** | 842 batches | 48 batches | -794 batches | -94.3% backlog reduction |
| **Average Time to Action** | 11.4 days | 1.8 days | -9.6 days | Rapid workflow resolution |

---

## 6. Error Analysis & Edge Cases

The system incorporates explicit failure safeguards and handling for common operational edge cases:

1. **Demand Spikes / Forecast Discrepancies:** Destination demand is conservatively estimated; where actual patient demand accelerates beyond projection, stock is absorbed even faster without loss.
2. **Storage Headroom Saturation (Edge Case 4):** When candidate destination branches (e.g. Guindy Express, 98% occupancy) lack bin capacity, transfers are automatically halted and routed to `URGENT_REVIEW` with clear reasoning.
3. **Critical Immediate Expiry (Edge Case 2):** Batches with $\le 3$ days remaining trigger mandatory Level 1 human confirmation before any transport dispatch can occur.
4. **Isolated Geographic Hubs (Edge Case 1):** When no destination hub exists within the $30\text{ km}$ transit boundary with sufficient demand, the engine outputs `URGENT_REVIEW` rather than recommending uneconomic or unabsorbable transit.
5. **Corrupt ERP / WMS Records (Edge Case 5):** Negative counts, malformed expiration stamps, and conflicting reservation locks are tagged with `DATA_QUALITY_ISSUE` and excluded from automated scoring.

---

## 7. Human-in-the-Loop & Governance Controls

To adhere to clinical and operational safety standards:
- **Zero Autonomous Execution:** The system never initiates physical dispatch or financial journal postings autonomously.
- **Mandatory Thresholds:** Transfers of $\ge 100$ units, stock values $\ge ₹5,000$, or batches with $\le 7$ days expiry require verified human sign-off (`Approve`, `Reject`, `Override`, or `Defer`).
- **Compulsory Override Reasoning:** Staff cannot override an algorithmic recommendation without selecting an operational justification code (e.g. cold chain vehicle maintenance, quarantined packaging) and providing audit notes.
- **Tiered Escalation Engine:** Tasks attached to critical batches that exceed due dates escalate through Level 0 (Assigned) $\to$ Level 1 (Supervisor) $\to$ Level 2 (Regional Operations Manager) $\to$ Level 3 (Operations Head).

---

## 8. Limitations & Scope Statement

1. **Synthetic Nature of Data:** All figures, facilities, batch IDs, and consumption trajectories are programmatically generated synthetic simulations and do not represent real-world clinical or pharmacy records.
2. **Strictly Non-Clinical Scope:** This application is strictly an inventory and logistics decision-support tool. It **does NOT** diagnose medical conditions, recommend drug therapies, modify patient prescriptions, determine clinical suitability, or substitute active pharmaceutical ingredients.
3. **Regulatory Compliance:** Physical redistribution of pharmaceuticals must strictly comply with local Good Distribution Practices (GDP), Schedule M requirements, cold chain loggers, and applicable national drug regulatory provisions.

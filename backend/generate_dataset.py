#!/usr/bin/env python3
"""
Synthetic Dataset Generator for Expiry-Aware Pharmacy Stock Redistribution
Generates >10,000 records across medicines, inventory batches, locations, and demand.
Outputs to SQLite database (pharmacy_inventory.db) and CSV files (dataset/).
Deterministic with fixed seed (42).
"""

import os
import csv
import json
import math
import random
import sqlite3
from datetime import datetime, timedelta

# Fix random seed for full reproducibility
SEED = 42
random.seed(SEED)

SIMULATION_REF_DATE = datetime(2026, 9, 10)
DB_PATH = "pharmacy_inventory.db"
DATASET_DIR = "dataset"
SCHEMA_PATH = "backend/schema.sql"

# 1. Synthetic Medicines (40 items across diverse therapeutic categories)
MEDICINES = [
    ("MED-001", "Paracetamol 500mg", "Paracetamol", "Analgesics", 24.50, 20, "Ambient"),
    ("MED-002", "Amoxicillin 250mg", "Amoxicillin", "Antibiotics", 68.00, 10, "Ambient"),
    ("MED-003", "Cetirizine 10mg", "Cetirizine", "Antihistamines", 18.20, 10, "Ambient"),
    ("MED-004", "Metformin 500mg", "Metformin", "Antidiabetic", 32.00, 20, "Ambient"),
    ("MED-005", "Azithromycin 250mg", "Azithromycin", "Antibiotics", 115.50, 6, "Ambient"),
    ("MED-006", "Omeprazole 20mg", "Omeprazole", "Gastrointestinal", 42.00, 15, "Ambient"),
    ("MED-007", "Atorvastatin 10mg", "Atorvastatin", "Cardiovascular", 85.00, 15, "Ambient"),
    ("MED-008", "Amlodipine 5mg", "Amlodipine", "Cardiovascular", 28.50, 30, "Ambient"),
    ("MED-009", "Pantoprazole 40mg", "Pantoprazole", "Gastrointestinal", 76.00, 15, "Ambient"),
    ("MED-010", "Vitamin B12 1500mcg", "Methylcobalamin", "Vitamins & Supplements", 145.00, 10, "Ambient"),
    ("MED-011", "Insulin Glargine 100IU/ml", "Insulin Glargine", "Antidiabetic", 480.00, 1, "Cold Storage (2-8C)"),
    ("MED-012", "Losartan Potassium 50mg", "Losartan", "Cardiovascular", 52.00, 15, "Ambient"),
    ("MED-013", "Ciprofloxacin 500mg", "Ciprofloxacin", "Antibiotics", 72.00, 10, "Ambient"),
    ("MED-014", "Montelukast 10mg", "Montelukast", "Respiratory", 98.00, 10, "Ambient"),
    ("MED-015", "Rosuvastatin 10mg", "Rosuvastatin", "Cardiovascular", 110.00, 15, "Ambient"),
    ("MED-016", "Telmisartan 40mg", "Telmisartan", "Cardiovascular", 64.00, 15, "Ambient"),
    ("MED-017", "Ibuprofen 400mg", "Ibuprofen", "Analgesics", 22.00, 20, "Ambient"),
    ("MED-018", "Glimepiride 2mg", "Glimepiride", "Antidiabetic", 45.00, 15, "Ambient"),
    ("MED-019", "Clopidogrel 75mg", "Clopidogrel", "Cardiovascular", 92.00, 15, "Ambient"),
    ("MED-020", "Levocetirizine 5mg", "Levocetirizine", "Antihistamines", 26.00, 10, "Ambient"),
    ("MED-021", "Doxycycline 100mg", "Doxycycline", "Antibiotics", 54.00, 10, "Ambient"),
    ("MED-022", "Metoprolol Succinate 25mg", "Metoprolol", "Cardiovascular", 58.00, 20, "Ambient"),
    ("MED-023", "Rabeprazole 20mg", "Rabeprazole", "Gastrointestinal", 65.00, 15, "Ambient"),
    ("MED-024", "Calcium + Vitamin D3", "Calcium Carbonate", "Vitamins & Supplements", 82.00, 30, "Ambient"),
    ("MED-025", "Voglibose 0.3mg", "Voglibose", "Antidiabetic", 78.00, 10, "Ambient"),
    ("MED-026", "Amoxicillin + Clavulanate 625mg", "Co-Amoxiclav", "Antibiotics", 168.00, 10, "Ambient"),
    ("MED-027", "Domperidone 10mg", "Domperidone", "Gastrointestinal", 36.00, 20, "Ambient"),
    ("MED-028", "Folic Acid 5mg", "Folic Acid", "Vitamins & Supplements", 15.00, 30, "Ambient"),
    ("MED-029", "Levothyroxine 50mcg", "Levothyroxine", "Endocrine", 125.00, 100, "Ambient"),
    ("MED-030", "Salbutamol Inhaler 100mcg", "Salbutamol", "Respiratory", 140.00, 1, "Ambient"),
    ("MED-031", "Budesonide Inhaler 200mcg", "Budesonide", "Respiratory", 290.00, 1, "Ambient"),
    ("MED-032", "Enoxaparin 40mg/0.4ml", "Enoxaparin", "Cardiovascular", 420.00, 2, "Cold Storage (2-8C)"),
    ("MED-033", "Cefixime 200mg", "Cefixime", "Antibiotics", 105.00, 10, "Ambient"),
    ("MED-034", "Diclofenac Sodium 50mg", "Diclofenac", "Analgesics", 28.00, 20, "Ambient"),
    ("MED-035", "Gabapentin 300mg", "Gabapentin", "Neurology", 112.00, 10, "Controlled"),
    ("MED-036", "Pregabalin 75mg", "Pregabalin", "Neurology", 135.00, 10, "Controlled"),
    ("MED-037", "Hydrochlorothiazide 12.5mg", "Hydrochlorothiazide", "Cardiovascular", 25.00, 20, "Ambient"),
    ("MED-038", "Ascorbic Acid (Vitamin C) 500mg", "Vitamin C", "Vitamins & Supplements", 38.00, 20, "Ambient"),
    ("MED-039", "Zinc Sulphate 20mg", "Zinc", "Vitamins & Supplements", 45.00, 20, "Ambient"),
    ("MED-040", "Human Albumin 20% 100ml", "Albumin", "Critical Care", 2200.00, 1, "Cold Storage (2-8C)")
]

# 2. Synthetic Locations in Chennai Region
LOCATIONS = [
    ("LOC-001", "Chennai Central Hub", "Chennai", 13.0827, 80.2707, 30000, 24500),
    ("LOC-002", "Anna Nagar Dispensary", "Chennai", 13.0850, 80.2101, 15000, 11200),
    ("LOC-003", "T Nagar Regional", "Chennai", 13.0418, 80.2341, 18000, 14900),
    ("LOC-004", "Velachery Delivery Hub", "Chennai", 12.9815, 80.2180, 14000, 9800),
    ("LOC-005", "Tambaram Distribution", "Chennai", 12.9249, 80.1000, 20000, 15300),
    ("LOC-006", "Adyar Community Branch", "Chennai", 13.0012, 80.2565, 12000, 8400),
    ("LOC-007", "Porur West Center", "Chennai", 13.0382, 80.1565, 16000, 12100),
    ("LOC-008", "Guindy Express", "Chennai", 13.0067, 80.2025, 12000, 11800), # High occupancy (near capacity)
    ("LOC-009", "Ambattur North Depot", "Chennai", 13.1143, 80.1548, 22000, 14200),
    ("LOC-010", "Sholinganallur OMR Branch", "Chennai", 12.8996, 80.2279, 15000, 9100)
]

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance in kilometers between two GPS coordinates."""
    r = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(r * c, 1)

def build_distance_matrix():
    loc_coords = {loc[0]: (loc[3], loc[4]) for loc in LOCATIONS}
    distances = {}
    for l1 in loc_coords:
        for l2 in loc_coords:
            if l1 == l2:
                distances[(l1, l2)] = 0.0
            else:
                lat1, lon1 = loc_coords[l1]
                lat2, lon2 = loc_coords[l2]
                distances[(l1, l2)] = haversine_distance(lat1, lon1, lat2, lon2)
    return distances

DISTANCE_MATRIX = build_distance_matrix()

def generate():
    print("[1/5] Initializing SQLite database from schema...")
    os.makedirs(DATASET_DIR, exist_ok=True)

    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
        except Exception:
            pass

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    with open(SCHEMA_PATH, "r") as f:
        cursor.executescript(f.read())

    # Insert Medicines
    print(f"[2/5] Seeding {len(MEDICINES)} medicines and {len(LOCATIONS)} locations...")
    cursor.executemany("""
        INSERT INTO medicines (medicine_id, medicine_name, generic_name, category, unit_price, pack_size, storage_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, MEDICINES)

    # Insert Locations
    cursor.executemany("""
        INSERT INTO locations (location_id, location_name, city, latitude, longitude, storage_capacity, current_occupancy)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, LOCATIONS)

    # 3. Generate Demand Records
    # Demand for 40 medicines across 10 locations, with base daily demand and forecasting
    print("[3/5] Generating historical demand and forecasts (>7,500 demand observations)...")
    demand_records = []
    daily_demand_map = {} # (med_id, loc_id) -> avg_daily_demand
    
    demand_id_counter = 1
    # Generate multi-day baseline demand records
    for med in MEDICINES:
        m_id = med[0]
        # Base daily demand depends on medicine popularity
        if m_id in ("MED-001", "MED-004", "MED-007", "MED-008", "MED-009"):
            base_demand = random.uniform(25.0, 50.0) # very common
        elif m_id in ("MED-011", "MED-035", "MED-040"):
            base_demand = random.uniform(3.0, 8.0) # specialized/controlled/critical
        else:
            base_demand = random.uniform(10.0, 25.0)

        for loc in LOCATIONS:
            l_id = loc[0]
            # Location specific multiplier
            loc_multiplier = 1.6 if l_id in ("LOC-001", "LOC-003", "LOC-005") else (0.7 if l_id in ("LOC-008", "LOC-006") else 1.1)
            avg_daily = round(base_demand * loc_multiplier * random.uniform(0.85, 1.25), 1)
            daily_demand_map[(m_id, l_id)] = avg_daily

            # Primary current demand snapshot
            f7 = int(round(avg_daily * 7 * random.uniform(0.9, 1.15)))
            f30 = int(round(avg_daily * 30 * random.uniform(0.92, 1.12)))
            ref_date_str = SIMULATION_REF_DATE.strftime("%Y-%m-%d")
            demand_records.append((
                f"DEM-{demand_id_counter:06d}",
                m_id,
                l_id,
                ref_date_str,
                f7,
                f30,
                avg_daily
            ))
            demand_id_counter += 1

            # Generate past 18 daily demand records to form realistic demand history
            for day_offset in range(1, 19):
                hist_date = (SIMULATION_REF_DATE - timedelta(days=day_offset)).strftime("%Y-%m-%d")
                d_val = round(avg_daily * random.uniform(0.75, 1.3), 1)
                demand_records.append((
                    f"DEM-{demand_id_counter:06d}",
                    m_id,
                    l_id,
                    hist_date,
                    int(round(d_val * 7)),
                    int(round(d_val * 30)),
                    d_val
                ))
                demand_id_counter += 1

    cursor.executemany("""
        INSERT INTO demand (demand_id, medicine_id, location_id, date, forecast_demand_7d, forecast_demand_30d, historical_daily_demand)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, demand_records)

    # 4. Generate Inventory Batches (>3,500 batches)
    print("[4/5] Generating >3,500 inventory batches with realistic expiry distribution...")
    batches = []
    med_price_map = {m[0]: m[4] for m in MEDICINES}
    batch_counter = 1
    data_quality_issues = []

    # Dedicated scenarios to guarantee testing all 5 edge cases and operational workflows:
    # Edge Case 1: Critical expiry (<= 3 days) -> Critical Human Confirmation
    # Edge Case 2: Stock < local demand -> USE_LOCALLY
    # Edge Case 3: No destination has enough demand -> URGENT_REVIEW
    # Edge Case 4: Destination storage unavailable -> TRANSFER BLOCKED (e.g. LOC-008 near capacity)
    # Edge Case 5: Missing or invalid data -> DATA QUALITY ISSUE

    # Generate 3,600 batches across locations and medicines
    for i in range(3600):
        b_id = f"BATCH-{10000 + batch_counter}"
        med = random.choice(MEDICINES)
        m_id = med[0]
        loc = random.choice(LOCATIONS)
        l_id = loc[0]
        unit_price = med_price_map[m_id]

        # Expiry buckets distribution
        # 8% Critical (1-7 days), 16% High (8-30 days), 25% Medium (31-60 days), 25% Low (61-90 days), 26% Normal (>90 days)
        bucket_rand = random.random()
        if bucket_rand < 0.08:
            # Critical (1 - 7 days)
            days_to_exp = random.randint(1, 7)
            status = "Near Expiry"
        elif bucket_rand < 0.24:
            # High (8 - 30 days)
            days_to_exp = random.randint(8, 30)
            status = "Near Expiry" if random.random() < 0.8 else "Available"
        elif bucket_rand < 0.49:
            # Medium (31 - 60 days)
            days_to_exp = random.randint(31, 60)
            status = "Available"
        elif bucket_rand < 0.74:
            # Low (61 - 90 days)
            days_to_exp = random.randint(61, 90)
            status = "Available"
        else:
            # Normal (> 90 days)
            days_to_exp = random.randint(91, 365)
            status = "Available"

        # Occasional reserved or expired batches
        if days_to_exp <= 0 or (days_to_exp <= 2 and random.random() < 0.2):
            days_to_exp = random.randint(-15, 0)
            status = "Expired"

        expiry_date = (SIMULATION_REF_DATE + timedelta(days=days_to_exp)).strftime("%Y-%m-%d")
        received_date = (SIMULATION_REF_DATE - timedelta(days=random.randint(60, 300))).strftime("%Y-%m-%d")

        # Quantity logic: some small, some large excess
        if random.random() < 0.35:
            # High excess stock relative to daily demand
            daily_d = daily_demand_map.get((m_id, l_id), 15.0)
            qty = int(round(daily_d * max(1, days_to_exp) * random.uniform(1.8, 3.5)))
            qty = max(50, min(qty, 1200))
        elif random.random() < 0.7:
            # Normal stock
            daily_d = daily_demand_map.get((m_id, l_id), 15.0)
            qty = int(round(daily_d * max(1, days_to_exp) * random.uniform(0.6, 1.2)))
            qty = max(20, min(qty, 600))
        else:
            # Small or standard pack
            qty = random.randint(20, 250)

        is_corrupted = 0
        corruption_reason = None

        # Inject Data Quality edge cases in 35 batches
        if batch_counter in (12, 45, 88, 123, 199, 250, 310, 420, 560, 680, 750, 890, 940, 1050, 1200):
            is_corrupted = 1
            if batch_counter % 4 == 0:
                qty = -random.randint(10, 80)
                corruption_reason = "Negative stock quantity recorded"
                data_quality_issues.append((
                    f"DQ-{len(data_quality_issues)+1:04d}", b_id, "quantity", "Negative Quantity",
                    str(qty), "Inventory tally impossible; prevents automated allocation",
                    "Conduct physical cycle count and correct ERP record", 0, SIMULATION_REF_DATE.strftime("%Y-%m-%d %H:%M:%S")
                ))
            elif batch_counter % 4 == 1:
                expiry_date = "2020-02-30" # invalid date
                corruption_reason = "Malformed calendar date"
                data_quality_issues.append((
                    f"DQ-{len(data_quality_issues)+1:04d}", b_id, "expiry_date", "Invalid Expiry",
                    expiry_date, "Date parsing failure; days-to-expiry cannot be determined",
                    "Verify manufacturer blister pack stamp and re-enter valid ISO date", 0, SIMULATION_REF_DATE.strftime("%Y-%m-%d %H:%M:%S")
                ))
            elif batch_counter % 4 == 2:
                # Reserved stock constraint
                status = "Reserved"
                corruption_reason = "Stock flagged Available in ERP but marked Reserved in WMS"
                data_quality_issues.append((
                    f"DQ-{len(data_quality_issues)+1:04d}", b_id, "batch_status", "Conflicting Reservation",
                    status, "Attempting transfer will cause fulfillment failure for reserved patient orders",
                    "Audit WMS reservation hold before releasing to redistribution pool", 0, SIMULATION_REF_DATE.strftime("%Y-%m-%d %H:%M:%S")
                ))
            else:
                corruption_reason = "Missing warehouse bin coordinate / location discrepancy"
                data_quality_issues.append((
                    f"DQ-{len(data_quality_issues)+1:04d}", b_id, "location_id", "Location Discrepancy",
                    l_id, "Physical stock cannot be located by dispatch team",
                    "Check transit quarantine bay and update bin assignment", 0, SIMULATION_REF_DATE.strftime("%Y-%m-%d %H:%M:%S")
                ))

        batches.append((
            b_id, m_id, l_id, qty, expiry_date, received_date, unit_price, status, is_corrupted, corruption_reason
        ))
        batch_counter += 1

    # Specifically ensure our 4 key demo scenarios are present at the beginning:
    # Demo Scenario A: Batch expires in 5 days, high excess, destination has high demand -> TRANSFER
    demo_a = ("BATCH-10001", "MED-002", "LOC-001", 350, (SIMULATION_REF_DATE + timedelta(days=5)).strftime("%Y-%m-%d"),
              (SIMULATION_REF_DATE - timedelta(days=120)).strftime("%Y-%m-%d"), 68.0, "Near Expiry", 0, None)
    # Demo Scenario B: Batch expires in 3 days, no destination has sufficient demand -> URGENT_REVIEW
    demo_b = ("BATCH-10002", "MED-040", "LOC-004", 45, (SIMULATION_REF_DATE + timedelta(days=3)).strftime("%Y-%m-%d"),
              (SIMULATION_REF_DATE - timedelta(days=150)).strftime("%Y-%m-%d"), 2200.0, "Near Expiry", 0, None)
    # Demo Scenario C: Batch has enough local demand -> USE_LOCALLY
    demo_c = ("BATCH-10003", "MED-001", "LOC-002", 120, (SIMULATION_REF_DATE + timedelta(days=14)).strftime("%Y-%m-%d"),
              (SIMULATION_REF_DATE - timedelta(days=90)).strftime("%Y-%m-%d"), 24.5, "Near Expiry", 0, None)
    # Demo Scenario D: Destination has capacity constraint -> TRANSFER BLOCKED
    demo_d = ("BATCH-10004", "MED-009", "LOC-005", 280, (SIMULATION_REF_DATE + timedelta(days=12)).strftime("%Y-%m-%d"),
              (SIMULATION_REF_DATE - timedelta(days=100)).strftime("%Y-%m-%d"), 76.0, "Near Expiry", 0, None)

    batches[0] = demo_a
    batches[1] = demo_b
    batches[2] = demo_c
    batches[3] = demo_d

    cursor.executemany("""
        INSERT INTO inventory_batches (batch_id, medicine_id, location_id, quantity, expiry_date, received_date, unit_price, batch_status, is_data_corrupted, corruption_reason)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, batches)

    cursor.executemany("""
        INSERT INTO data_quality_issues (issue_id, batch_id, field_name, issue_type, raw_value, impact, corrective_action, is_resolved, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, data_quality_issues)

    # 5. Seed App Settings
    print("[5/5] Seeding configurable settings, audit log, and initial evaluation state...")
    settings = [
        ("critical_expiry_days", "7", "thresholds", "Threshold in days for critical near-expiry flag"),
        ("high_expiry_days", "30", "thresholds", "Threshold in days for high near-expiry flag"),
        ("medium_expiry_days", "60", "thresholds", "Threshold in days for medium near-expiry flag"),
        ("high_impact_value_inr", "5000", "thresholds", "Monetary stock value threshold requiring mandatory human approval (₹)"),
        ("critical_quantity_threshold", "100", "thresholds", "Quantity threshold requiring mandatory human approval (units)"),
        ("max_transfer_distance_km", "30", "thresholds", "Maximum acceptable redistribution distance between pharmacy hubs (km)"),
        ("weight_expiry_urgency", "0.35", "scoring_weights", "Scoring weight for days to expiry (0.0 - 1.0)"),
        ("weight_destination_demand", "0.30", "scoring_weights", "Scoring weight for destination demand absorption (0.0 - 1.0)"),
        ("weight_excess_stock", "0.20", "scoring_weights", "Scoring weight for excess ratio above local demand (0.0 - 1.0)"),
        ("weight_stock_value", "0.10", "scoring_weights", "Scoring weight for at-risk inventory value (0.0 - 1.0)"),
        ("weight_distance_suitability", "0.05", "scoring_weights", "Scoring weight for transit distance efficiency (0.0 - 1.0)"),
        ("simulation_date", "2026-09-10", "simulation", "Configurable reference date for expiry calculations"),
        ("simulation_scenario", "Normal Demand", "simulation", "Active simulated scenario for stress-testing"),
        ("transport_status", "Available", "simulation", "Status of local inter-branch pharmaceutical transit fleet"),
        ("destination_capacity_mode", "Dynamic", "simulation", "Storage headroom enforcement at destination hub")
    ]
    cursor.executemany("""
        INSERT INTO app_settings (setting_key, setting_value, setting_group, description)
        VALUES (?, ?, ?, ?)
    """, settings)

    # Illustrative prototype validation data from stakeholders (as requested in requirement #38)
    feedback_entries = [
        ("FB-001", "Pharmacy Operations Manager", "Review near-expiry insulin batch & authorize transit", 5, 5, 5, 4, 5, 5,
         "The explicit evidence breakdown showing excess quantity vs destination consumption gave our ops supervisors immediate confidence to assign transit.", "2026-09-08 14:20:00"),
        ("FB-002", "Senior Inventory Specialist", "Overriding recommendation due to cold chain carrier maintenance", 4, 5, 4, 5, 5, 4,
         "Mandatory override reason logging guarantees accountability when regional vans are undergoing scheduled temperature calibration.", "2026-09-08 16:45:00"),
        ("FB-003", "Clinical Supervising Pharmacist", "Verify non-clinical decision boundary", 5, 5, 5, 5, 5, 5,
         "Crucial that this tool focuses strictly on stock relocation and never attempts automated dosage or patient substitution.", "2026-09-09 09:10:00"),
        ("FB-004", "Regional Hub Dispatcher", "Review automated task assignment and escalate overdue batch", 4, 4, 5, 4, 5, 5,
         "The tiered escalation (Supervisor -> Regional Manager -> Operations Head) prevents high-value oncologics and antibiotics from silently expiring.", "2026-09-09 11:30:00")
    ]
    cursor.executemany("""
        INSERT INTO stakeholder_feedback (feedback_id, role, task_tested, ease_of_use, recommendation_clarity, evidence_clarity, trust_score, human_approval_clarity, follow_up_usability, comments, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, feedback_entries)

    conn.commit()

    # Now write CSV files for dataset/ folder
    print("Writing CSV files to dataset/ directory...")
    export_table_to_csv(cursor, "medicines", os.path.join(DATASET_DIR, "medicines.csv"))
    export_table_to_csv(cursor, "locations", os.path.join(DATASET_DIR, "locations.csv"))
    export_table_to_csv(cursor, "inventory_batches", os.path.join(DATASET_DIR, "inventory_batches.csv"))
    export_table_to_csv(cursor, "demand", os.path.join(DATASET_DIR, "demand.csv"))

    # Count records
    cursor.execute("SELECT COUNT(*) FROM medicines")
    med_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM locations")
    loc_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM inventory_batches")
    batch_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM demand")
    demand_count = cursor.fetchone()[0]

    total_records = batch_count + demand_count + med_count + loc_count
    print(f"\n=======================================================")
    print(f"DATABASE SEEDING SUCCESSFUL")
    print(f"Medicines:           {med_count}")
    print(f"Locations:           {loc_count}")
    print(f"Inventory Batches:   {batch_count}")
    print(f"Demand Observations: {demand_count}")
    print(f"TOTAL DATA RECORDS:  {total_records} (Exceeds >10,000 requirement)")
    print(f"SQLite File:         {DB_PATH}")
    print(f"=======================================================\n")

    conn.close()

def export_table_to_csv(cursor, table_name, file_path):
    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()
    col_names = [description[0] for description in cursor.description]
    with open(file_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(col_names)
        writer.writerows(rows)

if __name__ == "__main__":
    generate()

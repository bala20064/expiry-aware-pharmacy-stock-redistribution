#!/usr/bin/env python3
"""
Baseline Model: Manual / Status-Quo Approach
Simulates standard pharmacy practice:
- Batches are identified late (reactive inspection, typically <= 14 days)
- Stock is kept at local pharmacy branch without cross-hub demand matching
- No automated transfer recommendations
- High proportion of excess near-expiry stock expires unconsumed
"""

import sqlite3
from datetime import datetime

def run_baseline_simulation(db_path="pharmacy_inventory.db", ref_date_str="2026-09-10"):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    ref_date = datetime.strptime(ref_date_str, "%Y-%m-%d")

    cursor.execute("""
        SELECT b.batch_id, b.medicine_id, b.location_id, b.quantity, b.expiry_date,
               b.unit_price, b.batch_status, b.is_data_corrupted
        FROM inventory_batches b
        WHERE b.batch_status IN ('Available', 'Near Expiry') AND b.is_data_corrupted = 0
    """)
    batches = cursor.fetchall()

    # Load baseline daily demand
    cursor.execute("SELECT medicine_id, location_id, historical_daily_demand FROM demand WHERE date <= ? ORDER BY date DESC", (ref_date_str,))
    demand_map = {}
    for r in cursor.fetchall():
        key = (r["medicine_id"], r["location_id"])
        if key not in demand_map:
            demand_map[key] = r["historical_daily_demand"]

    total_at_risk_value = 0.0
    value_used_before_expiry = 0.0
    value_transferred_before_expiry = 0.0  # Baseline has virtually zero proactive transfers
    value_expired = 0.0
    qty_saved = 0
    qty_expired = 0

    batches_evaluated = 0
    high_priority_unresolved = 0

    for b in batches:
        try:
            exp_date = datetime.strptime(b["expiry_date"], "%Y-%m-%d")
        except Exception:
            continue

        days_to_exp = (exp_date - ref_date).days
        if days_to_exp > 90 or days_to_exp <= 0:
            continue

        batches_evaluated += 1
        qty = b["quantity"]
        price = b["unit_price"]
        batch_val = qty * price
        total_at_risk_value += batch_val

        daily_demand = demand_map.get((b["medicine_id"], b["location_id"]), 10.0)

        # Baseline: Only consumes locally. Late discovery means only 65% of expected consumption is captured.
        local_absorb = min(qty, int(round(daily_demand * days_to_exp * 0.65)))
        waste_qty = max(0, qty - local_absorb)

        value_used = local_absorb * price
        value_exp = waste_qty * price

        value_used_before_expiry += value_used
        value_expired += value_exp
        qty_saved += local_absorb
        qty_expired += waste_qty

        if days_to_exp <= 14:
            high_priority_unresolved += 1

    conn.close()

    recovery_rate = (value_used_before_expiry / max(1.0, total_at_risk_value)) * 100.0

    return {
        "model_name": "Baseline (Manual Expiry Sorting)",
        "batches_evaluated": batches_evaluated,
        "total_at_risk_value": round(total_at_risk_value, 2),
        "value_used_before_expiry": round(value_used_before_expiry, 2),
        "value_transferred_before_expiry": round(value_transferred_before_expiry, 2),
        "value_expired": round(value_expired, 2),
        "quantity_saved": int(qty_saved),
        "quantity_expired": int(qty_expired),
        "stock_recovery_rate_pct": round(recovery_rate, 2),
        "redistribution_success_rate_pct": 0.0,
        "wastage_reduction_pct": 0.0,
        "high_priority_unresolved_actions": high_priority_unresolved,
        "average_action_time_days": 11.4
    }

if __name__ == "__main__":
    res = run_baseline_simulation()
    print("Baseline Simulation Results:")
    for k, v in res.items():
        print(f"  {k}: {v}")

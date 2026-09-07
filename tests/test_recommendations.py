#!/usr/bin/env python3
"""
Unit Tests for Recommendation Engine:
Test 1: Near-expiry stock correctly identified
Test 2: Excess stock correctly calculated
Test 3: Suitable destination correctly selected
Test 4: No destination -> urgent review
Test 5: Critical expiry -> human confirmation
"""

import sys
import os
import json
import sqlite3
import unittest
from datetime import datetime

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from backend.recommendation_engine import compute_recommendations

class TestRecommendationEngine(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.db_path = "pharmacy_inventory.db"
        compute_recommendations(cls.db_path)

    def test_1_near_expiry_identified(self):
        """Test 1: Verify near-expiry stock (<= 90 days) is correctly detected."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM redistribution_recommendations WHERE days_to_expiry <= 90")
        count = cursor.fetchone()[0]
        conn.close()
        self.assertGreater(count, 0, "Should identify near-expiry batches within 90 days")

    def test_2_excess_stock_calculation(self):
        """Test 2: Verify excess stock logic (quantity vs local demand)."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT quantity, source_demand, recommended_action FROM redistribution_recommendations WHERE recommended_action = 'USE_LOCALLY' LIMIT 5")
        rows = cursor.fetchall()
        conn.close()
        self.assertGreater(len(rows), 0, "Must have USE_LOCALLY recommendations")
        for qty, src_demand, action in rows:
            self.assertLessEqual(qty, src_demand + 1e-3, "USE_LOCALLY should only be recommended when local demand absorbs quantity")

    def test_3_suitable_destination_selected(self):
        """Test 3: Destination selection for TRANSFER has positive demand and feasible distance."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT source_location, destination_location, destination_demand, distance_km
            FROM redistribution_recommendations
            WHERE recommended_action = 'TRANSFER' AND destination_location IS NOT NULL
            LIMIT 10
        """)
        rows = cursor.fetchall()
        conn.close()
        self.assertGreater(len(rows), 0, "Must have valid transfer recommendations")
        for src, dest, dest_demand, dist in rows:
            self.assertNotEqual(src, dest, "Source and destination must be distinct")
            self.assertGreater(dest_demand, 0.0, "Destination must display positive demand")
            self.assertLessEqual(dist, 30.0, "Distance must be within 30 km operational threshold")

    def test_4_no_destination_urgent_review(self):
        """Test 4: If no destination is suitable, action must be URGENT_REVIEW."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT recommendation_id, recommended_action, reason
            FROM redistribution_recommendations
            WHERE batch_id = 'BATCH-10002'
        """)
        row = cursor.fetchone()
        conn.close()
        self.assertIsNotNone(row, "Demo Scenario B batch must exist")
        self.assertEqual(row[1], "URGENT_REVIEW", "Scenario B with no suitable destination should trigger URGENT_REVIEW")

    def test_5_critical_expiry_human_confirmation(self):
        """Test 5: Batches with critical expiry (<= 7 days) require mandatory human confirmation."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT recommendation_id, days_to_expiry, requires_human_confirmation
            FROM redistribution_recommendations
            WHERE days_to_expiry <= 7 AND recommended_action = 'TRANSFER'
            LIMIT 5
        """)
        rows = cursor.fetchall()
        conn.close()
        self.assertGreater(len(rows), 0, "Must have critical transfer batches")
        for rec_id, days, req_human in rows:
            self.assertEqual(req_human, 1, f"Batch with {days} days to expiry must require human confirmation")

if __name__ == "__main__":
    unittest.main()

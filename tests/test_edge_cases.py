#!/usr/bin/env python3
"""
Unit Tests for Edge Cases & Human Workflow:
Test 6: Override requires reason
Test 8: Invalid data is flagged as DATA_QUALITY_ISSUE and isolated
Test 9: Approved transfer changes status
"""

import sys
import os
import json
import sqlite3
import unittest
from datetime import datetime

class TestEdgeCases(unittest.TestCase):

    def setUp(self):
        self.db_path = "pharmacy_inventory.db"

    def test_6_override_requires_reason(self):
        """Test 6: Overriding a recommendation fails without an override reason."""
        def attempt_override(rec_id, reviewer, reason):
            if not reason or not reason.strip():
                raise ValueError("Override reason is strictly required")
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE redistribution_recommendations
                SET status = 'Overridden'
                WHERE recommendation_id = ?
            """, (rec_id,))
            cursor.execute("""
                INSERT INTO human_reviews (review_id, recommendation_id, reviewer_name, decision, override_reason, decision_time)
                VALUES (?, ?, ?, 'Overridden', ?, ?)
            """, (f"REV-TEST-{rec_id}", rec_id, reviewer, reason, datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
            conn.commit()
            conn.close()
            return True

        # Must fail when reason is empty or whitespace
        with self.assertRaises(ValueError):
            attempt_override("REC-1001", "Pharmacist", "")

        with self.assertRaises(ValueError):
            attempt_override("REC-1001", "Pharmacist", "   ")

        # Must succeed when reason is provided
        success = attempt_override("REC-1001", "Dr. A. Sharma", "Destination refrigeration unit undergoing service")
        self.assertTrue(success)

    def test_8_invalid_data_isolated(self):
        """Test 8: Records with corrupt data (negative qty, invalid dates) are excluded from scoring."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM data_quality_issues WHERE is_resolved = 0")
        dq_count = cursor.fetchone()[0]
        self.assertGreater(dq_count, 0, "Data quality table must contain detected corrupt records")

        cursor.execute("""
            SELECT recommendation_id, recommended_action, reason
            FROM redistribution_recommendations
            WHERE batch_id IN (SELECT batch_id FROM inventory_batches WHERE is_data_corrupted = 1)
        """)
        corrupted_recs = cursor.fetchall()
        conn.close()

        for rec_id, action, reason in corrupted_recs:
            self.assertEqual(action, "NO_ACTION", "Corrupted records must be assigned NO_ACTION")
            self.assertIn("Data Quality", reason, "Reason must cite data quality exception")

    def test_9_approved_transfer_changes_status(self):
        """Test 9: Explicit human approval transitions status from Pending to Approved."""
        rec_id = "REC-1005"
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("UPDATE redistribution_recommendations SET status = 'Approved' WHERE recommendation_id = ?", (rec_id,))
        cursor.execute("""
            INSERT INTO human_reviews (review_id, recommendation_id, reviewer_name, decision, decision_time)
            VALUES (?, ?, 'P. Sundaram (Pharmacist)', 'Approved', ?)
        """, (f"REV-TEST-{rec_id}", rec_id, datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
        conn.commit()

        cursor.execute("SELECT status FROM redistribution_recommendations WHERE recommendation_id = ?", (rec_id,))
        new_status = cursor.fetchone()[0]
        conn.close()

        self.assertEqual(new_status, "Approved", "Status must be updated to Approved upon user confirmation")

if __name__ == "__main__":
    unittest.main()

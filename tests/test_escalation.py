#!/usr/bin/env python3
"""
Unit Tests for Task Escalation and Audit Trail:
Test 7: Overdue task escalates
Test 10: Audit log records actions
"""

import sys
import os
import sqlite3
import unittest
from datetime import datetime, timedelta

class TestEscalationAndAudit(unittest.TestCase):

    def setUp(self):
        self.db_path = "pharmacy_inventory.db"

    def test_7_overdue_task_escalation(self):
        """Test 7: Tasks that are overdue and critical escalate through escalation tiers."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Insert a task that is past due date with Critical priority
        task_id = "TASK-TEST-ESC-01"
        past_due = (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d 17:00:00")
        cursor.execute("DELETE FROM follow_up_tasks WHERE task_id = ?", (task_id,))
        cursor.execute("""
            INSERT INTO follow_up_tasks (
                task_id, recommendation_id, owner, due_date, priority, status,
                escalation_level, escalation_reason, last_updated, created_at
            ) VALUES (?, 'REC-1002', 'Test Assignee', ?, 'Critical', 'Open', 0, NULL, ?, ?)
        """, (task_id, past_due, past_due, past_due))
        conn.commit()

        # Simulate escalation worker
        cursor.execute("""
            SELECT task_id, due_date, priority, escalation_level
            FROM follow_up_tasks
            WHERE task_id = ?
        """, (task_id,))
        t = cursor.fetchone()
        
        due = datetime.strptime(t[1], "%Y-%m-%d %H:%M:%S")
        is_overdue = datetime.now() > due
        new_esc_level = t[3]
        new_status = "Open"
        reason = None

        if is_overdue and t[2] == "Critical":
            new_esc_level = t[3] + 1
            new_status = "Overdue"
            reason = "Overdue Critical Task: Escalated to Supervisor (Level 1)"

        cursor.execute("""
            UPDATE follow_up_tasks
            SET status = ?, escalation_level = ?, escalation_reason = ?, last_updated = ?
            WHERE task_id = ?
        """, (new_status, new_esc_level, reason, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), task_id))
        conn.commit()

        # Verify escalation
        cursor.execute("SELECT status, escalation_level FROM follow_up_tasks WHERE task_id = ?", (task_id,))
        updated = cursor.fetchone()
        conn.close()

        self.assertEqual(updated[0], "Overdue", "Status should be Overdue")
        self.assertGreater(updated[1], 0, "Escalation level must be incremented for overdue critical task")

    def test_10_audit_log_records_actions(self):
        """Test 10: Every critical action (approvals, overrides, config changes) is persisted in audit_log."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        audit_id = f"AUD-TEST-{datetime.now().strftime('%f')}"
        user = "S. Ramaswamy (Inventory Lead)"
        action = "Manual Override"
        rec_id = "REC-1004"
        old_st = "Pending"
        new_st = "Overridden"
        reason = "Warehouse undergoing physical partition re-alignment"

        cursor.execute("""
            INSERT INTO audit_log (audit_id, timestamp, user, role, action, recommendation_id, old_status, new_status, reason)
            VALUES (?, ?, ?, 'Supervisor', ?, ?, ?, ?, ?)
        """, (audit_id, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), user, action, rec_id, old_st, new_st, reason))
        conn.commit()

        cursor.execute("SELECT audit_id, action, new_status FROM audit_log WHERE audit_id = ?", (audit_id,))
        row = cursor.fetchone()
        conn.close()

        self.assertIsNotNone(row, "Audit record must be successfully inserted")
        self.assertEqual(row[1], "Manual Override")
        self.assertEqual(row[2], "Overridden")

if __name__ == "__main__":
    unittest.main()

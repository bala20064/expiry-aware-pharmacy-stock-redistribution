import React, { useEffect, useState } from "react";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Search,
  CheckCircle2,
  ArrowUpRight,
  ShieldAlert,
  Plus,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { api } from "../services/api";
import { FollowUpTask, UserRole } from "../types";

interface TasksPageProps {
  currentRole: UserRole;
  initialFilterTab?: string;
  onNavigateRec?: (recId: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  currentRole,
  initialFilterTab = "all",
  onNavigateRec
}) => {
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [filterTab, setFilterTab] = useState(initialFilterTab);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEscalating, setIsEscalating] = useState(false);
  const [message, setMessage] = useState("");

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const res = await api.getTasks(filterTab, search);
      setTasks(res.tasks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filterTab, search]);

  const handleRunEscalationCheck = async () => {
    try {
      setIsEscalating(true);
      const res = await api.runEscalationCheck();
      setMessage(`Escalation check completed: ${res.escalated_count} overdue task(s) escalated.`);
      fetchTasks();
    } catch (err: any) {
      setMessage("Error checking escalations: " + err.message);
    } finally {
      setIsEscalating(false);
    }
  };

  const handleMarkCompleted = async (taskId: string) => {
    try {
      await api.updateTask(taskId, { status: "Completed" });
      setMessage(`Task ${taskId} marked as Completed.`);
      fetchTasks();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleEscalateManual = async (task: FollowUpTask) => {
    const nextLevel = Math.min(3, (task.escalation_level || 0) + 1);
    try {
      await api.updateTask(task.task_id, {
        escalation_level: nextLevel,
        status: "Escalated"
      });
      setMessage(`Task ${task.task_id} manually escalated to Level ${nextLevel}.`);
      fetchTasks();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const getEscalationBadge = (level: number) => {
    switch (level) {
      case 1:
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-100 text-amber-900">Level 1 (Supervisor)</span>;
      case 2:
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-orange-100 text-orange-900">Level 2 (Regional Manager)</span>;
      case 3:
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-red-100 text-red-900 animate-pulse">Level 3 (Operations Head)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-slate-100 text-slate-700">Level 0 (Assigned)</span>;
    }
  };

  return (
    <div id="tasks-page" className="space-y-4">
      {/* Toast Message */}
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">{message}</span>
          </div>
          <button onClick={() => setMessage("")} className="text-emerald-700 hover:text-emerald-900">
            &times;
          </button>
        </div>
      )}

      {/* Control Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Follow-Up Tasks &amp; Multi-Tier Escalation</h2>
            <p className="text-xs text-slate-500">
              Assigned action items for stock redistribution verification, transfer execution, and overdue escalation tracking.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="run-escalation-check-btn"
              onClick={handleRunEscalationCheck}
              disabled={isEscalating}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isEscalating ? "Checking Overdue Tasks..." : "Trigger Escalation Check"}</span>
            </button>
          </div>
        </div>

        {/* Tab Selection and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {[
              { id: "all", label: "All Tasks" },
              { id: "my_tasks", label: "My Assigned Tasks" },
              { id: "overdue", label: "Overdue" },
              { id: "escalated", label: "Escalated (L1–L3)" },
              { id: "completed", label: "Completed" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  filterTab === tab.id
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search task ID, owner, medicine..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="follow-up-tasks-table" className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10.5px]">
                <th className="py-3 px-4">Task ID &amp; Recommendation</th>
                <th className="py-3 px-4">Medicine &amp; Batch Quantity</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-3">Owner</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3">Escalation Tier</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2" />
                    Loading tasks...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No follow-up tasks match the selected filter.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr
                    key={task.task_id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      task.status === "Overdue" || task.escalation_level > 0 ? "bg-amber-50/15" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{task.task_id}</span>
                      <button
                        onClick={() => onNavigateRec && onNavigateRec(task.recommendation_id)}
                        className="text-[11px] font-mono text-emerald-600 hover:underline"
                      >
                        {task.recommendation_id}
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{task.medicine_name || "Medication Item"}</div>
                      <div className="text-[11px] text-slate-500">
                        {task.quantity ? `${task.quantity.toLocaleString()} units` : "Action verification"} &bull;{" "}
                        <strong className="text-emerald-700">₹{task.estimated_stock_value?.toLocaleString() || "0"}</strong>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-700 text-[11px]">
                      {task.source_name ? (
                        <>
                          {task.source_name.split(" ")[0]} &rarr; {task.dest_name ? task.dest_name.split(" ")[0] : "Local"}
                        </>
                      ) : (
                        "Regional Network"
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{task.owner}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{task.due_date}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {getEscalationBadge(task.escalation_level)}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                          task.status === "Completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : task.status === "Overdue"
                            ? "bg-red-100 text-red-800 animate-pulse"
                            : task.status === "Escalated"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {task.status !== "Completed" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleMarkCompleted(task.task_id)}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer"
                          >
                            Mark Complete
                          </button>
                          {task.escalation_level < 3 && (
                            <button
                              onClick={() => handleEscalateManual(task)}
                              className="px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg cursor-pointer"
                              title="Manually Escalate Task Level"
                            >
                              Escalate &uarr;
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Done
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

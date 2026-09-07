import React, { useEffect, useState } from "react";
import {
  History,
  Search,
  Download,
  Filter,
  User,
  ShieldCheck,
  ArrowRight,
  FileSpreadsheet,
  CheckCircle2
} from "lucide-react";
import { api } from "../services/api";
import { AuditLogEntry } from "../types";

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAuditLogs({ search, limit: 100 });
      setLogs(res.logs);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search]);

  return (
    <div id="audit-log-page" className="space-y-4 text-xs">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Governance &amp; Regulatory Audit Trail</h2>
              <p className="text-xs text-slate-500">
                Tamper-evident log tracking every recommendation review, supervisor override, task escalation, and simulation event.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/api/export/audit"
              download="audit_log.csv"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit CSV</span>
            </a>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="audit-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search User, Action, Rec ID, Reason..."
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <span className="text-slate-500 text-[11px]">
          Showing latest {logs.length} audit entries
        </span>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="audit-log-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10.5px]">
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User &amp; Role</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Target Reference</th>
                <th className="py-3 px-4">State Transition</th>
                <th className="py-3 px-4">Documented Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No audit records match the search criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.audit_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {log.audit_id}
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{log.user}</div>
                      <div className="text-[10.5px] text-slate-400">{log.role}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                          log.action.includes("Approve")
                            ? "bg-emerald-100 text-emerald-800"
                            : log.action.includes("Override")
                            ? "bg-amber-100 text-amber-900"
                            : log.action.includes("Reject")
                            ? "bg-red-100 text-red-800"
                            : log.action.includes("Escalate")
                            ? "bg-orange-100 text-orange-900"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700">
                      {log.recommendation_id || log.task_id || "System Config"}
                    </td>

                    <td className="py-3 px-4 text-[11px]">
                      {log.old_status && log.new_status ? (
                        <div className="flex items-center gap-1 text-slate-700">
                          <span className="font-mono text-slate-500">{log.old_status}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-mono font-bold text-slate-900">{log.new_status}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">&mdash;</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-700 leading-relaxed max-w-sm">
                      {log.reason || "Automatic system execution"}
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

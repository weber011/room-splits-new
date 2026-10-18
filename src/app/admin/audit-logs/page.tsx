"use client";

import { useState, useEffect } from "react";
import { adminService, AuditLogRecord } from "@/services/admin.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Shield, Clock, FileText } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await adminService.getAuditLogs(100);
        setLogs(data);
      } catch (err) {
        console.error("Failed to load audit logs", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="warning" className="mb-2">Security Audit Trail</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Shield className="h-8 w-8 text-emerald-400" />
              <span>Immutable Administrative Audit Logs</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Tamper-evident security trail recording all sensitive owner approvals, property moderations, and administrative decisions.
            </p>
          </div>
        </div>

        {/* Audit Log Table */}
        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4 rounded-2xl">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-400 text-xs">Loading audit trail...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No administrative action logs recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Admin Actor</th>
                    <th className="py-3 px-4">Action Type</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Details & Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-950/50 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          <span>{new Date(l.createdAt).toLocaleString("en-IN")}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{l.adminName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{l.adminId.slice(0, 8)}...</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400 uppercase tracking-wide">
                        <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                          {l.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize font-semibold text-white">{l.targetType}</span>
                        <div className="text-[10px] text-slate-400 font-mono">{l.targetId}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {l.metadata && Object.keys(l.metadata).length > 0 ? (
                          <div className="max-w-md truncate text-[11px] font-mono text-slate-400 bg-slate-950 p-1.5 rounded border border-slate-800">
                            {JSON.stringify(l.metadata)}
                          </div>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-1">
                            <FileText className="h-3 w-3" /> Standard action
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

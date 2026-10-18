"use client";

import { useState, useEffect, useCallback } from "react";
import { adminService, AdminVisitRecord } from "@/services/admin.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, MapPin, Building2, User, Clock } from "lucide-react";

export default function AdminVisitsPage() {
  const [visits, setVisits] = useState<AdminVisitRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(true);

  const loadVisits = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getVisits({
        status: statusFilter,
      });
      setVisits(data);
    } catch (err) {
      console.error("Failed to load visit requests", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadVisits();
  }, [loadVisits]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">CONFIRMED</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">PENDING</Badge>;
      case "completed":
        return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">COMPLETED</Badge>;
      case "declined":
      case "cancelled":
        return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30">{status.toUpperCase()}</Badge>;
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="warning" className="mb-2">Tours Ledger</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <CalendarCheck className="h-8 w-8 text-amber-400" />
              <span>Master Visit Requests Oversight</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Audit all student physical property visit appointments and host tour lifecycle responses.
            </p>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {["ALL", "pending", "confirmed", "completed", "cancelled", "declined"].map((st) => (
            <Button
              key={st}
              size="sm"
              variant={statusFilter === st ? "default" : "outline"}
              onClick={() => setStatusFilter(st)}
              className="uppercase text-xs cursor-pointer font-bold"
            >
              {st}
            </Button>
          ))}
        </div>

        {/* Visits Table */}
        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4 rounded-2xl">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-400 text-xs">Loading visit requests...</p>
            </div>
          ) : visits.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No visit requests found for status &quot;{statusFilter}&quot;.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Property & City</th>
                    <th className="py-3 px-4">Host / PG</th>
                    <th className="py-3 px-4">Scheduled Date & Slot</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Requested On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {visits.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-950/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{v.studentName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono pl-5">{v.studentPhone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{v.propertyTitle}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          <span>{v.propertyCity}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-200 flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                          <span>{v.ownerBusinessName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white font-mono font-semibold">{v.preferredDate}</div>
                        <div className="text-[11px] text-slate-400 capitalize">{v.preferredTimeSlot} Slot</div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(v.status)}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(v.createdAt).toLocaleDateString("en-IN")}</span>
                        </span>
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

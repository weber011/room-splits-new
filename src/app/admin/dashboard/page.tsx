import { requireAdmin } from "@/lib/auth-helpers";
import { signOutAction } from "@/app/actions/auth.actions";
import Link from "next/link";
import { adminService } from "@/services/admin.service";
import { Button } from "@/components/ui/button";
import { DashboardStatCard } from "@/components/common/DashboardStatCard";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Users,
  Building2,
  CheckCircle2,
  ShieldAlert,
  CalendarCheck,
  Clock,
  LogOut,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Archive,
} from "lucide-react";

export default async function AdminDashboardPage() {
  // Server-side authorization check (never trust client alone)
  const user = await requireAdmin();

  const [stats, pendingOwners, auditLogs] = await Promise.all([
    adminService.getDashboardStats(),
    adminService.getOwners("pending"),
    adminService.getAuditLogs(5),
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="warning">Admin Console</Badge>
              <Badge variant="outline" className="text-[10px]">Super Administrator</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Platform Master Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Welcome back, <strong className="text-white">{user.fullName}</strong>. Live database-backed platform metrics, host verifications, and property moderation.
            </p>
          </div>

          <form action={signOutAction}>
            <Button variant="danger" size="sm" className="gap-2 cursor-pointer">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>

        {/* Real-time Platform Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          <DashboardStatCard
            title="Total Profiles"
            value={stats.totalUsers.toString()}
            change={`${stats.totalStudents} Students • ${stats.totalOwners} Hosts`}
            icon={Users}
          />
          <DashboardStatCard
            title="Pending Host KYC"
            value={stats.pendingVerification.toString()}
            change="Awaiting Administrator Review"
            icon={ShieldAlert}
          />
          <DashboardStatCard
            title="Verified Hosts"
            value={stats.totalOwners > 0 ? `${stats.totalOwners - stats.pendingVerification}` : "0"}
            change="Active PG Hosts"
            icon={ShieldCheck}
          />
          <DashboardStatCard
            title="Total Properties"
            value={stats.totalProperties.toString()}
            change={`${stats.publishedProperties} Published • ${stats.draftProperties} Draft`}
            icon={Building2}
          />
          <DashboardStatCard
            title="Published Listings"
            value={stats.publishedProperties.toString()}
            change="Live for Discovery"
            icon={CheckCircle2}
          />
          <DashboardStatCard
            title="Archived Listings"
            value={stats.archivedProperties.toString()}
            change="Violations / Suspended"
            icon={Archive}
          />
          <DashboardStatCard
            title="Total Visit Requests"
            value={stats.totalVisits.toString()}
            change="Physical PG Tours"
            icon={CalendarCheck}
          />
          <DashboardStatCard
            title="Pending Tour Requests"
            value={stats.pendingVisits.toString()}
            change={`${stats.confirmedVisits} Confirmed Visits`}
            icon={Clock}
          />
        </div>

        {/* Action Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Owner Verification Queue */}
          <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4 rounded-2xl">
            <CardHeader className="p-0 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-amber-400" />
                <span>Pending Host Verification Queue</span>
              </CardTitle>
              <Link href="/admin/owner-verification" className="text-xs text-amber-400 font-semibold hover:underline flex items-center gap-1">
                <span>View All ({pendingOwners.length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {pendingOwners.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  All host applications reviewed. No pending verification requests!
                </div>
              ) : (
                pendingOwners.slice(0, 4).map((owner) => (
                  <div
                    key={owner.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-white">{owner.businessName}</h4>
                      <p className="text-xs text-slate-400">
                        {owner.name} • {owner.primaryCity} • Phone: {owner.phone}
                      </p>
                    </div>
                    <Link href="/admin/owner-verification">
                      <Button size="sm" variant="warning" className="text-xs cursor-pointer">
                        Audit Application
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Security Audit Trail Preview */}
          <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4 rounded-2xl">
            <CardHeader className="p-0 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-400" />
                <span>Security Audit Trail</span>
              </CardTitle>
              <Link href="/admin/audit-logs" className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1">
                <span>View Full Trail</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No security audit records logged yet.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-white">
                      <span className="text-emerald-400 uppercase tracking-wide">{log.action.replace(/_/g, " ")}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <p className="text-slate-300">
                      Target: <span className="text-white font-semibold">{log.targetType}</span> ({log.targetId})
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">Actor: {log.adminName}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

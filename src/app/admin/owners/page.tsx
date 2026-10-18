"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminService, AdminOwnerRecord } from "@/services/admin.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Building2, ShieldCheck, Check, X, MapPin, Phone } from "lucide-react";

export default function AdminOwnersPage() {
  const [owners, setOwners] = useState<AdminOwnerRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOwners = async () => {
    setLoading(true);
    try {
      const data = await adminService.getOwners();
      setOwners(data);
    } catch (err) {
      console.error("Failed to load owners directory", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwners();
  }, []);

  const handleVerify = async (id: string, name: string) => {
    if (!confirm(`Verify owner "${name}"?`)) return;
    const success = await adminService.verifyOwner(id);
    if (success) {
      await loadOwners();
    } else {
      alert("Failed to verify owner.");
    }
  };

  const handleReject = async (id: string, name: string) => {
    const reason = prompt(`Enter reason for declining "${name}":`);
    if (reason && reason.trim()) {
      const success = await adminService.rejectOwner(id, reason.trim());
      if (success) {
        await loadOwners();
      } else {
        alert("Failed to reject owner.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="warning" className="mb-2">Property Managers</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Building2 className="h-8 w-8 text-amber-400" />
              <span>Registered PG Hosts Directory</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Audit PG owner business profiles, verification decisions, and contact information across Jharkhand.
            </p>
          </div>

          <Link href="/admin/owner-verification">
            <Button size="sm" variant="default" className="text-xs gap-1.5 cursor-pointer">
              <ShieldCheck className="h-4 w-4" />
              <span>Review Pending KYC Queue</span>
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-xs">Loading hosts directory...</p>
          </div>
        ) : owners.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No registered PG hosts found in the database.
          </div>
        ) : (
          <div className="space-y-4">
            {owners.map((o) => (
              <Card key={o.id} className="border-slate-800 bg-slate-900/80 p-5 space-y-4 rounded-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-white">{o.businessName}</h3>
                      <Badge
                        variant={
                          o.verificationStatus === "verified"
                            ? "accent"
                            : o.verificationStatus === "pending"
                            ? "warning"
                            : "danger"
                        }
                        className="uppercase text-[9px] font-mono"
                      >
                        {o.verificationStatus}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Contact Person: <strong className="text-white">{o.name}</strong> • City: {o.primaryCity}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {o.verificationStatus !== "verified" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleVerify(o.id, o.businessName)}
                        className="gap-1 text-xs cursor-pointer font-bold"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Verify Host
                      </Button>
                    )}

                    {o.verificationStatus !== "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(o.id, o.businessName)}
                        className="gap-1 text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                        Decline
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Primary Phone</span>
                      <strong className="text-white font-mono">{o.phone}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Operating City</span>
                      <strong className="text-emerald-400">{o.primaryCity}</strong>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block">Registered On</span>
                    <strong className="text-slate-200 font-mono text-[11px]">
                      {new Date(o.createdAt).toLocaleDateString("en-IN")}
                    </strong>
                  </div>
                </div>

                {o.rejectionReason && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                    <strong>Rejection Reason:</strong> {o.rejectionReason}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

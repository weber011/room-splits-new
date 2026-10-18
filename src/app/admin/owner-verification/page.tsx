"use client";

import { useState, useEffect } from "react";
import { adminService, AdminOwnerRecord } from "@/services/admin.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ShieldCheck, XCircle, CheckCircle, Clock, MapPin, Phone, Building2, User } from "lucide-react";

export default function AdminOwnerVerificationPage() {
  const [owners, setOwners] = useState<AdminOwnerRecord[]>([]);
  const [filter, setFilter] = useState<"pending" | "all" | "verified" | "rejected">("pending");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadOwners = async (currentFilter: "pending" | "all" | "verified" | "rejected") => {
    setLoading(true);
    try {
      const data = await adminService.getOwners(currentFilter);
      setOwners(data);
    } catch (err) {
      console.error("Failed to fetch owner verification list", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwners(filter);
  }, [filter]);

  const handleApprove = async (id: string, businessName: string) => {
    if (!confirm(`Are you sure you want to verify "${businessName}" as an official partner host?`)) {
      return;
    }

    setProcessingId(id);
    try {
      const success = await adminService.verifyOwner(id);
      if (success) {
        alert(`Host "${businessName}" has been successfully verified!`);
        await loadOwners(filter);
      } else {
        alert("Failed to verify owner. Ensure you have administrator access and are not verifying yourself.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      alert("An unexpected error occurred during verification.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string, businessName: string) => {
    const reason = prompt(`Please specify the reason for declining "${businessName}" (required):`);
    if (!reason || !reason.trim()) {
      alert("A valid rejection reason is required.");
      return;
    }

    setProcessingId(id);
    try {
      const success = await adminService.rejectOwner(id, reason.trim());
      if (success) {
        alert(`Host application for "${businessName}" has been rejected.`);
        await loadOwners(filter);
      } else {
        alert("Failed to reject owner application.");
      }
    } catch (err) {
      console.error("Rejection error:", err);
      alert("An unexpected error occurred during rejection.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="warning" className="mb-2">Platform Verification</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="h-8 w-8 text-amber-400" />
              <span>Host Verification Review Queue</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Audit PG owner credentials, business details, and legitimacy before granting verified status.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {(["pending", "all", "verified", "rejected"] as const).map((tab) => (
            <Button
              key={tab}
              size="sm"
              variant={filter === tab ? "default" : "outline"}
              onClick={() => setFilter(tab)}
              className="capitalize text-xs cursor-pointer"
            >
              {tab === "pending" ? "Awaiting Review" : tab}
            </Button>
          ))}
        </div>

        {/* Owner Applications Grid */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-xs">Loading host applications...</p>
          </div>
        ) : owners.length === 0 ? (
          <Card className="p-12 text-center border-slate-800 bg-slate-900/80 rounded-2xl space-y-2">
            <ShieldCheck className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="font-bold text-white text-sm">No Applications Found</h3>
            <p className="text-xs text-slate-400">
              {filter === "pending"
                ? "No pending owner verification requests currently in the queue."
                : `No owner applications matching filter "${filter}".`}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {owners.map((owner) => (
              <Card
                key={owner.id}
                className="border-slate-800 bg-slate-900/80 p-5 space-y-4 flex flex-col justify-between rounded-2xl hover:border-slate-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      variant={
                        owner.verificationStatus === "verified"
                          ? "accent"
                          : owner.verificationStatus === "pending"
                          ? "warning"
                          : "danger"
                      }
                      className="text-[10px] uppercase font-mono"
                    >
                      {owner.verificationStatus}
                    </Badge>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(owner.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{owner.businessName}</span>
                    </h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Host: <strong className="text-white">{owner.name}</strong></span>
                    </p>
                  </div>

                  <div className="space-y-1 text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      <span>Primary Hub: <strong className="text-white">{owner.primaryCity}</strong></span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-500" />
                      <span>Phone: <span className="font-mono text-slate-200">{owner.phone}</span></span>
                    </p>
                    {owner.whatsapp && (
                      <p className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                        <span>WhatsApp: {owner.whatsapp}</span>
                      </p>
                    )}
                  </div>

                  {owner.rejectionReason && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                      <strong>Rejection Reason:</strong> {owner.rejectionReason}
                    </div>
                  )}

                  {owner.verifiedAt && (
                    <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Audited on {new Date(owner.verifiedAt).toLocaleDateString("en-IN")}</span>
                    </p>
                  )}
                </div>

                {owner.verificationStatus === "pending" && (
                  <div className="flex gap-2 pt-3 border-t border-slate-800">
                    <Button
                      size="sm"
                      variant="default"
                      disabled={processingId === owner.id}
                      onClick={() => handleApprove(owner.id, owner.businessName)}
                      className="flex-1 gap-1 text-xs font-bold cursor-pointer"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={processingId === owner.id}
                      onClick={() => handleReject(owner.id, owner.businessName)}
                      className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10 text-xs font-bold cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </Button>
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

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminService, AdminPropertyRecord } from "@/services/admin.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check, X, Eye, Building2 } from "lucide-react";

export default function AdminPropertyVerificationQueuePage() {
  const [unverifiedProps, setUnverifiedProps] = useState<AdminPropertyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUnverified = async () => {
    setLoading(true);
    try {
      const data = await adminService.getProperties();
      setUnverifiedProps(data.filter((p) => !p.isVerified));
    } catch (err) {
      console.error("Failed to load property verification queue", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnverified();
  }, []);

  const handleApprove = async (id: string, title: string) => {
    if (!confirm(`Grant official RoomSplits Verified badge to "${title}"?`)) return;
    const success = await adminService.moderateProperty(id, "verify");
    if (success) {
      alert("Property verified successfully!");
      await loadUnverified();
    } else {
      alert("Failed to verify property.");
    }
  };

  const handleArchive = async (id: string, title: string) => {
    const reason = prompt(`Specify reason to archive "${title}":`);
    if (reason && reason.trim()) {
      const success = await adminService.moderateProperty(id, "archive", reason.trim());
      if (success) {
        alert("Property archived.");
        await loadUnverified();
      } else {
        alert("Failed to archive property.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="warning" className="mb-2">Verification Queue</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Building2 className="h-8 w-8 text-amber-400" />
              <span>Unverified Property Audit Queue</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Review photos, host details, and address accuracy before granting official RoomSplits Verified Badges.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-400 text-xs">Loading queue...</p>
            </div>
          ) : unverifiedProps.length === 0 ? (
            <Card className="p-12 text-center border-slate-800 bg-slate-900/80 rounded-2xl text-slate-400 text-sm">
              All properties have been audited and verified!
            </Card>
          ) : (
            unverifiedProps.map((prop) => (
              <Card key={prop.id} className="border-slate-800 bg-slate-900/80 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-24 rounded-xl bg-slate-950 overflow-hidden border border-slate-800 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prop.coverImage || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"}
                      alt={prop.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-white">{prop.title}</h4>
                      <Badge variant="warning" className="uppercase text-[9px] font-mono">{prop.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Host: {prop.ownerBusinessName} • {prop.city} ({prop.category})
                    </p>
                    <p className="text-xs text-emerald-400 font-bold mt-1">Starting Rent: ₹{prop.startingPrice.toLocaleString("en-IN")}/mo</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/property/${prop.id}`}>
                    <Button size="sm" variant="outline" className="gap-1 text-xs cursor-pointer">
                      <Eye className="h-3.5 w-3.5" />
                      Inspect Listing
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleApprove(prop.id, prop.title)}
                    className="gap-1 text-xs cursor-pointer font-bold"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve Badge
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleArchive(prop.id, prop.title)}
                    className="gap-1 text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    Archive
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

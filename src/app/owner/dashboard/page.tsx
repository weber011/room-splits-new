import { Metadata } from "next";
import Link from "next/link";
import { propertyService } from "@/services/property.service";
import { OwnerDashboardClient } from "@/components/owner/OwnerDashboardClient";
import { requireOwner } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Home, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "PG Owner Dashboard | RoomSplits",
  description:
    "Manage your student accommodation listings, room capacities, and preview properties across Jharkhand.",
};

export const dynamic = "force-dynamic";

export default async function OwnerDashboardPage() {
  // Validate real server session & owner record before rendering protected owner dashboard
  // Redirects unauthenticated users to login, and un-onboarded users to /owner/onboarding
  const user = await requireOwner("/owner/onboarding");

  // Fetch real owner properties from Supabase using authenticated server client
  const supabase = await createClient();
  const ownerProperties = user.ownerId
    ? await propertyService.getOwnerProperties(user.ownerId, supabase)
    : [];

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1F2937] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 pb-24 selection:bg-[#3129C8] selection:text-white">
      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#64748B]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-bold text-[#3129C8] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Homepage</span>
        </Link>

        <nav
          className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-[#3129C8] flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-[#10164F] font-bold">PG Owner Dashboard</span>
        </nav>
      </div>

      {/* Owner Verification Status Banner (Server Enforced) */}
      {!user.isOwnerVerified && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              Account Status: Verification Pending ({user.ownerBusinessName || "PG Host"})
            </p>
            <p className="text-amber-800 text-xs leading-relaxed">
              Your PG Owner account is currently under review by RoomSplits administrators. You can create and draft properties in your workspace; verified badges and public visibility will be active once verification is approved.
            </p>
          </div>
        </div>
      )}

      {/* Main Owner Dashboard Client */}
      <OwnerDashboardClient
        initialProperties={ownerProperties}
        isOwnerVerified={user.isOwnerVerified}
        ownerBusinessName={user.ownerBusinessName}
      />
    </div>
  );
}

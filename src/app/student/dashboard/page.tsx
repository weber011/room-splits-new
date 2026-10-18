import { Metadata } from "next";
import Link from "next/link";
import { propertyService } from "@/services/property.service";
import { StudentDashboardClient } from "@/components/student/StudentDashboardClient";
import { requireAuthenticatedUser } from "@/lib/auth-helpers";
import { ArrowLeft, Home } from "lucide-react";

import { visitService } from "@/services/visit.service";

export const metadata: Metadata = {
  title: "Student Dashboard | RoomSplits",
  description:
    "Manage your saved PGs, recently viewed accommodations, and student preferences across Jharkhand.",
};

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  // Validate real server session before rendering protected data
  const user = await requireAuthenticatedUser("/student/dashboard");
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const [allProperties, recommendedProperties, savedResult, serverVisits] = await Promise.all([
    propertyService.getAllProperties(),
    propertyService.getRecommendedProperties(),
    supabase.from("saved_properties").select("property_id").eq("student_id", user.id),
    visitService.getStudentVisits(user.id, supabase),
  ]);

  const serverSavedIds = savedResult.data?.map((r) => r.property_id) || [];

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
          <span className="text-[#10164F] font-bold">Student Dashboard</span>
        </nav>
      </div>

      {/* Main Student Dashboard Client */}
      <StudentDashboardClient
        allProperties={allProperties}
        recommendedProperties={recommendedProperties}
        serverSavedIds={serverSavedIds}
        serverVisits={serverVisits}
      />
    </div>
  );
}

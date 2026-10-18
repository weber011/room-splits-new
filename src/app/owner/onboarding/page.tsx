import { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth-helpers";
import { OwnerOnboardingClient } from "./OwnerOnboardingClient";

export const metadata: Metadata = {
  title: "PG Owner Registration | RoomSplits",
  description: "Register your student PG, hostel, or room share accommodation in Jharkhand.",
};

export const dynamic = "force-dynamic";

export default async function OwnerOnboardingPage() {
  const user = await requireAuthenticatedUser("/login?redirectTo=/owner/onboarding");

  // If already registered as owner, go directly to owner dashboard
  if (user.ownerId) {
    redirect("/owner/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1F2937] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center selection:bg-[#3129C8] selection:text-white">
      <OwnerOnboardingClient user={user} />
    </div>
  );
}

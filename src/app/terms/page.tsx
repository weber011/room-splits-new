import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | RoomSplits",
  description: "Terms and conditions for using RoomSplits student accommodation discovery platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1F2937] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#3129C8] hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10164F]/5 text-[#10164F] text-xs font-bold">
          <Shield className="w-3.5 h-3.5 text-[#3129C8]" />
          <span>Platform Policy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#10164F] tracking-tight">Terms of Service</h1>
        <p className="text-xs sm:text-sm text-gray-500">Last updated: October 2026 &bull; Initial Phase</p>
      </div>

      <div className="bg-white rounded-3xl border border-[#10164F]/10 p-6 sm:p-8 space-y-6 shadow-sm text-sm text-gray-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-black text-[#10164F]">1. Platform Overview</h2>
          <p>
            RoomSplits is an online discovery platform connecting university students with verified PG and hostel accommodations initially across supported cities in Jharkhand (Ranchi, Dhanbad, Jamshedpur, Bokaro, and Hazaribagh).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-black text-[#10164F]">2. Property Unlocks &amp; Access Passes</h2>
          <p>
            The ₹9 property unlock provides students with direct landlord contact details, exact street address, and physical visit instructions. The ₹9 unlock fee is a service pass for property details and is strictly separate from room rent, security deposits, or advance booking payments.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-black text-[#10164F]">3. User Responsibilities</h2>
          <p>
            Students and property owners agree to provide truthful identity information. Property owners are solely responsible for physical safety standards, amenities, and room availability.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-black text-[#10164F]">4. Zero Brokerage Guarantee</h2>
          <p>
            RoomSplits does not charge students brokerage commissions. We aim for 100% transparent pricing for student tenants and direct relationships with PG hosts.
          </p>
        </section>
      </div>
    </div>
  );
}

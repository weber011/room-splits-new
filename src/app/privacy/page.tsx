import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | RoomSplits",
  description: "Privacy practices and data protection on RoomSplits.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1F2937] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#3129C8] hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10164F]/5 text-[#10164F] text-xs font-bold">
          <Lock className="w-3.5 h-3.5 text-[#3129C8]" />
          <span>Data Protection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#10164F] tracking-tight">Privacy Policy</h1>
        <p className="text-xs sm:text-sm text-gray-500">Last updated: October 2026</p>
      </div>

      <div className="bg-white rounded-3xl border border-[#10164F]/10 p-6 sm:p-8 space-y-6 shadow-sm text-sm text-gray-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-black text-[#10164F]">1. Information We Collect</h2>
          <p>
            When students register on RoomSplits, we collect basic contact information (full name, email address, mobile number, and college name) necessary to facilitate physical PG visits and prevent fraudulent inquiries.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-black text-[#10164F]">2. Protecting Landlord &amp; Property Privacy</h2>
          <p>
            Exact property addresses and host direct telephone numbers are kept private from unverified automated crawlers. They are disclosed to bona fide students only upon unlocking the listing or scheduling an in-person visit tour.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-black text-[#10164F]">3. Data Sharing &amp; Third Parties</h2>
          <p>
            We do not sell student or owner data to third-party advertisers. Information is solely used for accommodation discovery and visit coordination within Jharkhand.
          </p>
        </section>
      </div>
    </div>
  );
}

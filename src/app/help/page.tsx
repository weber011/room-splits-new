import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Help Centre & FAQ | RoomSplits",
  description: "Frequently Asked Questions about finding PGs, ₹9 property unlocks, and visit tours on RoomSplits.",
};

const FAQS = [
  {
    q: "How does RoomSplits work for students?",
    a: "RoomSplits lets you search verified PGs and hostels in Jharkhand by city, budget, and sharing preferences (single, double, triple). You can compare room configurations, amenities, and rent transparently with zero brokerage.",
  },
  {
    q: "What is the ₹9 Property Unlock?",
    a: "To protect landlord privacy and prevent automated spam, exact building street addresses and direct host contact numbers are unlocked for ₹9. This gives you a dedicated access pass to contact the owner and coordinate physical visits. It is not an advance room booking or deposit.",
  },
  {
    q: "Which cities are currently supported?",
    a: "Our initial focus is on major student and education hubs in Jharkhand: Ranchi, Dhanbad, Jamshedpur, Bokaro, and Hazaribagh.",
  },
  {
    q: "How can PG owners list their property?",
    a: "Owners can click 'List Your Property' in the navigation bar to register with their basic details. Full listing management and tenant visit coordination are handled directly through the Owner Dashboard.",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1F2937] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#3129C8] hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10164F]/5 text-[#10164F] text-xs font-bold">
          <HelpCircle className="w-3.5 h-3.5 text-[#3129C8]" />
          <span>Help &amp; Knowledge Base</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#10164F] tracking-tight">Frequently Asked Questions</h1>
        <p className="text-xs sm:text-sm text-gray-500">Everything you need to know about finding student accommodation on RoomSplits.</p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, idx) => (
          <div key={idx} className="bg-white rounded-3xl border border-[#10164F]/10 p-6 space-y-2 shadow-xs">
            <h3 className="font-extrabold text-[#10164F] text-base">{faq.q}</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

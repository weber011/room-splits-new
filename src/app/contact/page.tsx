import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MessageSquare, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | RoomSplits",
  description: "Get in touch with the RoomSplits student support team in Jharkhand.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1F2937] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#3129C8] hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10164F]/5 text-[#10164F] text-xs font-bold">
          <MessageSquare className="w-3.5 h-3.5 text-[#3129C8]" />
          <span>Support Desk</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#10164F] tracking-tight">Contact RoomSplits</h1>
        <p className="text-xs sm:text-sm text-gray-500">We are here to help university students and accommodation hosts across Jharkhand.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-[#10164F]/10 p-6 space-y-4 shadow-sm">
          <h3 className="font-extrabold text-[#10164F] text-base">Student Inquiries</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Need help finding a PG near your university campus in Ranchi, Dhanbad, or Jamshedpur? Have questions about physical visits or ₹9 access passes?
          </p>
          <div className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#10164F]/10 text-xs text-[#10164F] font-bold">
            Email: <span className="text-[#3129C8]">support@roomsplits.com</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#10164F]/10 p-6 space-y-4 shadow-sm">
          <h3 className="font-extrabold text-[#10164F] text-base">PG Owner &amp; Host Support</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Looking to list your property or have questions regarding tenant visit schedules? Reach out to our partner coordination desk.
          </p>
          <div className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#10164F]/10 text-xs text-[#10164F] font-bold">
            Email: <span className="text-[#3129C8]">partners@roomsplits.com</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#10164F]/10 p-6 flex items-center gap-3 shadow-xs">
        <MapPin className="w-5 h-5 text-[#3129C8] shrink-0" />
        <div className="text-xs text-gray-600">
          <strong className="text-[#10164F] block">Regional Operating Hub</strong>
          Serving Ranchi, Dhanbad, Jamshedpur, Bokaro, and Hazaribagh &bull; Jharkhand, India
        </div>
      </div>
    </div>
  );
}

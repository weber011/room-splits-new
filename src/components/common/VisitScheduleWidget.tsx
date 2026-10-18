"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Property } from "@/types";
import { Card } from "@/components/ui/card";
import { createVisitAction } from "@/app/actions/visit.actions";
import { VisitTimeSlot } from "@/types/visit.types";
import { CalendarCheck, Ticket, Loader2 } from "lucide-react";

export interface VisitScheduleWidgetProps {
  property: Property;
}

export function VisitScheduleWidget({ property }: VisitScheduleWidgetProps) {
  const router = useRouter();
  const todayStr = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(todayStr);
  const [timeSlot, setTimeSlot] = useState<VisitTimeSlot>("afternoon");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await createVisitAction({
        propertyId: property.id,
        preferredDate: date,
        preferredTimeSlot: timeSlot,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Failed to schedule visit.");
        return;
      }

      router.push("/visits");
    } catch {
      setErrorMsg("Failed to schedule visit. Please sign in as a student.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card id="schedule-visit" className="rounded-3xl border border-[#10164F]/10 bg-white p-6 space-y-5 shadow-sm sticky top-24 text-[#10164F]">
      <div className="flex items-center justify-between border-b border-[#10164F]/10 pb-4">
        <div>
          <h4 className="font-extrabold text-[#10164F] text-lg flex items-center gap-2">
            <Ticket className="h-5 w-5 text-[#3129C8]" />
            <span>Schedule Physical Visit</span>
          </h4>
          <p className="text-xs text-gray-500 mt-1">Verified visit pass includes direct host coordination &amp; room tour.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleScheduleVisit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs text-[#10164F] font-bold">Select Preferred Date</label>
          <input
            type="date"
            min={todayStr}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full h-11 rounded-xl bg-white border border-[#10164F]/15 px-3 text-sm text-[#10164F] outline-none focus:border-[#3129C8] focus:ring-1 focus:ring-[#3129C8]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-[#10164F] font-bold">Select Time Slot</label>
          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value as VisitTimeSlot)}
            className="w-full h-11 rounded-xl bg-white border border-[#10164F]/15 px-3 text-sm text-[#10164F] outline-none focus:border-[#3129C8] focus:ring-1 focus:ring-[#3129C8]"
          >
            <option value="morning">Morning (10:00 AM - 12:00 PM)</option>
            <option value="afternoon">Afternoon (02:00 PM - 04:00 PM)</option>
            <option value="evening">Evening (05:00 PM - 07:00 PM)</option>
          </select>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-900 font-bold block">In-Person Room Tour</span>
            <span className="text-[11px] text-emerald-700">100% Free • No Brokerage</span>
          </div>
          <strong className="text-sm font-black text-emerald-800 bg-white px-2.5 py-1 rounded-full uppercase border border-emerald-200">
            Free
          </strong>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-2xl bg-[#3129C8] hover:bg-[#251fa3] text-white font-extrabold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Scheduling...</span>
            </>
          ) : (
            <>
              <CalendarCheck className="h-4 w-4" />
              <span>Schedule Free Visit</span>
            </>
          )}
        </button>
      </form>
    </Card>
  );
}

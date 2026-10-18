"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createVisitAction } from "@/app/actions/visit.actions";
import { VisitTimeSlot } from "@/types/visit.types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Ticket, Calendar, Clock, Lock, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export interface VisitRequestSectionProps {
  propertyId: string;
  propertyTitle: string;
  isUnlocked?: boolean;
  isLoggedIn: boolean;
  onTriggerUnlock?: () => void;
}

export function VisitRequestSection({
  propertyId,
  isLoggedIn,
}: VisitRequestSectionProps) {
  const router = useRouter();

  // Get Today's date YYYY-MM-DD for min date picker restriction
  const todayStr = new Date().toISOString().split("T")[0];

  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<VisitTimeSlot>("afternoon");
  const [studentMessage, setStudentMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!preferredDate) {
      setErrorMessage("Please select a preferred visit date.");
      return;
    }

    if (preferredDate < todayStr) {
      setErrorMessage("Preferred date cannot be in the past.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createVisitAction({
        propertyId,
        preferredDate,
        preferredTimeSlot,
        notes: studentMessage.trim() || undefined,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Failed to schedule visit request.");
        return;
      }

      setSuccessMessage("Visit request sent successfully! Redirecting to visits dashboard...");
      setTimeout(() => {
        router.push("/visits");
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create visit request.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-3xl border border-[#10164F]/10 bg-white p-6 space-y-6 shadow-sm text-[#10164F]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#10164F]/10 pb-4">
        <div>
          <h3 className="text-xl font-extrabold text-[#10164F] flex items-center gap-2">
            <Ticket className="h-6 w-6 text-[#3129C8]" />
            <span>Request a Property Visit Tour</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Schedule an in-person physical room inspection with the property owner.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1 self-start sm:self-auto">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Free In-Person Visit
        </span>
      </div>

      {/* STATE 1: Logged Out User */}
      {!isLoggedIn && (
        <div className="p-6 rounded-2xl border border-[#10164F]/10 bg-[#FAFAF7] text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-white border border-[#10164F]/10 text-[#3129C8] flex items-center justify-center mx-auto shadow-xs">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-[#10164F] text-base">Student Sign In Required</h4>
            <p className="text-xs text-gray-600 max-w-sm mx-auto mt-1">
              Please log in as a student to schedule an in-person property walkthrough with the owner.
            </p>
          </div>
          <Link href={`/login?redirectTo=/property/${propertyId}`}>
            <button className="px-5 py-2.5 rounded-xl bg-[#3129C8] hover:bg-[#251fa3] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 mx-auto cursor-pointer">
              <span>Sign In to Schedule</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
      )}

      {/* STATE 2: Logged In Student - Direct Scheduling Form */}
      {isLoggedIn && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Preferred Date */}
            <div className="space-y-1.5">
              <label className="text-xs text-[#10164F] font-bold flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#3129C8]" />
                <span>Preferred Date *</span>
              </label>
              <Input
                type="date"
                min={todayStr}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                required
                className="text-xs border-[#10164F]/15 bg-white text-[#10164F] rounded-xl"
              />
            </div>

            {/* Preferred Time Slot */}
            <div className="space-y-1.5">
              <label className="text-xs text-[#10164F] font-bold flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#3129C8]" />
                <span>Preferred Time Slot *</span>
              </label>
              <select
                value={preferredTimeSlot}
                onChange={(e) => setPreferredTimeSlot(e.target.value as VisitTimeSlot)}
                className="w-full h-10 rounded-xl bg-white border border-[#10164F]/15 px-3 text-xs text-[#10164F] outline-none focus:border-[#3129C8] focus:ring-1 focus:ring-[#3129C8]"
              >
                <option value="morning">Morning (10:00 AM - 12:00 PM)</option>
                <option value="afternoon">Afternoon (02:00 PM - 04:00 PM)</option>
                <option value="evening">Evening (05:00 PM - 07:00 PM)</option>
              </select>
            </div>
          </div>

          {/* Student Message/Notes */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#10164F] font-bold block">
              Message for PG Host (Optional)
            </label>
            <textarea
              value={studentMessage}
              onChange={(e) => setStudentMessage(e.target.value)}
              placeholder="e.g. Inquiring about single occupancy with food, will arrive by 3 PM."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-[#10164F]/15 bg-white text-[#10164F] outline-none focus:border-[#3129C8] focus:ring-1 focus:ring-[#3129C8]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || Boolean(successMessage)}
            className="w-full py-3.5 rounded-2xl bg-[#3129C8] hover:bg-[#251fa3] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting Visit Request...</span>
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                <span>Confirm &amp; Send Visit Request</span>
              </>
            )}
          </button>
        </form>
      )}
    </Card>
  );
}

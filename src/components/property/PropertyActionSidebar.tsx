"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Property } from "@/types";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { Card } from "@/components/ui/card";
import { createVisitAction } from "@/app/actions/visit.actions";
import { VisitTimeSlot } from "@/types/visit.types";
import {
  CalendarCheck,
  Phone,
  User,
  X,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Loader2,
  Lock,
} from "lucide-react";

export function PropertyActionSidebar({ property }: { property: Property }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"visit" | "contact">("visit");

  // Form State
  const todayStr = new Date().toISOString().split("T")[0];
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<VisitTimeSlot>("afternoon");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  const openModal = (mode: "visit" | "contact") => {
    setModalMode(mode);
    setFormError(null);
    setFormSuccess(null);
    setNeedsLogin(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setNeedsLogin(false);

    if (!preferredDate) {
      setFormError("Please select a preferred visit date.");
      return;
    }

    if (preferredDate < todayStr) {
      setFormError("Preferred visit date cannot be in the past.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createVisitAction({
        propertyId: property.id,
        roomId: selectedRoomId || undefined,
        preferredDate,
        preferredTimeSlot,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        if (res.error?.toLowerCase().includes("sign in") || res.error?.toLowerCase().includes("log in")) {
          setNeedsLogin(true);
        }
        setFormError(res.error || "Failed to schedule visit request.");
        return;
      }

      setFormSuccess("Visit request scheduled successfully! Redirecting to your visits dashboard...");
      setTimeout(() => {
        router.push("/visits");
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Sticky Action Card */}
        <Card className="rounded-3xl border border-slate-200/90 bg-white p-6 space-y-5 shadow-sm sticky top-24 text-[#10164F]">
          {/* Price Header */}
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B] block mb-1">
              Starting From
            </span>
            <div className="flex items-baseline justify-between">
              <PriceDisplay amount={property.startingPrice} size="lg" />
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Zero Brokerage
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1 font-medium">
              Verified Monthly Rent &bull; Direct Host Coordination
            </span>
          </div>

          {/* Quick Perks */}
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>In-person physical room inspections</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Free scheduling — No booking fee</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Meet the owner before paying deposit</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => openModal("visit")}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#3129C8] hover:bg-[#251fa3] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              aria-label="Schedule a visit for this property"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Schedule a Visit</span>
            </button>

            <button
              type="button"
              onClick={() => openModal("contact")}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-[#10164F] font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              aria-label="Contact host for this property"
            >
              <Phone className="w-4 h-4 text-[#3129C8]" />
              <span>Contact Host</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Schedule an inspection with the PG owner to inspect rooms, verify amenities, and confirm house rules.
          </p>
        </Card>

        {/* Host Info Card */}
        <Card className="rounded-3xl border border-slate-200/90 bg-white p-6 space-y-4 shadow-sm text-[#10164F]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#3129C8] font-bold shadow-2xs">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-[#10164F] text-sm sm:text-base">
                {property.ownerContact?.ownerName || "PG Host Partner"}
              </h4>
              <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5 border border-emerald-100">
                Verified Local Host
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Location</span>
              <span className="font-bold text-[#10164F]">
                {property.location.locality}, {property.location.city}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Notice Period</span>
              <span className="font-bold text-[#10164F]">{property.noticePeriodDays || 30} Days</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
            Exact street address and host phone number are revealed upon host confirmation of your visit request.
          </p>
        </Card>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {modalMode === "visit" ? (
              <>
                {/* Visit Request Modal Content */}
                <div className="space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#3129C8] mb-2">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-[#10164F]">
                    Schedule an In-Person Visit
                  </h3>
                  <p className="text-xs text-slate-500">
                    Property: <strong className="text-[#10164F]">{property.title}</strong> &bull; {property.location.locality}, {property.location.city}
                  </p>
                </div>

                {formError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p>{formError}</p>
                      {needsLogin && (
                        <Link
                          href={`/login?redirectTo=/property/${property.id}`}
                          className="inline-block font-extrabold text-[#3129C8] underline mt-1"
                        >
                          Click here to Log In
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {formSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleScheduleSubmit} className="space-y-4 pt-1">
                  {/* Preferred Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#10164F] block">
                      Preferred Date <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        min={todayStr}
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        required
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-[#10164F] focus:border-[#3129C8] focus:ring-1 focus:ring-[#3129C8] outline-none"
                      />
                    </div>
                  </div>

                  {/* Time Slot */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#10164F] block">
                      Preferred Time Slot <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={preferredTimeSlot}
                      onChange={(e) => setPreferredTimeSlot(e.target.value as VisitTimeSlot)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-[#10164F] focus:border-[#3129C8] focus:ring-1 focus:ring-[#3129C8] outline-none bg-white"
                    >
                      <option value="morning">Morning (10:00 AM - 12:00 PM)</option>
                      <option value="afternoon">Afternoon (02:00 PM - 04:00 PM)</option>
                      <option value="evening">Evening (05:00 PM - 07:00 PM)</option>
                    </select>
                  </div>

                  {/* Optional Room Selection */}
                  {property.roomOptions && property.roomOptions.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#10164F] block">
                        Interested Room Sharing (Optional)
                      </label>
                      <select
                        value={selectedRoomId}
                        onChange={(e) => setSelectedRoomId(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-[#10164F] focus:border-[#3129C8] focus:ring-1 focus:ring-[#3129C8] outline-none bg-white"
                      >
                        <option value="">Any available room option</option>
                        {property.roomOptions.map((rm) => (
                          <option key={rm.id} value={rm.id}>
                            {rm.sharingType.toUpperCase()} Sharing — ₹{rm.monthlyRent.toLocaleString("en-IN")}/mo
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Student Note */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#10164F] block">
                      Note or Questions for Host (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g., Looking for a double sharing room starting next month. Please confirm if parking is available."
                      rows={3}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-[#10164F] focus:border-[#3129C8] focus:ring-1 focus:ring-[#3129C8] outline-none resize-none"
                    />
                  </div>

                  {/* Free Visit Banner */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-[#10164F] block">In-Person Visit Fee</span>
                      <span className="text-[11px] text-slate-500">Free physical walkthrough</span>
                    </div>
                    <span className="text-sm font-black text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Free
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || Boolean(formSuccess)}
                    className="w-full py-3.5 rounded-2xl bg-[#3129C8] hover:bg-[#251fa3] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        <span>Confirm Visit Request</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* Contact Host Modal Content */}
                <div className="space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#3129C8] mb-2">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-[#10164F]">
                    Contact Host Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    Host: <strong className="text-[#10164F]">{property.ownerContact?.ownerName || "PG Partner Host"}</strong>
                  </p>
                </div>

                <div className="space-y-3 text-left text-xs text-slate-600 leading-relaxed bg-[#FAFAF7] p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Host Privacy Protection:</strong> Direct phone numbers and exact street addresses are unlocked once an in-person room visit appointment is confirmed by the host.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-[#3129C8] shrink-0 mt-0.5" />
                    <span>
                      <strong>How to Connect:</strong> Click &ldquo;Schedule a Visit&rdquo; to select your preferred date and time. Once the host accepts your visit, you will receive full contact directions in your dashboard!
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => openModal("visit")}
                    className="w-full py-3.5 rounded-2xl bg-[#3129C8] hover:bg-[#251fa3] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Schedule Free Visit Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Property } from "@/types";
import { PropertyCard } from "@/components/common/PropertyCard";
import { Card } from "@/components/ui/card";
import {
  StudentSidebar,
  StudentDashboardTab,
} from "./StudentSidebar";
import {
  getSavedPropertyIds,
  getRecentlyViewedIds,
  clearRecentlyViewed,
  getStudentProfile,
  saveStudentProfile,
  resetStudentProfile,
  subscribeToStorage,
  StudentProfile,
} from "@/lib/student-storage";
import {
  Heart,
  Clock,
  CalendarCheck,
  Search,
  Compass,
  Building2,
  BookmarkX,
  Info,
  CheckCircle2,
  Trash2,
  MapPin,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Save,
  User,
  AlertCircle,
} from "lucide-react";
import { DbVisit, TIME_SLOT_LABELS } from "@/types/visit.types";
import { studentCancelVisitAction } from "@/app/actions/visit.actions";

export interface StudentDashboardClientProps {
  allProperties: Property[];
  recommendedProperties: Property[];
  serverSavedIds?: string[];
  serverVisits?: DbVisit[];
}

export function StudentDashboardClient({
  allProperties,
  recommendedProperties,
  serverSavedIds,
  serverVisits = [],
}: StudentDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<StudentDashboardTab>("overview");
  const [mounted, setMounted] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>(serverSavedIds || []);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [visits, setVisits] = useState<DbVisit[]>(serverVisits);
  const [cancellingVisitId, setCancellingVisitId] = useState<string | null>(null);
  const [visitActionMsg, setVisitActionMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [profile, setProfile] = useState<StudentProfile>({
    fullName: "",
    college: "",
    preferredCity: "Ranchi",
    monthlyBudget: "₹5,000–₹8,000",
    preferredSharing: "Double Sharing",
  });
  const [profileForm, setProfileForm] = useState<StudentProfile>({
    fullName: "",
    college: "",
    preferredCity: "Ranchi",
    monthlyBudget: "₹5,000–₹8,000",
    preferredSharing: "Double Sharing",
  });
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);

  // Hydrate from localStorage once on client mount to prevent SSR mismatch
  useEffect(() => {
    setMounted(true);
    const loadedSaved = getSavedPropertyIds();
    const loadedRecent = getRecentlyViewedIds();
    const loadedProfile = getStudentProfile();

    // Use server-verified saved property IDs if available; otherwise merge with local
    const mergedSaved = serverSavedIds && serverSavedIds.length > 0 ? serverSavedIds : loadedSaved;
    setSavedIds(mergedSaved);
    setRecentIds(loadedRecent);
    setProfile(loadedProfile);
    setProfileForm(loadedProfile);

    // Subscribe to cross-tab or cross-component storage changes
    const unsubscribe = subscribeToStorage(() => {
      setSavedIds(getSavedPropertyIds());
      setRecentIds(getRecentlyViewedIds());
      const p = getStudentProfile();
      setProfile(p);
    });

    return unsubscribe;
  }, [serverSavedIds]);

  // Filter actual property objects safely
  const savedProperties = mounted
    ? (savedIds
        .map((id) => allProperties.find((p) => p.id === id))
        .filter((p): p is Property => Boolean(p)))
    : [];

  const recentProperties = mounted
    ? (recentIds
        .map((id) => allProperties.find((p) => p.id === id))
        .filter((p): p is Property => Boolean(p)))
    : [];

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveStudentProfile(profileForm);
    setProfile(updated);
    setShowProfileSuccess(true);
    setTimeout(() => setShowProfileSuccess(false), 3000);
  };

  const handleProfileReset = () => {
    resetStudentProfile();
    const reset = getStudentProfile();
    setProfile(reset);
    setProfileForm(reset);
    setShowProfileSuccess(false);
  };

  const handleClearHistory = () => {
    clearRecentlyViewed();
    setRecentIds([]);
  };

  const handleCancelVisit = async (visitId: string) => {
    if (!confirm("Are you sure you want to cancel this visit request?")) return;
    setCancellingVisitId(visitId);
    setVisitActionMsg(null);
    try {
      const res = await studentCancelVisitAction(visitId, "Cancelled from student dashboard");
      if (res.success) {
        setVisits((prev) =>
          prev.map((v) => (v.id === visitId ? { ...v, status: "cancelled" } : v))
        );
        setVisitActionMsg({ text: "Visit request cancelled successfully." });
        setTimeout(() => setVisitActionMsg(null), 3000);
      } else {
        setVisitActionMsg({ text: res.error || "Failed to cancel visit.", error: true });
      }
    } catch {
      setVisitActionMsg({ text: "Failed to cancel visit.", error: true });
    } finally {
      setCancellingVisitId(null);
    }
  };

  // Welcome title fallback
  const displayName = profile.fullName.trim()
    ? profile.fullName.trim()
    : "Student Explorer";

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Responsive Left Navigation */}
      <StudentSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        savedCount={savedProperties.length}
        recentCount={recentProperties.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full space-y-8">
        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ======================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* Top Welcome Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-white to-indigo-50/30 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#FFF45C] text-[#10164F] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                      Demo Student Space
                    </span>
                    <span className="bg-indigo-50 text-[#3129C8] text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      Jharkhand MVP
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#10164F] tracking-tight">
                    Welcome back, {displayName} 👋
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xl font-medium">
                    Manage your shortlisted PGs, review recently viewed properties,
                    and personalize your local search preferences across Ranchi, Dhanbad,
                    Jamshedpur, Bokaro, and Hazaribagh.
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <Link
                    href="/discover"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#3129C8] hover:bg-[#251fa3] text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Explore PGs</span>
                  </Link>
                </div>
              </div>

              {/* Informational banner about Demo state */}
              <div className="flex items-start gap-2.5 bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3 text-[11px] text-amber-900 font-medium">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Frontend Demo Mode:</strong> Shortlists and preferences
                  are stored safely in your browser&apos;s local storage. No real
                  account, payments, or owner communications are triggered.
                </p>
              </div>
            </div>

            {/* Overview Stat Cards (TASK 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Stat 1: Saved Properties */}
              <button
                type="button"
                onClick={() => setActiveTab("saved")}
                className="text-left bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:border-[#3129C8]/40 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-[#3129C8] transition-colors">
                    Saved PGs
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                  </div>
                </div>
                <div className="text-3xl font-black text-[#10164F] tracking-tight">
                  {mounted ? savedProperties.length : 0}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  {savedProperties.length === 1
                    ? "1 property shortlisted"
                    : `${savedProperties.length} properties shortlisted`}
                </p>
              </button>

              {/* Stat 2: Recently Viewed */}
              <button
                type="button"
                onClick={() => setActiveTab("recent")}
                className="text-left bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:border-[#3129C8]/40 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-[#3129C8] transition-colors">
                    Recently Viewed
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#3129C8] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-[#10164F] tracking-tight">
                  {mounted ? recentProperties.length : 0}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  {recentProperties.length === 1
                    ? "1 property browsed"
                    : `${recentProperties.length} properties browsed`}
                </p>
              </button>

              {/* Stat 3: Visit Requests */}
              <button
                type="button"
                onClick={() => setActiveTab("visits")}
                className="text-left bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:border-[#3129C8]/40 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-[#3129C8] transition-colors">
                    Visit Requests
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-[#10164F] tracking-tight">
                  {mounted ? visits.length : 0}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  {visits.length === 1 ? "1 tour scheduled" : `${visits.length} tours scheduled`}
                </p>
              </button>
            </div>

            {/* Quick City Filters */}
            <Card className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-[#10164F]">
                    Explore Jharkhand Student Hubs
                  </h2>
                  <p className="text-xs text-slate-500">
                    Find student hostels and PGs nearest to your college
                  </p>
                </div>
                <Link
                  href="/discover"
                  className="text-xs font-bold text-[#3129C8] hover:underline flex items-center gap-1"
                >
                  <span>All Cities</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {["Ranchi", "Dhanbad", "Jamshedpur", "Bokaro", "Hazaribagh"].map(
                  (city) => (
                    <Link
                      key={city}
                      href={`/discover?city=${encodeURIComponent(city)}`}
                      className="px-3.5 py-2 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 text-[#10164F] hover:text-[#3129C8] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#3129C8]" />
                      <span>{city}</span>
                    </Link>
                  )
                )}
              </div>
            </Card>

            {/* Recommended Properties (TASK 7) */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-[#3129C8] mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Curated Recommendations</span>
                  </div>
                  <h2 className="text-xl font-black text-[#10164F]">
                    Top Student Accommodations
                  </h2>
                  <p className="text-xs text-slate-500">
                    Handpicked verified student stays with honest transparent amenities.
                  </p>
                </div>

                <Link
                  href="/discover"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-[#10164F] hover:bg-slate-50 text-xs font-extrabold shadow-2xs transition-all shrink-0 cursor-pointer"
                >
                  <span>View All 5 Listings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {recommendedProperties.slice(0, 3).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: SAVED PROPERTIES (TASK 3) */}
        {/* ======================================================== */}
        {activeTab === "saved" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
              <div>
                <h1 className="text-2xl font-black text-[#10164F] tracking-tight flex items-center gap-2">
                  <span>Saved Properties</span>
                  <span className="text-xs font-black bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full">
                    {mounted ? savedProperties.length : 0}
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Your shortlisted student stays. Click the heart icon on any card
                  to remove it from your shortlist.
                </p>
              </div>

              {savedProperties.length > 0 && (
                <Link
                  href="/discover"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-[#3129C8] text-xs font-bold transition-all shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Discover More PGs</span>
                </Link>
              )}
            </div>

            {/* Saved Grid or Empty State */}
            {!mounted || savedProperties.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-2xs">
                  <BookmarkX className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-[#10164F]">
                    No Saved Properties Yet
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                    When you find a PG or hostel you like on the discovery page or
                    property details view, click the heart icon to save it here for
                    easy comparison.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/discover"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#3129C8] hover:bg-[#251fa3] text-white text-xs font-black shadow-sm transition-all"
                  >
                    <Search className="w-4 h-4" />
                    <span>Explore Available PGs</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {savedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onSaveToggle={(id, isSaved) => {
                      if (!isSaved) {
                        setSavedIds((prev) => prev.filter((item) => item !== id));
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: RECENTLY VIEWED (TASK 4) */}
        {/* ======================================================== */}
        {activeTab === "recent" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
              <div>
                <h1 className="text-2xl font-black text-[#10164F] tracking-tight flex items-center gap-2">
                  <span>Recently Viewed</span>
                  <span className="text-xs font-black bg-indigo-100 text-[#3129C8] px-2.5 py-0.5 rounded-full">
                    {mounted ? recentProperties.length : 0}
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Properties you have opened during your search, ordered from most
                  recent. Max history: 10 items.
                </p>
              </div>

              {recentProperties.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {/* Recent Grid or Empty State */}
            {!mounted || recentProperties.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-[#3129C8] flex items-center justify-center mx-auto shadow-2xs">
                  <Compass className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-[#10164F]">
                    No Browsing History Yet
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                    As you click on and explore student accommodations in Ranchi,
                    Dhanbad, Jamshedpur, Bokaro, or Hazaribagh, they will automatically
                    be tracked here for quick re-visiting.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/discover"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#3129C8] hover:bg-[#251fa3] text-white text-xs font-black shadow-sm transition-all"
                  >
                    <Search className="w-4 h-4" />
                    <span>Start Discovering</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {recentProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: VISIT REQUESTS (TASK 5) */}
        {/* ======================================================== */}
        {activeTab === "visits" && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-200/80 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-[#10164F] tracking-tight flex items-center gap-2">
                  <span>Visit Requests</span>
                  <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    {mounted ? visits.length : 0} Total
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Track in-person room tour appointments and host confirmations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/visits"
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-[#10164F] transition-all"
                >
                  Manage All Passes
                </Link>
                <Link
                  href="/discover"
                  className="px-4 py-2 rounded-xl bg-[#3129C8] hover:bg-[#251fa3] text-xs font-bold text-white transition-all"
                >
                  Schedule New Tour
                </Link>
              </div>
            </div>

            {visitActionMsg && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                  visitActionMsg.error
                    ? "bg-rose-50 border border-rose-200 text-rose-800"
                    : "bg-emerald-50 border border-emerald-200 text-emerald-800"
                }`}
              >
                {visitActionMsg.error ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>{visitActionMsg.text}</span>
              </div>
            )}

            {visits.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center space-y-5 max-w-lg mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
                  <CalendarCheck className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black text-[#10164F]">
                    No Scheduled Visits
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                    You have not requested any in-person PG visits yet. Explore student accommodations across Jharkhand and schedule a free physical inspection before paying rent.
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href="/discover"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#3129C8] hover:bg-[#251fa3] text-white text-xs font-black shadow-sm transition-all"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Browse Available PGs</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {visits.map((v) => {
                  const timeLabel = TIME_SLOT_LABELS[v.preferredTimeSlot] || v.preferredTimeSlot;
                  const canCancel = v.status === "pending" || v.status === "confirmed";

                  return (
                    <Card
                      key={v.id}
                      className="rounded-3xl border border-slate-200/90 bg-white p-5 space-y-4 shadow-xs hover:border-[#3129C8]/30 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link
                              href={`/property/${v.propertyId}`}
                              className="font-black text-sm text-[#10164F] hover:text-[#3129C8] transition-colors line-clamp-1"
                            >
                              {v.property?.title || "PG Accommodation"}
                            </Link>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-[#3129C8]" />
                              <span>
                                {v.property?.locality || "Jharkhand"}, {v.property?.city || "Ranchi"}
                              </span>
                            </p>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 border ${
                              v.status === "confirmed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : v.status === "pending"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : v.status === "completed"
                                ? "bg-slate-100 text-slate-700 border-slate-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {v.status === "confirmed"
                              ? "Confirmed"
                              : v.status === "pending"
                              ? "Awaiting Host"
                              : v.status === "completed"
                              ? "Completed"
                              : v.status}
                          </span>
                        </div>

                        {/* Visit Date & Time Details */}
                        <div className="grid grid-cols-2 gap-2 bg-[#FAFAF7] p-3 rounded-2xl border border-slate-100 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Visit Date
                            </span>
                            <span className="font-extrabold text-[#10164F]">
                              {v.preferredDate}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Time Slot
                            </span>
                            <span className="font-extrabold text-[#10164F] truncate block">
                              {timeLabel}
                            </span>
                          </div>
                        </div>

                        {/* Host Notes if present */}
                        {v.hostNotes && (
                          <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-[#10164F] space-y-1">
                            <span className="text-[10px] font-extrabold text-[#3129C8] uppercase tracking-wider block">
                              Host Message / Directions:
                            </span>
                            <p className="text-slate-600 leading-relaxed font-medium">
                              {v.hostNotes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <Link
                          href={`/property/${v.propertyId}`}
                          className="text-xs font-bold text-[#3129C8] hover:underline"
                        >
                          View Property
                        </Link>

                        {canCancel && (
                          <button
                            type="button"
                            disabled={cancellingVisitId === v.id}
                            onClick={() => handleCancelVisit(v.id)}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 transition-all cursor-pointer disabled:opacity-50"
                          >
                            {cancellingVisitId === v.id ? "Cancelling..." : "Cancel Visit"}
                          </button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: STUDENT PROFILE (TASK 6) */}
        {/* ======================================================== */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-200/80 pb-5">
              <h1 className="text-2xl font-black text-[#10164F] tracking-tight flex items-center gap-2">
                <span>Student Demo Profile</span>
                <span className="text-xs font-black bg-indigo-100 text-[#3129C8] px-2.5 py-0.5 rounded-full">
                  Local Preferences
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Customize your search criteria and personal display preferences.
              </p>
            </div>

            {/* Disclaimer Alert */}
            <div className="flex items-start gap-3 bg-indigo-50/60 border border-indigo-100 rounded-3xl p-4 sm:p-5 text-xs text-[#10164F]">
              <Info className="w-5 h-5 text-[#3129C8] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-extrabold text-[#3129C8]">
                  Client-Side Demonstration Mode
                </p>
                <p className="text-slate-600 leading-relaxed">
                  These profile preferences are saved solely to your local browser
                  storage for demonstration purposes. They do not constitute an
                  authenticated identity or create server-side database records.
                </p>
              </div>
            </div>

            {/* Success Feedback Alert */}
            {showProfileSuccess && (
              <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs font-bold animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Demo profile preferences updated successfully in local storage!</span>
              </div>
            )}

            {/* Profile Form Card */}
            <Card className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label
                      htmlFor="fullName"
                      className="text-xs font-extrabold text-[#10164F] block"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="fullName"
                        type="text"
                        value={profileForm.fullName}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            fullName: e.target.value,
                          })
                        }
                        placeholder="e.g. Aryan Raj"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-[#10164F] focus:outline-none focus:ring-2 focus:ring-[#3129C8]/20 focus:border-[#3129C8] font-medium"
                      />
                    </div>
                  </div>

                  {/* College / Institution */}
                  <div className="space-y-2">
                    <label
                      htmlFor="college"
                      className="text-xs font-extrabold text-[#10164F] block"
                    >
                      College / Institution
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="college"
                        type="text"
                        value={profileForm.college}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            college: e.target.value,
                          })
                        }
                        placeholder="e.g. BIT Mesra / IIT ISM Dhanbad"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-[#10164F] focus:outline-none focus:ring-2 focus:ring-[#3129C8]/20 focus:border-[#3129C8] font-medium"
                      />
                    </div>
                  </div>

                  {/* Preferred City */}
                  <div className="space-y-2">
                    <label
                      htmlFor="preferredCity"
                      className="text-xs font-extrabold text-[#10164F] block"
                    >
                      Preferred City
                    </label>
                    <select
                      id="preferredCity"
                      value={profileForm.preferredCity}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          preferredCity: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-[#10164F] focus:outline-none focus:ring-2 focus:ring-[#3129C8]/20 focus:border-[#3129C8] font-medium bg-white"
                    >
                      <option value="Ranchi">Ranchi</option>
                      <option value="Dhanbad">Dhanbad</option>
                      <option value="Jamshedpur">Jamshedpur</option>
                      <option value="Bokaro">Bokaro</option>
                      <option value="Hazaribagh">Hazaribagh</option>
                    </select>
                  </div>

                  {/* Monthly Budget */}
                  <div className="space-y-2">
                    <label
                      htmlFor="monthlyBudget"
                      className="text-xs font-extrabold text-[#10164F] block"
                    >
                      Monthly Budget Preference
                    </label>
                    <select
                      id="monthlyBudget"
                      value={profileForm.monthlyBudget}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          monthlyBudget: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-[#10164F] focus:outline-none focus:ring-2 focus:ring-[#3129C8]/20 focus:border-[#3129C8] font-medium bg-white"
                    >
                      <option value="Under ₹5,000">Under ₹5,000</option>
                      <option value="₹5,000–₹8,000">₹5,000–₹8,000</option>
                      <option value="₹8,000–₹12,000">₹8,000–₹12,000</option>
                      <option value="₹12,000+">₹12,000+</option>
                    </select>
                  </div>

                  {/* Room Sharing Type */}
                  <div className="space-y-2 sm:col-span-2">
                    <label
                      htmlFor="preferredSharing"
                      className="text-xs font-extrabold text-[#10164F] block"
                    >
                      Preferred Room Sharing Type
                    </label>
                    <select
                      id="preferredSharing"
                      value={profileForm.preferredSharing}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          preferredSharing: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-[#10164F] focus:outline-none focus:ring-2 focus:ring-[#3129C8]/20 focus:border-[#3129C8] font-medium bg-white"
                    >
                      <option value="Any">Any Sharing Option</option>
                      <option value="Single Room">Single Room (Private)</option>
                      <option value="Double Sharing">Double Sharing</option>
                      <option value="Triple Sharing">Triple Sharing</option>
                    </select>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleProfileReset}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>

                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-2xl bg-[#3129C8] hover:bg-[#251fa3] text-white text-xs font-black shadow-sm transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Demo Preferences</span>
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

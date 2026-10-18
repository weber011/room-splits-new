"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Mail, Phone, CalendarCheck, Heart, Ticket, GraduationCap, MapPin, CheckCircle2, ArrowRight, LogOut, ShieldCheck, Clock, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { signOutAction } from "@/app/actions/auth.actions";

export interface StudentDashboardClientProps {
  user: {
    id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    role?: string;
  } | null;
}

export function StudentDashboardClient({ user }: StudentDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"visits" | "saved" | "passes" | "profile">("visits");

  // Mock visits data for preview
  const upcomingVisits = [
    {
      id: "v-1",
      propertyTitle: "Greenview Boys PG & Hostel",
      locality: "Lalpur",
      city: "Ranchi",
      preferredDate: "Tomorrow, Oct 15",
      preferredTime: "Evening (05:00 PM - 07:00 PM)",
      status: "Confirmed",
      hostName: "Rajesh Verma",
      hostPhone: "+91 98351 22440",
      passCode: "RS-9921",
      propertyId: "prop-1",
    },
    {
      id: "v-2",
      propertyTitle: "Harmony Girls Luxury Co-Living",
      locality: "Circular Road",
      city: "Ranchi",
      preferredDate: "Saturday, Oct 18",
      preferredTime: "Afternoon (02:00 PM - 04:00 PM)",
      status: "Pending Host Confirmation",
      hostName: "Sunita Roy",
      hostPhone: "+91 94311 88765",
      passCode: "RS-8412",
      propertyId: "prop-2",
    },
  ];

  // Mock saved properties
  const savedProperties = [
    {
      id: "prop-1",
      title: "Greenview Boys PG & Hostel",
      locality: "Lalpur",
      city: "Ranchi",
      price: 6500,
      gender: "Boys",
      coverImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "prop-3",
      title: "TechPark Student Residency",
      locality: "Bistupur",
      city: "Jamshedpur",
      price: 7200,
      gender: "Co-Ed",
      coverImage: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    },
  ];

  // Mock unlocked passes
  const unlockedPasses = [
    {
      id: "unlock-1",
      propertyTitle: "Greenview Boys PG & Hostel",
      address: "Lane 4, Peace Road, Lalpur",
      city: "Ranchi",
      ownerName: "Rajesh Verma",
      ownerPhone: "+91 98351 22440",
      ownerWhatsapp: "+91 98351 22440",
      unlockedAt: "Oct 12, 2026",
      tokenFeePaid: 9,
      propertyId: "prop-1",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Profile Banner */}
      <Card className="rounded-3xl border border-[#10164F]/10 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#FFF45C] text-[#10164F] flex items-center justify-center font-black text-2xl sm:text-3xl border border-[#10164F]/10 shadow-xs">
              {user?.fullName?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-[#10164F] tracking-tight">
                  {user?.fullName || "Aarav Sharma"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#A7F3D0] text-[#10164F] font-bold text-xs inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                  Verified Student
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                <span>{user?.email || "aarav.sharma@student.bitmesra.ac.in"}</span>
                <span>&bull;</span>
                <span>{user?.phone || "+91 98765 43210"}</span>
              </p>
            </div>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>

        {/* 3 Overview Stat Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-[#10164F]/10">
          <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#10164F]/10 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-white text-[#3129C8] border border-[#10164F]/10">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">Scheduled Visits</span>
              <strong className="text-xl font-black text-[#10164F]">{upcomingVisits.length} Active</strong>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#10164F]/10 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-white text-[#3129C8] border border-[#10164F]/10">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">Saved Stays</span>
              <strong className="text-xl font-black text-[#10164F]">{savedProperties.length} Properties</strong>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#10164F]/10 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-white text-[#3129C8] border border-[#10164F]/10">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">₹9 Access Passes</span>
              <strong className="text-xl font-black text-[#10164F]">{unlockedPasses.length} Unlocked</strong>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#10164F]/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("visits")}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "visits"
              ? "bg-[#10164F] text-white shadow-xs"
              : "text-gray-600 hover:text-[#10164F] hover:bg-gray-100"
          }`}
        >
          <CalendarCheck className="h-4 w-4" />
          <span>My Physical Visits</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#FFF45C] text-[#10164F] text-[10px] font-black">
            {upcomingVisits.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("saved")}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "saved"
              ? "bg-[#10164F] text-white shadow-xs"
              : "text-gray-600 hover:text-[#10164F] hover:bg-gray-100"
          }`}
        >
          <Heart className="h-4 w-4" />
          <span>Saved Stays</span>
          <span className="px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-700 text-[10px] font-black">
            {savedProperties.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("passes")}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "passes"
              ? "bg-[#10164F] text-white shadow-xs"
              : "text-gray-600 hover:text-[#10164F] hover:bg-gray-100"
          }`}
        >
          <Ticket className="h-4 w-4" />
          <span>₹9 Access Passes</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#A7F3D0] text-[#10164F] text-[10px] font-black">
            {unlockedPasses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "profile"
              ? "bg-[#10164F] text-white shadow-xs"
              : "text-gray-600 hover:text-[#10164F] hover:bg-gray-100"
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>College &amp; Profile</span>
        </button>
      </div>

      {/* Tab 1: Scheduled Visits */}
      {activeTab === "visits" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-[#10164F]">Upcoming In-Person Inspection Visits</h3>
            <Link href="/discover" className="text-xs font-bold text-[#3129C8] hover:underline flex items-center gap-1">
              <span>Book More Visits</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingVisits.map((v) => (
              <Card key={v.id} className="rounded-3xl border border-[#10164F]/10 bg-white p-5 space-y-4 shadow-sm text-[#10164F]">
                <div className="flex items-start justify-between gap-3 border-b border-[#10164F]/10 pb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFF45C] text-[#10164F] font-bold text-[10px] uppercase">
                      Pass #{v.passCode}
                    </span>
                    <h4 className="font-extrabold text-[#10164F] text-base mt-1">{v.propertyTitle}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-[#3129C8]" />
                      <span>{v.locality}, {v.city}</span>
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                      v.status.includes("Confirmed")
                        ? "bg-[#A7F3D0] text-[#10164F]"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {v.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                      <CalendarCheck className="h-3.5 w-3.5 text-[#3129C8]" />
                      <span>Scheduled Date:</span>
                    </span>
                    <strong className="text-[#10164F]">{v.preferredDate}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                      <Clock className="h-3.5 w-3.5 text-[#3129C8]" />
                      <span>Time Slot:</span>
                    </span>
                    <strong className="text-[#10164F]">{v.preferredTime}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                      <User className="h-3.5 w-3.5 text-[#3129C8]" />
                      <span>Host Manager:</span>
                    </span>
                    <strong className="text-[#10164F]">{v.hostName} ({v.hostPhone})</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#10164F]/10 flex items-center justify-between">
                  <Link href={`/property/${v.propertyId}`}>
                    <button className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#10164F] font-bold text-xs cursor-pointer">
                      View PG Details
                    </button>
                  </Link>
                  <a
                    href={`https://wa.me/${v.hostPhone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-[#3129C8] hover:bg-[#251fa3] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Message Host</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Saved Stays */}
      {activeTab === "saved" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-[#10164F]">Your Shortlisted PGs &amp; Hostels</h3>
            <Link href="/discover" className="text-xs font-bold text-[#3129C8] hover:underline flex items-center gap-1">
              <span>Find More PGs</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedProperties.map((p) => (
              <Card key={p.id} className="rounded-3xl border border-[#10164F]/10 bg-white p-5 space-y-3 shadow-sm text-[#10164F]">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#10164F]/5 text-[#10164F] font-bold text-[10px] uppercase">
                    {p.gender} PG
                  </span>
                  <span className="text-xs font-black text-[#10164F]">
                    ₹{p.price.toLocaleString("en-IN")}<span className="text-gray-500 font-normal">/mo</span>
                  </span>
                </div>
                <h4 className="font-extrabold text-[#10164F] text-base">{p.title}</h4>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#3129C8]" />
                  <span>{p.locality}, {p.city}</span>
                </p>
                <div className="pt-2 border-t border-[#10164F]/10 flex items-center justify-between">
                  <Link href={`/property/${p.id}`} className="w-full">
                    <button className="w-full py-2 rounded-xl bg-[#3129C8] hover:bg-[#251fa3] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
                      <span>Explore PG Listing</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: ₹9 Access Passes */}
      {activeTab === "passes" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#FFF45C]/20 border border-[#FFF45C] text-[#10164F] text-xs">
            <strong>About ₹9 Access Passes:</strong> Your property unlock pass grants access to the verified street address, owner phone numbers, and physical visit coordination. It does not constitute advance rent or room reservation.
          </div>

          <div className="grid grid-cols-1 gap-4">
            {unlockedPasses.map((pass) => (
              <Card key={pass.id} className="rounded-3xl border border-[#A7F3D0] bg-white p-6 space-y-4 shadow-sm text-[#10164F]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#10164F]/10 pb-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#A7F3D0] text-[#10164F] font-bold text-xs">
                      ✓ ₹9 Pass Active
                    </span>
                    <h4 className="text-lg font-black text-[#10164F] mt-1">{pass.propertyTitle}</h4>
                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-[#3129C8]" />
                      <span>{pass.address}, {pass.city}</span>
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-gray-500 block">Unlocked On</span>
                    <strong className="text-xs text-[#10164F]">{pass.unlockedAt}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#FAFAF7] border border-[#10164F]/10">
                    <span className="text-gray-500 block">Host Name</span>
                    <strong className="text-[#10164F] text-sm">{pass.ownerName}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAFAF7] border border-[#10164F]/10">
                    <span className="text-gray-500 block">Direct Phone</span>
                    <strong className="text-[#10164F] text-sm">{pass.ownerPhone}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAFAF7] border border-[#10164F]/10 flex items-center justify-between">
                    <div>
                      <span className="text-gray-500 block">WhatsApp</span>
                      <strong className="text-[#10164F] text-sm">Active</strong>
                    </div>
                    <a
                      href={`https://wa.me/${pass.ownerWhatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-lg bg-[#10164F] text-white font-bold text-xs hover:bg-[#151B65]"
                    >
                      Chat
                    </a>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-[#10164F]/10">
                  <Link href={`/property/${pass.propertyId}`}>
                    <button className="px-4 py-2 rounded-xl bg-[#3129C8] text-white hover:bg-[#251fa3] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs">
                      <span>Open Property Page</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Profile & College */}
      {activeTab === "profile" && (
        <Card className="rounded-3xl border border-[#10164F]/10 bg-white p-6 sm:p-8 space-y-6 shadow-sm text-[#10164F]">
          <div>
            <h3 className="text-xl font-black text-[#10164F]">Student Profile &amp; College Information</h3>
            <p className="text-xs text-gray-500 mt-1">
              Keep your student details up to date for fast-track PG visits and tenant verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#10164F]/10 space-y-1">
              <span className="flex items-center gap-1.5 text-gray-500 font-semibold">
                <User className="h-3.5 w-3.5 text-[#3129C8]" />
                Full Name
              </span>
              <p className="text-sm font-bold text-[#10164F]">{user?.fullName || "Aarav Sharma"}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#10164F]/10 space-y-1">
              <span className="flex items-center gap-1.5 text-gray-500 font-semibold">
                <Mail className="h-3.5 w-3.5 text-[#3129C8]" />
                Email Address
              </span>
              <p className="text-sm font-bold text-[#10164F]">{user?.email || "aarav.sharma@student.bitmesra.ac.in"}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#10164F]/10 space-y-1">
              <span className="flex items-center gap-1.5 text-gray-500 font-semibold">
                <Phone className="h-3.5 w-3.5 text-[#3129C8]" />
                Phone Number
              </span>
              <p className="text-sm font-bold text-[#10164F]">{user?.phone || "+91 98765 43210"}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#10164F]/10 space-y-1">
              <span className="flex items-center gap-1.5 text-gray-500 font-semibold">
                <GraduationCap className="h-3.5 w-3.5 text-[#3129C8]" />
                College / University
              </span>
              <p className="text-sm font-bold text-[#10164F]">Birla Institute of Technology (BIT Mesra), Ranchi</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#A7F3D0]/20 border border-[#A7F3D0] flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
            <div className="text-xs">
              <strong className="text-[#10164F] block">Student Identity Verification Complete</strong>
              <span className="text-gray-600">Your profile is approved for ₹9 property visit passes across Ranchi, Jamshedpur, and Dhanbad.</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

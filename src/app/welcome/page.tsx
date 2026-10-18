"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Logo,
  BrandButton,
  GeometricDecorations,
  SmartphoneMockup,
} from "@/components/brand";
import {
  ArrowRight,
  Sparkles,
  Building2,
  ShieldCheck,
  Compass,
} from "lucide-react";

export default function WelcomePage() {
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Check if user has already visited welcome screen in this session
    const visited = sessionStorage.getItem("roomsplits_welcome_seen");
    if (visited) {
      setHasAnimated(true);
    } else {
      sessionStorage.setItem("roomsplits_welcome_seen", "true");
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-[#FAFAF7] text-[#1F2937] overflow-x-hidden flex flex-col justify-between selection:bg-[#3129C8] selection:text-white">
      {/* Decorative Geometric Shapes (Yellow & Mint Accents) */}
      <GeometricDecorations variant="welcome" />

      {/* Top Navigation Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex items-center justify-between">
        <div
          className={
            hasAnimated
              ? "opacity-100"
              : "opacity-0 animate-scale-in [animation-delay:150ms] [animation-fill-mode:forwards]"
          }
        >
          <Logo size="md" href="/welcome" showTagline />
        </div>

        {/* Top Right Quick Actions */}
        <div
          className={`flex items-center gap-3 sm:gap-4 ${
            hasAnimated
              ? "opacity-100"
              : "opacity-0 animate-fade-in [animation-delay:350ms] [animation-fill-mode:forwards]"
          }`}
        >
          {/* Skip Action: Leading directly to public property discovery without bypassing auth */}
          <Link
            href="/discover"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#10164F] transition-colors px-3 py-2 rounded-xl hover:bg-slate-100/70"
            title="Browse available student stays without signing up"
          >
            <Compass className="w-3.5 h-3.5 text-[#3129C8]" />
            <span>Explore Stays</span>
          </Link>

          <Link href="/login">
            <BrandButton variant="secondary" size="sm">
              Sign In
            </BrandButton>
          </Link>
        </div>
      </header>

      {/* Main Hero Section: Balanced Two-Column Desktop / Stacked Mobile */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center w-full">
          
          {/* Left Column: Headline, Narrative & Benefits */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6 sm:space-y-8 text-left">
            
            {/* Pill Badge */}
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm ${
                hasAnimated
                  ? "opacity-100"
                  : "opacity-0 animate-slide-up [animation-delay:200ms] [animation-fill-mode:forwards]"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#3129C8] animate-pulse" />
              <span className="text-xs font-bold text-[#10164F] tracking-wide">
                Jharkhand&apos;s #1 Student Stay Platform
              </span>
              <span className="bg-[#FFF45C] text-[#10164F] text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">
                NEW
              </span>
            </div>

            {/* Headline */}
            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#10164F] tracking-tight leading-[1.12] ${
                hasAnimated
                  ? "opacity-100"
                  : "opacity-0 animate-slide-up [animation-delay:350ms] [animation-fill-mode:forwards]"
              }`}
            >
              Your Next Home <br className="hidden sm:inline" />
              <span className="relative inline-block">
                Starts Here.
                {/* Yellow accent underline squiggle */}
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-[#FFF45C] -z-10"
                  viewBox="0 0 100 12"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path
                    d="M0,7 Q25,0 50,7 T100,7"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Description */}
            <p
              className={`text-base sm:text-lg text-[#64748B] max-w-xl leading-relaxed ${
                hasAnimated
                  ? "opacity-100"
                  : "opacity-0 animate-fade-in [animation-delay:500ms] [animation-fill-mode:forwards]"
              }`}
            >
              Find comfortable PGs and hostels that fit your budget, lifestyle,
              and college life. Zero brokerage, verified listings, and direct visits.
            </p>

            {/* Three Key Benefits */}
            <div
              className={`grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 w-full pt-2 ${
                hasAnimated
                  ? "opacity-100"
                  : "opacity-0 animate-slide-up [animation-delay:650ms] [animation-fill-mode:forwards]"
              }`}
            >
              {/* Benefit 1 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/80 shadow-[0_4px_16px_rgba(16,22,79,0.04)] hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-[#3129C8] mb-2.5">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-[#10164F] mb-1">
                  1. Wide Range of Options
                </h3>
                <p className="text-[11px] text-[#64748B] leading-normal">
                  Hundreds of student PGs and hostels across Ranchi, Jamshedpur & Dhanbad.
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/80 shadow-[0_4px_16px_rgba(16,22,79,0.04)] hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 mb-2.5">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-xs font-bold text-[#10164F] mb-1">
                  2. Student-Friendly Stays
                </h3>
                <p className="text-[11px] text-[#64748B] leading-normal">
                  Furnished spaces with high-speed Wi-Fi, hygienic meals, and quiet study desks.
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/80 shadow-[0_4px_16px_rgba(16,22,79,0.04)] hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 mb-2.5">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-xs font-bold text-[#10164F] mb-1">
                  3. Transparent Pricing
                </h3>
                <p className="text-[11px] text-[#64748B] leading-normal">
                  Zero hidden brokerage, clear deposit rules, and ₹9 direct contact unlock.
                </p>
              </div>
            </div>

            {/* Call To Actions */}
            <div
              className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-3 ${
                hasAnimated
                  ? "opacity-100"
                  : "opacity-0 animate-slide-up [animation-delay:850ms] [animation-fill-mode:forwards]"
              }`}
            >
              {/* Primary Button */}
              <Link href="/signup" className="w-full sm:w-auto">
                <BrandButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                >
                  Get Started →
                </BrandButton>
              </Link>

              {/* Secondary Link */}
              <Link
                href="/login"
                className="inline-flex items-center justify-center h-12 px-5 text-sm font-semibold text-[#10164F] hover:text-[#3129C8] transition-colors rounded-2xl hover:bg-white/60"
              >
                Already have an account? Sign In
              </Link>
            </div>

            {/* Mobile Skip Action */}
            <div className="sm:hidden w-full text-center pt-1">
              <Link
                href="/discover"
                className="text-xs font-semibold text-[#64748B] hover:text-[#10164F] inline-flex items-center gap-1"
              >
                Skip for now • Browse public stays →
              </Link>
            </div>
          </div>

          {/* Right Column: Smartphone Mockup with Bedroom Photography */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <div
              className={`w-full flex justify-center ${
                hasAnimated
                  ? "opacity-100"
                  : "opacity-0 animate-slide-right [animation-delay:600ms] [animation-fill-mode:forwards]"
              }`}
            >
              <SmartphoneMockup />
            </div>

            {/* Floating Student Testimonial Badge */}
            <div
              className={`absolute -bottom-4 sm:bottom-6 -left-2 sm:-left-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-xl max-w-[210px] hidden sm:block ${
                hasAnimated
                  ? "opacity-100"
                  : "opacity-0 animate-scale-in [animation-delay:1000ms] [animation-fill-mode:forwards]"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-amber-500 text-xs font-bold">
                <span>★★★★★</span>
                <span className="text-[10px] text-slate-400 font-normal">Verified</span>
              </div>
              <p className="text-[11px] font-bold text-[#10164F] leading-snug">
                &ldquo;Moved near BIT Mesra in 2 days without brokers!&rdquo;
              </p>
              <span className="text-[10px] text-[#64748B] font-medium">
                — Rahul S., CSE Student
              </span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Minimal Notice */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-center text-xs text-[#64748B] border-t border-slate-200/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} RoomSplits Technologies. All rights reserved.</span>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link href="/discover" className="hover:text-[#10164F] transition-colors">
              Discover Stays
            </Link>
            <Link href="/login" className="hover:text-[#10164F] transition-colors">
              Owner Portal
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-500">Jharkhand Region</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

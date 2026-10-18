"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { propertyService } from "@/services/property.service";
import { Property } from "@/types";
import { PropertyCard } from "@/components/common/PropertyCard";
import { BrandButton } from "@/components/brand";
import { SmartphoneMockup } from "@/components/brand/SmartphoneMockup";
import {
  Search,
  MapPin,
  Users,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  CalendarCheck,
  KeyRound,
  GraduationCap,
  Eye,
  BadgeCheck,
  Wallet,
  Bed,
} from "lucide-react";

// 5 Supported Jharkhand Cities with verified details
const POPULAR_CITIES = [
  {
    name: "Ranchi",
    tagline: "Capital & Education Hub — Lalpur, Morabadi, Kanke Road",
    badge: "Capital Hub",
    stayCount: "150+ Stays",
    image:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Dhanbad",
    tagline: "IIT ISM Region & Student Stays — Hirapur, Saraidhela",
    badge: "IIT ISM Hub",
    stayCount: "80+ Stays",
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Jamshedpur",
    tagline: "Steel City & College Hub — Bistupur, Sakchi, Kadma",
    badge: "Steel City",
    stayCount: "95+ Stays",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Bokaro",
    tagline: "Coaching Centres & Study Zones — Sector 4, Chas",
    badge: "Coaching Hub",
    stayCount: "60+ Stays",
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Hazaribagh",
    tagline: "University Campus Area — Matwari, Korrah, VBU",
    badge: "VBU Area",
    stayCount: "45+ Stays",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
  },
];

// Why Choose RoomSplits Benefits
const BENEFIT_ITEMS = [
  {
    icon: Search,
    title: "Easy Discovery",
    description:
      "Search student rooms by university, locality, budget, and sharing preferences with clear photos and instant details.",
    accentColor: "bg-indigo-50 text-[#3129C8] border-indigo-100",
  },
  {
    icon: ShieldCheck,
    title: "Transparent Pricing",
    description:
      "Know the rent, deposit, and meal inclusions before you visit. Zero broker commission and no hidden moving fees.",
    accentColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    icon: Sparkles,
    title: "Student-Friendly Search",
    description:
      "Filter by high-speed Wi-Fi, study desks, food options, attached bathrooms, and campus proximity in seconds.",
    accentColor: "bg-amber-50 text-amber-700 border-amber-100",
  },
  {
    icon: CalendarCheck,
    title: "Convenient Visits",
    description:
      "Connect directly with verified properties and schedule in-person visits on your terms before making a deposit.",
    accentColor: "bg-[#A7F3D0]/30 text-teal-800 border-[#A7F3D0]",
  },
];

// 4-Step How It Works Journey
const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Discover Your PG",
    description:
      "Search by city, college, or budget to find student accommodations that fit your needs and lifestyle.",
    icon: Search,
  },
  {
    step: "02",
    title: "Compare Options",
    description:
      "View genuine photos, room types, amenities, and upfront transparent pricing all in one place.",
    icon: Eye,
  },
  {
    step: "03",
    title: "Unlock Property Details",
    description:
      "Access direct owner contacts and exact address for just ₹9 per property when you are ready to connect.",
    highlightBadge: "₹9 Access Pass",
    subtext: "One-time pass for direct owner contact • Not a rent payment",
    icon: KeyRound,
  },
  {
    step: "04",
    title: "Arrange a Visit",
    description:
      "Schedule an in-person visit, inspect the room and amenities, and finalize your stay directly with the owner.",
    icon: CalendarCheck,
  },
];

export default function CompleteHomePage() {
  const router = useRouter();

  // Search Bar State
  const [selectedCity, setSelectedCity] = useState("Ranchi");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedSharing, setSelectedSharing] = useState("");

  // Sample Properties State
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      try {
        const data = await propertyService.getFeaturedProperties();
        setProperties(data.slice(0, 4));
      } catch (err) {
        console.warn("Unable to load featured properties:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCity) params.set("city", selectedCity);
    if (selectedBudget) params.set("budget", selectedBudget);
    if (selectedSharing) params.set("sharing", selectedSharing);
    router.push(`/discover?${params.toString()}`);
  };

  return (
    <div className="relative min-h-screen bg-[#FAFAF7] text-[#1F2937] overflow-x-hidden selection:bg-[#3129C8] selection:text-white">
      {/* =====================================================================
          1. HERO SECTION (Refined Visual Balance & Contained Composition)
          ===================================================================== */}
      <section className="relative z-10 pt-8 sm:pt-14 pb-14 sm:pb-20 overflow-hidden">
        {/* Contained Subtle Decorative Background Shapes */}
        <div
          aria-hidden="true"
          className="absolute -top-24 right-1/4 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#FFF45C]/25 blur-3xl pointer-events-none -z-10"
        />
        <div
          aria-hidden="true"
          className="absolute top-1/3 -left-20 w-72 sm:w-80 h-72 sm:h-80 rounded-full bg-[#A7F3D0]/25 blur-3xl pointer-events-none -z-10"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-6">
              {/* Category Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#3129C8] animate-pulse" />
                <span className="text-xs font-extrabold text-[#10164F] tracking-wide">
                  Jharkhand Student Accommodation
                </span>
                <span className="bg-[#FFF45C] text-[#10164F] text-[10px] font-black px-2 py-0.5 rounded-md">
                  ZERO BROKERAGE
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-[#10164F] tracking-tight leading-[1.12]">
                Your Next Home Is{" "}
                <span className="relative inline-block text-[#3129C8]">
                  Closer Than You Think.
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
              <p className="text-sm sm:text-base lg:text-lg text-[#64748B] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Find comfortable PGs and hostels that fit your budget,
                lifestyle, and college life.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1">
                <Link href="/discover" className="w-full sm:w-auto">
                  <BrandButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                  >
                    Explore PGs →
                  </BrandButton>
                </Link>

                <Link href="/signup?role=owner" className="w-full sm:w-auto">
                  <BrandButton variant="outline" size="lg" fullWidth>
                    List Your Property
                  </BrandButton>
                </Link>
              </div>

              {/* Student Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-[#64748B]">
                <div className="flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-[#3129C8]" />
                  <span>5 Supported Cities</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-[#3129C8]" />
                  <span>Transparent Pricing</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-[#3129C8]" />
                  <span>Direct Physical Visits</span>
                </div>
              </div>
            </div>

            {/* Right Column: Balanced Hero Visual Showcase (Sunlit Bedroom + Smartphone) */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full max-w-[460px] sm:max-w-[480px]">
                {/* Clean Sunlit Student Bedroom Photo Frame */}
                <div className="relative w-full h-[320px] sm:h-[400px] rounded-[32px] overflow-hidden shadow-xl border-4 border-white bg-slate-100 group">
                  <Image
                    src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80"
                    alt="Clean, sunlit student bedroom with study desk and balcony"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 480px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#10164F]/60 via-transparent to-transparent" />

                  {/* Bedroom Photo Overlay Pill */}
                  <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-xs rounded-full px-3 py-1 shadow-xs border border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-[#10164F]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Accommodation</span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="bg-[#FFF45C] text-[#10164F] text-[10px] font-black px-2.5 py-0.5 rounded-full inline-block mb-1">
                      Sunlit Student Living
                    </span>
                    <p className="text-xs font-medium text-slate-100">
                      Comfortable, furnished spaces designed for academic focus.
                    </p>
                  </div>
                </div>

                {/* Smartphone Mockup Layered Elegantly (Contained within safe margins) */}
                <div className="absolute -bottom-6 -left-3 sm:-left-6 w-[180px] sm:w-[210px] drop-shadow-2xl z-20">
                  <SmartphoneMockup />
                </div>

                {/* Bottom Right Feature Chip (Stable, No Layout Shift) */}
                <div className="absolute -bottom-3 right-2 sm:right-4 z-20 bg-white/95 backdrop-blur-xs rounded-2xl px-3.5 py-2.5 shadow-lg border border-slate-100 flex items-center gap-2.5 max-w-[200px]">
                  <div className="w-7 h-7 rounded-lg bg-[#A7F3D0]/60 flex items-center justify-center text-teal-900 shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-[11px] font-black text-[#10164F] leading-tight">
                      Compare Options
                    </h4>
                    <p className="text-[9px] text-[#64748B]">Single, Double & Triple</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================================
              2. SEARCH INTERFACE (High Visibility & Mobile-Friendly Controls)
              ===================================================================== */}
          <div className="mt-12 sm:mt-16 max-w-5xl mx-auto bg-white rounded-3xl p-4 sm:p-6 shadow-[0_16px_45px_rgba(16,22,79,0.08)] border border-slate-200/90">
            <div className="mb-3.5 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-black uppercase tracking-wider text-[#3129C8]">
                Find Your Student Stay
              </span>
              <span className="text-[11px] font-semibold text-[#64748B]">
                Supported Cities in Jharkhand: Ranchi, Dhanbad, Jamshedpur, Bokaro & Hazaribagh
              </span>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center"
            >
              {/* City Selector */}
              <div className="lg:col-span-4 text-left p-3 rounded-2xl bg-slate-50 border border-slate-200/80 focus-within:border-[#3129C8] transition-colors">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] block mb-1">
                  City
                </label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#3129C8] shrink-0" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#10164F] outline-none cursor-pointer"
                    aria-label="Select City in Jharkhand"
                  >
                    <option value="Ranchi">Ranchi</option>
                    <option value="Dhanbad">Dhanbad</option>
                    <option value="Jamshedpur">Jamshedpur</option>
                    <option value="Bokaro">Bokaro</option>
                    <option value="Hazaribagh">Hazaribagh</option>
                  </select>
                </div>
              </div>

              {/* Monthly Budget Selector */}
              <div className="lg:col-span-3 text-left p-3 rounded-2xl bg-slate-50 border border-slate-200/80 focus-within:border-[#3129C8] transition-colors">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] block mb-1">
                  Monthly Budget
                </label>
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#3129C8] shrink-0" />
                  <select
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#10164F] outline-none cursor-pointer"
                    aria-label="Select Monthly Budget"
                  >
                    <option value="">Any Budget</option>
                    <option value="under-5000">Under ₹5,000</option>
                    <option value="5000-8000">₹5,000 – ₹8,000</option>
                    <option value="8000-12000">₹8,000 – ₹12,000</option>
                    <option value="above-12000">₹12,000+</option>
                  </select>
                </div>
              </div>

              {/* Room Sharing Selector */}
              <div className="lg:col-span-3 text-left p-3 rounded-2xl bg-slate-50 border border-slate-200/80 focus-within:border-[#3129C8] transition-colors">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] block mb-1">
                  Room Sharing
                </label>
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-[#3129C8] shrink-0" />
                  <select
                    value={selectedSharing}
                    onChange={(e) => setSelectedSharing(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#10164F] outline-none cursor-pointer"
                    aria-label="Select Room Sharing Type"
                  >
                    <option value="">Any</option>
                    <option value="single">Single Room</option>
                    <option value="double">Double Sharing</option>
                    <option value="triple">Triple Sharing</option>
                  </select>
                </div>
              </div>

              {/* Find a PG Submit Button */}
              <div className="sm:col-span-2 lg:col-span-2">
                <BrandButton
                  type="submit"
                  variant="primary"
                  size="default"
                  fullWidth
                  className="h-12 text-sm font-extrabold"
                  rightIcon={<Search className="w-4 h-4 ml-1" />}
                >
                  Find a PG
                </BrandButton>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. POPULAR LOCATIONS SECTION
          ===================================================================== */}
      <section className="py-16 sm:py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#3129C8] bg-indigo-50 px-2.5 py-1 rounded-md">
                Popular Locations
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#10164F] tracking-tight mt-2">
                Find Your Stay in Popular Cities
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                Explore student accommodations across supported cities in Jharkhand.
              </p>
            </div>

            <Link
              href="/discover"
              className="text-xs font-bold text-[#3129C8] hover:underline inline-flex items-center gap-1.5 shrink-0"
            >
              <span>View all supported areas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {POPULAR_CITIES.map((city) => (
              <div
                key={city.name}
                onClick={() => router.push(`/discover?city=${encodeURIComponent(city.name)}`)}
                className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
              >
                {/* City Photo */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={city.image}
                    alt={`${city.name} student accommodations and universities`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#10164F]/60 via-transparent to-transparent" />

                  {/* Badge */}
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#10164F] text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                    {city.badge}
                  </span>

                  {/* Stays Count */}
                  <span className="absolute bottom-3 left-3 text-white text-xs font-extrabold drop-shadow-sm">
                    {city.stayCount}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-lg font-black text-[#10164F] group-hover:text-[#3129C8] transition-colors">
                      {city.name}
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                      {city.tagline}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center text-xs font-extrabold text-[#3129C8] group-hover:translate-x-1 transition-transform">
                    <span>Explore Stays</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. FEATURED LISTINGS SECTION
          ===================================================================== */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-[#A7F3D0] px-2.5 py-1 rounded-md">
              Featured Stays
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#10164F] tracking-tight mt-2">
              Places You&apos;ll Love to Call Home
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Browse popular student accommodations with verified amenities and transparent pricing.
            </p>
          </div>

          <Link href="/discover" className="shrink-0">
            <BrandButton
              variant="secondary"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
            >
              Explore All PGs →
            </BrandButton>
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm font-semibold text-[#64748B]">
            Loading student accommodations...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}

        {/* Section Footer Link */}
        <div className="mt-12 text-center">
          <Link href="/discover">
            <BrandButton
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4 ml-1.5" />}
            >
              Explore All PGs →
            </BrandButton>
          </Link>
        </div>
      </section>

      {/* =====================================================================
          5. WHY CHOOSE ROOMSPLITS? (Student Benefits)
          ===================================================================== */}
      <section className="py-16 sm:py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-[#3129C8] bg-indigo-50 px-2.5 py-1 rounded-md">
              Why RoomSplits
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#10164F] tracking-tight mt-2">
              Finding a PG Should Feel Simple.
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-2">
              We take the stress and guesswork out of student housing with transparent information and zero broker commissions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFIT_ITEMS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="bg-[#FAFAF7] rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 text-left space-y-4"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${benefit.accentColor}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-[#10164F]">
                    {benefit.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed font-normal">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. HOW IT WORKS SECTION
          ===================================================================== */}
      <section id="how-it-works" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-black uppercase tracking-wider text-[#3129C8] bg-indigo-50 px-2.5 py-1 rounded-md">
            Step-by-Step
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#10164F] tracking-tight mt-2">
            How RoomSplits Works
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-2">
            A simple 4-step journey from search to move-in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {HOW_IT_WORKS_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="relative bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs text-left flex flex-col justify-between space-y-4 hover:border-[#3129C8]/40 transition-colors"
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-9 h-9 rounded-xl bg-[#3129C8] text-white font-black text-sm flex items-center justify-center shadow-xs">
                      {step.step}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#3129C8]">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-black text-[#10164F] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Step 3 ₹9 Pass Highlight Callout */}
                {step.highlightBadge && (
                  <div className="mt-2 pt-3 border-t border-slate-100 bg-amber-50/70 -mx-6 -mb-6 p-4 rounded-b-3xl">
                    <span className="bg-[#FFF45C] text-[#10164F] text-[10px] font-black px-2 py-0.5 rounded-md inline-block mb-1">
                      {step.highlightBadge}
                    </span>
                    <p className="text-[11px] font-semibold text-slate-700 leading-tight">
                      {step.subtext}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          7. SECTION FOR PG OWNERS
          ===================================================================== */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#10164F] rounded-[36px] p-8 sm:p-12 lg:p-14 text-white relative overflow-hidden shadow-2xl">
          {/* Contained Decorative Accents */}
          <div
            aria-hidden="true"
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#FFF45C]/20 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#3129C8]/40 blur-3xl pointer-events-none"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4 text-left">
              <span className="inline-block bg-[#FFF45C] text-[#10164F] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                For PG & Hostel Owners
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                Have a PG? Find the Right Students.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                List your property on RoomSplits and connect directly with verified students looking for accommodation in Jharkhand.
              </p>

              {/* 3 Owner Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1">
                  <h4 className="text-xs font-extrabold text-[#FFF45C]">
                    1. Direct Student Reach
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Showcase your PG to university students actively searching in your city.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1">
                  <h4 className="text-xs font-extrabold text-[#A7F3D0]">
                    2. Zero Listing Hassle
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Simple listing process with photos, room types, and house rules.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1">
                  <h4 className="text-xs font-extrabold text-[#FFF45C]">
                    3. Genuine Inquiries
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Connect with serious students ready to visit and book rooms.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col items-start lg:items-end justify-center">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 w-full max-w-sm space-y-4 text-left">
                <h3 className="text-base font-black text-white">
                  Start Listing in 5 Minutes
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Join Jharkhand&apos;s growing student PG network. No upfront registration fee.
                </p>
                <Link href="/signup?role=owner" className="block w-full">
                  <BrandButton
                    variant="yellow"
                    size="lg"
                    fullWidth
                    rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                  >
                    List Your Property →
                  </BrandButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          8. ABOUT US SECTION
          ===================================================================== */}
      <section id="about-us" className="py-16 sm:py-24 bg-white border-y border-slate-200/80 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-[#3129C8] bg-indigo-50 px-2.5 py-1 rounded-md">
              About RoomSplits
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#10164F] tracking-tight">
              Built for Students, by People Who Understand the Struggle.
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Moving to a new city for higher education should be exciting, not stressful. In cities like Ranchi, Dhanbad, and Jamshedpur, students often waste days navigating pushy brokers, inaccurate photos, and hidden charges. RoomSplits brings complete transparency, direct owner connections, and genuine student accommodation options under one trusted roof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#FAFAF7] border border-slate-200/90 space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[#3129C8]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-[#10164F]">
                Student-First Approach
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Designed around academic schedules, student budgets, meal needs, and campus proximity so you can settle in quickly.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAFAF7] border border-slate-200/90 space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-[#10164F]">
                Honest & Transparent
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Clear room photos, upfront rent and deposit details, and zero broker commissions. What you see is what you get.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAFAF7] border border-slate-200/90 space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-[#10164F]">
                Localized for Jharkhand
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Tailored for college students attending institutions near BIT Mesra, IIT ISM, Ranchi University, XLRI, and VBU.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          9. FINAL CALL TO ACTION
          ===================================================================== */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#10164F] to-[#151B65] rounded-[36px] p-8 sm:p-14 text-white text-center relative overflow-hidden shadow-2xl">
          {/* Contained Subtle Accent Glows */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-[#FFF45C]/15 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-[#A7F3D0]/15 blur-3xl pointer-events-none"
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="inline-block bg-[#FFF45C] text-[#10164F] text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
              Start Your Journey
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Your Next Chapter Starts at Home.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Find the accommodation that lets you focus on what matters most — your education and college memories.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link href="/discover" className="w-full sm:w-auto">
                <BrandButton
                  variant="yellow"
                  size="lg"
                  fullWidth
                  rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                >
                  Explore PGs →
                </BrandButton>
              </Link>

              <Link href="/signup" className="w-full sm:w-auto">
                <BrandButton
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="border-white/40 text-white hover:bg-white/10"
                >
                  Create an Account
                </BrandButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

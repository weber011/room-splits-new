"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Wifi,
  Utensils,
  ShieldCheck,
  Search,
  Bed,
  CheckCircle,
  Home,
  Heart,
  User,
} from "lucide-react";

interface SmartphoneMockupProps {
  className?: string;
}

export function SmartphoneMockup({ className }: SmartphoneMockupProps) {
  const [imageError, setImageError] = useState(false);

  // Attractive student bedroom photograph from Unsplash
  const bedroomPhotoUrl =
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80";

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[340px] sm:max-w-[370px] aspect-[9/18.5] select-none",
        "rounded-[44px] sm:rounded-[48px] p-3.5 sm:p-4 bg-slate-900",
        "shadow-[0_25px_60px_-15px_rgba(16,22,79,0.22)] ring-1 ring-slate-800",
        className
      )}
    >
      {/* Outer Phone Bezel & Reflection Highlights */}
      <div className="absolute inset-0 rounded-[44px] sm:rounded-[48px] border-4 border-slate-700/60 pointer-events-none" />

      {/* Dynamic Island / Speaker Pill */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-end px-2">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
      </div>

      {/* Phone Screen Canvas */}
      <div className="relative w-full h-full bg-[#FAFAF7] rounded-[36px] sm:rounded-[40px] overflow-hidden flex flex-col justify-between border border-slate-200">
        {/* Mock App Header */}
        <div className="pt-9 px-4 pb-2.5 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-[#10164F] flex items-center justify-center text-white">
              <Home className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-xs text-[#10164F]">
              Room<span className="text-[#3129C8]">Splits</span>
            </span>
          </div>

          <div className="flex items-center gap-1 bg-[#FAFAF7] border border-slate-200 rounded-full px-2.5 py-1 text-[10px] text-slate-600 font-medium">
            <MapPin className="w-2.5 h-2.5 text-[#3129C8]" />
            <span>Ranchi, Jharkhand</span>
          </div>
        </div>

        {/* Mock Search Bar */}
        <div className="px-4 py-2 bg-white">
          <div className="flex items-center gap-2 bg-[#FAFAF7] rounded-xl px-3 py-1.5 border border-slate-200/80 text-[11px] text-slate-400">
            <Search className="w-3 h-3 text-slate-400" />
            <span>Search near BIT Mesra, Lalpur...</span>
          </div>
        </div>

        {/* Mock Property Card */}
        <div className="flex-1 px-3.5 py-2 overflow-hidden flex flex-col gap-2.5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col flex-1">
            {/* Image Container with Fallback */}
            <div className="relative w-full h-44 sm:h-48 bg-slate-100 overflow-hidden">
              {!imageError ? (
                <Image
                  src={bedroomPhotoUrl}
                  alt="Sample student furnished room accommodation preview"
                  fill
                  sizes="(max-width: 640px) 300px, 350px"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  onError={() => setImageError(true)}
                  priority
                />
              ) : (
                /* Fallback Graphic */
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-indigo-50 to-blue-50 text-[#10164F] p-4 text-center">
                  <Bed className="w-10 h-10 text-[#3129C8] mb-1" />
                  <span className="text-xs font-bold">Furnished Student Room</span>
                  <span className="text-[10px] text-slate-500">Preview Accommodation</span>
                </div>
              )}

              {/* Verified Badge */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-[#A7F3D0] text-[#10164F] font-bold text-[9px] px-2 py-0.5 rounded-full shadow-sm">
                <ShieldCheck className="w-3 h-3 text-[#10164F]" />
                <span>Verified Stay</span>
              </div>

              {/* Sample Price Tag */}
              <div className="absolute bottom-2.5 right-2.5 bg-[#10164F] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-xl shadow-md">
                ₹6,500<span className="text-[9px] font-normal text-slate-300">/mo</span>
              </div>

              {/* Favourite heart icon */}
              <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-rose-500 shadow-sm">
                <Heart className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>

            {/* Listing Details */}
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#3129C8] bg-indigo-50 px-1.5 py-0.5 rounded">
                    Demo Listing
                  </span>
                  <span className="text-[9px] font-bold text-gray-500">
                    Single &amp; Double Sharing
                  </span>
                </div>

                <h4 className="font-extrabold text-xs text-[#10164F] line-clamp-1">
                  Sunrise Student Living
                </h4>
                <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 text-[#3129C8]" />
                  <span>Circular Road, Lalpur, Ranchi</span>
                </p>
              </div>

              {/* Amenity Pills */}
              <div className="flex flex-wrap gap-1 my-1.5">
                <span className="inline-flex items-center gap-0.5 text-[9px] font-medium bg-[#FAFAF7] border border-slate-200/60 text-[#10164F] px-1.5 py-0.5 rounded-md">
                  <Wifi className="w-2.5 h-2.5 text-[#3129C8]" />
                  Wi-Fi
                </span>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-medium bg-[#FAFAF7] border border-slate-200/60 text-[#10164F] px-1.5 py-0.5 rounded-md">
                  <Utensils className="w-2.5 h-2.5 text-[#3129C8]" />
                  3 Meals
                </span>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-medium bg-[#FAFAF7] border border-slate-200/60 text-[#10164F] px-1.5 py-0.5 rounded-md">
                  <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                  Study Desk
                </span>
              </div>

              {/* View Property Button */}
              <div className="pt-1">
                <button
                  type="button"
                  className="w-full bg-[#3129C8] hover:bg-[#251fa3] text-white text-[10px] font-bold py-1.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>View Property</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mock Phone App Bottom Bar */}
        <div className="px-6 py-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-slate-400">
          <div className="flex flex-col items-center text-[#3129C8]">
            <Home className="w-3.5 h-3.5" />
            <span className="text-[8px] font-bold mt-0.5">Explore</span>
          </div>
          <div className="flex flex-col items-center">
            <Heart className="w-3.5 h-3.5" />
            <span className="text-[8px] mt-0.5">Saved</span>
          </div>
          <div className="flex flex-col items-center">
            <Bed className="w-3.5 h-3.5" />
            <span className="text-[8px] mt-0.5">Stays</span>
          </div>
          <div className="flex flex-col items-center">
            <User className="w-3.5 h-3.5" />
            <span className="text-[8px] mt-0.5">Account</span>
          </div>
        </div>
      </div>
    </div>
  );
}

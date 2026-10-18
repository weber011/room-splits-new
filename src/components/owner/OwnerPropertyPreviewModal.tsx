"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { OwnerProperty } from "@/lib/owner-storage";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { AmenityBadge } from "@/components/common/AmenityBadge";
import {
  X,
  MapPin,
  Bed,
} from "lucide-react";

export interface OwnerPropertyPreviewModalProps {
  property: OwnerProperty | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OwnerPropertyPreviewModal({
  property,
  isOpen,
  onClose,
}: OwnerPropertyPreviewModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !property) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#10164F]/70 backdrop-blur-xs overflow-y-auto animate-fade-in"
    >
      <div className="bg-[#FAFAF7] rounded-3xl border border-slate-200 max-w-3xl w-full my-auto shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-[#FFF45C] text-[#10164F] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Student View Preview
            </span>
            <span className="text-xs text-slate-500 font-bold hidden sm:inline">
              &bull; Live Localhost Simulation
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-[#10164F] hover:bg-slate-100 cursor-pointer"
            aria-label="Close preview dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Main Photo Banner */}
          <div className="relative h-64 sm:h-80 w-full rounded-3xl overflow-hidden bg-slate-200 shadow-inner">
            <Image
              src={property.coverImage || property.images?.[0]}
              alt={property.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-[#FFF45C] text-[#10164F] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                Demo Listing
              </span>
              <span className="bg-white/95 backdrop-blur-md text-[#10164F] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                {property.genderPolicy === "boys"
                  ? "Boys Only"
                  : property.genderPolicy === "girls"
                  ? "Girls Only"
                  : "Co-Ed Stay"}
              </span>
            </div>
          </div>

          {/* Title & Pricing Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div className="space-y-1.5">
              <h2
                id="preview-dialog-title"
                className="text-2xl sm:text-3xl font-black text-[#10164F] tracking-tight"
              >
                {property.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-[#3129C8] shrink-0" />
                <span>
                  {property.locality}, {property.city}
                </span>
              </p>
              {property.address && (
                <p className="text-xs text-slate-400 pl-5">
                  Address hint: {property.address}
                </p>
              )}
            </div>

            <div className="shrink-0 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
              <PriceDisplay amount={property.monthlyRent} size="lg" />
              <span className="text-[10px] text-slate-400 block font-medium -mt-1">
                Sample Demo Monthly Rent
              </span>
              {property.securityDeposit ? (
                <span className="text-[11px] text-indigo-700 font-bold block mt-1">
                  Security Deposit: ₹
                  {property.securityDeposit.toLocaleString("en-IN")}
                </span>
              ) : null}
            </div>
          </div>

          {/* Room Sharing Options */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-extrabold text-[#10164F] uppercase tracking-wider flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-[#3129C8]" />
              <span>Available Room Options</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {property.roomTypes.map((rt) => (
                <span
                  key={rt}
                  className="px-3.5 py-1.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#3129C8] text-xs font-bold"
                >
                  {rt}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-[#10164F] uppercase tracking-wider">
              About This PG
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium bg-white border border-slate-200/80 rounded-2xl p-4">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-extrabold text-[#10164F] uppercase tracking-wider">
              Disclosed Amenities
            </h3>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity) => (
                <AmenityBadge key={amenity} name={amenity} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-400 font-medium">
            Stored locally in demo owner store &bull; ID: {property.id}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-[#10164F] text-[#FFF45C] hover:bg-[#1a2266] text-xs font-bold transition-all cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

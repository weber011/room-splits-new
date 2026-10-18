"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { PriceDisplay } from "./PriceDisplay";
import { MapPin, Heart, Bed, ArrowRight } from "lucide-react";
import { Property } from "@/types";
import {
  isPropertySaved,
  toggleSaveProperty,
  subscribeToStorage,
} from "@/lib/student-storage";

export interface PropertyCardProps {
  property: Property;
  onVisitRequest?: (propertyId: string) => void;
  onToggleCompare?: (property: Property) => void;
  onSaveToggle?: (propertyId: string, isSaved: boolean) => void;
  isCompared?: boolean;
  className?: string;
}

export function PropertyCard({
  property,
  onSaveToggle,
  className,
}: PropertyCardProps) {
  const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80";

  const [isSaved, setIsSaved] = useState(false);
  const [imgSrc, setImgSrc] = useState(
    property.coverImage || property.images?.[0] || FALLBACK_IMAGE
  );

  useEffect(() => {
    setImgSrc(property.coverImage || property.images?.[0] || FALLBACK_IMAGE);
  }, [property.coverImage, property.images]);

  useEffect(() => {
    setIsSaved(isPropertySaved(property.id));
    const unsubscribe = subscribeToStorage(() => {
      setIsSaved(isPropertySaved(property.id));
    });
    return unsubscribe;
  }, [property.id]);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleSaveProperty(property.id);
    setIsSaved(next);
    if (onSaveToggle) {
      onSaveToggle(property.id, next);
    }
    // Asynchronously sync with Supabase saved_properties if logged in
    import("@/app/actions/saved-property.actions").then(({ toggleSavePropertyAction }) => {
      toggleSavePropertyAction(property.id).catch(() => {});
    });
  };

  // Extract sharing types from roomOptions or format cleanly
  const sharingSummary = property.roomOptions && property.roomOptions.length > 0
    ? property.roomOptions.map((r) => r.sharingType.replace("_", " ")).slice(0, 2).join(" & ") + " Sharing"
    : "Single & Double Sharing";

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/90 shadow-[0_8px_30px_rgba(16,22,79,0.06)] hover:shadow-[0_20px_40px_rgba(16,22,79,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden group ${className}`}
    >
      <div>
        {/* Cover Image & Overlay Badges */}
        <div className="relative h-56 w-full overflow-hidden bg-slate-100">
          <Image
            src={imgSrc}
            alt={`${property.title} - student accommodation photo`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc(FALLBACK_IMAGE)}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
            {property.verified ? (
              <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider">
                Verified PG
              </span>
            ) : property.id.startsWith("prop-") ? (
              <span className="bg-[#FFF45C] text-[#10164F] text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider">
                Demo Listing
              </span>
            ) : (
              <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider">
                Active PG
              </span>
            )}
            <span className="bg-white/95 backdrop-blur-md text-[#10164F] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-slate-200/60 shadow-xs">
              {property.genderPolicy === "boys"
                ? "Boys Only"
                : property.genderPolicy === "girls"
                ? "Girls Only"
                : "Co-Ed Stay"}
            </span>
          </div>

          {/* Save Heart Button with interactive micro-bounce */}
          <div className="absolute top-3 right-3 z-10">
            <button
              type="button"
              onClick={handleSaveClick}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-xs cursor-pointer active:scale-125 duration-150 ${
                isSaved
                  ? "bg-rose-500 text-white"
                  : "bg-white/90 text-slate-500 hover:text-rose-500 hover:bg-white"
              }`}
              aria-label={isSaved ? "Remove from Shortlist" : "Save to Shortlist"}
            >
              <Heart className={`h-4 w-4 ${isSaved ? "fill-white" : ""}`} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          {/* Category & Sharing Info */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3129C8] bg-indigo-50 px-2 py-0.5 rounded-md">
              {property.category.toUpperCase()} &bull; {property.location.city}
            </span>

            <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-[#3129C8]" />
              <span className="capitalize">{sharingSummary}</span>
            </span>
          </div>

          {/* Title */}
          <Link href={`/property/${property.id}`} className="block group-hover:text-[#3129C8] transition-colors">
            <h3 className="text-base font-extrabold text-[#10164F] line-clamp-1 leading-snug">
              {property.title}
            </h3>
          </Link>

          {/* Locality */}
          <p className="text-xs text-[#64748B] flex items-center gap-1.5 font-medium">
            <MapPin className="h-3.5 w-3.5 text-[#3129C8] shrink-0" />
            <span className="truncate">
              {property.location.locality}, {property.location.city}
            </span>
          </p>

          {/* Amenities preview */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {property.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-[10px] font-semibold bg-[#FAFAF7] text-[#10164F] px-2.5 py-1 rounded-lg border border-[#10164F]/10"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-[10px] text-[#64748B] font-semibold px-1 py-1">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Illustrative Price & Details Action */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <PriceDisplay amount={property.startingPrice} size="md" />
          <span className="text-[9px] text-gray-400 block -mt-1 font-medium">Sample Demo Rent</span>
        </div>

        <Link href={`/property/${property.id}`}>
          <button className="px-4 py-2 rounded-xl bg-[#3129C8] hover:bg-[#251fa3] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all">
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>
    </div>
  );
}

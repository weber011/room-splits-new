"use client";

import React, { useState, useEffect } from "react";
import { Heart, Share2, Check } from "lucide-react";
import {
  isPropertySaved,
  toggleSaveProperty,
  addRecentlyViewed,
  subscribeToStorage,
} from "@/lib/student-storage";

export function PropertyDetailHeaderActions({
  propertyTitle,
  propertyId,
}: {
  propertyTitle: string;
  propertyId?: string;
}) {
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (propertyId) {
      // Record as recently viewed
      addRecentlyViewed(propertyId);
      // Sync saved status
      setIsSaved(isPropertySaved(propertyId));

      const unsubscribe = subscribeToStorage(() => {
        setIsSaved(isPropertySaved(propertyId));
      });
      return unsubscribe;
    }
  }, [propertyId]);

  const handleToggleSave = () => {
    if (!propertyId) {
      setIsSaved(!isSaved);
      return;
    }
    const next = toggleSaveProperty(propertyId);
    setIsSaved(next);
    // Asynchronously sync with Supabase saved_properties
    import("@/app/actions/saved-property.actions").then(({ toggleSavePropertyAction }) => {
      toggleSavePropertyAction(propertyId).catch(() => {});
    });
  };

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // Fallback
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Share Button */}
      <button
        type="button"
        onClick={handleShare}
        className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-[#10164F] hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
        aria-label={`Share ${propertyTitle}`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700 font-extrabold">Link Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Share</span>
          </>
        )}
      </button>

      {/* Favorite Heart Button */}
      <button
        type="button"
        onClick={handleToggleSave}
        className={`px-3 py-2 rounded-2xl border font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95 ${
          isSaved
            ? "bg-rose-50 border-rose-200 text-rose-600"
            : "bg-white border-slate-200 text-[#10164F] hover:text-rose-600 hover:bg-slate-50"
        }`}
        aria-label={isSaved ? "Remove property from shortlist" : "Save property to shortlist"}
        aria-pressed={isSaved}
      >
        <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
        <span>{isSaved ? "Saved" : "Save"}</span>
      </button>
    </div>
  );
}

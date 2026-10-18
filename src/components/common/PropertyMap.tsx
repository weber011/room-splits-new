"use client";

import React, { useState, useEffect, useRef } from "react";
import { PropertyLocationCoordinates, NearbyLandmark } from "@/types/map.types";
import { DEFAULT_NEARBY_LANDMARKS } from "@/lib/maps.utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PLATFORM_SETTINGS } from "@/config/business-rules.config";
import {
  MapPin,
  Navigation,
  Lock,
  Building,
  GraduationCap,
  Train,
  Hospital,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export interface PropertyMapProps {
  location: PropertyLocationCoordinates;
  title: string;
  isExactLocationVisible: boolean;
  nearbyLandmarks?: NearbyLandmark[];
  className?: string;
}

export function PropertyMap({
  location,
  title,
  isExactLocationVisible,
  nearbyLandmarks = DEFAULT_NEARBY_LANDMARKS,
  className,
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapsStatus, setMapsStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isKeyConfigured = Boolean(apiKey && apiKey !== "your-google-maps-api-key" && apiKey.trim().length > 5);

  // Load Google Maps API Script cleanly
  useEffect(() => {
    if (!isKeyConfigured) {
      setMapsStatus("unavailable");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).google?.maps) {
      setMapsStatus("ready");
      return;
    }

    const scriptId = "google-maps-sdk-script";
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      existingScript.addEventListener("load", () => setMapsStatus("ready"));
      existingScript.addEventListener("error", () => setMapsStatus("unavailable"));
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsStatus("ready");
    script.onerror = () => setMapsStatus("unavailable");
    document.head.appendChild(script);
  }, [apiKey, isKeyConfigured]);

  // Render Google Map instance when SDK ready
  useEffect(() => {
    if (mapsStatus !== "ready" || !mapRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as any).google;
    if (!google?.maps) return;

    if (isExactLocationVisible && location.latitude && location.longitude) {
      // UNLOCKED STATE: Render Exact Marker
      const center = { lat: location.latitude, lng: location.longitude };
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      new google.maps.Marker({
        position: center,
        map,
        title,
      });
    } else {
      // LOCKED STATE: Render Safe Approximate Locality View (e.g. Ranchi center or city default)
      const approxCenter = { lat: 23.3441, lng: 85.3096 }; // Default Ranchi approximate center
      const map = new google.maps.Map(mapRef.current, {
        center: approxCenter,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Draw an approximate locality circle without exact coordinates
      new google.maps.Circle({
        strokeColor: "#f59e0b",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#f59e0b",
        fillOpacity: 0.15,
        map,
        center: approxCenter,
        radius: 1200, // 1.2km approximate circle
      });
    }
  }, [mapsStatus, isExactLocationVisible, location.latitude, location.longitude, title]);

  const getLandmarkIcon = (type: string) => {
    switch (type) {
      case "METRO":
        return <Train className="h-4 w-4 text-emerald-400" />;
      case "COLLEGE":
        return <GraduationCap className="h-4 w-4 text-blue-400" />;
      case "TECH_PARK":
        return <Building className="h-4 w-4 text-teal-400" />;
      case "HOSPITAL":
        return <Hospital className="h-4 w-4 text-rose-400" />;
      case "MALL":
        return <ShoppingBag className="h-4 w-4 text-amber-400" />;
      default:
        return <MapPin className="h-4 w-4 text-emerald-400" />;
    }
  };

  // Safe Google Maps Search / Directions URLs generated ONLY if authorized with valid coordinates
  const openInGoogleMapsUrl =
    isExactLocationVisible && location.latitude && location.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
      : undefined;

  const directionsUrl =
    isExactLocationVisible && location.latitude && location.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`
      : undefined;

  return (
    <Card className={`rounded-3xl border border-[#10164F]/10 bg-white p-6 space-y-4 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#10164F]/10 pb-4">
        <div>
          <h3 className="font-extrabold text-[#10164F] text-base flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#3129C8]" />
            <span>{isExactLocationVisible ? "Exact Location & Directions" : "Approximate Locality"}</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {isExactLocationVisible
              ? location.formatted_address || `${location.city}, ${location.state}`
              : `Locality: ${location.city || "Ranchi"}, ${location.state || "Jharkhand"}`}
          </p>
        </div>

        {isExactLocationVisible ? (
          <span className="px-3 py-1 rounded-full bg-[#A7F3D0] text-[#10164F] font-bold text-xs flex items-center gap-1 self-start sm:self-auto">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
            Exact Address Unlocked
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-[#FFF45C] text-[#10164F] font-bold text-xs flex items-center gap-1 self-start sm:self-auto">
            <Lock className="h-3.5 w-3.5" />
            Exact Location Protected
          </span>
        )}
      </div>

      {/* Privacy Warning Banner if Restricted */}
      {!isExactLocationVisible && (
        <div className="p-4 rounded-2xl bg-[#FFF45C]/25 border border-[#FFF45C] text-[#10164F] text-xs space-y-1">
          <div className="flex items-center gap-2 font-extrabold text-[#10164F] text-sm">
            <Lock className="h-4 w-4 text-[#10164F] shrink-0" />
            <span>Exact location hidden for privacy</span>
          </div>
          <p className="text-xs text-gray-700">
            Unlock this property for <strong>{PLATFORM_SETTINGS.UNLOCK_PRICE_LABEL}</strong> to see the exact building address, GPS coordinates, owner phone, and visit instructions.
          </p>
        </div>
      )}

      {/* Map Interactive Canvas or Graceful Fallback */}
      <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-[#10164F]/10 bg-[#FAFAF7] flex flex-col items-center justify-center text-center p-4">
        {mapsStatus === "ready" ? (
          <div ref={mapRef} className="h-full w-full" />
        ) : (
          /* Graceful Fallback UI when API key missing or Maps unavailable */
          <div className="relative z-10 space-y-3 max-w-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF45C] text-[#10164F] border border-[#10164F]/15 mx-auto shadow-xs">
              <MapPin className="h-6 w-6 text-[#10164F]" />
            </div>

            <div>
              <h4 className="font-extrabold text-[#10164F] text-sm">Verified Locality Map</h4>
              <p className="text-xs text-gray-600 mt-1">
                {isExactLocationVisible
                  ? location.formatted_address || `${location.city}, ${location.state} ${location.pincode}`
                  : `Locality Hub: ${location.city || "Ranchi"}, ${location.state || "Jharkhand"}`}
              </p>
            </div>
          </div>
        )}

        {/* Map Action Overlay for Unlocked State */}
        {isExactLocationVisible && (openInGoogleMapsUrl || directionsUrl) && (
          <div className="absolute bottom-3 right-3 z-20 flex flex-wrap gap-2">
            {openInGoogleMapsUrl && (
              <a href={openInGoogleMapsUrl} target="_blank" rel="noreferrer">
                <Button size="sm" className="bg-white text-[#10164F] hover:bg-gray-50 border border-[#10164F]/20 font-bold text-xs gap-1.5 shadow-md">
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open in Google Maps</span>
                </Button>
              </a>
            )}
            {directionsUrl && (
              <a href={directionsUrl} target="_blank" rel="noreferrer">
                <Button size="sm" className="bg-[#3129C8] hover:bg-[#251fa3] text-white font-bold text-xs gap-1.5 shadow-md">
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Get Directions</span>
                </Button>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Nearby Distance Matrix Chips */}
      <div className="space-y-3 pt-3 border-t border-[#10164F]/10">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Nearby Colleges, IT Parks &amp; Transit Hubs
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {nearbyLandmarks.map((lm) => (
            <div
              key={lm.id}
              className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#10164F]/10 flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white border border-[#10164F]/10 text-[#3129C8]">
                  {getLandmarkIcon(lm.type)}
                </div>
                <div>
                  <h5 className="font-bold text-[#10164F] text-xs leading-snug">{lm.name}</h5>
                  {lm.travelTimeMinutes && (
                    <span className="text-[11px] text-gray-500">{lm.travelTimeMinutes} mins travel</span>
                  )}
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#10164F]/10 text-[#10164F] text-[11px] font-bold shrink-0">
                {lm.distanceKm} km
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

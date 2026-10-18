"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { PriceDisplay } from "./PriceDisplay";
import { BedDouble, Bath, Sun, Check } from "lucide-react";
import { RoomOption } from "@/types";

export interface RoomCardProps {
  room: RoomOption;
  isSelected?: boolean;
  onSelectRoom?: (roomId: string) => void;
  className?: string;
}

export function RoomCard({
  room,
  isSelected = false,
  onSelectRoom,
  className = "",
}: RoomCardProps) {
  const isAvailable = room.availableBeds > 0;

  return (
    <Card
      className={`rounded-3xl border transition-all text-left ${
        isSelected
          ? "border-[#3129C8] ring-2 ring-[#3129C8]/25 bg-indigo-50/15 shadow-md"
          : "border-[#10164F]/10 bg-white hover:border-[#3129C8]/30 shadow-xs hover:shadow-sm"
      } p-5 space-y-4 ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                isAvailable
                  ? "bg-[#A7F3D0] text-[#10164F]"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {room.sharingType.replace("_", " ")} Sharing
            </span>

            {isSelected && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#3129C8] text-white text-[10px] font-extrabold">
                <Check className="w-3 h-3" />
                <span>Selected</span>
              </span>
            )}
          </div>

          <h4 className="font-extrabold text-[#10164F] text-base capitalize pt-1">
            {room.sharingType.replace("_", " ")} Room
          </h4>
        </div>

        <PriceDisplay amount={room.monthlyRent} period="mo" size="sm" />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 py-1">
        <div className="flex items-center gap-1.5">
          <BedDouble className="h-4 w-4 text-[#3129C8] shrink-0" />
          <span>
            {room.availableBeds} of {room.totalBeds} Beds Left
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Bath className="h-4 w-4 text-[#3129C8] shrink-0" />
          <span>{room.hasAttachedBathroom ? "Attached Bath" : "Shared Bath"}</span>
        </div>
        {room.hasBalcony && (
          <div className="flex items-center gap-1.5 col-span-2 text-emerald-700 font-medium">
            <Sun className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Private Balcony Attached</span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-gray-500">
          Deposit: <strong className="text-[#10164F]">₹{room.securityDeposit.toLocaleString("en-IN")}</strong>
        </span>

        <button
          type="button"
          disabled={!isAvailable}
          onClick={() => onSelectRoom?.(room.id)}
          aria-pressed={isSelected}
          className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            !isAvailable
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : isSelected
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              : "bg-[#3129C8] hover:bg-[#251fa3] text-white shadow-xs active:scale-95"
          }`}
        >
          {!isAvailable ? "Fully Occupied" : isSelected ? "✓ Selected" : "Select Room"}
        </button>
      </div>
    </Card>
  );
}

"use client";

import React, { useState } from "react";
import { RoomOption } from "@/types";
import { RoomCard } from "@/components/common/RoomCard";
import { CheckCircle2, Info } from "lucide-react";

export function RoomSelectionSection({
  roomOptions,
  startingPrice,
}: {
  roomOptions: RoomOption[];
  startingPrice: number;
}) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Fallback room options if none defined
  const displayedRooms: RoomOption[] =
    roomOptions && roomOptions.length > 0
      ? roomOptions
      : [
          {
            id: "fallback-single",
            sharingType: "single",
            monthlyRent: Math.round(startingPrice * 1.5),
            securityDeposit: Math.round(startingPrice * 3),
            availableBeds: 1,
            totalBeds: 2,
            hasAttachedBathroom: true,
            hasBalcony: true,
          },
          {
            id: "fallback-double",
            sharingType: "double",
            monthlyRent: startingPrice,
            securityDeposit: startingPrice * 2,
            availableBeds: 2,
            totalBeds: 4,
            hasAttachedBathroom: true,
            hasBalcony: false,
          },
        ];

  const selectedRoom = displayedRooms.find((r) => r.id === selectedRoomId);

  const handleToggleSelect = (roomId: string) => {
    setSelectedRoomId((prev) => (prev === roomId ? null : roomId));
  };

  return (
    <section id="room-options" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-[#10164F]">
            Room Sharing Options &amp; Monthly Rent
          </h3>
          <p className="text-xs text-[#64748B]">
            Select a room type to review bed availability, attached facilities, and deposit terms.
          </p>
        </div>

        {selectedRoom && (
          <span className="text-xs font-bold text-[#3129C8] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 self-start sm:self-auto">
            1 Room Selected
          </span>
        )}
      </div>

      {/* Selected Room Feedback Notice */}
      {selectedRoom && (
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-[#10164F] flex items-start gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#3129C8] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-extrabold text-sm text-[#10164F]">
              {selectedRoom.sharingType.replace("_", " ")} Sharing Selected &bull; ₹
              {selectedRoom.monthlyRent.toLocaleString("en-IN")}/month
            </p>
            <p className="text-[11px] text-[#64748B]">
              <Info className="w-3 h-3 inline mr-1 text-[#3129C8]" />
              Demo Preview: Room selection is active for frontend preview. No real booking or charge is created.
            </p>
          </div>
        </div>
      )}

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayedRooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            isSelected={selectedRoomId === room.id}
            onSelectRoom={handleToggleSelect}
          />
        ))}
      </div>
    </section>
  );
}

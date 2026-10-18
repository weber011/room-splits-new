import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VerifiedBadgeProps {
  type?: "property" | "owner" | "resident";
  className?: string;
}

export function VerifiedBadge({ type = "property", className }: VerifiedBadgeProps) {
  const labelMap = {
    property: "Verified PG",
    owner: "Verified Host",
    resident: "Verified Student",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-[#A7F3D0] border border-emerald-300/80 px-2.5 py-0.5 text-[11px] font-extrabold text-[#10164F] shadow-sm",
        className
      )}
    >
      <ShieldCheck className="h-3.5 w-3.5 text-[#10164F]" />
      <span>{labelMap[type]}</span>
    </span>
  );
}

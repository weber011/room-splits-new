import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  withLink?: boolean;
  href?: string;
  variant?: "navy" | "white";
  showTagline?: boolean;
}

export function Logo({
  className,
  size = "md",
  withLink = true,
  href = "/welcome",
  variant = "navy",
  showTagline = false,
}: LogoProps) {
  const sizeMap = {
    sm: {
      icon: "w-8 h-8",
      text: "text-lg",
      house: "w-4 h-4",
      tagline: "text-[9px]",
    },
    md: {
      icon: "w-10 h-10",
      text: "text-2xl",
      house: "w-5 h-5",
      tagline: "text-[11px]",
    },
    lg: {
      icon: "w-12 h-12",
      text: "text-3xl",
      house: "w-6 h-6",
      tagline: "text-xs",
    },
    xl: {
      icon: "w-16 h-16",
      text: "text-4xl",
      house: "w-8 h-8",
      tagline: "text-sm",
    },
  };

  const isWhite = variant === "white";
  const textColor = isWhite ? "text-white" : "text-[#10164F]";
  const splitColor = isWhite ? "text-[#FFF45C]" : "text-[#3129C8]";
  const taglineColor = isWhite ? "text-slate-300" : "text-[#64748B]";
  const iconBg = isWhite
    ? "bg-white/10 text-white border border-white/20"
    : "bg-[#10164F] text-white shadow-md shadow-[#10164F]/20";

  const content = (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      {/* Icon Badge */}
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl relative transition-transform duration-300 hover:scale-105",
          sizeMap[size].icon,
          iconBg
        )}
      >
        {/* Simple Modern House Icon SVG with Yellow Accent */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={sizeMap[size].house}
        >
          <path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20v-9.5z" />
          <path d="M9 21V12h6v9" stroke="currentColor" />
        </svg>

        {/* Small Yellow Accent Dot */}
        <span
          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FFF45C] border-2 border-white shadow-sm"
          aria-hidden="true"
        />
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <span className={cn("font-extrabold tracking-tight leading-none", sizeMap[size].text, textColor)}>
          Room<span className={splitColor}>Splits</span>
        </span>
        {showTagline && (
          <span className={cn("font-medium tracking-wide mt-1", sizeMap[size].tagline, taglineColor)}>
            Student Stays & PG Discovery
          </span>
        )}
      </div>
    </div>
  );

  if (withLink) {
    return (
      <Link
        href={href}
        className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3129C8] rounded-xl"
        aria-label="RoomSplits Home"
      >
        {content}
      </Link>
    );
  }

  return content;
}

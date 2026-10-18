import React from "react";
import { cn } from "@/lib/utils";

interface GeometricDecorationsProps {
  className?: string;
  variant?: "welcome" | "auth" | "minimal";
}

export function GeometricDecorations({
  className,
  variant = "welcome",
}: GeometricDecorationsProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden select-none", className)}
      aria-hidden="true"
    >
      {/* 1. Large Bright Yellow Organic Decorative Shape (right side) */}
      <div
        className={cn(
          "absolute -right-20 sm:-right-10 top-0 sm:-top-10 w-72 sm:w-96 md:w-[480px] lg:w-[580px] h-72 sm:h-96 md:h-[480px] lg:h-[580px]",
          "rounded-full bg-[#FFF45C] opacity-90 blur-2xl sm:blur-3xl -z-10",
          "animate-pulse-subtle"
        )}
      />

      {/* 2. Soft Mint Green Accent Organic Shape (bottom left) */}
      <div
        className={cn(
          "absolute -left-20 sm:-left-10 bottom-0 sm:bottom-10 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96",
          "rounded-full bg-[#A7F3D0] opacity-60 blur-2xl sm:blur-3xl -z-10",
          "animate-pulse-subtle"
        )}
      />

      {/* 3. Subtle Light Blue Accent Shape (center top) */}
      <div
        className={cn(
          "absolute left-1/3 top-1/4 w-48 sm:w-72 h-48 sm:h-72",
          "rounded-full bg-[#DBEAFE] opacity-50 blur-2xl -z-10"
        )}
      />

      {/* 4. Small Crisp Geometric Floating Elements (welcome/auth) */}
      {variant !== "minimal" && (
        <>
          {/* Yellow Solid Circle Accent */}
          <div
            className="absolute top-24 right-1/4 w-5 h-5 rounded-full bg-[#FFF45C] shadow-sm border border-yellow-300 animate-float hidden sm:block"
            style={{ animationDelay: "0.2s" }}
          />

          {/* Mint Circle Accent */}
          <div
            className="absolute top-1/2 left-10 w-4 h-4 rounded-full bg-[#A7F3D0] shadow-sm animate-float hidden md:block"
            style={{ animationDelay: "0.8s" }}
          />

          {/* Navy Geometric Hollow Circle */}
          <div
            className="absolute bottom-28 right-12 w-8 h-8 rounded-full border-2 border-[#10164F]/20 animate-float hidden sm:block"
            style={{ animationDelay: "1.2s" }}
          />

          {/* Small Geometric Triangle SVG */}
          <div
            className="absolute top-36 left-1/4 animate-float hidden sm:block opacity-40"
            style={{ animationDelay: "1.6s" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <polygon
                points="12 3 22 21 2 21"
                fill="#3129C8"
                opacity="0.25"
              />
            </svg>
          </div>

          {/* Small Geometric Plus Sign SVG */}
          <div
            className="absolute bottom-1/3 right-1/3 animate-float hidden lg:block opacity-30 text-[#10164F]"
            style={{ animationDelay: "2.1s" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>

          {/* Subtle Grid Dot Accent (top right corner) */}
          <div className="absolute top-8 right-8 w-24 h-24 opacity-15 hidden lg:grid grid-cols-4 gap-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#10164F]" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

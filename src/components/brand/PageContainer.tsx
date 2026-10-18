import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function PageContainer({
  children,
  className,
  maxWidth = "xl",
}: PageContainerProps) {
  const maxWidthMap = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
    "2xl": "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "relative min-h-screen bg-[#FAFAF7] text-[#1F2937] flex flex-col justify-between overflow-x-hidden selection:bg-[#3129C8] selection:text-white",
        className
      )}
    >
      <div className={cn("w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 flex flex-col justify-center", maxWidthMap[maxWidth])}>
        {children}
      </div>
    </div>
  );
}

export function AuthCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full bg-white rounded-3xl p-6 sm:p-10 shadow-[0_10px_35px_rgba(16,22,79,0.06)] border border-slate-100 transition-all",
        className
      )}
    >
      {children}
    </div>
  );
}

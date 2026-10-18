import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface AlertProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function BrandErrorAlert({ children, title, className }: AlertProps) {
  if (!children) return null;
  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-900 shadow-sm animate-fade-in",
        className
      )}
    >
      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="text-xs font-medium space-y-0.5">
        {title && <p className="font-bold text-rose-950">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}

export function BrandSuccessAlert({ children, title, className }: AlertProps) {
  if (!children) return null;
  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-950 shadow-sm animate-fade-in",
        className
      )}
    >
      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="text-xs font-medium space-y-0.5">
        {title && <p className="font-bold text-emerald-950">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}

export function BrandInfoAlert({ children, title, className }: AlertProps) {
  if (!children) return null;
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-[#10164F] shadow-sm animate-fade-in",
        className
      )}
    >
      <Info className="w-5 h-5 text-[#3129C8] shrink-0 mt-0.5" aria-hidden="true" />
      <div className="text-xs font-medium space-y-0.5">
        {title && <p className="font-bold text-[#10164F]">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}

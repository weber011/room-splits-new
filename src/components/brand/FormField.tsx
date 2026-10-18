import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export interface FormFieldProps {
  id?: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  id,
  label,
  required,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5 w-full", className)}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-xs font-bold text-[#10164F] tracking-tight uppercase"
        >
          {label} {required && <span className="text-rose-500 font-bold ml-0.5">*</span>}
        </label>
        {hint && !error && (
          <span className="text-[11px] text-[#64748B] font-medium">{hint}</span>
        )}
      </div>

      <div>{children}</div>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-center gap-1.5 text-xs text-rose-600 font-medium pt-0.5 animate-fade-in"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

import React from "react";
import { cn } from "@/lib/utils";

export interface BrandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const BrandInput = React.forwardRef<HTMLInputElement, BrandInputProps>(
  ({ className, error, leftIcon, rightElement, disabled, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-4 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full h-12 rounded-2xl bg-white border text-sm text-[#1F2937] placeholder:text-[#94A3B8] transition-all duration-200 outline-none",
            "border-slate-200 shadow-sm",
            leftIcon ? "pl-11" : "px-4",
            rightElement ? "pr-12" : "px-4",
            // Focus state
            "focus:border-[#3129C8] focus:ring-4 focus:ring-[#3129C8]/10 focus:shadow-md",
            // Error state
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10 text-rose-900 bg-rose-50/20",
            // Disabled state
            disabled && "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-75 shadow-none",
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);

BrandInput.displayName = "BrandInput";

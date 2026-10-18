import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const brandButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Indigo primary: #3129C8
        primary:
          "bg-[#3129C8] hover:bg-[#261fa5] text-white shadow-[0_4px_14px_0_rgba(49,41,200,0.35)] hover:shadow-[0_6px_20px_rgba(49,41,200,0.45)] focus-visible:ring-[#3129C8]/25 rounded-2xl",
        // Deep navy
        navy:
          "bg-[#10164F] hover:bg-[#151B65] text-white shadow-[0_4px_14px_0_rgba(16,22,79,0.3)] hover:shadow-[0_6px_20px_rgba(16,22,79,0.4)] focus-visible:ring-[#10164F]/25 rounded-2xl",
        // Secondary / White card
        secondary:
          "bg-white hover:bg-slate-50 text-[#10164F] border border-slate-200 shadow-sm hover:border-slate-300 focus-visible:ring-slate-200 rounded-2xl",
        // Outline
        outline:
          "bg-transparent hover:bg-indigo-50/60 text-[#3129C8] border-2 border-[#3129C8] focus-visible:ring-[#3129C8]/20 rounded-2xl",
        // Mint accent: #A7F3D0
        mint:
          "bg-[#A7F3D0] hover:bg-[#86efac] text-[#10164F] shadow-sm focus-visible:ring-[#A7F3D0]/40 rounded-2xl font-bold",
        // Yellow accent: #FFF45C
        yellow:
          "bg-[#FFF45C] hover:bg-[#ffef3a] text-[#10164F] shadow-sm focus-visible:ring-[#FFF45C]/40 rounded-2xl font-bold",
        // Ghost
        ghost:
          "bg-transparent hover:bg-slate-100 text-[#1F2937] hover:text-[#10164F] focus-visible:ring-slate-200 rounded-xl",
        // Link
        link:
          "bg-transparent text-[#3129C8] hover:underline p-0 h-auto font-medium focus-visible:ring-0",
      },
      size: {
        sm: "h-9 px-4 text-xs rounded-xl",
        default: "h-12 px-6 text-sm rounded-2xl",
        lg: "h-14 px-8 text-base rounded-2xl font-bold",
        xl: "h-16 px-10 text-lg rounded-2xl font-extrabold tracking-wide",
        icon: "h-11 w-11 p-0 rounded-xl",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: false,
    },
  }
);

export interface BrandButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof brandButtonVariants> {
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const BrandButton = React.forwardRef<HTMLButtonElement, BrandButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(brandButtonVariants({ variant, size, fullWidth, className }))}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-current" aria-hidden="true" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

BrandButton.displayName = "BrandButton";

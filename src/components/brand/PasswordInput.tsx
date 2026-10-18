import React, { useState } from "react";
import { BrandInput, BrandInputProps } from "./BrandInput";
import { Eye, EyeOff, Lock } from "lucide-react";

export interface PasswordInputProps extends Omit<BrandInputProps, "type"> {
  showIcon?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showIcon = true, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <BrandInput
        ref={ref}
        type={isVisible ? "text" : "password"}
        leftIcon={showIcon ? <Lock className="w-4 h-4 text-slate-400" /> : undefined}
        rightElement={
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#10164F] hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3129C8]"
            aria-label={isVisible ? "Hide password" : "Show password"}
            tabIndex={0}
          >
            {isVisible ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = "PasswordInput";

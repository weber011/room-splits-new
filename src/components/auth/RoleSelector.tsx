import React from "react";
import { cn } from "@/lib/utils";
import { GraduationCap, Building2, CheckCircle2 } from "lucide-react";

export type UserRoleType = "tenant" | "owner";

interface RoleSelectorProps {
  value: UserRoleType;
  onChange: (role: UserRoleType) => void;
  disabled?: boolean;
}

export function RoleSelector({ value, onChange, disabled }: RoleSelectorProps) {
  const roles: {
    id: UserRoleType;
    title: string;
    description: string;
    badge: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "tenant",
      title: "Student",
      description: "Discover verified PGs, hostels & room shares near campus",
      badge: "Student Resident",
      icon: <GraduationCap className="w-5 h-5 text-[#3129C8]" />,
    },
    {
      id: "owner",
      title: "PG Owner",
      description: "List accommodations, manage beds & collect monthly rent",
      badge: "Property Host",
      icon: <Building2 className="w-5 h-5 text-[#10164F]" />,
    },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Select account role"
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full"
    >
      {roles.map((r) => {
        const isSelected = value === r.id;
        return (
          <button
            key={r.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChange(r.id)}
            className={cn(
              "relative flex flex-col text-left p-4 rounded-2xl border-2 transition-all duration-200 select-none",
              isSelected
                ? "border-[#3129C8] bg-indigo-50/50 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50",
              disabled && "opacity-60 cursor-not-allowed"
            )}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div
                className={cn(
                  "p-2.5 rounded-xl flex items-center justify-center transition-colors",
                  isSelected
                    ? "bg-[#3129C8]/10 text-[#3129C8]"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {r.icon}
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                    isSelected
                      ? "bg-[#3129C8] text-white"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {r.badge}
                </span>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-[#3129C8]" aria-hidden="true" />
                )}
              </div>
            </div>

            <span className="text-sm font-bold text-[#10164F] mb-1">
              {r.title}
            </span>
            <span className="text-xs text-[#64748B] leading-relaxed">
              {r.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}

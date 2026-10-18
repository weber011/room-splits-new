import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface DashboardStatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ElementType;
  description?: string;
  className?: string;
}

export function DashboardStatCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  description,
  className,
}: DashboardStatCardProps) {
  return (
    <Card className={cn("rounded-3xl border border-[#10164F]/10 bg-white p-5 space-y-3 shadow-sm text-[#10164F]", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {title}
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF45C] text-[#10164F] border border-[#10164F]/10 shadow-2xs">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div>
        <h3 className="text-2xl sm:text-3xl font-black text-[#10164F] tracking-tight">
          {value}
        </h3>
        {change && (
          <div className="flex items-center gap-1 mt-1 text-xs">
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-700" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
            )}
            <span className={isPositive ? "text-emerald-700 font-bold" : "text-rose-600 font-bold"}>
              {change}
            </span>
            <span className="text-gray-500">{description || "vs last month"}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

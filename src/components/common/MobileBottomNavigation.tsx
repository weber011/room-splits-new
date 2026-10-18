"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Home, User, Sparkles, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Explore", href: "/discover", icon: Search },
  { name: "Welcome", href: "/welcome", icon: Sparkles },
  { name: "Student", href: "/student/dashboard", icon: Home },
  { name: "PG Owner", href: "/owner/dashboard", icon: Building2 },
  { name: "Sign In", href: "/login", icon: User },
];

export function MobileBottomNavigation() {
  const pathname = usePathname();

  // Hide on standalone screens if desired, but keep accessible
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl text-[10px] font-bold transition-all min-w-[50px]",
                isActive
                  ? "text-[#3129C8]"
                  : "text-[#64748B] hover:text-[#10164F]"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-xl transition-all",
                  isActive && "bg-indigo-50 text-[#3129C8]"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

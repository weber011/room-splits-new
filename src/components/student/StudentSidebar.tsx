"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand";
import {
  LayoutDashboard,
  Heart,
  Clock,
  CalendarCheck,
  User,
  Search,
  Sparkles,
} from "lucide-react";

export type StudentDashboardTab =
  | "overview"
  | "saved"
  | "recent"
  | "visits"
  | "profile";

export interface StudentSidebarProps {
  activeTab: StudentDashboardTab;
  onTabChange: (tab: StudentDashboardTab) => void;
  savedCount: number;
  recentCount: number;
  className?: string;
}

export function StudentSidebar({
  activeTab,
  onTabChange,
  savedCount,
  recentCount,
  className = "",
}: StudentSidebarProps) {
  const navItems = [
    {
      id: "overview" as StudentDashboardTab,
      label: "Overview",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "saved" as StudentDashboardTab,
      label: "Saved PGs",
      icon: Heart,
      badge: savedCount > 0 ? savedCount : null,
      badgeColor: "bg-rose-100 text-rose-700",
    },
    {
      id: "recent" as StudentDashboardTab,
      label: "Recently Viewed",
      icon: Clock,
      badge: recentCount > 0 ? recentCount : null,
      badgeColor: "bg-indigo-100 text-[#3129C8]",
    },
    {
      id: "visits" as StudentDashboardTab,
      label: "Visit Requests",
      icon: CalendarCheck,
      badge: null,
    },
    {
      id: "profile" as StudentDashboardTab,
      label: "Student Profile",
      icon: User,
      badge: null,
    },
  ];

  return (
    <>
      {/* ======================================================== */}
      {/* DESKTOP SIDEBAR (lg and up) */}
      {/* ======================================================== */}
      <aside
        className={`hidden lg:flex flex-col justify-between w-64 shrink-0 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm sticky top-24 self-start ${className}`}
        aria-label="Student Dashboard Navigation"
      >
        <div className="space-y-6">
          {/* Logo / Brand Header */}
          <div className="pb-4 border-b border-slate-100">
            <Logo size="sm" href="/" showTagline />
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFF45C] text-[#10164F] text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5" />
                Student Portal
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Demo MVP
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#10164F] text-[#FFF45C] shadow-sm font-extrabold translate-x-1"
                      : "text-slate-600 hover:text-[#10164F] hover:bg-slate-50"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-[#FFF45C]" : "text-slate-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-[#FFF45C] text-[#10164F]"
                          : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom CTA to Discover */}
        <div className="pt-6 mt-6 border-t border-slate-100 space-y-3">
          <Link
            href="/discover"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#3129C8] hover:bg-[#251fa3] text-white text-xs font-black shadow-sm transition-all hover:shadow-md cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Discover PGs</span>
          </Link>

          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            Local browser preview &bull; No database connected
          </p>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MOBILE / TABLET HORIZONTAL TAB SELECTOR (< lg) */}
      {/* ======================================================== */}
      <div className="block lg:hidden w-full bg-white border border-slate-200/90 rounded-2xl p-2 shadow-xs mb-6 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#10164F] text-[#FFF45C] shadow-xs"
                    : "text-slate-600 hover:text-[#10164F] hover:bg-slate-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== null && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-[#FFF45C] text-[#10164F]"
                        : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <Link
            href="/discover"
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-[#3129C8] text-white hover:bg-[#251fa3] transition-all ml-auto"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Find PGs</span>
          </Link>
        </div>
      </div>
    </>
  );
}

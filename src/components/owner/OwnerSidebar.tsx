"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  CalendarCheck,
  User,
  ExternalLink,
  ShieldAlert,
  Search,
} from "lucide-react";

export type OwnerDashboardTab =
  | "overview"
  | "properties"
  | "add-property"
  | "visits"
  | "profile";

export interface OwnerSidebarProps {
  activeTab: OwnerDashboardTab;
  onTabChange: (tab: OwnerDashboardTab) => void;
  myPropertiesCount: number;
  className?: string;
}

export function OwnerSidebar({
  activeTab,
  onTabChange,
  myPropertiesCount,
  className = "",
}: OwnerSidebarProps) {
  const navItems = [
    {
      id: "overview" as OwnerDashboardTab,
      label: "Overview",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "properties" as OwnerDashboardTab,
      label: "My Properties",
      icon: Building2,
      badge: myPropertiesCount > 0 ? myPropertiesCount : null,
      badgeColor: "bg-indigo-100 text-[#3129C8]",
    },
    {
      id: "add-property" as OwnerDashboardTab,
      label: "Add Property",
      icon: PlusCircle,
      badge: "Form",
      badgeColor: "bg-[#FFF45C] text-[#10164F]",
    },
    {
      id: "visits" as OwnerDashboardTab,
      label: "Visit Requests",
      icon: CalendarCheck,
      badge: "0",
      badgeColor: "bg-slate-100 text-slate-500",
    },
    {
      id: "profile" as OwnerDashboardTab,
      label: "Owner Profile",
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
        aria-label="Owner Dashboard Navigation"
      >
        <div className="space-y-6">
          {/* Logo / Brand Header */}
          <div className="pb-4 border-b border-slate-100">
            <Logo size="sm" href="/" showTagline />
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10164F] text-[#FFF45C] text-[10px] font-black uppercase tracking-wider">
                PG Owner Portal
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

        {/* Bottom Actions: View Student Experience */}
        <div className="pt-6 mt-6 border-t border-slate-100 space-y-2.5">
          <Link
            href="/student/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#10164F] text-xs font-extrabold transition-all cursor-pointer"
          >
            <span>Student Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>

          <Link
            href="/discover"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Discover PGs</span>
          </Link>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Local demo sandbox &bull; No live DB</span>
          </div>
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
            href="/student/dashboard"
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-[#10164F] hover:bg-slate-200 transition-all ml-auto"
          >
            <span>Student View</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </Link>
        </div>
      </div>
    </>
  );
}

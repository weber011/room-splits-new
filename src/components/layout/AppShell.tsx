"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNavigation } from "@/components/common/MobileBottomNavigation";

const STANDALONE_AUTH_ROUTES = [
  "/welcome",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_AUTH_ROUTES.includes(pathname);

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] text-[#1F2937] font-sans antialiased">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1F2937] flex flex-col antialiased pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileBottomNavigation />
    </div>
  );
}

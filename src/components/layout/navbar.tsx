"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo, BrandButton } from "@/components/brand";
import { createClient } from "@/lib/supabase/client";
import { signOutAction } from "@/app/actions/auth.actions";
import { Menu, X, ArrowRight, Building2, LogOut, LayoutDashboard, Bell } from "lucide-react";
import { NotificationBell } from "@/components/common/NotificationBell";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string; id: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Check initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen to reactive auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xl transition-all shadow-xs">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <div className="shrink-0">
          <Logo size="md" href="/" showTagline />
        </div>

        {/* Centre: Main Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link
            href="/discover"
            className="text-sm font-bold text-[#10164F] hover:text-[#3129C8] transition-colors"
          >
            Discover PGs
          </Link>
          <Link
            href="/student/dashboard"
            className="text-sm font-bold text-[#10164F] hover:text-[#3129C8] transition-colors"
          >
            Student Dashboard
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm font-bold text-[#10164F] hover:text-[#3129C8] transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/#about-us"
            className="text-sm font-bold text-[#10164F] hover:text-[#3129C8] transition-colors"
          >
            About Us
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <NotificationBell />
              <Link href="/account">
                <button className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#10164F] bg-indigo-50/70 border border-indigo-100 hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer">
                  <LayoutDashboard className="w-4 h-4 text-[#3129C8]" />
                  <span>Dashboard</span>
                </button>
              </Link>

              <form action={signOutAction}>
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Sign out of RoomSplits"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/signup?role=owner">
                <button className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#10164F] hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer">
                  <Building2 className="w-4 h-4 text-[#3129C8]" />
                  <span>List Your Property</span>
                </button>
              </Link>

              <Link href="/login">
                <button className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#10164F] hover:bg-slate-100 transition-colors cursor-pointer">
                  Sign In
                </button>
              </Link>

              <Link href="/signup">
                <BrandButton variant="primary" size="sm">
                  Get Started
                </BrandButton>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu & Quick Actions */}
        <div className="flex sm:hidden items-center gap-1">
          {user && <NotificationBell />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center p-2 rounded-xl text-[#10164F] hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white/98 backdrop-blur-2xl px-5 pt-4 pb-6 space-y-4 shadow-lg animate-fade-in">
          <div className="flex flex-col space-y-3">
            <Link
              href="/discover"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-bold text-[#10164F] hover:text-[#3129C8] py-1.5"
            >
              Discover PGs
            </Link>
            <Link
              href="/student/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-bold text-[#10164F] hover:text-[#3129C8] py-1.5"
            >
              Student Dashboard
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-bold text-[#10164F] hover:text-[#3129C8] py-1.5"
            >
              How It Works
            </Link>
            <Link
              href="/#about-us"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-bold text-[#10164F] hover:text-[#3129C8] py-1.5"
            >
              About Us
            </Link>
            <Link
              href="/signup?role=owner"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-bold text-[#3129C8] hover:text-[#10164F] py-1.5 flex items-center justify-between"
            >
              <span>List Your Property</span>
              <Building2 className="w-4 h-4" />
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            {user ? (
              <>
                <Link href="/notifications" onClick={() => setMobileMenuOpen(false)}>
                  <BrandButton variant="ghost" fullWidth size="default" leftIcon={<Bell className="w-4 h-4 mr-1.5 text-emerald-600" />}>
                    Notifications
                  </BrandButton>
                </Link>
                <Link href="/account" onClick={() => setMobileMenuOpen(false)}>
                  <BrandButton variant="secondary" fullWidth size="default" leftIcon={<LayoutDashboard className="w-4 h-4 mr-1.5" />}>
                    Go to Dashboard
                  </BrandButton>
                </Link>
                <form action={signOutAction}>
                  <BrandButton type="submit" variant="ghost" fullWidth size="default" leftIcon={<LogOut className="w-4 h-4 mr-1.5 text-red-500" />}>
                    Sign Out
                  </BrandButton>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <BrandButton variant="secondary" fullWidth size="default">
                    Sign In
                  </BrandButton>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <BrandButton variant="primary" fullWidth size="default" rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}>
                    Get Started
                  </BrandButton>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

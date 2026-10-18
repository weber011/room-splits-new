import Link from "next/link";
import { Logo } from "@/components/brand";
import { MapPin, Shield, CheckCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#FAFAF7] text-[#64748B] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Brand Overview */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" href="/" showTagline />
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-sm">
              Jharkhand&apos;s modern student accommodation discovery, visit scheduling, and PG stay platform. Built for university students and trustworthy PG owners.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#10164F] pt-2 font-medium">
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-[#3129C8]" />
                <span>Audited Listings</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Zero Brokerage</span>
              </div>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#10164F] tracking-wider uppercase">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/" className="hover:text-[#3129C8] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/discover" className="hover:text-[#3129C8] transition-colors">
                  Discover PGs
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[#3129C8] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/signup?role=owner" className="hover:text-[#3129C8] transition-colors">
                  List Your Property
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#10164F] tracking-wider uppercase">
              Support
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/contact" className="hover:text-[#3129C8] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-[#3129C8] transition-colors">
                  Help Centre
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-[#3129C8] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/welcome" className="hover:text-[#3129C8] transition-colors">
                  Welcome Tour
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Popular Cities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#10164F] tracking-wider uppercase">
              Legal &amp; Cities
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/privacy" className="hover:text-[#3129C8] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#3129C8] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li className="pt-2 text-gray-400 font-normal">
                Supported Hubs:
              </li>
              <li className="text-[11px] text-gray-500 font-normal">
                Ranchi &bull; Dhanbad &bull; Jamshedpur &bull; Bokaro &bull; Hazaribagh
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} RoomSplits. Student Accommodation Discovery.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-[#10164F] transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[#10164F] transition-colors">
              Privacy
            </Link>
            <span className="text-[#3129C8] font-bold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Jharkhand, India
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

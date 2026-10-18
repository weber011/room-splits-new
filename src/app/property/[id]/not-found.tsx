import Link from "next/link";
import { BrandButton } from "@/components/brand/BrandButton";
import { Search, Home, Building2 } from "lucide-react";

export default function PropertyNotFound() {
  return (
    <div className="min-h-[75vh] bg-[#FAFAF7] text-[#1F2937] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 max-w-lg text-center space-y-6 shadow-sm">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3129C8]">
          <Building2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="bg-[#FFF45C] text-[#10164F] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            Listing Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#10164F] tracking-tight">
            Property Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-sm mx-auto">
            The property ID you requested doesn&apos;t match any demo accommodation in our system. You can explore our verified student PGs across Jharkhand.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/discover" className="w-full sm:w-auto">
            <BrandButton variant="primary" size="default" fullWidth rightIcon={<Search className="w-4 h-4 ml-1" />}>
              Browse Properties
            </BrandButton>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <BrandButton variant="outline" size="default" fullWidth rightIcon={<Home className="w-4 h-4 ml-1" />}>
              Back to Home
            </BrandButton>
          </Link>
        </div>
      </div>
    </div>
  );
}

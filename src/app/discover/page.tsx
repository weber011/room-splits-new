"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { propertyService } from "@/services/property.service";
import { Property } from "@/types/property.types";
import { PropertyCard } from "@/components/common/PropertyCard";
import { BrandButton } from "@/components/brand/BrandButton";
import {
  Search,
  MapPin,
  Wallet,
  Bed,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Building2,
  X,
  Loader2,
} from "lucide-react";

// Supported Filter Constants
const SUPPORTED_CITIES = [
  "Ranchi",
  "Dhanbad",
  "Jamshedpur",
  "Bokaro",
  "Hazaribagh",
] as const;

const BUDGET_OPTIONS = [
  { label: "Any Budget", value: "" },
  { label: "Under ₹5,000", value: "under-5000" },
  { label: "₹5,000 – ₹8,000", value: "5000-8000" },
  { label: "₹8,000 – ₹12,000", value: "8000-12000" },
  { label: "₹12,000+", value: "above-12000" },
];

const ROOM_OPTIONS = [
  { label: "Any", value: "" },
  { label: "Single Room", value: "single" },
  { label: "Double Sharing", value: "double" },
  { label: "Triple Sharing", value: "triple" },
];

const SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "Rent: Low to High", value: "price_asc" },
  { label: "Rent: High to Low", value: "price_desc" },
  { label: "Property Name: A–Z", value: "name_asc" },
];

function DiscoverPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial filter values from URL params
  const initialSearch =
    searchParams.get("search") || searchParams.get("locality") || "";
  const initialCity = searchParams.get("city") || "";
  const initialBudget = searchParams.get("budget") || "";
  const initialSharing = searchParams.get("sharing") || "";
  const initialSort = searchParams.get("sort") || "recommended";

  // Filter States
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedBudget, setSelectedBudget] = useState(initialBudget);
  const [selectedSharing, setSelectedSharing] = useState(initialSharing);
  const [selectedSort, setSelectedSort] = useState(initialSort);

  // Data & Loading States
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load published properties from Supabase
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await propertyService.getAllProperties();
      setAllProperties(data);
    } catch (err: unknown) {
      console.error("Failed to load discover properties:", err);
      setErrorMessage("Could not connect to the property catalog. Please check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync state if URL changes externally (e.g. browser back/forward)
  useEffect(() => {
    const urlSearch = searchParams.get("search") || searchParams.get("locality") || "";
    const urlCity = searchParams.get("city") || "";
    const urlBudget = searchParams.get("budget") || "";
    const urlSharing = searchParams.get("sharing") || "";
    const urlSort = searchParams.get("sort") || "recommended";

    setSearchTerm(urlSearch);
    setSelectedCity(urlCity);
    setSelectedBudget(urlBudget);
    setSelectedSharing(urlSharing);
    setSelectedSort(urlSort);
  }, [searchParams]);

  // Update URL search parameters when filters change
  const syncUrlParams = useCallback(
    (newFilters: {
      search?: string;
      city?: string;
      budget?: string;
      sharing?: string;
      sort?: string;
    }) => {
      const params = new URLSearchParams();

      const searchVal = newFilters.search !== undefined ? newFilters.search : searchTerm;
      const cityVal = newFilters.city !== undefined ? newFilters.city : selectedCity;
      const budgetVal = newFilters.budget !== undefined ? newFilters.budget : selectedBudget;
      const sharingVal = newFilters.sharing !== undefined ? newFilters.sharing : selectedSharing;
      const sortVal = newFilters.sort !== undefined ? newFilters.sort : selectedSort;

      if (searchVal.trim()) params.set("search", searchVal.trim());
      if (cityVal) params.set("city", cityVal);
      if (budgetVal) params.set("budget", budgetVal);
      if (sharingVal) params.set("sharing", sharingVal);
      if (sortVal && sortVal !== "recommended") params.set("sort", sortVal);

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [pathname, router, searchTerm, selectedCity, selectedBudget, selectedSharing, selectedSort]
  );

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCity("");
    setSelectedBudget("");
    setSelectedSharing("");
    setSelectedSort("recommended");
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  // Check if any filter is actively applied
  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      selectedCity ||
      selectedBudget ||
      selectedSharing ||
      (selectedSort && selectedSort !== "recommended")
  );

  // Real client-side filtering and sorting
  const filteredProperties = useMemo(() => {
    let result = [...allProperties];

    // 1. Text Search Filter (name, locality, city, landmarks)
    const query = searchTerm.trim().toLowerCase();
    if (query) {
      result = result.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(query);
        const localityMatch = p.location.locality.toLowerCase().includes(query);
        const cityMatch = p.location.city.toLowerCase().includes(query);
        const landmarkMatch = p.location.nearbyLandmarks?.some((l) =>
          l.toLowerCase().includes(query)
        );
        return titleMatch || localityMatch || cityMatch || landmarkMatch;
      });
    }

    // 2. City Filter
    if (selectedCity) {
      result = result.filter(
        (p) => p.location.city.toLowerCase() === selectedCity.toLowerCase()
      );
    }

    // 3. Monthly Budget Filter
    if (selectedBudget) {
      result = result.filter((p) => {
        const rents = [
          p.startingPrice,
          ...(p.roomOptions?.map((r) => r.monthlyRent) || []),
        ];

        switch (selectedBudget) {
          case "under-5000":
            return rents.some((r) => r < 5000);
          case "5000-8000":
            return rents.some((r) => r >= 5000 && r <= 8000);
          case "8000-12000":
            return rents.some((r) => r >= 8000 && r <= 12000);
          case "above-12000":
            return rents.some((r) => r > 12000);
          default:
            return true;
        }
      });
    }

    // 4. Room-Sharing Type Filter
    if (selectedSharing) {
      result = result.filter((p) => {
        if (!p.roomOptions || p.roomOptions.length === 0) return true;
        return p.roomOptions.some(
          (r) => r.sharingType.toLowerCase() === selectedSharing.toLowerCase()
        );
      });
    }

    // 5. Sorting
    switch (selectedSort) {
      case "price_asc":
        result.sort((a, b) => a.startingPrice - b.startingPrice);
        break;
      case "price_desc":
        result.sort((a, b) => b.startingPrice - a.startingPrice);
        break;
      case "name_asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "recommended":
      default:
        // Default seed ordering preserves curated featured order
        break;
    }

    return result;
  }, [allProperties, searchTerm, selectedCity, selectedBudget, selectedSharing, selectedSort]);

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1F2937] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 pb-24 selection:bg-[#3129C8] selection:text-white">
      {/* =====================================================================
          1. HEADER & HERO BANNER
          ===================================================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-[#3129C8] text-xs font-extrabold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student PG & Hostel Discovery in Jharkhand</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#10164F] tracking-tight">
            Find Your Next Home
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] max-w-2xl leading-relaxed">
            Explore comfortable student accommodations across Ranchi, Dhanbad, Jamshedpur, Bokaro, and Hazaribagh with transparent pricing and zero brokerage.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white border border-slate-200 px-4 py-2.5 rounded-2xl text-[#10164F] font-bold shadow-xs shrink-0 self-start md:self-end">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Transparent Pricing &bull; Zero Brokerage</span>
        </div>
      </div>

      {/* =====================================================================
          2. FILTER & SEARCH CONTROLS CONTAINER
          ===================================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-[0_8px_30px_rgba(16,22,79,0.04)] space-y-4">
        {/* Row 1: Search Input & Sort Dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Text Search Input */}
          <div className="md:col-span-8 relative">
            <label htmlFor="discover-search-input" className="sr-only">
              Search by property name, locality, or landmark
            </label>
            <div className="flex items-center gap-2.5 bg-[#FAFAF7] border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-[#3129C8] focus-within:ring-2 focus-within:ring-[#3129C8]/10 transition-all">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                id="discover-search-input"
                type="text"
                placeholder="Search by property name, locality, or landmark..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  syncUrlParams({ search: e.target.value });
                }}
                className="w-full bg-transparent text-xs sm:text-sm font-medium text-[#10164F] placeholder:text-slate-400 outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    syncUrlParams({ search: "" });
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-[#10164F] hover:bg-slate-200/60 transition-colors"
                  aria-label="Clear search input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-4">
            <label htmlFor="discover-sort-select" className="sr-only">
              Sort listings
            </label>
            <div className="flex items-center gap-2 bg-[#FAFAF7] border border-slate-200 rounded-2xl px-3.5 py-3 focus-within:border-[#3129C8] focus-within:ring-2 focus-within:ring-[#3129C8]/10 transition-all">
              <ArrowUpDown className="w-4 h-4 text-[#3129C8] shrink-0" />
              <div className="w-full flex items-center justify-between">
                <span className="text-[10px] uppercase font-extrabold text-[#64748B] tracking-wider shrink-0 mr-2">
                  Sort:
                </span>
                <select
                  id="discover-sort-select"
                  value={selectedSort}
                  onChange={(e) => {
                    setSelectedSort(e.target.value);
                    syncUrlParams({ sort: e.target.value });
                  }}
                  className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#10164F] outline-none cursor-pointer"
                  aria-label="Sort listings"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: City, Budget, Room Sharing & Clear Filters Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center pt-1 border-t border-slate-100">
          {/* City Filter */}
          <div className="lg:col-span-4">
            <label
              htmlFor="discover-city-select"
              className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] block mb-1"
            >
              City
            </label>
            <div className="flex items-center gap-2 bg-[#FAFAF7] border border-slate-200 rounded-2xl px-3.5 py-2.5 focus-within:border-[#3129C8] transition-colors">
              <MapPin className="w-4 h-4 text-[#3129C8] shrink-0" />
              <select
                id="discover-city-select"
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  syncUrlParams({ city: e.target.value });
                }}
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#10164F] outline-none cursor-pointer"
                aria-label="Filter by City"
              >
                <option value="">All Supported Cities</option>
                {SUPPORTED_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Monthly Budget Filter */}
          <div className="lg:col-span-3">
            <label
              htmlFor="discover-budget-select"
              className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] block mb-1"
            >
              Monthly Budget
            </label>
            <div className="flex items-center gap-2 bg-[#FAFAF7] border border-slate-200 rounded-2xl px-3.5 py-2.5 focus-within:border-[#3129C8] transition-colors">
              <Wallet className="w-4 h-4 text-[#3129C8] shrink-0" />
              <select
                id="discover-budget-select"
                value={selectedBudget}
                onChange={(e) => {
                  setSelectedBudget(e.target.value);
                  syncUrlParams({ budget: e.target.value });
                }}
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#10164F] outline-none cursor-pointer"
                aria-label="Filter by Monthly Budget"
              >
                {BUDGET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Room-Sharing Filter */}
          <div className="lg:col-span-3">
            <label
              htmlFor="discover-sharing-select"
              className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] block mb-1"
            >
              Room Sharing
            </label>
            <div className="flex items-center gap-2 bg-[#FAFAF7] border border-slate-200 rounded-2xl px-3.5 py-2.5 focus-within:border-[#3129C8] transition-colors">
              <Bed className="w-4 h-4 text-[#3129C8] shrink-0" />
              <select
                id="discover-sharing-select"
                value={selectedSharing}
                onChange={(e) => {
                  setSelectedSharing(e.target.value);
                  syncUrlParams({ sharing: e.target.value });
                }}
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#10164F] outline-none cursor-pointer"
                aria-label="Filter by Room Sharing"
              >
                {ROOM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="sm:col-span-2 lg:col-span-2 pt-4 sm:pt-0">
            <button
              type="button"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              className={`w-full h-11 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                hasActiveFilters
                  ? "bg-slate-100 hover:bg-slate-200 text-[#10164F] border border-slate-200 active:scale-95"
                  : "bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed opacity-60"
              }`}
              aria-label="Clear all applied filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          3. RESULT COUNT & ACTIVE FILTER PILLS
          ===================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-[#10164F]">
            {filteredProperties.length}{" "}
            {filteredProperties.length === 1 ? "accommodation" : "accommodations"} found
          </span>
          {selectedCity && (
            <span className="text-xs font-semibold text-[#64748B]">
              in {selectedCity}
            </span>
          )}
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[#10164F] font-semibold text-[11px] shadow-2xs">
                <span>&ldquo;{searchTerm}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    syncUrlParams({ search: "" });
                  }}
                  className="hover:text-rose-600 cursor-pointer"
                  aria-label="Remove search filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCity && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[#10164F] font-semibold text-[11px] shadow-2xs">
                <span>City: {selectedCity}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCity("");
                    syncUrlParams({ city: "" });
                  }}
                  className="hover:text-rose-600 cursor-pointer"
                  aria-label="Remove city filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedBudget && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[#10164F] font-semibold text-[11px] shadow-2xs">
                <span>
                  Budget:{" "}
                  {BUDGET_OPTIONS.find((b) => b.value === selectedBudget)?.label}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBudget("");
                    syncUrlParams({ budget: "" });
                  }}
                  className="hover:text-rose-600 cursor-pointer"
                  aria-label="Remove budget filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedSharing && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[#10164F] font-semibold text-[11px] shadow-2xs">
                <span>
                  Sharing:{" "}
                  {ROOM_OPTIONS.find((r) => r.value === selectedSharing)?.label}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSharing("");
                    syncUrlParams({ sharing: "" });
                  }}
                  className="hover:text-rose-600 cursor-pointer"
                  aria-label="Remove room sharing filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleClearFilters}
              className="text-[11px] font-bold text-[#3129C8] hover:underline cursor-pointer ml-1"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* =====================================================================
          4. PROPERTY RESULTS GRID & EMPTY / LOADING STATES
          ===================================================================== */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#3129C8]" />
          <p className="text-xs sm:text-sm font-semibold text-[#64748B]">
            Loading student accommodations in Jharkhand...
          </p>
        </div>
      ) : errorMessage ? (
        /* Database Error State */
        <div className="bg-white rounded-3xl border border-rose-200 p-8 sm:p-14 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
            <X className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-[#10164F]">
              Unable to Load Accommodations
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              {errorMessage}
            </p>
          </div>
          <div className="pt-2">
            <BrandButton variant="primary" size="default" onClick={loadData}>
              Try Again
            </BrandButton>
          </div>
        </div>
      ) : filteredProperties.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-14 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3129C8] mx-auto">
            <Building2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-[#10164F]">
              No Accommodations Match Your Search
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              We couldn&apos;t find any student PGs or hostels with your selected criteria. Try adjusting your budget range, clearing filters, or exploring other supported cities in Jharkhand.
            </p>
          </div>

          <div className="pt-2">
            <BrandButton
              variant="primary"
              size="default"
              onClick={handleClearFilters}
              rightIcon={<RotateCcw className="w-4 h-4 ml-1" />}
            >
              Clear All Filters
            </BrandButton>
          </div>
        </div>
      ) : (
        /* Property Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {/* =====================================================================
          5. CITY QUICK FILTER SHORTCUTS (Footer helper)
          ===================================================================== */}
      <div className="pt-8 border-t border-slate-200/80 text-center space-y-3">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
          Quick browse by city:
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {SUPPORTED_CITIES.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                setSelectedCity(city);
                syncUrlParams({ city });
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCity === city
                  ? "bg-[#3129C8] text-white shadow-xs"
                  : "bg-white hover:bg-slate-100 border border-slate-200 text-[#10164F]"
              }`}
            >
              {city}
            </button>
          ))}
          {selectedCity && (
            <button
              type="button"
              onClick={() => {
                setSelectedCity("");
                syncUrlParams({ city: "" });
              }}
              className="text-xs font-bold text-[#3129C8] hover:underline px-2 py-1"
            >
              All Cities
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center py-24">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#3129C8]" />
            <p className="text-xs font-semibold text-[#64748B]">
              Loading discovery portal...
            </p>
          </div>
        </div>
      }
    >
      <DiscoverPageContent />
    </Suspense>
  );
}

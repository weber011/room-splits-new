import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { propertyService } from "@/services/property.service";
import { PropertyImageGallery } from "@/components/common/PropertyImageGallery";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { AmenityBadge } from "@/components/common/AmenityBadge";
import { Card } from "@/components/ui/card";
import { RoomSelectionSection } from "@/components/property/RoomSelectionSection";
import { PropertyDetailHeaderActions } from "@/components/property/PropertyDetailHeaderActions";
import { PropertyActionSidebar } from "@/components/property/PropertyActionSidebar";
import {
  MapPin,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const property = await propertyService.getPropertyById(resolvedParams.id);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://roomsplits.com";

  if (!property) {
    return {
      title: "Property Not Found | RoomSplits",
      description: "The requested property listing could not be found.",
    };
  }

  const title = `${property.title} - ${property.category.toUpperCase()} in ${property.location.locality}, ${property.location.city} | RoomSplits`;
  const description = `${property.description.slice(0, 160)}... Starting at ₹${property.startingPrice.toLocaleString("en-IN")}/mo. Student PG & hostel in ${property.location.city}.`;
  const propertyUrl = `${baseUrl}/property/${property.id}`;
  const ogImage =
    property.coverImage || property.images[0] || `${baseUrl}/og-image.jpg`;

  return {
    title,
    description,
    keywords: [
      property.title,
      `${property.category} in ${property.location.city}`,
      `${property.category} in ${property.location.locality}`,
      `PG for ${property.genderPolicy}`,
      "RoomSplits student accommodation",
    ],
    openGraph: {
      title,
      description,
      url: propertyUrl,
      siteName: "RoomSplits",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const property = await propertyService.getPropertyById(resolvedParams.id);

  if (!property) {
    notFound();
  }

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SingleFamilyResidence",
    name: property.title,
    description: property.description,
    image: property.images,
    address: {
      "@type": "PostalAddress",
      addressLocality: property.location.locality,
      addressRegion: property.location.state || "Jharkhand",
      postalCode: property.location.pincode,
      addressCountry: "IN",
    },
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1F2937] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 pb-24 selection:bg-[#3129C8] selection:text-white">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#64748B]">
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 font-bold text-[#3129C8] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover PGs</span>
        </Link>

        <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto">
          <Link href="/" className="hover:text-[#3129C8]">
            Home
          </Link>
          <span>/</span>
          <Link href="/discover" className="hover:text-[#3129C8]">
            Discover
          </Link>
          <span>/</span>
          <Link
            href={`/discover?city=${encodeURIComponent(property.location.city)}`}
            className="hover:text-[#3129C8]"
          >
            {property.location.city}
          </Link>
          <span>/</span>
          <span className="text-[#10164F] font-bold truncate max-w-xs">
            {property.title}
          </span>
        </nav>
      </div>

      {/* Header Info: Title, Badges, Pricing & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/80 pb-6">
        <div className="space-y-3">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {property.verified ? (
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Verified PG</span>
              </span>
            ) : property.id.startsWith("prop-") ? (
              <span className="bg-[#FFF45C] text-[#10164F] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                Demo Listing
              </span>
            ) : (
              <span className="bg-indigo-50 border border-indigo-200 text-[#3129C8] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                Active Listing
              </span>
            )}

            <span className="bg-white border border-slate-200 text-[#10164F] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
              {property.genderPolicy === "boys"
                ? "Boys Only"
                : property.genderPolicy === "girls"
                ? "Girls Only"
                : "Co-Ed Stay"}
            </span>

            <span className="bg-indigo-50 border border-indigo-100 text-[#3129C8] text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              {property.category.toUpperCase()}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl font-black text-[#10164F] tracking-tight">
            {property.title}
          </h1>

          {/* Location */}
          <p className="text-xs sm:text-sm text-[#64748B] flex items-center gap-1.5 font-medium">
            <MapPin className="h-4 w-4 text-[#3129C8] shrink-0" />
            <span>
              {property.location.locality}, {property.location.city}
              {property.location.state ? `, ${property.location.state}` : ""}
              {property.location.pincode ? ` - ${property.location.pincode}` : ""}
            </span>
          </p>
        </div>

        {/* Header Right: Price & Interactive Actions (Save & Share) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
          <div>
            <PriceDisplay amount={property.startingPrice} size="lg" />
            <span className="text-[10px] text-slate-400 block -mt-1 font-medium">
              Sample Demo Rent &bull; Zero Brokerage
            </span>
          </div>

          <PropertyDetailHeaderActions
            propertyTitle={property.title}
            propertyId={property.id}
          />
        </div>
      </div>

      {/* Photo Gallery Component */}
      <PropertyImageGallery
        images={property.images}
        title={property.title}
      />

      {/* Main Grid: 2 Columns (Content Details vs Right Sticky Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
        {/* Left Column: Details & Information */}
        <div className="lg:col-span-2 space-y-10">
          {/* About the Property */}
          <section className="space-y-3">
            <h3 className="text-xl sm:text-2xl font-black text-[#10164F]">
              About the Accommodation
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
              {property.description}
            </p>
          </section>

          {/* Interactive Room Selection Section */}
          <RoomSelectionSection
            roomOptions={property.roomOptions}
            startingPrice={property.startingPrice}
          />

          {/* Amenities & Services */}
          <section className="space-y-3">
            <h3 className="text-xl sm:text-2xl font-black text-[#10164F]">
              Included Amenities &amp; Facilities
            </h3>
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex flex-wrap gap-2.5">
                {property.amenities.map((amenity) => (
                  <AmenityBadge key={amenity} name={amenity} showIcon />
                ))}
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                All amenities listed are standard demo inclusions verified for this sample accommodation.
              </p>
            </div>
          </section>

          {/* House Rules & Stay Terms */}
          <section className="space-y-3">
            <h3 className="text-xl sm:text-2xl font-black text-[#10164F]">
              House Rules &amp; Stay Terms
            </h3>
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 space-y-3 text-xs text-slate-700 shadow-2xs">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
                <div>
                  <span className="font-semibold text-slate-500 block text-[11px]">
                    Lock-in Period
                  </span>
                  <strong className="text-[#10164F] font-black text-sm">
                    {property.lockInMonths} Months
                  </strong>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block text-[11px]">
                    Notice Period
                  </span>
                  <strong className="text-[#10164F] font-black text-sm">
                    {property.noticePeriodDays} Days
                  </strong>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B] block">
                  Property Guidelines
                </span>
                <ul className="space-y-2 text-xs">
                  {property.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#3129C8] shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Neighborhood & Locality Card */}
          <section className="space-y-3">
            <h3 className="text-xl sm:text-2xl font-black text-[#10164F]">
              Locality &amp; Campus Proximity
            </h3>
            <Card className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-4 shadow-2xs text-left">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#3129C8]" />
                <h4 className="font-extrabold text-[#10164F] text-base">
                  {property.location.locality}, {property.location.city}
                </h4>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Situated in {property.location.locality}, a prime student hub in{" "}
                {property.location.city} with convenient access to nearby colleges, transit stops, and libraries.
              </p>

              {property.location.nearbyLandmarks && property.location.nearbyLandmarks.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B] block">
                    Nearby Landmarks &amp; Campuses
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {property.location.nearbyLandmarks.map((landmark, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[#10164F] text-xs font-semibold"
                      >
                        {landmark}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </section>
        </div>

        {/* Right Column: Sticky Action Sidebar & Host Card */}
        <div className="space-y-6">
          <PropertyActionSidebar property={property} />
        </div>
      </div>
    </div>
  );
}

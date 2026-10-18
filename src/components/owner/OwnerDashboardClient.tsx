"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Property } from "@/types";
import { Card } from "@/components/ui/card";
import { OwnerSidebar, OwnerDashboardTab } from "./OwnerSidebar";
import { OwnerDeleteConfirmModal } from "./OwnerDeleteConfirmModal";
import { OwnerPropertyPreviewModal } from "./OwnerPropertyPreviewModal";
import {
  OwnerProperty,
  OwnerProfile,
  SupportedCity,
  SUPPORTED_JHARKHAND_CITIES,
  AVAILABLE_AMENITIES,
  SAMPLE_PG_IMAGES,
  getOwnerProperties,
  deleteOwnerProperty,
  getOwnerProfile,
  saveOwnerProfile,
  resetOwnerProfile,
  subscribeToOwnerStorage,
} from "@/lib/owner-storage";
import {
  createPropertyAction,
  updatePropertyAction,
  deletePropertyAction,
  RoomInput,
  RoomSharingType,
} from "@/app/actions/property.actions";
import { PropertyImageUploader } from "./PropertyImageUploader";
import {
  Building2,
  PlusCircle,
  CalendarCheck,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  Info,
  Sparkles,
  ExternalLink,
  Save,
  RotateCcw,
  ArrowRight,
  X,
} from "lucide-react";

export interface OwnerDashboardClientProps {
  initialProperties?: Property[];
  seedProperties?: Property[];
  isOwnerVerified?: boolean;
  ownerBusinessName?: string;
}

export function OwnerDashboardClient({
  initialProperties = [],
  seedProperties = [],
  isOwnerVerified = false,
  ownerBusinessName,
}: OwnerDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<OwnerDashboardTab>("overview");
  const [mounted, setMounted] = useState(false);
  const [ownerProperties, setOwnerProperties] = useState<OwnerProperty[]>([]);
  const [profile, setProfile] = useState<OwnerProfile>({
    displayName: "",
    contactPreference: "phone",
    contactValue: "",
    primaryCity: "Ranchi",
  });

  // Modal states
  const [previewProperty, setPreviewProperty] = useState<OwnerProperty | null>(null);
  const [deleteTargetProperty, setDeleteTargetProperty] = useState<OwnerProperty | null>(null);

  // Form states
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form fields
  const [formData, setFormData] = useState({
    title: "",
    city: "Ranchi" as SupportedCity,
    locality: "",
    address: "",
    description: "",
    monthlyRent: "",
    securityDeposit: "",
    genderPolicy: "boys" as "boys" | "girls" | "co-ed",
    roomTypes: ["Single Room", "Double Sharing"] as string[],
    amenities: [
      "High-Speed Wi-Fi",
      "3x Daily Meals",
      "Power Backup",
      "Attached Bathroom",
    ] as string[],
    coverImage: SAMPLE_PG_IMAGES[0],
    customImageUrl: "",
    status: "demo_published" as "draft" | "demo_published",
  });

  // Profile Form states
  const [profileFormData, setProfileFormData] = useState<OwnerProfile>({
    displayName: "",
    contactPreference: "phone",
    contactValue: "",
    primaryCity: "Ranchi",
  });
  const [profileSuccessMessage, setProfileSuccessMessage] = useState(false);

  // Initial client hydration
  useEffect(() => {
    setMounted(true);
    const dbProps: OwnerProperty[] = initialProperties.map((p) => {
      const roomTypes =
        p.roomOptions && p.roomOptions.length > 0
          ? p.roomOptions.map((r) => {
              if (r.sharingType === "single") return "Single Room";
              if (r.sharingType === "double") return "Double Sharing";
              if (r.sharingType === "triple") return "Triple Sharing";
              return "Four+ Sharing";
            })
          : ["Single Room", "Double Sharing"];

      return {
        id: p.id,
        title: p.title,
        city: (p.location.city as SupportedCity) || "Ranchi",
        locality: p.location.locality,
        address: p.location.address,
        description: p.description,
        monthlyRent: p.startingPrice,
        securityDeposit: p.roomOptions?.[0]?.securityDeposit,
        genderPolicy: (p.genderPolicy === "unisex" ? "co-ed" : p.genderPolicy) as "boys" | "girls" | "co-ed",
        roomTypes,
        amenities: p.amenities,
        images: p.images,
        coverImage: p.coverImage || p.images[0],
        status: p.verified ? "demo_published" : "draft",
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        isDemoOwner: true,
      };
    });

    const loadedProps = dbProps.length > 0 ? dbProps : getOwnerProperties();
    const loadedProfile = getOwnerProfile();
    if (ownerBusinessName) {
      loadedProfile.displayName = ownerBusinessName;
    }
    setOwnerProperties(loadedProps);
    setProfile(loadedProfile);
    setProfileFormData(loadedProfile);

    const unsubscribe = subscribeToOwnerStorage(() => {
      if (dbProps.length === 0) {
        setOwnerProperties(getOwnerProperties());
      }
      const p = getOwnerProfile();
      setProfile(p);
    });

    return unsubscribe;
  }, [initialProperties, ownerBusinessName]);

  // Reset form to blank defaults
  const resetForm = () => {
    setEditingPropertyId(null);
    setFormData({
      title: "",
      city: "Ranchi",
      locality: "",
      address: "",
      description: "",
      monthlyRent: "",
      securityDeposit: "",
      genderPolicy: "boys",
      roomTypes: ["Single Room", "Double Sharing"],
      amenities: [
        "High-Speed Wi-Fi",
        "3x Daily Meals",
        "Power Backup",
        "Attached Bathroom",
      ],
      coverImage: SAMPLE_PG_IMAGES[0],
      customImageUrl: "",
      status: "demo_published",
    });
    setFormErrors({});
  };

  // Start editing a property
  const handleStartEdit = (property: OwnerProperty) => {
    setEditingPropertyId(property.id);
    setFormData({
      title: property.title,
      city: property.city,
      locality: property.locality,
      address: property.address,
      description: property.description,
      monthlyRent: property.monthlyRent.toString(),
      securityDeposit: property.securityDeposit ? property.securityDeposit.toString() : "",
      genderPolicy: property.genderPolicy,
      roomTypes: property.roomTypes,
      amenities: property.amenities,
      coverImage: property.coverImage,
      customImageUrl: SAMPLE_PG_IMAGES.includes(property.coverImage) ? "" : property.coverImage,
      status: property.status,
    });
    setFormErrors({});
    setActiveTab("add-property");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    resetForm();
    setActiveTab("properties");
  };

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim() || formData.title.trim().length < 4) {
      errors.title = "Property name must be at least 4 characters long.";
    }

    if (!SUPPORTED_JHARKHAND_CITIES.includes(formData.city)) {
      errors.city = "Please select a supported Jharkhand city.";
    }

    if (!formData.locality.trim() || formData.locality.trim().length < 2) {
      errors.locality = "Locality is required (e.g. Lalpur, Hirapur).";
    }

    if (!formData.description.trim() || formData.description.trim().length < 15) {
      errors.description = "Please provide at least 15 characters describing the stay.";
    }

    const rentNum = Number(formData.monthlyRent);
    if (!formData.monthlyRent || isNaN(rentNum) || rentNum <= 0) {
      errors.monthlyRent = "Monthly rent must be a positive valid number.";
    }

    if (formData.roomTypes.length === 0) {
      errors.roomTypes = "Select at least one room-sharing configuration.";
    }

    if (formData.amenities.length === 0) {
      errors.amenities = "Select at least one amenity provided by this stay.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit property form (Add or Edit) backed by real Supabase Server Actions
  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    setFormSuccessMessage(null);

    const imageToUse =
      formData.customImageUrl.trim() || formData.coverImage || SAMPLE_PG_IMAGES[0];

    const rentNum = Number(formData.monthlyRent);
    const depositNum = formData.securityDeposit ? Number(formData.securityDeposit) : 0;

    const roomInputs: RoomInput[] = formData.roomTypes.map((type) => {
      let sharingType: RoomSharingType = "single";
      let totalBeds = 1;
      let hasBath = true;
      if (type.includes("Double")) {
        sharingType = "double";
        totalBeds = 2;
      } else if (type.includes("Triple")) {
        sharingType = "triple";
        totalBeds = 3;
        hasBath = false;
      } else if (type.includes("Four")) {
        sharingType = "four_plus";
        totalBeds = 4;
        hasBath = false;
      }
      return {
        sharingType,
        monthlyRent: rentNum,
        securityDeposit: depositNum,
        totalBeds,
        availableBeds: totalBeds,
        hasAttachedBathroom: hasBath,
        hasBalcony: false,
      };
    });

    try {
      if (editingPropertyId) {
        // Update via Supabase Server Action
        const result = await updatePropertyAction(editingPropertyId, {
          title: formData.title.trim(),
          description: formData.description.trim(),
          city: formData.city,
          locality: formData.locality.trim(),
          exactAddress: formData.address.trim() || `${formData.locality}, ${formData.city}`,
          monthlyRent: rentNum,
          securityDeposit: depositNum,
          genderPolicy: formData.genderPolicy,
          rooms: roomInputs,
          amenities: formData.amenities,
          coverImage: imageToUse,
          status: formData.status === "demo_published" ? "published" : "draft",
        });

        if (!result.success) {
          setFormErrors({ submit: result.error || "Failed to update property in database." });
          setIsSubmitting(false);
          return;
        }

        setFormSuccessMessage(`Listing "${formData.title}" updated successfully in database!`);
        setOwnerProperties((prev) =>
          prev.map((item) =>
            item.id === editingPropertyId
              ? {
                  ...item,
                  title: formData.title.trim(),
                  city: formData.city,
                  locality: formData.locality.trim(),
                  address: formData.address.trim(),
                  description: formData.description.trim(),
                  monthlyRent: rentNum,
                  securityDeposit: depositNum,
                  genderPolicy: formData.genderPolicy,
                  roomTypes: formData.roomTypes,
                  amenities: formData.amenities,
                  images: [imageToUse],
                  coverImage: imageToUse,
                  status: formData.status,
                  updatedAt: new Date().toISOString(),
                }
              : item
          )
        );
      } else {
        // Create via Supabase Server Action
        const result = await createPropertyAction({
          title: formData.title.trim(),
          description: formData.description.trim(),
          city: formData.city,
          locality: formData.locality.trim(),
          exactAddress: formData.address.trim() || `${formData.locality}, ${formData.city}`,
          monthlyRent: rentNum,
          securityDeposit: depositNum,
          genderPolicy: formData.genderPolicy,
          rooms: roomInputs,
          amenities: formData.amenities,
          coverImage: imageToUse,
          status: formData.status === "demo_published" ? "published" : "draft",
        });

        if (!result.success) {
          setFormErrors({ submit: result.error || "Failed to create property in database." });
          setIsSubmitting(false);
          return;
        }

        const newId = result.propertyId || `prop-${Date.now()}`;
        setFormSuccessMessage(`Listing "${formData.title}" created successfully in database!`);

        const newProperty: OwnerProperty = {
          id: newId,
          title: formData.title.trim(),
          city: formData.city,
          locality: formData.locality.trim(),
          address: formData.address.trim(),
          description: formData.description.trim(),
          monthlyRent: rentNum,
          securityDeposit: depositNum,
          genderPolicy: formData.genderPolicy,
          roomTypes: formData.roomTypes,
          amenities: formData.amenities,
          images: [imageToUse],
          coverImage: imageToUse,
          status: formData.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDemoOwner: true,
        };
        setOwnerProperties((prev) => [newProperty, ...prev]);
      }

      resetForm();
      setActiveTab("properties");
      setTimeout(() => setFormSuccessMessage(null), 4000);
    } catch (err: unknown) {
      setFormErrors({ submit: (err as Error)?.message || "Failed to save property." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete property confirmation backed by Server Action
  const handleConfirmDelete = async (id: string) => {
    try {
      const result = await deletePropertyAction(id);
      if (result.success) {
        setOwnerProperties((prev) => prev.filter((p) => p.id !== id));
        setDeleteTargetProperty(null);
        setFormSuccessMessage("Property was deleted from database.");
        setTimeout(() => setFormSuccessMessage(null), 3000);
      } else {
        // Fallback for local demo properties
        deleteOwnerProperty(id);
        setOwnerProperties((prev) => prev.filter((p) => p.id !== id));
        setDeleteTargetProperty(null);
      }
    } catch {
      deleteOwnerProperty(id);
      setOwnerProperties((prev) => prev.filter((p) => p.id !== id));
      setDeleteTargetProperty(null);
    }
  };

  // Profile submit
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveOwnerProfile(profileFormData);
    setProfile(updated);
    setProfileSuccessMessage(true);
    setTimeout(() => setProfileSuccessMessage(false), 3000);
  };

  const handleProfileReset = () => {
    resetOwnerProfile();
    const reset = getOwnerProfile();
    setProfile(reset);
    setProfileFormData(reset);
  };

  // Room type toggle
  const toggleRoomType = (type: string) => {
    setFormData((prev) => {
      const exists = prev.roomTypes.includes(type);
      return {
        ...prev,
        roomTypes: exists
          ? prev.roomTypes.filter((t) => t !== type)
          : [...prev.roomTypes, type],
      };
    });
  };

  // Amenity toggle
  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const ownerDisplayName = profile.displayName.trim()
    ? profile.displayName.trim()
    : "Property Partner";

  const totalManagedCount = mounted ? seedProperties.length + ownerProperties.length : seedProperties.length;
  const ownerCreatedCount = mounted ? ownerProperties.length : 0;
  const draftListingsCount = mounted ? ownerProperties.filter((p) => p.status === "draft").length : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Responsive Left Navigation */}
      <OwnerSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        myPropertiesCount={ownerCreatedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full space-y-8">
        {/* Success Alert Banner */}
        {formSuccessMessage && (
          <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs font-bold animate-fade-in shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{formSuccessMessage}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW (TASK 2) */}
        {/* ======================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* Top Welcome Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-white to-amber-50/30 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#10164F] text-[#FFF45C] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                      Demo Owner Workspace
                    </span>
                    {isOwnerVerified ? (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Partner
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                        <Info className="w-3 h-3 text-amber-600" />
                        Verification Pending
                      </span>
                    )}
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      Zero Commission
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#10164F] tracking-tight">
                    Welcome, {ownerDisplayName} 👋
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xl font-medium">
                    Manage your student PG listings, configure room capacities, and
                    preview your properties across Ranchi, Dhanbad, Jamshedpur, Bokaro,
                    and Hazaribagh.
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab("add-property");
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#3129C8] hover:bg-[#251fa3] text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add New PG</span>
                  </button>
                </div>
              </div>

              {/* Informational banner about Demo state */}
              <div className="flex items-start gap-2.5 bg-indigo-50/70 border border-indigo-200/60 rounded-2xl p-3 text-[11px] text-indigo-950 font-medium">
                <Info className="w-4 h-4 text-[#3129C8] shrink-0 mt-0.5" />
                <p>
                  <strong>Owner Demo Sandbox:</strong> Any properties you create or
                  edit are saved in your current browser&apos;s local storage. They
                  remain strictly separate from shared seed listings and are not
                  uploaded to an external database.
                </p>
              </div>
            </div>

            {/* Overview Summary Cards (TASK 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Stat 1: Total Demo Listings */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Total Demo Listings
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#3129C8] flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-[#10164F] tracking-tight">
                  {totalManagedCount}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  {ownerCreatedCount} created by you &bull; {seedProperties.length} reference
                </p>
              </div>

              {/* Stat 2: Created by You */}
              <button
                type="button"
                onClick={() => setActiveTab("properties")}
                className="text-left bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:border-[#3129C8]/40 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-[#3129C8] transition-colors">
                    My Created PGs
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-[#10164F] tracking-tight">
                  {ownerCreatedCount}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Locally managed in this browser
                </p>
              </button>

              {/* Stat 3: Draft Listings */}
              <button
                type="button"
                onClick={() => setActiveTab("properties")}
                className="text-left bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:border-[#3129C8]/40 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-[#3129C8] transition-colors">
                    Draft Listings
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Edit3 className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-[#10164F] tracking-tight">
                  {draftListingsCount}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Unpublished drafts in local store
                </p>
              </button>

              {/* Stat 4: Visit Requests */}
              <button
                type="button"
                onClick={() => setActiveTab("visits")}
                className="text-left bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:border-[#3129C8]/40 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-[#3129C8] transition-colors">
                    Visit Requests
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-[#10164F] tracking-tight">
                  0
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Scheduling unlocks in next phase
                </p>
              </button>
            </div>

            {/* Quick Action Banner */}
            <Card className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#10164F]">
                  List Your Next Accommodation
                </h3>
                <p className="text-xs text-slate-500">
                  Add photos, select available room-sharing capacities, and disclose
                  student amenities without broker interference.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveTab("add-property");
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#10164F] hover:bg-[#1a2266] text-[#FFF45C] text-xs font-black transition-all shrink-0 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Open Property Form</span>
              </button>
            </Card>

            {/* Reference Platform Listings Section (TASK 3) */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Reference Seed Properties (Read-Only)</span>
                  </div>
                  <h2 className="text-xl font-black text-[#10164F]">
                    Jharkhand Platform Listings
                  </h2>
                  <p className="text-xs text-slate-500">
                    These 5 seed properties demonstrate verified marketplace formatting
                    and cannot be edited or deleted by the demo owner.
                  </p>
                </div>

                <Link
                  href="/discover"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-[#10164F] hover:bg-slate-50 text-xs font-extrabold shadow-2xs transition-all shrink-0 cursor-pointer"
                >
                  <span>View in Discovery</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {seedProperties.slice(0, 3).map((property) => (
                  <div
                    key={property.id}
                    className="bg-white rounded-3xl border border-slate-200 p-4 space-y-3 shadow-2xs flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-slate-100">
                        <Image
                          src={property.coverImage || property.images?.[0]}
                          alt={property.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        <span className="absolute top-2.5 left-2.5 bg-[#FFF45C] text-[#10164F] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Reference Seed
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-[#3129C8] uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md">
                          {property.location.city} &bull; {property.location.locality}
                        </span>
                        <h4 className="text-sm font-extrabold text-[#10164F] mt-1 line-clamp-1">
                          {property.title}
                        </h4>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#10164F]">
                        ₹{property.startingPrice.toLocaleString("en-IN")}/mo
                      </span>
                      <Link
                        href={`/property/${property.id}`}
                        className="text-[#3129C8] font-bold hover:underline flex items-center gap-1"
                      >
                        <span>View Public Page</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MY PROPERTIES (TASK 3) */}
        {/* ======================================================== */}
        {activeTab === "properties" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
              <div>
                <h1 className="text-2xl font-black text-[#10164F] tracking-tight flex items-center gap-2">
                  <span>My Demo Properties</span>
                  <span className="text-xs font-black bg-indigo-100 text-[#3129C8] px-2.5 py-0.5 rounded-full">
                    {ownerCreatedCount}
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Manage student accommodations you have created in this browser.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveTab("add-property");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#3129C8] hover:bg-[#251fa3] text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Property</span>
              </button>
            </div>

            {/* List or Empty State */}
            {!mounted || ownerProperties.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-[#3129C8] flex items-center justify-center mx-auto shadow-2xs">
                  <Building2 className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-[#10164F]">
                    No Owner-Created Properties Yet
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                    You haven&apos;t added any demo properties in this session. Use
                    the &quot;Add Property&quot; form to create a simulated listing for
                    Ranchi, Dhanbad, Jamshedpur, Bokaro, or Hazaribagh.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab("add-property");
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#3129C8] hover:bg-[#251fa3] text-white text-xs font-black shadow-sm transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Your First Demo PG</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {ownerProperties.map((property) => (
                    <div
                      key={property.id}
                      className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Photo Banner */}
                        <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                          <Image
                            src={property.coverImage}
                            alt={property.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                          <div className="absolute top-3 left-3 flex gap-1.5">
                            <span
                              className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                property.status === "demo_published"
                                  ? "bg-emerald-500 text-white"
                                  : "bg-amber-400 text-[#10164F]"
                              }`}
                            >
                              {property.status === "demo_published"
                                ? "Demo Published"
                                : "Draft"}
                            </span>
                            <span className="bg-white/90 backdrop-blur-md text-[#10164F] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                              {property.genderPolicy === "boys"
                                ? "Boys"
                                : property.genderPolicy === "girls"
                                ? "Girls"
                                : "Co-Ed"}
                            </span>
                          </div>
                        </div>

                        {/* Body Info */}
                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[10px] font-extrabold text-[#3129C8] uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md">
                              {property.city} &bull; {property.locality}
                            </span>
                            <span className="text-[11px] font-extrabold text-[#10164F]">
                              ₹{property.monthlyRent.toLocaleString("en-IN")}/mo
                            </span>
                          </div>

                          <h3 className="text-base font-extrabold text-[#10164F] line-clamp-1">
                            {property.title}
                          </h3>

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {property.description}
                          </p>

                          {/* Room types */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {property.roomTypes.map((rt) => (
                              <span
                                key={rt}
                                className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                              >
                                {rt}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons (TASK 3: Preview, Edit, Delete) */}
                      <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewProperty(property)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[#10164F] hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#3129C8]" />
                          <span>Preview</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(property)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-[#3129C8] hover:bg-indigo-100 text-xs font-bold transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTargetProperty(property)}
                            className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer"
                            aria-label={`Delete ${property.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ADD / EDIT PROPERTY FORM (TASK 4 & TASK 5) */}
        {/* ======================================================== */}
        {activeTab === "add-property" && (
          <div className="space-y-6 animate-fade-in max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
              <div>
                <h1 className="text-2xl font-black text-[#10164F] tracking-tight flex items-center gap-2">
                  <span>
                    {editingPropertyId ? "Edit Demo PG Listing" : "Add Demo PG Listing"}
                  </span>
                  <span className="text-xs font-black bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                    {editingPropertyId ? "Editing Mode" : "New Accommodation"}
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Fill in the accommodation details. Your listing is saved in your local
                  browser store for instant preview.
                </p>
              </div>

              {editingPropertyId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <Card className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
              <form onSubmit={handleSubmitProperty} className="space-y-8">
                {formErrors.submit && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <X className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{formErrors.submit}</span>
                  </div>
                )}

                {/* Section 1: Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-[#10164F] uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#3129C8]" />
                    <span>Basic Property Information</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Title */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label
                        htmlFor="form-title"
                        className="text-xs font-extrabold text-[#10164F] block"
                      >
                        Accommodation Name *
                      </label>
                      <input
                        id="form-title"
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="e.g. Royal Greens Student Living"
                        className={`w-full px-4 py-2.5 rounded-2xl border text-xs sm:text-sm text-[#10164F] focus:outline-none focus:ring-2 focus:ring-[#3129C8]/20 font-medium ${
                          formErrors.title
                            ? "border-rose-400 bg-rose-50/20"
                            : "border-slate-200 focus:border-[#3129C8]"
                        }`}
                      />
                      {formErrors.title && (
                        <p className="text-[11px] text-rose-600 font-bold">
                          {formErrors.title}
                        </p>
                      )}
                    </div>

                    {/* City */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="form-city"
                        className="text-xs font-extrabold text-[#10164F] block"
                      >
                        City (Jharkhand Hub) *
                      </label>
                      <select
                        id="form-city"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            city: e.target.value as SupportedCity,
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-[#10164F] focus:outline-none focus:ring-2 focus:ring-[#3129C8]/20 focus:border-[#3129C8] font-medium bg-white"
                      >
                        {SUPPORTED_JHARKHAND_CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Locality */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="form-locality"
                        className="text-xs font-extrabold text-[#10164F] block"
                      >
                        Locality / Area *
                      </label>
                      <input
                        id="form-locality"
                        type="text"
                        value={formData.locality}
                        onChange={(e) =>
                          setFormData({ ...formData, locality: e.target.value })
                        }
                        placeholder="e.g. Lalpur / Hirapur / Bistupur"
                        className={`w-full px-4 py-2.5 rounded-2xl border text-xs sm:text-sm text-[#10164F] focus:outline-none focus:ring-2 focus:ring-[#3129C8]/20 font-medium ${
                          formErrors.locality
                            ? "border-rose-400 bg-rose-50/20"
                            : "border-slate-200 focus:border-[#3129C8]"
                        }`}
                      />
                      {formErrors.locality && (
                        <p className="text-[11px] text-rose-600 font-bold">
                          {formErrors.locality}
                        </p>
                      )}
                    </div>

                    {/* Address Description */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label
                        htmlFor="form-address"
                        className="text-xs font-extrabold text-[#10164F] block"
                      >
                        Address Description / Landmark Hint
                      </label>
                      <input
                        id="form-address"
                        type="text"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        placeholder="e.g. Near Peace Road, 500m from Nucleus Mall"
                        className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-[#10164F] focus:outline-none focus:ring-2 focus:ring-[#3129C8]/20 focus:border-[#3129C8] font-medium"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label
                        htmlFor="form-desc"
                        className="text-xs font-extrabold text-[#10164F] block"
                      >
                        Accommodation Description *
                      </label>
                      <textarea
                        id="form-desc"
                        rows={3}
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="Describe the rooms, food schedule, study environment, and any house rules..."
                        className={`w-full px-4 py-2.5 rounded-2xl border text-xs sm:text-sm text-[#10164F] focus:outline-none focus:ring-2 focus:ring-[#3129C8]/20 font-medium ${
                          formErrors.description
                            ? "border-rose-400 bg-rose-50/20"
                            : "border-slate-200 focus:border-[#3129C8]"
                        }`}
                      />
                      {formErrors.description && (
                        <p className="text-[11px] text-rose-600 font-bold">
                          {formErrors.description}
                        </p>
                      )}
                    </div>

                    {/* Gender Policy */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="form-gender"
                        className="text-xs font-extrabold text-[#10164F] block"
                      >
                        Resident Policy
                      </label>
                      <select
                        id="form-gender"
                        value={formData.genderPolicy}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            genderPolicy: e.target.value as "boys" | "girls" | "co-ed",
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-[#10164F] focus:outline-none focus:ring-2 focus:ring-[#3129C8]/20 focus:border-[#3129C8] font-medium bg-white"
                      >
                        <option value="boys">Boys Only</option>
                        <option value="girls">Girls Only</option>
                        <option value="co-ed">Co-Ed Accommodation</option>
                      </select>
                    </div>

                    {/* Publication Status */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="form-status"
                        className="text-xs font-extrabold text-[#10164F] block"
                      >
                        Listing Status
                      </label>
                      <select
                        id="form-status"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as "draft" | "demo_published",
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-[#10164F] focus:outline-none focus:ring-2 focus:ring-[#3129C8]/20 focus:border-[#3129C8] font-medium bg-white"
                      >
                        <option value="demo_published">Demo Published (Visible in Preview)</option>
                        <option value="draft">Save as Draft</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Pricing */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-[#10164F] uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#3129C8]" />
                      <span>Pricing &amp; Deposit</span>
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Demo Pricing &bull; Zero Brokerage
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Monthly Rent */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="form-rent"
                        className="text-xs font-extrabold text-[#10164F] block"
                      >
                        Monthly Rent (₹ per bed/room) *
                      </label>
                      <input
                        id="form-rent"
                        type="number"
                        min="500"
                        step="100"
                        value={formData.monthlyRent}
                        onChange={(e) =>
                          setFormData({ ...formData, monthlyRent: e.target.value })
                        }
                        placeholder="e.g. 6500"
                        className={`w-full px-4 py-2.5 rounded-2xl border text-xs sm:text-sm text-[#10164F] focus:outline-none focus:ring-2 focus:ring-[#3129C8]/20 font-medium ${
                          formErrors.monthlyRent
                            ? "border-rose-400 bg-rose-50/20"
                            : "border-slate-200 focus:border-[#3129C8]"
                        }`}
                      />
                      {formErrors.monthlyRent && (
                        <p className="text-[11px] text-rose-600 font-bold">
                          {formErrors.monthlyRent}
                        </p>
                      )}
                    </div>

                    {/* Security Deposit */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="form-deposit"
                        className="text-xs font-extrabold text-[#10164F] block"
                      >
                        Security Deposit (₹, optional)
                      </label>
                      <input
                        id="form-deposit"
                        type="number"
                        min="0"
                        step="100"
                        value={formData.securityDeposit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            securityDeposit: e.target.value,
                          })
                        }
                        placeholder="e.g. 10000"
                        className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-[#10164F] focus:outline-none focus:ring-2 focus:ring-[#3129C8]/20 focus:border-[#3129C8] font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Room Sharing Configurations */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <label className="text-xs font-extrabold text-[#10164F] block">
                    Available Room Sharing Types *
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {["Single Room", "Double Sharing", "Triple Sharing", "Four Sharing"].map(
                      (type) => {
                        const isSelected = formData.roomTypes.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => toggleRoomType(type)}
                            className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-indigo-50 border-[#3129C8] text-[#3129C8] ring-2 ring-[#3129C8]/20"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {type}
                          </button>
                        );
                      }
                    )}
                  </div>
                  {formErrors.roomTypes && (
                    <p className="text-[11px] text-rose-600 font-bold">
                      {formErrors.roomTypes}
                    </p>
                  )}
                </div>

                {/* Section 4: Amenities Checkbox Grid */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <label className="text-xs font-extrabold text-[#10164F] block">
                    Disclosed Student Amenities *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {AVAILABLE_AMENITIES.map((amenity) => {
                      const isChecked = formData.amenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className={`p-3 rounded-2xl text-left text-xs font-semibold border transition-all cursor-pointer flex items-center justify-between ${
                            isChecked
                              ? "bg-indigo-50/60 border-[#3129C8] text-[#10164F]"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span className="line-clamp-1">{amenity}</span>
                          <span
                            className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                              isChecked
                                ? "bg-[#3129C8] text-white"
                                : "border border-slate-300"
                            }`}
                          >
                            {isChecked ? "✓" : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {formErrors.amenities && (
                    <p className="text-[11px] text-rose-600 font-bold">
                      {formErrors.amenities}
                    </p>
                  )}
                </div>

                {/* Section 5: Image Selection & Gallery Uploads */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-[#10164F] block">
                      Accommodation Cover Photo & Gallery
                    </label>
                    <p className="text-xs text-slate-500">
                      {editingPropertyId
                        ? "Manage verified photos and gallery for this accommodation."
                        : "Choose a cover photo, select from verified hostel sample photos, or provide an image web URL."}
                    </p>
                  </div>

                  {editingPropertyId && (
                    <div className="space-y-3 pb-2">
                      <PropertyImageUploader
                        propertyId={editingPropertyId}
                        className="bg-slate-950 border-slate-800 text-slate-100 shadow-none"
                        onImagesChange={(imgs) => {
                          const primary = imgs.find((i) => i.isPrimary) || imgs[0];
                          if (primary) {
                            setFormData((prev) => ({
                              ...prev,
                              coverImage: primary.imageUrl,
                              customImageUrl: "",
                            }));
                          }
                        }}
                      />
                    </div>
                  )}

                  {/* Sample Gallery Grid */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 block">
                      Standard Verified Sample Photos:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {SAMPLE_PG_IMAGES.map((imgUrl, idx) => {
                        const isSelected =
                          formData.coverImage === imgUrl && !formData.customImageUrl;
                        return (
                          <button
                            key={imgUrl}
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                coverImage: imgUrl,
                                customImageUrl: "",
                              })
                            }
                            className={`relative h-24 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#3129C8] ring-2 ring-[#3129C8]/30 scale-102"
                                : "border-transparent opacity-70 hover:opacity-100"
                            }`}
                          >
                            <Image
                              src={imgUrl}
                              alt={`Sample photo ${idx + 1}`}
                              fill
                              className="object-cover"
                              sizes="150px"
                            />
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#3129C8] text-white text-[10px] font-bold flex items-center justify-center">
                                ✓
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional Custom Image URL */}
                  <div className="space-y-1.5 pt-2">
                    <label
                      htmlFor="custom-img"
                      className="text-xs font-bold text-slate-600 block"
                    >
                      Or provide an image web URL:
                    </label>
                    <input
                      id="custom-img"
                      type="url"
                      value={formData.customImageUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customImageUrl: e.target.value,
                        })
                      }
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-[#10164F] focus:outline-none focus:ring-2 focus:ring-[#3129C8]/20 focus:border-[#3129C8] font-medium"
                    />
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3 justify-end">
                  {editingPropertyId ? (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                    >
                      Reset Form
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl bg-[#3129C8] hover:bg-[#251fa3] text-white text-xs font-black shadow-sm transition-all cursor-pointer disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {editingPropertyId
                        ? "Save Changes"
                        : "Save Demo Listing"}
                    </span>
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: VISIT REQUESTS (TASK 7) */}
        {/* ======================================================== */}
        {activeTab === "visits" && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-200/80 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-[#10164F] tracking-tight flex items-center gap-2">
                  <span>Visit Requests</span>
                  <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    Active System
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Prospective student visit schedules and property walkthrough requests.
                </p>
              </div>

              <Link
                href="/owner/visits"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3129C8] hover:bg-[#251fa3] text-white text-xs font-extrabold shadow-sm transition-all"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Open Dedicated Visit Hub</span>
              </Link>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center space-y-5 max-w-lg mx-auto shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                <CalendarCheck className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-[#10164F]">
                  Physical Visit Appointments
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  Review student walkthrough requests, confirm tour appointments, propose alternative time slots, or decline inquiries in your dedicated Owner Visit Management Hub.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/owner/visits"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#3129C8] hover:bg-[#251fa3] text-white text-xs font-black shadow-sm transition-all"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Launch Visit Manager</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setActiveTab("properties")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>View My Properties</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: OWNER PROFILE (TASK 8) */}
        {/* ======================================================== */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-fade-in max-w-3xl">
            <div className="border-b border-slate-200/80 pb-5">
              <h1 className="text-2xl font-black text-[#10164F] tracking-tight flex items-center gap-2">
                <span>Demo Owner Profile</span>
                <span className="text-xs font-black bg-indigo-100 text-[#3129C8] px-2.5 py-0.5 rounded-full">
                  Local Preferences
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Customize your demo partner display name and preferred operating region.
              </p>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 bg-amber-50/70 border border-amber-200/70 rounded-3xl p-4 sm:p-5 text-xs text-amber-950">
              <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-extrabold text-amber-900">
                  Local Demonstration Preferences
                </p>
                <p className="text-amber-800 leading-relaxed font-medium">
                  These profile preferences are saved solely in your local browser
                  storage. They do not constitute verified KYC owner identity or
                  transmit personal documents to an external database.
                </p>
              </div>
            </div>

            {/* Profile Success Feedback */}
            {profileSuccessMessage && (
              <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs font-bold animate-fade-in shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Demo owner preferences saved successfully in local storage!</span>
              </div>
            )}

            {/* Form */}
            <Card className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="space-y-4">
                  {/* Display Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="owner-name"
                      className="text-xs font-extrabold text-[#10164F] block"
                    >
                      Partner / PG Business Name
                    </label>
                    <input
                      id="owner-name"
                      type="text"
                      value={profileFormData.displayName}
                      onChange={(e) =>
                        setProfileFormData({
                          ...profileFormData,
                          displayName: e.target.value,
                        })
                      }
                      placeholder="e.g. Verma Accommodations / Rajesh Sharma"
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-[#10164F] focus:outline-none focus:ring-2 focus:ring-[#3129C8]/20 focus:border-[#3129C8] font-medium"
                    />
                  </div>

                  {/* Primary Operating City */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="owner-city"
                      className="text-xs font-extrabold text-[#10164F] block"
                    >
                      Primary Operating City (Jharkhand)
                    </label>
                    <select
                      id="owner-city"
                      value={profileFormData.primaryCity}
                      onChange={(e) =>
                        setProfileFormData({
                          ...profileFormData,
                          primaryCity: e.target.value as SupportedCity,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-[#10164F] focus:outline-none focus:ring-2 focus:ring-[#3129C8]/20 focus:border-[#3129C8] font-medium bg-white"
                    >
                      {SUPPORTED_JHARKHAND_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Contact Preference */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="owner-contact-pref"
                      className="text-xs font-extrabold text-[#10164F] block"
                    >
                      Preferred Student Inquiry Channel
                    </label>
                    <select
                      id="owner-contact-pref"
                      value={profileFormData.contactPreference}
                      onChange={(e) =>
                        setProfileFormData({
                          ...profileFormData,
                          contactPreference: e.target.value as
                            | "phone"
                            | "whatsapp"
                            | "email",
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-[#10164F] focus:outline-none focus:ring-2 focus:ring-[#3129C8]/20 focus:border-[#3129C8] font-medium bg-white"
                    >
                      <option value="phone">Direct Phone Call</option>
                      <option value="whatsapp">WhatsApp Message</option>
                      <option value="email">Email Notification</option>
                    </select>
                  </div>

                  {/* Contact Value */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="owner-contact-val"
                      className="text-xs font-extrabold text-[#10164F] block"
                    >
                      Demo Contact Number / ID
                    </label>
                    <input
                      id="owner-contact-val"
                      type="text"
                      value={profileFormData.contactValue}
                      onChange={(e) =>
                        setProfileFormData({
                          ...profileFormData,
                          contactValue: e.target.value,
                        })
                      }
                      placeholder="e.g. +91 94311 00000"
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-[#10164F] focus:outline-none focus:ring-2 focus:ring-[#3129C8]/20 focus:border-[#3129C8] font-medium"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleProfileReset}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>

                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-2xl bg-[#3129C8] hover:bg-[#251fa3] text-white text-xs font-black shadow-sm transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Demo Preferences</span>
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <OwnerDeleteConfirmModal
        property={deleteTargetProperty}
        isOpen={Boolean(deleteTargetProperty)}
        onClose={() => setDeleteTargetProperty(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Student View Preview Modal */}
      <OwnerPropertyPreviewModal
        property={previewProperty}
        isOpen={Boolean(previewProperty)}
        onClose={() => setPreviewProperty(null)}
      />
    </div>
  );
}

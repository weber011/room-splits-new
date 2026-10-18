"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerOwnerAction } from "@/app/actions/auth.actions";
import { AuthenticatedUser } from "@/lib/auth-helpers";
import {
  Logo,
  BrandButton,
  BrandInput,
  FormField,
  AuthCard,
  BrandErrorAlert,
  BrandSuccessAlert,
  BrandInfoAlert,
} from "@/components/brand";
import {
  Building2,
  Phone,
  MessageSquare,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";

interface OwnerOnboardingClientProps {
  user: AuthenticatedUser;
}

const SUPPORTED_CITIES = ["Ranchi", "Dhanbad", "Jamshedpur", "Bokaro", "Hazaribagh"];

export function OwnerOnboardingClient({ user }: OwnerOnboardingClientProps) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState(user.phone || "");
  const [whatsapp, setWhatsapp] = useState("");
  const [primaryCity, setPrimaryCity] = useState("Ranchi");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isPending, startTransition] = useTransition();

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!businessName.trim() || businessName.trim().length < 3) {
      errors.businessName = "Please enter your PG or accommodation name (min 3 characters).";
    }
    const cleanPhone = phone.replace(/[\s-]/g, "");
    if (!cleanPhone || !/^\+?[0-9]{10,14}$/.test(cleanPhone)) {
      errors.phone = "Please enter a valid 10-digit mobile number.";
    }
    if (whatsapp.trim()) {
      const cleanWa = whatsapp.replace(/[\s-]/g, "");
      if (!/^\+?[0-9]{10,14}$/.test(cleanWa)) {
        errors.whatsapp = "Please enter a valid 10-digit WhatsApp number.";
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validate()) return;

    const payload = new FormData();
    payload.set("businessName", businessName.trim());
    payload.set("phone", phone.trim());
    payload.set("whatsapp", whatsapp.trim());
    payload.set("primaryCity", primaryCity);

    startTransition(async () => {
      try {
        const result = await registerOwnerAction(payload);
        if (!result.success) {
          setErrorMessage(result.message);
        } else {
          setSuccessMessage(result.message);
          setTimeout(() => {
            router.push("/owner/dashboard");
          }, 1200);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to register owner profile.";
        setErrorMessage(msg);
      }
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Top Bar with Logo & Return Link */}
      <div className="flex items-center justify-between mb-6">
        <Logo size="md" href="/" />
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#10164F]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Student View</span>
        </Link>
      </div>

      <AuthCard>
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#3129C8] mb-1 shadow-xs">
            <Building2 className="w-7 h-7 text-[#10164F]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10164F] tracking-tight">
            Register as a PG Owner
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto">
            Welcome, <span className="font-bold text-[#10164F]">{user.fullName}</span>! List your student accommodation, manage rooms, and receive verified student visit requests in Jharkhand.
          </p>
        </div>

        {/* Verification Notice Alert */}
        <div className="mb-6">
          <BrandInfoAlert title="Verification Notice">
            All PG Owner registrations in Jharkhand start in &apos;Pending Verification&apos; status. RoomSplits admins review property details before public badges are granted.
          </BrandInfoAlert>
        </div>

        {errorMessage && (
          <div className="mb-6">
            <BrandErrorAlert>{errorMessage}</BrandErrorAlert>
          </div>
        )}

        {successMessage && (
          <div className="mb-6">
            <BrandSuccessAlert>{successMessage}</BrandSuccessAlert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            id="businessName"
            label="PG / Accommodation Business Name"
            required
            error={fieldErrors.businessName}
            hint="Example: Sharma Student PG, Oxford Girls Hostel"
          >
            <BrandInput
              id="businessName"
              name="businessName"
              placeholder="e.g. Ranchi Premier Student PG"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                if (fieldErrors.businessName) {
                  setFieldErrors((prev) => ({ ...prev, businessName: "" }));
                }
              }}
              leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
              error={!!fieldErrors.businessName}
              disabled={isPending}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="phone"
              label="Primary Contact Phone"
              required
              error={fieldErrors.phone}
            >
              <BrandInput
                id="phone"
                name="phone"
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (fieldErrors.phone) {
                    setFieldErrors((prev) => ({ ...prev, phone: "" }));
                  }
                }}
                leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                error={!!fieldErrors.phone}
                disabled={isPending}
              />
            </FormField>

            <FormField
              id="whatsapp"
              label="WhatsApp Number (Optional)"
              error={fieldErrors.whatsapp}
            >
              <BrandInput
                id="whatsapp"
                name="whatsapp"
                type="tel"
                placeholder="Optional WhatsApp number"
                value={whatsapp}
                onChange={(e) => {
                  setWhatsapp(e.target.value);
                  if (fieldErrors.whatsapp) {
                    setFieldErrors((prev) => ({ ...prev, whatsapp: "" }));
                  }
                }}
                leftIcon={<MessageSquare className="w-4 h-4 text-slate-400" />}
                error={!!fieldErrors.whatsapp}
                disabled={isPending}
              />
            </FormField>
          </div>

          <FormField
            id="primaryCity"
            label="Primary City in Jharkhand"
            required
            hint="Currently serving 5 major student education hubs in Jharkhand"
          >
            <div className="relative">
              <select
                id="primaryCity"
                name="primaryCity"
                value={primaryCity}
                onChange={(e) => setPrimaryCity(e.target.value)}
                disabled={isPending}
                className="w-full h-11 px-3.5 pl-10 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-[#10164F] focus:outline-none focus:ring-2 focus:ring-[#3129C8]/20 focus:border-[#3129C8] transition-all cursor-pointer"
              >
                {SUPPORTED_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}, Jharkhand
                  </option>
                ))}
              </select>
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </FormField>

          <div className="pt-2">
            <BrandButton
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              disabled={isPending}
              rightIcon={
                isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 ml-2" />
                )
              }
            >
              {isPending ? "Registering Owner Account..." : "Complete PG Owner Registration"}
            </BrandButton>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}

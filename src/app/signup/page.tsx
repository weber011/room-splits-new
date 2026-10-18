"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpAction } from "@/app/actions/auth.actions";
import {
  Logo,
  BrandButton,
  BrandInput,
  PasswordInput,
  FormField,
  GeometricDecorations,
  AuthCard,
  BrandErrorAlert,
  BrandSuccessAlert,
  BrandInfoAlert,
} from "@/components/brand";
import { RoleSelector, UserRoleType } from "@/components/auth/RoleSelector";
import {
  User,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  // Role State
  const [role, setRole] = useState<UserRoleType>("tenant");

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isVerificationPending, setIsVerificationPending] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear specific field error on typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Please enter your full name.";
    }

    if (!formData.email.trim()) {
      errors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (formData.phone.trim() && !/^\+?[0-9]{10,14}$/.test(formData.phone.replace(/[\s-]/g, ""))) {
      errors.phone = "Please enter a valid 10-digit mobile number.";
    }

    if (!formData.password) {
      errors.password = "Please create a password.";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }

    // Confirm password validation (for students)
    if (role === "tenant") {
      if (!formData.confirmPassword) {
        errors.confirmPassword = "Please confirm your password.";
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsVerificationPending(false);

    if (!validateForm()) {
      return;
    }

    const payload = new FormData();
    payload.set("fullName", formData.fullName.trim());
    payload.set("email", formData.email.trim());
    payload.set("phone", formData.phone.trim());
    payload.set("password", formData.password);
    payload.set("role", role);
    if (role === "tenant") {
      payload.set("confirmPassword", formData.confirmPassword);
    }

    startTransition(async () => {
      try {
        const result = await signUpAction(payload);
        if (!result.success) {
          setErrorMessage(result.message);
        } else {
          setSuccessMessage(result.message);

          // Check if message indicates verification pending
          if (result.requiresVerification || result.message.toLowerCase().includes("verify your email")) {
            setIsVerificationPending(true);
          } else {
            // Redirect based on expressed intent: owners must complete onboarding, students go to dashboard
            setTimeout(() => {
              if (role === "owner") {
                router.push("/owner/onboarding");
              } else {
                router.push("/student/dashboard");
              }
            }, 1200);
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "An unexpected error occurred during signup.";
        setErrorMessage(msg);
      }
    });
  };

  return (
    <div className="relative min-h-screen bg-[#FAFAF7] text-[#1F2937] flex flex-col justify-between selection:bg-[#3129C8] selection:text-white">
      {/* Decorative Geometric Shapes */}
      <GeometricDecorations variant="auth" />

      {/* Top Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Logo size="md" href="/" />

        <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
          <span className="hidden sm:inline">Already registered?</span>
          <Link
            href="/login"
            className="text-[#3129C8] hover:underline font-bold px-2 py-1 rounded-lg hover:bg-white/80"
          >
            Sign In →
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col justify-center">
        <AuthCard>
          {/* Header */}
          <div className="text-center space-y-2 mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-[#3129C8] mb-1">
              <User className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10164F] tracking-tight">
              Create Your Account
            </h1>
            <p className="text-sm text-[#64748B]">
              Join RoomSplits and find your perfect stay.
            </p>
          </div>

          {/* Account Type Selector */}
          <div className="space-y-2.5 mb-6">
            <span className="text-xs font-bold text-[#10164F] tracking-tight uppercase">
              Select Account Type
            </span>
            <RoleSelector
              value={role}
              onChange={setRole}
              disabled={isPending}
            />
          </div>

          {/* Status Alerts */}
          {errorMessage && (
            <div className="mb-5">
              <BrandErrorAlert title="Registration Notice">
                {errorMessage}
              </BrandErrorAlert>
            </div>
          )}

          {successMessage && (
            <div className="mb-5">
              <BrandSuccessAlert title="Welcome!">
                {successMessage}
              </BrandSuccessAlert>
            </div>
          )}

          {isVerificationPending && (
            <div className="mb-5">
              <BrandInfoAlert title="Verification Email Dispatched">
                We sent a confirmation link to <strong>{formData.email}</strong>.
                Click the link in your email to activate your account, then sign in.
              </BrandInfoAlert>
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name */}
            <FormField
              id="fullName"
              label="Full Name"
              required
              error={fieldErrors.fullName}
            >
              <BrandInput
                id="fullName"
                name="fullName"
                placeholder={role === "owner" ? "e.g. Rajeshwar Sharma" : "e.g. Aarav Sharma"}
                value={formData.fullName}
                onChange={handleInputChange}
                error={Boolean(fieldErrors.fullName)}
                disabled={isPending}
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
                required
                autoComplete="name"
              />
            </FormField>

            {/* Email Address */}
            <FormField
              id="email"
              label="Email Address"
              required
              error={fieldErrors.email}
            >
              <BrandInput
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleInputChange}
                error={Boolean(fieldErrors.email)}
                disabled={isPending}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                required
                autoComplete="email"
              />
            </FormField>

            {/* Mobile Number */}
            <FormField
              id="phone"
              label="Mobile Number"
              hint={role === "owner" ? "Required for tenant visits" : "Optional (for visit updates)"}
              required={role === "owner"}
              error={fieldErrors.phone}
            >
              <BrandInput
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleInputChange}
                error={Boolean(fieldErrors.phone)}
                disabled={isPending}
                leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                autoComplete="tel"
              />
            </FormField>

            {/* Create Password */}
            <FormField
              id="password"
              label="Create Password"
              hint="Min 6 characters"
              required
              error={fieldErrors.password}
            >
              <PasswordInput
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                error={Boolean(fieldErrors.password)}
                disabled={isPending}
                required
                autoComplete="new-password"
              />
            </FormField>

            {/* Confirm Password (Student Registration) */}
            {role === "tenant" && (
              <FormField
                id="confirmPassword"
                label="Confirm Password"
                required
                error={fieldErrors.confirmPassword}
              >
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={Boolean(fieldErrors.confirmPassword)}
                  disabled={isPending}
                  required
                  autoComplete="new-password"
                />
              </FormField>
            )}

            {/* PG Owner Note */}
            {role === "owner" && (
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Property photos, bed inventory, and address details will be collected
                  during owner onboarding once your account is created.
                </span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <BrandButton
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isPending}
                loadingText="Creating Your Account..."
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Create Account →
              </BrandButton>
            </div>
          </form>

          {/* Bottom Notice & Links */}
          <div className="mt-6 text-center space-y-2 pt-4 border-t border-slate-100">
            <p className="text-xs text-[#64748B]">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[#3129C8] hover:underline">
                Sign In
              </Link>
            </p>

            <p className="text-[11px] text-slate-400">
              By creating an account, you agree to RoomSplits&apos;{" "}
              <Link href="/terms" className="underline hover:text-slate-600">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-slate-600">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </AuthCard>
      </main>

      {/* Footer Minimal */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 py-4 text-center text-[11px] text-[#64748B]">
        RoomSplits • Jharkhand Student PG & Hostel Discovery Platform
      </footer>
    </div>
  );
}

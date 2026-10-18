"use client";

import React, { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInAction } from "@/app/actions/auth.actions";
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
} from "@/components/brand";
import {
  Mail,
  Home,
  ArrowRight,
  Loader2,
  KeyRound,
} from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/discover";

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isPending, startTransition] = useTransition();

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!emailOrPhone.trim()) {
      errors.emailOrPhone = "Please enter your registered email address or mobile number.";
    }
    if (!password) {
      errors.password = "Please enter your password.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validate()) return;

    const payload = new FormData();
    payload.set("email", emailOrPhone.trim());
    payload.set("password", password);

    startTransition(async () => {
      try {
        const res = await signInAction(payload);
        if (!res.success) {
          setErrorMessage(res.message);
        } else {
          setSuccessMessage(res.message);

          // Route according to server-verified user role and sanitized target
          setTimeout(() => {
            const role = res.user?.role;
            const hasOwner = !!res.user?.ownerId || role === "owner";
            const safeRedirect =
              redirectTo &&
              redirectTo.startsWith("/") &&
              !redirectTo.startsWith("//") &&
              !redirectTo.includes("://") &&
              redirectTo !== "/login"
                ? redirectTo
                : null;

            if (safeRedirect) {
              router.push(safeRedirect);
            } else if (role === "admin") {
              router.push("/admin/dashboard");
            } else if (hasOwner) {
              router.push("/owner/dashboard");
            } else {
              router.push("/student/dashboard");
            }
          }, 600);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to sign in. Please verify your credentials.";
        setErrorMessage(msg);
      }
    });
  };

  return (
    <AuthCard>
      {/* Header with Small Accommodation Illustration Badge */}
      <div className="text-center space-y-2 mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#3129C8] mb-1 shadow-sm">
          <div className="relative">
            <Home className="w-7 h-7 text-[#10164F]" />
            <KeyRound className="w-3.5 h-3.5 text-[#3129C8] absolute -bottom-1 -right-1" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10164F] tracking-tight">
          Sign In to RoomSplits
        </h1>
        <p className="text-sm text-[#64748B]">
          Find, save and manage your perfect stay.
        </p>
      </div>

      {/* Status Alerts */}
      {errorMessage && (
        <div className="mb-5">
          <BrandErrorAlert title="Authentication Error">
            {errorMessage}
          </BrandErrorAlert>
        </div>
      )}

      {successMessage && (
        <div className="mb-5">
          <BrandSuccessAlert title="Authenticated">
            {successMessage}
          </BrandSuccessAlert>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} noValidate className="space-y-4">
        {/* Email or Phone */}
        <FormField
          id="emailOrPhone"
          label="Email Address or Mobile Number"
          required
          error={fieldErrors.emailOrPhone}
        >
          <BrandInput
            id="emailOrPhone"
            name="emailOrPhone"
            placeholder="name@example.com or 10-digit number"
            value={emailOrPhone}
            onChange={(e) => {
              setEmailOrPhone(e.target.value);
              if (fieldErrors.emailOrPhone) {
                setFieldErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.emailOrPhone;
                  return copy;
                });
              }
            }}
            error={Boolean(fieldErrors.emailOrPhone)}
            disabled={isPending}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            required
            autoComplete="username"
          />
        </FormField>

        {/* Password */}
        <FormField
          id="password"
          label="Password"
          required
          error={fieldErrors.password}
        >
          <PasswordInput
            id="password"
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.password;
                  return copy;
                });
              }
            }}
            error={Boolean(fieldErrors.password)}
            disabled={isPending}
            required
            autoComplete="current-password"
          />
        </FormField>

        {/* Forgot Password Link */}
        <div className="flex items-center justify-end pt-0.5">
          <Link
            href="/forgot-password"
            className="text-xs font-bold text-[#3129C8] hover:underline transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Primary Sign In Button */}
        <div className="pt-2">
          <BrandButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isPending}
            loadingText="Signing In..."
            rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
          >
            Sign In →
          </BrandButton>
        </div>
      </form>

      {/* Bottom Link: Don't have an account? Sign Up */}
      <div className="mt-6 text-center pt-4 border-t border-slate-100">
        <p className="text-xs text-[#64748B]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-bold text-[#3129C8] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-[#FAFAF7] text-[#1F2937] flex flex-col justify-between selection:bg-[#3129C8] selection:text-white">
      {/* Decorative Geometric Shapes */}
      <GeometricDecorations variant="auth" />

      {/* Top Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Logo size="md" href="/" />

        <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
          <span className="hidden sm:inline">Need an account?</span>
          <Link
            href="/signup"
            className="text-[#3129C8] hover:underline font-bold px-2 py-1 rounded-lg hover:bg-white/80"
          >
            Register Here →
          </Link>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col justify-center">
        <Suspense
          fallback={
            <div className="bg-white rounded-3xl p-10 text-center shadow-md border border-slate-100">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#3129C8] mb-3" />
              <p className="text-xs text-slate-500 font-medium">
                Loading sign in portal...
              </p>
            </div>
          }
        >
          <LoginFormContent />
        </Suspense>
      </main>

      {/* Footer Minimal */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 py-4 text-center text-[11px] text-[#64748B]">
        RoomSplits • Jharkhand Student Accommodation Network
      </footer>
    </div>
  );
}

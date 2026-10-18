"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resetPasswordAction } from "@/app/actions/auth.actions";
import {
  Logo,
  BrandButton,
  PasswordInput,
  FormField,
  GeometricDecorations,
  AuthCard,
  BrandErrorAlert,
  BrandSuccessAlert,
} from "@/components/brand";
import { ArrowLeft, KeyRound, Check } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isPending, startTransition] = useTransition();

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!password) {
      errors.password = "Please enter a new password.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your new password.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleResetPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validate()) return;

    const formData = new FormData();
    formData.set("password", password);

    startTransition(async () => {
      try {
        const res = await resetPasswordAction(formData);
        if (!res.success) {
          setErrorMessage(res.message);
        } else {
          setSuccessMessage(res.message);
          setTimeout(() => {
            router.push("/login");
          }, 1500);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update password.";
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
        <Logo size="md" href="/welcome" />

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#10164F] hover:text-[#3129C8] px-3 py-1.5 rounded-xl hover:bg-white/80 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col justify-center">
        <AuthCard>
          <div className="text-center space-y-2 mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#3129C8] mb-1 shadow-sm">
              <KeyRound className="w-7 h-7 text-[#10164F]" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10164F] tracking-tight">
              Set New Password
            </h1>
            <p className="text-sm text-[#64748B]">
              Enter and confirm your new secure password.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5">
              <BrandErrorAlert title="Reset Error">
                {errorMessage}
              </BrandErrorAlert>
            </div>
          )}

          {successMessage && (
            <div className="mb-5">
              <BrandSuccessAlert title="Password Updated!">
                {successMessage}
              </BrandSuccessAlert>
            </div>
          )}

          <form onSubmit={handleResetPassword} noValidate className="space-y-4">
            <FormField
              id="password"
              label="New Password"
              required
              hint="Min 6 characters"
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
                autoComplete="new-password"
              />
            </FormField>

            <FormField
              id="confirmPassword"
              label="Confirm New Password"
              required
              error={fieldErrors.confirmPassword}
            >
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.confirmPassword;
                      return copy;
                    });
                  }
                }}
                error={Boolean(fieldErrors.confirmPassword)}
                disabled={isPending}
                required
                autoComplete="new-password"
              />
            </FormField>

            <div className="pt-2">
              <BrandButton
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isPending}
                loadingText="Updating Password..."
                rightIcon={<Check className="w-4 h-4 ml-1" />}
              >
                Update Password →
              </BrandButton>
            </div>
          </form>

          <div className="mt-6 text-center pt-4 border-t border-slate-100">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#10164F] font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Cancel and return to Sign In
            </Link>
          </div>
        </AuthCard>
      </main>

      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 py-4 text-center text-[11px] text-[#64748B]">
        RoomSplits • Jharkhand Student PG & Hostel Discovery Platform
      </footer>
    </div>
  );
}

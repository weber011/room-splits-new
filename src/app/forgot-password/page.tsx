"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/app/actions/auth.actions";
import {
  Logo,
  BrandButton,
  BrandInput,
  FormField,
  GeometricDecorations,
  AuthCard,
  BrandErrorAlert,
  BrandSuccessAlert,
} from "@/components/brand";
import { Mail, ArrowLeft, Send, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleForgotPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setFieldError("");

    if (!email.trim()) {
      setFieldError("Please enter your registered email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFieldError("Please enter a valid email address.");
      return;
    }

    const formData = new FormData();
    formData.set("email", email.trim());

    startTransition(async () => {
      try {
        const res = await forgotPasswordAction(formData);
        if (!res.success) {
          setErrorMessage(res.message);
        } else {
          setSuccessMessage(res.message);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to send reset link.";
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
          {/* Header */}
          <div className="text-center space-y-2 mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#3129C8] mb-1 shadow-sm">
              <KeyRound className="w-7 h-7 text-[#10164F]" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10164F] tracking-tight">
              Forgot Password?
            </h1>
            <p className="text-sm text-[#64748B] max-w-xs mx-auto">
              Enter your registered email address and we&apos;ll send a password recovery link.
            </p>
          </div>

          {/* Status Alerts */}
          {errorMessage && (
            <div className="mb-5">
              <BrandErrorAlert title="Notice">
                {errorMessage}
              </BrandErrorAlert>
            </div>
          )}

          {successMessage && (
            <div className="mb-5">
              <BrandSuccessAlert title="Link Dispatched">
                {successMessage}
              </BrandSuccessAlert>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleForgotPassword} noValidate className="space-y-4">
            <FormField
              id="email"
              label="Registered Email Address"
              required
              error={fieldError}
              hint="Check your spam folder if not received"
            >
              <BrandInput
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldError) setFieldError("");
                }}
                error={Boolean(fieldError)}
                disabled={isPending}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                required
                autoComplete="email"
              />
            </FormField>

            <div className="pt-2">
              <BrandButton
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isPending}
                loadingText="Sending Recovery Link..."
                rightIcon={<Send className="w-4 h-4 ml-1" />}
              >
                Send Password Reset Link →
              </BrandButton>
            </div>
          </form>

          {/* Bottom Link */}
          <div className="mt-6 text-center pt-4 border-t border-slate-100">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#10164F] font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Remember your password? Sign In
            </Link>
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

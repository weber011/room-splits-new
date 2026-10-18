"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

export interface AuthActionResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: "student" | "owner" | "admin";
    ownerId?: string;
    isOwnerVerified?: boolean;
  } | null;
  requiresVerification?: boolean;
}

/**
 * Public Sign Up Server Action
 * Creates user in Supabase Auth & inserts corresponding application profile.
 * PRIVILEGE SECURITY: Always assigns initial role as 'student'.
 * Never accepts elevated roles (owner, admin) from the public signup request.
 */
export async function signUpAction(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string | null;
  const fullName = (formData.get("fullName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();

  // Basic validation
  if (!email || !password || !fullName) {
    return { success: false, message: "Full name, email address, and password are required." };
  }

  if (email.length > 150) {
    return { success: false, message: "Email address cannot exceed 150 characters." };
  }

  if (fullName.length < 2 || fullName.length > 100) {
    return { success: false, message: "Full name must be between 2 and 100 characters." };
  }

  if (phone && phone.length > 20) {
    return { success: false, message: "Phone number cannot exceed 20 characters." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: "Please provide a valid email address." };
  }

  if (password.length < 6 || password.length > 100) {
    return { success: false, message: "Password must be between 6 and 100 characters long." };
  }

  if (confirmPassword !== null && password !== confirmPassword) {
    return { success: false, message: "Passwords do not match. Please verify your password." };
  }

  try {
    const supabase = await createClient();

    // 1. Create User in Supabase Auth with metadata (role ALWAYS 'student')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || null,
          role: "student",
        },
      },
    });

    if (error) {
      const lower = error.message.toLowerCase();
      if (lower.includes("already registered") || lower.includes("unique constraint") || error.code === "user_already_exists") {
        return {
          success: false,
          message: "An account with this email address already exists. Please sign in instead.",
        };
      }
      return { success: false, message: error.message };
    }

    if (!data.user) {
      return { success: false, message: "Account creation failed. Please try again." };
    }

    // Check for duplicate user with empty identities (Supabase anti-enumeration feature)
    if (data.user.identities && data.user.identities.length === 0) {
      return {
        success: false,
        message: "An account with this email address already exists. Please sign in instead.",
      };
    }

    // 2. Ensure profile record in public.profiles exists idempotently
    // Handled primarily by the database trigger `on_auth_user_created`
    // Defense-in-depth: idempotent upsert
    try {
      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          full_name: fullName,
          phone: phone || null,
          role: "student",
        },
        { onConflict: "id", ignoreDuplicates: true }
      );
    } catch {
      // Handled by trigger
    }

    revalidatePath("/", "layout");

    // 3. Handle email verification requirements
    // If Supabase has email confirmation enabled, data.session is null
    const hasActiveSession = !!data.session;
    const isVerificationRequired = !hasActiveSession;

    if (isVerificationRequired) {
      return {
        success: true,
        message: "Account created! Please check your email inbox to verify your account before signing in.",
        user: null, // No authenticated session until verified
        requiresVerification: true,
      };
    }

    return {
      success: true,
      message: `Welcome to RoomSplits, ${fullName}! Your student account is ready.`,
      user: {
        id: data.user.id,
        email: data.user.email || email,
        fullName,
        role: "student",
      },
      requiresVerification: false,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Authentication service unreachable";
    console.error("[signUpAction] Error:", msg);
    return {
      success: false,
      message: "An unexpected error occurred during signup. Please try again.",
    };
  }
}

/**
 * Sign In Server Action
 * Authenticates user credentials with Supabase Auth & sets secure session cookies
 */
export async function signInAction(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const lower = error.message.toLowerCase();
      if (lower.includes("invalid login credentials") || lower.includes("invalid_grant")) {
        return {
          success: false,
          message: "Incorrect email address or password. Please verify your credentials.",
        };
      }
      if (lower.includes("email not confirmed")) {
        return {
          success: false,
          message: "Your email address has not been verified yet. Please check your inbox for the confirmation link.",
        };
      }
      if (lower.includes("too many requests") || lower.includes("rate limit")) {
        return {
          success: false,
          message: "Too many login attempts. Please wait a moment before trying again.",
        };
      }
      return {
        success: false,
        message: "Unable to sign in. Please verify your credentials and try again.",
      };
    }

    if (!data.session || !data.user) {
      return {
        success: false,
        message: "Failed to establish an authenticated session. Please try again.",
      };
    }

    // Fetch server-verified user profile & role
    const authUser = await getAuthenticatedUser();
    const userRole = authUser?.role || "student";

    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Signed in successfully!",
      user: {
        id: data.user.id,
        email: data.user.email || email,
        fullName: authUser?.fullName || data.user.user_metadata?.full_name || "User",
        role: userRole,
        ownerId: authUser?.ownerId,
        isOwnerVerified: authUser?.isOwnerVerified,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Authentication service unreachable";
    console.error("[signInAction] Error:", msg);
    return {
      success: false,
      message: "An unexpected error occurred while signing in. Please check your network and try again.",
    };
  }
}

/**
 * Sign Out Server Action
 * Invalidates session and clears cookies
 */
export async function signOutAction(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("[signOutAction] Sign out log:", err);
  }
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Owner Onboarding Server Action
 * Securely associates an owner record with the authenticated user.
 * Verification status is enforced as 'pending' by database triggers.
 */
export async function registerOwnerAction(formData: FormData): Promise<AuthActionResult> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      success: false,
      message: "You must be signed in to register as a PG Owner. Please log in or create an account first.",
    };
  }

  // Check if owner already registered
  if (user.ownerId) {
    return {
      success: true,
      message: "Your owner profile is already registered.",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: "owner",
        ownerId: user.ownerId,
        isOwnerVerified: user.isOwnerVerified,
      },
    };
  }

  const businessName = (formData.get("businessName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const whatsapp = (formData.get("whatsapp") as string)?.trim() || null;
  const primaryCity = (formData.get("primaryCity") as string)?.trim();

  if (!businessName || businessName.length < 3) {
    return { success: false, message: "Please provide a valid PG / Business name (at least 3 characters)." };
  }

  const cleanPhone = phone ? phone.replace(/[\s-]/g, "") : "";
  if (!cleanPhone || !/^\+?[0-9]{10,14}$/.test(cleanPhone)) {
    return { success: false, message: "Please enter a valid 10-digit mobile number." };
  }

  const supportedCities = ["Ranchi", "Dhanbad", "Jamshedpur", "Bokaro", "Hazaribagh"];
  if (!primaryCity || !supportedCities.includes(primaryCity)) {
    return {
      success: false,
      message: `Please select a supported Jharkhand city (${supportedCities.join(", ")}).`,
    };
  }

  try {
    const supabase = await createClient();

    // Insert owner record into public.owners
    // RLS: with check (auth.uid() = user_id)
    // Trigger tr_protect_owner_verification forces verification_status = 'pending', is_verified = false
    const { data: newOwner, error } = await supabase
      .from("owners")
      .insert({
        user_id: user.id,
        business_name: businessName,
        phone: cleanPhone,
        whatsapp: whatsapp ? whatsapp.replace(/[\s-]/g, "") : null,
        primary_city: primaryCity,
        verification_status: "pending",
        is_verified: false,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") { // unique constraint violation on user_id
        return {
          success: true,
          message: "Your PG Owner account is already registered.",
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: "owner",
            ownerId: user.ownerId,
            isOwnerVerified: false,
          },
        };
      }
      console.error("[registerOwnerAction] Insert error:", error);
      return { success: false, message: "Failed to register owner details. Please try again." };
    }

    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Owner profile registered! Your account status is Pending Review by RoomSplits administrators.",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: "owner",
        ownerId: newOwner.id,
        isOwnerVerified: false,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database error";
    console.error("[registerOwnerAction] Error:", msg);
    return { success: false, message: "Unable to save owner profile at this time." };
  }
}

/**
 * Forgot Password Server Action
 * Sends password reset email via Supabase Auth
 */
export async function forgotPasswordAction(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email) {
    return { success: false, message: "Please enter your registered email address." };
  }

  try {
    const supabase = await createClient();
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: "Password reset link sent to your email. Please check your inbox.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Reset service unreachable";
    console.warn("[forgotPasswordAction] Reset log:", msg);
    return {
      success: false,
      message: "Failed to send reset link. Please check your network and try again.",
    };
  }
}

/**
 * Reset Password Server Action
 * Updates user password in Supabase Auth
 */
export async function resetPasswordAction(formData: FormData): Promise<AuthActionResult> {
  const newPassword = formData.get("password") as string;

  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: "Password must be at least 6 characters long." };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: "Password updated successfully! You can now log in.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Update password service unreachable";
    console.warn("[resetPasswordAction] Update log:", msg);
    return {
      success: false,
      message: "Failed to update password. Please try again.",
    };
  }
}

/**
 * Get Authenticated User Profile Action
 */
export async function getAuthUserAction() {
  const user = await getAuthenticatedUser();
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    ownerId: user.ownerId,
    ownerBusinessName: user.ownerBusinessName,
    ownerVerificationStatus: user.ownerVerificationStatus,
    isOwnerVerified: user.isOwnerVerified,
  };
}

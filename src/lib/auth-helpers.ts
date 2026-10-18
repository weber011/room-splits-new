import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type UserRoleEnum = "student" | "owner" | "admin" | "tenant";

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string | null;
  role: "student" | "owner" | "admin";
  ownerId?: string;
  ownerBusinessName?: string;
  ownerVerificationStatus?: "pending" | "verified" | "rejected";
  isOwnerVerified?: boolean;
}

/**
 * Sanitizes redirect URLs to prevent Open Redirect attacks.
 * Only allows safe local relative paths starting with a single '/'.
 */
export function sanitizeRedirectPath(
  url: string | null | undefined,
  fallback: string = "/student/dashboard"
): string {
  if (!url || typeof url !== "string") return fallback;
  const trimmed = url.trim();
  // Must start with '/' and not start with '//' (protocol-relative) or contain scheme '://'
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("://")) {
    return trimmed;
  }
  return fallback;
}

/**
 * Server-side User Retrieval Helper
 * Authenticates user via Supabase Server Auth & resolves their actual database role.
 * NEVER trusts frontend request body user ID or role.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // 1. Fetch server-verified profile from database `profiles` table
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, full_name, phone, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    // 2. Determine true role (Database record takes precedence over metadata)
    const validRoles = ["student", "owner", "admin"] as const;
    let role: "student" | "owner" | "admin" = "student";
    if (profile?.role && validRoles.includes(profile.role as "student" | "owner" | "admin")) {
      role = profile.role as "student" | "owner" | "admin";
    }

    // 3. Check if user has an owner record in `owners` table
    const { data: owner } = await supabase
      .from("owners")
      .select("id, business_name, is_verified, verification_status")
      .eq("user_id", user.id)
      .maybeSingle();

    return {
      id: user.id,
      email: user.email || "",
      fullName: profile?.full_name || user.user_metadata?.full_name || "Student Resident",
      phone: profile?.phone || user.user_metadata?.phone || "",
      avatarUrl: profile?.avatar_url || null,
      role,
      ownerId: owner?.id,
      ownerBusinessName: owner?.business_name,
      ownerVerificationStatus: owner?.verification_status as "pending" | "verified" | "rejected" | undefined,
      isOwnerVerified: owner?.is_verified ?? false,
    };
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "digest" in err &&
      typeof (err as { digest: unknown }).digest === "string" &&
      ((err as { digest: string }).digest.startsWith("NEXT_REDIRECT") ||
        (err as { digest: string }).digest.includes("DYNAMIC_SERVER_USAGE"))
    ) {
      throw err;
    }
    console.warn("[getAuthenticatedUser] Retrieval warning:", err);
    return null;
  }
}

/**
 * Server Guard: Requires any authenticated user session.
 * Redirects unauthenticated requests to login with safe return parameter.
 */
export async function requireAuthenticatedUser(
  redirectTo: string = "/student/dashboard"
): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user) {
    const safeTarget = sanitizeRedirectPath(redirectTo, "/student/dashboard");
    redirect(`/login?redirectTo=${encodeURIComponent(safeTarget)}`);
  }
  return user;
}

/**
 * Server Guard: Requires Student role or above.
 */
export async function requireStudent(
  redirectTo: string = "/student/dashboard"
): Promise<AuthenticatedUser> {
  return requireAuthenticatedUser(redirectTo);
}

/**
 * Server Guard: Requires Owner role or registered owner record.
 * If user is authenticated but has no owner record, redirects to onboarding.
 */
export async function requireOwner(
  onboardingUrl: string = "/owner/onboarding"
): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser("/owner/dashboard");

  // If user is admin, allow access
  if (user.role === "admin") {
    return user;
  }

  // If user does not have an owner entity, redirect to owner onboarding
  if (!user.ownerId) {
    redirect(onboardingUrl);
  }

  return user;
}

/**
 * Server Guard: Requires Admin role strictly.
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();
  if (user.role !== "admin") {
    redirect("/unauthorized");
  }
  return user;
}

/**
 * Non-redirecting admin authorization check for Server Actions.
 * Returns the verified admin user or a clean failure result.
 */
export async function assertAdmin(): Promise<
  | { authorized: true; user: AuthenticatedUser }
  | { authorized: false; error: string }
> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { authorized: false, error: "Please log in to access administrative operations." };
  }
  if (user.role !== "admin") {
    return { authorized: false, error: "Access denied: Administrator privileges required." };
  }
  return { authorized: true, user };
}

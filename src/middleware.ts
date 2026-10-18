import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { sanitizeRedirectPath } from "@/lib/auth-helpers";

export async function middleware(request: NextRequest) {
  // 1. Maintain and refresh Supabase auth session cookies
  const { supabaseResponse, user } = await updateSession(request);

  const pathname = request.nextUrl.pathname;

  // 2. Identify protected route categories
  const isProtectedStudentRoute =
    pathname.startsWith("/student/dashboard") || pathname.startsWith("/account");
  const isProtectedOwnerRoute = pathname.startsWith("/owner");
  const isProtectedAdminRoute = pathname.startsWith("/admin");
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  // 3. Unauthenticated access guard for protected dashboards
  if ((isProtectedStudentRoute || isProtectedOwnerRoute || isProtectedAdminRoute) && !user) {
    const defaultFallback = isProtectedAdminRoute
      ? "/admin/dashboard"
      : isProtectedOwnerRoute
      ? "/owner/dashboard"
      : "/student/dashboard";
    const safeTarget = sanitizeRedirectPath(pathname, defaultFallback);
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", safeTarget);

    const redirectResponse = NextResponse.redirect(redirectUrl);
    // Copy any refreshed session cookies to the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  // 4. Authenticated user visiting /login or /signup -> redirect to dashboard
  if (isAuthPage && user) {
    const rawRedirectTo = request.nextUrl.searchParams.get("redirectTo");
    const targetPath = sanitizeRedirectPath(rawRedirectTo, "/account");
    const redirectUrl = new URL(targetPath, request.url);

    const redirectResponse = NextResponse.redirect(redirectUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/health (health check endpoints)
     * - Images/Static assets (*.svg, *.png, *.jpg, *.jpeg, *.gif, *.webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

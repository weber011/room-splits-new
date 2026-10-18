import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "@/config/env";
export type { Database } from "@/types/database.types";

/**
 * Creates a browser-side Supabase client singleton using @supabase/ssr
 * Safe for client component use. Uses public publishable/anon keys only.
 */
export function createClient() {
  const supabaseUrl = clientEnv.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey = clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "placeholder-anon-key";

  if (!clientEnv.NEXT_PUBLIC_SUPABASE_URL || !clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.warn(
        "[RoomSplits Supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not configured in .env.local. Operating in fallback mode."
      );
    }
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}

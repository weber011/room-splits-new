import { NextResponse } from "next/server";
import { getSupabaseConfigStatus } from "@/config/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side Supabase health check endpoint
 * 
 * Verifies environment configuration and project connectivity
 * without exposing credentials, secrets, or database contents.
 * 
 * Distinguishes:
 * 1. Missing environment variables in .env.local (503)
 * 2. Network / credential failure reaching Supabase (502)
 * 3. Successful connection where database schema has not yet been migrated (200)
 */
export async function GET() {
  const configStatus = getSupabaseConfigStatus();

  // 1. Missing environment configuration check
  if (!configStatus.isConfigured) {
    return NextResponse.json(
      {
        status: "not_configured",
        configured: false,
        service: "supabase",
        message:
          "Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) are missing or contain placeholder values.",
        details: {
          urlConfigured: configStatus.urlConfigured,
          keyConfigured: configStatus.keyConfigured,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }

  // 2. Connectivity check to Supabase project
  try {
    const supabase = await createClient();

    // Ping Supabase Auth service (does not require custom database tables)
    const { error: authError } = await supabase.auth.getSession();

    if (authError && authError.status && authError.status >= 500) {
      return NextResponse.json(
        {
          status: "connection_error",
          configured: true,
          service: "supabase",
          message: "Unable to reach Supabase project authentication endpoint.",
          timestamp: new Date().toISOString(),
        },
        { status: 502 }
      );
    }

    // Ping PostgREST / Database service
    // Probe created public tables to verify schema is initialized and RLS is functioning
    const { error: amenitiesError } = await supabase
      .from("amenities")
      .select("*", { count: "exact", head: true });

    const { error: propertiesError } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true });

    const isSchemaCreated = !amenitiesError && !propertiesError;

    return NextResponse.json(
      {
        status: "connected",
        configured: true,
        service: "supabase",
        authService: {
          status: "reachable",
        },
        database: {
          connected: true,
          schemaCreated: isSchemaCreated,
          statusMessage: isSchemaCreated
            ? "Connected to project with initialized RoomSplits Phase 8C schema."
            : "Connected to project; tables query notice.",
          tables: {
            amenities: !amenitiesError ? "accessible" : amenitiesError.message,
            properties: !propertiesError ? "accessible" : propertiesError.message,
          },
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unexpected connection error";
    return NextResponse.json(
      {
        status: "connection_error",
        configured: true,
        service: "supabase",
        message: "Failed to connect to Supabase project.",
        error: process.env.NODE_ENV === "development" ? errorMessage : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 502 }
    );
  }
}

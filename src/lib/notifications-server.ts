import { createClient } from "@/lib/supabase/server";
import { CreateNotificationInput } from "@/types/notification.types";
import { isValidUuid } from "@/lib/validation-helpers";

/**
 * Server-only internal helper to dispatch an in-app notification.
 * This is NEVER exposed as a client-facing Server Action RPC.
 * Only internal server workflows (visit requests, admin moderation) may invoke this.
 *
 * Checks for recent duplicate events to avoid notification spam on retries.
 * Safely logs failures without disrupting primary business transactions.
 */
export async function createNotificationInternal(
  input: CreateNotificationInput
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  try {
    if (!input.userId || !isValidUuid(input.userId)) {
      return { success: false, error: "Valid recipient user UUID is required." };
    }
    if (!input.type || !input.title || !input.message) {
      return { success: false, error: "Missing required notification fields." };
    }

    if (input.propertyId && !isValidUuid(input.propertyId)) {
      return { success: false, error: "Invalid property UUID format." };
    }

    if (input.visitId && !isValidUuid(input.visitId)) {
      return { success: false, error: "Invalid visit UUID format." };
    }

    const supabase = await createClient();

    // Deduplication check: check if an identical notification was generated in the last 2 minutes
    if (input.visitId) {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", input.userId)
        .eq("visit_id", input.visitId)
        .eq("type", input.type)
        .gte("created_at", twoMinutesAgo)
        .limit(1);

      if (existing && existing.length > 0) {
        // Idempotent success
        return { success: true, notificationId: existing[0].id };
      }
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: input.userId,
        type: input.type,
        title: input.title.trim().slice(0, 150),
        message: input.message.trim().slice(0, 1000),
        property_id: input.propertyId || null,
        visit_id: input.visitId || null,
        is_read: false,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[createNotificationInternal] Insert notice:", error?.message);
      return { success: false, error: "Unable to store notification." };
    }

    return { success: true, notificationId: data.id };
  } catch (err: unknown) {
    console.error("[createNotificationInternal] Unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to dispatch notification.",
    };
  }
}

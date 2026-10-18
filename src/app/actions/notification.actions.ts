"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  AppNotification,
} from "@/types/notification.types";

/**
 * Maps a database notifications row to the AppNotification interface
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbRowToAppNotification(row: any): AppNotification {
  return {
    id: row.id,
    user_id: row.user_id,
    recipient: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    property_id: row.property_id,
    visit_id: row.visit_id,
    is_read: Boolean(row.is_read),
    read: Boolean(row.is_read),
    read_at: row.read_at,
    created_at: row.created_at,
    relatedEntity: row.visit_id ? "visit" : row.property_id ? "property" : "system",
    relatedEntityId: row.visit_id || row.property_id || undefined,
  };
}

/**
 * Server Action: Fetches notifications for the authenticated user.
 * Derived strictly from verified auth session.
 */
export async function getUserNotificationsAction(): Promise<{
  success: boolean;
  notifications?: AppNotification[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required to view notifications." };
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[getUserNotificationsAction] Query error:", error);
      return { success: false, error: error.message };
    }

    const notifications = (data || []).map(mapDbRowToAppNotification);
    return { success: true, notifications };
  } catch (err: unknown) {
    console.error("[getUserNotificationsAction] Unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load notifications.",
    };
  }
}

/**
 * Server Action: Fetches unread notification count for authenticated user.
 */
export async function getUnreadNotificationCountAction(): Promise<{
  success: boolean;
  count: number;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: true, count: 0 };
    }

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.error("[getUnreadNotificationCountAction] Error:", error);
      return { success: true, count: 0 };
    }

    return { success: true, count: count ?? 0 };
  } catch {
    return { success: true, count: 0 };
  }
}

import { isValidUuid } from "@/lib/validation-helpers";

/**
 * Server Action: Marks a single notification as read for the authenticated user.
 */
export async function markNotificationAsReadAction(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!notificationId || !isValidUuid(notificationId)) {
      return { success: false, error: "Valid notification UUID is required." };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required." };
    }

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: "Failed to update notification." };
    }

    revalidatePath("/notifications");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to mark notification as read.",
    };
  }
}

/**
 * Server Action: Marks all notifications as read for the authenticated user.
 */
export async function markAllNotificationsAsReadAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required." };
    }

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      return { success: false, error: "Failed to mark notifications as read." };
    }

    revalidatePath("/notifications");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to mark all as read.",
    };
  }
}

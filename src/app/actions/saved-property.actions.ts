"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuthenticatedUser, getAuthenticatedUser } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { isValidUuid } from "@/lib/validation-helpers";

export interface SavedActionResult {
  success: boolean;
  saved?: boolean;
  error?: string;
}

/**
 * Server Action: Toggle save/bookmark for a property.
 * Strictly uses server-verified auth.uid() as student_id.
 */
export async function toggleSavePropertyAction(propertyId: string): Promise<SavedActionResult> {
  try {
    if (!propertyId || !isValidUuid(propertyId)) {
      return { success: false, error: "Valid property UUID is required." };
    }

    const user = await requireAuthenticatedUser();
    const supabase = await createClient();

    // Check if currently saved
    const { data: existing } = await supabase
      .from("saved_properties")
      .select("id")
      .eq("student_id", user.id)
      .eq("property_id", propertyId)
      .maybeSingle();

    if (existing) {
      // Remove
      const { error: delErr } = await supabase
        .from("saved_properties")
        .delete()
        .eq("student_id", user.id)
        .eq("property_id", propertyId);

      if (delErr) {
        return { success: false, error: delErr.message };
      }
      revalidatePath("/student/dashboard");
      return { success: true, saved: false };
    } else {
      // Insert
      const { error: insErr } = await supabase
        .from("saved_properties")
        .insert({
          student_id: user.id,
          property_id: propertyId,
        });

      if (insErr) {
        return { success: false, error: insErr.message };
      }
      revalidatePath("/student/dashboard");
      return { success: true, saved: true };
    }
  } catch (err: unknown) {
    return { success: false, error: (err as Error)?.message || "Failed to update saved property." };
  }
}

/**
 * Server Action: Fetch saved property IDs for the current authenticated user.
 */
export async function getStudentSavedPropertyIdsAction(): Promise<string[]> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("saved_properties")
      .select("property_id")
      .eq("student_id", user.id);

    if (error || !data) return [];
    return data.map((row) => row.property_id);
  } catch {
    return [];
  }
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { requireOwner } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { isValidUuid, sanitizeDatabaseError } from "@/lib/validation-helpers";

export type JharkhandCity = "Ranchi" | "Dhanbad" | "Jamshedpur" | "Bokaro" | "Hazaribagh";
export const VALID_CITIES: JharkhandCity[] = ["Ranchi", "Dhanbad", "Jamshedpur", "Bokaro", "Hazaribagh"];

export type RoomSharingType = "single" | "double" | "triple" | "four_plus";
export const VALID_SHARING_TYPES: RoomSharingType[] = ["single", "double", "triple", "four_plus"];

export interface RoomInput {
  sharingType: RoomSharingType;
  monthlyRent: number;
  securityDeposit?: number;
  totalBeds: number;
  availableBeds: number;
  hasAttachedBathroom?: boolean;
  hasBalcony?: boolean;
}

export interface PropertyMutationInput {
  title: string;
  description: string;
  category?: "pg" | "hostel" | "coliving";
  genderPolicy: "boys" | "girls" | "co-ed";
  city: JharkhandCity;
  locality: string;
  exactAddress: string;
  monthlyRent: number;
  securityDeposit?: number;
  coverImage?: string;
  images?: string[];
  rooms: RoomInput[];
  amenities: string[];
  status?: "draft" | "published";
}

export interface PropertyActionResult {
  success: boolean;
  propertyId?: string;
  slug?: string;
  error?: string;
}

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${base || "property"}-${randomSuffix}`;
}

function validatePropertyInput(input: PropertyMutationInput): string | null {
  if (!input.title || input.title.trim().length < 5) {
    return "Property title must be at least 5 characters long.";
  }
  if (input.title.trim().length > 200) {
    return "Property title cannot exceed 200 characters.";
  }
  if (!input.description || input.description.trim().length < 10) {
    return "Description must be at least 10 characters long.";
  }
  if (input.description.trim().length > 5000) {
    return "Description cannot exceed 5000 characters.";
  }
  if (!input.city || !VALID_CITIES.includes(input.city)) {
    return `City must be one of: ${VALID_CITIES.join(", ")}.`;
  }
  if (!input.locality || input.locality.trim().length < 2) {
    return "Locality must be at least 2 characters long.";
  }
  if (input.locality.trim().length > 200) {
    return "Locality cannot exceed 200 characters.";
  }
  if (!input.exactAddress || input.exactAddress.trim().length < 5) {
    return "Exact physical address must be at least 5 characters long.";
  }
  if (input.exactAddress.trim().length > 500) {
    return "Exact address cannot exceed 500 characters.";
  }
  if (!input.monthlyRent || Number(input.monthlyRent) <= 0) {
    return "Monthly rent must be greater than zero.";
  }
  if (!input.rooms || !Array.isArray(input.rooms) || input.rooms.length === 0) {
    return "At least one room configuration must be specified.";
  }

  for (let i = 0; i < input.rooms.length; i++) {
    const rm = input.rooms[i];
    if (!VALID_SHARING_TYPES.includes(rm.sharingType)) {
      return `Room ${i + 1}: Invalid sharing type.`;
    }
    if (Number(rm.monthlyRent) <= 0) {
      return `Room ${i + 1}: Monthly rent must be positive.`;
    }
    if (Number(rm.totalBeds) < 1) {
      return `Room ${i + 1}: Total beds must be at least 1.`;
    }
    if (Number(rm.availableBeds) < 0 || Number(rm.availableBeds) > Number(rm.totalBeds)) {
      return `Room ${i + 1}: Available beds must be between 0 and total beds (${rm.totalBeds}).`;
    }
  }

  return null;
}

/**
 * Server Action: Create a new Property listing.
 * Authenticates the user server-side, resolves owner_id from public.owners,
 * and inserts property, private details, rooms, images, and amenities.
 */
export async function createPropertyAction(
  input: PropertyMutationInput
): Promise<PropertyActionResult> {
  try {
    const ownerUser = await requireOwner("/owner/onboarding");
    if (!ownerUser.ownerId) {
      return { success: false, error: "No registered PG owner record found. Please complete onboarding." };
    }

    const validationError = validatePropertyInput(input);
    if (validationError) {
      return { success: false, error: validationError };
    }

    const supabase = await createClient();

    // Verification check: unverified owners cannot publish immediately
    const targetStatus: "draft" | "published" =
      input.status === "published" && ownerUser.isOwnerVerified ? "published" : "draft";

    const slug = generateSlug(input.title);
    const coverImage =
      input.coverImage ||
      input.images?.[0] ||
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80";

    // 1. Insert into public.properties
    const { data: property, error: propError } = await supabase
      .from("properties")
      .insert({
        owner_id: ownerUser.ownerId,
        title: input.title.trim(),
        slug,
        description: input.description.trim(),
        category: input.category || "pg",
        gender_policy: input.genderPolicy,
        city: input.city,
        locality: input.locality.trim(),
        starting_price: Number(input.monthlyRent),
        security_deposit: Number(input.securityDeposit || 0),
        cover_image: coverImage,
        status: targetStatus,
        is_verified: false,
      })
      .select("id, slug")
      .single();

    if (propError || !property) {
      console.error("[createPropertyAction] Property insert error:", propError);
      return { success: false, error: propError?.message || "Failed to create property." };
    }

    const propertyId = property.id;

    // 2. Insert into public.property_private_details
    const { error: privateError } = await supabase
      .from("property_private_details")
      .insert({
        property_id: propertyId,
        exact_address: input.exactAddress.trim(),
        landmark_details: input.locality.trim(),
        contact_phone: ownerUser.phone || "9431100000",
        contact_whatsapp: ownerUser.phone || null,
        visit_instructions: "Show your ₹9 Visit Pass confirmation at the reception.",
      });

    if (privateError) {
      console.error("[createPropertyAction] Private details error:", privateError);
    }

    // 3. Insert rooms
    const roomsToInsert = input.rooms.map((rm) => ({
      property_id: propertyId,
      sharing_type: rm.sharingType,
      monthly_rent: Number(rm.monthlyRent),
      security_deposit: Number(rm.securityDeposit || 0),
      total_beds: Number(rm.totalBeds),
      available_beds: Number(rm.availableBeds),
      has_attached_bathroom: Boolean(rm.hasAttachedBathroom),
      has_balcony: Boolean(rm.hasBalcony),
    }));

    const { error: roomsError } = await supabase.from("rooms").insert(roomsToInsert);
    if (roomsError) {
      console.error("[createPropertyAction] Rooms insert error:", roomsError);
    }

    // 4. Insert images
    const allImages = input.images && input.images.length > 0 ? input.images : [coverImage];
    const imagesToInsert = allImages.map((url, idx) => ({
      property_id: propertyId,
      image_url: url,
      display_order: idx,
    }));

    await supabase.from("property_images").insert(imagesToInsert);

    // 5. Connect amenities
    if (input.amenities && input.amenities.length > 0) {
      const { data: dbAmenities } = await supabase
        .from("amenities")
        .select("id, name")
        .in("name", input.amenities);

      if (dbAmenities && dbAmenities.length > 0) {
        const amenityLinks = dbAmenities.map((a) => ({
          property_id: propertyId,
          amenity_id: a.id,
        }));
        await supabase.from("property_amenities").insert(amenityLinks);
      }
    }

    revalidatePath("/discover");
    revalidatePath("/owner/dashboard");
    revalidatePath(`/property/${propertyId}`);

    return {
      success: true,
      propertyId,
      slug: property.slug,
    };
  } catch (err: unknown) {
    console.error("[createPropertyAction] Unexpected error:", err);
    return { success: false, error: (err as Error)?.message || "Internal server error." };
  }
}

/**
 * Server Action: Update an existing Property.
 * Strictly verifies ownership via verified server session before modifying.
 */
export async function updatePropertyAction(
  propertyId: string,
  input: PropertyMutationInput
): Promise<PropertyActionResult> {
  try {
    if (!propertyId || !isValidUuid(propertyId)) {
      return { success: false, error: "Valid property UUID is required." };
    }

    const ownerUser = await requireOwner("/owner/onboarding");
    if (!ownerUser.ownerId) {
      return { success: false, error: "Unauthorized: No owner profile found." };
    }

    const validationError = validatePropertyInput(input);
    if (validationError) {
      return { success: false, error: validationError };
    }

    const supabase = await createClient();

    // 1. Verify property belongs to this owner
    const { data: existingProp, error: fetchErr } = await supabase
      .from("properties")
      .select("id, owner_id")
      .eq("id", propertyId)
      .eq("owner_id", ownerUser.ownerId)
      .maybeSingle();

    if (fetchErr || !existingProp) {
      return { success: false, error: "Property not found or access denied." };
    }

    const coverImage =
      input.coverImage ||
      input.images?.[0] ||
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80";

    const targetStatus =
      input.status === "published" && ownerUser.isOwnerVerified ? "published" : "draft";

    // 2. Update public.properties
    const { error: updateError } = await supabase
      .from("properties")
      .update({
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category || "pg",
        gender_policy: input.genderPolicy,
        city: input.city,
        locality: input.locality.trim(),
        starting_price: Number(input.monthlyRent),
        security_deposit: Number(input.securityDeposit || 0),
        cover_image: coverImage,
        status: targetStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", propertyId)
      .eq("owner_id", ownerUser.ownerId);

    if (updateError) {
      console.error("[updatePropertyAction] Error updating property:", updateError);
      return { success: false, error: sanitizeDatabaseError(updateError, "Failed to update property listing.") };
    }

    // 3. Update private details
    await supabase
      .from("property_private_details")
      .upsert({
        property_id: propertyId,
        exact_address: input.exactAddress.trim(),
        landmark_details: input.locality.trim(),
        contact_phone: ownerUser.phone || "9431100000",
        updated_at: new Date().toISOString(),
      });

    // 4. Update rooms: replace existing rooms
    await supabase.from("rooms").delete().eq("property_id", propertyId);
    const roomsToInsert = input.rooms.map((rm) => ({
      property_id: propertyId,
      sharing_type: rm.sharingType,
      monthly_rent: Number(rm.monthlyRent),
      security_deposit: Number(rm.securityDeposit || 0),
      total_beds: Number(rm.totalBeds),
      available_beds: Number(rm.availableBeds),
      has_attached_bathroom: Boolean(rm.hasAttachedBathroom),
      has_balcony: Boolean(rm.hasBalcony),
    }));
    await supabase.from("rooms").insert(roomsToInsert);

    // 5. Update amenities
    await supabase.from("property_amenities").delete().eq("property_id", propertyId);
    if (input.amenities && input.amenities.length > 0) {
      const { data: dbAmenities } = await supabase
        .from("amenities")
        .select("id, name")
        .in("name", input.amenities);

      if (dbAmenities && dbAmenities.length > 0) {
        const links = dbAmenities.map((a) => ({
          property_id: propertyId,
          amenity_id: a.id,
        }));
        await supabase.from("property_amenities").insert(links);
      }
    }

    revalidatePath("/discover");
    revalidatePath("/owner/dashboard");
    revalidatePath(`/property/${propertyId}`);

    return { success: true, propertyId };
  } catch (err: unknown) {
    console.error("[updatePropertyAction] Unexpected error:", err);
    return { success: false, error: "Failed to update property listing. Please try again." };
  }
}

/**
 * Server Action: Delete a property listing.
 * Strictly verifies ownership via verified server session.
 */
export async function deletePropertyAction(propertyId: string): Promise<PropertyActionResult> {
  try {
    if (!propertyId || !isValidUuid(propertyId)) {
      return { success: false, error: "Valid property UUID is required." };
    }

    const ownerUser = await requireOwner("/owner/onboarding");
    if (!ownerUser.ownerId) {
      return { success: false, error: "Unauthorized: No owner profile found." };
    }

    const supabase = await createClient();

    // Verify ownership
    const { data: existing, error: findError } = await supabase
      .from("properties")
      .select("id, owner_id")
      .eq("id", propertyId)
      .eq("owner_id", ownerUser.ownerId)
      .maybeSingle();

    if (findError || !existing) {
      return { success: false, error: "Property not found or unauthorized to delete." };
    }

    const { error: delError } = await supabase
      .from("properties")
      .delete()
      .eq("id", propertyId)
      .eq("owner_id", ownerUser.ownerId);

    if (delError) {
      console.error("[deletePropertyAction] Delete error:", delError);
      return { success: false, error: sanitizeDatabaseError(delError, "Failed to delete property. Please verify there are no active dependencies.") };
    }

    revalidatePath("/discover");
    revalidatePath("/owner/dashboard");

    return { success: true, propertyId };
  } catch {
    return { success: false, error: "Failed to delete property. Please try again." };
  }
}

/**
 * Server Action: Toggle listing status between draft, published, and archived.
 */
export async function togglePropertyPublishAction(
  propertyId: string,
  newStatus: "draft" | "published" | "archived"
): Promise<PropertyActionResult> {
  try {
    if (!propertyId || !isValidUuid(propertyId)) {
      return { success: false, error: "Valid property UUID is required." };
    }

    const ownerUser = await requireOwner("/owner/onboarding");
    if (!ownerUser.ownerId) {
      return { success: false, error: "Unauthorized: No owner profile found." };
    }

    if (newStatus === "published" && !ownerUser.isOwnerVerified) {
      return {
        success: false,
        error: "Account verification required before public publishing. Your PG Owner status is currently under review.",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("properties")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", propertyId)
      .eq("owner_id", ownerUser.ownerId);

    if (error) {
      console.error("[togglePropertyPublishAction] Error:", error);
      return { success: false, error: sanitizeDatabaseError(error, "Failed to update publication status.") };
    }

    revalidatePath("/discover");
    revalidatePath("/owner/dashboard");
    revalidatePath(`/property/${propertyId}`);

    return { success: true, propertyId };
  } catch {
    return { success: false, error: "Failed to update property status. Please try again." };
  }
}

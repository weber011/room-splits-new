"use server";

import { createClient } from "@/lib/supabase/server";
import {
  MAX_IMAGE_FILE_SIZE,
  MAX_IMAGES_PER_PROPERTY,
  PROPERTY_IMAGES_BUCKET,
  PropertyImageItem,
  ImageUploadResult,
  ImageOperationResult,
  validateImageMagicBytes,
  getExtensionForMimeType,
} from "@/types/property-image.types";
import { isValidUuid } from "@/lib/validation-helpers";

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80";

/**
 * Extracts the storage object path (e.g. "property-id/uuid.jpg") from a public URL.
 */
function extractStoragePathFromUrl(url: string): string | null {
  try {
    const marker = `/${PROPERTY_IMAGES_BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      return decodeURIComponent(url.substring(idx + marker.length).split("?")[0]);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Server Action: Upload a property image to Supabase Storage and register in database.
 * Enforces authentication, owner authorization, file size, magic bytes, and count limits.
 * Implements atomic cleanup on database failures.
 */
export async function uploadPropertyImageAction(
  formData: FormData
): Promise<ImageUploadResult> {
  try {
    const propertyId = formData.get("propertyId") as string;
    const file = formData.get("file") as File | null;
    const captionRaw = formData.get("caption") as string | null;
    const caption = captionRaw ? captionRaw.trim().slice(0, 200) : null;
    const isPrimary = formData.get("isPrimary") === "true";

    if (!propertyId || !isValidUuid(propertyId)) {
      return { success: false, error: "Valid property UUID is required." };
    }

    if (!file || !(file instanceof File)) {
      return { success: false, error: "No image file provided." };
    }

    // 1. Validate file size
    if (file.size > MAX_IMAGE_FILE_SIZE) {
      return {
        success: false,
        error: `File size exceeds the 5 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
      };
    }

    // 2. Read bytes and validate magic signatures
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const magicResult = validateImageMagicBytes(buffer);

    if (!magicResult.isValid || !magicResult.detectedType) {
      return {
        success: false,
        error: magicResult.error || "Unsupported image file format.",
      };
    }

    // 3. Verify server-authoritative authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required to upload images." };
    }

    // 4. Verify owner record
    const { data: owner, error: ownerError } = await supabase
      .from("owners")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (ownerError || !owner) {
      return {
        success: false,
        error: "Only registered PG owners are authorized to manage property images.",
      };
    }

    // 5. Verify property ownership (Cross-owner upload prevention)
    const { data: property, error: propError } = await supabase
      .from("properties")
      .select("id, cover_image, owner_id")
      .eq("id", propertyId)
      .eq("owner_id", owner.id)
      .maybeSingle();

    if (propError || !property) {
      return {
        success: false,
        error: "Property not found or you are not authorized to manage this property.",
      };
    }

    // 6. Check maximum images per property limit
    const { count: currentCount, error: countError } = await supabase
      .from("property_images")
      .select("*", { count: "exact", head: true })
      .eq("property_id", propertyId);

    if (countError) {
      console.error("[uploadPropertyImageAction] Count error:", countError);
    }

    if ((currentCount ?? 0) >= MAX_IMAGES_PER_PROPERTY) {
      return {
        success: false,
        error: `Maximum limit of ${MAX_IMAGES_PER_PROPERTY} images per property reached.`,
      };
    }

    // 7. Generate safe, non-traversing storage object key
    const extension = getExtensionForMimeType(magicResult.detectedType);
    const uniqueFileName = `${crypto.randomUUID()}.${extension}`;
    const storagePath = `${propertyId}/${uniqueFileName}`;

    // 8. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(PROPERTY_IMAGES_BUCKET)
      .upload(storagePath, Buffer.from(arrayBuffer), {
        contentType: magicResult.detectedType,
        upsert: false,
      });

    if (uploadError) {
      console.error("[uploadPropertyImageAction] Storage upload error:", uploadError);
      return {
        success: false,
        error: `Failed to upload image to storage: ${uploadError.message}`,
      };
    }

    // 9. Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(PROPERTY_IMAGES_BUCKET).getPublicUrl(storagePath);

    // 10. Associate with database (property_images table)
    const nextOrder = (currentCount ?? 0);
    const { data: imageRow, error: dbError } = await supabase
      .from("property_images")
      .insert({
        property_id: propertyId,
        image_url: publicUrl,
        caption: caption?.trim() || null,
        display_order: nextOrder,
      })
      .select()
      .single();

    // 11. Atomic cleanup: if DB insertion fails, remove newly uploaded storage file
    if (dbError || !imageRow) {
      console.error(
        "[uploadPropertyImageAction] DB insertion failed. Cleaning up storage object:",
        storagePath,
        dbError
      );
      await supabase.storage.from(PROPERTY_IMAGES_BUCKET).remove([storagePath]);
      return {
        success: false,
        error: "Failed to register image in database. Uploaded file was safely removed.",
      };
    }

    // 12. If requested or if property has no valid cover image, update cover_image
    const shouldSetPrimary =
      isPrimary ||
      !property.cover_image ||
      property.cover_image === DEFAULT_FALLBACK_IMAGE ||
      (currentCount ?? 0) === 0;

    if (shouldSetPrimary) {
      await supabase
        .from("properties")
        .update({ cover_image: publicUrl })
        .eq("id", propertyId);
    }

    const createdImage: PropertyImageItem = {
      id: imageRow.id,
      propertyId: imageRow.property_id,
      imageUrl: imageRow.image_url,
      caption: imageRow.caption,
      displayOrder: imageRow.display_order,
      createdAt: imageRow.created_at,
      isPrimary: shouldSetPrimary,
    };

    return { success: true, image: createdImage };
  } catch (err: unknown) {
    console.error("[uploadPropertyImageAction] Unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Internal error uploading image.",
    };
  }
}

/**
 * Server Action: Delete a property image safely.
 * Removes both the database record and the storage file if stored in property-images bucket.
 * Restores or updates cover_image if the deleted image was the primary photo.
 */
export async function deletePropertyImageAction(input: {
  propertyId: string;
  imageId: string;
}): Promise<ImageOperationResult> {
  try {
    const { propertyId, imageId } = input;
    if (!propertyId || !isValidUuid(propertyId) || !imageId || !isValidUuid(imageId)) {
      return { success: false, error: "Valid property UUID and image UUID are required." };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required." };
    }

    // Verify owner
    const { data: owner } = await supabase
      .from("owners")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!owner) {
      return { success: false, error: "Only owners can delete property images." };
    }

    // Verify ownership
    const { data: property } = await supabase
      .from("properties")
      .select("id, cover_image")
      .eq("id", propertyId)
      .eq("owner_id", owner.id)
      .maybeSingle();

    if (!property) {
      return {
        success: false,
        error: "Unauthorized: You do not own this property.",
      };
    }

    // Fetch the target image
    const { data: imageRow, error: imgError } = await supabase
      .from("property_images")
      .select("id, image_url, property_id")
      .eq("id", imageId)
      .eq("property_id", propertyId)
      .maybeSingle();

    if (imgError || !imageRow) {
      return { success: false, error: "Image record not found." };
    }

    // Delete DB record
    const { error: deleteDbError } = await supabase
      .from("property_images")
      .delete()
      .eq("id", imageId)
      .eq("property_id", propertyId);

    if (deleteDbError) {
      return {
        success: false,
        error: `Failed to delete image record: ${deleteDbError.message}`,
      };
    }

    // Delete storage object if in our bucket
    const storagePath = extractStoragePathFromUrl(imageRow.image_url);
    if (storagePath) {
      await supabase.storage.from(PROPERTY_IMAGES_BUCKET).remove([storagePath]);
    }

    // If the deleted image was the property's cover image, assign the next available image
    if (property.cover_image === imageRow.image_url) {
      const { data: remainingImages } = await supabase
        .from("property_images")
        .select("image_url")
        .eq("property_id", propertyId)
        .order("display_order", { ascending: true })
        .limit(1);

      const nextCover =
        remainingImages && remainingImages.length > 0
          ? remainingImages[0].image_url
          : DEFAULT_FALLBACK_IMAGE;

      await supabase
        .from("properties")
        .update({ cover_image: nextCover })
        .eq("id", propertyId);
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("[deletePropertyImageAction] Unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Internal error deleting image.",
    };
  }
}

/**
 * Server Action: Set an image as the primary cover photo for a property.
 */
export async function setPrimaryPropertyImageAction(input: {
  propertyId: string;
  imageId: string;
}): Promise<ImageOperationResult> {
  try {
    const { propertyId, imageId } = input;
    if (!propertyId || !isValidUuid(propertyId) || !imageId || !isValidUuid(imageId)) {
      return { success: false, error: "Valid property UUID and image UUID are required." };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required." };
    }

    // Verify owner
    const { data: owner } = await supabase
      .from("owners")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!owner) {
      return { success: false, error: "Only owners can set primary images." };
    }

    // Verify ownership
    const { data: property } = await supabase
      .from("properties")
      .select("id")
      .eq("id", propertyId)
      .eq("owner_id", owner.id)
      .maybeSingle();

    if (!property) {
      return { success: false, error: "Unauthorized: You do not own this property." };
    }

    // Fetch image
    const { data: imageRow, error: imgError } = await supabase
      .from("property_images")
      .select("image_url")
      .eq("id", imageId)
      .eq("property_id", propertyId)
      .maybeSingle();

    if (imgError || !imageRow) {
      return { success: false, error: "Image not found." };
    }

    // Update property cover image
    const { error: updateError } = await supabase
      .from("properties")
      .update({ cover_image: imageRow.image_url })
      .eq("id", propertyId);

    if (updateError) {
      return { success: false, error: "Failed to update cover photo." };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("[setPrimaryPropertyImageAction] Unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Internal error setting primary image.",
    };
  }
}

/**
 * Server Action: Fetch all images for a property with primary image status.
 */
export async function getPropertyImagesAction(
  propertyId: string
): Promise<{ success: boolean; images?: PropertyImageItem[]; error?: string }> {
  try {
    if (!propertyId || !isValidUuid(propertyId)) {
      return { success: false, error: "Valid property UUID is required." };
    }

    const supabase = await createClient();

    // Fetch property cover image
    const { data: prop } = await supabase
      .from("properties")
      .select("cover_image")
      .eq("id", propertyId)
      .maybeSingle();

    const coverUrl = prop?.cover_image;

    // Fetch property_images
    const { data: rows, error } = await supabase
      .from("property_images")
      .select("id, property_id, image_url, caption, display_order, created_at")
      .eq("property_id", propertyId)
      .order("display_order", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    const images: PropertyImageItem[] = (rows || []).map((r) => ({
      id: r.id,
      propertyId: r.property_id,
      imageUrl: r.image_url,
      caption: r.caption,
      displayOrder: r.display_order,
      createdAt: r.created_at,
      isPrimary: coverUrl ? r.image_url === coverUrl : false,
    }));

    return { success: true, images };
  } catch (err: unknown) {
    console.error("[getPropertyImagesAction] Unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch property images.",
    };
  }
}

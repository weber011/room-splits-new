/**
 * Property Image Types and Validation Constants for RoomSplits
 * Phase 12: Secure Property Image Uploads
 */

export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_IMAGES_PER_PROPERTY = 15;
export const PROPERTY_IMAGES_BUCKET = "property-images";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

export interface PropertyImageItem {
  id: string;
  propertyId: string;
  imageUrl: string;
  caption: string | null;
  displayOrder: number;
  createdAt: string;
  isPrimary?: boolean;
}

export interface ImageUploadResult {
  success: boolean;
  image?: PropertyImageItem;
  error?: string;
}

export interface ImageOperationResult {
  success: boolean;
  error?: string;
}

/**
 * Validates file headers (magic bytes) to ensure file content genuinely
 * matches supported image types (JPEG, PNG, WEBP) and is not an arbitrary
 * or malicious executable disguised with an image extension.
 */
export function validateImageMagicBytes(buffer: Uint8Array): {
  isValid: boolean;
  detectedType?: AllowedImageMimeType;
  error?: string;
} {
  if (!buffer || buffer.length < 12) {
    return {
      isValid: false,
      error: "File is corrupt or too small to be a valid image.",
    };
  }

  // JPEG signature: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { isValid: true, detectedType: "image/jpeg" };
  }

  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { isValid: true, detectedType: "image/png" };
  }

  // WEBP signature: 'RIFF' (0..3) and 'WEBP' (8..11)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { isValid: true, detectedType: "image/webp" };
  }

  return {
    isValid: false,
    error: "Invalid file content. Only real JPEG, PNG, and WebP images are allowed.",
  };
}

/**
 * Sanitizes and extracts extension from MIME type.
 */
export function getExtensionForMimeType(mimeType: AllowedImageMimeType): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

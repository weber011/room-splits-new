import {
  MAX_IMAGE_FILE_SIZE,
  ALLOWED_IMAGE_MIME_TYPES,
  PropertyImageItem,
  ImageUploadResult,
  ImageOperationResult,
} from "@/types/property-image.types";
import {
  uploadPropertyImageAction,
  deletePropertyImageAction,
  setPrimaryPropertyImageAction,
  getPropertyImagesAction,
} from "@/app/actions/property-image.actions";

export const propertyImageService = {
  /**
   * Client-side quick validation of selected file before dispatching to server.
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: "No file selected." };
    }

    if (file.size > MAX_IMAGE_FILE_SIZE) {
      return {
        isValid: false,
        error: `File "${file.name}" exceeds the 5 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as any)) {
      return {
        isValid: false,
        error: `File "${file.name}" has unsupported type (${file.type || "unknown"}). Only JPG, PNG, and WebP are allowed.`,
      };
    }

    return { isValid: true };
  },

  /**
   * Upload an image file for a property.
   */
  async uploadImage(
    propertyId: string,
    file: File,
    caption?: string,
    isPrimary?: boolean
  ): Promise<ImageUploadResult> {
    const clientValidation = this.validateFile(file);
    if (!clientValidation.isValid) {
      return { success: false, error: clientValidation.error };
    }

    const formData = new FormData();
    formData.append("propertyId", propertyId);
    formData.append("file", file);
    if (caption) formData.append("caption", caption);
    if (isPrimary) formData.append("isPrimary", "true");

    return await uploadPropertyImageAction(formData);
  },

  /**
   * Delete an image from a property.
   */
  async deleteImage(
    propertyId: string,
    imageId: string
  ): Promise<ImageOperationResult> {
    return await deletePropertyImageAction({ propertyId, imageId });
  },

  /**
   * Set an image as the primary cover photo for a property.
   */
  async setPrimaryImage(
    propertyId: string,
    imageId: string
  ): Promise<ImageOperationResult> {
    return await setPrimaryPropertyImageAction({ propertyId, imageId });
  },

  /**
   * Fetch all images associated with a property.
   */
  async getPropertyImages(propertyId: string): Promise<PropertyImageItem[]> {
    const res = await getPropertyImagesAction(propertyId);
    if (!res.success || !res.images) {
      return [];
    }
    return res.images;
  },
};

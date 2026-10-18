"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  X,
  Trash2,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PropertyImageItem,
  MAX_IMAGES_PER_PROPERTY,
  ALLOWED_IMAGE_EXTENSIONS,
} from "@/types/property-image.types";
import { propertyImageService } from "@/services/property-image.service";

export interface PropertyImageUploaderProps {
  propertyId: string;
  initialImages?: PropertyImageItem[];
  onImagesChange?: (images: PropertyImageItem[]) => void;
  className?: string;
}

interface PendingFile {
  id: string;
  file: File;
  previewUrl: string;
  error?: string;
}

export function PropertyImageUploader({
  propertyId,
  initialImages = [],
  onImagesChange,
  className = "",
}: PropertyImageUploaderProps) {
  const [images, setImages] = useState<PropertyImageItem[]>(initialImages);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing images if not provided initially
  useEffect(() => {
    let isMounted = true;
    async function loadImages() {
      if (initialImages.length > 0) {
        setImages(initialImages);
        return;
      }
      if (!propertyId) return;

      setIsLoading(true);
      try {
        const fetched = await propertyImageService.getPropertyImages(propertyId);
        if (isMounted) {
          setImages(fetched);
          if (onImagesChange) onImagesChange(fetched);
        }
      } catch (err) {
        console.error("Failed to fetch property images:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadImages();
    return () => {
      isMounted = false;
    };
  }, [propertyId, initialImages, onImagesChange]);

  // Clean up object URLs when pending files change
  useEffect(() => {
    return () => {
      pendingFiles.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [pendingFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeedback(null);
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES_PER_PROPERTY - images.length - pendingFiles.length;
    if (remainingSlots <= 0) {
      setFeedback({
        type: "error",
        message: `Maximum limit of ${MAX_IMAGES_PER_PROPERTY} images per property reached.`,
      });
      return;
    }

    const filesToAdd: PendingFile[] = [];
    const filesToProcess = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      setFeedback({
        type: "error",
        message: `Only ${remainingSlots} more photo(s) can be added (Maximum ${MAX_IMAGES_PER_PROPERTY} total).`,
      });
    }

    for (const file of filesToProcess) {
      const validation = propertyImageService.validateFile(file);
      const previewUrl = URL.createObjectURL(file);
      filesToAdd.push({
        id: crypto.randomUUID(),
        file,
        previewUrl,
        error: validation.isValid ? undefined : validation.error,
      });
    }

    setPendingFiles((prev) => [...prev, ...filesToAdd]);

    // Reset input so same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePendingFile = (id: string) => {
    setPendingFiles((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleUploadAll = async () => {
    const validPending = pendingFiles.filter((p) => !p.error);
    if (validPending.length === 0) {
      setFeedback({
        type: "error",
        message: "No valid images to upload. Please resolve errors first.",
      });
      return;
    }

    setIsUploading(true);
    setFeedback(null);
    setUploadProgress({ current: 0, total: validPending.length });

    const newUploaded: PropertyImageItem[] = [];
    let failureCount = 0;
    let lastError = "";

    for (let i = 0; i < validPending.length; i++) {
      const item = validPending[i];
      setUploadProgress({ current: i + 1, total: validPending.length });

      try {
        const isFirstOverall = images.length === 0 && i === 0;
        const res = await propertyImageService.uploadImage(
          propertyId,
          item.file,
          undefined,
          isFirstOverall
        );

        if (res.success && res.image) {
          newUploaded.push(res.image);
          // Remove from pending
          removePendingFile(item.id);
        } else {
          failureCount++;
          lastError = res.error || "Upload failed";
        }
      } catch (err: unknown) {
        failureCount++;
        lastError = err instanceof Error ? err.message : "Network error uploading image";
      }
    }

    const updatedImages = [...images, ...newUploaded];
    setImages(updatedImages);
    if (onImagesChange) onImagesChange(updatedImages);

    setIsUploading(false);

    if (failureCount === 0) {
      setFeedback({
        type: "success",
        message: `Successfully uploaded ${newUploaded.length} property photo(s).`,
      });
    } else {
      setFeedback({
        type: "error",
        message: `Uploaded ${newUploaded.length} photos. ${failureCount} failed: ${lastError}`,
      });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to remove this property image?")) return;

    try {
      const res = await propertyImageService.deleteImage(propertyId, imageId);
      if (res.success) {
        const remaining = images.filter((img) => img.id !== imageId);
        // If deleted image was primary and remaining images exist, mark first as primary
        if (remaining.length > 0 && !remaining.some((img) => img.isPrimary)) {
          remaining[0].isPrimary = true;
        }
        setImages(remaining);
        if (onImagesChange) onImagesChange(remaining);
        setFeedback({
          type: "success",
          message: "Image removed successfully.",
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to remove image.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Network error removing image.",
      });
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      const res = await propertyImageService.setPrimaryImage(propertyId, imageId);
      if (res.success) {
        const updated = images.map((img) => ({
          ...img,
          isPrimary: img.id === imageId,
        }));
        setImages(updated);
        if (onImagesChange) onImagesChange(updated);
        setFeedback({
          type: "success",
          message: "Cover photo updated successfully.",
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to set cover photo.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Network error updating cover photo.",
      });
    }
  };

  return (
    <Card className={`p-5 sm:p-6 bg-slate-900/90 border-slate-800 text-slate-100 rounded-3xl space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Property Photos & Gallery</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Upload verified high-resolution photos of rooms, washrooms, dining, and exterior ({images.length} / {MAX_IMAGES_PER_PROPERTY} uploaded).
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={images.length + pendingFiles.length >= MAX_IMAGES_PER_PROPERTY || isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 rounded-xl gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Photos</span>
        </Button>
      </div>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_IMAGE_EXTENSIONS.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Feedback Alerts */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Drop / Selection Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/50 hover:bg-emerald-500/[0.02] transition-colors rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center space-y-2 group"
      >
        <div className="h-11 w-11 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
          <UploadCloud className="h-6 w-6" />
        </div>
        <div className="space-y-0.5">
          <p className="text-xs sm:text-sm font-semibold text-slate-200">
            Click to upload or drag and drop photos
          </p>
          <p className="text-[11px] text-slate-400">
            Supported formats: JPG, PNG, WebP • Max 5 MB per photo • Up to {MAX_IMAGES_PER_PROPERTY} photos
          </p>
        </div>
      </div>

      {/* Pending Files Queue (Preview before Upload) */}
      {pendingFiles.length > 0 && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>Ready to upload</span>
              <Badge variant="outline" className="text-[10px] bg-slate-800 text-slate-300">
                {pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""}
              </Badge>
            </h4>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isUploading}
                onClick={() => setPendingFiles([])}
                className="text-xs text-slate-400 hover:text-rose-400 h-8 px-2"
              >
                Clear all
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isUploading}
                onClick={handleUploadAll}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-8 px-3 text-xs font-bold gap-1.5 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>
                      Uploading ({uploadProgress.current}/{uploadProgress.total})...
                    </span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Upload {pendingFiles.length} Photos</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
            {pendingFiles.map((item) => (
              <div
                key={item.id}
                className={`relative group rounded-xl overflow-hidden border bg-slate-900 flex flex-col ${
                  item.error ? "border-rose-500/60" : "border-slate-800"
                }`}
              >
                <div className="relative h-24 w-full bg-slate-950">
                  <Image
                    src={item.previewUrl}
                    alt={item.file.name}
                    fill
                    className="object-cover"
                  />
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={() => removePendingFile(item.id)}
                      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-slate-950/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
                      title="Remove preview"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="p-2 text-[10px] space-y-0.5">
                  <p className="font-medium text-slate-200 truncate">{item.file.name}</p>
                  <p className="text-slate-500">
                    {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  {item.error && (
                    <p className="text-rose-400 font-semibold truncate" title={item.error}>
                      {item.error}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Uploaded Images Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300">
          Current Photos ({images.length})
        </h4>

        {isLoading ? (
          <div className="h-36 flex items-center justify-center text-slate-500 gap-2 text-xs">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
            <span>Loading gallery photos...</span>
          </div>
        ) : images.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800/60">
            No property photos uploaded yet. Click &quot;Add Photos&quot; above to upload room and property photos.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-xs flex flex-col"
              >
                {/* Photo */}
                <div className="relative h-28 sm:h-32 w-full bg-slate-950 overflow-hidden">
                  <Image
                    src={img.imageUrl}
                    alt={img.caption || `Property photo ${idx + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    {img.isPrimary && (
                      <span className="bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Star className="h-2.5 w-2.5 fill-slate-950" />
                        Cover Photo
                      </span>
                    )}
                  </div>

                  {/* Hover Actions Overlay */}
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    {!img.isPrimary && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSetPrimary(img.id)}
                        className="h-8 px-2.5 text-[11px] bg-slate-800 hover:bg-emerald-600 text-white rounded-xl gap-1"
                        title="Set as accommodation cover photo"
                      >
                        <Star className="h-3 w-3" />
                        <span>Cover</span>
                      </Button>
                    )}

                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteImage(img.id)}
                      className="h-8 px-2 text-[11px] bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl"
                      title="Remove image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Caption / Order footer */}
                <div className="p-2 text-[11px] flex items-center justify-between text-slate-400 bg-slate-900/90">
                  <span className="truncate">Photo #{idx + 1}</span>
                  {img.isPrimary ? (
                    <span className="text-[10px] text-emerald-400 font-bold">Primary</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(img.id)}
                      className="text-[10px] text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      Make Cover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PropertyImageGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80";

export function PropertyImageGallery({
  images,
  title,
  className,
}: PropertyImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedIndices, setFailedIndices] = useState<Record<number, boolean>>({});

  const validImages = images && images.length > 0 ? images : [FALLBACK_IMAGE];

  const handleImageError = (index: number) => {
    setFailedIndices((prev) => ({ ...prev, [index]: true }));
  };

  const currentImageSrc = failedIndices[activeIndex]
    ? FALLBACK_IMAGE
    : validImages[activeIndex] || FALLBACK_IMAGE;

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Active Main View */}
      <div className="relative h-72 sm:h-96 w-full overflow-hidden rounded-3xl border border-[#10164F]/10 bg-gray-100 group shadow-sm">
        <Image
          src={currentImageSrc}
          alt={`${title} - Photo ${activeIndex + 1}`}
          fill
          className="object-cover transition-all duration-300"
          sizes="(max-width: 768px) 100vw, 800px"
          priority
          onError={() => handleImageError(activeIndex)}
        />

        {/* Carousel Navigation Buttons */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-2xl bg-white/90 backdrop-blur-md text-[#10164F] hover:bg-white shadow-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
              aria-label="Previous Image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-2xl bg-white/90 backdrop-blur-md text-[#10164F] hover:bg-white shadow-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
              aria-label="Next Image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Counter Badge */}
        <div className="absolute bottom-3 right-3 rounded-xl bg-[#10164F]/85 backdrop-blur-md px-3 py-1 text-xs text-white font-semibold shadow-xs">
          {activeIndex + 1} / {validImages.length}
        </div>
      </div>

      {/* Thumbnails Row */}
      {validImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-2">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative h-16 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all cursor-pointer",
                activeIndex === idx
                  ? "border-[#3129C8] ring-2 ring-[#3129C8]/25 scale-105"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={failedIndices[idx] ? FALLBACK_IMAGE : img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                onError={() => handleImageError(idx)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

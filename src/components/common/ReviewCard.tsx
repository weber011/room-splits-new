import * as React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { RatingDisplay } from "./RatingDisplay";
import { VerifiedBadge } from "./VerifiedBadge";
import { User } from "lucide-react";
import { PropertyReview } from "@/types";

export interface ReviewCardProps {
  review: PropertyReview;
  className?: string;
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  return (
    <Card className={`rounded-3xl border border-[#10164F]/10 bg-white p-5 space-y-3 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#FAFAF7] text-[#10164F] font-semibold text-xs border border-[#10164F]/15 overflow-hidden">
            {review.tenantAvatar ? (
              <Image src={review.tenantAvatar} alt={review.tenantName} fill className="object-cover" />
            ) : (
              <User className="h-4 w-4 text-[#3129C8]" />
            )}
          </div>
          <div>
            <h5 className="font-semibold text-[#10164F] text-sm">{review.tenantName}</h5>
            {review.isVerifiedResident && <VerifiedBadge type="resident" />}
          </div>
        </div>
        <RatingDisplay rating={review.rating} />
      </div>

      <p className="text-xs text-gray-700 leading-relaxed italic">
        &ldquo;{review.comment}&rdquo;
      </p>

      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-[#10164F]/10">
        <span>Food: {review.foodRating}/5 &bull; Hygiene: {review.cleanlinessRating}/5</span>
        <span>{review.createdAt}</span>
      </div>
    </Card>
  );
}

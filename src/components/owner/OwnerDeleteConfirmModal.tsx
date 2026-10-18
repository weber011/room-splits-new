"use client";

import React, { useEffect } from "react";
import { OwnerProperty } from "@/lib/owner-storage";
import { AlertTriangle, Trash2, X } from "lucide-react";

export interface OwnerDeleteConfirmModalProps {
  property: OwnerProperty | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (propertyId: string) => void;
}

export function OwnerDeleteConfirmModal({
  property,
  isOpen,
  onClose,
  onConfirm,
}: OwnerDeleteConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !property) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10164F]/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-[#10164F] hover:bg-slate-100 cursor-pointer"
          aria-label="Close deletion dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3
              id="delete-dialog-title"
              className="text-lg font-black text-[#10164F]"
            >
              Delete Demo Property?
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1.5 text-xs text-slate-600">
          <p className="font-extrabold text-[#10164F]">{property.title}</p>
          <p className="text-slate-500">
            {property.locality}, {property.city} &bull; ₹
            {property.monthlyRent.toLocaleString("en-IN")}/mo
          </p>
          <p className="text-[11px] text-amber-700 pt-1">
            Note: This will delete this listing from your current browser&apos;s
            demo store. Shared seed properties are never affected.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(property.id)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

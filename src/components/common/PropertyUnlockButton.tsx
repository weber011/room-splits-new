"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Lock, CheckCircle2, AlertTriangle, Loader2, RefreshCw } from "lucide-react";

export interface PropertyUnlockButtonProps {
  propertyId: string;
  propertyTitle: string;
  isUnlocked: boolean;
  isLoggedIn: boolean;
  onUnlockSuccess?: () => void;
  variant?: "banner" | "button" | "card";
}

export function PropertyUnlockButton({
  propertyId,
  propertyTitle,
  isUnlocked: initialIsUnlocked,
  isLoggedIn,
  onUnlockSuccess,
  variant = "banner",
}: PropertyUnlockButtonProps) {
  const router = useRouter();

  const [isUnlocked, setIsUnlocked] = useState(initialIsUnlocked);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cancelledMessage, setCancelledMessage] = useState<string | null>(null);

  // Helper: Dynamically load Razorpay Checkout SDK Script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }
      // If already loaded
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUnlockClick = async () => {
    setErrorMessage(null);
    setCancelledMessage(null);

    // 1. Check Authentication
    if (!isLoggedIn) {
      router.push(`/login?redirect=/property/${propertyId}`);
      return;
    }

    setIsProcessing(true);

    try {
      // 2. Load Razorpay SDK
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        setErrorMessage("Payment service is temporarily unavailable. Please try again.");
        setIsProcessing(false);
        return;
      }

      // 3. Request Server to Create Razorpay Order for ₹9
      const orderRes = await fetch("/api/payments/property-unlock/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || orderData.error) {
        setErrorMessage(orderData.error || "Failed to initiate ₹9 Property Unlock payment.");
        setIsProcessing(false);
        return;
      }

      // If user already holds an active unlock
      if (orderData.isAlreadyUnlocked) {
        setIsUnlocked(true);
        setIsProcessing(false);
        if (onUnlockSuccess) onUnlockSuccess();
        router.refresh();
        return;
      }

      const { razorpayOrderId, razorpayKeyId, amountInPaise, currency } = orderData;

      // 4. Open Official Razorpay Checkout Modal
      const options = {
        key: razorpayKeyId,
        amount: amountInPaise || 900,
        currency: currency || "INR",
        name: "RoomSplits",
        description: `₹9 Property Access Pass: ${propertyTitle}`,
        order_id: razorpayOrderId,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            // 5. Verify Signature & Amount on Server
            const verifyRes = await fetch("/api/payments/property-unlock/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setIsUnlocked(true);
              setIsProcessing(false);
              if (onUnlockSuccess) onUnlockSuccess();
              router.refresh();
            } else {
              setErrorMessage(verifyData.error || "Payment verification failed. Your property has not been unlocked.");
              setIsProcessing(false);
            }
          } catch {
            setErrorMessage("Network error during payment verification. Please try again.");
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setCancelledMessage("Payment cancelled. The property is still locked.");
          },
        },
        theme: {
          color: "#10b981", // Emerald 500
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rzp.on("payment.failed", function (failResponse: any) {
        setIsProcessing(false);
        const failMsg = failResponse?.error?.description || "Payment failed. Your property has not been unlocked.";
        setErrorMessage(failMsg);
      });

      rzp.open();
    } catch (err: unknown) {
      console.error("Unlock Error:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  // STATE: ALREADY UNLOCKED
  if (isUnlocked) {
    if (variant === "button") {
      return (
        <button disabled className="px-3 py-1.5 rounded-xl bg-[#A7F3D0]/30 text-[#10164F] border border-[#A7F3D0] font-bold text-xs flex items-center gap-1.5 cursor-default">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#10164F]" />
          <span>✓ Property Unlocked</span>
        </button>
      );
    }

    return (
      <Card className="p-5 rounded-3xl bg-[#A7F3D0]/20 border border-[#A7F3D0] text-[#10164F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-[#10164F] text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>✓ Property Unlocked — Access Pass Active</span>
          </div>
          <p className="text-[12px] text-gray-700">
            Your ₹9 Property Unlock gives you full access to property details and visit information. It does not reserve or book a room.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#A7F3D0] text-[#10164F] font-bold text-xs shrink-0">
          Active Pass
        </span>
      </Card>
    );
  }

  // STATE: LOCKED (BEFORE PAYMENT)
  return (
    <div className="space-y-3">
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={handleUnlockClick} className="text-xs text-rose-700 hover:text-rose-900 underline font-semibold flex items-center gap-1 cursor-pointer">
            <RefreshCw className="h-3 w-3" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {cancelledMessage && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>{cancelledMessage}</span>
          </div>
          <button onClick={handleUnlockClick} className="text-xs text-amber-700 hover:text-amber-900 underline font-semibold flex items-center gap-1 cursor-pointer">
            <RefreshCw className="h-3 w-3" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {variant === "banner" ? (
        <Card className="p-6 rounded-3xl bg-gradient-to-r from-[#FFF45C]/25 via-[#FAFAF7] to-white border border-[#FFF45C] text-[#10164F] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-extrabold text-[#10164F] text-base">
              <span className="p-1.5 rounded-lg bg-[#FFF45C] text-[#10164F]">
                <Lock className="h-4 w-4" />
              </span>
              <span>Exact Location &amp; Owner Contact Details Protected</span>
            </div>
            <p className="text-xs text-gray-700 max-w-2xl leading-relaxed">
              Unlock exact street address, landlord phone number, WhatsApp contact &amp; physical visit instructions for <strong>₹9</strong>.
            </p>
            <p className="text-[11px] text-[#3129C8] font-bold">
              Note: ₹9 Property Unlock provides verified access pass. It is separate from room booking or advance rent.
            </p>
          </div>
          <button
            onClick={handleUnlockClick}
            disabled={isProcessing}
            className="bg-[#3129C8] hover:bg-[#251fa3] text-white font-extrabold px-6 py-3 rounded-2xl flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm shadow-md shrink-0 transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Processing Unlock...</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>Unlock for ₹9</span>
              </>
            )}
          </button>
        </Card>
      ) : (
        <button
          onClick={handleUnlockClick}
          disabled={isProcessing}
          className="bg-[#3129C8] hover:bg-[#251fa3] text-white font-extrabold px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>Unlock for ₹9</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

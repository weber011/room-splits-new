export type VisitTimeSlot = "morning" | "afternoon" | "evening";

export const VALID_TIME_SLOTS: VisitTimeSlot[] = ["morning", "afternoon", "evening"];

export const TIME_SLOT_LABELS: Record<VisitTimeSlot, string> = {
  morning: "Morning (10:00 AM - 12:00 PM)",
  afternoon: "Afternoon (02:00 PM - 04:00 PM)",
  evening: "Evening (05:00 PM - 07:00 PM)",
};

export type DbVisitStatus = "pending" | "confirmed" | "declined" | "cancelled" | "completed";

export const VALID_VISIT_STATUSES: DbVisitStatus[] = [
  "pending",
  "confirmed",
  "declined",
  "cancelled",
  "completed",
];

export interface VisitPropertySummary {
  id: string;
  title: string;
  city: string;
  locality: string;
  coverImage?: string;
  ownerId?: string;
  startingPrice?: number;
}

export interface VisitRoomSummary {
  id: string;
  sharingType: string;
  monthlyRent: number;
}

export interface VisitStudentSummary {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface DbVisit {
  id: string;
  propertyId: string;
  roomId?: string;
  studentId: string;
  preferredDate: string;
  preferredTimeSlot: VisitTimeSlot;
  status: DbVisitStatus;
  notes?: string;
  hostNotes?: string;
  createdAt: string;
  updatedAt: string;
  property?: VisitPropertySummary;
  room?: VisitRoomSummary;
  student?: VisitStudentSummary;
}

// Backward compatibility types for legacy UI components
export type VisitPassStatus =
  | "REQUESTED"
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "RESCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export type VisitPaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type OwnerConfirmationStatus = "PENDING" | "ACCEPTED" | "PROPOSED_NEW_TIME" | "REJECTED";

export interface VisitUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface VisitPropertyInfo {
  id: string;
  title: string;
  locality: string;
  city: string;
  coverImage: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface VisitOwnerInfo {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface VisitPass {
  id: string;
  passCode: string;
  user: VisitUser;
  property: VisitPropertyInfo;
  owner: VisitOwnerInfo;
  preferredDate: string;
  preferredTime: string;
  alternateDate?: string;
  alternateTime?: string;
  status: VisitPassStatus;
  visitPassAmount: number;
  paymentStatus: VisitPaymentStatus;
  paymentId?: string;
  razorpayOrderId?: string;
  ownerConfirmation: OwnerConfirmationStatus;
  studentMessage?: string;
  ownerMessage?: string;
  ownerProposedDate?: string;
  ownerProposedTime?: string;
  confirmedDate?: string;
  confirmedTime?: string;
  visitNotes?: string;
  exactLocationVisibility: boolean;
  contactVisibility: boolean;
  createdAt: string;
  updatedAt: string;
}

// Security rule helper for computed visibility
export function computeVisitPassVisibility(status: VisitPassStatus | DbVisitStatus, isPropertyUnlocked: boolean = true): {
  exactLocationVisibility: boolean;
  contactVisibility: boolean;
} {
  const isValidStatus =
    status === "CONFIRMED" ||
    status === "confirmed" ||
    status === "RESCHEDULED" ||
    status === "COMPLETED" ||
    status === "completed";
  const isVisible = isPropertyUnlocked && isValidStatus;

  return {
    exactLocationVisibility: isVisible,
    contactVisibility: isVisible,
  };
}

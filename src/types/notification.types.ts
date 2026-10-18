/**
 * Notification Types and Constants for RoomSplits
 * Phase 13: Notifications and User Communication
 */

export const NOTIFICATION_TYPES = [
  "visit_requested",
  "visit_confirmed",
  "visit_declined",
  "visit_rescheduled",
  "visit_cancelled",
  "visit_completed",
  "system",
] as const;

export type DbNotificationType = (typeof NOTIFICATION_TYPES)[number];

// Legacy enum aliases for UI icons and backward compatibility
export type NotificationType =
  | DbNotificationType
  | "VISIT_CONFIRMED"
  | "VISIT_RESCHEDULED"
  | "BOOKING_CONFIRMED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "RENT_DUE"
  | "COMPLAINT_UPDATED"
  | "REVIEW_REQUEST"
  | "CHECKOUT_UPDATED"
  | "DEPOSIT_SETTLEMENT"
  | "SYSTEM";

export type NotificationChannel = "IN_APP" | "EMAIL" | "SMS" | "WHATSAPP";

export interface DbNotification {
  id: string;
  user_id: string;
  type: DbNotificationType;
  title: string;
  message: string;
  property_id: string | null;
  visit_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface AppNotification extends DbNotification {
  // UI backward-compatibility convenience getters
  recipient: string;
  read: boolean;
  relatedEntity: "visit" | "booking" | "payment" | "complaint" | "stay" | "checkout" | "property" | "system";
  relatedEntityId?: string;
  propertyTitle?: string;
  propertyId?: string;
  visitId?: string;
}

export interface CreateNotificationInput {
  userId: string;
  type: DbNotificationType;
  title: string;
  message: string;
  propertyId?: string;
  visitId?: string;
}

export interface ExternalNotificationPayload {
  recipientEmail?: string;
  recipientPhone?: string;
  subject: string;
  body: string;
}

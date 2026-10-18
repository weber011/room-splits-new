import {
  AppNotification,
  ExternalNotificationPayload,
} from "@/types/notification.types";
import {
  getUserNotificationsAction,
  getUnreadNotificationCountAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from "@/app/actions/notification.actions";

// Multi-Channel External Notification Provider Documentation & Stubs
export const notificationProviders = {
  /**
   * Future Outbound Email Provider (e.g. Resend / AWS SES / SendGrid).
   * Note: No live email credentials configured; documented for future notification phases.
   */
  async emailProvider(payload: ExternalNotificationPayload): Promise<{ success: boolean; provider: string }> {
    console.log(`[Email Integration Prepared] To: ${payload.recipientEmail || "recipient"}, Subject: "${payload.subject}"`);
    return { success: true, provider: "Documented Email Adapter" };
  },

  async smsProvider(payload: ExternalNotificationPayload): Promise<{ success: boolean; provider: string }> {
    console.log(`[SMS Integration Prepared] To: ${payload.recipientPhone || "recipient"}`);
    return { success: true, provider: "Documented SMS Adapter" };
  },

  async whatsAppProvider(payload: ExternalNotificationPayload): Promise<{ success: boolean; provider: string }> {
    console.log(`[WhatsApp Integration Prepared] To: ${payload.recipientPhone || "recipient"}`);
    return { success: true, provider: "Documented WhatsApp Adapter" };
  },
};

export class NotificationService {
  /**
   * Fetches notifications for the authenticated user from Supabase.
   */
  async getNotifications(): Promise<AppNotification[]> {
    try {
      const res = await getUserNotificationsAction();
      if (res.success && res.notifications) {
        return res.notifications;
      }
      return [];
    } catch (err) {
      console.error("[NotificationService.getNotifications] Error:", err);
      return [];
    }
  }

  /**
   * Fetches unread notification count for the authenticated user.
   */
  async getUnreadCount(): Promise<number> {
    try {
      const res = await getUnreadNotificationCountAction();
      return res.count || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Marks a single notification as read in the database.
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const res = await markNotificationAsReadAction(notificationId);
      return res.success;
    } catch {
      return false;
    }
  }

  /**
   * Marks all notifications as read for the authenticated user.
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      const res = await markAllNotificationsAsReadAction();
      return res.success;
    } catch {
      return false;
    }
  }
}

export const notificationService = new NotificationService();

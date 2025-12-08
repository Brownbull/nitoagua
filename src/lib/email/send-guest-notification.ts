/**
 * Guest Email Notification Helper
 *
 * Handles sending email notifications to guest consumers for water request
 * status changes. This module wraps the core email sending functions with:
 * - Guest detection logic (only sends to true guests, not registered users)
 * - Email masking for privacy-conscious logging
 * - Non-blocking error handling (failures logged but don't throw)
 *
 * @module send-guest-notification
 */

import {
  sendRequestConfirmedEmail,
  sendRequestAcceptedEmail,
  sendRequestDeliveredEmail,
} from "./send-email";

/**
 * Notification types supported by this module
 */
export type NotificationType = "confirmed" | "accepted" | "delivered";

/**
 * Request data for checking if it's a guest request
 */
export interface RequestForGuestCheck {
  guest_email: string | null;
  consumer_id: string | null;
}

/**
 * Base data required for all guest notifications
 */
interface BaseNotificationData {
  guestEmail: string;
  guestName: string;
  requestId: string;
  trackingToken: string;
  amount: number;
  address: string;
}

/**
 * Data for "confirmed" notification
 */
export interface ConfirmedNotificationData extends BaseNotificationData {
  type: "confirmed";
  supplierPhone?: string;
}

/**
 * Data for "accepted" notification
 */
export interface AcceptedNotificationData extends BaseNotificationData {
  type: "accepted";
  supplierName: string;
  deliveryWindow?: string;
}

/**
 * Data for "delivered" notification
 */
export interface DeliveredNotificationData extends BaseNotificationData {
  type: "delivered";
  supplierName: string;
  deliveredAt: string;
}

/**
 * Union type for all notification data
 */
export type GuestNotificationData =
  | ConfirmedNotificationData
  | AcceptedNotificationData
  | DeliveredNotificationData;

/**
 * Determines if a request is from a true guest (not a registered user)
 *
 * A request is considered a guest request if:
 * - guest_email is provided (not null/empty)
 * - consumer_id is null (no registered user associated)
 *
 * @param request - Request object with guest_email and consumer_id fields
 * @returns true if this is a guest request that should receive email notifications
 */
export function isGuestRequest(request: RequestForGuestCheck): boolean {
  return !!request.guest_email && !request.consumer_id;
}

/**
 * Masks an email address for privacy-conscious logging
 *
 * Shows first 2 characters of local part followed by *** and the full domain
 * Example: "john.doe@example.com" -> "jo***@example.com"
 *
 * @param email - Email address to mask
 * @returns Masked email string
 */
export function maskEmail(email: string): string {
  const atIndex = email.indexOf("@");
  if (atIndex <= 0) return "***";

  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex);
  const visibleChars = Math.min(2, local.length);
  return `${local.slice(0, visibleChars)}***${domain}`;
}

/**
 * Sends an email notification to a guest consumer
 *
 * This function:
 * 1. Constructs the tracking URL from the tracking token
 * 2. Routes to the appropriate email template based on notification type
 * 3. Logs success/failure with masked email address
 * 4. Never throws - errors are caught and logged
 *
 * @param data - Notification data including type, guest info, and request details
 * @returns Promise that resolves when send attempt completes (does not indicate success)
 */
export async function sendGuestNotification(
  data: GuestNotificationData
): Promise<void> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://nitoagua.vercel.app";
  const trackingUrl = `${baseUrl}/track/${data.trackingToken}`;
  const maskedEmail = maskEmail(data.guestEmail);

  try {
    let result;

    switch (data.type) {
      case "confirmed":
        result = await sendRequestConfirmedEmail({
          to: data.guestEmail,
          customerName: data.guestName,
          requestId: data.requestId,
          trackingUrl,
          amount: data.amount,
          address: data.address,
        });
        break;

      case "accepted":
        result = await sendRequestAcceptedEmail({
          to: data.guestEmail,
          customerName: data.guestName,
          requestId: data.requestId,
          trackingUrl,
          amount: data.amount,
          address: data.address,
          supplierName: data.supplierName,
          estimatedDelivery: data.deliveryWindow || "A la brevedad posible",
        });
        break;

      case "delivered":
        result = await sendRequestDeliveredEmail({
          to: data.guestEmail,
          customerName: data.guestName,
          requestId: data.requestId,
          amount: data.amount,
          address: data.address,
          supplierName: data.supplierName,
          deliveredAt: data.deliveredAt,
          feedbackUrl: `${baseUrl}/feedback`, // Future: link to feedback form
        });
        break;
    }

    if (result.error) {
      console.error(`[EMAIL] Failed to send ${data.type}:`, result.error.message);
    } else {
      console.log(`[EMAIL] Sent ${data.type} to ${maskedEmail}`);
    }
  } catch (error) {
    // Never throw - email failure should not block API response
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[EMAIL] Failed to send ${data.type}:`, message);
  }
}

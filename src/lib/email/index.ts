// Re-export email utilities
export { getResendClient, EMAIL_CONFIG } from "./resend";
export {
  sendRequestConfirmedEmail,
  sendRequestAcceptedEmail,
  sendRequestDeliveredEmail,
  type SendRequestConfirmedEmailParams,
  type SendRequestAcceptedEmailParams,
  type SendRequestDeliveredEmailParams,
  type EmailResult,
} from "./send-email";

// Guest notification utilities
export {
  isGuestRequest,
  maskEmail,
  sendGuestNotification,
  type NotificationType,
  type RequestForGuestCheck,
  type GuestNotificationData,
  type ConfirmedNotificationData,
  type AcceptedNotificationData,
  type DeliveredNotificationData,
} from "./send-guest-notification";

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

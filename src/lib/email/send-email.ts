import { getResendClient, EMAIL_CONFIG } from "./resend";
import RequestConfirmed from "../../../emails/request-confirmed";
import RequestAccepted from "../../../emails/request-accepted";
import RequestDelivered from "../../../emails/request-delivered";

// Check if we're in development mode - mock emails instead of sending
const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Log email details to console in development mode instead of sending
 */
function logMockEmail(type: string, to: string, subject: string, details: Record<string, unknown>) {
  console.log("\n" + "=".repeat(60));
  console.log(`📧 [EMAIL MOCK] ${type.toUpperCase()}`);
  console.log("=".repeat(60));
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Details:`);
  Object.entries(details).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  console.log("=".repeat(60) + "\n");
}

// Type definitions for email payloads
export interface SendRequestConfirmedEmailParams {
  to: string;
  customerName: string;
  requestId: string;
  trackingUrl: string;
  amount: number;
  address: string;
}

export interface SendRequestAcceptedEmailParams {
  to: string;
  customerName: string;
  requestId: string;
  trackingUrl: string;
  amount: number;
  address: string;
  supplierName: string;
  estimatedDelivery: string;
}

export interface SendRequestDeliveredEmailParams {
  to: string;
  customerName: string;
  requestId: string;
  amount: number;
  address: string;
  supplierName: string;
  deliveredAt: string;
  feedbackUrl: string;
}

// Result type for email operations
export type EmailResult =
  | { data: { id: string }; error: null }
  | { data: null; error: { message: string; code?: string } };

/**
 * Send a request confirmation email when a water request is submitted
 */
export async function sendRequestConfirmedEmail(
  params: SendRequestConfirmedEmailParams
): Promise<EmailResult> {
  const subject = `¡Solicitud Recibida! - ${params.requestId}`;

  // In development, just log to console
  if (isDevelopment) {
    logMockEmail("Request Confirmed", params.to, subject, {
      customerName: params.customerName,
      requestId: params.requestId,
      trackingUrl: params.trackingUrl,
      amount: `${params.amount}L`,
      address: params.address,
    });
    return { data: { id: "mock-" + Date.now() }, error: null };
  }

  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn("[Email] Skipping email send - client not configured");
      return { data: null, error: { message: "Email client not configured", code: "NOT_CONFIGURED" } };
    }

    const { to, ...templateProps } = params;

    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from.noreply,
      to: [to],
      subject,
      react: RequestConfirmed(templateProps),
    });

    if (error) {
      console.error("[Email] Failed to send request confirmed email:", error);
      return { data: null, error: { message: error.message } };
    }

    console.log("[Email] Request confirmed email sent:", data?.id);
    return { data: { id: data?.id ?? "" }, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Email] Exception sending request confirmed email:", message);
    return { data: null, error: { message } };
  }
}

/**
 * Send a request accepted email when a supplier accepts a request
 */
export async function sendRequestAcceptedEmail(
  params: SendRequestAcceptedEmailParams
): Promise<EmailResult> {
  const subject = `¡Solicitud Aceptada! - ${params.requestId}`;

  // In development, just log to console
  if (isDevelopment) {
    logMockEmail("Request Accepted", params.to, subject, {
      customerName: params.customerName,
      requestId: params.requestId,
      trackingUrl: params.trackingUrl,
      amount: `${params.amount}L`,
      address: params.address,
      supplierName: params.supplierName,
      estimatedDelivery: params.estimatedDelivery,
    });
    return { data: { id: "mock-" + Date.now() }, error: null };
  }

  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn("[Email] Skipping email send - client not configured");
      return { data: null, error: { message: "Email client not configured", code: "NOT_CONFIGURED" } };
    }

    const { to, ...templateProps } = params;

    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from.noreply,
      to: [to],
      subject,
      react: RequestAccepted(templateProps),
    });

    if (error) {
      console.error("[Email] Failed to send request accepted email:", error);
      return { data: null, error: { message: error.message } };
    }

    console.log("[Email] Request accepted email sent:", data?.id);
    return { data: { id: data?.id ?? "" }, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Email] Exception sending request accepted email:", message);
    return { data: null, error: { message } };
  }
}

/**
 * Send a request delivered email when a request is completed
 */
export async function sendRequestDeliveredEmail(
  params: SendRequestDeliveredEmailParams
): Promise<EmailResult> {
  const subject = `¡Entrega Completada! - ${params.requestId}`;

  // In development, just log to console
  if (isDevelopment) {
    logMockEmail("Request Delivered", params.to, subject, {
      customerName: params.customerName,
      requestId: params.requestId,
      amount: `${params.amount}L`,
      address: params.address,
      supplierName: params.supplierName,
      deliveredAt: params.deliveredAt,
      feedbackUrl: params.feedbackUrl,
    });
    return { data: { id: "mock-" + Date.now() }, error: null };
  }

  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn("[Email] Skipping email send - client not configured");
      return { data: null, error: { message: "Email client not configured", code: "NOT_CONFIGURED" } };
    }

    const { to, ...templateProps } = params;

    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from.noreply,
      to: [to],
      subject,
      react: RequestDelivered(templateProps),
    });

    if (error) {
      console.error("[Email] Failed to send request delivered email:", error);
      return { data: null, error: { message: error.message } };
    }

    console.log("[Email] Request delivered email sent:", data?.id);
    return { data: { id: data?.id ?? "" }, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Email] Exception sending request delivered email:", message);
    return { data: null, error: { message } };
  }
}

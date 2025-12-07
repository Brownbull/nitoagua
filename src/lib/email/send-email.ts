import { getResendClient, EMAIL_CONFIG } from "./resend";
import RequestConfirmed from "../../../emails/request-confirmed";
import RequestAccepted from "../../../emails/request-accepted";
import RequestDelivered from "../../../emails/request-delivered";

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
      subject: `¡Solicitud Recibida! - ${params.requestId}`,
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
      subject: `¡Solicitud Aceptada! - ${params.requestId}`,
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
      subject: `¡Entrega Completada! - ${params.requestId}`,
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

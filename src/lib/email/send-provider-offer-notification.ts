/**
 * Provider Offer Notification Email Helper
 *
 * Handles sending email notifications to providers when their offers are accepted.
 * This module wraps the core email sending functions with:
 * - Development mode logging (no actual emails sent in dev)
 * - Non-blocking error handling (failures logged but don't throw)
 * - Privacy-conscious logging
 *
 * @module send-provider-offer-notification
 */

import { getResendClient, EMAIL_CONFIG } from "./resend";
import OfferAccepted from "../../../emails/offer-accepted";

// Check if we're in development mode - mock emails instead of sending
const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Log email details to console in development mode instead of sending
 */
function logMockEmail(
  type: string,
  to: string,
  subject: string,
  details: Record<string, unknown>
) {
  console.log("\n" + "=".repeat(60));
  console.log(`[EMAIL MOCK] ${type.toUpperCase()}`);
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
export interface SendOfferAcceptedEmailParams {
  to: string;
  providerName: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  amount: number;
  deliveryWindowStart: string;
  deliveryWindowEnd: string;
  requestId: string;
}

// Result type for email operations
export type EmailResult =
  | { data: { id: string }; error: null }
  | { data: null; error: { message: string; code?: string } };

/**
 * Send offer accepted email to provider
 *
 * AC: 8.5.2 - Email notification sent with delivery details via Resend
 * AC: 8.5.3 - Includes: customer name, phone, full address, amount, delivery window
 */
export async function sendOfferAcceptedEmail(
  params: SendOfferAcceptedEmailParams
): Promise<EmailResult> {
  const subject = `¡Tu oferta fue aceptada! - NitoAgua`;

  // In development, just log to console
  if (isDevelopment) {
    logMockEmail("Offer Accepted (Provider)", params.to, subject, {
      providerName: params.providerName,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      deliveryAddress: params.deliveryAddress,
      amount: `${params.amount}L`,
      deliveryWindow: `${params.deliveryWindowStart} - ${params.deliveryWindowEnd}`,
      requestId: params.requestId,
    });
    return { data: { id: "mock-" + Date.now() }, error: null };
  }

  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn("[Email] Skipping email send - client not configured");
      return {
        data: null,
        error: { message: "Email client not configured", code: "NOT_CONFIGURED" },
      };
    }

    const { to, ...templateProps } = params;

    // Generate delivery URL
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://nitoagua.vercel.app";
    const deliveryUrl = `${baseUrl}/provider/deliveries/${params.requestId}`;

    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from.noreply,
      to: [to],
      subject,
      react: OfferAccepted({
        ...templateProps,
        deliveryUrl,
      }),
    });

    if (error) {
      console.error("[Email] Failed to send offer accepted email:", error);
      return { data: null, error: { message: error.message } };
    }

    console.log("[Email] Offer accepted email sent:", data?.id);
    return { data: { id: data?.id ?? "" }, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Email] Exception sending offer accepted email:", message);
    return { data: null, error: { message } };
  }
}

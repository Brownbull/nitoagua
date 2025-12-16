/**
 * Provider Email Notification Helper
 *
 * Handles sending email notifications to providers for verification status changes.
 * - Approved: Provider can start working
 * - Rejected: Provider application was declined
 * - More Info Needed: Provider needs to resubmit documents
 *
 * @module send-provider-notification
 */

import { getResendClient, EMAIL_CONFIG } from "./resend";
import ProviderApproved from "../../../emails/provider-approved";
import ProviderRejected from "../../../emails/provider-rejected";
import ProviderMoreInfoNeeded from "../../../emails/provider-more-info-needed";

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
    console.log(`  ${key}: ${JSON.stringify(value)}`);
  });
  console.log("=".repeat(60) + "\n");
}

// Result type for email operations
export type EmailResult =
  | { data: { id: string }; error: null }
  | { data: null; error: { message: string; code?: string } };

// Base URL for links in emails
const getBaseUrl = () => process.env.NEXT_PUBLIC_APP_URL || "https://nitoagua.vercel.app";

export interface SendProviderApprovedEmailParams {
  to: string;
  providerName: string;
}

export interface SendProviderRejectedEmailParams {
  to: string;
  providerName: string;
  rejectionReason?: string;
}

export interface SendProviderMoreInfoNeededEmailParams {
  to: string;
  providerName: string;
  missingDocuments: string[];
  additionalMessage?: string;
}

/**
 * Send email when provider application is approved
 */
export async function sendProviderApprovedEmail(
  params: SendProviderApprovedEmailParams
): Promise<EmailResult> {
  const subject = "¡Tu cuenta de proveedor ha sido aprobada! - nitoagua";
  const dashboardUrl = `${getBaseUrl()}/supplier/dashboard`;

  // In development, just log to console
  if (isDevelopment) {
    logMockEmail("Provider Approved", params.to, subject, {
      providerName: params.providerName,
      dashboardUrl,
    });
    return { data: { id: "mock-" + Date.now() }, error: null };
  }

  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn("[Email] Skipping email send - client not configured");
      return { data: null, error: { message: "Email client not configured", code: "NOT_CONFIGURED" } };
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from.noreply,
      to: [params.to],
      subject,
      react: ProviderApproved({
        providerName: params.providerName,
        dashboardUrl,
      }),
    });

    if (error) {
      console.error("[Email] Failed to send provider approved email:", error);
      return { data: null, error: { message: error.message } };
    }

    console.log("[Email] Provider approved email sent:", data?.id);
    return { data: { id: data?.id ?? "" }, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Email] Exception sending provider approved email:", message);
    return { data: null, error: { message } };
  }
}

/**
 * Send email when provider application is rejected
 */
export async function sendProviderRejectedEmail(
  params: SendProviderRejectedEmailParams
): Promise<EmailResult> {
  const subject = "Actualización sobre tu solicitud - nitoagua";
  const supportEmail = "soporte@nitoagua.cl";

  // In development, just log to console
  if (isDevelopment) {
    logMockEmail("Provider Rejected", params.to, subject, {
      providerName: params.providerName,
      rejectionReason: params.rejectionReason,
      supportEmail,
    });
    return { data: { id: "mock-" + Date.now() }, error: null };
  }

  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn("[Email] Skipping email send - client not configured");
      return { data: null, error: { message: "Email client not configured", code: "NOT_CONFIGURED" } };
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from.noreply,
      to: [params.to],
      subject,
      react: ProviderRejected({
        providerName: params.providerName,
        rejectionReason: params.rejectionReason,
        supportEmail,
      }),
    });

    if (error) {
      console.error("[Email] Failed to send provider rejected email:", error);
      return { data: null, error: { message: error.message } };
    }

    console.log("[Email] Provider rejected email sent:", data?.id);
    return { data: { id: data?.id ?? "" }, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Email] Exception sending provider rejected email:", message);
    return { data: null, error: { message } };
  }
}

/**
 * Send email when provider needs to provide more information
 */
export async function sendProviderMoreInfoNeededEmail(
  params: SendProviderMoreInfoNeededEmailParams
): Promise<EmailResult> {
  const subject = "Se requiere información adicional - nitoagua";
  const resubmitUrl = `${getBaseUrl()}/provider/onboarding/pending`;

  // In development, just log to console
  if (isDevelopment) {
    logMockEmail("Provider More Info Needed", params.to, subject, {
      providerName: params.providerName,
      missingDocuments: params.missingDocuments,
      additionalMessage: params.additionalMessage,
      resubmitUrl,
    });
    return { data: { id: "mock-" + Date.now() }, error: null };
  }

  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn("[Email] Skipping email send - client not configured");
      return { data: null, error: { message: "Email client not configured", code: "NOT_CONFIGURED" } };
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from.noreply,
      to: [params.to],
      subject,
      react: ProviderMoreInfoNeeded({
        providerName: params.providerName,
        missingDocuments: params.missingDocuments,
        additionalMessage: params.additionalMessage,
        resubmitUrl,
      }),
    });

    if (error) {
      console.error("[Email] Failed to send provider more info needed email:", error);
      return { data: null, error: { message: error.message } };
    }

    console.log("[Email] Provider more info needed email sent:", data?.id);
    return { data: { id: data?.id ?? "" }, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Email] Exception sending provider more info needed email:", message);
    return { data: null, error: { message } };
  }
}

/**
 * Mask an email address for privacy-conscious logging
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
 * Send provider verification status notification (unified function)
 */
export async function sendProviderVerificationNotification(params: {
  email: string;
  providerName: string;
  status: "approved" | "rejected" | "more_info_needed";
  rejectionReason?: string;
  missingDocuments?: string[];
}): Promise<void> {
  const maskedEmail = maskEmail(params.email);

  try {
    let result: EmailResult;

    switch (params.status) {
      case "approved":
        result = await sendProviderApprovedEmail({
          to: params.email,
          providerName: params.providerName,
        });
        break;

      case "rejected":
        result = await sendProviderRejectedEmail({
          to: params.email,
          providerName: params.providerName,
          rejectionReason: params.rejectionReason,
        });
        break;

      case "more_info_needed":
        result = await sendProviderMoreInfoNeededEmail({
          to: params.email,
          providerName: params.providerName,
          missingDocuments: params.missingDocuments || [],
          additionalMessage: params.rejectionReason,
        });
        break;
    }

    if (result.error) {
      console.error(`[EMAIL] Failed to send provider ${params.status} notification:`, result.error.message);
    } else {
      console.log(`[EMAIL] Sent provider ${params.status} notification to ${maskedEmail}`);
    }
  } catch (error) {
    // Never throw - email failure should not block API response
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[EMAIL] Failed to send provider ${params.status} notification:`, message);
  }
}

import { Resend } from "resend";

// Lazy-initialized Resend client
// IMPORTANT: RESEND_API_KEY must be set as a server-side environment variable
// Do NOT use NEXT_PUBLIC_ prefix - this key must never be exposed to the client

let resendClient: Resend | null = null;

/**
 * Get the Resend client instance (lazy initialization)
 * Returns null if RESEND_API_KEY is not configured
 */
export function getResendClient(): Resend | null {
  if (resendClient) return resendClient;

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(
      "[Email] RESEND_API_KEY not configured. Email sending will be disabled."
    );
    return null;
  }

  resendClient = new Resend(apiKey);
  return resendClient;
}

// Email configuration
export const EMAIL_CONFIG = {
  // During development/testing, use Resend's test domain
  // For production, configure a verified custom domain
  from: {
    // Default sender for nitoagua notifications
    noreply: "nitoagua <onboarding@resend.dev>",
    // For production with verified domain:
    // noreply: "nitoagua <noreply@nitoagua.cl>",
  },
  // Resend free tier limits (as of 2025)
  limits: {
    dailyLimit: 100,
    monthlyLimit: 3000,
    rateLimit: 2, // requests per second
  },
} as const;

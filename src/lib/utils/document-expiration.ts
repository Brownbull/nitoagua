/**
 * Document expiration utility functions
 * These are pure functions that can be used on both server and client
 */

export interface DocumentExpirationStatus {
  status: "valid" | "expiring_soon" | "expired" | "no_expiry";
  daysUntilExpiry?: number;
}

/**
 * Calculate document expiration status
 */
export function getExpirationStatus(expiresAt: string | null): DocumentExpirationStatus {
  if (!expiresAt) {
    return { status: "no_expiry" };
  }

  const now = new Date();
  const expirationDate = new Date(expiresAt);
  const diffTime = expirationDate.getTime() - now.getTime();
  const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return { status: "expired", daysUntilExpiry };
  }
  if (daysUntilExpiry <= 30) {
    return { status: "expiring_soon", daysUntilExpiry };
  }
  return { status: "valid", daysUntilExpiry };
}

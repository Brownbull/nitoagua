/**
 * Countdown timer utilities
 * AC: 8.3.3 - Countdown displays "Expira en 25:30" format
 * NFR5: Countdown timer accuracy ±1 second
 */

/**
 * Format milliseconds to display string
 * Format as "25:30" (MM:SS) or "1:25:30" (H:MM:SS) if > 1 hour
 * @param ms - Time remaining in milliseconds
 * @returns Formatted string or "Expirada" if expired
 */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return "Expirada";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // If more than 1 hour, show H:MM:SS
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  // Otherwise show MM:SS
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Calculate time remaining from an expiration date
 * @param expiresAt - Expiration timestamp (ISO string or Date)
 * @returns Time remaining in milliseconds (0 if expired)
 */
export function calculateTimeRemaining(expiresAt: string | Date): number {
  const expiresAtDate = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  const now = Date.now();
  const diff = expiresAtDate.getTime() - now;
  return Math.max(0, diff);
}

/**
 * Check if time remaining is in warning state (< 5 minutes)
 */
export function isWarningState(ms: number): boolean {
  return ms > 0 && ms < 5 * 60 * 1000;
}

/**
 * Check if time remaining is in critical state (< 1 minute)
 */
export function isCriticalState(ms: number): boolean {
  return ms > 0 && ms < 60 * 1000;
}

/**
 * Countdown timer utilities
 * AC: 8.3.3 - Countdown displays "Expira en 25:30" format
 * AC: 10.3.1, 10.3.2 - Format as MM:SS when < 1 hour, "X h MM min" when > 1 hour
 * NFR5: Countdown timer accuracy ±1 second
 */

// Thresholds in milliseconds
export const COUNTDOWN_THRESHOLDS = {
  /** Warning threshold: < 10 minutes (orange) - AC10.3.3 */
  WARNING_MS: 10 * 60 * 1000,
  /** Critical threshold: < 5 minutes (red) - AC10.3.3 */
  CRITICAL_MS: 5 * 60 * 1000,
  /** One hour in milliseconds */
  ONE_HOUR_MS: 60 * 60 * 1000,
};

/**
 * Format milliseconds to display string
 * AC10.3.1: Format as "MM:SS" when < 1 hour
 * AC10.3.2: Format as "X h MM min" when > 1 hour
 * @param ms - Time remaining in milliseconds
 * @returns Formatted string or "Expirada" if expired
 */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return "Expirada";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // AC10.3.2: If more than 1 hour, show "X h MM min" format
  if (hours > 0) {
    return `${hours} h ${minutes.toString().padStart(2, "0")} min`;
  }

  // AC10.3.1: Otherwise show MM:SS format
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
 * Check if time remaining is in warning state (< 10 minutes)
 * AC10.3.3: Orange when < 10 min
 */
export function isWarningState(ms: number): boolean {
  return ms > 0 && ms < COUNTDOWN_THRESHOLDS.WARNING_MS;
}

/**
 * Check if time remaining is in critical state (< 5 minutes)
 * AC10.3.3: Red when < 5 min
 */
export function isCriticalState(ms: number): boolean {
  return ms > 0 && ms < COUNTDOWN_THRESHOLDS.CRITICAL_MS;
}

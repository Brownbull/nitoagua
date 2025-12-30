"use client";

import { useState, useEffect, useRef, memo, useMemo } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatCountdown,
  isWarningState,
  isCriticalState,
} from "@/lib/utils/countdown";

// Re-export formatCountdown for backward compatibility
export { formatCountdown } from "@/lib/utils/countdown";

interface CountdownTimerProps {
  /**
   * The timestamp when the countdown expires (ISO string or Date)
   */
  expiresAt: string | Date;
  /**
   * Callback when countdown reaches zero
   */
  onExpire?: () => void;
  /**
   * Show "Expira en" prefix before the timer
   * @default true
   */
  showPrefix?: boolean;
  /**
   * Show clock icon before the timer
   * @default true
   */
  showIcon?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * CSS classes for when timer is in warning state (< 10 minutes)
   * AC10.3.3: Orange when < 10 min
   * @default "text-orange-500"
   */
  warningClassName?: string;
  /**
   * CSS classes for when timer is in critical state (< 5 minutes)
   * AC10.3.3: Red when < 5 min
   * @default "text-red-500 font-semibold"
   */
  criticalClassName?: string;
  /**
   * Test ID for the component (passed through to DOM)
   */
  "data-testid"?: string;
}

/**
 * Calculate initial remaining time (used for SSR-safe initialization)
 */
function calculateRemaining(expiresAt: string | Date): number {
  const expiresAtDate = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  const diff = expiresAtDate.getTime() - Date.now();
  return Math.max(0, diff);
}

/**
 * Hook for countdown timer with drift correction
 * Per Dev Notes: Uses server time for validation, client for display
 * NFR5: Countdown timer accuracy ±1 second
 */
export function useCountdown(expiresAt: string | Date): number {
  // Initialize with calculated value to prevent false expiration on first render
  const [remaining, setRemaining] = useState<number>(() => calculateRemaining(expiresAt));
  const targetTimeRef = useRef<number>(0);

  useEffect(() => {
    // Parse expiration timestamp
    const expiresAtDate = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
    targetTimeRef.current = expiresAtDate.getTime();

    // Calculate remaining time with drift correction
    const updateRemaining = () => {
      const now = Date.now();
      const diff = targetTimeRef.current - now;
      setRemaining(Math.max(0, diff));
    };

    // Initial calculation (in case expiresAt changed)
    updateRemaining();

    // Update every second
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return remaining;
}

/**
 * Countdown Timer Component
 * AC: 8.3.3 - Display countdown in "Expira en 25:30" format
 * AC: 8.3.2 - Show time remaining countdown for pending offers
 * AC: 10.3.1, 10.3.2, 10.3.3 - Consumer urgency colors
 * NFR5: ±1 second accuracy with drift correction
 *
 * Performance: Wrapped in memo to prevent re-renders from parent state changes
 * Note: This component still updates every second internally via useCountdown hook
 */
function CountdownTimerComponent({
  expiresAt,
  onExpire,
  showPrefix = true,
  showIcon = true,
  className,
  warningClassName = "text-orange-500",
  criticalClassName = "text-red-500 font-semibold",
  "data-testid": testId,
}: CountdownTimerProps) {
  const remaining = useCountdown(expiresAt);
  const hasExpiredRef = useRef(false);

  // Trigger onExpire callback when timer reaches zero
  useEffect(() => {
    if (remaining === 0 && !hasExpiredRef.current && onExpire) {
      hasExpiredRef.current = true;
      onExpire();
    }
  }, [remaining, onExpire]);

  // Reset expired flag if expiresAt changes (e.g., new offer)
  useEffect(() => {
    hasExpiredRef.current = false;
  }, [expiresAt]);

  // Memoize computed state values
  const { isExpired, isWarning, isCritical } = useMemo(() => ({
    isExpired: remaining === 0,
    isWarning: isWarningState(remaining),
    isCritical: isCriticalState(remaining),
  }), [remaining]);

  const timeString = formatCountdown(remaining);

  // Memoize state className
  const stateClassName = useMemo(() => {
    if (isCritical) return criticalClassName;
    if (isWarning) return warningClassName;
    return "";
  }, [isCritical, isWarning, criticalClassName, warningClassName]);

  if (isExpired) {
    return (
      <span
        className={cn("text-gray-500 text-sm", className)}
        data-testid={testId || "countdown-expired"}
        aria-live="polite"
        aria-label="Oferta expirada"
      >
        Expirada
      </span>
    );
  }

  return (
    <span
      className={cn("flex items-center gap-1 text-sm", stateClassName, className)}
      data-testid={testId || "countdown-timer"}
      aria-live="polite"
      aria-label={`Expira en ${timeString}`}
    >
      {showIcon && <Clock className="h-3.5 w-3.5" aria-hidden="true" />}
      {showPrefix && <span>Expira en</span>}
      <span className="tabular-nums font-medium" data-testid="countdown-value">
        {timeString}
      </span>
    </span>
  );
}

// Memoized export - prevents re-renders when parent re-renders with same props
// The internal countdown still updates via useCountdown hook
export const CountdownTimer = memo(CountdownTimerComponent);
export default CountdownTimer;

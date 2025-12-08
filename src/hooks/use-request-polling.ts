"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface PollResult {
  changed: boolean;
  from?: string;
  to?: string;
  data?: RequestData;
  error?: Error;
}

interface RequestData {
  id: string;
  status: string;
  delivery_window?: string | null;
  [key: string]: unknown;
}

interface UseRequestPollingOptions {
  /** Polling interval in milliseconds (default: 30000 = 30 seconds) */
  interval?: number;
  /** Whether polling is enabled (default: true) */
  enabled?: boolean;
  /** Callback when status changes */
  onStatusChange?: (from: string, to: string, data: RequestData) => void;
}

interface UseRequestPollingResult {
  /** Current status from polling */
  status: string;
  /** Whether a poll is currently in progress */
  isPolling: boolean;
  /** Manually trigger a poll check */
  checkStatus: () => Promise<PollResult>;
  /** The latest request data from polling */
  data: RequestData | null;
}

/**
 * Hook for polling request status updates
 *
 * Used by registered consumers to get real-time-ish status updates
 * for their water requests. Polls every 30 seconds by default.
 *
 * @example
 * ```tsx
 * const { status, isPolling } = useRequestPolling(requestId, initialStatus, {
 *   onStatusChange: (from, to, data) => {
 *     toast.success(`Status changed from ${from} to ${to}`);
 *   }
 * });
 * ```
 */
export function useRequestPolling(
  requestId: string,
  initialStatus: string,
  options: UseRequestPollingOptions = {}
): UseRequestPollingResult {
  const {
    interval = 30000,
    enabled = true,
    onStatusChange
  } = options;

  const [status, setStatus] = useState(initialStatus);
  const [isPolling, setIsPolling] = useState(false);
  const [data, setData] = useState<RequestData | null>(null);

  // Use refs to avoid stale closures in callbacks
  const statusRef = useRef(status);
  const onStatusChangeRef = useRef(onStatusChange);

  // Keep refs updated
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  const checkStatus = useCallback(async (): Promise<PollResult> => {
    if (!requestId) {
      return { changed: false };
    }

    try {
      setIsPolling(true);

      const response = await fetch(`/api/requests/${requestId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Prevent caching to always get fresh data
        cache: "no-store",
      });

      if (!response.ok) {
        // Don't throw for auth/permission errors - just log and continue
        console.error("[POLLING] Request failed:", response.status);
        return { changed: false, error: new Error(`HTTP ${response.status}`) };
      }

      const { data: requestData, error } = await response.json();

      if (error || !requestData) {
        console.error("[POLLING] API error:", error);
        return { changed: false, error: new Error(error?.message || "Unknown error") };
      }

      const newStatus = requestData.status;
      const previousStatus = statusRef.current;

      if (newStatus && newStatus !== previousStatus) {
        setStatus(newStatus);
        setData(requestData);

        // Call the callback if provided
        if (onStatusChangeRef.current) {
          onStatusChangeRef.current(previousStatus, newStatus, requestData);
        }

        return {
          changed: true,
          from: previousStatus,
          to: newStatus,
          data: requestData
        };
      }

      // Update data even if status didn't change (delivery_window might have updated)
      setData(requestData);
      return { changed: false, data: requestData };
    } catch (error) {
      // Graceful degradation: log error but don't crash
      console.error("[POLLING] Error:", error);
      return {
        changed: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    } finally {
      setIsPolling(false);
    }
  }, [requestId]);

  // Set up polling interval
  useEffect(() => {
    if (!enabled || !requestId) {
      return;
    }

    // Don't poll for terminal statuses
    const terminalStatuses = ["delivered", "cancelled"];
    if (terminalStatuses.includes(status)) {
      return;
    }

    const intervalId = setInterval(checkStatus, interval);

    // Cleanup on unmount or when dependencies change
    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, requestId, interval, status, checkStatus]);

  return {
    status,
    isPolling,
    checkStatus,
    data,
  };
}

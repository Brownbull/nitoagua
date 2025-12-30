"use client";

import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Session Expired Toast Component
 * Story 12.6-1: AC12.6.1.4 - Show toast message for session expiry
 *
 * Displays a toast notification when user lands on login page
 * after their session expired.
 */
export function SessionExpiredToast() {
  useEffect(() => {
    // Show toast immediately when component mounts
    toast.warning("Tu sesión expiró. Por favor, inicia sesión nuevamente.", {
      duration: 5000,
      id: "session-expired", // Prevent duplicate toasts
    });
  }, []);

  // This is a client component that only triggers toast, no visual render
  return null;
}

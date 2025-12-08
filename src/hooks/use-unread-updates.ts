"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const LAST_HISTORY_VIEW_KEY = "nitoagua_last_history_view";

/**
 * Get the timestamp of when the user last viewed the history page
 */
export function getLastHistoryView(): Date | null {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = localStorage.getItem(LAST_HISTORY_VIEW_KEY);
  return stored ? new Date(stored) : null;
}

/**
 * Update the timestamp of when the user last viewed the history page
 */
export function updateLastHistoryView(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(LAST_HISTORY_VIEW_KEY, new Date().toISOString());
}

interface UnreadState {
  hasUnread: boolean;
  unreadCount: number;
  loading: boolean;
}

/**
 * Hook for tracking unread request updates
 *
 * Used by consumer navigation to show badge indicator when there
 * are status updates since the user last viewed the history page.
 *
 * AC5-3-2: History page shows unread indicator
 * - Badge on History tab/link when there are status updates since last view
 * - Badge clears when user visits history page
 */
export function useUnreadUpdates() {
  const [state, setState] = useState<UnreadState>({
    hasUnread: false,
    unreadCount: 0,
    loading: true,
  });
  const isMounted = useRef(true);

  // Check for unread on mount using an async effect
  useEffect(() => {
    isMounted.current = true;

    async function fetchUnread() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!isMounted.current) return;

        if (!user) {
          setState({ hasUnread: false, unreadCount: 0, loading: false });
          return;
        }

        const lastView = getLastHistoryView();

        // If never viewed history, any requests with updates count as unread
        // But only count non-pending statuses as "updates" (pending is initial state)
        // Use status-specific timestamps since there's no updated_at column
        const { data: requests, error } = await supabase
          .from("water_requests")
          .select("id, status, accepted_at, delivered_at, cancelled_at")
          .eq("consumer_id", user.id)
          .in("status", ["accepted", "delivered", "cancelled"]); // Only count status changes

        if (!isMounted.current) return;

        if (error) {
          console.error("[UNREAD] Error fetching requests:", error);
          setState(prev => ({ ...prev, loading: false }));
          return;
        }

        if (!requests || requests.length === 0) {
          setState({ hasUnread: false, unreadCount: 0, loading: false });
          return;
        }

        // Count requests updated since last view using status-specific timestamps
        const unread = requests.filter((r) => {
          // Get the timestamp of the most recent status change
          const statusTimestamp = r.delivered_at || r.cancelled_at || r.accepted_at;
          if (!statusTimestamp) return false;
          const changedAt = new Date(statusTimestamp);
          return !lastView || changedAt > lastView;
        });

        setState({
          hasUnread: unread.length > 0,
          unreadCount: unread.length,
          loading: false,
        });
      } catch (error) {
        console.error("[UNREAD] Error:", error);
        if (isMounted.current) {
          setState(prev => ({ ...prev, loading: false }));
        }
      }
    }

    fetchUnread();

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Mark as read (clears badge)
  const markAsRead = useCallback(() => {
    updateLastHistoryView();
    setState({ hasUnread: false, unreadCount: 0, loading: false });
  }, []);

  // Refresh function for manual refresh
  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setState({ hasUnread: false, unreadCount: 0, loading: false });
        return;
      }

      const lastView = getLastHistoryView();

      const { data: requests, error } = await supabase
        .from("water_requests")
        .select("id, status, accepted_at, delivered_at, cancelled_at")
        .eq("consumer_id", user.id)
        .in("status", ["accepted", "delivered", "cancelled"]);

      if (error) {
        console.error("[UNREAD] Error fetching requests:", error);
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      if (!requests || requests.length === 0) {
        setState({ hasUnread: false, unreadCount: 0, loading: false });
        return;
      }

      const unread = requests.filter((r) => {
        const statusTimestamp = r.delivered_at || r.cancelled_at || r.accepted_at;
        if (!statusTimestamp) return false;
        const changedAt = new Date(statusTimestamp);
        return !lastView || changedAt > lastView;
      });

      setState({
        hasUnread: unread.length > 0,
        unreadCount: unread.length,
        loading: false,
      });
    } catch (error) {
      console.error("[UNREAD] Error:", error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  return {
    hasUnread: state.hasUnread,
    unreadCount: state.unreadCount,
    loading: state.loading,
    markAsRead,
    refresh,
  };
}

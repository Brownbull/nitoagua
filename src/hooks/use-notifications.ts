"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
  read_at: string | null;
}

interface UseNotificationsOptions {
  /**
   * Enable/disable the hook
   * @default true
   */
  enabled?: boolean;
  /**
   * User ID (if not provided, will be fetched from auth)
   */
  userId?: string;
  /**
   * Callback when a new notification arrives
   */
  onNewNotification?: (notification: Notification) => void;
  /**
   * Polling fallback interval in milliseconds
   * @default 30000 (30 seconds)
   */
  pollingFallbackMs?: number;
}

/**
 * Hook for managing in-app notifications with real-time updates
 * AC: 8.5.1 - Provider receives in-app notification via notifications table
 * AC: 8.5.4 - Click navigates to delivery page
 */
export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    enabled = true,
    userId: initialUserId,
    onNewNotification,
    pollingFallbackMs = 30000,
  } = options;

  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(initialUserId ?? null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch user ID if not provided
  useEffect(() => {
    if (initialUserId) {
      setUserId(initialUserId);
      return;
    }

    const fetchUserId = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };

    fetchUserId();
  }, [initialUserId]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[Notifications] Error fetching:", error);
      return;
    }

    if (data) {
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter((n) => !n.read).length);
    }
    setIsLoading(false);
  }, [userId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("notifications")
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) {
      console.error("[Notifications] Error marking as read:", error);
      return;
    }

    // Update local state
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, [userId]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("notifications")
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      console.error("[Notifications] Error marking all as read:", error);
      return;
    }

    // Update local state
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, read_at: new Date().toISOString() }))
    );
    setUnreadCount(0);
  }, [userId]);

  // Handle new notification (from realtime)
  const handleNewNotification = useCallback(
    (payload: RealtimePostgresChangesPayload<Notification>) => {
      const newNotification = payload.new as Notification;

      console.log("[Notifications] New notification:", newNotification.id, newNotification.type);

      // Add to notifications list
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Trigger callback
      onNewNotification?.(newNotification);
    },
    [onNewNotification]
  );

  // Polling fallback
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    console.log("[Notifications] Starting polling fallback every", pollingFallbackMs, "ms");
    pollingIntervalRef.current = setInterval(() => {
      fetchNotifications();
    }, pollingFallbackMs);
  }, [pollingFallbackMs, fetchNotifications]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Set up realtime subscription
  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    // Initial fetch
    fetchNotifications();

    const supabase = createClient();

    const setupSubscription = async () => {
      // Clean up existing channel
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
      }

      // Subscribe to notifications for this user
      const channel = supabase
        .channel(`user-notifications-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          handleNewNotification
        )
        .subscribe((status, err) => {
          console.log("[Notifications] Subscription status:", status);

          if (status === "SUBSCRIBED") {
            setIsConnected(true);
            stopPolling();
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error("[Notifications] Connection error:", err);
            setIsConnected(false);
            startPolling();
          } else if (status === "CLOSED") {
            setIsConnected(false);
            startPolling();
          }
        });

      channelRef.current = channel;
    };

    setupSubscription();

    return () => {
      stopPolling();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [enabled, userId, fetchNotifications, handleNewNotification, startPolling, stopPolling]);

  // Navigate to notification target
  // AC: 8.5.4 - "Ver Detalles" button links to delivery page
  const navigateToNotification = useCallback(
    (notification: Notification) => {
      // Mark as read first
      markAsRead(notification.id);

      // Navigate based on notification type and data
      const data = notification.data;

      if (notification.type === "offer_accepted" && data?.request_id) {
        // AC: 8.5.4 - Click navigates to /provider/deliveries/[id]
        router.push(`/provider/deliveries/${data.request_id}`);
      } else if (notification.type === "new_offer" && data?.request_id) {
        router.push(`/requests/${data.request_id}`);
      } else {
        // Default: refresh current page
        router.refresh();
      }
    },
    [markAsRead, router]
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    navigateToNotification,
    refresh: fetchNotifications,
  };
}

export default useNotifications;

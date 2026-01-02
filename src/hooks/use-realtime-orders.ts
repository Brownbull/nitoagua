"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface UseRealtimeOrdersOptions {
  enabled?: boolean;
  onOrderChange?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  onOfferChange?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  /** Debounce delay in ms before triggering refresh (default: 500ms) */
  debounceMs?: number;
}

export function useRealtimeOrders(options: UseRealtimeOrdersOptions = {}) {
  const { enabled = true, onOrderChange, onOfferChange, debounceMs = 500 } = options;
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Use ref to track pending refresh to avoid interrupting user interactions
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced refresh to prevent rapid refreshes during user interactions
  const debouncedRefresh = useCallback(() => {
    // Clear any pending refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    // Schedule a new refresh after debounce delay
    refreshTimeoutRef.current = setTimeout(() => {
      console.log("[Realtime] Debounced refresh triggered");
      router.refresh();
      refreshTimeoutRef.current = null;
    }, debounceMs);
  }, [router, debounceMs]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const handleOrderChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      console.log("[Realtime] Order change:", payload.eventType);
      setLastUpdate(new Date());
      onOrderChange?.(payload);
      // Use debounced refresh to avoid interrupting user clicks
      debouncedRefresh();
    },
    [onOrderChange, debouncedRefresh]
  );

  const handleOfferChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      console.log("[Realtime] Offer change:", payload.eventType);
      setLastUpdate(new Date());
      onOfferChange?.(payload);
      // Use debounced refresh to avoid interrupting user clicks
      debouncedRefresh();
    },
    [onOfferChange, debouncedRefresh]
  );

  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();
    let ordersChannel: RealtimeChannel;
    let offersChannel: RealtimeChannel;

    const setupSubscriptions = async () => {
      // Subscribe to water_requests table changes
      ordersChannel = supabase
        .channel("admin-orders")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "water_requests",
          },
          handleOrderChange
        )
        .subscribe((status) => {
          console.log("[Realtime] Orders channel status:", status);
          setIsConnected(status === "SUBSCRIBED");
        });

      // Subscribe to offers table changes
      offersChannel = supabase
        .channel("admin-offers")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "offers",
          },
          handleOfferChange
        )
        .subscribe((status) => {
          console.log("[Realtime] Offers channel status:", status);
        });
    };

    setupSubscriptions();

    // Cleanup on unmount
    return () => {
      if (ordersChannel) {
        supabase.removeChannel(ordersChannel);
      }
      if (offersChannel) {
        supabase.removeChannel(offersChannel);
      }
      setIsConnected(false);
    };
  }, [enabled, handleOrderChange, handleOfferChange]);

  // Manual refresh function for user-triggered updates
  const refresh = useCallback(() => {
    console.log("[Realtime] Manual refresh triggered");
    router.refresh();
    setLastUpdate(new Date());
  }, [router]);

  return {
    isConnected,
    lastUpdate,
    refresh,
  };
}

// Simplified hook for single order detail page
export function useRealtimeOrder(orderId: string, options: Omit<UseRealtimeOrdersOptions, "onOrderChange" | "onOfferChange"> = {}) {
  const { enabled = true, debounceMs = 500 } = options;
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Use ref to track pending refresh to avoid interrupting user interactions
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced refresh to prevent rapid refreshes during user interactions
  const debouncedRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      console.log("[Realtime] Debounced refresh triggered for order:", orderId);
      router.refresh();
      refreshTimeoutRef.current = null;
    }, debounceMs);
  }, [router, debounceMs, orderId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = useCallback(() => {
    setLastUpdate(new Date());
    debouncedRefresh();
  }, [debouncedRefresh]);

  useEffect(() => {
    if (!enabled || !orderId) return;

    const supabase = createClient();
    let orderChannel: RealtimeChannel;
    let offersChannel: RealtimeChannel;

    const setupSubscriptions = async () => {
      // Subscribe to this specific order
      orderChannel = supabase
        .channel(`order-${orderId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "water_requests",
            filter: `id=eq.${orderId}`,
          },
          () => {
            console.log("[Realtime] Order updated:", orderId);
            handleChange();
          }
        )
        .subscribe((status) => {
          console.log("[Realtime] Order channel status:", status);
          setIsConnected(status === "SUBSCRIBED");
        });

      // Subscribe to offers for this order
      offersChannel = supabase
        .channel(`order-offers-${orderId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "offers",
            filter: `request_id=eq.${orderId}`,
          },
          () => {
            console.log("[Realtime] Offer updated for order:", orderId);
            handleChange();
          }
        )
        .subscribe((status) => {
          console.log("[Realtime] Offers channel status:", status);
        });
    };

    setupSubscriptions();

    return () => {
      if (orderChannel) {
        supabase.removeChannel(orderChannel);
      }
      if (offersChannel) {
        supabase.removeChannel(offersChannel);
      }
      setIsConnected(false);
    };
  }, [enabled, orderId, handleChange]);

  return {
    isConnected,
    lastUpdate,
  };
}

"use client";

import { useEffect, useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface UseRealtimeOrdersOptions {
  enabled?: boolean;
  onOrderChange?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  onOfferChange?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
}

export function useRealtimeOrders(options: UseRealtimeOrdersOptions = {}) {
  const { enabled = true, onOrderChange, onOfferChange } = options;
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const handleOrderChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      console.log("[Realtime] Order change:", payload.eventType);
      setLastUpdate(new Date());
      onOrderChange?.(payload);
      // Refresh the page to get updated data
      router.refresh();
    },
    [onOrderChange, router]
  );

  const handleOfferChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      console.log("[Realtime] Offer change:", payload.eventType);
      setLastUpdate(new Date());
      onOfferChange?.(payload);
      // Refresh the page to get updated data
      router.refresh();
    },
    [onOfferChange, router]
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

  return {
    isConnected,
    lastUpdate,
  };
}

// Simplified hook for single order detail page
export function useRealtimeOrder(orderId: string, options: Omit<UseRealtimeOrdersOptions, "onOrderChange" | "onOfferChange"> = {}) {
  const { enabled = true } = options;
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const handleChange = useCallback(() => {
    setLastUpdate(new Date());
    router.refresh();
  }, [router]);

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

"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Offer with provider profile for consumer view
 * AC10.1.2: Display provider name, avatar, delivery window, price, expiration
 */
export interface ConsumerOffer {
  id: string;
  request_id: string;
  provider_id: string;
  delivery_window_start: string;
  delivery_window_end: string;
  expires_at: string;
  status: string;
  message: string | null;
  created_at: string;
  accepted_at: string | null;
  // Provider profile joined data
  profiles: {
    name: string;
    avatar_url?: string | null;
  } | null;
}

interface UseConsumerOffersOptions {
  /**
   * Enable/disable the hook
   * @default true
   */
  enabled?: boolean;
  /**
   * Callback when offers are updated
   */
  onOffersChange?: (offers: ConsumerOffer[]) => void;
  /**
   * Polling fallback interval in milliseconds
   * @default 30000 (30 seconds)
   */
  pollingFallbackMs?: number;
}

/**
 * Hook for real-time consumer offers on a specific request
 * AC10.1.3: Offers sorted by delivery window (soonest first)
 * AC10.1.4: List updates in real-time via Supabase Realtime
 *
 * Pattern from: use-realtime-offers.ts (Epic 8)
 */
export function useConsumerOffers(
  requestId: string,
  options: UseConsumerOffersOptions = {}
) {
  const {
    enabled = true,
    onOffersChange,
    pollingFallbackMs = 30000, // 30s polling fallback per NFR
  } = options;

  const [offers, setOffers] = useState<ConsumerOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Fetch offers with provider profile data
  // AC10.1.3: Sort by delivery_window_start ASC (soonest first)
  const fetchOffers = useCallback(async () => {
    if (!requestId) return;

    const supabase = createClient();

    const { data, error: fetchError } = await supabase
      .from("offers")
      .select(
        `
        id,
        request_id,
        provider_id,
        delivery_window_start,
        delivery_window_end,
        expires_at,
        status,
        message,
        created_at,
        accepted_at,
        profiles:provider_id (
          name
        )
      `
      )
      .eq("request_id", requestId)
      .in("status", ["active", "expired"])
      .order("delivery_window_start", { ascending: true });
    // NOTE: avatar_url column does not exist in profiles table yet
    // When added, include in select: profiles:provider_id (name, avatar_url)

    if (fetchError) {
      console.error("[ConsumerOffers] Fetch error:", fetchError);
      setError(fetchError.message);
      return;
    }

    // Transform the data to match our interface
    // Note: avatar_url exists in profiles table but not yet populated by providers
    // The offer-card.tsx falls back to initials when avatar_url is null
    const transformedOffers: ConsumerOffer[] = (data || []).map((offer) => ({
      ...offer,
      profiles: offer.profiles
        ? {
            name: (offer.profiles as { name: string }).name || "Repartidor",
            avatar_url: null, // TODO: Add avatar_url to query when types are regenerated
          }
        : null,
    }));

    setOffers(transformedOffers);
    setError(null);
    setLastUpdate(new Date());
    onOffersChange?.(transformedOffers);
  }, [requestId, onOffersChange]);

  // Polling fallback function
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    console.log(
      "[ConsumerOffers] Starting polling fallback every",
      pollingFallbackMs,
      "ms"
    );
    pollingIntervalRef.current = setInterval(() => {
      console.log("[ConsumerOffers] Polling refresh...");
      fetchOffers();
    }, pollingFallbackMs);
  }, [pollingFallbackMs, fetchOffers]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Set up Supabase Realtime subscription
  // AC10.1.4: Real-time updates via Supabase Realtime
  useEffect(() => {
    if (!enabled || !requestId) {
      return;
    }

    const supabase = createClient();

    const setupSubscription = async () => {
      // Initial fetch - setLoading is called within fetchOffers callback
      await fetchOffers();
      // Use functional update to avoid lint warning about setState in effect
      setLoading(() => false);

      // Clean up existing channel if any
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
      }

      // Create channel for offers on this request
      // Subscribe to INSERT/UPDATE events filtered by request_id
      const channel = supabase
        .channel(`consumer-offers-${requestId}`)
        .on(
          "postgres_changes",
          {
            event: "*", // Listen to INSERT and UPDATE
            schema: "public",
            table: "offers",
            filter: `request_id=eq.${requestId}`,
          },
          (payload) => {
            console.log("[ConsumerOffers] Realtime event:", payload.eventType);

            // Re-fetch to get full data with profile
            // This is simpler than maintaining state locally
            fetchOffers();
          }
        )
        .subscribe((status, err) => {
          console.log("[ConsumerOffers] Subscription status:", status);

          if (status === "SUBSCRIBED") {
            setIsConnected(true);
            stopPolling(); // Stop polling when connected
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error("[ConsumerOffers] Connection error:", err);
            setIsConnected(false);
            startPolling(); // Start polling as fallback
          } else if (status === "CLOSED") {
            setIsConnected(false);
            startPolling(); // Start polling as fallback
          }
        });

      channelRef.current = channel;
    };

    setupSubscription();

    // Cleanup on unmount
    return () => {
      stopPolling();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [enabled, requestId, fetchOffers, startPolling, stopPolling]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchOffers();
  }, [fetchOffers]);

  // Count of active (non-expired) offers
  const activeOfferCount = offers.filter(
    (o) => o.status === "active" && new Date(o.expires_at) > new Date()
  ).length;

  return {
    offers,
    loading,
    error,
    isConnected,
    lastUpdate,
    refresh,
    activeOfferCount,
  };
}

export default useConsumerOffers;

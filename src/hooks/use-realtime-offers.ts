"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface OfferPayload {
  id: string;
  provider_id: string;
  request_id: string;
  status: string;
  expires_at: string | null;
  created_at: string | null;
  [key: string]: unknown;
}

interface UseRealtimeOffersOptions {
  /**
   * Enable/disable the hook
   * @default true
   */
  enabled?: boolean;
  /**
   * Provider ID to filter offers (if not provided, will be fetched from auth)
   */
  providerId?: string;
  /**
   * Callback when an offer is updated (status change)
   */
  onOfferUpdate?: (payload: RealtimePostgresChangesPayload<OfferPayload>) => void;
  /**
   * Callback when an offer is inserted (new offer created)
   */
  onOfferInsert?: (payload: RealtimePostgresChangesPayload<OfferPayload>) => void;
  /**
   * Polling fallback interval in milliseconds
   * @default 30000 (30 seconds)
   */
  pollingFallbackMs?: number;
}

/**
 * Hook for real-time updates on provider's offers
 * AC: 8.3.5 - Offers update in real-time (acceptance, expiration)
 * NFR4: Realtime updates < 2s delivery
 */
export function useRealtimeOffers(options: UseRealtimeOffersOptions = {}) {
  const {
    enabled = true,
    providerId: initialProviderId,
    onOfferUpdate,
    onOfferInsert,
    pollingFallbackMs = 30000, // 30s polling fallback
  } = options;

  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<string | null>(initialProviderId ?? null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Fetch provider ID if not provided
  useEffect(() => {
    if (initialProviderId) {
      setProviderId(initialProviderId);
      return;
    }

    const fetchProviderId = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProviderId(user.id);
      }
    };

    fetchProviderId();
  }, [initialProviderId]);

  // Handler for offer updates (UPDATE)
  // AC: 8.3.5 - Handle status changes (active → accepted/expired/cancelled)
  const handleUpdate = useCallback(
    (payload: RealtimePostgresChangesPayload<OfferPayload>) => {
      const newRecord = payload.new as OfferPayload;
      const oldRecord = payload.old as OfferPayload;

      // Only handle updates for this provider
      if (newRecord.provider_id !== providerId) {
        return;
      }

      // If status changed, this is a significant update
      if (oldRecord.status !== newRecord.status) {
        console.log(
          "[RealtimeOffers] Offer status changed:",
          newRecord.id,
          oldRecord.status,
          "→",
          newRecord.status
        );
        setLastUpdate(new Date());
        onOfferUpdate?.(payload);
        router.refresh();
      }
    },
    [providerId, onOfferUpdate, router]
  );

  // Handler for new offers (INSERT) - mainly for other offers on same requests
  const handleInsert = useCallback(
    (payload: RealtimePostgresChangesPayload<OfferPayload>) => {
      const newRecord = payload.new as OfferPayload;

      // Only handle inserts for this provider
      if (newRecord.provider_id !== providerId) {
        return;
      }

      console.log("[RealtimeOffers] New offer created:", newRecord.id);
      setLastUpdate(new Date());
      onOfferInsert?.(payload);
      router.refresh();
    },
    [providerId, onOfferInsert, router]
  );

  // Polling fallback function
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    console.log("[RealtimeOffers] Starting polling fallback every", pollingFallbackMs, "ms");
    pollingIntervalRef.current = setInterval(() => {
      console.log("[RealtimeOffers] Polling refresh...");
      setLastUpdate(new Date());
      router.refresh();
    }, pollingFallbackMs);
  }, [pollingFallbackMs, router]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Set up Supabase Realtime subscription
  useEffect(() => {
    if (!enabled || !providerId) {
      setIsConnected(false);
      return;
    }

    const supabase = createClient();

    const setupSubscription = async () => {
      // Clean up existing channel if any
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
      }

      // Create channel for offers table
      // Subscribe to changes on offers table filtered by provider_id
      const channel = supabase
        .channel(`provider-offers-${providerId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "offers",
            filter: `provider_id=eq.${providerId}`,
          },
          handleUpdate
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "offers",
            filter: `provider_id=eq.${providerId}`,
          },
          handleInsert
        )
        .subscribe((status, err) => {
          console.log("[RealtimeOffers] Subscription status:", status);

          if (status === "SUBSCRIBED") {
            setIsConnected(true);
            setConnectionError(null);
            stopPolling(); // Stop polling when connected
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error("[RealtimeOffers] Connection error:", err);
            setIsConnected(false);
            setConnectionError(err?.message || "Connection failed");
            startPolling(); // Start polling as fallback (AC: 8.3.5 - 30s polling fallback)
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
  }, [enabled, providerId, handleUpdate, handleInsert, startPolling, stopPolling]);

  // Force refresh function
  const refresh = useCallback(() => {
    setLastUpdate(new Date());
    router.refresh();
  }, [router]);

  return {
    isConnected,
    lastUpdate,
    connectionError,
    refresh,
    providerId,
  };
}

/**
 * Simplified hook that auto-fetches provider ID from auth
 */
export function useProviderRealtimeOffers(
  options: Omit<UseRealtimeOffersOptions, "providerId"> = {}
) {
  const [isLoading, setIsLoading] = useState(true);
  const [providerId, setProviderId] = useState<string | null>(null);

  // Fetch provider ID on mount
  useEffect(() => {
    const fetchProviderId = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setProviderId(user.id);
      }
      setIsLoading(false);
    };

    fetchProviderId();
  }, []);

  const realtimeState = useRealtimeOffers({
    ...options,
    providerId: providerId ?? undefined,
    enabled: options.enabled !== false && !isLoading && !!providerId,
  });

  return {
    ...realtimeState,
    isLoading,
  };
}

export default useRealtimeOffers;

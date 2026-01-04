"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface WaterRequestPayload {
  id: string;
  status: string;
  comuna_id: string | null;
  is_urgent: boolean | null;
  created_at: string | null;
  amount: number;
  [key: string]: unknown;
}

interface UseRealtimeRequestsOptions {
  enabled?: boolean;
  serviceAreaIds?: string[];
  onNewRequest?: (payload: RealtimePostgresChangesPayload<WaterRequestPayload>) => void;
  onRequestUpdate?: (payload: RealtimePostgresChangesPayload<WaterRequestPayload>) => void;
  pollingFallbackMs?: number;
}

/**
 * Hook for real-time updates on water requests in provider's service areas
 * AC: 8.1.4 - List updates in real-time via Supabase Realtime
 * AC: 8.1.5 - Requests disappear when filled or timed out
 */
export function useRealtimeRequests(options: UseRealtimeRequestsOptions = {}) {
  const {
    enabled = true,
    serviceAreaIds = [],
    onNewRequest,
    onRequestUpdate,
    pollingFallbackMs = 30000, // 30s polling fallback
  } = options;

  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Use refs for callbacks and serviceAreaIds to avoid re-subscribing when they change
  const onNewRequestRef = useRef(onNewRequest);
  const onRequestUpdateRef = useRef(onRequestUpdate);
  const serviceAreaIdsRef = useRef(serviceAreaIds);

  // Keep refs updated
  useEffect(() => {
    onNewRequestRef.current = onNewRequest;
  }, [onNewRequest]);

  useEffect(() => {
    onRequestUpdateRef.current = onRequestUpdate;
  }, [onRequestUpdate]);

  useEffect(() => {
    serviceAreaIdsRef.current = serviceAreaIds;
  }, [serviceAreaIds]);

  // Polling fallback function
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    console.log("[Realtime] Starting polling fallback every", pollingFallbackMs, "ms");
    pollingIntervalRef.current = setInterval(() => {
      console.log("[Realtime] Polling refresh...");
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

  useEffect(() => {
    if (!enabled || serviceAreaIds.length === 0) {
      setIsConnected(false);
      return;
    }

    const supabase = createClient();

    // Handler for new requests (INSERT) - uses refs to avoid re-subscription
    const handleInsert = (payload: RealtimePostgresChangesPayload<WaterRequestPayload>) => {
      const newRecord = payload.new as WaterRequestPayload;

      // Only handle if request is pending and in our service areas
      if (
        newRecord.status === "pending" &&
        newRecord.comuna_id &&
        serviceAreaIdsRef.current.includes(newRecord.comuna_id)
      ) {
        console.log("[Realtime] New request in service area:", newRecord.id);
        setLastUpdate(new Date());
        onNewRequestRef.current?.(payload);
        router.refresh();
      }
    };

    // Handler for request updates (UPDATE) - uses refs to avoid re-subscription
    const handleUpdate = (payload: RealtimePostgresChangesPayload<WaterRequestPayload>) => {
      const newRecord = payload.new as WaterRequestPayload;
      const oldRecord = payload.old as WaterRequestPayload;

      // If status changed from pending to something else, request should disappear
      // AC: 8.1.5 - Requests disappear when filled or timed out
      if (oldRecord.status === "pending" && newRecord.status !== "pending") {
        console.log("[Realtime] Request status changed:", newRecord.id, newRecord.status);
        setLastUpdate(new Date());
        onRequestUpdateRef.current?.(payload);
        router.refresh();
      }
    };

    const setupSubscription = async () => {
      // Clean up existing channel if any
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
      }

      // Create channel for water_requests
      const channel = supabase
        .channel("provider-requests-browser")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "water_requests",
          },
          handleInsert
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "water_requests",
          },
          handleUpdate
        )
        .subscribe((status, err) => {
          console.log("[Realtime] Subscription status:", status);

          if (status === "SUBSCRIBED") {
            setIsConnected(true);
            setConnectionError(null);
            stopPolling(); // Stop polling when connected
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error("[Realtime] Connection error:", err);
            setIsConnected(false);
            setConnectionError(err?.message || "Connection failed");
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
  }, [enabled, serviceAreaIds.length, router, startPolling, stopPolling]); // Only re-subscribe when enabled or serviceAreaIds length changes

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
  };
}

/**
 * Simplified hook for provider's service areas
 * Automatically fetches service areas and sets up realtime
 */
export function useProviderRealtimeRequests(options: Omit<UseRealtimeRequestsOptions, "serviceAreaIds"> = {}) {
  const [serviceAreaIds, setServiceAreaIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch service areas on mount
  useEffect(() => {
    const fetchServiceAreas = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: areas } = await supabase
        .from("provider_service_areas")
        .select("comuna_id")
        .eq("provider_id", user.id);

      setServiceAreaIds(areas?.map((a) => a.comuna_id) ?? []);
      setIsLoading(false);
    };

    fetchServiceAreas();
  }, []);

  const realtimeState = useRealtimeRequests({
    ...options,
    serviceAreaIds,
    enabled: options.enabled !== false && !isLoading && serviceAreaIds.length > 0,
  });

  return {
    ...realtimeState,
    isLoading,
    serviceAreaIds,
  };
}

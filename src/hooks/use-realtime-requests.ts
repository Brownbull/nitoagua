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

  // Handler for new requests (INSERT)
  const handleInsert = useCallback(
    (payload: RealtimePostgresChangesPayload<WaterRequestPayload>) => {
      const newRecord = payload.new as WaterRequestPayload;

      // Only handle if request is pending and in our service areas
      if (
        newRecord.status === "pending" &&
        newRecord.comuna_id &&
        serviceAreaIds.includes(newRecord.comuna_id)
      ) {
        console.log("[Realtime] New request in service area:", newRecord.id);
        setLastUpdate(new Date());
        onNewRequest?.(payload);
        router.refresh();
      }
    },
    [serviceAreaIds, onNewRequest, router]
  );

  // Handler for request updates (UPDATE)
  const handleUpdate = useCallback(
    (payload: RealtimePostgresChangesPayload<WaterRequestPayload>) => {
      const newRecord = payload.new as WaterRequestPayload;
      const oldRecord = payload.old as WaterRequestPayload;

      // If status changed from pending to something else, request should disappear
      // AC: 8.1.5 - Requests disappear when filled or timed out
      if (oldRecord.status === "pending" && newRecord.status !== "pending") {
        console.log("[Realtime] Request status changed:", newRecord.id, newRecord.status);
        setLastUpdate(new Date());
        onRequestUpdate?.(payload);
        router.refresh();
      }
    },
    [onRequestUpdate, router]
  );

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
  }, [enabled, serviceAreaIds, handleInsert, handleUpdate, startPolling, stopPolling]);

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

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Wifi, WifiOff, RefreshCw, AlertCircle, Settings, InboxIcon } from "lucide-react";
import { RequestCard } from "@/components/provider/request-card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProviderRealtimeRequests } from "@/hooks/use-realtime-requests";
import { getAvailableRequests } from "@/lib/actions/offers";
import type { AvailableRequest, ProviderStatus } from "@/lib/actions/offers";

interface RequestBrowserClientProps {
  initialRequests: AvailableRequest[];
  providerStatus?: ProviderStatus;
  error?: string;
}

/**
 * Client component for the request browser with real-time updates
 * AC: 8.1.4 - Real-time updates via Supabase Realtime
 * AC: 8.1.5 - Requests disappear when filled or timed out
 * AC: 8.1.6 - Unavailable provider sees empty state with toggle prompt
 */
export function RequestBrowserClient({
  initialRequests,
  providerStatus,
  error,
}: RequestBrowserClientProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Set up real-time updates
  const {
    isConnected,
    connectionError,
    refresh: realtimeRefresh,
    isLoading: realtimeLoading,
  } = useProviderRealtimeRequests({
    enabled: providerStatus?.isVerified && providerStatus?.isAvailable,
  });

  // Manual refresh that directly calls the server action
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      console.log("[RequestBrowser] Manual refresh triggered");
      const result = await getAvailableRequests();
      if (result.success && result.requests) {
        console.log("[RequestBrowser] Fetched", result.requests.length, "requests");
        setRequests(result.requests);
      } else if (result.error) {
        console.error("[RequestBrowser] Refresh error:", result.error);
      }
    } catch (err) {
      console.error("[RequestBrowser] Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Update requests when initial data changes (from router.refresh())
  useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);

  // Show error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // AC: 8.1.6 - Unavailable provider sees empty state with toggle prompt
  if (providerStatus && !providerStatus.isAvailable) {
    return <UnavailableState />;
  }

  // Not verified state
  if (providerStatus && !providerStatus.isVerified) {
    return <NotVerifiedState />;
  }

  // No service areas configured
  if (providerStatus && !providerStatus.hasServiceAreas) {
    return <NoServiceAreasState />;
  }

  return (
    <div className="space-y-4">
      {/* Connection status indicator */}
      <ConnectionStatus
        isConnected={isConnected}
        connectionError={connectionError}
        onRefresh={handleRefresh}
        isLoading={realtimeLoading || isRefreshing}
      />

      {/* Request list */}
      {requests.length === 0 ? (
        <EmptyRequestsState onRefresh={handleRefresh} isLoading={isRefreshing} />
      ) : (
        <div className="space-y-3" data-testid="request-list">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Connection status indicator
 */
function ConnectionStatus({
  isConnected,
  connectionError,
  onRefresh,
  isLoading,
}: {
  isConnected: boolean;
  connectionError: string | null;
  onRefresh: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
      <div className="flex items-center gap-2">
        {isLoading ? (
          <RefreshCw className="h-3 w-3 animate-spin text-orange-500" />
        ) : isConnected ? (
          <Wifi className="h-3 w-3 text-green-500" />
        ) : (
          <WifiOff className="h-3 w-3 text-orange-500" />
        )}
        <span>
          {isLoading
            ? "Actualizando..."
            : isConnected
            ? "Actualizaciones en tiempo real"
            : connectionError
            ? "Usando actualización periódica"
            : "Reconectando..."}
        </span>
      </div>
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className={`flex items-center gap-1 ${
          isLoading
            ? "text-gray-400 cursor-not-allowed"
            : "text-orange-600 hover:text-orange-700"
        }`}
        title="Actualizar lista"
      >
        <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
        <span>{isLoading ? "Actualizando..." : "Actualizar"}</span>
      </button>
    </div>
  );
}

/**
 * AC: 8.1.6 - Empty state when provider is unavailable
 * Prompt: "Activa tu disponibilidad para ver solicitudes"
 */
function UnavailableState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      data-testid="unavailable-state"
    >
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-orange-500" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        No estás disponible
      </h2>
      <p className="text-gray-600 mb-6 max-w-xs">
        Activa tu disponibilidad para ver solicitudes de agua en tus áreas de
        servicio.
      </p>
      <Button asChild className="bg-orange-500 hover:bg-orange-600">
        <Link href="/dashboard/settings">
          <Settings className="h-4 w-4 mr-2" />
          Activar Disponibilidad
        </Link>
      </Button>
    </div>
  );
}

/**
 * Empty state when provider is not verified
 */
function NotVerifiedState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      data-testid="not-verified-state"
    >
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-yellow-500" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Verificación pendiente
      </h2>
      <p className="text-gray-600 mb-6 max-w-xs">
        Tu cuenta está en proceso de verificación. Podrás ver solicitudes una vez
        que seas aprobado.
      </p>
      <Button asChild variant="outline">
        <Link href="/provider/onboarding/pending">Ver estado de verificación</Link>
      </Button>
    </div>
  );
}

/**
 * Empty state when no service areas configured
 */
function NoServiceAreasState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      data-testid="no-service-areas-state"
    >
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <Settings className="h-8 w-8 text-blue-500" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Configura tus áreas de servicio
      </h2>
      <p className="text-gray-600 mb-6 max-w-xs">
        Necesitas configurar al menos una comuna para ver solicitudes de agua.
      </p>
      <Button asChild className="bg-orange-500 hover:bg-orange-600">
        <Link href="/dashboard/settings/areas">
          <Settings className="h-4 w-4 mr-2" />
          Configurar Áreas
        </Link>
      </Button>
    </div>
  );
}

/**
 * Empty state when no requests available
 */
function EmptyRequestsState({ onRefresh, isLoading }: { onRefresh: () => void; isLoading?: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      data-testid="empty-requests-state"
    >
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <InboxIcon className="h-8 w-8 text-gray-400" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        No hay solicitudes disponibles
      </h2>
      <p className="text-gray-600 mb-6 max-w-xs">
        No hay solicitudes de agua pendientes en tus áreas de servicio en este
        momento.
      </p>
      <Button
        onClick={onRefresh}
        variant="outline"
        className="flex items-center gap-2"
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        {isLoading ? "Actualizando..." : "Actualizar"}
      </Button>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Wifi, WifiOff, RefreshCw, AlertCircle, Settings, InboxIcon, ArrowUpDown, X, ChevronDown } from "lucide-react";
import { RequestCard } from "@/components/provider/request-card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProviderRealtimeRequests } from "@/hooks/use-realtime-requests";
import { getAvailableRequests } from "@/lib/actions/offers";
import type { AvailableRequest, ProviderStatus } from "@/lib/actions/offers";

type SortOrder = "oldest" | "newest";

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
  const [sortOrder, setSortOrder] = useState<SortOrder>("oldest");
  const [selectedComuna, setSelectedComuna] = useState<string | null>(null);

  // Extract unique comunas from requests for filter dropdown
  const availableComunas = useMemo(() => {
    const comunaMap = new Map<string, string>();
    requests.forEach((r) => {
      if (r.comuna_id && r.comuna_name) {
        comunaMap.set(r.comuna_id, r.comuna_name);
      }
    });
    return Array.from(comunaMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [requests]);

  // Apply sorting and filtering
  const filteredAndSortedRequests = useMemo(() => {
    let result = [...requests];

    // Filter by comuna if selected
    if (selectedComuna) {
      result = result.filter((r) => r.comuna_id === selectedComuna);
    }

    // Sort by created_at
    result.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortOrder === "oldest" ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [requests, sortOrder, selectedComuna]);

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

      {/* Sort and Filter controls */}
      {requests.length > 0 && (
        <SortFilterControls
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          selectedComuna={selectedComuna}
          onComunaChange={setSelectedComuna}
          availableComunas={availableComunas}
        />
      )}

      {/* Request list */}
      {requests.length === 0 ? (
        <EmptyRequestsState onRefresh={handleRefresh} isLoading={isRefreshing} />
      ) : filteredAndSortedRequests.length === 0 ? (
        <NoMatchingRequestsState
          selectedComuna={availableComunas.find((c) => c.id === selectedComuna)?.name}
          onClearFilter={() => setSelectedComuna(null)}
        />
      ) : (
        <div className="space-y-3" data-testid="request-list">
          {filteredAndSortedRequests.map((request) => (
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

/**
 * Sort and filter controls for the request list
 */
function SortFilterControls({
  sortOrder,
  onSortChange,
  selectedComuna,
  onComunaChange,
  availableComunas,
}: {
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
  selectedComuna: string | null;
  onComunaChange: (comunaId: string | null) => void;
  availableComunas: { id: string; name: string }[];
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3" data-testid="sort-filter-controls">
      {/* Sort toggle */}
      <button
        onClick={() => onSortChange(sortOrder === "oldest" ? "newest" : "oldest")}
        className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        data-testid="sort-toggle"
      >
        <ArrowUpDown className="h-4 w-4 text-orange-500" />
        <span>{sortOrder === "oldest" ? "Más antiguos" : "Más recientes"}</span>
      </button>

      {/* Comuna filter dropdown */}
      <div className="relative flex-1 sm:flex-initial">
        {selectedComuna ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
            <span className="text-sm font-medium text-orange-700">
              {availableComunas.find((c) => c.id === selectedComuna)?.name}
            </span>
            <button
              onClick={() => onComunaChange(null)}
              className="p-0.5 hover:bg-orange-100 rounded-full transition-colors"
              aria-label="Limpiar filtro"
              data-testid="clear-comuna-filter"
            >
              <X className="h-4 w-4 text-orange-600" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <select
              value=""
              onChange={(e) => onComunaChange(e.target.value || null)}
              className="appearance-none w-full px-3 py-2 pr-8 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              data-testid="comuna-filter"
            >
              <option value="">Filtrar por comuna</option>
              {availableComunas.map((comuna) => (
                <option key={comuna.id} value={comuna.id}>
                  {comuna.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * State when filter results in no matching requests
 */
function NoMatchingRequestsState({
  selectedComuna,
  onClearFilter,
}: {
  selectedComuna?: string;
  onClearFilter: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      data-testid="no-matching-requests-state"
    >
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <InboxIcon className="h-8 w-8 text-gray-400" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        No hay solicitudes en {selectedComuna}
      </h2>
      <p className="text-gray-600 mb-6 max-w-xs">
        No hay solicitudes pendientes en esta comuna. Prueba con otra área o quita el filtro.
      </p>
      <Button
        onClick={onClearFilter}
        variant="outline"
        className="flex items-center gap-2"
      >
        <X className="h-4 w-4" />
        Quitar filtro
      </Button>
    </div>
  );
}

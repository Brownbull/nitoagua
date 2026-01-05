"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileQuestion,
  Send,
  Wifi,
  WifiOff,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
  Check,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { OfferCard } from "@/components/provider/offer-card";
import { useProviderRealtimeOffers } from "@/hooks/use-realtime-offers";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { FlatOfferWithRequest, OfferFilterStatus } from "@/lib/actions/offers";

interface OffersListClientProps {
  initialOffers: FlatOfferWithRequest[];
  newOfferId?: string;
  providerId: string;
}

const PAGE_SIZE = 10;

// AC12.8.3.5: Filter status configuration - based on water_requests.status
// Shows only active offers by default (pending offers + in-progress deliveries)
const STATUS_OPTIONS: {
  value: OfferFilterStatus;
  label: string;
}[] = [
  { value: "pending", label: "Pendientes" },       // offer.status = 'active'
  { value: "active_delivery", label: "En proceso" }, // Aceptada/En Camino (not delivered)
  { value: "disputed", label: "Con disputa" },
  { value: "delivered", label: "Historial" },      // Delivered, cancelled, expired, etc.
];

type SortOrder = "newest" | "oldest";

/**
 * Unified Offers List Client (v2.6.2)
 * Single list with dropdown multi-select filters for Estado and Comuna
 * AC12.8.3.1: No default filter - provider sees all relevant offers immediately
 */
export function OffersListClient({
  initialOffers,
  newOfferId,
  providerId: _providerId,
}: OffersListClientProps) {
  const [offers, setOffers] = useState<FlatOfferWithRequest[]>(initialOffers);
  const [highlightedOfferId, setHighlightedOfferId] = useState<string | undefined>(newOfferId);

  // Filter state - AC12.8.3.1: No default filter on page load
  const [selectedStatuses, setSelectedStatuses] = useState<Set<OfferFilterStatus>>(
    new Set()
  );
  const [selectedComunas, setSelectedComunas] = useState<Set<string>>(new Set());

  // Popover open states
  const [statusOpen, setStatusOpen] = useState(false);
  const [comunaOpen, setComunaOpen] = useState(false);

  // Sort state
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Set up realtime subscription
  const { isConnected, refresh } = useProviderRealtimeOffers({
    enabled: true,
  });

  // Update offers when initialOffers changes (from server refresh)
  useEffect(() => {
    setOffers(initialOffers);
  }, [initialOffers]);

  // Clear highlight after 3 seconds
  useEffect(() => {
    if (highlightedOfferId) {
      const timer = setTimeout(() => {
        setHighlightedOfferId(undefined);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedOfferId]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatuses, selectedComunas, sortOrder]);

  // Handle offer withdrawal (optimistic update)
  const handleWithdraw = (offerId: string) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === offerId
          ? { ...o, status: "cancelled" as const, filterCategory: "delivered" as const }
          : o
      )
    );
  };

  // Handle offer expiration (optimistic update)
  const handleExpire = (offerId: string) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === offerId
          ? { ...o, status: "expired" as const, filterCategory: "delivered" as const }
          : o
      )
    );
  };

  // Toggle status filter selection
  const toggleStatus = (status: OfferFilterStatus) => {
    setSelectedStatuses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
  };

  // Toggle comuna filter selection
  const toggleComuna = (comuna: string) => {
    setSelectedComunas((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(comuna)) {
        newSet.delete(comuna);
      } else {
        newSet.add(comuna);
      }
      return newSet;
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedStatuses(new Set());
    setSelectedComunas(new Set());
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));
  };

  // Extract unique comunas from offers
  const availableComunas = useMemo(() => {
    const comunaSet = new Set<string>();
    offers.forEach((o) => {
      if (o.request?.comuna_name) {
        comunaSet.add(o.request.comuna_name);
      }
    });
    return Array.from(comunaSet).sort();
  }, [offers]);

  // Filter and sort offers
  // AC12.8.3.1: No default filter - show all ACTIVE offers (not delivered/cancelled)
  // AC12.8.3.2: Hide completed deliveries unless explicitly filtered
  // AC12.8.3.3: Hide cancelled requests unless explicitly filtered
  const filteredAndSortedOffers = useMemo(() => {
    let result = [...offers];

    // Apply status filters
    if (selectedStatuses.size > 0) {
      // When filters are explicitly selected, show exactly those categories
      result = result.filter((o) => selectedStatuses.has(o.filterCategory));
    } else {
      // AC12.8.3.2, AC12.8.3.3: When NO filter selected, hide "delivered" (history) by default
      // This shows: pending, active_delivery, disputed - all "active" work items
      result = result.filter((o) => o.filterCategory !== "delivered");
    }

    // Apply comuna filters if any are selected
    if (selectedComunas.size > 0) {
      result = result.filter((o) => o.request?.comuna_name && selectedComunas.has(o.request.comuna_name));
    }

    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [offers, selectedStatuses, selectedComunas, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedOffers.length / PAGE_SIZE);
  const paginatedOffers = filteredAndSortedOffers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Count offers by category for badges
  const categoryCounts = useMemo(() => {
    const counts: Record<OfferFilterStatus, number> = {
      pending: 0,
      active_delivery: 0,
      disputed: 0,
      delivered: 0,
    };
    offers.forEach((o) => {
      counts[o.filterCategory]++;
    });
    return counts;
  }, [offers]);

  const hasNoOffers = offers.length === 0;
  const hasNoFilteredResults = filteredAndSortedOffers.length === 0 && !hasNoOffers;
  const hasActiveFilters = selectedStatuses.size > 0 || selectedComunas.size > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mis Ofertas</h1>
              <p className="text-sm text-gray-600 mt-1">
                {filteredAndSortedOffers.length} de {offers.length} ofertas
              </p>
            </div>
            {/* Connection status indicator */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={refresh}
                className="h-8 w-8"
                title="Actualizar"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <div
                className={cn(
                  "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                  isConnected
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                )}
                title={
                  isConnected
                    ? "Conectado - Actualizaciones en tiempo real"
                    : "Desconectado - Actualizando cada 30s"
                }
              >
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    <span className="hidden sm:inline">En vivo</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    <span className="hidden sm:inline">Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters Row - Estado and Comuna dropdowns */}
        <div className="mb-4 flex gap-2">
          {/* Estado dropdown */}
          <Popover open={statusOpen} onOpenChange={setStatusOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex-1 flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-medium transition-colors h-10",
                  selectedStatuses.size > 0
                    ? "bg-orange-50 border-orange-200 text-orange-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                )}
              >
                <span className="flex items-center gap-2">
                  Estado
                  {selectedStatuses.size > 0 && (
                    <Badge className="h-5 min-w-5 px-1.5 bg-orange-500 text-white">
                      {selectedStatuses.size}
                    </Badge>
                  )}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
              <div className="space-y-1">
                {STATUS_OPTIONS.map((option) => {
                  const isSelected = selectedStatuses.has(option.value);
                  const count = categoryCounts[option.value];
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleStatus(option.value)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                        isSelected
                          ? "bg-orange-100 text-orange-800"
                          : "hover:bg-gray-100 text-gray-700"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {isSelected && <Check className="h-4 w-4 text-orange-600" />}
                        {!isSelected && <span className="w-4" />}
                        {option.label}
                      </span>
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        {count}
                      </Badge>
                    </button>
                  );
                })}
              </div>
              {selectedStatuses.size > 0 && (
                <div className="border-t mt-2 pt-2">
                  <button
                    onClick={() => setSelectedStatuses(new Set())}
                    className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3.5 w-3.5" />
                    Limpiar estado
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Comuna dropdown */}
          <Popover open={comunaOpen} onOpenChange={setComunaOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex-1 flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-medium transition-colors h-10",
                  selectedComunas.size > 0
                    ? "bg-orange-50 border-orange-200 text-orange-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                )}
              >
                <span className="flex items-center gap-2">
                  Comuna
                  {selectedComunas.size > 0 && (
                    <Badge className="h-5 min-w-5 px-1.5 bg-orange-500 text-white">
                      {selectedComunas.size}
                    </Badge>
                  )}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
              {availableComunas.length > 0 ? (
                <>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {availableComunas.map((comuna) => {
                      const isSelected = selectedComunas.has(comuna);
                      return (
                        <button
                          key={comuna}
                          onClick={() => toggleComuna(comuna)}
                          className={cn(
                            "w-full flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                            isSelected
                              ? "bg-orange-100 text-orange-800"
                              : "hover:bg-gray-100 text-gray-700"
                          )}
                        >
                          {isSelected && <Check className="h-4 w-4 text-orange-600 mr-2" />}
                          {!isSelected && <span className="w-6" />}
                          {comuna}
                        </button>
                      );
                    })}
                  </div>
                  {selectedComunas.size > 0 && (
                    <div className="border-t mt-2 pt-2">
                      <button
                        onClick={() => setSelectedComunas(new Set())}
                        className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3.5 w-3.5" />
                        Limpiar comuna
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="px-3 py-2 text-sm text-gray-500">
                  No hay comunas disponibles
                </p>
              )}
            </PopoverContent>
          </Popover>

          {/* Sort toggle */}
          <button
            onClick={toggleSortOrder}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors h-10"
            title={sortOrder === "newest" ? "Ordenado por más recientes" : "Ordenado por más antiguos"}
          >
            <Calendar className="h-4 w-4 text-orange-500 shrink-0" />
            {sortOrder === "newest" ? (
              <ArrowDown className="h-4 w-4 text-gray-600 shrink-0" />
            ) : (
              <ArrowUp className="h-4 w-4 text-gray-600 shrink-0" />
            )}
          </button>
        </div>

        {/* Clear all filters link */}
        {hasActiveFilters && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar todos los filtros
            </button>
          </div>
        )}

        {/* Global empty state - when no offers at all */}
        {hasNoOffers && (
          <Card className="text-center py-12" data-testid="empty-state-global">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileQuestion className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                No tienes ofertas
              </h2>
              <p className="text-gray-600 mb-6 max-w-xs mx-auto">
                Explora las solicitudes disponibles y envía tu primera oferta
              </p>
              <Button asChild className="bg-orange-500 hover:bg-orange-600">
                <Link href="/provider/requests">
                  <Send className="h-4 w-4 mr-2" />
                  Ver Solicitudes
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* No results for current filters */}
        {hasNoFilteredResults && (
          <Card className="text-center py-12" data-testid="empty-state-filtered">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileQuestion className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Sin resultados
              </h2>
              <p className="text-gray-600 mb-4 max-w-xs mx-auto">
                No hay ofertas que coincidan con los filtros seleccionados
              </p>
              <Button variant="outline" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Offers list */}
        {!hasNoOffers && !hasNoFilteredResults && (
          <>
            <div className="space-y-3">
              {paginatedOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  isNew={offer.id === highlightedOfferId}
                  onWithdraw={handleWithdraw}
                  onExpire={handleExpire}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm text-gray-500">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default OffersListClient;

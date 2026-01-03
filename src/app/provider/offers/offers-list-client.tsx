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
  ArrowUpDown,
  Filter,
  Clock,
  Truck,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { OfferCard } from "@/components/provider/offer-card";
import { useProviderRealtimeOffers } from "@/hooks/use-realtime-offers";
import { cn } from "@/lib/utils";
import type { FlatOfferWithRequest, OfferFilterStatus } from "@/lib/actions/offers";

interface OffersListClientProps {
  initialOffers: FlatOfferWithRequest[];
  newOfferId?: string;
  providerId: string;
}

const PAGE_SIZE = 10;

// Filter status configuration
const FILTER_OPTIONS: {
  value: OfferFilterStatus;
  label: string;
  icon: React.ElementType;
  activeClass: string;
}[] = [
  {
    value: "pending",
    label: "Pendientes",
    icon: Clock,
    activeClass: "bg-orange-500 text-white border-orange-500",
  },
  {
    value: "active_delivery",
    label: "Entregas activas",
    icon: Truck,
    activeClass: "bg-green-500 text-white border-green-500",
  },
  {
    value: "disputed",
    label: "En disputa",
    icon: AlertTriangle,
    activeClass: "bg-red-500 text-white border-red-500",
  },
  {
    value: "delivered",
    label: "Historial",
    icon: CheckCircle,
    activeClass: "bg-gray-500 text-white border-gray-500",
  },
];

type SortOrder = "newest" | "oldest";

/**
 * Unified Offers List Client (v2.6.0)
 * Single list with multi-select filters, sorting, and pagination
 * Default: Shows active_delivery filter selected
 */
export function OffersListClient({
  initialOffers,
  newOfferId,
  providerId: _providerId,
}: OffersListClientProps) {
  const [offers, setOffers] = useState<FlatOfferWithRequest[]>(initialOffers);
  const [highlightedOfferId, setHighlightedOfferId] = useState<string | undefined>(newOfferId);

  // Filter state - default to active_delivery
  const [selectedFilters, setSelectedFilters] = useState<Set<OfferFilterStatus>>(
    new Set(["active_delivery"])
  );

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
  }, [selectedFilters, sortOrder]);

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

  // Toggle filter selection
  const toggleFilter = (filter: OfferFilterStatus) => {
    setSelectedFilters((prev) => {
      const newFilters = new Set(prev);
      if (newFilters.has(filter)) {
        newFilters.delete(filter);
      } else {
        newFilters.add(filter);
      }
      return newFilters;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters(new Set());
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));
  };

  // Filter and sort offers
  const filteredAndSortedOffers = useMemo(() => {
    let result = [...offers];

    // Apply filters if any are selected
    if (selectedFilters.size > 0) {
      result = result.filter((o) => selectedFilters.has(o.filterCategory));
    }

    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [offers, selectedFilters, sortOrder]);

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

        {/* Filters and Sort */}
        <div className="mb-4 space-y-3">
          {/* Filter chips */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400 shrink-0" />
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedFilters.has(option.value);
                const count = categoryCounts[option.value];

                return (
                  <button
                    key={option.value}
                    onClick={() => toggleFilter(option.value)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                      isSelected
                        ? option.activeClass
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{option.label}</span>
                    {count > 0 && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "h-5 min-w-5 flex items-center justify-center text-xs px-1.5",
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {count}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort and Clear filters row */}
          <div className="flex items-center justify-between">
            {/* Sort button */}
            <button
              onClick={toggleSortOrder}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowUpDown className="h-4 w-4" />
              <span>{sortOrder === "newest" ? "Más recientes" : "Más antiguos"}</span>
            </button>

            {/* Clear filters */}
            {selectedFilters.size > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <X className="h-3.5 w-3.5" />
                <span>Limpiar filtros</span>
              </button>
            )}
          </div>
        </div>

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
                <Filter className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Sin resultados
              </h2>
              <p className="text-gray-600 mb-4 max-w-xs mx-auto">
                No hay ofertas que coincidan con los filtros seleccionados
              </p>
              <Button variant="outline" onClick={clearFilters}>
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

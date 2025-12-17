"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileQuestion,
  Clock,
  CheckCircle2,
  History,
  Send,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { OfferCard } from "@/components/provider/offer-card";
import { useProviderRealtimeOffers } from "@/hooks/use-realtime-offers";
import { cn } from "@/lib/utils";
import type { GroupedOffers } from "@/lib/actions/offers";

interface OffersListClientProps {
  initialOffers: GroupedOffers;
  newOfferId?: string;
  providerId: string;
}

/**
 * Client component for offers list with realtime updates
 * AC: 8.3.1 - Display offers grouped by status
 * AC: 8.3.5 - Real-time updates via Supabase Realtime
 * AC: 8.3.6 (Task 6) - Empty states for each section
 */
export function OffersListClient({
  initialOffers,
  newOfferId,
  providerId: _providerId,
}: OffersListClientProps) {
  const [offers, setOffers] = useState<GroupedOffers>(initialOffers);
  const [highlightedOfferId, setHighlightedOfferId] = useState<string | undefined>(newOfferId);

  // Set up realtime subscription
  // AC: 8.3.5 - Offers update in real-time (acceptance, expiration)
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

  // Handle offer withdrawal (optimistic update)
  const handleWithdraw = (offerId: string) => {
    setOffers((prev) => ({
      ...prev,
      pending: prev.pending.filter((o) => o.id !== offerId),
      history: [
        {
          ...prev.pending.find((o) => o.id === offerId)!,
          status: "cancelled" as const,
        },
        ...prev.history,
      ],
    }));
  };

  // Handle offer expiration (optimistic update)
  const handleExpire = (offerId: string) => {
    setOffers((prev) => {
      const expiredOffer = prev.pending.find((o) => o.id === offerId);
      if (!expiredOffer) return prev;

      return {
        ...prev,
        pending: prev.pending.filter((o) => o.id !== offerId),
        history: [
          {
            ...expiredOffer,
            status: "expired" as const,
          },
          ...prev.history,
        ],
      };
    });
  };

  const totalOffers = offers.pending.length + offers.accepted.length + offers.history.length;
  const hasNoOffers = totalOffers === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mis Ofertas</h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona tus ofertas enviadas
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

        {/* Global empty state - when no offers at all */}
        {/* AC: Task 6 - Empty state when no offers exist */}
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

        {/* Sections - only show if there are some offers */}
        {!hasNoOffers && (
          <>
            {/* Pending Offers Section */}
            {/* AC: 8.3.1 - "Pendientes" section */}
            <section className="mb-8" data-testid="section-pending">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Pendientes
                {offers.pending.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {offers.pending.length}
                  </Badge>
                )}
              </h2>

              {offers.pending.length > 0 ? (
                <div className="space-y-3">
                  {offers.pending.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      isNew={offer.id === highlightedOfferId}
                      onWithdraw={handleWithdraw}
                      onExpire={handleExpire}
                    />
                  ))}
                </div>
              ) : (
                /* AC: Task 6 - "No tienes ofertas pendientes" empty state */
                <Card
                  className="text-center py-8 border-dashed"
                  data-testid="empty-state-pending"
                >
                  <CardContent>
                    <p className="text-gray-500 text-sm mb-3">
                      No tienes ofertas pendientes
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      <Link href="/provider/requests">
                        <Send className="h-4 w-4 mr-1" />
                        Ver solicitudes disponibles
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Active Deliveries Section - AC: 8.5.5 */}
            {/* AC: 8.3.1, AC: 8.5.5 - "Entregas Activas" section */}
            <section className="mb-8" data-testid="section-accepted">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Entregas Activas
                {offers.accepted.length > 0 && (
                  <Badge className="bg-green-500 ml-1">
                    {offers.accepted.length}
                  </Badge>
                )}
              </h2>

              {offers.accepted.length > 0 ? (
                <div className="space-y-3">
                  {offers.accepted.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} />
                  ))}
                </div>
              ) : (
                /* AC: Task 6 - "Aún no tienes entregas activas" empty state */
                <Card
                  className="text-center py-8 border-dashed"
                  data-testid="empty-state-accepted"
                >
                  <CardContent>
                    <p className="text-gray-500 text-sm">
                      Aún no tienes entregas activas
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Cuando un consumidor acepte tu oferta, aparecerá aquí
                    </p>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* History Section */}
            {/* AC: 8.3.1 - "Historial" section (expired/cancelled/request_filled) */}
            <section data-testid="section-history">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <History className="h-5 w-5 text-gray-400" />
                Historial
                {offers.history.length > 0 && (
                  <Badge variant="outline" className="ml-1">
                    {offers.history.length}
                  </Badge>
                )}
              </h2>

              {offers.history.length > 0 ? (
                <div className="space-y-3">
                  {offers.history.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} />
                  ))}
                </div>
              ) : (
                /* AC: Task 6 - "No tienes historial de ofertas" empty state */
                <Card
                  className="text-center py-8 border-dashed opacity-75"
                  data-testid="empty-state-history"
                >
                  <CardContent>
                    <p className="text-gray-500 text-sm">
                      No tienes historial de ofertas
                    </p>
                  </CardContent>
                </Card>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default OffersListClient;

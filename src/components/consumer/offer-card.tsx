"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Clock, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CountdownTimer } from "@/components/shared/countdown-timer";
import { formatCLP, getDeliveryPrice } from "@/lib/utils/commission";
import type { ConsumerOffer } from "@/hooks/use-consumer-offers";

interface OfferCardProps {
  offer: ConsumerOffer;
  requestAmount: number;
  onSelect: (offerId: string) => void;
  isSelecting: boolean;
  disabled?: boolean;
  /** Callback when offer expires during viewing - AC10.3.4 */
  onExpire?: (offerId: string) => void;
  /** Whether this is the best (first active) offer */
  isBestOffer?: boolean;
  /** Whether this is the first card (gets filled button) */
  isFirstCard?: boolean;
}

/**
 * Offer Card Component for Consumer View - Mockup aligned
 * AC10.1.2: Each offer card shows: provider name, avatar, delivery window, price, expiration countdown, "Seleccionar" button
 * AC10.3.3: Visual urgency indicator (orange < 10 min, red < 5 min)
 * AC10.3.4: Real-time expiration handling with "Expirada" badge
 * AC10.3.5: Disabled selection on expired offers
 */
export function OfferCard({
  offer,
  requestAmount,
  onSelect,
  isSelecting,
  disabled = false,
  onExpire,
  isBestOffer = false,
  isFirstCard = false,
}: OfferCardProps) {
  // Track local expired state for real-time updates - AC10.3.4
  const [localExpired, setLocalExpired] = useState(false);

  // Check if offer is expired (from server status OR local real-time detection)
  const isExpired =
    offer.status === "expired" ||
    new Date(offer.expires_at) < new Date() ||
    localExpired;

  // Handle expiration callback - AC10.3.4
  const handleExpire = useCallback(() => {
    setLocalExpired(true);
    onExpire?.(offer.id);
  }, [offer.id, onExpire]);

  // Calculate price based on request amount (single source of truth)
  const price = getDeliveryPrice(requestAmount);

  // Format delivery window
  const deliveryWindowText = `${format(
    new Date(offer.delivery_window_start),
    "HH:mm",
    { locale: es }
  )} - ${format(new Date(offer.delivery_window_end), "HH:mm", { locale: es })}`;

  // Get provider name and initials for avatar
  const providerName = offer.profiles?.name || "Repartidor";
  const initials = providerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // NOTE: Provider reputation metrics (rating, delivery count) intentionally removed
  // as part of Story 12-5 to eliminate fake social proof.
  // Future Implementation Pattern (when real data available):
  // - Only show metrics when provider has >50 completed deliveries
  // - Rating should come from real customer reviews
  // - Use: const { rating, deliveryCount } = offer.profiles || {}
  // - Condition: {deliveryCount >= 50 && <span>{rating} • {deliveryCount} entregas</span>}

  return (
    <div
      className={`bg-white rounded-2xl border ${
        isFirstCard && !isExpired ? "border-[#0077B6] border-2" : "border-gray-200"
      } p-4 transition-all ${isExpired ? "opacity-50" : ""}`}
      data-testid="consumer-offer-card"
    >
      {/* Top Row: Provider info + Price */}
      <div className="flex items-start justify-between mb-4">
        {/* Provider Avatar + Info */}
        <div className="flex items-center gap-3">
          {/* Avatar circle with initials */}
          <div
            className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center shrink-0"
            data-testid="provider-avatar"
          >
            {offer.profiles?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={offer.profiles.avatar_url}
                alt={providerName}
                className="w-11 h-11 rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <div>
            <p
              className="font-semibold text-gray-900"
              data-testid="provider-name"
            >
              {providerName}
            </p>
            {/* Provider verified badge - factual statement only */}
            <p className="text-xs text-gray-500">
              Proveedor verificado
            </p>
          </div>
        </div>

        {/* Price + Best offer badge */}
        <div className="text-right">
          <p
            className="text-xl font-bold text-gray-900"
            data-testid="offer-price"
          >
            {formatCLP(price)}
          </p>
          {isBestOffer && !isExpired && (
            <span className="text-xs font-medium text-[#10B981]">Mejor precio</span>
          )}
        </div>
      </div>

      {/* Bottom Row: Delivery window + Countdown + Button */}
      <div className="flex items-center justify-between">
        {/* Delivery window */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span
            className="text-sm text-gray-600"
            data-testid="delivery-window"
          >
            {deliveryWindowText}
          </span>
        </div>

        {/* Countdown or Expired badge */}
        {isExpired ? (
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-1">
            Expirada
          </span>
        ) : (
          <CountdownTimer
            expiresAt={offer.expires_at}
            onExpire={handleExpire}
            data-testid="offer-countdown"
          />
        )}
      </div>

      {/* Select Button */}
      <Button
        onClick={() => onSelect(offer.id)}
        disabled={isExpired || isSelecting || disabled}
        variant={isFirstCard && !isExpired ? "default" : "outline"}
        className={`w-full mt-4 rounded-xl h-11 text-sm font-semibold ${
          isFirstCard && !isExpired
            ? "bg-[#0077B6] hover:bg-[#005f8f] text-white"
            : "border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}
        data-testid="select-offer-button"
      >
        {isSelecting ? "Seleccionando..." : "Seleccionar oferta"}
      </Button>
    </div>
  );
}

export default OfferCard;

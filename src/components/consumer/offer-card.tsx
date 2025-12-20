"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
}

/**
 * Offer Card Component for Consumer View
 * AC10.1.2: Each offer card shows: provider name, avatar, delivery window, price, expiration countdown, "Seleccionar" button
 * AC10.3.3: Visual urgency indicator (orange < 10 min, red < 5 min)
 * AC10.3.4: Real-time expiration handling with "Expirada" badge
 * AC10.3.5: Disabled selection on expired offers
 *
 * Pattern follows Epic 8 OfferCard with consumer-specific adaptations
 */
export function OfferCard({
  offer,
  requestAmount,
  onSelect,
  isSelecting,
  disabled = false,
  onExpire,
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

  // Get provider initials for avatar fallback
  const providerName = offer.profiles?.name || "Repartidor";
  const initials = providerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card
      className={`transition-all ${isExpired ? "opacity-50" : ""}`}
      data-testid="consumer-offer-card"
    >
      <CardContent className="pt-4">
        <div className="flex flex-col gap-3">
          {/* Header: Provider info + Countdown */}
          <div className="flex items-center justify-between">
            {/* Provider Avatar + Name */}
            <div className="flex items-center gap-3">
              {/* Avatar circle with initials */}
              <div
                className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"
                data-testid="provider-avatar"
              >
                {offer.profiles?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={offer.profiles.avatar_url}
                    alt={providerName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-blue-600">
                    {initials || <User className="h-5 w-5 text-blue-600" />}
                  </span>
                )}
              </div>
              <div>
                <p
                  className="font-medium text-gray-900"
                  data-testid="provider-name"
                >
                  {providerName}
                </p>
              </div>
            </div>

            {/* Expired badge or Countdown - AC10.3.4, AC10.3.3 */}
            {isExpired ? (
              <Badge
                className="bg-gray-100 text-gray-600"
                data-testid="offer-expired-badge"
              >
                Expirada
              </Badge>
            ) : (
              <CountdownTimer
                expiresAt={offer.expires_at}
                onExpire={handleExpire}
                data-testid="offer-countdown"
              />
            )}
          </div>

          {/* Delivery window and price row */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            {/* Delivery window */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Entrega</p>
                <p
                  className="text-sm font-medium text-gray-900"
                  data-testid="delivery-window"
                >
                  {deliveryWindowText}
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-xs text-gray-500">Precio</p>
              <p
                className="text-lg font-bold text-green-600"
                data-testid="offer-price"
              >
                {formatCLP(price)}
              </p>
            </div>
          </div>

          {/* Optional message from provider */}
          {offer.message && (
            <p className="text-sm text-gray-600 italic bg-blue-50 rounded p-2">
              &ldquo;{offer.message}&rdquo;
            </p>
          )}

          {/* Select button - AC10.1.2 */}
          <Button
            onClick={() => onSelect(offer.id)}
            disabled={isExpired || isSelecting || disabled}
            className="w-full bg-[#0077B6] hover:bg-[#005f8f]"
            data-testid="select-offer-button"
          >
            {isSelecting ? "Seleccionando..." : "Seleccionar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default OfferCard;

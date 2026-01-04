"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MapPin, Droplets, Sparkles, XCircle, Eye, Loader2, Send, AlertTriangle, CheckCircle, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CountdownTimer } from "@/components/shared/countdown-timer";
import { formatLiters } from "@/lib/utils/commission";
import { withdrawOffer, type OfferWithRequest } from "@/lib/actions/offers";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface OfferCardProps {
  offer: OfferWithRequest;
  isNew?: boolean;
  onWithdraw?: (offerId: string) => void;
  onExpire?: (offerId: string) => void;
}

const statusConfig = {
  active: {
    label: "Pendiente",
    className: "bg-orange-100 text-orange-800",
  },
  accepted: {
    label: "Aceptada",
    className: "bg-green-100 text-green-800",
  },
  expired: {
    label: "Expirada",
    className: "bg-gray-100 text-gray-600",
  },
  cancelled: {
    label: "Cancelada",
    className: "bg-gray-100 text-gray-600",
  },
  request_filled: {
    label: "No seleccionada",
    className: "bg-gray-100 text-gray-600",
  },
};

// History status array defined outside component to avoid re-creation
const HISTORY_STATUSES = ["expired", "cancelled", "request_filled"];

/**
 * Offer Card Component
 * AC: 8.3.2 - Display request summary (amount, comuna), delivery window
 * AC: 8.3.3 - Integrate countdown timer for pending offers
 * AC: 8.3.4 - "Cancelar Oferta" button (pending only)
 * AC: 8.3.5 - "Ver Entrega" button (accepted only)
 *
 * Performance: Wrapped in memo, uses useCallback/useMemo for stable references
 */
function OfferCardComponent({ offer, isNew = false, onWithdraw, onExpire }: OfferCardProps) {
  const router = useRouter();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Memoize computed status flags
  const { isActive, isAccepted, isCancelled, isHistoryStatus } = useMemo(() => ({
    isActive: offer.status === "active",
    isAccepted: offer.status === "accepted",
    isCancelled: offer.status === "cancelled",
    isHistoryStatus: HISTORY_STATUSES.includes(offer.status),
  }), [offer.status]);

  // Memoize status badge lookup
  const statusBadge = useMemo(() =>
    statusConfig[offer.status] || {
      label: offer.status,
      className: "bg-gray-100 text-gray-800",
    },
  [offer.status]);

  // Memoize formatted delivery window
  const formattedDeliveryWindow = useMemo(() => ({
    start: format(new Date(offer.delivery_window_start), "d MMM, HH:mm", { locale: es }),
    end: format(new Date(offer.delivery_window_end), "HH:mm", { locale: es }),
  }), [offer.delivery_window_start, offer.delivery_window_end]);

  // AC: 8.4.2 - Handle offer withdrawal (memoized)
  const handleWithdraw = useCallback(async () => {
    setIsWithdrawing(true);
    try {
      const result = await withdrawOffer(offer.id);
      if (result.success) {
        // AC: 8.4.3 - Provider sees "Oferta cancelada" toast
        toast.success("Oferta cancelada");
        onWithdraw?.(offer.id);
        router.refresh();
      } else {
        toast.error(result.error || "Error al cancelar la oferta");
      }
    } catch (error) {
      console.error("[OfferCard] Error withdrawing offer:", error);
      toast.error("Error al cancelar la oferta");
    } finally {
      setIsWithdrawing(false);
      setShowCancelDialog(false);
    }
  }, [offer.id, onWithdraw, router]);

  // Handle countdown expiration (memoized)
  const handleExpire = useCallback(() => {
    onExpire?.(offer.id);
    router.refresh();
  }, [offer.id, onExpire, router]);

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 px-3 py-3 ${
        isHistoryStatus ? "opacity-60" : ""
      } ${isNew ? "ring-2 ring-orange-500 ring-offset-2" : ""}`}
      data-testid={isNew ? "new-offer-card" : "offer-card"}
    >
      {/* Row 1: Status badges */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
        {isNew && (
          <Badge className="bg-orange-500 text-white flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Nueva
          </Badge>
        )}
        {/* Dispute indicator */}
        {offer.dispute && (
          <Badge
            className={
              offer.dispute.status === "open"
                ? "bg-red-100 text-red-700 flex items-center gap-1"
                : offer.dispute.status === "under_review"
                  ? "bg-amber-100 text-amber-700 flex items-center gap-1"
                  : offer.dispute.status === "resolved_provider"
                    ? "bg-green-100 text-green-700 flex items-center gap-1"
                    : offer.dispute.status === "resolved_consumer"
                      ? "bg-gray-100 text-gray-600 flex items-center gap-1"
                      : "bg-gray-100 text-gray-700 flex items-center gap-1"
            }
          >
            {offer.dispute.status === "open" ? (
              <>
                <AlertTriangle className="h-3 w-3" />
                Disputa
              </>
            ) : offer.dispute.status === "under_review" ? (
              <>
                <Clock className="h-3 w-3" />
                En revisión
              </>
            ) : offer.dispute.status === "resolved_provider" ? (
              <>
                <CheckCircle className="h-3 w-3" />
                A tu favor
              </>
            ) : offer.dispute.status === "resolved_consumer" ? (
              <>
                <XCircle className="h-3 w-3" />
                En contra
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3" />
                Disputa
              </>
            )}
          </Badge>
        )}
        {/* AC: 8.3.3 - Countdown for active offers */}
        {isActive && (
          <CountdownTimer
            expiresAt={offer.expires_at}
            onExpire={handleExpire}
            className="text-orange-600 ml-auto"
            data-testid="offer-countdown"
          />
        )}
      </div>

      {/* Row 2: Location + Amount inline */}
      {offer.request && (
        <div className="flex items-center gap-4 mb-2">
          <span className="flex items-center gap-1.5 text-sm">
            <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
            <span className="font-semibold text-gray-900">
              {offer.request.comuna_name || "Sin ubicación"}
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-sm">
            <Droplets className="h-4 w-4 text-blue-500 shrink-0" />
            <span className="font-medium text-gray-700">{formatLiters(offer.request.amount)}</span>
          </span>
          {offer.request.is_urgent && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
              Urgente
            </Badge>
          )}
        </div>
      )}

      {/* Row 3: Delivery window */}
      <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-3">
        <Calendar className="h-3.5 w-3.5 text-gray-400" />
        <span>Entrega propuesta:</span>
        <span className="font-medium">
          {formattedDeliveryWindow.start} - {formattedDeliveryWindow.end}
        </span>
      </div>

      {/* Row 4: Message if exists */}
      {offer.message && (
        <p className="text-xs text-gray-500 italic truncate mb-3">
          &ldquo;{offer.message}&rdquo;
        </p>
      )}

      {/* Row 5: Action button - full width */}
      {isActive && (
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-10 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              disabled={isWithdrawing}
            >
              {isWithdrawing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar Oferta
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Cancelar esta oferta?</AlertDialogTitle>
              <AlertDialogDescription>
                Si cancelas esta oferta, ya no estarás participando por esta solicitud.
                Podrás enviar una nueva oferta si la solicitud sigue disponible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isWithdrawing}>Volver</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="bg-red-500 hover:bg-red-600"
              >
                {isWithdrawing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Sí, cancelar"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {isAccepted && (
        <Button
          asChild
          className="w-full h-10 bg-green-500 hover:bg-green-600"
        >
          <Link href={`/provider/deliveries/${offer.request?.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            Ver Entrega
          </Link>
        </Button>
      )}

      {isCancelled && offer.request && (
        <Button
          asChild
          variant="outline"
          className="w-full h-10 text-orange-600 border-orange-200 hover:bg-orange-50"
          data-testid="resubmit-offer-button"
        >
          <Link href={`/provider/requests/${offer.request.id}`}>
            <Send className="h-4 w-4 mr-2" />
            Enviar nueva oferta
          </Link>
        </Button>
      )}
    </div>
  );
}

// Memoized export - prevents re-render when parent re-renders with same props
export const OfferCard = memo(OfferCardComponent);
export default OfferCard;

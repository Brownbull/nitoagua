"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { MapPin, Droplets, Sparkles, XCircle, Eye, Loader2, Send } from "lucide-react";
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

/**
 * Offer Card Component
 * AC: 8.3.2 - Display request summary (amount, comuna), delivery window
 * AC: 8.3.3 - Integrate countdown timer for pending offers
 * AC: 8.3.4 - "Cancelar Oferta" button (pending only)
 * AC: 8.3.5 - "Ver Entrega" button (accepted only)
 */
export function OfferCard({ offer, isNew = false, onWithdraw, onExpire }: OfferCardProps) {
  const router = useRouter();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const isActive = offer.status === "active";
  const isAccepted = offer.status === "accepted";
  const isCancelled = offer.status === "cancelled";
  const isHistoryStatus = ["expired", "cancelled", "request_filled"].includes(offer.status);

  const statusBadge = statusConfig[offer.status] || {
    label: offer.status,
    className: "bg-gray-100 text-gray-800",
  };

  // AC: 8.4.2 - Handle offer withdrawal
  const handleWithdraw = async () => {
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
  };

  // Handle countdown expiration
  const handleExpire = () => {
    onExpire?.(offer.id);
    router.refresh();
  };

  return (
    <Card
      className={`transition-all ${isHistoryStatus ? "opacity-60" : ""} ${
        isNew ? "ring-2 ring-orange-500 ring-offset-2" : ""
      }`}
      data-testid={isNew ? "new-offer-card" : "offer-card"}
    >
      <CardContent className="pt-4">
        <div className="flex flex-col gap-3">
          {/* Header: Status + Countdown/New Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
              {isNew && (
                <Badge className="bg-orange-500 text-white flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Nueva
                </Badge>
              )}
            </div>

            {/* AC: 8.3.3 - Countdown for active offers */}
            {isActive && (
              <CountdownTimer
                expiresAt={offer.expires_at}
                onExpire={handleExpire}
                className="text-orange-600"
                data-testid="offer-countdown"
              />
            )}
          </div>

          {/* Request info - AC: 8.3.2 */}
          {offer.request && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">
                  {offer.request.comuna_name || "Ubicación desconocida"}
                </span>
                {offer.request.is_urgent && (
                  <Badge variant="destructive" className="text-xs py-0">
                    Urgente
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Droplets className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">{formatLiters(offer.request.amount)}</span>
              </div>
            </div>
          )}

          {/* Delivery window - AC: 8.3.2 */}
          <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
            <span className="font-medium">Entrega propuesta:</span>{" "}
            {format(new Date(offer.delivery_window_start), "d MMM, HH:mm", { locale: es })} -{" "}
            {format(new Date(offer.delivery_window_end), "HH:mm", { locale: es })}
          </div>

          {/* Message if exists */}
          {offer.message && (
            <p className="text-xs text-gray-500 italic truncate">
              &ldquo;{offer.message}&rdquo;
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 mt-1">
            {/* AC: 8.3.4 - "Cancelar Oferta" button for pending offers */}
            {isActive && (
              <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    disabled={isWithdrawing}
                  >
                    {isWithdrawing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancelar Oferta
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                {/* AC: 8.4.1 - Confirmation dialog */}
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

            {/* "Ver Entrega" button for accepted offers - links to delivery page */}
            {isAccepted && (
              <Button
                asChild
                variant="default"
                size="sm"
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Link href={`/provider/deliveries/${offer.request?.id}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Entrega
                </Link>
              </Button>
            )}

            {/* AC: 8.4.5 - "Enviar nueva oferta" button for cancelled offers */}
            {isCancelled && offer.request && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                data-testid="resubmit-offer-button"
              >
                <Link href={`/provider/requests/${offer.request.id}`}>
                  <Send className="h-4 w-4 mr-1" />
                  Enviar nueva oferta
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default OfferCard;

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Droplets,
  Clock,
  MessageSquare,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Zap,
  Truck,
} from "lucide-react";
import { format, differenceInMinutes, differenceInHours } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { formatLiters } from "@/lib/utils/commission";
import { completeDelivery, startDelivery } from "@/lib/actions/delivery";

interface DisputeInfo {
  id: string;
  status: string;
  disputeType: string;
  createdAt: string;
  resolutionNotes: string | null;
}

interface DeliveryData {
  offerId: string;
  requestId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  comunaName: string;
  amount: number;
  isUrgent: boolean;
  specialInstructions: string | null;
  deliveryWindowStart: string;
  deliveryWindowEnd: string;
  acceptedAt: string | null;
  requestStatus: string;
  dispute: DisputeInfo | null;
}

interface DeliveryDetailClientProps {
  delivery: DeliveryData;
}

/**
 * Client component for delivery detail page - Redesigned for driver usability (Story 12.7-10)
 * AC: 12.7.10.2 - Single screen layout, quick actions visible, countdown timer
 * AC: 12.7.10.3 - Mobile-first, no scrolling for critical actions
 */
export function DeliveryDetailClient({ delivery }: DeliveryDetailClientProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingDelivery, setIsStartingDelivery] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(delivery.requestStatus);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const router = useRouter();

  // Generate Google Maps link for navigation
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    delivery.deliveryAddress
  )}`;

  // Calculate and update time remaining countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endTime = new Date(delivery.deliveryWindowEnd);
      const diffMinutes = differenceInMinutes(endTime, now);

      if (diffMinutes <= 0) {
        setTimeRemaining("¡Tiempo agotado!");
      } else if (diffMinutes < 60) {
        setTimeRemaining(`${diffMinutes} min`);
      } else {
        const hours = differenceInHours(endTime, now);
        const mins = diffMinutes % 60;
        setTimeRemaining(`${hours}h ${mins}min`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [delivery.deliveryWindowEnd]);

  const handleCompleteDelivery = async () => {
    setIsSubmitting(true);
    try {
      const result = await completeDelivery(delivery.offerId);
      if (result.success) {
        toast.success("¡Entrega completada!");
        router.push("/provider/offers");
      } else {
        toast.error(result.error || "Error al completar la entrega");
      }
    } catch {
      toast.error("Error inesperado");
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  // AC12.7.11.1: Handle start delivery (mark as "En Camino")
  const handleStartDelivery = async () => {
    setIsStartingDelivery(true);
    try {
      const result = await startDelivery(delivery.requestId);
      if (result.success) {
        toast.success("¡Estás en camino!");
        setCurrentStatus("in_transit");
      } else {
        toast.error(result.error || "Error al iniciar la entrega");
      }
    } catch {
      toast.error("Error inesperado");
    } finally {
      setIsStartingDelivery(false);
    }
  };

  const isAccepted = currentStatus === "accepted";
  const isInTransit = currentStatus === "in_transit";
  const canComplete = isAccepted || isInTransit;

  // Format delivery end time for display
  const formatEndTime = (isoDate: string) => {
    try {
      return format(new Date(isoDate), "HH:mm", { locale: es });
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-orange-50 to-white flex flex-col">
      {/* Fixed Header - AC12.7.10.2: Back button + status */}
      <div className="shrink-0 bg-white border-b px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/provider/offers">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            {/* AC12.7.11.1: Show status badge based on current status */}
            {isInTransit ? (
              <Badge className="bg-indigo-500" data-testid="in-transit-badge">
                🚗 En Camino
              </Badge>
            ) : (
              <Badge className="bg-green-500" data-testid="active-badge">
                🚚 Entrega Activa
              </Badge>
            )}
            {delivery.isUrgent && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Urgente
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
          {/* AC12.7.10.2 - Address Section with Quick Actions */}
          <div
            className="bg-white rounded-xl border border-gray-200 p-4"
            data-testid="address-section"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-bold text-lg text-gray-900 leading-tight"
                  data-testid="delivery-address"
                >
                  {delivery.deliveryAddress}
                </p>
              </div>
            </div>

            {/* AC12.7.10.2 - Quick Action Buttons: Call + Navigate */}
            <div
              className="grid grid-cols-2 gap-3"
              data-testid="quick-actions"
            >
              <Button
                asChild
                variant="outline"
                className="h-12 text-green-600 border-green-300 hover:bg-green-50"
                data-testid="call-button"
              >
                <a href={`tel:${delivery.customerPhone}`}>
                  <Phone className="h-5 w-5 mr-2" />
                  Llamar
                </a>
              </Button>
              <Button
                asChild
                className="h-12 bg-blue-500 hover:bg-blue-600"
                data-testid="navigate-button"
              >
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  <Navigation className="h-5 w-5 mr-2" />
                  Navegar
                </a>
              </Button>
            </div>
          </div>

          {/* AC12.7.10.2 - Customer + Order Details Compact */}
          <div
            className="bg-white rounded-xl border border-gray-200 p-4"
            data-testid="order-details"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Customer */}
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Cliente</p>
                  <p
                    className="font-medium text-gray-900"
                    data-testid="customer-name"
                  >
                    {delivery.customerName}
                  </p>
                </div>
              </div>

              {/* Amount */}
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Cantidad</p>
                  <p
                    className="font-bold text-blue-600"
                    data-testid="delivery-amount"
                  >
                    {formatLiters(delivery.amount)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AC12.7.10.2 - Special Instructions Highlighted */}
          {delivery.specialInstructions && (
            <div
              className="bg-amber-50 border border-amber-200 rounded-xl p-4"
              data-testid="special-instructions"
            >
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-amber-800">
                    Instrucciones especiales
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    {delivery.specialInstructions}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dispute Info - Show if there's a dispute */}
          {delivery.dispute && (
            <div
              className="bg-red-50 border border-red-200 rounded-xl p-4"
              data-testid="dispute-info"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Disputa Reportada
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    {delivery.dispute.disputeType === "not_delivered"
                      ? "No recibí mi pedido"
                      : delivery.dispute.disputeType === "wrong_quantity"
                        ? "Cantidad incorrecta"
                        : delivery.dispute.disputeType === "late_delivery"
                          ? "Llegó tarde"
                          : delivery.dispute.disputeType === "quality_issue"
                            ? "Mala calidad"
                            : "Otro problema"}
                  </p>
                  <Badge
                    className={`mt-2 ${
                      delivery.dispute.status === "open"
                        ? "bg-red-100 text-red-700"
                        : delivery.dispute.status === "under_review"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {delivery.dispute.status === "open"
                      ? "Abierta"
                      : delivery.dispute.status === "under_review"
                        ? "En Revisión"
                        : "Resuelta"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Footer - AC12.7.10.2: Time remaining + Action Button always visible */}
      <div className="shrink-0 bg-white border-t safe-area-bottom">
        <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
          {/* AC12.7.10.2 - Time Remaining with Countdown */}
          <div
            className="bg-gray-100 rounded-lg px-4 py-3 flex items-center justify-between"
            data-testid="time-remaining"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">Entregar antes de:</span>
              <span className="font-bold text-gray-900">
                {formatEndTime(delivery.deliveryWindowEnd)}
              </span>
            </div>
            <Badge
              variant="outline"
              className={`${
                timeRemaining.includes("agotado")
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-orange-300 bg-orange-50 text-orange-700"
              }`}
              data-testid="countdown"
            >
              {timeRemaining}
            </Badge>
          </div>

          {/* AC12.7.11.1: Two-step delivery flow: Start → Complete */}
          {isAccepted ? (
            // Step 1: "Iniciar Entrega" button - AC12.7.11.1
            <Button
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg font-semibold"
              onClick={handleStartDelivery}
              disabled={isStartingDelivery}
              data-testid="start-delivery-button"
            >
              {isStartingDelivery ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Truck className="h-5 w-5 mr-2" />
                  INICIAR ENTREGA
                </>
              )}
            </Button>
          ) : isInTransit ? (
            // Step 2: "Marcar como Entregado" button - shown after starting
            <Button
              className="w-full h-14 bg-green-600 hover:bg-green-700 text-lg font-semibold"
              onClick={() => setShowConfirmDialog(true)}
              disabled={isSubmitting}
              data-testid="complete-delivery-button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  MARCAR COMO ENTREGADO
                </>
              )}
            </Button>
          ) : (
            // Already delivered
            <div className="text-center py-3 bg-gray-50 rounded-lg">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {currentStatus === "delivered"
                  ? "Esta entrega ya fue completada"
                  : "Esta entrega no puede ser completada"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Entrega</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>¿Confirmas que has entregado el pedido?</p>
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <p className="font-medium text-gray-900">
                    {delivery.customerName}
                  </p>
                  <p className="text-gray-600">{delivery.deliveryAddress}</p>
                  <p className="text-blue-600 font-medium mt-1">
                    {formatLiters(delivery.amount)}
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCompleteDelivery}
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Confirmar Entrega"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default DeliveryDetailClient;

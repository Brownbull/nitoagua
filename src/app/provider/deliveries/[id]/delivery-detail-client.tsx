"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { formatLiters } from "@/lib/utils/commission";
import { completeDelivery } from "@/lib/actions/delivery";

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
}

interface DeliveryDetailClientProps {
  delivery: DeliveryData;
}

/**
 * Client component for delivery detail page
 * AC: 8.5.3 - Display full customer contact info, complete delivery address,
 *             water amount, and delivery window
 * AC: 8.5.4 - "Ver Detalles" navigates here from notification
 */
export function DeliveryDetailClient({ delivery }: DeliveryDetailClientProps) {
  // AC 11A-1.2: State for confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  // AC 11A-1.4: Loading state during submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Generate Google Maps link for navigation
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    delivery.deliveryAddress
  )}`;

  /**
   * Handle delivery completion
   * AC 11A-1.3: Calls server action
   * AC 11A-1.4: Shows success/error toast and redirects
   */
  const handleCompleteDelivery = async () => {
    setIsSubmitting(true);
    try {
      const result = await completeDelivery(delivery.offerId);
      if (result.success) {
        // AC 11A-1.4: Success toast
        toast.success("¡Entrega completada!");
        // AC 11A-1.4: Redirect to provider offers
        router.push("/provider/offers");
      } else {
        // AC 11A-1.4: Error toast with reason
        toast.error(result.error || "Error al completar la entrega");
      }
    } catch {
      toast.error("Error inesperado");
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  // AC 11A-1.1: Button should only be enabled for accepted deliveries
  const canComplete = delivery.requestStatus === "accepted";

  // Format delivery window
  const formatDateTime = (isoDate: string) => {
    try {
      return format(new Date(isoDate), "EEEE d 'de' MMMM, HH:mm", { locale: es });
    } catch {
      return isoDate;
    }
  };

  const formatTimeOnly = (isoDate: string) => {
    try {
      return format(new Date(isoDate), "HH:mm", { locale: es });
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Back button */}
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild className="text-gray-600">
            <Link href="/provider/offers">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver a Mis Ofertas
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-green-500">Entrega Activa</Badge>
            {delivery.isUrgent && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Urgente
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Detalles de Entrega
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Entrega de {formatLiters(delivery.amount)} de agua
          </p>
        </div>

        {/* Customer Info Card - AC: 8.5.3 */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-orange-500" />
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Name */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-medium text-gray-900">{delivery.customerName}</p>
              </div>
            </div>

            {/* Customer Phone - AC: 8.5.3 */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Teléfono</p>
                <a
                  href={`tel:${delivery.customerPhone}`}
                  className="font-medium text-green-600 hover:text-green-700"
                >
                  {delivery.customerPhone}
                </a>
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <a href={`tel:${delivery.customerPhone}`}>
                  <Phone className="h-4 w-4 mr-1" />
                  Llamar
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address Card - AC: 8.5.3 */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-500" />
              Dirección de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-gray-900 mb-3">
              {delivery.deliveryAddress}
            </p>
            <Button asChild className="w-full bg-blue-500 hover:bg-blue-600">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="h-4 w-4 mr-2" />
                Abrir en Google Maps
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Delivery Details Card - AC: 8.5.3 */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              Detalles del Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Amount */}
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Cantidad</span>
              <span className="font-bold text-lg text-blue-600">
                {formatLiters(delivery.amount)}
              </span>
            </div>

            {/* Delivery Window - AC: 8.5.3 */}
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Ventana de Entrega</p>
                <p className="font-medium text-gray-900">
                  {formatDateTime(delivery.deliveryWindowStart)}
                </p>
                <p className="text-sm text-gray-600">
                  hasta {formatTimeOnly(delivery.deliveryWindowEnd)}
                </p>
              </div>
            </div>

            {/* Special Instructions */}
            {delivery.specialInstructions && (
              <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
                <MessageSquare className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Instrucciones Especiales</p>
                  <p className="text-gray-700">{delivery.specialInstructions}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons - AC 11A-1.1, 11A-1.2 */}
        <div className="space-y-3">
          {/* Mark as Delivered button - AC 11A-1.1: Enabled for accepted deliveries */}
          {canComplete ? (
            <Button
              className="w-full bg-green-500 hover:bg-green-600 h-12"
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
                  Marcar como Entregado
                </>
              )}
            </Button>
          ) : (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {delivery.requestStatus === "delivered"
                  ? "Esta entrega ya fue completada"
                  : "Esta entrega no puede ser completada"}
              </p>
            </div>
          )}
        </div>

        {/* AC 11A-1.2: Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Entrega</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2">
                  <p>¿Confirmas que has entregado el pedido?</p>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    {/* AC 11A-1.2: Show delivery summary */}
                    <p className="font-medium text-gray-900">{delivery.customerName}</p>
                    <p className="text-gray-600">{delivery.deliveryAddress}</p>
                    <p className="text-blue-600 font-medium mt-1">
                      {formatLiters(delivery.amount)}
                    </p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
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

        {/* Acceptance timestamp */}
        {delivery.acceptedAt && (
          <p className="text-xs text-gray-400 text-center mt-6">
            Oferta aceptada el{" "}
            {format(new Date(delivery.acceptedAt), "d 'de' MMMM 'a las' HH:mm", {
              locale: es,
            })}
          </p>
        )}
      </div>
    </div>
  );
}

export default DeliveryDetailClient;

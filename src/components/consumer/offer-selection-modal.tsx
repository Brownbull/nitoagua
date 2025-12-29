"use client";

import { Loader2, User, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
import { formatCLP, getDeliveryPrice } from "@/lib/utils/commission";
import type { ConsumerOffer } from "@/hooks/use-consumer-offers";

interface OfferSelectionModalProps {
  offer: ConsumerOffer | null;
  requestAmount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

/**
 * Offer Selection Confirmation Modal
 * AC10.2.1: Tapping "Seleccionar" opens confirmation modal
 * AC10.2.2: Modal displays provider name/avatar, delivery window, price
 *
 * Pattern follows Epic 3 DeliverConfirmDialog
 */
export function OfferSelectionModal({
  offer,
  requestAmount,
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: OfferSelectionModalProps) {
  if (!offer) return null;

  // Calculate price based on request amount
  const price = getDeliveryPrice(requestAmount);

  // Format delivery window
  const deliveryWindowText = `${format(
    new Date(offer.delivery_window_start),
    "HH:mm",
    { locale: es }
  )} - ${format(new Date(offer.delivery_window_end), "HH:mm", { locale: es })}`;

  // Get provider info
  const providerName = offer.profiles?.name || "Repartidor";
  const initials = providerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleOpenChange = (newOpen: boolean) => {
    // Don't allow closing while loading
    if (isLoading && !newOpen) return;
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent data-testid="offer-selection-modal">
        <AlertDialogHeader>
          <AlertDialogTitle data-testid="selection-modal-title">
            Confirmar Selección
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {/* Provider info with avatar - AC10.2.2 */}
              <div className="flex items-center gap-3 mt-2">
                <div
                  className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"
                  data-testid="modal-provider-avatar"
                >
                  {offer.profiles?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={offer.profiles.avatar_url}
                      alt={providerName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-base font-medium text-blue-600">
                      {initials || <User className="h-6 w-6 text-blue-600" />}
                    </span>
                  )}
                </div>
                <div>
                  <p
                    className="font-semibold text-foreground text-lg"
                    data-testid="modal-provider-name"
                  >
                    {providerName}
                  </p>
                  {/* Provider verified badge - factual statement only (Story 12-5) */}
                  <p className="text-sm text-muted-foreground">
                    Proveedor verificado
                  </p>
                </div>
              </div>

              {/* Delivery window and price - AC10.2.2 */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Entrega estimada</p>
                    <p
                      className="font-medium text-foreground"
                      data-testid="modal-delivery-window"
                    >
                      {deliveryWindowText}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 flex items-center justify-center text-gray-500 flex-shrink-0">
                    $
                  </span>
                  <div>
                    <p className="text-xs text-gray-500">Precio total</p>
                    <p
                      className="font-bold text-lg text-green-600"
                      data-testid="modal-price"
                    >
                      {formatCLP(price)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Provider message if present */}
              {offer.message && (
                <p className="text-sm text-gray-600 italic bg-blue-50 rounded p-3">
                  &ldquo;{offer.message}&rdquo;
                </p>
              )}

              <p className="text-sm text-muted-foreground text-center">
                Al confirmar, el repartidor será notificado y podrás ver el
                estado de tu entrega.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          {/* Cancel button - Spanish copy per Dev Notes */}
          <AlertDialogCancel
            disabled={isLoading}
            data-testid="selection-cancel-button"
          >
            Volver
          </AlertDialogCancel>
          {/* Confirm button - AC10.2.3 */}
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="bg-[#0077B6] hover:bg-[#005f8f]"
            data-testid="selection-confirm-button"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirmando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar Selección
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default OfferSelectionModal;

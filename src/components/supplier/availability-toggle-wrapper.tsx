"use client";

import { useState } from "react";
import { AvailabilityToggle, type ActiveDelivery } from "./availability-toggle";
import {
  toggleAvailability,
  type ToggleAvailabilityResult,
} from "@/lib/actions/provider-settings";
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
import { AlertTriangle, MapPin } from "lucide-react";

interface AvailabilityToggleWrapperProps {
  initialValue: boolean;
  disabled?: boolean;
}

export function AvailabilityToggleWrapper({
  initialValue,
  disabled = false,
}: AvailabilityToggleWrapperProps) {
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [activeDeliveries, setActiveDeliveries] = useState<ActiveDelivery[]>([]);

  const handleToggle = async (
    isAvailable: boolean
  ): Promise<ToggleAvailabilityResult> => {
    return toggleAvailability(isAvailable, false);
  };

  const handleConfirmToggle = async (
    isAvailable: boolean
  ): Promise<ToggleAvailabilityResult> => {
    setShowWarningDialog(false);
    return toggleAvailability(isAvailable, true);
  };

  const handleNeedsConfirmation = (deliveries: ActiveDelivery[]) => {
    setActiveDeliveries(deliveries);
    setShowWarningDialog(true);
  };

  const handleCancelWarning = () => {
    setShowWarningDialog(false);
    setActiveDeliveries([]);
  };

  const handleConfirmWarning = async () => {
    // Trigger the confirmed toggle (turn OFF with skip warning)
    await handleConfirmToggle(false);
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "accepted":
        return "Aceptada";
      case "en_route":
        return "En camino";
      default:
        return status;
    }
  };

  return (
    <>
      <AvailabilityToggle
        initialValue={initialValue}
        onToggle={handleToggle}
        onConfirmToggle={handleConfirmToggle}
        onNeedsConfirmation={handleNeedsConfirmation}
        disabled={disabled}
      />

      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent data-testid="active-deliveries-warning-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Tienes {activeDeliveries.length} entrega
              {activeDeliveries.length > 1 ? "s" : ""} en progreso
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Si te desconectas, las siguientes entregas aún estarán activas y
                deberás completarlas:
              </p>

              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {activeDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg text-sm"
                    data-testid={`active-delivery-${delivery.id}`}
                  >
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 truncate">{delivery.address}</p>
                      <span className="text-xs text-amber-600 font-medium">
                        {getStatusLabel(delivery.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelWarning}
              data-testid="cancel-unavailable-button"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmWarning}
              className="bg-amber-600 hover:bg-amber-700"
              data-testid="confirm-unavailable-button"
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

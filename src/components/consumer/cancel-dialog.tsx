"use client";

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

interface CancelDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  activeOfferCount?: number;
}

export function CancelDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading,
  activeOfferCount = 0,
}: CancelDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar Solicitud</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                ¿Estás seguro de que quieres cancelar esta solicitud? Esta acción no
                se puede deshacer.
              </p>
              {activeOfferCount > 0 && (
                <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg" data-testid="active-offers-warning">
                  ⚠️ Hay {activeOfferCount} {activeOfferCount === 1 ? "oferta activa" : "ofertas activas"} de repartidores.
                  Al cancelar, serán notificados.
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Volver</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isLoading ? "Cancelando..." : "Cancelar Solicitud"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

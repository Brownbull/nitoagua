"use client";

import { Loader2, Truck } from "lucide-react";
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
import type { WaterRequest } from "@/lib/supabase/types";

interface DeliverConfirmDialogProps {
  request: WaterRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

function formatAmount(amount: number): string {
  if (amount >= 1000) {
    return `${amount / 1000}kL`;
  }
  return `${amount}L`;
}

function truncateAddress(address: string, maxLength: number = 40): string {
  if (address.length <= maxLength) return address;
  return address.substring(0, maxLength) + "...";
}

export function DeliverConfirmDialog({
  request,
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: DeliverConfirmDialogProps) {
  if (!request) return null;

  const customerName = request.guest_name || "Cliente";

  const handleOpenChange = (newOpen: boolean) => {
    // Don't allow closing while loading
    if (isLoading && !newOpen) return;
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent data-testid="deliver-confirm-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle data-testid="deliver-dialog-title">
            ¿Confirmar entrega completada?
          </AlertDialogTitle>
          <AlertDialogDescription data-testid="deliver-dialog-description" asChild>
            <div className="space-y-2">
              <p>
                <span className="font-medium text-foreground">{customerName}</span>
                {" — "}
                <span className="font-semibold">{formatAmount(request.amount)}</span>
              </p>
              <p className="text-muted-foreground" title={request.address}>
                {truncateAddress(request.address)}
              </p>
              <p className="text-sm mt-2">
                Esta acción marcará la solicitud como entregada.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel
            disabled={isLoading}
            data-testid="deliver-cancel-button"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
            data-testid="deliver-confirm-button"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Truck className="w-4 h-4 mr-2" />
                Confirmar Entrega
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WaterRequest } from "@/lib/supabase/types";

interface DeliveryModalProps {
  request: WaterRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (requestId: string, deliveryWindow?: string) => Promise<void>;
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

export function DeliveryModal({
  request,
  open,
  onOpenChange,
  onConfirm,
}: DeliveryModalProps) {
  const [deliveryWindow, setDeliveryWindow] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!request) return;

    setIsSubmitting(true);
    try {
      await onConfirm(request.id, deliveryWindow.trim() || undefined);
      setDeliveryWindow("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setDeliveryWindow("");
      onOpenChange(false);
    }
  };

  if (!request) return null;

  const customerName = request.guest_name || "Cliente";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent data-testid="delivery-modal" showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle data-testid="modal-title">¿Aceptar esta solicitud?</DialogTitle>
          <DialogDescription data-testid="modal-description">
            <span className="font-medium text-foreground">{customerName}</span>
            {" — "}
            <span className="font-semibold">{formatAmount(request.amount)}</span>
            <br />
            <span className="text-muted-foreground" title={request.address}>
              {truncateAddress(request.address)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="delivery-window" className="text-sm font-medium">
            Ventana de entrega (opcional)
          </Label>
          <Input
            id="delivery-window"
            value={deliveryWindow}
            onChange={(e) => setDeliveryWindow(e.target.value)}
            placeholder="Ej: Mañana 2-4pm, Hoy en la tarde"
            className="mt-2"
            disabled={isSubmitting}
            data-testid="delivery-window-input"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {/* Cancelar on left (mobile: bottom due to flex-col-reverse) */}
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            data-testid="cancel-button"
          >
            Cancelar
          </Button>
          {/* Confirmar on right (primary action, closer to right thumb) */}
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
            data-testid="confirm-button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Aceptando...
              </>
            ) : (
              "Confirmar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

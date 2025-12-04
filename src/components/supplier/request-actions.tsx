"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeliveryModal } from "./delivery-modal";
import { DeliverConfirmDialog } from "./deliver-confirm-dialog";
import type { WaterRequest } from "@/lib/supabase/types";

interface RequestActionsProps {
  request: WaterRequest;
}

export function RequestActions({ request }: RequestActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isDeliverDialogOpen, setIsDeliverDialogOpen] = useState(false);

  // Only show action buttons for pending or accepted requests
  if (request.status !== "pending" && request.status !== "accepted") {
    return null;
  }

  const handleAcceptClick = () => {
    setIsAcceptModalOpen(true);
  };

  const handleDeliverClick = () => {
    setIsDeliverDialogOpen(true);
  };

  const handleConfirmAccept = async (requestId: string, deliveryWindow?: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "accept",
          deliveryWindow,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        toast.error(result.error?.message || "Error al aceptar la solicitud");
        return;
      }

      // Success!
      toast.success("Solicitud aceptada");

      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error("Accept request error:", error);
      toast.error("Error de conexión. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDeliver = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/requests/${request.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "deliver",
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        toast.error(result.error?.message || "Error al marcar como entregado");
        return;
      }

      // Success!
      toast.success("Entrega completada");
      setIsDeliverDialogOpen(false);

      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error("Deliver request error:", error);
      toast.error("Error de conexión. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    // Future story will implement decline with optional reason
    setIsLoading(true);

    // TODO: Implement decline with optional reason
    alert("Próximamente: Rechazar solicitud con razón opcional");

    setIsLoading(false);
  };

  // Render actions based on request status
  if (request.status === "accepted") {
    return (
      <>
        <Card data-testid="request-actions-card">
          <CardContent className="pt-6">
            {/* Full width Marcar Entregado button for accepted requests */}
            <Button
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 h-14"
              onClick={handleDeliverClick}
              disabled={isLoading}
              data-testid="deliver-button"
            >
              <Truck className="w-5 h-5 mr-2" />
              Marcar Entregado
            </Button>
          </CardContent>
        </Card>

        {/* Deliver Confirm Dialog */}
        <DeliverConfirmDialog
          request={request}
          open={isDeliverDialogOpen}
          onOpenChange={setIsDeliverDialogOpen}
          onConfirm={handleConfirmDeliver}
          isLoading={isLoading}
        />
      </>
    );
  }

  // Pending request actions
  return (
    <>
      <Card data-testid="request-actions-card">
        <CardContent className="pt-6">
          {/* Side-by-side layout: Rechazar 40% left, Aceptar 60% right (right-handed friendly) */}
          <div className="flex gap-3">
            {/* Rechazar on left - 40% width */}
            <Button
              size="lg"
              variant="outline"
              className="w-[40%] border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 h-14"
              onClick={handleDecline}
              disabled={isLoading}
              data-testid="decline-button"
            >
              <X className="w-5 h-5 mr-2" />
              Rechazar
            </Button>
            {/* Aceptar on right - 60% width (primary action, closer to right thumb) */}
            <Button
              size="lg"
              className="w-[60%] bg-green-600 hover:bg-green-700 h-14"
              onClick={handleAcceptClick}
              disabled={isLoading}
              data-testid="accept-button"
            >
              <Check className="w-5 h-5 mr-2" />
              Aceptar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Accept Modal */}
      <DeliveryModal
        request={request}
        open={isAcceptModalOpen}
        onOpenChange={setIsAcceptModalOpen}
        onConfirm={handleConfirmAccept}
      />
    </>
  );
}

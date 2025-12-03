"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface RequestActionsProps {
  requestId: string;
  status: string;
}

export function RequestActions({ status }: RequestActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Only show action buttons for pending requests
  if (status !== "pending") {
    return null;
  }

  const handleAccept = async () => {
    // Story 3-5 will implement the accept modal with delivery window
    // For now, this is a stub that navigates to a future modal/flow
    setIsLoading(true);

    // TODO: Story 3-5 - Implement accept modal with delivery window selection
    // For now, show an alert as placeholder
    alert("Próximamente: Seleccionar ventana de entrega (Story 3-5)");

    setIsLoading(false);
  };

  const handleDecline = async () => {
    // Story 3-5 or future story will implement decline with optional reason
    // For now, this is a stub
    setIsLoading(true);

    // TODO: Implement decline with optional reason
    alert("Próximamente: Rechazar solicitud con razón opcional");

    setIsLoading(false);
  };

  return (
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
            onClick={handleAccept}
            disabled={isLoading}
            data-testid="accept-button"
          >
            <Check className="w-5 h-5 mr-2" />
            Aceptar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

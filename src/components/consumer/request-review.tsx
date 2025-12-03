"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type RequestInput,
  AMOUNT_OPTIONS,
  formatPrice,
} from "@/lib/validations/request";

interface RequestReviewProps {
  data: RequestInput;
  onEdit: () => void;
  onSubmit: () => void;
  loading?: boolean;
}

/**
 * RequestReview - Review screen component for water request
 * Displays all entered information before submission
 * Per Story 2-3 acceptance criteria
 */
export function RequestReview({
  data,
  onEdit,
  onSubmit,
  loading = false,
}: RequestReviewProps) {
  // Find the amount option to get label and price
  const amountOption = AMOUNT_OPTIONS.find((opt) => opt.value === data.amount);
  const amountDisplay = amountOption
    ? `${amountOption.label} - ${formatPrice(amountOption.price)}`
    : data.amount;

  return (
    <div className="flex flex-col gap-6" data-testid="review-screen">
      <Card>
        <CardHeader>
          <CardTitle>Revisa tu Solicitud</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div data-testid="review-name">
            <p className="text-sm text-muted-foreground">Nombre</p>
            <p className="font-medium">{data.name}</p>
          </div>

          {/* Phone */}
          <div data-testid="review-phone">
            <p className="text-sm text-muted-foreground">Teléfono</p>
            <p className="font-medium">{data.phone}</p>
          </div>

          {/* Email */}
          <div data-testid="review-email">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{data.email}</p>
          </div>

          {/* Address */}
          <div data-testid="review-address">
            <p className="text-sm text-muted-foreground">Dirección</p>
            <p className="font-medium">{data.address}</p>
          </div>

          {/* Special Instructions */}
          <div data-testid="review-instructions">
            <p className="text-sm text-muted-foreground">
              Instrucciones Especiales
            </p>
            <p className="font-medium">{data.specialInstructions}</p>
          </div>

          {/* Amount with Price */}
          <div data-testid="review-amount">
            <p className="text-sm text-muted-foreground">Cantidad de Agua</p>
            <p className="font-medium text-lg">{amountDisplay}</p>
          </div>

          {/* Urgency Indicator */}
          {data.isUrgent && (
            <div data-testid="review-urgency">
              <p className="text-sm text-muted-foreground">Prioridad</p>
              <p className="font-medium text-amber-600">⚡ Urgente</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={onSubmit}
          disabled={loading}
          className="min-h-[48px] w-full"
          data-testid="submit-button"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar Solicitud"
          )}
        </Button>
        <Button
          variant="secondary"
          onClick={onEdit}
          disabled={loading}
          className="min-h-[48px] w-full"
          data-testid="edit-button"
        >
          Editar
        </Button>
      </div>
    </div>
  );
}

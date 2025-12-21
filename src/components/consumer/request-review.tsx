"use client";

import { Loader2, AlertTriangle, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  type RequestInput,
  AMOUNT_OPTIONS,
  formatPrice,
} from "@/lib/validations/request";

interface RequestReviewProps {
  data: RequestInput;
  onEditContact: () => void;
  onEditAmount: () => void;
  onSubmit: () => void;
  loading?: boolean;
}

/**
 * RequestReview - Review screen component for water request
 * Redesigned to match mockup (Section 4: Review Screen)
 * Features:
 * - Gradient card with amount and estimated price
 * - Contact and location info cards with edit links
 * - Disclaimer about next steps
 * - Green "Confirmar Pedido" button
 */
export function RequestReview({
  data,
  onEditContact,
  onEditAmount,
  onSubmit,
  loading = false,
}: RequestReviewProps) {
  // Find the amount option to get label and price
  const amountOption = AMOUNT_OPTIONS.find((opt) => opt.value === data.amount);
  const basePrice = amountOption?.price || 0;
  const urgencyMultiplier = data.isUrgent ? 1.1 : 1;
  const estimatedPrice = Math.round(basePrice * urgencyMultiplier);

  // Format amount for display (e.g., "1.000 litros")
  const formatAmount = (amount: string) => {
    const numAmount = parseInt(amount, 10);
    return numAmount.toLocaleString("es-CL") + " litros";
  };

  return (
    <div className="flex flex-col gap-3" data-testid="review-screen">
      {/* Amount Summary Card - Gradient - Compact */}
      <div
        className="rounded-xl p-4 text-white text-center"
        style={{
          background: "linear-gradient(135deg, #0077B6 0%, #03045E 100%)",
        }}
      >
        <p className="text-[11px] opacity-80">Cantidad solicitada</p>
        <p className="text-xl font-extrabold" data-testid="review-amount">
          {formatAmount(data.amount)}
        </p>
        {data.isUrgent && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-semibold rounded-full">
            ⚡ Urgente (+10%)
          </span>
        )}
        <div className="mt-2">
          <span
            className="inline-block px-3 py-1.5 bg-white/20 rounded-lg text-lg font-semibold"
            data-testid="review-price"
          >
            ~{formatPrice(estimatedPrice)}
          </span>
        </div>
        <p className="text-[10px] opacity-75 mt-1">
          Precio estimado • Varía según ubicación
        </p>
        <button
          type="button"
          onClick={onEditAmount}
          className="text-[11px] font-semibold text-white/90 hover:text-white mt-1 underline underline-offset-2"
          data-testid="edit-amount-link"
        >
          Cambiar cantidad
        </button>
      </div>

      {/* Contact Info Card - Compact */}
      <div className="bg-white rounded-xl p-3 border border-gray-200">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            Contacto
          </span>
          <button
            type="button"
            onClick={onEditContact}
            className="text-xs font-semibold text-[#0077B6] hover:text-[#005f8f]"
            data-testid="edit-contact-link"
          >
            Editar
          </button>
        </div>
        <p className="text-sm font-medium text-gray-900" data-testid="review-name">
          {data.name}
        </p>
        <p className="text-xs text-gray-500" data-testid="review-phone">
          {data.phone}
        </p>
        {data.email && (
          <p className="text-xs text-gray-500" data-testid="review-email">
            {data.email}
          </p>
        )}
      </div>

      {/* Location Info Card - Compact */}
      <div className="bg-white rounded-xl p-3 border border-gray-200">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            Entrega
          </span>
          <button
            type="button"
            onClick={onEditContact}
            className="text-xs font-semibold text-[#0077B6] hover:text-[#005f8f]"
            data-testid="edit-location-link"
          >
            Editar
          </button>
        </div>
        <p className="text-sm font-medium text-gray-900" data-testid="review-address">
          {data.address}
        </p>
        <p className="text-xs text-gray-500" data-testid="review-instructions">
          {data.specialInstructions}
        </p>
      </div>

      {/* Disclaimer Box - Compact */}
      <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900">
          <p className="font-semibold">Próximo paso</p>
          <p className="text-amber-800">
            Un proveedor te llamará para confirmar el precio y coordinar la entrega.
          </p>
        </div>
      </div>

      {/* Submit Button - Green Success Style - Compact */}
      <div className="mt-1">
        <Button
          onClick={onSubmit}
          disabled={loading}
          className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-lg"
          data-testid="submit-button"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Confirmar Pedido
            </>
          )}
        </Button>
        <p className="text-center text-[10px] text-gray-500 mt-1.5">
          Sin pago previo • Te llamamos primero
        </p>
      </div>
    </div>
  );
}

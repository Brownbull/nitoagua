"use client";

import { Loader2, AlertTriangle, Check, Banknote, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  type RequestInput,
  AMOUNT_OPTIONS,
  formatPrice,
  PAYMENT_METHOD_OPTIONS,
} from "@/lib/validations/request";

interface RequestReviewProps {
  data: RequestInput;
  onEditContact: () => void;
  onEditAmount: () => void;
  onSubmit: () => void;
  loading?: boolean;
  /** Urgency surcharge percentage from admin settings - AC12.4.2 */
  urgencySurchargePercent?: number;
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
  urgencySurchargePercent = 10,
}: RequestReviewProps) {
  // Find the amount option to get label and price
  const amountOption = AMOUNT_OPTIONS.find((opt) => opt.value === data.amount);
  const basePrice = amountOption?.price || 0;
  // Calculate urgency surcharge - AC12.4.3
  const urgencySurcharge = data.isUrgent ? Math.round(basePrice * (urgencySurchargePercent / 100)) : 0;
  const estimatedPrice = basePrice + urgencySurcharge;

  // Format amount for display (e.g., "1.000 litros")
  const formatAmount = (amount: string) => {
    const numAmount = parseInt(amount, 10);
    return numAmount.toLocaleString("es-CL") + " litros";
  };

  return (
    <div className="flex flex-col gap-3" data-testid="review-screen">
      {/* Amount Summary Card - Gradient - Compact */}
      <div
        className="rounded-xl p-4 text-white"
        style={{
          background: "linear-gradient(135deg, #0077B6 0%, #03045E 100%)",
        }}
      >
        <div className="text-center">
          <p className="text-[11px] opacity-80">Cantidad solicitada</p>
          <p className="text-xl font-extrabold" data-testid="review-amount">
            {formatAmount(data.amount)}
          </p>
          {data.isUrgent && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-semibold rounded-full">
              ⚡ Urgente (+{urgencySurchargePercent}%)
            </span>
          )}
        </div>

        {/* Price Breakdown - AC12.4.3 */}
        <div className="mt-3 space-y-1" data-testid="price-breakdown">
          {data.isUrgent ? (
            <>
              {/* Itemized breakdown for urgent requests */}
              <div className="flex justify-between items-center text-sm opacity-90">
                <span>Base:</span>
                <span data-testid="base-price">{formatPrice(basePrice)}</span>
              </div>
              <div className="flex justify-between items-center text-sm opacity-90">
                <span>Recargo urgente ({urgencySurchargePercent}%):</span>
                <span data-testid="urgency-surcharge">{formatPrice(urgencySurcharge)}</span>
              </div>
              <div className="border-t border-white/30 pt-1 mt-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Total estimado:</span>
                  <span
                    className="text-lg font-bold"
                    data-testid="review-price"
                  >
                    ~{formatPrice(estimatedPrice)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Simple total for non-urgent requests */
            <div className="text-center">
              <span
                className="inline-block px-3 py-1.5 bg-white/20 rounded-lg text-lg font-semibold"
                data-testid="review-price"
              >
                ~{formatPrice(estimatedPrice)}
              </span>
            </div>
          )}
        </div>

        <p className="text-[10px] opacity-75 mt-2 text-center">
          Precio estimado • Varía según ubicación
        </p>
        <div className="text-center">
          <button
            type="button"
            onClick={onEditAmount}
            className="text-[11px] font-semibold text-white/90 hover:text-white mt-1 underline underline-offset-2"
            data-testid="edit-amount-link"
          >
            Cambiar cantidad
          </button>
        </div>
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

      {/* Payment Method Card - AC12.2.5 */}
      <div className="bg-white rounded-xl p-3 border border-gray-200">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            Método de Pago
          </span>
          <button
            type="button"
            onClick={onEditAmount}
            className="text-xs font-semibold text-[#0077B6] hover:text-[#005f8f]"
            data-testid="edit-payment-link"
          >
            Cambiar
          </button>
        </div>
        {(() => {
          const paymentOption = PAYMENT_METHOD_OPTIONS.find(
            (opt) => opt.value === data.paymentMethod
          );
          const PaymentIcon = data.paymentMethod === "cash" ? Banknote : Building2;
          return (
            <div className="flex items-center gap-2" data-testid="review-payment-method">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <PaymentIcon className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {paymentOption?.label || "Efectivo"}
                </p>
                <p className="text-xs text-gray-500">
                  {paymentOption?.subtitle || "Paga al repartidor cuando llegue"}
                </p>
              </div>
            </div>
          );
        })()}
        {data.paymentMethod === "transfer" && (
          <div className="mt-2 p-2 bg-blue-50 rounded-lg text-xs text-blue-800">
            <p className="font-medium">Datos para transferencia:</p>
            <p className="text-blue-700 mt-1">
              Se te enviarán los datos bancarios una vez que un proveedor acepte tu pedido.
            </p>
          </div>
        )}
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

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/validations/request";
import { verifyPayment } from "@/lib/actions/settlement";
import { CheckCircle, Loader2, X, User, DollarSign } from "lucide-react";
import type { PendingPayment } from "@/app/admin/settlement/page";
import { toast } from "sonner";

interface VerifyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PendingPayment;
}

export function VerifyPaymentModal({
  isOpen,
  onClose,
  payment,
}: VerifyPaymentModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [bankReference, setBankReference] = useState("");

  if (!isOpen) return null;

  const handleVerify = () => {
    startTransition(async () => {
      const result = await verifyPayment(payment.id, bankReference.trim() || undefined);

      if (result.success) {
        toast.success("Pago verificado correctamente");
        onClose();
        router.refresh();
      } else {
        toast.error(result.error || "Error al verificar pago");
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="verify-payment-modal"
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Verificar Pago</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isPending}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Payment Info */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Proveedor:</span>
              <span className="font-medium text-gray-900">{payment.provider_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Monto:</span>
              <span className="font-semibold text-green-600">
                {formatPrice(payment.amount)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Solicitado el {formatDate(payment.created_at)}
            </div>
          </div>

          {/* Bank Reference Input */}
          <div>
            <label
              htmlFor="bankReference"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Referencia Bancaria (opcional)
            </label>
            <input
              id="bankReference"
              type="text"
              value={bankReference}
              onChange={(e) => setBankReference(e.target.value)}
              placeholder="Ej: Transferencia #12345"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              disabled={isPending}
              data-testid="bank-reference-input"
            />
          </div>

          {/* Warning */}
          <p className="text-xs text-gray-500">
            Al confirmar, se creara un registro de pago en el historial del proveedor
            y se actualizara su saldo.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isPending}
          >
            Cancelar
          </button>
          <button
            onClick={handleVerify}
            disabled={isPending}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="confirm-verify-btn"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Confirmar Pago
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

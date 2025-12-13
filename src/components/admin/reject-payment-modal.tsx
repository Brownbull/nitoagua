"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/validations/request";
import { rejectPayment } from "@/lib/actions/settlement";
import { XCircle, Loader2, X, User, DollarSign } from "lucide-react";
import type { PendingPayment } from "@/app/admin/settlement/page";
import { toast } from "sonner";

interface RejectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PendingPayment;
}

const REJECTION_REASONS = [
  { value: "comprobante_invalido", label: "Comprobante invalido o ilegible" },
  { value: "monto_incorrecto", label: "Monto no coincide" },
  { value: "pago_no_recibido", label: "Pago no recibido en cuenta" },
  { value: "cuenta_incorrecta", label: "Cuenta bancaria incorrecta" },
  { value: "duplicado", label: "Solicitud duplicada" },
  { value: "otro", label: "Otro motivo" },
];

export function RejectPaymentModal({
  isOpen,
  onClose,
  payment,
}: RejectPaymentModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  if (!isOpen) return null;

  const handleReject = () => {
    const reason =
      selectedReason === "otro"
        ? customReason.trim()
        : REJECTION_REASONS.find((r) => r.value === selectedReason)?.label || "";

    if (!reason) {
      toast.error("Selecciona un motivo de rechazo");
      return;
    }

    startTransition(async () => {
      const result = await rejectPayment(payment.id, reason);

      if (result.success) {
        toast.success("Pago rechazado");
        onClose();
        router.refresh();
      } else {
        toast.error(result.error || "Error al rechazar pago");
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
      data-testid="reject-payment-modal"
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Rechazar Pago</h2>
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
              <span className="font-semibold text-gray-900">
                {formatPrice(payment.amount)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Solicitado el {formatDate(payment.created_at)}
            </div>
          </div>

          {/* Rejection Reason Select */}
          <div>
            <label
              htmlFor="rejectionReason"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Motivo del Rechazo *
            </label>
            <select
              id="rejectionReason"
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              disabled={isPending}
              data-testid="rejection-reason-select"
            >
              <option value="">Seleccionar motivo...</option>
              {REJECTION_REASONS.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Reason Input */}
          {selectedReason === "otro" && (
            <div>
              <label
                htmlFor="customReason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Especificar motivo *
              </label>
              <textarea
                id="customReason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Describe el motivo del rechazo..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                disabled={isPending}
                data-testid="custom-reason-input"
              />
            </div>
          )}

          {/* Warning */}
          <p className="text-xs text-gray-500">
            El proveedor sera notificado del rechazo con el motivo indicado.
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
            onClick={handleReject}
            disabled={isPending || !selectedReason || (selectedReason === "otro" && !customReason.trim())}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="confirm-reject-btn"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Rechazando...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Rechazar Pago
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

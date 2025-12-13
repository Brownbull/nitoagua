"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { cancelOrder } from "@/lib/actions/admin-orders";
import { toast } from "sonner";

interface CancelOrderButtonProps {
  orderId: string;
}

export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCancel = () => {
    if (!reason.trim()) {
      toast.error("Debes ingresar un motivo de cancelacion");
      return;
    }

    startTransition(async () => {
      try {
        const result = await cancelOrder(orderId, reason.trim());

        if (result.success) {
          toast.success("Pedido cancelado exitosamente");
          setIsOpen(false);
          setReason("");
          router.refresh();
        } else {
          toast.error(result.error || "Error al cancelar el pedido");
        }
      } catch (error) {
        console.error("Error cancelling order:", error);
        toast.error("Error al cancelar el pedido");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors"
        data-testid="cancel-order-button"
      >
        <XCircle className="w-5 h-5" />
        Cancelar Pedido
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !isPending && setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Cancelar Pedido
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Esta accion notificara al consumidor y al proveedor (si esta asignado).
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de la cancelacion <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Solicitud duplicada, direccion incorrecta, etc."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 resize-none"
                rows={3}
                disabled={isPending}
                data-testid="cancel-reason-input"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setReason("");
                }}
                disabled={isPending}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                data-testid="cancel-modal-close"
              >
                Volver
              </button>
              <button
                onClick={handleCancel}
                disabled={isPending || !reason.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="confirm-cancel-button"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Confirmar Cancelacion
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

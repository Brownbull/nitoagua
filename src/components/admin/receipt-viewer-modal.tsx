"use client";

import { useState, useEffect, useTransition } from "react";
import { formatPrice } from "@/lib/validations/request";
import { getReceiptUrl } from "@/lib/actions/settlement";
import { Receipt, Loader2, X, Download, ZoomIn, ZoomOut, User } from "lucide-react";
import type { PendingPayment } from "@/app/admin/settlement/page";

interface ReceiptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PendingPayment;
}

export function ReceiptViewerModal({
  isOpen,
  onClose,
  payment,
}: ReceiptViewerModalProps) {
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  // Load receipt on mount (key-based remounting handles state reset)
  useEffect(() => {
    if (!isOpen || !payment.receipt_path) return;

    startTransition(async () => {
      const result = await getReceiptUrl(payment.receipt_path!);
      if (result.success && result.data) {
        setImageUrl(result.data);
      } else if (!result.success) {
        setError(result.error);
      }
    });
  }, [isOpen, payment.receipt_path]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `comprobante-${payment.id.slice(0, 8)}.jpg`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="receipt-viewer-modal"
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Receipt className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Comprobante de Pago</h2>
              <p className="text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {payment.provider_name} - {formatPrice(payment.amount)}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={zoom <= 0.5}
              title="Alejar"
            >
              <ZoomOut className="w-5 h-5 text-gray-500" />
            </button>
            <span className="text-xs text-gray-500 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={zoom >= 3}
              title="Acercar"
            >
              <ZoomIn className="w-5 h-5 text-gray-500" />
            </button>
            {/* Download */}
            <button
              onClick={handleDownload}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={!imageUrl}
              title="Descargar"
              data-testid="download-receipt-btn"
            >
              <Download className="w-5 h-5 text-gray-500" />
            </button>
            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100 flex items-center justify-center">
          {isPending && (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Cargando comprobante...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-2 text-red-500">
              <Receipt className="w-12 h-12 text-gray-300" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {imageUrl && !isPending && (
            <div
              className="overflow-auto max-w-full max-h-full"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
                transition: "transform 0.2s ease",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Comprobante de pago"
                className="rounded-lg shadow-lg max-w-full h-auto"
                data-testid="receipt-image"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl flex-shrink-0">
          <p className="text-xs text-gray-500 text-center">
            Solicitud del {formatDate(payment.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}

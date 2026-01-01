"use client";

import { useState, useEffect, useTransition } from "react";
import { formatPrice } from "@/lib/validations/request";
import { getProviderLedgerHistory } from "@/lib/actions/settlement";
import {
  User,
  Loader2,
  X,
  DollarSign,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
} from "lucide-react";
import type { ProviderBalance } from "@/app/admin/settlement/page";

interface ProviderBalanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ProviderBalance;
}

interface LedgerEntry {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  bank_reference: string | null;
  created_at: string;
}

export function ProviderBalanceDetailModal({
  isOpen,
  onClose,
  provider,
}: ProviderBalanceDetailModalProps) {
  const [isPending, startTransition] = useTransition();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load ledger history on mount (key-based remounting handles state reset)
  useEffect(() => {
    if (!isOpen || !provider.provider_id) return;

    startTransition(async () => {
      const result = await getProviderLedgerHistory(provider.provider_id);
      if (result.success && result.data) {
        setEntries(result.data);
      } else if (!result.success) {
        setError(result.error);
      }
    });
  }, [isOpen, provider.provider_id]);

  if (!isOpen) return null;

  const getAgingColor = (days: number) => {
    if (days < 7) return "text-green-600 bg-green-50 border-green-200";
    if (days <= 14) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "commission_owed":
        return <ArrowUpCircle className="w-4 h-4 text-red-500" />;
      case "commission_paid":
        return <ArrowDownCircle className="w-4 h-4 text-green-500" />;
      case "adjustment":
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "commission_owed":
        return "Comision Adeudada";
      case "commission_paid":
        return "Pago Recibido";
      case "adjustment":
        return "Ajuste";
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="provider-balance-detail-modal"
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{provider.provider_name}</h2>
              <p className="text-xs text-gray-500">Detalle de Cuenta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Balance Summary */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex-shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Total Owed */}
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <p className="text-xs text-gray-500">Total Adeudado</p>
              <p className="font-bold text-gray-900">{formatPrice(provider.total_owed)}</p>
            </div>
            {/* Days Outstanding */}
            <div
              className={`rounded-lg p-3 border ${getAgingColor(provider.days_outstanding)}`}
            >
              <p className="text-xs opacity-75">Dias Pendiente</p>
              <p className="font-bold">{provider.days_outstanding} dias</p>
            </div>
            {/* Last Payment */}
            <div className="bg-white rounded-lg p-3 border border-gray-100 md:col-span-2">
              <p className="text-xs text-gray-500">Ultimo Pago</p>
              <p className="font-medium text-gray-900">
                {provider.last_payment_date
                  ? formatDate(provider.last_payment_date)
                  : "Sin pagos"}
              </p>
            </div>
          </div>

          {/* Aging Buckets */}
          <div className="mt-3 flex items-center gap-4 text-xs">
            <span className="text-gray-500">Antiguedad:</span>
            {provider.current_bucket > 0 && (
              <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                Actual: {formatPrice(provider.current_bucket)}
              </span>
            )}
            {provider.week_bucket > 0 && (
              <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded">
                7-14d: {formatPrice(provider.week_bucket)}
              </span>
            )}
            {provider.overdue_bucket > 0 && (
              <span className="px-2 py-1 bg-red-50 text-red-700 rounded">
                &gt;14d: {formatPrice(provider.overdue_bucket)}
              </span>
            )}
          </div>
        </div>

        {/* Ledger History */}
        <div className="flex-1 overflow-auto">
          <div className="px-4 py-2 border-b border-gray-100 sticky top-0 bg-white">
            <h3 className="font-medium text-gray-900 text-sm">Historial de Movimientos</h3>
          </div>

          {isPending && (
            <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-sm">Cargando historial...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-2 py-8 text-red-500">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!isPending && !error && entries.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
              <Clock className="w-8 h-8 text-gray-300" />
              <p className="text-sm">Sin movimientos registrados</p>
            </div>
          )}

          {!isPending && !error && entries.length > 0 && (
            <div className="divide-y divide-gray-100" data-testid="ledger-history">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="px-4 py-3 flex items-center gap-3"
                  data-testid={`ledger-entry-${entry.id}`}
                >
                  <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(entry.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {getTypeLabel(entry.type)}
                    </p>
                    {entry.description && (
                      <p className="text-xs text-gray-500 truncate">{entry.description}</p>
                    )}
                    {entry.bank_reference && (
                      <p className="text-xs text-blue-600">Ref: {entry.bank_reference}</p>
                    )}
                    <p className="text-xs text-gray-400">{formatDate(entry.created_at)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`font-semibold ${
                        entry.type === "commission_owed"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {entry.type === "commission_owed" ? "+" : "-"}
                      {formatPrice(entry.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

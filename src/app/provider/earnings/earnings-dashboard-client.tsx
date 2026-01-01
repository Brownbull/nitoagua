"use client";

import { useState, useTransition } from "react";
import { Truck, TrendingUp, Banknote, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  getEarningsSummary,
  getDeliveryHistory,
  type EarningsSummary,
  type EarningsPeriod,
  type DeliveryRecord,
} from "@/lib/actions/settlement";
import { formatCLP } from "@/lib/utils/commission";
import { cn } from "@/lib/utils";

interface Props {
  initialSummary: EarningsSummary | null;
  initialHistory: { records: DeliveryRecord[]; total: number } | null;
  initialError?: string;
}

const periodLabels: Record<EarningsPeriod, string> = {
  today: "Hoy",
  week: "Semana",
  month: "Mes",
};

/**
 * Client component for earnings dashboard with period switching
 * Refactored to match mockup layout - compact with hero summary
 * AC: 8.6.1 - Period selector
 * AC: 8.6.2 - Summary cards
 * AC: 8.6.3 - Cash payment section
 * AC: 8.6.4 - Pay commission button
 * AC: 8.6.5 - Delivery history
 */
export function EarningsDashboardClient({ initialSummary, initialHistory, initialError }: Props) {
  const [period, setPeriod] = useState<EarningsPeriod>("month");
  const [summary, setSummary] = useState<EarningsSummary | null>(initialSummary);
  const [history, setHistory] = useState<{ records: DeliveryRecord[]; total: number } | null>(initialHistory);
  const [error, setError] = useState<string | undefined>(initialError);
  const [isPending, startTransition] = useTransition();

  const handlePeriodChange = (newPeriod: EarningsPeriod) => {
    if (newPeriod === period) return;

    setPeriod(newPeriod);
    startTransition(async () => {
      const [summaryResult, historyResult] = await Promise.all([
        getEarningsSummary(newPeriod),
        getDeliveryHistory(10, 0),
      ]);

      if (summaryResult.success && summaryResult.data) {
        setSummary(summaryResult.data);
        setError(undefined);
      } else if (!summaryResult.success) {
        setError(summaryResult.error);
      }

      if (historyResult.success && historyResult.data) {
        setHistory(historyResult.data);
      }
    });
  };

  if (error && !summary) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Period Selector - Compact pills like mockup - AC: 8.6.1 */}
      <div className="inline-flex bg-gray-100 rounded-full p-1" role="tablist" aria-label="Periodo de tiempo">
        {(["today", "week", "month"] as const).map((p) => (
          <button
            key={p}
            role="tab"
            aria-selected={period === p}
            onClick={() => handlePeriodChange(p)}
            disabled={isPending}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              period === p
                ? "bg-orange-500 text-white"
                : "text-gray-600 hover:text-gray-800",
              isPending && "opacity-50 cursor-wait"
            )}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {/* Loading overlay with accessibility */}
      <div
        className={cn("transition-opacity space-y-4", isPending && "opacity-50")}
        aria-busy={isPending}
        aria-live="polite"
      >
        {/* Hero Summary Card - AC: 8.6.2 */}
        <HeroSummaryCard summary={summary} period={period} />

        {/* Cash Payment Section - AC: 8.6.3, 8.6.4 */}
        <CashPaymentSection summary={summary} />

        {/* Delivery History - AC: 8.6.5 */}
        <DeliveryHistoryList history={history} />
      </div>
    </div>
  );
}

/**
 * Hero summary card matching mockup layout
 * Shows big net earnings number with commission breakdown
 */
function HeroSummaryCard({ summary, period }: { summary: EarningsSummary | null; period: EarningsPeriod }) {
  if (!summary) {
    return <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />;
  }

  const periodText = period === "today" ? "hoy" : period === "week" ? "esta semana" : "este mes";

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 text-white">
      {/* Net earnings label */}
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
        Tu ganancia neta {periodText}
      </p>

      {/* Big hero number */}
      <p className="text-3xl font-bold mb-3">
        {formatCLP(summary.net_earnings)}
      </p>

      {/* Commission breakdown rows */}
      <div className="space-y-1.5 pt-3 border-t border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total pedidos</span>
          <span className="text-white font-medium">{formatCLP(summary.gross_income)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Comisión plataforma ({summary.commission_percent}%)</span>
          <span className="text-red-400 font-medium">-{formatCLP(summary.commission_amount)}</span>
        </div>
        <div className="flex justify-between text-sm pt-1.5 border-t border-gray-700">
          <span className="text-gray-300 font-medium">Tu ganancia</span>
          <span className="text-green-400 font-bold">{formatCLP(summary.net_earnings)}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex justify-between mt-4 pt-3 border-t border-gray-700">
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase">Entregas</p>
          <p className="text-lg font-bold">{summary.total_deliveries}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase">Efectivo</p>
          <p className="text-lg font-bold">{formatCLP(summary.cash_received)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase">Transfer</p>
          <p className="text-lg font-bold">{formatCLP(summary.gross_income - summary.cash_received)}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Cash payment section component - compact version
 * AC: 8.6.3 - Efectivo Recibido, Comision Pendiente
 * AC: 8.6.4 - "Pagar Comision" button when pending > 0
 */
function CashPaymentSection({ summary }: { summary: EarningsSummary | null }) {
  if (!summary) {
    return <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />;
  }

  const hasPendingCommission = summary.commission_pending > 0;

  // Don't show section if no pending commission
  if (!hasPendingCommission) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Banknote className="w-4 h-4 text-amber-600" />
          <div>
            <p className="text-xs text-gray-500">Comisión pendiente</p>
            <p className="text-base font-bold text-red-600">
              {formatCLP(summary.commission_pending)}
            </p>
          </div>
        </div>

        {/* AC: 8.6.4 - "Pagar Comision" button */}
        <Link
          href="/provider/earnings/withdraw"
          className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          Pagar
        </Link>
      </div>
    </div>
  );
}

/**
 * Delivery history list component - compact version
 * AC: 8.6.5 - date, amount, payment method, commission
 */
function DeliveryHistoryList({
  history,
}: {
  history: { records: DeliveryRecord[]; total: number } | null;
}) {
  if (!history) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (history.records.length === 0) {
    return (
      <div className="text-center py-6">
        <Truck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No hay entregas en este periodo</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Actividad reciente
        </h3>
        {/* TODO: Implement /provider/earnings/history page for full history view
            Currently hidden to avoid 404. Re-enable when history page is created.
        {history.total > history.records.length && (
          <Link
            href="/provider/earnings/history"
            className="text-xs text-orange-600 font-medium hover:underline"
          >
            Ver todo
          </Link>
        )}
        */}
      </div>

      <div className="space-y-1.5">
        {history.records.map((record) => (
          <div
            key={record.id}
            className="bg-white border border-gray-100 rounded-lg p-2.5 flex items-center gap-3"
          >
            {/* Check icon */}
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                Entrega completada
              </p>
              <p className="text-xs text-gray-500 truncate">
                {record.date
                  ? format(new Date(record.date), "d MMM, HH:mm", { locale: es })
                  : "-"}
              </p>
            </div>

            {/* Amount and payment method */}
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-green-600">
                +{formatCLP(record.amount - record.commission)}
              </p>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded font-medium",
                  record.payment_method === "cash"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                )}
              >
                {record.payment_method === "cash" ? "Efectivo" : "Transferencia"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { formatPrice } from "@/lib/validations/request";
import {
  DollarSign,
  Clock,
  AlertTriangle,
  FileCheck,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Receipt,
  ChevronRight,
  Download,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import type {
  SettlementSummary,
  PendingPayment,
  ProviderBalance,
} from "@/app/admin/settlement/page";
import { VerifyPaymentModal } from "./verify-payment-modal";
import { RejectPaymentModal } from "./reject-payment-modal";
import { ReceiptViewerModal } from "./receipt-viewer-modal";
import { ProviderBalanceDetailModal } from "./provider-balance-detail-modal";

type Period = "week" | "month" | "year";

// Generate weeks for the current month
const getWeeksOfMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weeks: { label: string; value: string }[] = [];

  let weekStart = 1;
  let weekNum = 1;

  while (weekStart <= lastDay.getDate()) {
    const weekEnd = Math.min(weekStart + 6, lastDay.getDate());
    weeks.push({
      label: `${weekStart} - ${weekEnd} Dic`,
      value: `week-${weekNum}`,
    });
    weekStart = weekEnd + 1;
    weekNum++;
  }

  return weeks;
};

// Months of the year
const MONTHS = [
  { label: "Enero", value: "01" },
  { label: "Febrero", value: "02" },
  { label: "Marzo", value: "03" },
  { label: "Abril", value: "04" },
  { label: "Mayo", value: "05" },
  { label: "Junio", value: "06" },
  { label: "Julio", value: "07" },
  { label: "Agosto", value: "08" },
  { label: "Septiembre", value: "09" },
  { label: "Octubre", value: "10" },
  { label: "Noviembre", value: "11" },
  { label: "Diciembre", value: "12" },
];

// Available years (placeholder - would come from data)
const YEARS = [
  { label: "2025", value: "2025" },
  { label: "2024", value: "2024" },
  { label: "2023", value: "2023" },
];

interface SettlementDashboardProps {
  summary: SettlementSummary;
  pendingPayments: PendingPayment[];
  providerBalances: ProviderBalance[];
}

export function SettlementDashboard({
  summary,
  pendingPayments,
  providerBalances,
}: SettlementDashboardProps) {
  // Period selector state
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("month");
  const [dropdownOpen, setDropdownOpen] = useState<Period | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string>("week-1");
  const [selectedMonth, setSelectedMonth] = useState<string>("12"); // December
  const [selectedYear, setSelectedYear] = useState<string>("2025");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const weeks = getWeeksOfMonth();

  const handlePeriodClick = (period: Period) => {
    if (selectedPeriod === period) {
      // Toggle dropdown if same period clicked
      setDropdownOpen(dropdownOpen === period ? null : period);
    } else {
      // Select period and open dropdown
      setSelectedPeriod(period);
      setDropdownOpen(period);
    }
  };

  const getSelectedLabel = (period: Period) => {
    switch (period) {
      case "week":
        const week = weeks.find(w => w.value === selectedWeek);
        return week?.label || "Semana";
      case "month":
        const month = MONTHS.find(m => m.value === selectedMonth);
        return month?.label || "Mes";
      case "year":
        return selectedYear;
    }
  };

  // Modal states
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ProviderBalance | null>(null);

  // Action handlers
  const handleVerify = (payment: PendingPayment) => {
    setSelectedPayment(payment);
    setVerifyModalOpen(true);
  };

  const handleReject = (payment: PendingPayment) => {
    setSelectedPayment(payment);
    setRejectModalOpen(true);
  };

  const handleViewReceipt = (payment: PendingPayment) => {
    setSelectedPayment(payment);
    setReceiptModalOpen(true);
  };

  const handleViewDetail = (provider: ProviderBalance) => {
    setSelectedProvider(provider);
    setDetailModalOpen(true);
  };

  const getAgingColor = (days: number) => {
    if (days < 7) return "text-green-600 bg-green-50";
    if (days <= 14) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Calculate average per provider (for display)
  const avgPerProvider = providerBalances.length > 0
    ? Math.round(summary.total_pending / providerBalances.length)
    : 0;

  return (
    <div className="space-y-4">
      {/* Period Selector with Dropdowns */}
      <div className="flex gap-2 relative" data-testid="period-selector" ref={dropdownRef}>
        {/* Week Button */}
        <div className="flex-1 relative">
          <button
            onClick={() => handlePeriodClick("week")}
            className={`w-full py-2 px-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
              selectedPeriod === "week"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
            data-testid="period-week"
          >
            <span className="truncate">{selectedPeriod === "week" ? getSelectedLabel("week") : "Semana"}</span>
            <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${dropdownOpen === "week" ? "rotate-180" : ""}`} />
          </button>
          {dropdownOpen === "week" && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {weeks.map((week) => (
                <button
                  key={week.value}
                  onClick={() => {
                    setSelectedWeek(week.value);
                    setSelectedPeriod("week");
                    setDropdownOpen(null);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${
                    selectedWeek === week.value ? "bg-gray-100 font-semibold" : ""
                  }`}
                >
                  {week.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Month Button */}
        <div className="flex-1 relative">
          <button
            onClick={() => handlePeriodClick("month")}
            className={`w-full py-2 px-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
              selectedPeriod === "month"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
            data-testid="period-month"
          >
            <span className="truncate">{selectedPeriod === "month" ? getSelectedLabel("month") : "Mes"}</span>
            <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${dropdownOpen === "month" ? "rotate-180" : ""}`} />
          </button>
          {dropdownOpen === "month" && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {MONTHS.map((month) => (
                <button
                  key={month.value}
                  onClick={() => {
                    setSelectedMonth(month.value);
                    setSelectedPeriod("month");
                    setDropdownOpen(null);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${
                    selectedMonth === month.value ? "bg-gray-100 font-semibold" : ""
                  }`}
                >
                  {month.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Year Button */}
        <div className="flex-1 relative">
          <button
            onClick={() => handlePeriodClick("year")}
            className={`w-full py-2 px-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
              selectedPeriod === "year"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
            data-testid="period-year"
          >
            <span className="truncate">{selectedPeriod === "year" ? getSelectedLabel("year") : "Año"}</span>
            <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${dropdownOpen === "year" ? "rotate-180" : ""}`} />
          </button>
          {dropdownOpen === "year" && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {YEARS.map((year) => (
                <button
                  key={year.value}
                  onClick={() => {
                    setSelectedYear(year.value);
                    setSelectedPeriod("year");
                    setDropdownOpen(null);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${
                    selectedYear === year.value ? "bg-gray-100 font-semibold" : ""
                  }`}
                >
                  {year.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Revenue Card - Dark gradient like mockup */}
      <div
        className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl p-5 text-white"
        data-testid="settlement-summary"
      >
        <p className="text-xs opacity-80 mb-1">Total Pendiente de Cobro</p>
        <p className="text-3xl font-extrabold" data-testid="total-pending">
          {formatPrice(summary.total_pending)}
        </p>
        <p className="text-sm opacity-80 mt-1">
          {providerBalances.length} proveedor{providerBalances.length !== 1 ? "es" : ""} con saldo
        </p>
      </div>

      {/* Financial Metrics - 2x2 grid like mockup */}
      <div className="grid grid-cols-2 gap-2">
        {/* Commission/Overdue */}
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-red-100 rounded-md flex items-center justify-center">
              <AlertTriangle className="w-3 h-3 text-red-500" />
            </div>
            <span className="text-[10px] text-gray-500 uppercase font-semibold">Vencido</span>
          </div>
          <p className="text-base font-extrabold text-red-600" data-testid="total-overdue">
            {formatPrice(summary.total_overdue)}
          </p>
          <p className="text-[10px] text-gray-400">&gt;14 dias</p>
        </div>

        {/* Pending Verifications */}
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-yellow-100 rounded-md flex items-center justify-center">
              <FileCheck className="w-3 h-3 text-yellow-600" />
            </div>
            <span className="text-[10px] text-gray-500 uppercase font-semibold">Por Verificar</span>
          </div>
          <p className="text-base font-extrabold text-gray-900" data-testid="pending-verifications">
            {summary.pending_verifications}
          </p>
          <p className="text-[10px] text-gray-400">Pagos pendientes</p>
        </div>

        {/* Providers Count */}
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
              <User className="w-3 h-3 text-blue-600" />
            </div>
            <span className="text-[10px] text-gray-500 uppercase font-semibold">Proveedores</span>
          </div>
          <p className="text-base font-extrabold text-gray-900">
            {providerBalances.length}
          </p>
          <p className="text-[10px] text-gray-400">Con saldo</p>
        </div>

        {/* Average */}
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-indigo-600" />
            </div>
            <span className="text-[10px] text-gray-500 uppercase font-semibold">Promedio</span>
          </div>
          <p className="text-base font-extrabold text-gray-900">
            {formatPrice(avgPerProvider)}
          </p>
          <p className="text-[10px] text-gray-400">Por proveedor</p>
        </div>
      </div>

      {/* Top Providers - like mockup */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Top Proveedores</p>
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
          {providerBalances.slice(0, 3).map((provider, index) => (
            <div
              key={provider.provider_id}
              className="flex justify-between items-center px-3.5 py-2.5"
            >
              <span className="text-sm font-semibold text-gray-900">
                {index + 1}. {provider.provider_name}
              </span>
              <span className="text-sm text-gray-600">
                {formatPrice(provider.total_owed)}
              </span>
            </div>
          ))}
          {providerBalances.length === 0 && (
            <div className="px-3.5 py-4 text-center text-sm text-gray-400">
              No hay proveedores con saldo
            </div>
          )}
        </div>
      </div>

      {/* Pending Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-4 py-2.5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Pagos Pendientes de Verificacion</h2>
          <p className="text-[10px] text-gray-500">
            {pendingPayments.length === 0
              ? "No hay pagos pendientes"
              : `${pendingPayments.length} pago${pendingPayments.length !== 1 ? "s" : ""} por verificar`}
          </p>
        </div>
        <div className="divide-y divide-gray-100" data-testid="pending-payments-table">
          {pendingPayments.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <FileCheck className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p>No hay pagos pendientes de verificacion</p>
            </div>
          ) : (
            pendingPayments.map((payment) => (
              <div
                key={payment.id}
                className="px-4 py-3"
                data-testid={`payment-row-${payment.id}`}
              >
                {/* Desktop layout: single row */}
                <div className="hidden md:flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {payment.provider_name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(payment.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(payment.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {payment.receipt_path && (
                      <button
                        onClick={() => handleViewReceipt(payment)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Ver comprobante"
                        data-testid={`view-receipt-${payment.id}`}
                      >
                        <Receipt className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                    <button
                      onClick={() => handleVerify(payment)}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                      data-testid={`verify-payment-${payment.id}`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Verificar
                    </button>
                    <button
                      onClick={() => handleReject(payment)}
                      className="px-3 py-1.5 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                      data-testid={`reject-payment-${payment.id}`}
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                </div>

                {/* Mobile layout: stacked */}
                <div className="md:hidden space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">
                          {payment.provider_name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(payment.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(payment.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-12">
                    {payment.receipt_path && (
                      <button
                        onClick={() => handleViewReceipt(payment)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Ver comprobante"
                      >
                        <Receipt className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                    <button
                      onClick={() => handleVerify(payment)}
                      className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Verificar
                    </button>
                    <button
                      onClick={() => handleReject(payment)}
                      className="flex-1 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Provider Balances Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-4 py-2.5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Saldos de Proveedores</h2>
          <p className="text-[10px] text-gray-500">
            {providerBalances.length === 0
              ? "No hay saldos pendientes"
              : `${providerBalances.length} proveedor${providerBalances.length !== 1 ? "es" : ""} con saldo`}
          </p>
        </div>
        <div className="divide-y divide-gray-100" data-testid="provider-balances-table">
          {providerBalances.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p>No hay saldos pendientes</p>
            </div>
          ) : (
            providerBalances.map((provider) => (
              <div
                key={provider.provider_id}
                className="px-4 py-3"
                data-testid={`balance-row-${provider.provider_id}`}
              >
                {/* Desktop layout */}
                <div className="hidden md:flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {provider.provider_name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-medium ${getAgingColor(provider.days_outstanding)}`}
                        >
                          {provider.days_outstanding} dias
                        </span>
                        {provider.last_payment_date && (
                          <span className="text-gray-400">
                            Ult. pago: {formatDate(provider.last_payment_date)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(provider.total_owed)}
                    </p>
                    {/* Aging breakdown - horizontal on desktop */}
                    <div className="flex items-center justify-end gap-1.5 text-xs">
                      {provider.current_bucket > 0 && (
                        <span className="text-green-600">
                          {formatPrice(provider.current_bucket)}
                        </span>
                      )}
                      {provider.week_bucket > 0 && (
                        <span className="text-yellow-600">
                          {formatPrice(provider.week_bucket)}
                        </span>
                      )}
                      {provider.overdue_bucket > 0 && (
                        <span className="text-red-600">
                          {formatPrice(provider.overdue_bucket)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewDetail(provider)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                    title="Ver detalle"
                    data-testid={`view-detail-${provider.provider_id}`}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Mobile layout */}
                <div className="md:hidden">
                  <button
                    onClick={() => handleViewDetail(provider)}
                    className="w-full text-left"
                    data-testid={`view-detail-mobile-${provider.provider_id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">
                            {provider.provider_name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-medium ${getAgingColor(provider.days_outstanding)}`}
                            >
                              {provider.days_outstanding} dias
                            </span>
                          </div>
                          {provider.last_payment_date && (
                            <p className="text-xs text-gray-400 mt-1">
                              Ult. pago: {formatDate(provider.last_payment_date)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-gray-900">
                          {formatPrice(provider.total_owed)}
                        </p>
                        {/* Aging breakdown - stacked on mobile */}
                        <div className="flex flex-col items-end gap-0.5 text-xs mt-1">
                          {provider.current_bucket > 0 && (
                            <span className="text-green-600">
                              {formatPrice(provider.current_bucket)}
                            </span>
                          )}
                          {provider.week_bucket > 0 && (
                            <span className="text-yellow-600">
                              {formatPrice(provider.week_bucket)}
                            </span>
                          )}
                          {provider.overdue_bucket > 0 && (
                            <span className="text-red-600">
                              {formatPrice(provider.overdue_bucket)}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                    </div>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Aging Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span>Actual (&lt;7d)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <span>Semana (7-14d)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span>Vencido (&gt;14d)</span>
        </div>
      </div>

      {/* Export Button - like mockup */}
      <button
        className="w-full py-3.5 bg-white text-gray-700 border-2 border-gray-200 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
        data-testid="export-report"
      >
        <Download className="w-4 h-4" />
        Exportar Reporte
      </button>

      {/* Modals - key prop forces remount when selection changes, resetting internal state */}
      {selectedPayment && (
        <>
          <VerifyPaymentModal
            key={`verify-${selectedPayment.id}`}
            isOpen={verifyModalOpen}
            onClose={() => {
              setVerifyModalOpen(false);
              setSelectedPayment(null);
            }}
            payment={selectedPayment}
          />
          <RejectPaymentModal
            key={`reject-${selectedPayment.id}`}
            isOpen={rejectModalOpen}
            onClose={() => {
              setRejectModalOpen(false);
              setSelectedPayment(null);
            }}
            payment={selectedPayment}
          />
          <ReceiptViewerModal
            key={`receipt-${selectedPayment.id}-${selectedPayment.receipt_path}`}
            isOpen={receiptModalOpen}
            onClose={() => {
              setReceiptModalOpen(false);
              setSelectedPayment(null);
            }}
            payment={selectedPayment}
          />
        </>
      )}
      {selectedProvider && (
        <ProviderBalanceDetailModal
          key={`detail-${selectedProvider.provider_id}`}
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedProvider(null);
          }}
          provider={selectedProvider}
        />
      )}
    </div>
  );
}

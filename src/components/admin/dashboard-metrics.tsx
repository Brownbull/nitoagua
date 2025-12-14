"use client";

import { useState } from "react";
import {
  Package,
  DollarSign,
  Users,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { formatPrice } from "@/lib/validations/request";
import { MetricCard } from "./metric-card";
import type { DashboardMetrics as Metrics } from "@/lib/queries/admin-metrics";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface DashboardMetricsProps {
  metrics: Metrics;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

type StatsTab = "requests" | "offers";

export function DashboardMetrics({
  metrics,
  onRefresh,
  isRefreshing,
}: DashboardMetricsProps) {
  const [statsTab, setStatsTab] = useState<StatsTab>("requests");

  const periodLabel =
    metrics.period === "today"
      ? "vs ayer"
      : metrics.period === "week"
        ? "vs semana anterior"
        : "vs mes anterior";

  // Format last updated time
  const lastUpdatedText = formatDistanceToNow(new Date(metrics.lastUpdated), {
    addSuffix: true,
    locale: es,
  });

  return (
    <div className="space-y-4">
      {/* Last updated + Refresh */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500" data-testid="last-updated">
          Actualizado {lastUpdatedText}
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-50"
            data-testid="refresh-metrics"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Actualizar
          </button>
        )}
      </div>

      {/* Combined Request/Offer Metrics Section with Tabs */}
      <div>
        {/* Tab Selector */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setStatsTab("requests")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              statsTab === "requests"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            data-testid="stats-tab-requests"
          >
            Solicitudes
          </button>
          <button
            onClick={() => setStatsTab("offers")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              statsTab === "offers"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            data-testid="stats-tab-offers"
          >
            Ofertas
          </button>
        </div>

        {/* Request Metrics */}
        {statsTab === "requests" && (
          <div className="grid grid-cols-2 gap-3" data-testid="requests-metrics-section">
            <MetricCard
              icon={Package}
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
              label="Total Solicitudes"
              value={metrics.requests.total}
              trend={metrics.trends.requests}
              trendLabel={periodLabel}
              href={`/admin/orders?dateFrom=${getDateFromParam(metrics.period)}`}
              testId="metric-requests-total"
            />
            <MetricCard
              icon={Send}
              iconBgColor="bg-purple-100"
              iconColor="text-purple-600"
              label="Con Ofertas"
              value={`${metrics.requests.withOffersPercent.toFixed(0)}%`}
              subtext={`${metrics.requests.withOffers} de ${metrics.requests.total}`}
              href="/admin/orders?status=offers_pending"
              testId="metric-requests-with-offers"
            />
            <MetricCard
              icon={TrendingUp}
              iconBgColor="bg-indigo-100"
              iconColor="text-indigo-600"
              label="Prom. Ofertas"
              value={metrics.requests.avgOffersPerRequest.toFixed(1)}
              subtext="por solicitud"
              testId="metric-avg-offers"
            />
            <MetricCard
              icon={Clock}
              iconBgColor="bg-amber-100"
              iconColor="text-amber-600"
              label="Timeout"
              value={`${metrics.requests.timeoutRate.toFixed(0)}%`}
              subtext="canceladas"
              testId="metric-timeout-rate"
            />
          </div>
        )}

        {/* Offer Metrics */}
        {statsTab === "offers" && (
          <div className="grid grid-cols-2 gap-3" data-testid="offers-metrics-section">
            <MetricCard
              icon={Send}
              iconBgColor="bg-cyan-100"
              iconColor="text-cyan-600"
              label="Total Ofertas"
              value={metrics.offers.total}
              trend={metrics.trends.offers}
              trendLabel={periodLabel}
              testId="metric-offers-total"
            />
            <MetricCard
              icon={CheckCircle}
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
              label="Aceptacion"
              value={`${metrics.offers.acceptanceRate.toFixed(0)}%`}
              subtext="de ofertas aceptadas"
              testId="metric-acceptance-rate"
            />
            <MetricCard
              icon={Clock}
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
              label="Tiempo 1ra"
              value={
                metrics.offers.avgTimeToFirstMinutes !== null
                  ? `${metrics.offers.avgTimeToFirstMinutes} min`
                  : "--"
              }
              subtext="promedio"
              testId="metric-time-to-first"
            />
            <MetricCard
              icon={XCircle}
              iconBgColor="bg-red-100"
              iconColor="text-red-600"
              label="Expiradas"
              value={`${metrics.offers.expirationRate.toFixed(0)}%`}
              subtext="sin aceptar"
              testId="metric-expiration-rate"
            />
          </div>
        )}
      </div>

      {/* Financial Metrics Section */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Finanzas
        </p>
        <div className="space-y-3">
          {/* Main revenue card - dark gradient */}
          <div
            className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl p-4 text-white"
            data-testid="metric-revenue-card"
          >
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-gray-300" />
              <span className="text-xs text-gray-300">Volumen de Transacciones</span>
            </div>
            <p className="text-2xl font-extrabold">
              {formatPrice(metrics.financial.transactionVolume)}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              {metrics.trends.financial !== 0 ? (
                <>
                  <span
                    className={`text-xs font-medium ${
                      metrics.trends.financial > 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {metrics.trends.financial > 0 ? "+" : ""}
                    {metrics.trends.financial}%
                  </span>
                  <span className="text-xs text-gray-400">{periodLabel}</span>
                </>
              ) : (
                <span className="text-xs text-gray-400">Sin cambio</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              icon={DollarSign}
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
              label="Comision"
              value={formatPrice(metrics.financial.commissionEarned)}
              subtext="del periodo"
              href="/admin/settlement"
              testId="metric-commission"
            />
            <MetricCard
              icon={Clock}
              iconBgColor="bg-amber-100"
              iconColor="text-amber-600"
              label="Pendiente"
              value={formatPrice(metrics.financial.pendingSettlements)}
              subtext="por cobrar"
              href="/admin/settlement"
              testId="metric-pending-settlements"
            />
          </div>
        </div>
      </div>

      {/* Provider Metrics Section */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Proveedores
        </p>
        <div className="grid grid-cols-3 gap-2">
          <MetricCard
            icon={Users}
            iconBgColor="bg-indigo-100"
            iconColor="text-indigo-600"
            label="Activos"
            value={metrics.providers.activeCount}
            trend={metrics.trends.providers}
            href="/admin/providers?status=approved"
            testId="metric-providers-active"
          />
          <MetricCard
            icon={CheckCircle}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            label="En Linea"
            value={metrics.providers.onlineNow}
            subtext="disponibles"
            href="/admin/providers?status=approved"
            testId="metric-providers-online"
          />
          <MetricCard
            icon={Clock}
            iconBgColor="bg-amber-100"
            iconColor="text-amber-600"
            label="Nuevos"
            value={metrics.providers.newApplications}
            subtext="pendientes"
            href="/admin/verification"
            testId="metric-new-applications"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Get date parameter for drill-down URLs based on period
 */
function getDateFromParam(period: "today" | "week" | "month"): string {
  const now = new Date();

  switch (period) {
    case "today":
      return now.toISOString().split("T")[0];
    case "week": {
      // Start of week (Monday)
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now);
      monday.setDate(diff);
      return monday.toISOString().split("T")[0];
    }
    case "month": {
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return firstOfMonth.toISOString().split("T")[0];
    }
  }
}

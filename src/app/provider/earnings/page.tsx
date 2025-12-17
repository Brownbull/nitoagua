import { Suspense } from "react";
import { getEarningsSummary, getDeliveryHistory } from "@/lib/actions/settlement";
import { EarningsDashboardClient } from "./earnings-dashboard-client";

/**
 * Provider Earnings Dashboard Page
 * AC: 8.6.1 - Period selector: Hoy / Esta Semana / Este Mes
 * AC: 8.6.2 - Summary cards: Total Entregas, Ingreso Bruto, Comision, Ganancia Neta
 * AC: 8.6.3 - Cash section: Efectivo Recibido, Comision Pendiente
 * AC: 8.6.4 - "Pagar Comision" button when pending > 0
 * AC: 8.6.5 - Delivery history list
 */
export default async function EarningsPage() {
  // Fetch initial data for month period (default)
  const [summaryResult, historyResult] = await Promise.all([
    getEarningsSummary("month"),
    getDeliveryHistory(10, 0),
  ]);

  return (
    <div className="px-4 py-3 max-w-lg mx-auto">
      <h1 className="text-lg font-bold text-gray-800 mb-3">Mis Ganancias</h1>

      <Suspense fallback={<EarningsLoadingSkeleton />}>
        <EarningsDashboardClient
          initialSummary={summaryResult.success ? summaryResult.data! : null}
          initialHistory={historyResult.success ? historyResult.data! : null}
          initialError={
            !summaryResult.success ? summaryResult.error :
            !historyResult.success ? historyResult.error : undefined
          }
        />
      </Suspense>
    </div>
  );
}

function EarningsLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Period pills skeleton */}
      <div className="inline-flex bg-gray-100 rounded-full p-1">
        <div className="h-7 w-14 bg-gray-200 rounded-full" />
        <div className="h-7 w-20 bg-gray-200 rounded-full" />
        <div className="h-7 w-14 bg-gray-200 rounded-full" />
      </div>

      {/* Hero card skeleton */}
      <div className="h-52 bg-gray-200 rounded-2xl" />

      {/* Activity skeleton */}
      <div className="space-y-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

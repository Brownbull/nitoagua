import { requireAdmin } from "@/lib/auth/guards";
import { ShieldCheck, ChevronRight, Settings, AlertCircle, CreditCard } from "lucide-react";
import { OperationsDashboard } from "@/components/admin/operations-dashboard";
import { getDashboardMetrics } from "@/lib/queries/admin-metrics";
import Link from "next/link";

// Revalidate every 5 minutes - dashboard stats refresh on client side
export const revalidate = 300;

export const metadata = {
  title: "Dashboard - Admin nitoagua",
  description: "Panel de administracion y metricas operativas",
};

export default async function AdminDashboardPage() {
  // Require admin access
  const user = await requireAdmin();

  // Fetch initial metrics for "month" period (default)
  const initialMetrics = await getDashboardMetrics("month");

  // Format today's date
  const todayDate = new Date().toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-200 to-white px-5 py-3">
        <div className="flex items-center justify-between mb-3">
          <span className="font-logo text-xl text-gray-700">nitoagua</span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 text-white text-xs font-semibold uppercase tracking-wide rounded-lg">
            <ShieldCheck className="w-3 h-3" />
            Admin
          </div>
        </div>
        <h1 className="text-xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">
          {todayDate}
        </p>
      </header>

      {/* Content */}
      <div className="p-4">
        {/* Admin email display */}
        <div className="mb-4 p-3.5 bg-white rounded-xl shadow-sm">
          <p className="text-xs text-gray-500">Sesion activa como:</p>
          <p className="text-sm font-semibold text-gray-900">{user.email}</p>
        </div>

        {/* Operations Dashboard with Period Selector and Metrics */}
        <OperationsDashboard initialMetrics={initialMetrics} />

        {/* Quick Actions */}
        <div className="mt-6">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
            Acciones Rapidas
          </p>
          <div className="space-y-3">
            {/* Pending verifications */}
            <Link
              href="/admin/verification"
              className="flex items-center gap-3 w-full p-3.5 bg-white rounded-xl border-2 border-gray-200 text-left hover:bg-gray-50 transition-colors"
              data-testid="quick-action-verification"
            >
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Verificaciones Pendientes
                </p>
                <p className="text-xs text-gray-500">
                  Revisar solicitudes de proveedores
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>

            {/* Reported problems */}
            <Link
              href="/admin/disputes"
              className="flex items-center gap-3 w-full p-3.5 bg-white rounded-xl border-2 border-gray-200 text-left hover:bg-gray-50 transition-colors"
              data-testid="quick-action-disputes"
            >
              <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Problemas Reportados
                </p>
                <p className="text-xs text-gray-500">
                  Resolver incidencias de pedidos
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>

            {/* Pricing Configuration */}
            <Link
              href="/admin/pricing"
              className="flex items-center gap-3 w-full p-3.5 bg-white rounded-xl border-2 border-gray-200 text-left hover:bg-gray-50 transition-colors"
              data-testid="quick-action-pricing"
            >
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Precios
                </p>
                <p className="text-xs text-gray-500">
                  Tarifas y comisiones
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>

            {/* System Settings */}
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 w-full p-3.5 bg-white rounded-xl border-2 border-gray-200 text-left hover:bg-gray-50 transition-colors"
              data-testid="quick-action-settings"
            >
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Configuracion
                </p>
                <p className="text-xs text-gray-500">
                  Ajustes del sistema de ofertas
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

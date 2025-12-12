import { requireAdmin } from "@/lib/auth/guards";
import { ShieldCheck, Package, DollarSign, Users, AlertCircle, ChevronRight, LogOut } from "lucide-react";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";

export default async function AdminDashboardPage() {
  // Require admin access
  const user = await requireAdmin();

  // Placeholder data - will be replaced with real data in Story 6.8
  const todayDate = new Date().toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-200 to-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold text-gray-700">nitoagua</span>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold uppercase tracking-wide rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 text-sm">
          Resumen de hoy, {todayDate}
        </p>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Admin email display */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Sesion activa como:</p>
          <p className="font-semibold text-gray-900">{user.email}</p>
        </div>

        {/* Period selector */}
        <div className="flex gap-2 mb-6">
          <button className="flex-1 py-2.5 bg-gray-800 text-white text-sm font-semibold rounded-xl">
            Hoy
          </button>
          <button className="flex-1 py-2.5 bg-white text-gray-600 text-sm font-semibold rounded-xl border-2 border-gray-200">
            Semana
          </button>
          <button className="flex-1 py-2.5 bg-white text-gray-600 text-sm font-semibold rounded-xl border-2 border-gray-200">
            Mes
          </button>
        </div>

        {/* Metrics Grid - placeholder data */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Orders */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500">Pedidos</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">--</p>
            <p className="text-xs text-gray-400">Sin datos</p>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-xs text-gray-500">Ingresos</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">--</p>
            <p className="text-xs text-gray-400">Sin datos</p>
          </div>

          {/* Commission */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-yellow-600" />
              </div>
              <span className="text-xs text-gray-500">Comision</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">--</p>
            <p className="text-xs text-gray-400">Sin datos</p>
          </div>

          {/* Active providers */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-xs text-gray-500">En Linea</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">--</p>
            <p className="text-xs text-gray-400">Sin datos</p>
          </div>
        </div>

        {/* Quick Actions */}
        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
          Acciones Rapidas
        </p>
        <div className="space-y-3">
          {/* Pending verifications */}
          <button
            className="flex items-center gap-4 w-full p-4 bg-white rounded-2xl border-2 border-gray-200 text-left"
            disabled
          >
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                Verificaciones Pendientes
              </p>
              <p className="text-sm text-gray-500">
                Revisar solicitudes de proveedores
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Reported problems */}
          <button
            className="flex items-center gap-4 w-full p-4 bg-white rounded-2xl border-2 border-gray-200 text-left"
            disabled
          >
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                Problemas Reportados
              </p>
              <p className="text-sm text-gray-500">
                Resolver incidencias de pedidos
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Logout button */}
        <div className="mt-6">
          <AdminLogoutButton />
        </div>

        {/* Note about placeholder */}
        <div className="mt-6 p-4 bg-gray-200 rounded-xl">
          <p className="text-sm text-gray-600 text-center">
            Panel de Administracion - Vista preliminar
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            Los datos y funcionalidades completas se implementaran en historias posteriores
          </p>
        </div>
      </div>
    </div>
  );
}

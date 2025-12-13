import { requireAdmin } from "@/lib/auth/guards";
import { getSettings } from "@/lib/actions/admin";
import { DEFAULT_ADMIN_SETTINGS } from "@/lib/validations/admin";
import { SettingsForm } from "@/components/admin/settings-form";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminSettingsPage() {
  // Require admin access
  const user = await requireAdmin();

  // Load current settings
  const settingsResult = await getSettings();
  const settings = settingsResult.success && settingsResult.data
    ? settingsResult.data
    : DEFAULT_ADMIN_SETTINGS;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-200 to-white px-5 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/dashboard"
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              data-testid="back-to-dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </Link>
            <span className="font-logo text-xl text-gray-700">nitoagua</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 text-white text-xs font-semibold uppercase tracking-wide rounded-lg">
            <ShieldCheck className="w-3 h-3" />
            Admin
          </div>
        </div>
        <h1 className="text-xl font-extrabold text-gray-900">Configuracion</h1>
        <p className="text-gray-500 text-sm">
          Ajustes del sistema de ofertas
        </p>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Admin session display */}
        <div className="mb-4 p-3.5 bg-white rounded-xl shadow-sm">
          <p className="text-xs text-gray-500">Sesion activa como:</p>
          <p className="text-sm font-semibold text-gray-900">{user.email}</p>
        </div>

        {/* Settings Form */}
        <SettingsForm initialSettings={settings} />

        {/* Info note */}
        <div className="mt-4 p-3.5 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-xs text-blue-800">
            <strong>Nota:</strong> Los cambios se aplicaran inmediatamente a las nuevas ofertas.
            Las ofertas existentes mantendran su configuracion original.
          </p>
        </div>
      </div>
    </div>
  );
}

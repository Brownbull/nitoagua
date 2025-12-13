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
      <header className="bg-gradient-to-r from-gray-200 to-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
              data-testid="back-to-dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <span className="text-lg font-bold text-gray-700">nitoagua</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold uppercase tracking-wide rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Configuracion</h1>
        <p className="text-gray-600 text-sm">
          Ajustes del sistema de ofertas
        </p>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Admin session display */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Sesion activa como:</p>
          <p className="font-semibold text-gray-900">{user.email}</p>
        </div>

        {/* Settings Form */}
        <SettingsForm initialSettings={settings} />

        {/* Info note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Los cambios se aplicaran inmediatamente a las nuevas ofertas.
            Las ofertas existentes mantendran su configuracion original.
          </p>
        </div>
      </div>
    </div>
  );
}

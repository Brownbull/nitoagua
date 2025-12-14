import { requireAdmin } from "@/lib/auth/guards";
import { getPricingSettings } from "@/lib/actions/admin";
import { DEFAULT_PRICING_SETTINGS } from "@/lib/validations/admin";
import { PricingForm } from "@/components/admin/pricing-form";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Revalidate every 5 minutes - pricing settings rarely change
export const revalidate = 300;

export default async function AdminPricingPage() {
  // Require admin access
  await requireAdmin();

  // Load current pricing settings
  const settingsResult = await getPricingSettings();
  const settings = settingsResult.success && settingsResult.data
    ? settingsResult.data
    : DEFAULT_PRICING_SETTINGS;

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
        <h1 className="text-xl font-extrabold text-gray-900">Precios</h1>
        <p className="text-gray-500 text-sm">
          Configura precios y comisiones de la plataforma
        </p>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Pricing Form */}
        <PricingForm initialSettings={settings} />

        {/* Info note */}
        <div className="mt-4 p-3.5 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-xs text-blue-800">
            <strong>Nota:</strong> Los nuevos precios se aplicaran inmediatamente a las nuevas
            solicitudes. Las solicitudes existentes mantendran sus precios originales.
          </p>
        </div>
      </div>
    </div>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, CreditCard, Building2, Hash } from "lucide-react";

export const metadata: Metadata = {
  title: "Datos Bancarios - nitoagua Proveedor",
  description: "Tu información bancaria",
};

export const dynamic = "force-dynamic";

// Bank labels
const bankLabels: Record<string, string> = {
  banco_estado: "Banco Estado",
  banco_chile: "Banco de Chile",
  banco_santander: "Santander",
  banco_bci: "BCI",
  banco_itau: "Itaú",
  banco_scotiabank: "Scotiabank",
  banco_security: "Banco Security",
  banco_falabella: "Banco Falabella",
  banco_ripley: "Banco Ripley",
  otro: "Otro",
};

export default async function BankSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "supplier") {
    redirect("/");
  }

  const bankLabel =
    profile.bank_name && bankLabels[profile.bank_name]
      ? bankLabels[profile.bank_name]
      : profile.bank_name || "No especificado";

  // Mask account number for security (show last 4 digits)
  const maskedAccountNumber = profile.bank_account
    ? "****" + profile.bank_account.slice(-4)
    : "No especificado";

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Back Button */}
      <Link
        href="/provider/settings"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        data-testid="back-to-settings"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Datos Bancarios
      </h1>

      {/* Info Cards */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-500">Banco</span>
          </div>
          <p className="text-gray-900 font-medium" data-testid="bank-name">
            {bankLabel}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Hash className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-500">Número de Cuenta</span>
          </div>
          <p className="text-gray-900 font-medium" data-testid="account-number">
            {maskedAccountNumber}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-500">Titular</span>
          </div>
          <p className="text-gray-900 font-medium" data-testid="account-holder">
            {profile.name || "No especificado"}
          </p>
        </div>
      </div>

      {/* Security Note */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-700">
          Por seguridad, solo mostramos los últimos 4 dígitos de tu cuenta.
          Para cambios en tu información bancaria, contacta a soporte.
        </p>
      </div>
    </div>
  );
}

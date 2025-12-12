import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { XCircle, Home, Phone } from "lucide-react";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";

export default async function NotAuthorizedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If not authenticated at all, redirect to login
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm p-6">
        {/* Error icon and message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Acceso Denegado
          </h1>
          <p className="text-gray-500 text-sm">
            Tu cuenta no tiene permisos de administrador
          </p>
        </div>

        {/* Error details */}
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">
            El email <strong className="font-semibold">{user.email}</strong> no esta autorizado para acceder al panel de administracion.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <AdminLogoutButton />

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full h-12 text-base font-semibold border-2 border-gray-200 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            data-testid="go-home-button"
          >
            <Home className="w-5 h-5" />
            Ir a Inicio
          </Link>
        </div>

        {/* Help note */}
        <div className="mt-6 flex items-start gap-3 p-4 bg-gray-200 rounded-xl">
          <Phone className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">
            Si crees que deberias tener acceso, contacta al equipo de soporte.
          </p>
        </div>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminGoogleSignIn } from "@/components/admin/admin-google-sign-in";
import { AdminDevLogin } from "@/components/admin/admin-dev-login";
import { ShieldCheck, Info, Home } from "lucide-react";

const showDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN === "true";

export default async function AdminLoginPage() {
  // Check if user is already authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user && user.email) {
    // User is authenticated, check if they're an admin
    const { data: adminEmail } = await supabase
      .from("admin_allowed_emails")
      .select("email")
      .eq("email", user.email as string)
      .single();

    if (adminEmail) {
      // User is an admin, redirect to dashboard
      redirect("/admin/dashboard");
    } else {
      // User is not an admin
      redirect("/admin/not-authorized");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm p-6">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold uppercase tracking-wide rounded-lg mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Panel Admin
          </div>
          <h1 className="font-logo text-2xl text-gray-700">nitoagua</h1>
          <p className="text-gray-500 text-sm mt-1">
            Acceso exclusivo para administradores
          </p>
        </div>

        {/* Google Sign In */}
        <AdminGoogleSignIn />

        {/* Security note */}
        <div className="mt-6 flex items-start gap-3 p-4 bg-gray-200 rounded-xl">
          <Info className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">
            Solo cuentas autorizadas pueden acceder. Tu email debe estar en la lista de administradores.
          </p>
        </div>

        {/* Dev login for local testing */}
        {showDevLogin && <AdminDevLogin />}

        {/* Go back to main app */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            data-testid="go-home-link"
          >
            <Home className="w-4 h-4" />
            Volver a la aplicacion
          </Link>
        </div>
      </div>
    </div>
  );
}

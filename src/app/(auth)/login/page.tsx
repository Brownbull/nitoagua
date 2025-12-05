import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { DevLogin } from "@/components/auth/dev-login";
import { LoginErrorHandler } from "@/components/auth/login-error-handler";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Show dev login when explicitly enabled via env var
const showDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN === "true";

interface LoginPageProps {
  searchParams: Promise<{ role?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  // Get role from query param - defaults to consumer
  const role = (params.role === "supplier" ? "supplier" : "consumer") as "consumer" | "supplier";
  const isSupplierLogin = role === "supplier";

  // Check if user is already authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // User is authenticated, check if they have a profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile) {
      // Redirect based on role
      if (profile.role === "supplier") {
        redirect("/dashboard");
      } else {
        redirect("/");
      }
    } else {
      // No profile, redirect to appropriate onboarding based on intended role
      if (role === "supplier") {
        redirect("/onboarding");
      } else {
        redirect("/consumer/onboarding");
      }
    }
  }

  return (
    <>
      {/* Handle error query params from OAuth callback */}
      <Suspense fallback={null}>
        <LoginErrorHandler />
      </Suspense>

      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Iniciar sesión</CardTitle>
          <CardDescription>
            Ingresa con tu cuenta de Google para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoogleSignIn role={role} />

          {/* Role switch link */}
          <div className="mt-6 text-center">
            {isSupplierLogin ? (
              <Link
                href="/login?role=consumer"
                className="text-sm text-[#0077B6] hover:underline"
                data-testid="switch-to-consumer-link"
              >
                ¿No eres proveedor? Registrarme como consumidor
              </Link>
            ) : (
              <Link
                href="/login?role=supplier"
                className="text-sm text-[#0077B6] hover:underline"
                data-testid="switch-to-supplier-link"
              >
                ¿Eres proveedor de agua? Registrarme como proveedor
              </Link>
            )}
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Al continuar, aceptas nuestros{" "}
              <a href="/terms" className="text-[#0077B6] hover:underline">
                Términos de Servicio
              </a>{" "}
              y{" "}
              <a href="/privacy" className="text-[#0077B6] hover:underline">
                Política de Privacidad
              </a>
            </p>
          </div>

          {showDevLogin && <DevLogin />}
        </CardContent>
      </Card>
    </>
  );
}

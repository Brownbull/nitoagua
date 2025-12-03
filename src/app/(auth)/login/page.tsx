import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { DevLogin } from "@/components/auth/dev-login";
import { LoginErrorHandler } from "@/components/auth/login-error-handler";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Show dev login when explicitly enabled via env var
const showDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN === "true";

export default async function LoginPage() {
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
      // No profile, redirect to onboarding
      redirect("/onboarding");
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
        <GoogleSignIn />

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

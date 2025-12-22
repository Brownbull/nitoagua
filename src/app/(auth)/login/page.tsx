import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { DevLogin } from "@/components/auth/dev-login";
import { LoginErrorHandler } from "@/components/auth/login-error-handler";
import { Truck } from "lucide-react";

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

      {/* Google Sign In Button - mockup styled */}
      <div className="w-full max-w-[320px]">
        <GoogleSignIn role={role} />
      </div>

      {/* Terms text */}
      <div className="mt-4 text-center max-w-[280px]">
        <p className="text-xs text-gray-500 leading-relaxed">
          Al continuar, aceptas nuestros{" "}
          <a href="/terms" className="text-[#0077B6] font-medium hover:underline">
            Términos de Servicio
          </a>{" "}
          y{" "}
          <a href="/privacy" className="text-[#0077B6] font-medium hover:underline">
            Política de Privacidad
          </a>
        </p>
      </div>

      {/* Role switch section - at the bottom */}
      <div className="mt-5 pt-4 border-t border-gray-100 w-full text-center">
        {isSupplierLogin ? (
          <Link
            href="/login?role=consumer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#CAF0F8] text-[#0077B6] rounded-xl text-sm font-semibold hover:bg-[#b8e8f5] transition-colors"
            data-testid="switch-to-consumer-link"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Soy consumidor
          </Link>
        ) : (
          <Link
            href="/login?role=supplier"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FED7AA] text-[#F97316] rounded-xl text-sm font-semibold hover:bg-[#fdc99a] transition-colors"
            data-testid="switch-to-supplier-link"
          >
            <Truck className="w-4 h-4" />
            Soy repartidor
          </Link>
        )}
      </div>

      {showDevLogin && (
        <div className="mt-4 w-full">
          <DevLogin />
        </div>
      )}
    </>
  );
}

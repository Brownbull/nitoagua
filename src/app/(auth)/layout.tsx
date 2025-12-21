import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginHeader } from "@/components/auth/login-header";

/**
 * Fallback header shown while login header loads
 * Uses consumer styling as default
 */
function HeaderFallback() {
  return (
    <div
      className="pt-8 pb-10 px-6 text-center"
      style={{ background: "linear-gradient(180deg, #CAF0F8 0%, white 100%)" }}
    >
      <span
        className="text-4xl text-[#0077B6] block mb-6"
        style={{ fontFamily: "'Pacifico', cursive" }}
      >
        nitoagua
      </span>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido</h1>
      <p className="text-[15px] text-gray-500">
        Inicia sesión para pedir agua a domicilio
      </p>
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Back button - absolute positioned */}
      <Link
        href="/"
        className="absolute top-14 left-6 z-10 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
        data-testid="login-back-button"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
        <span className="sr-only">Volver al inicio</span>
      </Link>

      {/* Dynamic gradient header with logo - changes based on role */}
      <Suspense fallback={<HeaderFallback />}>
        <LoginHeader />
      </Suspense>

      {/* Content area */}
      <div className="flex-1 px-6 py-8 flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}

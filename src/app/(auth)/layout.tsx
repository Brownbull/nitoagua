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
      className="pt-6 pb-6 px-5 text-center"
      style={{ background: "linear-gradient(180deg, #CAF0F8 0%, white 100%)" }}
    >
      <span
        className="text-3xl text-[#0077B6] block mb-3"
        style={{ fontFamily: "'Pacifico', cursive" }}
      >
        nitoagua
      </span>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Bienvenido</h1>
      <p className="text-sm text-gray-500">
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
    <div className="h-dvh flex flex-col bg-white overflow-hidden">
      {/* Back button - absolute positioned */}
      <Link
        href="/"
        className="absolute top-8 left-4 z-10 w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
        data-testid="login-back-button"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
        <span className="sr-only">Volver al inicio</span>
      </Link>

      {/* Dynamic gradient header with logo - changes based on role */}
      <div className="shrink-0">
        <Suspense fallback={<HeaderFallback />}>
          <LoginHeader />
        </Suspense>
      </div>

      {/* Content area - scrollable if needed on very small screens */}
      <div className="flex-1 px-5 py-4 flex flex-col items-center overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

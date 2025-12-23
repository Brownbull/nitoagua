"use client";

import { useSearchParams } from "next/navigation";

/**
 * LoginHeader - Dynamic header that changes based on role
 * Consumer: Blue gradient, "pedir agua a domicilio"
 * Supplier: Orange gradient, "repartir agua a domicilio"
 */
export function LoginHeader() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const isSupplier = role === "supplier";

  // Color schemes
  const gradientStyle = isSupplier
    ? { background: "linear-gradient(180deg, #FED7AA 0%, white 100%)" }
    : { background: "linear-gradient(180deg, #CAF0F8 0%, white 100%)" };

  const logoColor = isSupplier ? "text-[#F97316]" : "text-[#0077B6]";
  const subtitle = isSupplier
    ? "Inicia sesión para repartir agua a domicilio"
    : "Inicia sesión para pedir agua a domicilio";

  return (
    <div className="pt-6 pb-6 px-5 text-center" style={gradientStyle}>
      {/* Logo */}
      <span
        className={`text-3xl ${logoColor} block mb-3`}
        style={{ fontFamily: "'Pacifico', cursive" }}
      >
        nitoagua
      </span>

      {/* Title */}
      <h1 className="text-xl font-bold text-gray-900 mb-1">Bienvenido</h1>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

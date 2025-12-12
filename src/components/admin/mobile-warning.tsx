"use client";

import { Monitor } from "lucide-react";

/**
 * Mobile warning component displayed when viewport is less than 1024px
 * Per UX requirements: Admin panel is desktop-first, show warning on mobile
 */
export function MobileWarning() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 lg:hidden">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gray-800 mx-auto mb-6">
          <Monitor className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Usa una computadora
        </h1>
        <p className="text-gray-600 text-sm">
          El panel de administracion esta optimizado para pantallas de escritorio.
          Por favor, accede desde una computadora.
        </p>
      </div>
    </div>
  );
}

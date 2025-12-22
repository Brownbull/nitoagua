"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, FileCheck, MapPin, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const REQUIREMENTS = [
  {
    icon: Truck,
    title: "Vehículo con tanque",
    description: "Camión o camioneta con estanque de agua",
  },
  {
    icon: FileCheck,
    title: "Permisos al día",
    description: "Permiso sanitario y documentos vigentes",
  },
  {
    icon: MapPin,
    title: "Zona de servicio",
    description: "Operar en comunas de la región de Villarrica",
  },
  {
    icon: Clock,
    title: "Disponibilidad",
    description: "Tiempo para atender solicitudes de agua",
  },
];

export function WelcomeScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/provider/onboarding/personal`,
        },
      });

      if (error) {
        console.error("[OAuth] Error:", error.message);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("[OAuth] Unexpected error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Main Question */}
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            ¿Quieres ser repartidor de agua?
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Únete a nitoagua y comienza a recibir solicitudes de entrega en tu
            zona
          </p>

          {/* Requirements */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100 mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
              Lo que necesitas
            </h2>
            <div className="space-y-4">
              {REQUIREMENTS.map((req) => (
                <div key={req.title} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <req.icon className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{req.title}</h3>
                    <p className="text-sm text-gray-500">{req.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="text-center mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
              Beneficios
            </h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Recibe solicitudes en tiempo real</li>
              <li>Elige tus horarios de trabajo</li>
              <li>Comisión transparente por entrega</li>
              <li>Soporte dedicado para proveedores</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA Section - Fixed at bottom */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl"
            data-testid="google-signin-button"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Comenzar con Google
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500 text-center mt-3">
            Al continuar, aceptas los términos y condiciones de nitoagua
          </p>
        </div>
      </div>
    </div>
  );
}

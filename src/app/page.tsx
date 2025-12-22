"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Check, Clock, Shield, Phone, Settings, Droplets, Star, User, Truck, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ConsumerNav } from "@/components/layout/consumer-nav";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Check initial auth state and get profile
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .single();
        if (profile) {
          setUserName(profile.name);
        }
      }
      setCheckingAuth(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleRequestClick = () => {
    setLoading(true);
    router.push("/request");
  };

  // Get initials from userName for avatar
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className={`min-h-dvh bg-white flex flex-col ${user ? 'pb-20' : ''}`}>
      {/* Header with gradient */}
      <header
        className="px-4 pt-3 pb-4 flex justify-between items-center shrink-0"
        style={{ background: "linear-gradient(180deg, #CAF0F8 0%, white 100%)" }}
      >
        <span
          className="text-[22px] text-[#0077B6]"
          style={{ fontFamily: "'Pacifico', cursive" }}
        >
          nitoagua
        </span>
        {!checkingAuth && !user && (
          <Link
            href="/login"
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Iniciar sesión
          </Link>
        )}
        {!checkingAuth && user && (
          <div className="flex items-center gap-2">
            <button
              className="relative w-9 h-9 bg-white rounded-[10px] flex items-center justify-center shadow-sm"
              aria-label="Notificaciones"
            >
              <Bell className="w-[18px] h-[18px] text-gray-500" />
            </button>

            <Link
              href="/consumer-profile"
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #0077B6 0%, #005f8f 100%)",
              }}
            >
              {initials}
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main
        className="flex-1 flex flex-col px-5 py-6 text-center"
        style={{ background: "linear-gradient(180deg, white 0%, #F9FAFB 100%)" }}
      >
        {/* Quality Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#ECFDF5] text-[#059669] rounded-full text-xs font-semibold mx-auto mb-4">
          <Check className="w-3.5 h-3.5" />
          Agua de calidad certificada
        </div>

        {/* Title */}
        <h1 className="text-[1.75rem] font-extrabold text-gray-900 leading-tight tracking-tight mb-3">
          <span className="text-[#0077B6]">Agua potable</span>
          <br />
          directo a tu hogar
        </h1>

        {/* Subtitle */}
        <p className="text-base text-gray-500 mb-6 max-w-[280px] mx-auto">
          Conectamos tu casa con los mejores proveedores de agua de tu zona
        </p>

        {/* CTA Button */}
        <button
          onClick={handleRequestClick}
          disabled={loading}
          className="w-full max-w-[280px] mx-auto py-4 px-6 bg-[#0077B6] hover:bg-[#005f8f] text-white rounded-[14px] text-base font-semibold shadow-[0_8px_24px_rgba(0,119,182,0.3)] transition-colors disabled:opacity-70 mb-3"
          data-testid="request-water-button"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Droplets className="w-5 h-5 animate-pulse" />
              Cargando...
            </span>
          ) : (
            "Pedir Agua Ahora"
          )}
        </button>

        {/* Secondary link */}
        {!checkingAuth && !user && (
          <p className="text-sm text-gray-400">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-gray-500 font-medium underline">
              Ingresa aquí
            </Link>
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />
      </main>

      {/* Benefits Section */}
      <section className="px-5 py-6 bg-gray-50 border-t border-gray-100">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#CAF0F8] rounded-[10px] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#0077B6]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Entrega rápida</div>
              <div className="text-xs text-gray-500">En menos de 24 horas</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#CAF0F8] rounded-[10px] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-[#0077B6]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Proveedores verificados</div>
              <div className="text-xs text-gray-500">Agua certificada</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#CAF0F8] rounded-[10px] flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-[#0077B6]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Sin cuenta requerida</div>
              <div className="text-xs text-gray-500">Crea cuenta para seguir pedidos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="px-5 py-4 flex justify-center gap-6 border-t border-gray-100">
        <div className="flex flex-col items-center gap-1">
          <div className="text-[#10B981] text-xl">✓</div>
          <div className="text-xs text-gray-500 text-center">Proveedores<br />verificados</div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Droplets className="w-5 h-5 text-[#0077B6]" />
          <div className="text-xs text-gray-500 text-center">Agua<br />certificada</div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Star className="w-5 h-5 text-[#F59E0B]" />
          <div className="text-xs text-gray-500 text-center">Servicio<br />confiable</div>
        </div>
      </section>

      {/* Footer Links - Login options and Admin (only shown when not logged in) */}
      {!checkingAuth && !user && (
        <footer className="px-5 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-col gap-3">
            {/* Role-based login links */}
            <div className="flex justify-center gap-6 text-sm">
              <Link
                href="/login?role=consumer"
                className="flex items-center gap-1.5 text-gray-600 hover:text-[#0077B6]"
              >
                <User className="w-4 h-4" />
                Consumidor
              </Link>
              <Link
                href="/login?role=supplier"
                className="flex items-center gap-1.5 text-gray-600 hover:text-[#0077B6]"
              >
                <Truck className="w-4 h-4" />
                Proveedor
              </Link>
            </div>

            {/* Admin link - subtle */}
            <div className="flex justify-center">
              <Link
                href="/admin"
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-500"
                data-testid="admin-access-link"
              >
                <Settings className="w-3.5 h-3.5" />
                Administración
              </Link>
            </div>
          </div>
        </footer>
      )}

      {/* Consumer Navigation Bar (only shown when logged in) */}
      {!checkingAuth && user && <ConsumerNav />}
    </div>
  );
}

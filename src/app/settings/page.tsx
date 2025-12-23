"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ConsumerNav } from "@/components/layout/consumer-nav";
import { PwaSettings } from "@/components/shared/pwa-settings";
import { NotificationSettings } from "@/components/shared/notification-settings";

/**
 * Consumer Settings Page
 *
 * Provides PWA installation status, version display, and notification settings
 * for logged-in consumers.
 *
 * AC10.6.10: Consumer settings accessible from consumer navigation/profile
 */
export default function ConsumerSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch profile for name display
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, role")
        .eq("id", user.id)
        .single();

      if (profile) {
        // If supplier, redirect to supplier settings
        if (profile.role === "supplier") {
          router.push("/provider/settings");
          return;
        }
      }

      setLoading(false);
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pb-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#0077B6]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-20">
      {/* Header */}
      <header
        className="px-4 pt-3 pb-4"
        style={{ background: "linear-gradient(180deg, #CAF0F8 0%, white 100%)" }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/consumer-profile"
            className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
            aria-label="Volver al perfil"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <span
            className="text-[22px] text-[#0077B6]"
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            nitoagua
          </span>
        </div>
        <div className="pl-1">
          <h1 className="text-xl font-extrabold text-gray-900">Ajustes</h1>
          <p className="text-sm text-gray-500">
            Configuración de la aplicación
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 py-4 space-y-4">
        {/* PWA Settings - AC10.6.1-AC10.6.5, AC10.6.10 */}
        <PwaSettings version={process.env.NEXT_PUBLIC_APP_VERSION} />

        {/* Notification Settings - AC10.6.6-AC10.6.9, AC10.6.10 */}
        <NotificationSettings />
      </div>

      <ConsumerNav />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LogOut, Settings, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ConsumerNav } from "@/components/layout/consumer-nav";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ConsumerProfileForm } from "@/components/consumer/profile-form";
import { cleanupPushBeforeLogout } from "@/lib/push/logout-cleanup";

interface Profile {
  name: string;
  phone: string;
  address: string | null;
  special_instructions: string | null;
  comuna_id: string | null;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? null);

      // Fetch profile including comuna_id
      // Story 12.8-2: Role-Based Route Guards (BUG-R2-004)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("name, phone, address, special_instructions, comuna_id, role")
        .eq("id", user.id)
        .single();

      if (profileData) {
        // Redirect non-consumers to their appropriate profile/dashboard
        if (profileData.role === "supplier") {
          router.push("/profile");
          return;
        }
        if (profileData.role === "admin") {
          // Admin should go to admin panel, not consumer profile
          router.push("/admin");
          return;
        }
        setProfile(profileData);
      } else {
        // No profile - redirect to onboarding
        router.push("/consumer/onboarding");
        return;
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  /**
   * Story 12.8-1: AC12.8.1.2 - Consumer Logout Cleanup
   * Cleans up push subscriptions BEFORE signOut to prevent
   * notifications being sent to wrong users on shared devices.
   */
  async function handleLogout() {
    setLoggingOut(true);

    // AC12.8.1.2: Clean up push subscriptions FIRST
    await cleanupPushBeforeLogout();

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pb-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#0077B6]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-20">
      {/* Dashboard Header */}
      <DashboardHeader
        title="Mi Perfil"
        subtitle="Tu cuenta"
        userName={profile?.name}
        showNotifications
      />

      {/* Content - Compact padding */}
      <div className="flex-1 px-3 py-2">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-3">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Información Personal
          </h2>
          {profile && (
            <ConsumerProfileForm initialData={profile} email={email} />
          )}
        </div>

        {/* Settings Link - AC10.6.10 */}
        <Link
          href="/settings"
          className="flex items-center justify-between w-full bg-white rounded-xl shadow-sm p-4 mb-3 hover:bg-gray-50 transition-colors"
          data-testid="consumer-settings-link"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#CAF0F8] flex items-center justify-center">
              <Settings className="w-4 h-4 text-[#0077B6]" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Ajustes</p>
              <p className="text-xs text-gray-500">App, notificaciones</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full h-10 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl border-gray-200 text-sm"
          onClick={handleLogout}
          disabled={loggingOut}
          data-testid="consumer-logout-button"
        >
          {loggingOut ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cerrando sesión...
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </>
          )}
        </Button>
      </div>

      <ConsumerNav />
    </div>
  );
}

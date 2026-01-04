"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Loader2 } from "lucide-react";
import { cleanupPushBeforeLogout } from "@/lib/push/logout-cleanup";

/**
 * Admin Logout Button
 * Story 12.8-1: AC12.8.1.3 - Admin Logout Cleanup
 * Cleans up push subscriptions BEFORE signOut to prevent
 * notifications being sent to wrong users on shared devices.
 */
export function AdminLogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setIsLoading(true);

    try {
      // AC12.8.1.3: Clean up push subscriptions FIRST
      await cleanupPushBeforeLogout();

      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold border-2 border-gray-200 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      data-testid="admin-logout-button"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      Cerrar Sesión
    </button>
  );
}

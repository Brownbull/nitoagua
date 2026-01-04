"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cleanupPushBeforeLogout } from "@/lib/push/logout-cleanup";

/**
 * Provider Sign Out Button
 * Story 12.8-1: AC12.8.1.1 - Provider Logout Cleanup
 * Cleans up push subscriptions BEFORE signOut to prevent
 * notifications being sent to wrong users on shared devices.
 */
export function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);

    try {
      // AC12.8.1.1: Clean up push subscriptions FIRST
      await cleanupPushBeforeLogout();

      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error("Error al cerrar sesión");
        setIsLoading(false);
        return;
      }

      // Redirect to home page
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Error al cerrar sesión");
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
      onClick={handleSignOut}
      disabled={isLoading}
      data-testid="sign-out-button"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      Cerrar Sesión
    </Button>
  );
}

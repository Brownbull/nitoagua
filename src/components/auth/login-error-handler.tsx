"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function LoginErrorHandler() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      // Log error for debugging (not exposed to user)
      console.error("[AUTH] Login error:", error);

      // Show user-friendly Spanish error message with retry option
      toast.error("Error al iniciar sesión. Intenta de nuevo.", {
        action: {
          label: "Reintentar",
          onClick: () => {
            // Clear error from URL and allow user to try again
            window.history.replaceState({}, "", "/login");
          },
        },
        duration: 10000, // Show for 10 seconds
      });
    }
  }, [error]);

  return null;
}

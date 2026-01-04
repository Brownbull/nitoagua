"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ServiceWorkerRegistration() {
  const router = useRouter();

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration.scope);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });

      // Listen for messages from the service worker
      // This handles navigation requests when a notification is clicked
      const handleSWMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === "NOTIFICATION_CLICK") {
          const url = event.data.url;
          console.log("[App] Received NOTIFICATION_CLICK, navigating to:", url);
          // Use Next.js router for client-side navigation
          router.push(url);
        }
      };

      navigator.serviceWorker.addEventListener("message", handleSWMessage);

      return () => {
        navigator.serviceWorker.removeEventListener("message", handleSWMessage);
      };
    }
  }, [router]);

  return null;
}

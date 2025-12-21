"use client";

import { usePathname } from "next/navigation";
import { ConsumerNav } from "./consumer-nav";

interface ConsumerLayoutWrapperProps {
  children: React.ReactNode;
}

/**
 * Client wrapper for consumer layout that conditionally shows/hides
 * the bottom navigation based on the current route.
 *
 * Routes where nav is hidden:
 * - /request (new request wizard flow)
 * - /request/[id]/confirmation (confirmation page has its own nav)
 */
export function ConsumerLayoutWrapper({ children }: ConsumerLayoutWrapperProps) {
  const pathname = usePathname();

  // Hide nav during request flow (wizard and confirmation)
  // Request flow pages render their own navigation or have none
  const isRequestFlow = pathname === "/request" || pathname.startsWith("/request/");
  const showNav = !isRequestFlow;

  return (
    <div className="flex min-h-screen flex-col">
      <main className={`flex flex-1 flex-col ${showNav ? "pb-16" : ""}`}>
        {children}
      </main>
      {showNav && <ConsumerNav />}
    </div>
  );
}

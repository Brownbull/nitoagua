"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Home, Clock, User, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadUpdates } from "@/hooks/use-unread-updates";

/**
 * Consumer bottom navigation bar - Mockup aligned design
 *
 * Shows navigation links for Home, History, Profile with center FAB for new requests.
 * Displays unread badge on History when there are status updates
 * since the user last viewed the history page (AC5-3-2).
 */
export function ConsumerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { hasUnread, unreadCount, markAsRead } = useUnreadUpdates();

  // Clear badge when visiting history page (AC5-3-2)
  useEffect(() => {
    if (pathname === "/history") {
      markAsRead();
    }
  }, [pathname, markAsRead]);

  const isHomeActive = pathname === "/";
  const isHistoryActive = pathname === "/history";
  const isProfileActive = pathname === "/consumer-profile";

  return (
    <nav
      data-testid="consumer-nav"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white safe-area-bottom"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {/* Home */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center gap-0.5 min-w-[56px] px-2 py-1.5 rounded-xl transition-colors",
            isHomeActive
              ? "text-[#0077B6] bg-[#CAF0F8]"
              : "text-gray-400"
          )}
        >
          <Home className="w-5 h-5" strokeWidth={2} />
          <span className="text-[10px] font-medium">Inicio</span>
        </Link>

        {/* History */}
        <Link
          href="/history"
          className={cn(
            "relative flex flex-col items-center gap-0.5 min-w-[56px] px-2 py-1.5 rounded-xl transition-colors",
            isHistoryActive
              ? "text-[#0077B6] bg-[#CAF0F8]"
              : "text-gray-400"
          )}
        >
          <div className="relative">
            <Clock className="w-5 h-5" strokeWidth={2} />
            {/* Unread badge (AC5-3-2) */}
            {hasUnread && !isHistoryActive && (
              <span
                className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
                aria-label={`${unreadCount} actualizaciones sin leer`}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Historial</span>
        </Link>

        {/* Center FAB - Request Water */}
        <div className="flex flex-col items-center relative -top-4">
          <button
            onClick={() => router.push("/request")}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-[0_4px_14px_rgba(0,119,182,0.4)]"
            style={{
              background: "linear-gradient(135deg, #0077B6 0%, #005f8f 100%)",
            }}
            aria-label="Pedir agua"
          >
            <Droplets className="w-6 h-6" fill="currentColor" />
          </button>
          <span className="text-[10px] font-semibold text-[#0077B6] mt-0.5">Pedir</span>
        </div>

        {/* Alerts - placeholder for now */}
        <Link
          href="/history"
          className="flex flex-col items-center gap-0.5 min-w-[56px] px-2 py-1.5 rounded-xl text-gray-400"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          </svg>
          <span className="text-[10px] font-medium">Alertas</span>
        </Link>

        {/* Profile */}
        <Link
          href="/consumer-profile"
          className={cn(
            "flex flex-col items-center gap-0.5 min-w-[56px] px-2 py-1.5 rounded-xl transition-colors",
            isProfileActive
              ? "text-[#0077B6] bg-[#CAF0F8]"
              : "text-gray-400"
          )}
        >
          <User className="w-5 h-5" strokeWidth={2} />
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>
      </div>
    </nav>
  );
}

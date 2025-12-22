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
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white pb-safe"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-4">
        {/* Home */}
        <Link
          href="/"
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full transition-colors",
            isHomeActive
              ? "text-[#0077B6] bg-[#CAF0F8]"
              : "text-gray-400"
          )}
          aria-label="Inicio"
        >
          <Home className="w-6 h-6" strokeWidth={2} />
        </Link>

        {/* History */}
        <Link
          href="/history"
          className={cn(
            "relative flex items-center justify-center w-12 h-12 rounded-full transition-colors",
            isHistoryActive
              ? "text-[#0077B6] bg-[#CAF0F8]"
              : "text-gray-400"
          )}
          aria-label="Historial"
        >
          <Clock className="w-6 h-6" strokeWidth={2} />
          {/* Unread badge (AC5-3-2) */}
          {hasUnread && !isHistoryActive && (
            <span
              className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
              aria-label={`${unreadCount} actualizaciones sin leer`}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Center FAB - Request Water */}
        <button
          onClick={() => router.push("/request")}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_4px_14px_rgba(0,119,182,0.4)] -mt-4"
          style={{
            background: "linear-gradient(135deg, #0077B6 0%, #005f8f 100%)",
          }}
          aria-label="Pedir agua"
        >
          <Droplets className="w-7 h-7" fill="currentColor" />
        </button>

        {/* Alerts - placeholder for now */}
        <Link
          href="/history"
          className="flex items-center justify-center w-12 h-12 rounded-full text-gray-400"
          aria-label="Alertas"
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          </svg>
        </Link>

        {/* Profile */}
        <Link
          href="/consumer-profile"
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full transition-colors",
            isProfileActive
              ? "text-[#0077B6] bg-[#CAF0F8]"
              : "text-gray-400"
          )}
          aria-label="Perfil"
        >
          <User className="w-6 h-6" strokeWidth={2} />
        </Link>
      </div>
    </nav>
  );
}

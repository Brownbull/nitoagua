"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Home, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadUpdates } from "@/hooks/use-unread-updates";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/history", label: "Historial", icon: Clock },
  { href: "/consumer-profile", label: "Perfil", icon: User },
];

/**
 * Consumer bottom navigation bar
 *
 * Shows navigation links for Home, History, and Profile.
 * Displays unread badge on History when there are status updates
 * since the user last viewed the history page (AC5-3-2).
 */
export function ConsumerNav() {
  const pathname = usePathname();
  const { hasUnread, unreadCount, markAsRead } = useUnreadUpdates();

  // Clear badge when visiting history page (AC5-3-2)
  useEffect(() => {
    if (pathname === "/history") {
      markAsRead();
    }
  }, [pathname, markAsRead]);

  return (
    <nav
      data-testid="consumer-nav"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const showBadge = item.href === "/history" && hasUnread && !isActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 px-4 py-2 transition-colors",
                isActive
                  ? "text-[#0077B6]"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn("h-6 w-6", isActive && "fill-current")}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {/* Unread badge (AC5-3-2) */}
                {showBadge && (
                  <span
                    className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
                    aria-label={`${unreadCount} actualizaciones sin leer`}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  userName?: string;
  showNotifications?: boolean;
  notificationCount?: number;
}

/**
 * DashboardHeader - Mockup-aligned header for consumer dashboard pages
 * Uses gradient background with nitoagua logo, avatar, and optional notification bell
 */
export function DashboardHeader({
  title,
  subtitle,
  userName,
  showNotifications = false,
  notificationCount = 0,
}: DashboardHeaderProps) {
  // Get initials from userName for avatar
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div
      className="shrink-0 px-4 pt-3 pb-4"
      style={{ background: "linear-gradient(180deg, #CAF0F8 0%, white 100%)" }}
    >
      {/* Top row: Logo and actions */}
      <div className="flex items-center justify-between mb-3">
        <Link href="/">
          <span
            className="text-[22px] text-[#0077B6]"
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            nitoagua
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {showNotifications && (
            <button
              className="relative w-9 h-9 bg-white rounded-[10px] flex items-center justify-center shadow-sm"
              aria-label="Notificaciones"
            >
              <Bell className="w-[18px] h-[18px] text-gray-500" />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>
          )}

          <Link
            href="/consumer-profile"
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, #0077B6 0%, #005f8f 100%)",
            }}
          >
            {initials}
          </Link>
        </div>
      </div>

      {/* Title area */}
      {subtitle && (
        <p className="text-[13px] text-gray-500 mb-0.5">{subtitle}</p>
      )}
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>
    </div>
  );
}

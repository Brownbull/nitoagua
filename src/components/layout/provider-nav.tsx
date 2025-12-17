"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, DollarSign, Settings, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/provider/requests", label: "Inicio", icon: Home },
  { href: "/provider/offers", label: "Mis Ofertas", icon: FileText },
  // Center FAB placeholder - will be rendered separately
  { href: "/provider/earnings", label: "Ganancias", icon: DollarSign },
  { href: "/provider/settings", label: "Ajustes", icon: Settings },
];

/**
 * Provider bottom navigation bar
 *
 * Matches the mockup design with 5 items:
 * - Inicio (Home/Requests)
 * - Mis Ofertas (My Offers)
 * - Ver mapa (FAB center button)
 * - Ganancias (Earnings)
 * - Ajustes (Settings)
 */
export function ProviderNav() {
  const pathname = usePathname();

  // Check if we're on a detail page (should hide nav)
  const isDetailPage = pathname.includes("/requests/") && pathname !== "/provider/requests";

  if (isDetailPage) {
    return null;
  }

  return (
    <nav
      data-testid="provider-nav"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white"
    >
      <div className="mx-auto flex h-16 max-w-lg items-end justify-around pb-1">
        {/* Left side items */}
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-3 py-1 transition-colors",
                isActive
                  ? "text-orange-500"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon
                className="h-[22px] w-[22px]"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Center FAB - Map button */}
        <div className="relative flex flex-col items-center -mt-3">
          <Link
            href="/provider/map"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition-colors"
            data-testid="map-fab-button"
          >
            <MapPin className="h-6 w-6" />
          </Link>
          <span className="text-[10px] font-medium text-orange-500 mt-1">Ver mapa</span>
        </div>

        {/* Right side items */}
        {navItems.slice(2).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-3 py-1 transition-colors",
                isActive
                  ? "text-orange-500"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon
                className="h-[22px] w-[22px]"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

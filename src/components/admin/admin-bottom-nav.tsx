"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  ShieldCheck,
  DollarSign,
  Package,
  Menu,
  X,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
}

// Operations menu items (inside hamburger)
const operationsItems: NavItem[] = [
  {
    label: "Verificar",
    href: "/admin/verification",
    icon: ShieldCheck,
  },
  {
    label: "Proveedores",
    href: "/admin/providers",
    icon: Users,
  },
  {
    label: "Pedidos",
    href: "/admin/orders",
    icon: Package,
  },
];

export function AdminBottomNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check if current path is in operations menu
  const isOperationsActive = operationsItems.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <>
      {/* Overlay when menu is open */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Slide-up operations menu */}
      <div
        className={cn(
          "fixed bottom-[60px] left-0 right-0 bg-white rounded-t-2xl shadow-lg z-50 lg:hidden transition-transform duration-300 ease-out",
          isMenuOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Operaciones</h3>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {operationsItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl transition-colors",
                    isActive
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                  data-testid={`operations-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50"
        data-testid="admin-bottom-nav"
      >
        <div className="grid grid-cols-5 w-full">
          {/* 1. Dashboard */}
          <Link
            href="/admin/dashboard"
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-2 transition-colors",
              pathname === "/admin/dashboard"
                ? "text-gray-800"
                : "text-gray-400 hover:text-gray-600"
            )}
            data-testid="bottom-nav-dashboard"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span
              className={cn(
                "text-[10px]",
                pathname === "/admin/dashboard" ? "font-semibold" : "font-medium"
              )}
            >
              Dashboard
            </span>
          </Link>

          {/* 2. Analytics (placeholder for future) */}
          <div
            className="flex flex-col items-center justify-center gap-0.5 py-2 text-gray-300 cursor-not-allowed"
            data-testid="bottom-nav-analytics"
            title="Próximamente"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] font-medium">Analytics</span>
          </div>

          {/* 3. Operations Menu Button - Center */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-2 transition-colors",
              isMenuOpen || isOperationsActive
                ? "text-gray-800"
                : "text-gray-400 hover:text-gray-600"
            )}
            data-testid="bottom-nav-operations"
          >
            <Menu className="w-5 h-5" />
            <span
              className={cn(
                "text-[10px]",
                isMenuOpen || isOperationsActive ? "font-semibold" : "font-medium"
              )}
            >
              Operaciones
            </span>
          </button>

          {/* 4. Finanzas */}
          <Link
            href="/admin/settlement"
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-2 transition-colors",
              pathname === "/admin/settlement" ||
                pathname.startsWith("/admin/settlement/")
                ? "text-gray-800"
                : "text-gray-400 hover:text-gray-600"
            )}
            data-testid="bottom-nav-finanzas"
          >
            <DollarSign className="w-5 h-5" />
            <span
              className={cn(
                "text-[10px]",
                pathname === "/admin/settlement" ||
                  pathname.startsWith("/admin/settlement/")
                  ? "font-semibold"
                  : "font-medium"
              )}
            >
              Finanzas
            </span>
          </Link>

          {/* 5. Config */}
          <Link
            href="/admin/settings"
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-2 transition-colors",
              pathname === "/admin/settings"
                ? "text-gray-800"
                : "text-gray-400 hover:text-gray-600"
            )}
            data-testid="bottom-nav-config"
          >
            <Settings className="w-5 h-5" />
            <span
              className={cn(
                "text-[10px]",
                pathname === "/admin/settings" ? "font-semibold" : "font-medium"
              )}
            >
              Config
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
}

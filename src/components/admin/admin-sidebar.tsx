"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Package,
  Settings,
  ShieldCheck,
  DollarSign,
  AlertCircle,
  ClipboardList,
  UserCircle,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Verificacion",
    href: "/admin/verification",
    icon: ShieldCheck,
    disabled: false,
  },
  {
    label: "Proveedores",
    href: "/admin/providers",
    icon: Users,
    disabled: false,
  },
  {
    label: "Pedidos",
    href: "/admin/orders",
    icon: Package,
    disabled: false,
  },
  {
    label: "Problemas",
    href: "/admin/problems",
    icon: AlertCircle,
    disabled: true,
  },
  {
    label: "Consumidores",
    href: "/admin/consumers",
    icon: UserCircle,
    disabled: true,
  },
  {
    label: "Finanzas",
    href: "/admin/settlement",
    icon: DollarSign,
    disabled: false,
  },
  {
    label: "Historial",
    href: "/admin/history",
    icon: ClipboardList,
    disabled: true,
  },
  {
    label: "Config",
    href: "/admin/settings",
    icon: Settings,
    disabled: false,
  },
];

interface AdminSidebarProps {
  userEmail?: string;
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 bg-gray-900 text-white min-h-screen flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-700 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-logo text-xl text-white">nitoagua</span>
            <span className="block text-xs text-gray-400 uppercase tracking-wide">
              Panel Admin
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                {item.disabled ? (
                  <span
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium",
                      "text-gray-500 cursor-not-allowed"
                    )}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    )}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info */}
      {userEmail && (
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3.5 py-2.5">
            <div className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center">
              <UserCircle className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

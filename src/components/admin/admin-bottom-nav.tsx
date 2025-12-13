"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Settings, ShieldCheck } from "lucide-react";

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
    label: "Verificar",
    href: "/admin/verification",
    icon: ShieldCheck,
  },
  {
    label: "Proveedores",
    href: "/admin/providers",
    icon: Users,
    disabled: true,
  },
  {
    label: "Config",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50"
      data-testid="admin-bottom-nav"
    >
      <div className="flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          if (item.disabled) {
            return (
              <span
                key={item.href}
                className="flex-1 flex flex-col items-center gap-1 py-2 px-1 text-gray-300 cursor-not-allowed"
                data-testid={`bottom-nav-${item.label.toLowerCase()}`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 px-1 transition-colors",
                isActive
                  ? "text-gray-800"
                  : "text-gray-400 hover:text-gray-600"
              )}
              data-testid={`bottom-nav-${item.label.toLowerCase()}`}
            >
              <Icon className="w-6 h-6" />
              <span className={cn(
                "text-[10px]",
                isActive ? "font-semibold" : "font-medium"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

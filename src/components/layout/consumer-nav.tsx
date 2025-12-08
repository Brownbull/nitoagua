"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/history", label: "Historial", icon: Clock },
  { href: "/consumer-profile", label: "Perfil", icon: User },
];

export function ConsumerNav() {
  const pathname = usePathname();

  return (
    <nav
      data-testid="consumer-nav"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 px-4 py-2 transition-colors",
                isActive
                  ? "text-[#0077B6]"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon
                className={cn("h-6 w-6", isActive && "fill-current")}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

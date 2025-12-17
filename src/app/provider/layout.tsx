import { Droplets } from "lucide-react";
import { ProviderNav } from "@/components/layout/provider-nav";
import { NotificationBell } from "@/components/provider/notification-bell";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header with Logo and Notification Bell - AC: 8.5.1 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-orange-100">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          {/* Left spacer for centering */}
          <div className="w-9" />

          {/* Center: Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-orange-600">nitoagua</span>
            <span className="text-xs text-gray-500 ml-1">Proveedor</span>
          </div>

          {/* Right: Notification Bell - Shows unread count and notifications */}
          <NotificationBell />
        </div>
      </header>

      {/* Main content with bottom padding for nav */}
      <main className="pb-20">{children}</main>

      {/* Bottom navigation */}
      <ProviderNav />
    </div>
  );
}

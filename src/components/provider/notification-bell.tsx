"use client";

import { useState } from "react";
import { Bell, CheckCircle2, Truck, FileText, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, type Notification } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Notification bell with dropdown for in-app notifications
 * AC: 8.5.1 - Provider receives in-app notification: "¡Tu oferta fue aceptada!"
 * AC: 8.5.4 - "Ver Detalles" button links to delivery page
 */
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAllAsRead,
    navigateToNotification,
  } = useNotifications();

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "offer_accepted":
        return <Truck className="h-5 w-5 text-green-500" />;
      case "new_offer":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "verification_approved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  // Handle notification click
  // AC: 8.5.4 - Mark as read on click, navigate to delivery
  const handleNotificationClick = (notification: Notification) => {
    setIsOpen(false);
    navigateToNotification(notification);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          data-testid="notification-bell"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center text-xs"
              data-testid="notification-badge"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-orange-600 hover:text-orange-700 h-auto py-1 px-2"
              onClick={() => markAllAsRead()}
            >
              Marcar todas como leídas
            </Button>
          )}
        </div>

        {/* Notification list */}
        <ScrollArea className="h-[320px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-orange-500" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Bell className="h-10 w-10 mb-3 text-gray-300" />
              <p className="text-sm">Sin notificaciones</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors",
                    !notification.read && "bg-orange-50"
                  )}
                  data-testid={`notification-item-${notification.id}`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm",
                        !notification.read ? "font-semibold text-gray-900" : "text-gray-700"
                      )}
                    >
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>

                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-orange-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-gray-600"
              onClick={() => setIsOpen(false)}
            >
              Cerrar
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;

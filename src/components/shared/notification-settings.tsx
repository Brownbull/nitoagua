"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, BellRing, Send, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

type NotificationPermission = "default" | "granted" | "denied";

interface NotificationSettingsProps {
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Notification Settings Component
 *
 * Manages push notification permissions and provides test notification functionality.
 * AC10.6.6-AC10.6.9: Notification settings section
 *
 * Spanish copy per story Dev Notes.
 */
export function NotificationSettings({ className }: NotificationSettingsProps) {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [requesting, setRequesting] = useState(false);
  const [sending, setSending] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [supported, setSupported] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Check notification support and permission on mount
  useEffect(() => {
    setMounted(true);

    if (typeof window === "undefined" || !("Notification" in window)) {
      setSupported(false);
      return;
    }

    setPermission(Notification.permission);
  }, []);

  // Handle notification permission request - AC10.6.7, AC10.6.9
  const handleRequestPermission = useCallback(async () => {
    if (!supported) return;

    setRequesting(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
    } catch (error) {
      console.error("Notification permission error:", error);
    } finally {
      setRequesting(false);
    }
  }, [supported]);

  // Handle toggle change
  const handleToggle = useCallback(
    async (checked: boolean) => {
      if (checked && permission === "default") {
        await handleRequestPermission();
      }
      // Note: Cannot programmatically disable notifications once granted
      // User must change this in browser settings
    },
    [permission, handleRequestPermission]
  );

  // Handle test notification - AC10.6.8
  const handleTestNotification = useCallback(async () => {
    if (permission !== "granted") return;

    setSending(true);
    setTestSent(false);

    try {
      // Create a test notification
      const notification = new Notification("NitoAgua", {
        body: "¡Las notificaciones están funcionando!",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: "test-notification",
      });

      // Auto-close after 4 seconds
      setTimeout(() => {
        notification.close();
      }, 4000);

      setTestSent(true);

      // Reset test sent state after 3 seconds
      setTimeout(() => {
        setTestSent(false);
      }, 3000);
    } catch (error) {
      console.error("Test notification error:", error);
    } finally {
      setSending(false);
    }
  }, [permission]);

  // Get status text and icon based on permission
  const getStatusInfo = () => {
    switch (permission) {
      case "granted":
        return {
          text: "Activadas",
          description: "Recibiras notificaciones de NitoAgua",
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-50",
        };
      case "denied":
        return {
          text: "Bloqueadas",
          description: "Habilita notificaciones en la configuración del navegador",
          icon: XCircle,
          color: "text-red-600",
          bgColor: "bg-red-50",
        };
      default:
        return {
          text: "Desactivadas",
          description: "Activa las notificaciones para recibir alertas",
          icon: AlertCircle,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
        };
    }
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden", className)}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#0077B6]" aria-hidden="true" />
            <span className="font-semibold text-gray-900">Notificaciones</span>
          </div>
        </div>
        <div className="p-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  // Show unsupported message if notifications not available
  if (!supported) {
    return (
      <div
        className={cn("bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden", className)}
        data-testid="notification-settings"
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#0077B6]" aria-hidden="true" />
            <span className="font-semibold text-gray-900">Notificaciones</span>
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500">
            Las notificaciones no están soportadas en este navegador.
          </p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div
      className={cn("bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden", className)}
      data-testid="notification-settings"
    >
      {/* Section Header - AC10.6.6 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#0077B6]" aria-hidden="true" />
          <span className="font-semibold text-gray-900">Notificaciones</span>
        </div>
      </div>

      {/* Push Notifications Toggle - AC10.6.7 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium text-gray-900">Notificaciones Push</p>
            <p className="text-sm text-gray-500">{statusInfo.description}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status badge */}
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium",
                statusInfo.color,
                statusInfo.bgColor
              )}
              data-testid="notification-status-badge"
            >
              <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{statusInfo.text}</span>
            </div>

            {/* Toggle switch - AC10.6.7 */}
            {permission !== "denied" && (
              <Switch
                checked={permission === "granted"}
                onCheckedChange={handleToggle}
                disabled={requesting}
                aria-label="Activar notificaciones push"
                data-testid="notification-toggle"
              />
            )}
          </div>
        </div>

        {/* Blocked state help text */}
        {permission === "denied" && (
          <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-sm text-amber-800">
              <strong>¿Cómo habilitarlas?</strong> Abre la configuración del navegador y permite
              notificaciones para este sitio.
            </p>
          </div>
        )}
      </div>

      {/* Test Notification - AC10.6.8 */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium text-gray-900">Probar Notificación</p>
            <p className="text-sm text-gray-500">
              Envía una notificación de prueba para verificar
            </p>
          </div>

          <button
            onClick={handleTestNotification}
            disabled={permission !== "granted" || sending}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium",
              permission === "granted"
                ? testSent
                  ? "bg-green-100 text-green-700"
                  : "bg-[#0077B6] text-white hover:bg-[#005f8f]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
            data-testid="notification-test-button"
            aria-disabled={permission !== "granted"}
          >
            {testSent ? (
              <>
                <CheckCircle className="w-4 h-4" aria-hidden="true" />
                <span>Enviada</span>
              </>
            ) : sending ? (
              <>
                <BellRing className="w-4 h-4 animate-pulse" aria-hidden="true" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Probar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationSettings;

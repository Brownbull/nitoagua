"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, BellRing, Send, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array, isVapidConfigured } from "@/lib/push/vapid";
import {
  subscribeToPush,
  unsubscribeFromPush,
  getSubscriptionStatus,
} from "@/lib/actions/push-subscription";

type NotificationPermission = "default" | "granted" | "denied";
type PushState = "idle" | "subscribed" | "subscribing" | "error";

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
 * AC12.6.3: Push subscription management (Story 12-6)
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

  // Push subscription state (Story 12-6)
  const [pushState, setPushState] = useState<PushState>("idle");
  const [pushError, setPushError] = useState<string | null>(null);
  const [pushSupported, setPushSupported] = useState(true);

  // Check notification support and permission on mount
  useEffect(() => {
    setMounted(true);

    if (typeof window === "undefined" || !("Notification" in window)) {
      setSupported(false);
      return;
    }

    setPermission(Notification.permission);

    // AC12.6.3: Check push subscription support and status
    checkPushSupport();
  }, []);

  // Check if push notifications are supported and get current status
  const checkPushSupport = useCallback(async () => {
    // Check if service worker and push are supported
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setPushSupported(false);
      setPushError("Push no soportado en este navegador");
      return;
    }

    // Check if VAPID is configured
    if (!isVapidConfigured()) {
      console.warn("[NotificationSettings] VAPID not configured - NEXT_PUBLIC_VAPID_PUBLIC_KEY is empty");
      setPushSupported(false);
      setPushError("Push no configurado en el servidor");
      return;
    }

    // Check current subscription status from database
    try {
      const status = await getSubscriptionStatus();
      if (status.isSubscribed) {
        setPushState("subscribed");
      }
    } catch (err) {
      console.error("[NotificationSettings] Error checking subscription:", err);
      setPushError("Error al verificar suscripción");
    }
  }, []);

  // Handle notification permission request - AC10.6.7, AC10.6.9
  const handleRequestPermission = useCallback(async () => {
    if (!supported) return;

    setRequesting(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      // AC12.6.3: If permission granted and push supported, subscribe
      if (result === "granted" && pushSupported) {
        await handlePushSubscribe();
      }
    } catch (error) {
      console.error("Notification permission error:", error);
    } finally {
      setRequesting(false);
    }
  }, [supported, pushSupported]);

  // AC12.6.3: Subscribe to push notifications
  const handlePushSubscribe = useCallback(async () => {
    if (!pushSupported) return;

    setPushState("subscribing");
    setPushError(null);

    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // AC12.6.3: Get push subscription from service worker (pushManager.subscribe())
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Extract subscription data
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!))
          ),
          auth: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))
          ),
        },
      };

      // AC12.6.3: Send subscription to server via subscribeToPush() action
      const result = await subscribeToPush(subscriptionData);

      if (result.success) {
        setPushState("subscribed");
      } else {
        setPushState("error");
        setPushError(result.error || "Error al activar notificaciones push");
      }
    } catch (error) {
      console.error("[NotificationSettings] Push subscribe error:", error);
      setPushState("error");
      setPushError("Error al activar notificaciones push");
    }
  }, [pushSupported]);

  // AC12.6.3: Unsubscribe from push notifications
  const handlePushUnsubscribe = useCallback(async () => {
    setPushState("subscribing");
    setPushError(null);

    try {
      // Unsubscribe from browser
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove from database
      const result = await unsubscribeFromPush();

      if (result.success) {
        setPushState("idle");
      } else {
        setPushState("error");
        setPushError(result.error || "Error al desactivar notificaciones push");
      }
    } catch (error) {
      console.error("[NotificationSettings] Push unsubscribe error:", error);
      setPushState("error");
      setPushError("Error al desactivar notificaciones push");
    }
  }, []);

  // Handle toggle change
  const handleToggle = useCallback(
    async (checked: boolean) => {
      if (checked && permission === "default") {
        await handleRequestPermission();
      } else if (checked && permission === "granted" && pushSupported) {
        // AC12.6.3: Subscribe to push if permission already granted
        await handlePushSubscribe();
      } else if (!checked && pushState === "subscribed") {
        // AC12.6.3: Unsubscribe from push
        await handlePushUnsubscribe();
      }
    },
    [permission, pushSupported, pushState, handleRequestPermission, handlePushSubscribe, handlePushUnsubscribe]
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

  // Get status text and icon based on permission and push state
  const getStatusInfo = () => {
    // AC12.6.3: Show push subscription status
    if (pushState === "subscribing") {
      return {
        text: "Activando...",
        description: "Configurando notificaciones push",
        icon: Loader2,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        isLoading: true,
      };
    }

    if (pushState === "error") {
      return {
        text: "Error",
        description: pushError || "Error al configurar notificaciones",
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        isLoading: false,
      };
    }

    // Show when VAPID is not configured
    if (!pushSupported && pushError) {
      return {
        text: "No disponible",
        description: pushError,
        icon: AlertCircle,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        isLoading: false,
      };
    }

    if (pushState === "subscribed" && permission === "granted") {
      return {
        text: "Push activo",
        description: "Recibirás alertas incluso con la app cerrada",
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        isLoading: false,
      };
    }

    switch (permission) {
      case "granted":
        // Permission granted but not subscribed to push
        return {
          text: "Desactivadas",
          description: pushSupported
            ? "Activa para recibir alertas con la app cerrada"
            : "Activa para recibir notificaciones",
          icon: AlertCircle,
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          isLoading: false,
        };
      case "denied":
        return {
          text: "Bloqueadas",
          description: "Habilita notificaciones en la configuración del navegador",
          icon: XCircle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          isLoading: false,
        };
      default:
        return {
          text: "Desactivadas",
          description: "Activa las notificaciones para recibir alertas",
          icon: AlertCircle,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          isLoading: false,
        };
    }
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden", className)}>
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#0077B6]" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-900">Notificaciones</span>
          </div>
        </div>
        <div className="px-4 py-3 animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
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
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#0077B6]" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-900">Notificaciones</span>
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs text-gray-500">
            Las notificaciones no están soportadas en este navegador.
          </p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  // Toggle is checked only if actively subscribed to push (not just permission granted)
  const isToggleChecked = pushState === "subscribed";
  const isToggleDisabled = requesting || pushState === "subscribing" || !pushSupported;

  return (
    <div
      className={cn("bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden", className)}
      data-testid="notification-settings"
    >
      {/* Section Header - AC10.6.6 */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#0077B6]" aria-hidden="true" />
          <span className="text-sm font-semibold text-gray-900">Notificaciones</span>
        </div>
      </div>

      {/* Push Notifications Toggle - AC10.6.7, AC12.6.3 */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Notificaciones Push</p>
            <p className="text-xs text-gray-500">{statusInfo.description}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Status badge - AC12.6.3: Show subscription status in UI */}
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium",
                statusInfo.color,
                statusInfo.bgColor
              )}
              data-testid="notification-status-badge"
            >
              <StatusIcon
                className={cn("w-3 h-3", statusInfo.isLoading && "animate-spin")}
                aria-hidden="true"
              />
              <span>{statusInfo.text}</span>
            </div>

            {/* Toggle switch - AC10.6.7, AC12.6.3 */}
            {permission !== "denied" && (
              <Switch
                checked={isToggleChecked}
                onCheckedChange={handleToggle}
                disabled={isToggleDisabled}
                aria-label="Activar notificaciones push"
                data-testid="notification-toggle"
                className="scale-90"
              />
            )}
          </div>
        </div>

        {/* Blocked state help text */}
        {permission === "denied" && (
          <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs text-amber-800">
              <strong>¿Cómo habilitarlas?</strong> Abre la configuración del navegador y permite
              notificaciones para este sitio.
            </p>
          </div>
        )}
      </div>

      {/* Test Notification - AC10.6.8 */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Probar Notificación</p>
            <p className="text-xs text-gray-500">
              Envía una notificación de prueba para verificar
            </p>
          </div>

          <button
            onClick={handleTestNotification}
            disabled={permission !== "granted" || sending}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-xs font-medium",
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
                <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Enviada</span>
              </>
            ) : sending ? (
              <>
                <BellRing className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
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

"use client";

import { useState, useEffect, useCallback } from "react";
import { Smartphone, Download, RefreshCw, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Types for PWA install prompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Platform detection
function getPlatform(): "ios" | "android" | "desktop" {
  if (typeof window === "undefined") return "desktop";

  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /ipad|iphone|ipod/.test(ua);
  const isAndroid = /android/.test(ua);

  if (isIOS) return "ios";
  if (isAndroid) return "android";
  return "desktop";
}

// Check if running as installed PWA
function getIsStandalone(): boolean {
  if (typeof window === "undefined") return false;

  // Check display-mode media query
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  // iOS Safari specific check
  const isIOSStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;

  // Android TWA check
  const isAndroidApp = document.referrer.includes("android-app://");

  return isStandalone || isIOSStandalone || isAndroidApp;
}

interface PwaSettingsProps {
  /**
   * App version to display (e.g., "1.0.0")
   */
  version?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * PWA Settings Component
 *
 * Displays PWA installation status, version, and update check functionality.
 * AC10.6.1-AC10.6.5: PWA installation section with version badge
 *
 * Spanish copy per story Dev Notes.
 */
export function PwaSettings({ version = "1.0.0", className }: PwaSettingsProps) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Detect platform and standalone mode on mount
  useEffect(() => {
    setMounted(true);
    setPlatform(getPlatform());
    setIsStandalone(getIsStandalone());

    // Listen for beforeinstallprompt event (Chrome/Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Handle install button click
  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error("Install prompt error:", error);
    }
  }, [deferredPrompt]);

  // Handle update check
  const handleCheckUpdates = useCallback(async () => {
    setCheckingUpdates(true);
    setUpdateAvailable(false);

    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();

          // Check if there's a waiting service worker (update available)
          if (registration.waiting) {
            setUpdateAvailable(true);
          }
        }
      }
    } catch (error) {
      console.error("Update check error:", error);
    } finally {
      setCheckingUpdates(false);
    }
  }, []);

  // Handle update installation
  const handleInstallUpdate = useCallback(async () => {
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration?.waiting) {
          // Tell the waiting service worker to activate
          registration.waiting.postMessage({ type: "SKIP_WAITING" });

          // Reload to use new version
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Update install error:", error);
    }
  }, []);

  // Get platform-specific install instructions
  const getInstallInstructions = () => {
    switch (platform) {
      case "ios":
        return (
          <ol className="text-sm text-gray-600 space-y-2 mt-3 pl-4">
            <li>1. Toca el botón <span className="font-medium">Compartir</span> en la parte inferior</li>
            <li>2. Desplázate y toca <span className="font-medium">&quot;Agregar a Inicio&quot;</span></li>
          </ol>
        );
      case "android":
        return (
          <ol className="text-sm text-gray-600 space-y-2 mt-3 pl-4">
            <li>1. Toca el menú <span className="font-medium">(⋮)</span> en la esquina superior</li>
            <li>2. Selecciona <span className="font-medium">&quot;Instalar aplicación&quot;</span></li>
          </ol>
        );
      default:
        return (
          <ol className="text-sm text-gray-600 space-y-2 mt-3 pl-4">
            <li>1. Haz clic en el icono de instalación en la barra de direcciones</li>
            <li>2. O usa el menú → <span className="font-medium">&quot;Instalar NitoAgua&quot;</span></li>
          </ol>
        );
    }
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden", className)}>
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#0077B6]" aria-hidden="true" />
              <span className="text-sm font-semibold text-gray-900">Instalación de App</span>
            </div>
            <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
              v{version}
            </span>
          </div>
        </div>
        <div className="px-4 py-3 animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden", className)}
      data-testid="pwa-settings"
    >
      {/* Section Header - AC10.6.1 */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#0077B6]" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-900">Instalación de App</span>
          </div>
          <span
            className="text-[11px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded"
            data-testid="app-version"
          >
            v{version}
          </span>
        </div>
      </div>

      {/* Install Row - AC10.6.2, AC10.6.3 */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Instalar App</p>
            <p className="text-xs text-gray-500">
              {isStandalone
                ? "La app está instalada en tu dispositivo"
                : "Sigue los pasos de abajo para instalar"}
            </p>
          </div>

          {isStandalone ? (
            // AC10.6.3: Installed badge
            <div
              className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg"
              data-testid="pwa-installed-badge"
            >
              <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-xs font-medium">Instalada</span>
            </div>
          ) : deferredPrompt ? (
            // AC10.6.2: Install button (Chrome/Android)
            <button
              onClick={handleInstall}
              className="flex items-center gap-1 text-white bg-[#0077B6] hover:bg-[#005f8f] px-2 py-1 rounded-lg transition-colors"
              data-testid="pwa-install-button"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-xs font-medium">Instalar</span>
            </button>
          ) : (
            // AC10.6.4: Show instructions toggle for iOS/manual install
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center gap-1 text-[#0077B6] text-xs font-medium"
              data-testid="pwa-instructions-toggle"
              aria-expanded={showInstructions}
            >
              {showInstructions ? "Ocultar" : "Ver pasos"}
              {showInstructions ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        {/* AC10.6.4: Platform-specific instructions */}
        {showInstructions && !isStandalone && !deferredPrompt && (
          <div className="mt-3 pt-3 border-t border-gray-100" data-testid="pwa-instructions">
            {getInstallInstructions()}
          </div>
        )}
      </div>

      {/* Updates Row - AC10.6.5 */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Actualizaciones</p>
            <p className="text-xs text-gray-500">
              {updateAvailable
                ? "Nueva versión disponible"
                : "Toca para buscar actualizaciones"}
            </p>
          </div>

          {updateAvailable ? (
            <button
              onClick={handleInstallUpdate}
              className="flex items-center gap-1 text-white bg-green-600 hover:bg-green-700 px-2 py-1 rounded-lg transition-colors"
              data-testid="pwa-install-update-button"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-xs font-medium">Actualizar</span>
            </button>
          ) : (
            <button
              onClick={handleCheckUpdates}
              disabled={checkingUpdates}
              className="flex items-center gap-1 text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
              data-testid="pwa-check-updates-button"
            >
              <RefreshCw
                className={cn("w-3.5 h-3.5", checkingUpdates && "animate-spin")}
                aria-hidden="true"
              />
              <span className="text-xs font-medium">
                {checkingUpdates ? "Buscando..." : "Buscar"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PwaSettings;

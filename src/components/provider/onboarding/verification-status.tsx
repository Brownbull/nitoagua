"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  LogOut,
  RefreshCw,
  Wifi,
  Upload,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { resubmitDocuments } from "@/lib/actions/provider-registration";
import confetti from "canvas-confetti";

type VerificationStatus = "pending" | "approved" | "rejected" | "more_info_needed";

interface VerificationStatusProps {
  status: VerificationStatus;
  rejectionReason?: string | null;
  missingDocuments?: string[];
}

// Polling interval: 60 seconds
const POLLING_INTERVAL_MS = 60000;

// Document type labels in Spanish
const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  cedula: "Cédula de Identidad",
  licencia: "Licencia de Conducir",
  permiso_sanitario: "Permiso Sanitario",
  certificacion: "Certificación",
  vehiculo: "Fotos del Vehículo",
};

export function VerificationStatusDisplay({
  status: initialStatus,
  rejectionReason: initialRejectionReason,
  missingDocuments: initialMissingDocuments = [],
}: VerificationStatusProps) {
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus>(initialStatus);
  const [rejectionReason, setRejectionReason] = useState(initialRejectionReason);
  const [missingDocuments, setMissingDocuments] = useState<string[]>(initialMissingDocuments);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Document resubmission state
  const [documentFiles, setDocumentFiles] = useState<Record<string, File[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Confetti effect tracking
  const hasShownConfetti = useRef(false);

  // Trigger confetti effect when status becomes approved
  useEffect(() => {
    if (status === "approved" && !hasShownConfetti.current) {
      hasShownConfetti.current = true;

      // Fire multiple confetti bursts
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Fire from two sides
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#FFD700"],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#FFD700"],
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [status]);

  // Function to fetch the latest status
  const fetchStatus = useCallback(async (showPollingIndicator = false) => {
    if (showPollingIndicator) {
      setIsPolling(true);
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("verification_status, rejection_reason")
        .eq("id", user.id)
        .single();

      if (profile) {
        const newStatus = (profile.verification_status || "pending") as VerificationStatus;
        const newReason = profile.rejection_reason;

        // Update state if status changed
        if (newStatus !== status) {
          setStatus(newStatus);
          setRejectionReason(newReason);

          // Parse missing documents from rejection_reason for more_info_needed
          if (newStatus === "more_info_needed" && newReason) {
            const docsMatch = newReason.match(/Documentos faltantes: (.+)$/m);
            if (docsMatch) {
              setMissingDocuments(docsMatch[1].split(", ").map(d => d.trim()));
            }
          } else {
            setMissingDocuments([]);
          }
        }

        setLastChecked(new Date());
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      if (showPollingIndicator) {
        setIsPolling(false);
      }
    }
  }, [status]);

  // Auto-polling effect (every 60 seconds)
  useEffect(() => {
    // Only poll for pending and more_info_needed statuses
    if (status !== "pending" && status !== "more_info_needed") {
      return;
    }

    const interval = setInterval(() => {
      fetchStatus(true);
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [status, fetchStatus]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await fetchStatus(false);
    // Force a page refresh to fetch latest status from server
    router.refresh();
    // Small delay for UX feedback
    setTimeout(() => setIsRefreshing(false), 1000);
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  }

  function handleFileChange(docType: string, files: FileList | null) {
    if (!files) return;
    setDocumentFiles(prev => ({
      ...prev,
      [docType]: Array.from(files),
    }));
    setSubmitError(null);
  }

  async function handleResubmitDocuments() {
    // Check all missing documents have files
    const missingWithoutFiles = missingDocuments.filter(
      docType => !documentFiles[docType] || documentFiles[docType].length === 0
    );

    if (missingWithoutFiles.length > 0) {
      setSubmitError(`Por favor sube: ${missingWithoutFiles.map(d => DOCUMENT_TYPE_LABELS[d] || d).join(", ")}`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setSubmitError("Sesión expirada. Por favor inicia sesión nuevamente.");
        return;
      }

      // Upload each document to Supabase Storage
      const uploadedPaths: Record<string, string[]> = {};

      for (const [docType, files] of Object.entries(documentFiles)) {
        uploadedPaths[docType] = [];

        for (const file of files) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${user.id}/${docType}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("provider-documents")
            .upload(fileName, file);

          if (uploadError) {
            console.error("Upload error:", uploadError);
            setSubmitError(`Error al subir ${DOCUMENT_TYPE_LABELS[docType] || docType}`);
            return;
          }

          uploadedPaths[docType].push(fileName);
        }
      }

      // Call server action to update documents and reset status
      const result = await resubmitDocuments(uploadedPaths);

      if (!result.success) {
        setSubmitError(result.error || "Error al enviar documentos");
        return;
      }

      // Success!
      setSubmitSuccess(true);
      setStatus("pending");
      setMissingDocuments([]);
      setDocumentFiles({});

      // Refresh page to show updated status
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error("Resubmit error:", error);
      setSubmitError("Error inesperado. Por favor intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const configs: Record<
    VerificationStatus,
    {
      icon: React.ElementType;
      iconColor: string;
      bgColor: string;
      title: string;
      description: string;
      showAction: boolean;
      actionLabel?: string;
      actionHref?: string;
    }
  > = {
    pending: {
      icon: Clock,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-100",
      title: "Tu solicitud está en revisión",
      description:
        "Estamos verificando tus documentos. Este proceso puede tomar de 24 a 48 horas hábiles.",
      showAction: false,
    },
    approved: {
      icon: CheckCircle,
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
      title: "¡Bienvenido a nitoagua!",
      description:
        "Tu cuenta de proveedor ha sido aprobada. Ya puedes comenzar a recibir solicitudes de entrega de agua.",
      showAction: true,
      actionLabel: "Comenzar a trabajar",
      actionHref: "/supplier/dashboard",
    },
    rejected: {
      icon: XCircle,
      iconColor: "text-red-600",
      bgColor: "bg-red-100",
      title: "Tu solicitud no fue aprobada",
      description:
        rejectionReason ||
        "Lamentablemente, tu solicitud no cumple con los requisitos necesarios para ser proveedor.",
      showAction: true,
      actionLabel: "Contactar Soporte",
      actionHref: "mailto:soporte@nitoagua.cl",
    },
    more_info_needed: {
      icon: AlertCircle,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100",
      title: "Necesitamos más información",
      description:
        "Algunos de tus documentos requieren actualización. Por favor revisa los detalles y vuelve a enviar.",
      showAction: false, // We handle this inline
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] items-center justify-center px-4 py-8">
      <div className="max-w-md w-full text-center">
        {/* Polling Indicator */}
        {isPolling && (
          <div className="fixed top-4 right-4 flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-xs font-medium animate-pulse">
            <Wifi className="w-3 h-3" />
            Verificando...
          </div>
        )}

        {/* Status Icon with transition */}
        <div
          className={`mx-auto w-20 h-20 rounded-full ${config.bgColor} flex items-center justify-center mb-6 transition-all duration-500 ${
            status === "approved" ? "animate-bounce" : ""
          }`}
          style={status === "approved" ? { animationDuration: "1s", animationIterationCount: 3 } : undefined}
        >
          <Icon className={`w-10 h-10 ${config.iconColor} transition-all duration-500`} />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3 transition-all duration-300">{config.title}</h1>

        {/* Description */}
        <p className="text-gray-600 mb-8">{config.description}</p>

        {/* Last checked indicator */}
        {lastChecked && (status === "pending" || status === "more_info_needed") && (
          <p className="text-xs text-gray-400 mb-4">
            Última verificación: {lastChecked.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}

        {/* Status-specific content */}
        {status === "pending" && (
          <>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-medium text-gray-700 mb-2">
                Mientras tanto...
              </h3>
              <ul className="text-sm text-gray-500 space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Tu información está siendo verificada
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Te notificaremos por email cuando haya novedades
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Puedes cerrar esta página y volver más tarde
                </li>
              </ul>
            </div>

            {/* Action buttons for pending status */}
            <div className="flex flex-col gap-3 mb-8">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="w-full h-12 rounded-xl font-medium"
                disabled={isRefreshing || isPolling}
                data-testid="btn-refresh-status"
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Actualizando..." : "Verificar estado"}
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full h-12 rounded-xl font-medium text-gray-600 hover:text-gray-800"
                disabled={isLoggingOut}
                data-testid="btn-logout"
              >
                <LogOut className="w-5 h-5 mr-2" />
                {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
              </Button>
            </div>
          </>
        )}

        {status === "approved" && (
          <div className="bg-green-50 rounded-xl p-4 mb-8">
            <h3 className="font-medium text-green-700 mb-2">Próximos pasos:</h3>
            <ul className="text-sm text-green-600 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Configura tu disponibilidad horaria
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Activa tu estado &quot;Disponible&quot;
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Comienza a recibir solicitudes
              </li>
            </ul>
          </div>
        )}

        {status === "rejected" && rejectionReason && (
          <div className="bg-red-50 rounded-xl p-4 mb-8 text-left">
            <h3 className="font-medium text-red-700 mb-2">Motivo:</h3>
            <p className="text-sm text-red-600">{rejectionReason}</p>
          </div>
        )}

        {/* More Info Needed - Document Resubmission */}
        {status === "more_info_needed" && !submitSuccess && (
          <div className="bg-orange-50 rounded-xl p-4 mb-6 text-left" data-testid="more-info-needed-section">
            <h3 className="font-medium text-orange-700 mb-3">Documentos requeridos:</h3>

            <div className="space-y-4">
              {missingDocuments.map((docType) => (
                <div key={docType} className="bg-white rounded-lg p-3 border border-orange-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {DOCUMENT_TYPE_LABELS[docType] || docType}
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileChange(docType, e.target.files)}
                        disabled={isSubmitting}
                        data-testid={`file-input-${docType}`}
                      />
                      <div className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg transition-colors ${
                        documentFiles[docType]?.length
                          ? "border-green-300 bg-green-50 text-green-700"
                          : "border-gray-300 hover:border-orange-400 text-gray-600 hover:text-orange-600"
                      }`}>
                        {documentFiles[docType]?.length ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">{documentFiles[docType].length} archivo(s)</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span className="text-sm">Seleccionar archivo</span>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {submitError && (
              <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            <Button
              onClick={handleResubmitDocuments}
              disabled={isSubmitting || Object.keys(documentFiles).length === 0}
              className="w-full mt-4 h-12 rounded-xl font-medium bg-orange-500 hover:bg-orange-600"
              data-testid="btn-submit-documents"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Enviar documentos
                </>
              )}
            </Button>
          </div>
        )}

        {/* Success message after resubmission */}
        {submitSuccess && (
          <div className="bg-green-50 rounded-xl p-4 mb-6 text-center" data-testid="submit-success">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-medium text-green-700 mb-2">¡Documentos enviados!</h3>
            <p className="text-sm text-green-600">
              Tus documentos han sido recibidos. Te notificaremos cuando sean revisados.
            </p>
          </div>
        )}

        {/* Action Button */}
        {config.showAction && config.actionHref && (
          <Button
            asChild
            className={`w-full h-12 rounded-xl font-medium ${
              status === "approved"
                ? "bg-green-600 hover:bg-green-700"
                : status === "rejected"
                  ? "bg-gray-600 hover:bg-gray-700"
                  : "bg-orange-500 hover:bg-orange-600"
            }`}
            data-testid={`btn-action-${status}`}
          >
            <Link href={config.actionHref}>
              {config.actionLabel}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        )}

        {/* Help Link */}
        <div className="mt-6">
          <a
            href="mailto:soporte@nitoagua.cl"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <HelpCircle className="w-4 h-4" />
            ¿Necesitas ayuda? Contáctanos
          </a>
        </div>
      </div>
    </div>
  );
}

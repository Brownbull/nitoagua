"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Car,
  FileText,
  Shield,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Info,
  IdCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "./progress-indicator";
import {
  DOCUMENT_LABELS,
  REQUIRED_DOCUMENTS,
  OPTIONAL_DOCUMENTS,
  type DocumentType,
} from "@/lib/validations/provider-registration";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface UploadedFile {
  name: string;
  path: string;
  size: number;
}

interface DocumentSection {
  type: DocumentType;
  files: UploadedFile[];
  isUploading: boolean;
  error: string | null;
}

// Document configuration with icons and descriptions (per UX mockup Section 13.3)
const DOCUMENT_CONFIG: Record<
  DocumentType,
  {
    icon: React.ElementType;
    description: string;
    optional?: boolean;
  }
> = {
  cedula: {
    icon: CreditCard,
    description: "Frente y reverso",
  },
  licencia_conducir: {
    icon: IdCard,
    description: "Requerido si usas vehículo motorizado",
  },
  vehiculo: {
    icon: Car,
    description: "Exterior e interior del vehículo",
  },
  permiso_sanitario: {
    icon: Shield,
    description: "Opcional - mejora tu perfil",
    optional: true,
  },
  certificacion: {
    icon: FileText,
    description: "Opcional - mejora tu perfil",
    optional: true,
  },
};

export function DocumentUpload({ userId }: { userId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<Record<DocumentType, DocumentSection>>({
    cedula: { type: "cedula", files: [], isUploading: false, error: null },
    licencia_conducir: { type: "licencia_conducir", files: [], isUploading: false, error: null },
    vehiculo: { type: "vehiculo", files: [], isUploading: false, error: null },
    permiso_sanitario: { type: "permiso_sanitario", files: [], isUploading: false, error: null },
    certificacion: { type: "certificacion", files: [], isUploading: false, error: null },
  });
  const [globalError, setGlobalError] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<DocumentType, HTMLInputElement | null>>({
    cedula: null,
    licencia_conducir: null,
    vehiculo: null,
    permiso_sanitario: null,
    certificacion: null,
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nitoagua_provider_onboarding");
      if (saved) {
        const { data } = JSON.parse(saved);
        if (data.documents) {
          const restored: Record<DocumentType, DocumentSection> = {
            cedula: { type: "cedula", files: [], isUploading: false, error: null },
            licencia_conducir: { type: "licencia_conducir", files: [], isUploading: false, error: null },
            vehiculo: { type: "vehiculo", files: [], isUploading: false, error: null },
            permiso_sanitario: { type: "permiso_sanitario", files: [], isUploading: false, error: null },
            certificacion: { type: "certificacion", files: [], isUploading: false, error: null },
          };

          Object.entries(data.documents).forEach(([type, paths]) => {
            if (Array.isArray(paths) && paths.length > 0 && type in restored) {
              restored[type as DocumentType].files = (paths as string[]).map((path, i) => ({
                name: `Archivo ${i + 1}`,
                path,
                size: 0,
              }));
            }
          });

          setDocuments(restored);
        }
      }
    } catch {
      // Ignore errors
    }
  }, []);

  const handleFileUpload = useCallback(
    async (type: DocumentType, files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0];
      const maxSize = 10 * 1024 * 1024; // 10MB

      // Validate file
      if (file.size > maxSize) {
        setDocuments((prev) => ({
          ...prev,
          [type]: { ...prev[type], error: "El archivo es muy grande (máx. 10MB)" },
        }));
        return;
      }

      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        setDocuments((prev) => ({
          ...prev,
          [type]: { ...prev[type], error: "Formato no soportado. Usa JPG, PNG o PDF" },
        }));
        return;
      }

      // Start upload
      setDocuments((prev) => ({
        ...prev,
        [type]: { ...prev[type], isUploading: true, error: null },
      }));

      try {
        const supabase = createClient();
        const timestamp = Date.now();
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${userId}/${type}_${timestamp}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("provider-documents")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        // Add to files list
        setDocuments((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            files: [
              ...prev[type].files,
              { name: file.name, path, size: file.size },
            ],
            isUploading: false,
            error: null,
          },
        }));
      } catch (error) {
        console.error(`[Upload] Error uploading ${type}:`, error);
        setDocuments((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            isUploading: false,
            error: "Error al subir el archivo. Intenta de nuevo.",
          },
        }));
      }
    },
    [userId]
  );

  const triggerFileInput = (type: DocumentType) => {
    fileInputRefs.current[type]?.click();
  };

  const validateAndSubmit = async () => {
    setGlobalError(null);

    // Validate required documents
    for (const type of REQUIRED_DOCUMENTS) {
      if (documents[type].files.length === 0) {
        setGlobalError(`Falta subir: ${DOCUMENT_LABELS[type]}`);
        return;
      }
    }

    setIsSubmitting(true);

    // Save to localStorage
    try {
      const existing = localStorage.getItem("nitoagua_provider_onboarding");
      const progress = existing ? JSON.parse(existing) : { currentStep: 2, data: {} };
      progress.data = {
        ...progress.data,
        documents: {
          cedula: documents.cedula.files.map((f) => f.path),
          licencia_conducir: documents.licencia_conducir.files.map((f) => f.path),
          vehiculo: documents.vehiculo.files.map((f) => f.path),
          permiso_sanitario: documents.permiso_sanitario.files.map((f) => f.path),
          certificacion: documents.certificacion.files.map((f) => f.path),
        },
      };
      progress.currentStep = 3;
      localStorage.setItem("nitoagua_provider_onboarding", JSON.stringify(progress));
    } catch {
      // Ignore errors
    }

    // Go to step 3: Vehicle
    router.push("/provider/onboarding/vehicle");
  };

  const handleBack = () => {
    router.push("/provider/onboarding/personal");
  };

  const isComplete = REQUIRED_DOCUMENTS.every((type) => documents[type].files.length > 0);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header with gradient */}
      <div
        className="px-5 pt-4 pb-4"
        style={{
          background: "linear-gradient(180deg, rgba(254, 215, 170, 0.5) 0%, white 100%)",
        }}
      >
        {/* Step 2 of 6: Documents */}
        <ProgressIndicator currentStep={2} totalSteps={6} onBack={handleBack} />

        <h1 className="text-2xl font-bold text-gray-900 mt-4">Documentos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Sube fotos claras de tus documentos. Serán revisados por nuestro equipo.
        </p>
      </div>

      {/* Document list */}
      <div className="flex-1 px-5 py-4 overflow-y-auto">
        <div className="space-y-2">
          {(["cedula", "licencia_conducir", "vehiculo", "permiso_sanitario"] as DocumentType[]).map(
            (type) => {
              const section = documents[type];
              const config = DOCUMENT_CONFIG[type];
              const hasFiles = section.files.length > 0;
              const isOptional = config.optional;
              const Icon = config.icon;

              return (
                <div key={type}>
                  {/* Hidden file input */}
                  <input
                    ref={(el) => { fileInputRefs.current[type] = el; }}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => handleFileUpload(type, e.target.files)}
                    data-testid={`upload-${type}`}
                  />

                  {/* Document Card - Mockup Style */}
                  <div
                    className={cn(
                      "rounded-xl p-4",
                      hasFiles
                        ? "bg-gray-50 border border-green-500"
                        : isOptional
                          ? "bg-white border border-dashed border-gray-200"
                          : "bg-white border border-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div
                        className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                          hasFiles
                            ? "bg-green-100"
                            : isOptional
                              ? "bg-gray-50"
                              : "bg-gray-100"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-6 h-6",
                            hasFiles
                              ? "text-green-600"
                              : isOptional
                                ? "text-gray-400"
                                : "text-gray-500"
                          )}
                        />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900">
                          {DOCUMENT_LABELS[type]}
                        </div>
                        <div
                          className={cn(
                            "text-xs",
                            hasFiles ? "text-green-600" : isOptional ? "text-gray-400" : "text-gray-500"
                          )}
                        >
                          {hasFiles ? "✓ Subido" : config.description}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={() => triggerFileInput(type)}
                        disabled={section.isUploading}
                        className={cn(
                          "text-xs font-medium",
                          section.isUploading
                            ? "text-gray-400"
                            : hasFiles
                              ? "text-orange-500"
                              : isOptional
                                ? "text-gray-400"
                                : "text-orange-500"
                        )}
                      >
                        {section.isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : hasFiles ? (
                          "Cambiar"
                        ) : (
                          "Subir"
                        )}
                      </button>
                    </div>

                    {/* Error */}
                    {section.error && (
                      <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {section.error}
                      </p>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* Info box */}
        <div className="mt-5 bg-orange-50 border border-orange-100 rounded-xl p-4">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-orange-600 mb-1">
                Documentos seguros
              </div>
              <div className="text-xs text-gray-600 leading-relaxed">
                Tus documentos están protegidos y solo serán revisados por nuestro
                equipo de verificación.
              </div>
            </div>
          </div>
        </div>

        {/* Global Error */}
        {globalError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{globalError}</p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="flex-1 h-12 rounded-xl"
            data-testid="back-button"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Atrás
          </Button>
          <Button
            type="button"
            onClick={validateAndSubmit}
            disabled={isSubmitting || !isComplete}
            className={cn(
              "flex-1 h-12 font-medium rounded-xl",
              isComplete
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-gray-200 text-gray-500"
            )}
            data-testid="next-button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

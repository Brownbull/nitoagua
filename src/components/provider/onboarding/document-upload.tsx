"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  X,
  FileImage,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProgressIndicator } from "./progress-indicator";
import {
  DOCUMENT_LABELS,
  REQUIRED_DOCUMENTS,
  VEHICLE_CAPACITIES,
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

export function DocumentUpload({ userId }: { userId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicleCapacity, setVehicleCapacity] = useState<number | undefined>();
  const [documents, setDocuments] = useState<Record<DocumentType, DocumentSection>>({
    cedula: { type: "cedula", files: [], isUploading: false, error: null },
    permiso_sanitario: { type: "permiso_sanitario", files: [], isUploading: false, error: null },
    vehiculo: { type: "vehiculo", files: [], isUploading: false, error: null },
    certificacion: { type: "certificacion", files: [], isUploading: false, error: null },
  });
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nitoagua_provider_onboarding");
      if (saved) {
        const { data } = JSON.parse(saved);
        if (data.vehicleCapacity) {
          setVehicleCapacity(data.vehicleCapacity);
        }
        if (data.documents) {
          // Restore document paths from saved data
          const restored: Record<DocumentType, DocumentSection> = {
            cedula: { type: "cedula", files: [], isUploading: false, error: null },
            permiso_sanitario: { type: "permiso_sanitario", files: [], isUploading: false, error: null },
            vehiculo: { type: "vehiculo", files: [], isUploading: false, error: null },
            certificacion: { type: "certificacion", files: [], isUploading: false, error: null },
          };

          Object.entries(data.documents).forEach(([type, paths]) => {
            if (Array.isArray(paths) && paths.length > 0) {
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

  const removeFile = useCallback(
    async (type: DocumentType, path: string) => {
      try {
        const supabase = createClient();
        await supabase.storage.from("provider-documents").remove([path]);

        setDocuments((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            files: prev[type].files.filter((f) => f.path !== path),
          },
        }));
      } catch (error) {
        console.error(`[Upload] Error removing file:`, error);
      }
    },
    []
  );

  const validateAndSubmit = async () => {
    setGlobalError(null);

    // Validate required documents
    for (const type of REQUIRED_DOCUMENTS) {
      if (documents[type].files.length === 0) {
        setGlobalError(`Falta subir: ${DOCUMENT_LABELS[type]}`);
        return;
      }
    }

    // Validate vehicle capacity
    if (!vehicleCapacity) {
      setGlobalError("Selecciona la capacidad de tu vehículo");
      return;
    }

    setIsSubmitting(true);

    // Save to localStorage
    try {
      const existing = localStorage.getItem("nitoagua_provider_onboarding");
      const progress = existing ? JSON.parse(existing) : { currentStep: 4, data: {} };
      progress.data = {
        ...progress.data,
        vehicleCapacity,
        documents: {
          cedula: documents.cedula.files.map((f) => f.path),
          permiso_sanitario: documents.permiso_sanitario.files.map((f) => f.path),
          vehiculo: documents.vehiculo.files.map((f) => f.path),
          certificacion: documents.certificacion.files.map((f) => f.path),
        },
      };
      progress.currentStep = 5;
      localStorage.setItem("nitoagua_provider_onboarding", JSON.stringify(progress));
    } catch {
      // Ignore errors
    }

    router.push("/provider/onboarding/bank");
  };

  const handleBack = () => {
    router.push("/provider/onboarding/areas");
  };

  const isComplete =
    REQUIRED_DOCUMENTS.every((type) => documents[type].files.length > 0) &&
    vehicleCapacity !== undefined;

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <ProgressIndicator currentStep={4} totalSteps={6} />

      <div className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Documentos</h1>
          <p className="text-gray-600 text-sm mb-6">
            Sube tus documentos para verificación. Archivos JPG, PNG o PDF (máx.
            10MB)
          </p>

          <div className="space-y-6">
            {/* Document Upload Sections */}
            {(["cedula", "permiso_sanitario", "vehiculo", "certificacion"] as DocumentType[]).map(
              (type) => {
                const section = documents[type];
                const isRequired = REQUIRED_DOCUMENTS.includes(type);
                const hasFiles = section.files.length > 0;

                return (
                  <div key={type} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {hasFiles ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <FileImage className="w-4 h-4 text-gray-500" />
                      )}
                      {DOCUMENT_LABELS[type]}
                      {isRequired && !hasFiles && (
                        <span className="text-red-500">*</span>
                      )}
                    </Label>

                    {/* Upload Area */}
                    <label
                      className={cn(
                        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
                        section.isUploading
                          ? "border-orange-300 bg-orange-50"
                          : hasFiles
                            ? "border-green-300 bg-green-50 hover:bg-green-100"
                            : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                      )}
                    >
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => handleFileUpload(type, e.target.files)}
                        disabled={section.isUploading}
                        data-testid={`upload-${type}`}
                      />
                      {section.isUploading ? (
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">
                            {hasFiles ? "Agregar otro archivo" : "Toca para subir"}
                          </span>
                        </>
                      )}
                    </label>

                    {/* Uploaded Files */}
                    {section.files.length > 0 && (
                      <div className="space-y-2">
                        {section.files.map((file) => (
                          <div
                            key={file.path}
                            className="flex items-center justify-between p-2 bg-white border rounded-lg"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileImage className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-700 truncate">
                                {file.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(type, file.path)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Error */}
                    {section.error && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {section.error}
                      </p>
                    )}
                  </div>
                );
              }
            )}

            {/* Vehicle Capacity */}
            <div className="space-y-2">
              <Label>Capacidad del vehículo *</Label>
              <Select
                value={vehicleCapacity?.toString()}
                onValueChange={(v) => setVehicleCapacity(Number(v))}
              >
                <SelectTrigger className="h-12" data-testid="vehicle-capacity">
                  <SelectValue placeholder="Selecciona capacidad" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_CAPACITIES.map((cap) => (
                    <SelectItem key={cap.value} value={cap.value.toString()}>
                      {cap.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl"
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

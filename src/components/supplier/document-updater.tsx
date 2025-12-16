"use client";

import { useState, useCallback } from "react";
import {
  X,
  Upload,
  Loader2,
  AlertCircle,
  FileImage,
  Check,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { type ProviderDocument } from "@/lib/types/provider-documents";
import { updateDocument } from "@/lib/actions/provider-documents";
import { DOCUMENT_LABELS, type DocumentType } from "@/lib/validations/provider-registration";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface DocumentUpdaterProps {
  document: ProviderDocument;
  onClose: () => void;
  onUpdated: () => void;
}

// Document types that support expiration dates
const EXPIRING_DOCUMENT_TYPES: DocumentType[] = ["cedula", "permiso_sanitario", "certificacion"];

export function DocumentUpdater({ document, onClose, onUpdated }: DocumentUpdaterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string>(
    document.expires_at ? document.expires_at.split("T")[0] : ""
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const label = DOCUMENT_LABELS[document.type] || document.type;
  const supportsExpiry = EXPIRING_DOCUMENT_TYPES.includes(document.type);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (selectedFile.size > maxSize) {
      setUploadError("El archivo es muy grande (máx. 10MB)");
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadError("Formato no soportado. Usa JPG, PNG o PDF");
      return;
    }

    setUploadError(null);
    setFile(selectedFile);

    // Generate preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  }, []);

  const handleUpdate = useCallback(async () => {
    if (!file) {
      setUploadError("Selecciona un archivo");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No autenticado");
      }

      // Upload file to Storage
      const timestamp = Date.now();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${document.type}_${timestamp}.${ext}`;

      setUploadProgress(25);

      const { error: uploadError } = await supabase.storage
        .from("provider-documents")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      setUploadProgress(75);

      // Update document record
      const result = await updateDocument(
        document.id,
        path,
        file.name,
        expiresAt || undefined
      );

      setUploadProgress(100);

      if (!result.success) {
        throw new Error(result.error || "Error al actualizar documento");
      }

      // Success - close and notify parent
      onUpdated();
    } catch (error) {
      console.error("[Document Updater] Error:", error);
      setUploadError(
        error instanceof Error ? error.message : "Error al subir archivo"
      );
    } finally {
      setIsUploading(false);
    }
  }, [file, document.id, document.type, expiresAt, onUpdated]);

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadError(null);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="document-updater-modal">
        <DialogHeader>
          <DialogTitle>Actualizar {label}</DialogTitle>
          <DialogDescription>
            Sube un nuevo archivo para reemplazar el documento actual. Será
            revisado por el equipo antes de verificarse.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload Area */}
          {!file ? (
            <label
              className={cn(
                "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
                uploadError
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              )}
            >
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleFileSelect}
                disabled={isUploading}
                data-testid="file-input"
              />
              <Upload className="w-10 h-10 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Toca para seleccionar archivo</span>
              <span className="text-xs text-gray-400 mt-1">JPG, PNG o PDF (máx. 10MB)</span>
            </label>
          ) : (
            <div className="border rounded-xl p-4 bg-gray-50">
              <div className="flex items-center gap-3">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <FileImage className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Expiration Date (for applicable document types) */}
          {supportsExpiry && (
            <div className="space-y-2">
              <Label htmlFor="expires-at" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha de vencimiento (opcional)
              </Label>
              <Input
                id="expires-at"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                disabled={isUploading}
                data-testid="expires-at-input"
              />
              <p className="text-xs text-gray-500">
                Te notificaremos 30 días antes del vencimiento
              </p>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subiendo...</span>
                <span className="text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!file || isUploading}
            className="bg-orange-500 hover:bg-orange-600 gap-2"
            data-testid="submit-update"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Actualizar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

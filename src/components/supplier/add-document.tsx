"use client";

import { useState, useCallback } from "react";
import {
  Plus,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addDocument } from "@/lib/actions/provider-documents";
import {
  DOCUMENT_LABELS,
  OPTIONAL_DOCUMENTS,
  type DocumentType,
} from "@/lib/validations/provider-registration";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface AddDocumentProps {
  existingDocumentTypes: DocumentType[];
  userId: string;
  onDocumentAdded: () => void;
}

export function AddDocument({
  existingDocumentTypes,
  userId,
  onDocumentAdded,
}: AddDocumentProps) {
  const [open, setOpen] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Get available document types (optional ones that don't exist yet)
  const availableTypes = OPTIONAL_DOCUMENTS.filter(
    (type) => !existingDocumentTypes.includes(type)
  );

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

  const handleAdd = useCallback(async () => {
    if (!file || !documentType) {
      setUploadError("Selecciona un tipo de documento y un archivo");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const supabase = createClient();

      // Upload file to Storage
      const timestamp = Date.now();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/${documentType}_${timestamp}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("provider-documents")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Add document record
      const result = await addDocument(
        documentType,
        path,
        file.name,
        expiresAt || undefined
      );

      if (!result.success) {
        throw new Error(result.error || "Error al agregar documento");
      }

      // Success - close and notify parent
      setOpen(false);
      resetForm();
      onDocumentAdded();
    } catch (error) {
      console.error("[Add Document] Error:", error);
      setUploadError(
        error instanceof Error ? error.message : "Error al subir archivo"
      );
    } finally {
      setIsUploading(false);
    }
  }, [file, documentType, userId, expiresAt, onDocumentAdded]);

  const resetForm = () => {
    setDocumentType(null);
    setFile(null);
    setPreviewUrl(null);
    setExpiresAt("");
    setUploadError(null);
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadError(null);
  };

  // If no available document types, don't show the button
  if (availableTypes.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full border-dashed border-2 h-14 gap-2"
          data-testid="add-document-button"
        >
          <Plus className="w-5 h-5" />
          Agregar Certificación
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md" data-testid="add-document-modal">
        <DialogHeader>
          <DialogTitle>Agregar Documento</DialogTitle>
          <DialogDescription>
            Agrega documentos opcionales como certificaciones para mejorar tu perfil.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Document Type Selector */}
          <div className="space-y-2">
            <Label>Tipo de documento</Label>
            <Select
              value={documentType || undefined}
              onValueChange={(value) => setDocumentType(value as DocumentType)}
              disabled={isUploading}
            >
              <SelectTrigger data-testid="document-type-select">
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {DOCUMENT_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                data-testid="add-file-input"
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

          {/* Expiration Date */}
          <div className="space-y-2">
            <Label htmlFor="add-expires-at" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Fecha de vencimiento (opcional)
            </Label>
            <Input
              id="add-expires-at"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              disabled={isUploading}
              data-testid="add-expires-at-input"
            />
            <p className="text-xs text-gray-500">
              Te notificaremos 30 días antes del vencimiento
            </p>
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!file || !documentType || isUploading}
            className="bg-orange-500 hover:bg-orange-600 gap-2"
            data-testid="submit-add-document"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Agregar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

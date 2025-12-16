"use client";

import { useState, useEffect } from "react";
import { X, Download, ExternalLink, Loader2, FileImage, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type ProviderDocument } from "@/lib/types/provider-documents";
import { getDocumentViewUrl } from "@/lib/actions/provider-documents";
import { DOCUMENT_LABELS } from "@/lib/validations/provider-registration";

interface DocumentViewerProps {
  document: ProviderDocument;
  onClose: () => void;
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [url, setUrl] = useState<string | null>(document.signedUrl || null);
  const [loading, setLoading] = useState(!document.signedUrl);
  const [error, setError] = useState<string | null>(null);

  const label = DOCUMENT_LABELS[document.type] || document.type;
  const isPdf = document.storage_path.toLowerCase().endsWith(".pdf");

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    // If we don't have a URL, fetch one
    if (!url) {
      setLoading(true);
      getDocumentViewUrl(document.id)
        .then((result) => {
          if (result.error) {
            setError(result.error);
          } else if (result.url) {
            setUrl(result.url);
          }
        })
        .catch((err) => {
          console.error("[Document Viewer] Error:", err);
          setError("Error al cargar documento");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [document.id, url]);

  const handleDownload = () => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  const handleOpenInNewTab = () => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col" data-testid="document-viewer-modal">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {isPdf ? <FileText className="w-5 h-5" /> : <FileImage className="w-5 h-5" />}
            {label}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <X className="w-12 h-12 text-red-400 mb-2" />
              <p className="text-red-600">{error}</p>
              <Button variant="outline" onClick={onClose} className="mt-4">
                Cerrar
              </Button>
            </div>
          )}

          {!loading && !error && url && (
            <div className="h-full">
              {isPdf ? (
                <iframe
                  src={url}
                  className="w-full h-[60vh] rounded-lg border"
                  title={label}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                  <img
                    src={url}
                    alt={label}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                    data-testid="document-image"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {!loading && !error && url && (
          <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={handleOpenInNewTab} className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Abrir en pestaña
            </Button>
            <Button onClick={handleDownload} className="gap-2 bg-orange-500 hover:bg-orange-600">
              <Download className="w-4 h-4" />
              Descargar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

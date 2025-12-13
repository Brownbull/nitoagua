"use client";

import { useState } from "react";
import { FileText, Eye, Download, ZoomIn, ZoomOut, X, Check, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ProviderDocument = {
  id: string;
  type: string;
  storage_path: string;
  original_filename: string | null;
  uploaded_at: string | null;
  verified_at: string | null;
};

interface DocumentViewerProps {
  documents: ProviderDocument[];
  providerId: string;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  cedula: "Cedula de Identidad",
  licencia: "Licencia de Conducir",
  permiso_sanitario: "Permiso Sanitario",
  certificacion: "Certificacion",
  vehiculo: "Fotos Vehiculo",
};

function getDocumentStatus(doc: ProviderDocument) {
  if (doc.verified_at) {
    return {
      icon: Check,
      label: "Verificado",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    };
  }
  return {
    icon: AlertCircle,
    label: "Revisar",
    bgColor: "bg-amber-100",
    iconColor: "text-amber-600",
  };
}

export function DocumentViewer({ documents, providerId: _providerId }: DocumentViewerProps) {
  const [selectedDoc, setSelectedDoc] = useState<ProviderDocument | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openDocument(doc: ProviderDocument) {
    setLoading(true);
    setError(null);
    setSelectedDoc(doc);
    setZoomLevel(100);

    try {
      const supabase = createClient();

      // Create signed URL for the document
      const { data, error: signedUrlError } = await supabase.storage
        .from("provider-documents")
        .createSignedUrl(doc.storage_path, 3600); // 1 hour expiration

      if (signedUrlError || !data?.signedUrl) {
        console.error("[DOCUMENT VIEWER] Error getting signed URL:", signedUrlError);
        setError("No se pudo cargar el documento");
        setImageUrl(null);
      } else {
        setImageUrl(data.signedUrl);
      }
    } catch (err) {
      console.error("[DOCUMENT VIEWER] Unexpected error:", err);
      setError("Error inesperado al cargar el documento");
      setImageUrl(null);
    } finally {
      setLoading(false);
    }
  }

  async function downloadDocument(doc: ProviderDocument) {
    try {
      const supabase = createClient();

      const { data, error: signedUrlError } = await supabase.storage
        .from("provider-documents")
        .createSignedUrl(doc.storage_path, 300); // 5 min expiration for download

      if (signedUrlError || !data?.signedUrl) {
        console.error("[DOCUMENT VIEWER] Error getting download URL:", signedUrlError);
        return;
      }

      // Trigger download
      const link = document.createElement("a");
      link.href = data.signedUrl;
      link.download = doc.original_filename || `document-${doc.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("[DOCUMENT VIEWER] Download error:", err);
    }
  }

  function closeViewer() {
    setSelectedDoc(null);
    setImageUrl(null);
    setError(null);
    setZoomLevel(100);
  }

  function handleZoomIn() {
    setZoomLevel((prev) => Math.min(prev + 50, 300));
  }

  function handleZoomOut() {
    setZoomLevel((prev) => Math.max(prev - 50, 50));
  }

  return (
    <>
      {/* Document List */}
      <div className="space-y-2" data-testid="document-list">
        {documents.map((doc) => {
          const status = getDocumentStatus(doc);
          const StatusIcon = status.icon;

          return (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
              data-testid={`document-item-${doc.type}`}
            >
              {/* Status indicator */}
              <div className={`w-9 h-9 ${status.bgColor} rounded-lg flex items-center justify-center`}>
                <StatusIcon className={`w-4 h-4 ${status.iconColor}`} />
              </div>

              {/* Document info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {DOCUMENT_TYPE_LABELS[doc.type] || doc.type}
                </p>
                <p className="text-xs text-gray-500">{status.label}</p>
              </div>

              {/* Actions */}
              <button
                onClick={() => openDocument(doc)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Ver documento"
                data-testid={`view-document-${doc.type}`}
              >
                <Eye className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => downloadDocument(doc)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Descargar documento"
                data-testid={`download-document-${doc.type}`}
              >
                <Download className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Full-screen Document Viewer Modal */}
      {selectedDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col"
          data-testid="document-viewer-modal"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 bg-black/50">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">
                {DOCUMENT_TYPE_LABELS[selectedDoc.type] || selectedDoc.type}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <button
                onClick={handleZoomOut}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                disabled={zoomLevel <= 50}
                data-testid="zoom-out"
              >
                <ZoomOut className="w-5 h-5 text-white" />
              </button>
              <span className="text-white text-sm min-w-[60px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                disabled={zoomLevel >= 300}
                data-testid="zoom-in"
              >
                <ZoomIn className="w-5 h-5 text-white" />
              </button>

              {/* Download */}
              <button
                onClick={() => downloadDocument(selectedDoc)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors ml-4"
                data-testid="modal-download"
              >
                <Download className="w-5 h-5 text-white" />
              </button>

              {/* Close */}
              <button
                onClick={closeViewer}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                data-testid="close-viewer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Document Content */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            {loading && (
              <div className="text-white">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p>Cargando documento...</p>
              </div>
            )}

            {error && (
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                <p className="text-white">{error}</p>
                <p className="text-gray-400 text-sm mt-1">
                  El bucket de almacenamiento puede no estar configurado
                </p>
              </div>
            )}

            {imageUrl && !loading && !error && (
              <div
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transition: "transform 0.2s ease",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={DOCUMENT_TYPE_LABELS[selectedDoc.type] || selectedDoc.type}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  data-testid="document-image"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

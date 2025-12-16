"use client";

import { useState } from "react";
import {
  FileText,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type ProviderDocument } from "@/lib/types/provider-documents";
import { getExpirationStatus } from "@/lib/utils/document-expiration";
import { DOCUMENT_LABELS, type DocumentType } from "@/lib/validations/provider-registration";
import { cn } from "@/lib/utils";
import { DocumentViewer } from "./document-viewer";
import { DocumentUpdater } from "./document-updater";

interface DocumentListProps {
  documents: ProviderDocument[];
  onDocumentUpdated?: () => void;
}

// Document type icons
const DOCUMENT_ICONS: Record<DocumentType, string> = {
  cedula: "🪪",
  licencia_conducir: "🪪",
  vehiculo: "🚛",
  permiso_sanitario: "📋",
  certificacion: "📜",
};

export function DocumentList({ documents, onDocumentUpdated }: DocumentListProps) {
  const [viewingDoc, setViewingDoc] = useState<ProviderDocument | null>(null);
  const [updatingDoc, setUpdatingDoc] = useState<ProviderDocument | null>(null);

  // Group documents by type (latest first)
  const latestByType = documents.reduce((acc, doc) => {
    if (!acc[doc.type] || new Date(doc.uploaded_at || 0) > new Date(acc[doc.type].uploaded_at || 0)) {
      acc[doc.type] = doc;
    }
    return acc;
  }, {} as Record<string, ProviderDocument>);

  const documentTypes: DocumentType[] = ["cedula", "licencia_conducir", "vehiculo", "permiso_sanitario", "certificacion"];

  return (
    <>
      <div className="space-y-4">
        {documentTypes.map((type) => {
          const doc = latestByType[type];
          if (!doc) return null;

          const expirationStatus = getExpirationStatus(doc.expires_at);
          const isVerified = doc.verified_at !== null;

          return (
            <DocumentCard
              key={doc.id}
              document={doc}
              expirationStatus={expirationStatus}
              isVerified={isVerified}
              onView={() => setViewingDoc(doc)}
              onUpdate={() => setUpdatingDoc(doc)}
            />
          );
        })}
      </div>

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <DocumentViewer
          document={viewingDoc}
          onClose={() => setViewingDoc(null)}
        />
      )}

      {/* Document Updater Modal */}
      {updatingDoc && (
        <DocumentUpdater
          document={updatingDoc}
          onClose={() => setUpdatingDoc(null)}
          onUpdated={() => {
            setUpdatingDoc(null);
            onDocumentUpdated?.();
          }}
        />
      )}
    </>
  );
}

interface DocumentCardProps {
  document: ProviderDocument;
  expirationStatus: ReturnType<typeof getExpirationStatus>;
  isVerified: boolean;
  onView: () => void;
  onUpdate: () => void;
}

function DocumentCard({
  document,
  expirationStatus,
  isVerified,
  onView,
  onUpdate,
}: DocumentCardProps) {
  const icon = DOCUMENT_ICONS[document.type] || "📄";
  const label = DOCUMENT_LABELS[document.type] || document.type;
  const uploadDate = document.uploaded_at
    ? new Date(document.uploaded_at).toLocaleDateString("es-CL", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  // Determine status badge
  const getStatusBadge = () => {
    if (!isVerified) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pendiente
        </Badge>
      );
    }

    if (expirationStatus.status === "expired") {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Vencido
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Verificado
      </Badge>
    );
  };

  // Expiration warning
  const getExpirationWarning = () => {
    if (expirationStatus.status === "expiring_soon" && expirationStatus.daysUntilExpiry !== undefined) {
      return (
        <div className="flex items-center gap-1 text-orange-600 text-sm mt-1">
          <AlertTriangle className="w-4 h-4" />
          <span>Vence en {expirationStatus.daysUntilExpiry} días</span>
        </div>
      );
    }

    if (expirationStatus.status === "expired") {
      return (
        <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
          <AlertTriangle className="w-4 h-4" />
          <span>Documento vencido - actualizar</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        "border rounded-xl p-4 bg-white transition-colors",
        expirationStatus.status === "expired" && "border-red-200 bg-red-50/50",
        expirationStatus.status === "expiring_soon" && "border-orange-200 bg-orange-50/50"
      )}
      data-testid={`document-card-${document.type}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <h3 className="font-medium text-gray-900">{label}</h3>
            {expirationStatus.status === "expiring_soon" && (
              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                ⚠️ Expira pronto
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-1">Subido: {uploadDate}</p>

          <div className="flex items-center gap-2 mt-2">
            {getStatusBadge()}
          </div>

          {getExpirationWarning()}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className="gap-1"
            data-testid={`view-${document.type}`}
          >
            <Eye className="w-4 h-4" />
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onUpdate}
            className={cn(
              "gap-1",
              (expirationStatus.status === "expired" || expirationStatus.status === "expiring_soon") &&
                "border-orange-300 text-orange-700 hover:bg-orange-50"
            )}
            data-testid={`update-${document.type}`}
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
        </div>
      </div>
    </div>
  );
}

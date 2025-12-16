"use client";

import { useRouter } from "next/navigation";
import { DocumentList } from "@/components/supplier/document-list";
import { AddDocument } from "@/components/supplier/add-document";
import { type ProviderDocument } from "@/lib/types/provider-documents";
import { type DocumentType } from "@/lib/validations/provider-registration";

interface DocumentsClientWrapperProps {
  documents: ProviderDocument[];
  existingTypes: DocumentType[];
  userId: string;
}

export function DocumentsClientWrapper({
  documents,
  existingTypes,
  userId,
}: DocumentsClientWrapperProps) {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6" data-testid="documents-container">
      <DocumentList documents={documents} onDocumentUpdated={handleRefresh} />

      {/* Add Document Button */}
      <AddDocument
        existingDocumentTypes={existingTypes}
        userId={userId}
        onDocumentAdded={handleRefresh}
      />
    </div>
  );
}

import { type DocumentType } from "@/lib/validations/provider-registration";

export interface ProviderDocument {
  id: string;
  type: DocumentType;
  storage_path: string;
  original_filename: string | null;
  uploaded_at: string | null;
  verified_at: string | null;
  verified_by: string | null;
  expires_at: string | null;
  signedUrl?: string;
}

export interface ProviderDocumentActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

export interface GetProviderDocumentsResult {
  documents: ProviderDocument[];
  error?: string;
}

export interface GetDocumentViewUrlResult {
  url?: string;
  error?: string;
}

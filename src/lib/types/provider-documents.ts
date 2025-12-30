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
  /** AC12.6.2.3: True when user needs to re-authenticate */
  requiresLogin?: boolean;
}

export interface GetProviderDocumentsResult {
  documents: ProviderDocument[];
  error?: string;
}

export interface GetDocumentViewUrlResult {
  url?: string;
  error?: string;
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { type DocumentType, DOCUMENT_LABELS } from "@/lib/validations/provider-registration";
import { getExpirationStatus } from "@/lib/utils/document-expiration";
import type { ProviderDocument, ProviderDocumentActionResult } from "@/lib/types/provider-documents";
import { createAuthError, AUTH_ERROR_MESSAGE } from "@/lib/types/action-result";

/**
 * Get all documents for the current provider with signed URLs
 */
export async function getProviderDocuments(): Promise<{
  documents: ProviderDocument[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // AC12.6.2.3: Return requiresLogin flag for auth failures
  if (userError || !user) {
    return { documents: [], error: AUTH_ERROR_MESSAGE };
  }

  const { data: documents, error: docsError } = await supabase
    .from("provider_documents")
    .select("*")
    .eq("provider_id", user.id)
    .order("uploaded_at", { ascending: false });

  if (docsError) {
    console.error("[Provider Documents] Error fetching documents:", docsError);
    return { documents: [], error: "Error al cargar documentos" };
  }

  if (!documents || documents.length === 0) {
    return { documents: [] };
  }

  // Get signed URLs for each document (1-hour expiry)
  const documentsWithUrls = await Promise.all(
    documents.map(async (doc) => {
      const { data: urlData } = await supabase.storage
        .from("provider-documents")
        .createSignedUrl(doc.storage_path, 3600);

      return {
        ...doc,
        type: doc.type as DocumentType,
        signedUrl: urlData?.signedUrl,
      };
    })
  );

  return { documents: documentsWithUrls };
}

/**
 * Get a signed URL for viewing a single document
 */
export async function getDocumentViewUrl(
  documentId: string
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // AC12.6.2.3: Return requiresLogin flag for auth failures
  if (userError || !user) {
    return { error: AUTH_ERROR_MESSAGE };
  }

  // Fetch document and verify ownership
  const { data: doc, error: docError } = await supabase
    .from("provider_documents")
    .select("storage_path, provider_id")
    .eq("id", documentId)
    .single();

  if (docError || !doc) {
    return { error: "Documento no encontrado" };
  }

  if (doc.provider_id !== user.id) {
    return { error: "No autorizado" };
  }

  // Generate signed URL (1-hour expiry for viewing)
  const { data: urlData, error: urlError } = await supabase.storage
    .from("provider-documents")
    .createSignedUrl(doc.storage_path, 3600);

  if (urlError || !urlData?.signedUrl) {
    console.error("[Provider Documents] Error generating signed URL:", urlError);
    return { error: "Error al generar enlace" };
  }

  return { url: urlData.signedUrl };
}

/**
 * Update an existing document (replace with new file)
 */
export async function updateDocument(
  documentId: string,
  newStoragePath: string,
  originalFilename: string,
  expiresAt?: string
): Promise<ProviderDocumentActionResult> {
  console.log("[Provider Documents] Updating document:", documentId);

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // AC12.6.2.3: Return requiresLogin flag for auth failures
  if (userError || !user) {
    return createAuthError();
  }

  // Fetch existing document and verify ownership
  const { data: existingDoc, error: docError } = await supabase
    .from("provider_documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (docError || !existingDoc) {
    return { success: false, error: "Documento no encontrado" };
  }

  if (existingDoc.provider_id !== user.id) {
    return { success: false, error: "No autorizado" };
  }

  const adminClient = createAdminClient();

  try {
    // Delete old file from storage
    const { error: deleteError } = await supabase.storage
      .from("provider-documents")
      .remove([existingDoc.storage_path]);

    if (deleteError) {
      console.warn("[Provider Documents] Error deleting old file:", deleteError);
      // Continue anyway - old file might be missing
    }

    // Update document record
    const { error: updateError } = await adminClient
      .from("provider_documents")
      .update({
        storage_path: newStoragePath,
        original_filename: originalFilename,
        uploaded_at: new Date().toISOString(),
        verified_at: null, // Needs re-verification
        verified_by: null,
        expires_at: expiresAt || null,
      })
      .eq("id", documentId);

    if (updateError) {
      console.error("[Provider Documents] Error updating document:", updateError);
      throw new Error("Error al actualizar documento");
    }

    // Create admin notification for document update
    await notifyAdminDocumentUpdate(user.id, existingDoc.type);

    console.log("[Provider Documents] Document updated successfully:", documentId);

    return { success: true };
  } catch (error) {
    console.error("[Provider Documents] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error inesperado",
    };
  }
}

/**
 * Add a new document (for optional documents not uploaded during registration)
 */
export async function addDocument(
  type: DocumentType,
  storagePath: string,
  originalFilename: string,
  expiresAt?: string
): Promise<ProviderDocumentActionResult> {
  console.log("[Provider Documents] Adding new document:", type);

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // AC12.6.2.3: Return requiresLogin flag for auth failures
  if (userError || !user) {
    return createAuthError();
  }

  // Verify user is an approved provider
  const { data: profile } = await supabase
    .from("profiles")
    .select("verification_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.verification_status !== "approved") {
    return { success: false, error: "Solo proveedores aprobados pueden agregar documentos" };
  }

  const adminClient = createAdminClient();

  try {
    const { error: insertError } = await adminClient
      .from("provider_documents")
      .insert({
        provider_id: user.id,
        type,
        storage_path: storagePath,
        original_filename: originalFilename,
        expires_at: expiresAt || null,
      });

    if (insertError) {
      console.error("[Provider Documents] Error inserting document:", insertError);
      throw new Error("Error al agregar documento");
    }

    // Create admin notification for new document
    await notifyAdminDocumentUpdate(user.id, type, true);

    console.log("[Provider Documents] Document added successfully:", type);

    return { success: true };
  } catch (error) {
    console.error("[Provider Documents] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error inesperado",
    };
  }
}

/**
 * Delete a document (only for optional documents)
 */
export async function deleteDocument(documentId: string): Promise<ProviderDocumentActionResult> {
  console.log("[Provider Documents] Deleting document:", documentId);

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // AC12.6.2.3: Return requiresLogin flag for auth failures
  if (userError || !user) {
    return createAuthError();
  }

  // Fetch document and verify ownership
  const { data: doc, error: docError } = await supabase
    .from("provider_documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (docError || !doc) {
    return { success: false, error: "Documento no encontrado" };
  }

  if (doc.provider_id !== user.id) {
    return { success: false, error: "No autorizado" };
  }

  // Only allow deleting optional documents (certificacion)
  if (doc.type !== "certificacion") {
    return { success: false, error: "No se puede eliminar un documento requerido" };
  }

  try {
    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from("provider-documents")
      .remove([doc.storage_path]);

    if (storageError) {
      console.warn("[Provider Documents] Error deleting file from storage:", storageError);
    }

    // Delete record from database
    const { error: deleteError } = await supabase
      .from("provider_documents")
      .delete()
      .eq("id", documentId);

    if (deleteError) {
      console.error("[Provider Documents] Error deleting document record:", deleteError);
      throw new Error("Error al eliminar documento");
    }

    console.log("[Provider Documents] Document deleted successfully:", documentId);

    return { success: true };
  } catch (error) {
    console.error("[Provider Documents] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error inesperado",
    };
  }
}

/**
 * Get documents that are expiring soon (within 30 days)
 */
export async function getExpiringDocuments(): Promise<{
  documents: ProviderDocument[];
  error?: string;
}> {
  const { documents, error } = await getProviderDocuments();

  if (error) {
    return { documents: [], error };
  }

  const expiringDocs = documents.filter((doc) => {
    const status = getExpirationStatus(doc.expires_at);
    return status.status === "expiring_soon" || status.status === "expired";
  });

  return { documents: expiringDocs };
}

/**
 * Notify admins of document update
 */
async function notifyAdminDocumentUpdate(
  providerId: string,
  documentType: string,
  isNew: boolean = false
): Promise<void> {
  const adminClient = createAdminClient();

  try {
    // Get provider name
    const { data: provider } = await adminClient
      .from("profiles")
      .select("name")
      .eq("id", providerId)
      .single();

    // Get admin users
    const { data: adminEmails } = await adminClient
      .from("admin_allowed_emails")
      .select("email");

    if (!adminEmails || adminEmails.length === 0) return;

    const { data: adminProfiles } = await adminClient
      .from("profiles")
      .select("id")
      .in("email", adminEmails.map((a) => a.email));

    if (!adminProfiles || adminProfiles.length === 0) return;

    const docLabel = DOCUMENT_LABELS[documentType as DocumentType] || documentType;
    const notificationType = isNew ? "provider_document_added" : "provider_document_updated";
    const title = isNew ? "Nuevo documento de proveedor" : "Documento actualizado";
    const message = isNew
      ? `${provider?.name || "Un proveedor"} ha agregado: ${docLabel}`
      : `${provider?.name || "Un proveedor"} ha actualizado: ${docLabel}`;

    const notificationRecords = adminProfiles.map((admin) => ({
      user_id: admin.id,
      type: notificationType,
      title,
      message,
      data: {
        provider_id: providerId,
        document_type: documentType,
        is_new: isNew,
      },
    }));

    await adminClient.from("notifications").insert(notificationRecords);
    console.log("[Provider Documents] Admin notifications created");
  } catch (error) {
    console.error("[Provider Documents] Error creating admin notifications:", error);
    // Don't throw - notification failure shouldn't break the main operation
  }
}

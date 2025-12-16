import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, FileText, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getProviderDocuments } from "@/lib/actions/provider-documents";
import { getExpirationStatus } from "@/lib/utils/document-expiration";
import { type DocumentType } from "@/lib/validations/provider-registration";
import { DocumentsClientWrapper } from "./client-wrapper";

export const metadata: Metadata = {
  title: "Mis Documentos - nitoagua",
  description: "Gestiona tus documentos de verificación",
};

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get profile to verify approved status
  const { data: profile } = await supabase
    .from("profiles")
    .select("verification_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.verification_status !== "approved") {
    redirect("/dashboard");
  }

  // Fetch documents
  const { documents, error } = await getProviderDocuments();

  // Check for expiring documents
  const expiringDocs = documents.filter((doc) => {
    const status = getExpirationStatus(doc.expires_at);
    return status.status === "expiring_soon" || status.status === "expired";
  });

  // Get existing document types for "Add Document" button
  const existingTypes = [...new Set(documents.map((d) => d.type))] as DocumentType[];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
            data-testid="back-to-dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Mis Documentos
            </h1>
            <p className="text-sm text-gray-500">
              Gestiona tus documentos de verificación
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4">
        {/* Expiration Warning */}
        {expiringDocs.length > 0 && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <span className="font-medium">
                {expiringDocs.length === 1
                  ? "Tienes 1 documento que requiere atención"
                  : `Tienes ${expiringDocs.length} documentos que requieren atención`}
              </span>
              <span className="block text-sm mt-1">
                Por favor actualiza los documentos marcados antes de su vencimiento.
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Document List */}
        <DocumentsClientWrapper
          documents={documents}
          existingTypes={existingTypes}
          userId={user.id}
        />
      </main>
    </div>
  );
}

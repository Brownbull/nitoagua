import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Phone, Mail, MapPin, Building2, FileText, Clock, Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import { DocumentViewer } from "@/components/admin/document-viewer";
import { VerificationActions } from "@/components/admin/verification-actions";

export const metadata = {
  title: "Revisar Solicitud - Admin nitoagua",
  description: "Revisar solicitud de proveedor",
};

type ProviderDocument = {
  id: string;
  type: string;
  storage_path: string;
  original_filename: string | null;
  uploaded_at: string | null;
  verified_at: string | null;
};

type ProviderDetail = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  verification_status: string | null;
  created_at: string | null;
  service_area: string | null;
  bank_name: string | null;
  bank_account: string | null;
  internal_notes: string | null;
  documents: ProviderDocument[];
};

async function getProviderApplication(id: string): Promise<ProviderDetail | null> {
  const adminClient = createAdminClient();

  // Fetch provider profile
  const { data: provider, error } = await adminClient
    .from("profiles")
    .select(`
      id,
      name,
      email,
      phone,
      verification_status,
      created_at,
      service_area,
      bank_name,
      bank_account,
      internal_notes
    `)
    .eq("id", id)
    .in("role", ["supplier", "provider"])
    .single();

  if (error || !provider) {
    console.error("[ADMIN] Error fetching provider:", error?.message);
    return null;
  }

  // Fetch documents
  const { data: documents, error: docsError } = await adminClient
    .from("provider_documents")
    .select("*")
    .eq("provider_id", id);

  if (docsError) {
    console.error("[ADMIN] Error fetching documents:", docsError.message);
  }

  return {
    ...provider,
    documents: documents || [],
  };
}

function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return "Fecha desconocida";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `Hace ${diffMins} minuto${diffMins !== 1 ? "s" : ""}`;
  }
  if (diffHours < 24) {
    return `Hace ${diffHours} hora${diffHours !== 1 ? "s" : ""}`;
  }
  if (diffDays === 1) {
    return "Hace 1 dia";
  }
  return `Hace ${diffDays} dias`;
}

function maskBankAccount(account: string | null): string {
  if (!account) return "No proporcionada";
  if (account.length <= 4) return account;
  return "****" + account.slice(-4);
}

function getStatusBadge(status: string | null) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-semibold">
          <span className="w-2 h-2 bg-yellow-500 rounded-full" />
          Pendiente
        </span>
      );
    case "more_info_needed":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-800 rounded-lg text-sm font-semibold">
          <AlertCircle className="w-4 h-4" />
          Mas Info Solicitada
        </span>
      );
    case "approved":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">
          <Check className="w-4 h-4" />
          Aprobado
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-800 rounded-lg text-sm font-semibold">
          Rechazado
        </span>
      );
    default:
      return null;
  }
}

export default async function VerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Require admin access
  const user = await requireAdmin();
  const { id } = await params;

  // Fetch provider application
  const provider = await getProviderApplication(id);

  if (!provider) {
    notFound();
  }

  console.log(`[ADMIN] Viewing application ${id} by ${user.email}`);

  const canTakeAction = provider.verification_status === "pending" || provider.verification_status === "more_info_needed";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-200 to-white px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/admin/verification"
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            data-testid="back-to-queue"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <span className="text-lg font-bold text-gray-700">nitoagua</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-7 h-7 text-gray-500" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-gray-900">{provider.name}</h1>
            <p className="text-gray-600 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Solicitud {formatTimeAgo(provider.created_at)}
            </p>
          </div>
          {getStatusBadge(provider.verification_status)}
        </div>
      </header>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Personal Info */}
        <section className="bg-white rounded-2xl p-4 shadow-sm" data-testid="personal-info-section">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Informacion Personal
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Telefono</span>
              <span className="ml-auto text-sm font-semibold text-gray-900">{provider.phone}</span>
            </div>
            {provider.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Email</span>
                <span className="ml-auto text-sm font-semibold text-gray-900">{provider.email}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Area de Servicio</span>
              <span className="ml-auto text-sm font-semibold text-gray-900">
                {provider.service_area || "No especificada"}
              </span>
            </div>
          </div>
        </section>

        {/* Bank Info */}
        <section className="bg-white rounded-2xl p-4 shadow-sm" data-testid="bank-info-section">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Informacion Bancaria
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Banco</span>
              <span className="ml-auto text-sm font-semibold text-gray-900">
                {provider.bank_name || "No proporcionado"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Cuenta</span>
              <span className="ml-auto text-sm font-semibold text-gray-900">
                {maskBankAccount(provider.bank_account)}
              </span>
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="bg-white rounded-2xl p-4 shadow-sm" data-testid="documents-section">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Documentos ({provider.documents.length})
          </h2>
          {provider.documents.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No hay documentos adjuntos</p>
            </div>
          ) : (
            <DocumentViewer documents={provider.documents} providerId={provider.id} />
          )}
        </section>

        {/* Internal Notes */}
        <section className="bg-white rounded-2xl p-4 shadow-sm" data-testid="notes-section">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Notas Internas
          </h2>
          <div className="bg-gray-50 rounded-xl p-3 min-h-[60px]">
            <p className="text-sm text-gray-600">
              {provider.internal_notes || "Sin notas"}
            </p>
          </div>
        </section>

        {/* Actions */}
        {canTakeAction && (
          <VerificationActions
            providerId={provider.id}
            providerName={provider.name}
            currentStatus={provider.verification_status}
            currentNotes={provider.internal_notes}
          />
        )}

        {/* Already processed message */}
        {!canTakeAction && (
          <div className="bg-gray-100 rounded-2xl p-4 text-center">
            <p className="text-sm text-gray-600">
              Esta solicitud ya fue procesada ({provider.verification_status})
            </p>
            <Link
              href="/admin/verification"
              className="inline-block mt-3 px-6 py-2 bg-gray-800 text-white rounded-xl text-sm font-semibold"
            >
              Volver a la Cola
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

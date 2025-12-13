import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { VerificationQueue } from "@/components/admin/verification-queue";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Verificaciones - Admin nitoagua",
  description: "Cola de verificacion de proveedores",
};

export type ProviderApplication = {
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
  documents: {
    id: string;
    type: string;
    storage_path: string;
    original_filename: string | null;
    uploaded_at: string | null;
  }[];
};

async function getPendingApplications(): Promise<ProviderApplication[]> {
  const adminClient = createAdminClient();

  // Query providers with pending or more_info_needed status
  const { data: providers, error } = await adminClient
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
    .in("role", ["supplier", "provider"])
    .in("verification_status", ["pending", "more_info_needed"])
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[ADMIN] Error fetching pending applications:", error.message);
    return [];
  }

  if (!providers || providers.length === 0) {
    return [];
  }

  // Fetch documents for each provider
  const providerIds = providers.map((p) => p.id);
  const { data: documents, error: docsError } = await adminClient
    .from("provider_documents")
    .select("*")
    .in("provider_id", providerIds);

  if (docsError) {
    console.error("[ADMIN] Error fetching documents:", docsError.message);
  }

  // Map documents to providers
  const documentsByProvider = (documents || []).reduce((acc, doc) => {
    if (!acc[doc.provider_id]) {
      acc[doc.provider_id] = [];
    }
    acc[doc.provider_id].push({
      id: doc.id,
      type: doc.type,
      storage_path: doc.storage_path,
      original_filename: doc.original_filename,
      uploaded_at: doc.uploaded_at,
    });
    return acc;
  }, {} as Record<string, ProviderApplication["documents"]>);

  return providers.map((p) => ({
    ...p,
    documents: documentsByProvider[p.id] || [],
  }));
}

export default async function VerificationPage() {
  // Require admin access
  const user = await requireAdmin();

  // Fetch pending applications
  const applications = await getPendingApplications();
  const pendingCount = applications.filter(
    (a) => a.verification_status === "pending"
  ).length;
  const moreInfoCount = applications.filter(
    (a) => a.verification_status === "more_info_needed"
  ).length;

  console.log(`[ADMIN] Verification queue loaded by ${user.email}: ${applications.length} applications`);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-200 to-white px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/admin/dashboard"
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            data-testid="back-to-dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <span className="text-lg font-bold text-gray-700">nitoagua</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Verificaciones</h1>
            <p className="text-gray-600 text-sm">
              {applications.length === 0
                ? "No hay solicitudes pendientes"
                : `${applications.length} solicitudes en cola`}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          <button
            className="flex-1 py-2.5 bg-gray-800 text-white text-sm font-semibold rounded-xl"
            data-testid="filter-pending"
          >
            Pendientes ({pendingCount})
          </button>
          <button
            className="flex-1 py-2.5 bg-white text-gray-600 text-sm font-semibold rounded-xl border-2 border-gray-200"
            data-testid="filter-more-info"
          >
            Mas Info ({moreInfoCount})
          </button>
        </div>

        {/* Queue */}
        <VerificationQueue applications={applications} />
      </div>
    </div>
  );
}

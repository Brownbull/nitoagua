import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProviderDirectory } from "@/components/admin/provider-directory";
import { Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Revalidate every 60 seconds - provider list doesn't change very frequently
export const revalidate = 60;

export const metadata = {
  title: "Proveedores - Admin nitoagua",
  description: "Directorio de proveedores registrados",
};

export type ProviderDirectoryEntry = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  verification_status: string | null;
  is_available: boolean | null;
  service_area: string | null;
  created_at: string | null;
  commission_override: number | null;
  deliveries_count: number;
  commission_owed: number;
  average_rating: number | null;
  rating_count: number | null;
};

interface ProvidersPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    area?: string;
    page?: string;
    sort?: string;
    order?: string;
  }>;
}

async function getProviders(params: {
  status?: string;
  search?: string;
  area?: string;
  page?: number;
  sort?: string;
  order?: string;
}): Promise<{ providers: ProviderDirectoryEntry[]; total: number }> {
  const adminClient = createAdminClient();
  const pageSize = 25;
  const page = params.page || 1;
  const offset = (page - 1) * pageSize;

  // Build the query
  let query = adminClient
    .from("profiles")
    .select(`
      id,
      name,
      phone,
      email,
      verification_status,
      is_available,
      service_area,
      created_at,
      commission_override,
      average_rating,
      rating_count
    `, { count: "exact" })
    .in("role", ["supplier", "provider"]);

  // Filter by status
  if (params.status && params.status !== "all") {
    query = query.eq("verification_status", params.status);
  }

  // Filter by service area
  if (params.area && params.area !== "all") {
    query = query.eq("service_area", params.area);
  }

  // Search by name or phone
  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,phone.ilike.%${params.search}%`);
  }

  // Sort (default: joined date descending)
  const sortColumn = params.sort || "created_at";
  const sortOrder = params.order === "asc" ? true : false;
  query = query.order(sortColumn, { ascending: sortOrder });

  // Pagination
  query = query.range(offset, offset + pageSize - 1);

  const { data: providers, error, count } = await query;

  if (error) {
    console.error("[ADMIN] Error fetching providers:", error.message);
    return { providers: [], total: 0 };
  }

  if (!providers || providers.length === 0) {
    return { providers: [], total: 0 };
  }

  // Get delivery counts for all providers
  const providerIds = providers.map(p => p.id);
  const { data: deliveryCounts } = await adminClient
    .from("water_requests")
    .select("supplier_id")
    .in("supplier_id", providerIds)
    .eq("status", "delivered");

  // Count deliveries per provider
  const deliveriesByProvider: Record<string, number> = {};
  (deliveryCounts || []).forEach(d => {
    if (d.supplier_id) {
      deliveriesByProvider[d.supplier_id] = (deliveriesByProvider[d.supplier_id] || 0) + 1;
    }
  });

  // Map providers with delivery count and commission owed
  // Note: commission_owed would come from commission_ledger table in future
  const result: ProviderDirectoryEntry[] = providers.map(p => ({
    ...p,
    deliveries_count: deliveriesByProvider[p.id] || 0,
    commission_owed: 0, // Will be implemented in Story 6.5
    average_rating: p.average_rating ?? null,
    rating_count: p.rating_count ?? null,
  }));

  return { providers: result, total: count || 0 };
}

async function getServiceAreas(): Promise<string[]> {
  const adminClient = createAdminClient();

  // Get all active comunas from the comunas table
  const { data } = await adminClient
    .from("comunas")
    .select("name")
    .eq("active", true)
    .order("name");

  if (!data) return [];

  return data.map(c => c.name);
}

export default async function ProvidersPage({ searchParams }: ProvidersPageProps) {
  // Require admin access
  const user = await requireAdmin();
  const params = await searchParams;

  // Parse page number
  const page = params.page ? parseInt(params.page) : 1;

  // Fetch providers and service areas in parallel
  const [{ providers, total }, serviceAreas] = await Promise.all([
    getProviders({
      status: params.status,
      search: params.search,
      area: params.area,
      page,
      sort: params.sort,
      order: params.order,
    }),
    getServiceAreas(),
  ]);

  console.log(`[ADMIN] Provider directory loaded by ${user.email}: ${providers.length} of ${total} providers`);

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-200 to-white px-5 py-3">
        <div className="flex items-center gap-2 mb-3">
          <Link
            href="/admin/dashboard"
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
            data-testid="back-to-dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <span className="font-logo text-xl text-gray-700">nitoagua</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Proveedores</h1>
            <p className="text-gray-500 text-sm">
              {total === 0
                ? "No hay proveedores registrados"
                : `${total} proveedor${total !== 1 ? "es" : ""} registrado${total !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 lg:p-6">
        <ProviderDirectory
          providers={providers}
          total={total}
          currentPage={page}
          totalPages={totalPages}
          serviceAreas={serviceAreas}
          currentFilters={{
            status: params.status || "all",
            search: params.search || "",
            area: params.area || "all",
            sort: params.sort || "created_at",
            order: params.order || "desc",
          }}
        />
      </div>
    </div>
  );
}

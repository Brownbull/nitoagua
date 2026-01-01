import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { OrdersTable } from "@/components/admin/orders-table";
import { Package, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering - admin dashboards must always show current data
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pedidos - Admin nitoagua",
  description: "Gestion de pedidos y solicitudes de agua",
};

// Types for orders data
export interface OrderSummary {
  id: string;
  consumer_name: string;
  consumer_phone: string;
  consumer_email: string | null;
  address: string;
  comuna: string;
  amount: number;
  is_urgent: boolean;
  status: string;
  created_at: string;
  accepted_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  provider_id: string | null;
  provider_name: string | null;
  offers_count: number;
}

export interface OrderStats {
  total: number;
  pending: number;
  accepted: number;
  en_route: number;
  delivered: number;
  cancelled: number;
}

async function getOrdersData(filters?: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  comuna?: string;
}): Promise<{
  orders: OrderSummary[];
  stats: OrderStats;
  comunas: string[];
}> {
  const adminClient = createAdminClient();

  // First, get ALL requests for stats calculation (unfiltered by status)
  const { data: allRequests, error: allReqError } = await adminClient
    .from("water_requests")
    .select("status");

  if (allReqError) {
    console.error("[ADMIN] Error fetching all orders for stats:", allReqError.message);
  }

  // Calculate stats from ALL requests (not filtered by status)
  const stats = calculateStats(allRequests || []);

  // Build the query for water_requests (filtered for display)
  let query = adminClient
    .from("water_requests")
    .select(`
      id,
      guest_name,
      guest_phone,
      guest_email,
      address,
      amount,
      is_urgent,
      status,
      created_at,
      accepted_at,
      delivered_at,
      cancelled_at,
      cancellation_reason,
      supplier_id,
      consumer_id
    `)
    .order("created_at", { ascending: false });

  // Apply status filter
  if (filters?.status && filters.status !== "all") {
    // "pending" filter includes both "pending" and "offers_pending" statuses
    if (filters.status === "pending") {
      query = query.in("status", ["pending", "offers_pending"]);
    } else {
      query = query.eq("status", filters.status);
    }
  }

  // Apply date range filter
  if (filters?.dateFrom) {
    query = query.gte("created_at", filters.dateFrom);
  }
  if (filters?.dateTo) {
    // Add one day to include the end date
    const endDate = new Date(filters.dateTo);
    endDate.setDate(endDate.getDate() + 1);
    query = query.lt("created_at", endDate.toISOString());
  }

  const { data: requests, error: reqError } = await query;

  if (reqError) {
    console.error("[ADMIN] Error fetching orders:", reqError.message);
    return { orders: [], stats: getEmptyStats(), comunas: [] };
  }

  // Get unique IDs for batch fetching
  const providerIds = [...new Set((requests || [])
    .map(r => r.supplier_id)
    .filter((id): id is string => id !== null))];

  const consumerIds = [...new Set((requests || [])
    .map(r => r.consumer_id)
    .filter((id): id is string => id !== null))];

  const requestIds = (requests || []).map(r => r.id);

  // Fetch related data IN PARALLEL for better performance
  const [providersResult, consumersResult, offerCountsResult] = await Promise.all([
    // Fetch provider names
    providerIds.length > 0
      ? adminClient.from("profiles").select("id, name").in("id", providerIds)
      : Promise.resolve({ data: [] }),

    // Fetch consumer names (for registered users)
    consumerIds.length > 0
      ? adminClient.from("profiles").select("id, name, phone, email").in("id", consumerIds)
      : Promise.resolve({ data: [] }),

    // Count offers per request
    requestIds.length > 0
      ? adminClient.from("offers").select("request_id").in("request_id", requestIds)
      : Promise.resolve({ data: [] }),
  ]);

  const providers = providersResult.data || [];
  const consumers = consumersResult.data || [];
  const offerCounts = offerCountsResult.data || [];

  const providerMap = new Map(providers.map(p => [p.id, p.name]));
  const consumerMap = new Map(consumers.map(c => [c.id, { name: c.name, phone: c.phone, email: c.email }]));

  const offerCountMap = new Map<string, number>();
  (offerCounts || []).forEach(o => {
    offerCountMap.set(o.request_id, (offerCountMap.get(o.request_id) || 0) + 1);
  });

  // Extract comuna from address (simple approach - take the part after last comma)
  const extractComuna = (address: string): string => {
    const parts = address.split(",");
    if (parts.length >= 2) {
      return parts[parts.length - 1].trim();
    }
    return address;
  };

  // Build orders array
  const orders: OrderSummary[] = (requests || []).map(r => {
    // Get consumer info from registered user or guest data
    const consumerInfo = r.consumer_id ? consumerMap.get(r.consumer_id) : null;

    return {
      id: r.id,
      consumer_name: consumerInfo?.name || r.guest_name || "Anonimo",
      consumer_phone: consumerInfo?.phone || r.guest_phone,
      consumer_email: consumerInfo?.email || r.guest_email,
      address: r.address,
      comuna: extractComuna(r.address),
      amount: r.amount,
      is_urgent: r.is_urgent || false,
      status: r.status,
      created_at: r.created_at || new Date().toISOString(),
      accepted_at: r.accepted_at,
      delivered_at: r.delivered_at,
      cancelled_at: r.cancelled_at,
      cancellation_reason: r.cancellation_reason || null,
      provider_id: r.supplier_id,
      provider_name: r.supplier_id ? (providerMap.get(r.supplier_id) || null) : null,
      offers_count: offerCountMap.get(r.id) || 0,
    };
  });

  // Apply comuna filter (after extracting)
  const filteredOrders = filters?.comuna && filters.comuna !== "all"
    ? orders.filter(o => o.comuna.toLowerCase().includes(filters.comuna!.toLowerCase()))
    : orders;

  // Get unique comunas for filter dropdown
  const comunas = [...new Set(orders.map(o => o.comuna))].filter(Boolean).sort();

  // Stats were already calculated from ALL requests at the beginning
  return { orders: filteredOrders, stats, comunas };
}

function getEmptyStats(): OrderStats {
  return {
    total: 0,
    pending: 0,
    accepted: 0,
    en_route: 0,
    delivered: 0,
    cancelled: 0,
  };
}

function calculateStats(requests: Array<{ status: string }>): OrderStats {
  const stats = getEmptyStats();
  stats.total = requests.length;

  requests.forEach(r => {
    switch (r.status) {
      case "pending":
      case "offers_pending":
      case "no_offers":
        stats.pending++;
        break;
      case "accepted":
        stats.accepted++;
        break;
      case "en_route":
        stats.en_route++;
        break;
      case "delivered":
        stats.delivered++;
        break;
      case "cancelled":
        stats.cancelled++;
        break;
    }
  });

  return stats;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Require admin access
  const user = await requireAdmin();

  // Get search params
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : undefined;
  const dateFrom = typeof params.dateFrom === "string" ? params.dateFrom : undefined;
  const dateTo = typeof params.dateTo === "string" ? params.dateTo : undefined;
  const comuna = typeof params.comuna === "string" ? params.comuna : undefined;

  // Fetch orders data
  const { orders, stats, comunas } = await getOrdersData({
    status,
    dateFrom,
    dateTo,
    comuna,
  });

  console.log(`[ADMIN] Orders page loaded by ${user.email}: ${orders.length} orders`);

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Sticky Header + Search/Filter */}
      <div className="sticky top-0 z-30 bg-gray-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-gray-200 to-white px-5 py-3">
          <div className="flex items-center gap-2 mb-3">
            <Link
              href="/admin/dashboard"
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              data-testid="back-to-dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <span className="font-logo text-xl text-gray-700">nitoagua</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900" data-testid="orders-title">Pedidos</h1>
              <p className="text-gray-500 text-sm">
                {stats.total} pedidos totales
              </p>
            </div>
          </div>
        </header>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6">
        <OrdersTable
          orders={orders}
          stats={stats}
          comunas={comunas}
          currentFilters={{
            status: status || "all",
            dateFrom: dateFrom || "",
            dateTo: dateTo || "",
            comuna: comuna || "all",
          }}
        />
      </div>
    </div>
  );
}

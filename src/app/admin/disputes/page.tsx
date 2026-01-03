import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Clock, User, Truck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  DISPUTE_TYPE_LABELS,
  DISPUTE_STATUS_CONFIG,
} from "@/lib/utils/dispute-constants";

// Force dynamic rendering - admin dashboards must always show current data
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Disputas - Admin nitoagua",
  description: "Gestion de disputas de consumidores",
};

interface DisputeSummary {
  id: string;
  request_id: string;
  dispute_type: string;
  description: string | null;
  status: string;
  created_at: string;
  consumer_name: string;
  consumer_id: string;
  provider_name: string;
  provider_id: string;
  order_amount: number;
}

interface DisputeStats {
  total: number;
  open: number;
  under_review: number;
  resolved: number;
}

async function getDisputesData(filters?: { status?: string }): Promise<{
  disputes: DisputeSummary[];
  stats: DisputeStats;
}> {
  const adminClient = createAdminClient();

  // Get all disputes for stats
  const { data: allDisputes, error: statsError } = await adminClient
    .from("disputes")
    .select("status");

  if (statsError) {
    console.error("[ADMIN] Error fetching disputes stats:", statsError.message);
  }

  // Calculate stats
  const stats: DisputeStats = {
    total: (allDisputes || []).length,
    open: (allDisputes || []).filter((d) => d.status === "open").length,
    under_review: (allDisputes || []).filter((d) => d.status === "under_review").length,
    resolved: (allDisputes || []).filter((d) =>
      ["resolved_consumer", "resolved_provider", "closed"].includes(d.status)
    ).length,
  };

  // Build query for filtered disputes
  let query = adminClient
    .from("disputes")
    .select(`
      id,
      request_id,
      dispute_type,
      description,
      status,
      created_at,
      consumer_id,
      provider_id
    `)
    .order("created_at", { ascending: false });

  // Apply status filter
  if (filters?.status && filters.status !== "all") {
    if (filters.status === "resolved") {
      query = query.in("status", ["resolved_consumer", "resolved_provider", "closed"]);
    } else {
      query = query.eq("status", filters.status);
    }
  }

  const { data: disputes, error: disputesError } = await query;

  if (disputesError) {
    console.error("[ADMIN] Error fetching disputes:", disputesError.message);
    return { disputes: [], stats };
  }

  // Get unique IDs for batch fetching profiles and requests
  const consumerIds = [...new Set((disputes || []).map((d) => d.consumer_id))];
  const providerIds = [...new Set((disputes || []).map((d) => d.provider_id))];
  const requestIds = [...new Set((disputes || []).map((d) => d.request_id))];

  // Fetch related data in parallel
  const [consumersResult, providersResult, requestsResult] = await Promise.all([
    consumerIds.length > 0
      ? adminClient.from("profiles").select("id, name").in("id", consumerIds)
      : Promise.resolve({ data: [] }),
    providerIds.length > 0
      ? adminClient.from("profiles").select("id, name").in("id", providerIds)
      : Promise.resolve({ data: [] }),
    requestIds.length > 0
      ? adminClient.from("water_requests").select("id, amount").in("id", requestIds)
      : Promise.resolve({ data: [] }),
  ]);

  const consumerMap = new Map((consumersResult.data || []).map((c) => [c.id, c.name]));
  const providerMap = new Map((providersResult.data || []).map((p) => [p.id, p.name]));
  const requestMap = new Map((requestsResult.data || []).map((r) => [r.id, r.amount]));

  // Build dispute summaries
  const disputeSummaries: DisputeSummary[] = (disputes || []).map((d) => ({
    id: d.id,
    request_id: d.request_id,
    dispute_type: d.dispute_type,
    description: d.description,
    status: d.status,
    created_at: d.created_at,
    consumer_id: d.consumer_id,
    consumer_name: consumerMap.get(d.consumer_id) || "Desconocido",
    provider_id: d.provider_id,
    provider_name: providerMap.get(d.provider_id) || "Desconocido",
    order_amount: requestMap.get(d.request_id) || 0,
  }));

  return { disputes: disputeSummaries, stats };
}

export default async function DisputesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Require admin access
  const user = await requireAdmin();

  // Get search params
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : undefined;

  // Fetch disputes data
  const { disputes, stats } = await getDisputesData({ status });

  console.log(`[ADMIN] Disputes page loaded by ${user.email}: ${disputes.length} disputes`);

  const currentFilter = status || "all";

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gray-100">
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
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900" data-testid="disputes-title">
                Disputas
              </h1>
              <p className="text-gray-500 text-sm">
                {stats.total} disputas totales • {stats.open} abiertas
              </p>
            </div>
          </div>
        </header>
      </div>

      {/* Stats Cards */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatCard
            label="Total"
            value={stats.total}
            active={currentFilter === "all"}
            href="/admin/disputes"
          />
          <StatCard
            label="Abiertas"
            value={stats.open}
            active={currentFilter === "open"}
            href="/admin/disputes?status=open"
            highlight
          />
          <StatCard
            label="En Revisión"
            value={stats.under_review}
            active={currentFilter === "under_review"}
            href="/admin/disputes?status=under_review"
          />
          <StatCard
            label="Resueltas"
            value={stats.resolved}
            active={currentFilter === "resolved"}
            href="/admin/disputes?status=resolved"
          />
        </div>
      </div>

      {/* Disputes List */}
      <div className="px-4">
        {disputes.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Sin disputas</h3>
            <p className="text-gray-500 text-sm">
              No hay disputas {currentFilter !== "all" ? "con este filtro" : "registradas"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {disputes.map((dispute) => {
              const statusConfig = DISPUTE_STATUS_CONFIG[dispute.status] || DISPUTE_STATUS_CONFIG.open;
              return (
                <Link
                  key={dispute.id}
                  href={`/admin/disputes/${dispute.id}`}
                  className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  data-testid={`dispute-${dispute.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {dispute.status === "open" && (
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                      )}
                      <span className="font-mono text-sm text-gray-500">
                        #{dispute.id.slice(0, 8)}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-semibold",
                        statusConfig.bgColor,
                        statusConfig.color
                      )}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">
                    {DISPUTE_TYPE_LABELS[dispute.dispute_type] || dispute.dispute_type}
                  </h3>

                  {dispute.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {dispute.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{dispute.consumer_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span>{dispute.provider_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {formatDistanceToNow(new Date(dispute.created_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  active,
  href,
  highlight,
}: {
  label: string;
  value: number;
  active: boolean;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all text-center",
        active && "ring-2 ring-blue-500"
      )}
    >
      <p
        className={cn(
          "text-2xl font-bold",
          highlight && value > 0 ? "text-red-600" : "text-gray-900"
        )}
      >
        {value}
      </p>
      <p className="text-xs text-gray-500">{label}</p>
    </Link>
  );
}

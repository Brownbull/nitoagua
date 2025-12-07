import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Droplets, User } from "lucide-react";
import { StatsHeader, DashboardTabs } from "@/components/supplier";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Panel de Proveedor - nitoagua",
  description: "Gestiona tus solicitudes de agua",
};

// Force dynamic rendering to ensure fresh data on every page load
// This prevents Next.js from caching the page and serving stale request data
// See: https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-rendering
export const dynamic = "force-dynamic";

// Stats calculation helpers
function getStartOfToday(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
}

function getStartOfWeek(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

async function fetchDashboardData(supplierId: string) {
  const supabase = await createClient();

  // Fetch all request types in parallel
  const [
    pendingResult,
    acceptedResult,
    completedResult,
    todayDeliveriesResult,
    weekDeliveriesResult,
  ] = await Promise.all([
    // Pending requests (all pending, not assigned to any supplier)
    supabase
      .from("water_requests")
      .select("*")
      .eq("status", "pending")
      .order("is_urgent", { ascending: false })
      .order("created_at", { ascending: true }),

    // Accepted requests (assigned to this supplier)
    supabase
      .from("water_requests")
      .select("*")
      .eq("status", "accepted")
      .eq("supplier_id", supplierId)
      .order("is_urgent", { ascending: false })
      .order("created_at", { ascending: true }),

    // Completed requests (delivered by this supplier)
    supabase
      .from("water_requests")
      .select("*")
      .eq("status", "delivered")
      .eq("supplier_id", supplierId)
      .order("delivered_at", { ascending: false }),

    // Today's deliveries count
    supabase
      .from("water_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "delivered")
      .eq("supplier_id", supplierId)
      .gte("delivered_at", getStartOfToday()),

    // Week deliveries count
    supabase
      .from("water_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "delivered")
      .eq("supplier_id", supplierId)
      .gte("delivered_at", getStartOfWeek()),
  ]);

  return {
    pendingRequests: pendingResult.data || [],
    acceptedRequests: acceptedResult.data || [],
    completedRequests: completedResult.data || [],
    stats: {
      pendingCount: pendingResult.data?.length || 0,
      todayDeliveries: todayDeliveriesResult.count || 0,
      weekTotal: weekDeliveriesResult.count || 0,
    },
  };
}

export default async function SupplierDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get supplier profile (user and role already verified by layout)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  // Fetch dashboard data
  const dashboardData = await fetchDashboardData(user!.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0077B6] text-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-6 h-6" />
            <span className="font-bold text-lg">nitoagua</span>
          </div>
          <Link
            href="/profile"
            className="flex items-center gap-2 text-sm hover:underline"
            data-testid="profile-link"
          >
            <span>Hola, {profile?.name}</span>
            <User className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Panel de Proveedor
        </h1>

        {/* Stats Header */}
        <div className="mb-6">
          <Suspense fallback={<StatsHeaderSkeleton />}>
            <StatsHeader
              pendingCount={dashboardData.stats.pendingCount}
              todayDeliveries={dashboardData.stats.todayDeliveries}
              weekTotal={dashboardData.stats.weekTotal}
            />
          </Suspense>
        </div>

        {/* Request Tabs */}
        <Suspense fallback={<TabsSkeleton />}>
          <DashboardTabs
            pendingRequests={dashboardData.pendingRequests}
            acceptedRequests={dashboardData.acceptedRequests}
            completedRequests={dashboardData.completedRequests}
          />
        </Suspense>
      </main>
    </div>
  );
}

function StatsHeaderSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 rounded-lg" />
      ))}
    </div>
  );
}

function TabsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

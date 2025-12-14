/**
 * Admin Dashboard Metrics
 * Story 6.8: Operations Dashboard
 *
 * Provides aggregate metrics for the admin dashboard with period filtering
 * and trend calculations.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfDay,
  endOfWeek,
  endOfMonth,
  subDays,
  subWeeks,
  subMonths,
} from "date-fns";

export type Period = "today" | "week" | "month";

export interface RequestMetrics {
  total: number;
  withOffers: number;
  withOffersPercent: number;
  avgOffersPerRequest: number;
  timeoutRate: number;
}

export interface OfferMetrics {
  total: number;
  acceptanceRate: number;
  avgTimeToFirstMinutes: number | null;
  expirationRate: number;
}

export interface FinancialMetrics {
  transactionVolume: number;
  commissionEarned: number;
  pendingSettlements: number;
}

export interface ProviderMetrics {
  activeCount: number;
  onlineNow: number;
  newApplications: number;
}

export interface TrendData {
  requests: number;
  offers: number;
  financial: number;
  providers: number;
}

export interface DashboardMetrics {
  period: Period;
  requests: RequestMetrics;
  offers: OfferMetrics;
  financial: FinancialMetrics;
  providers: ProviderMetrics;
  trends: TrendData;
  lastUpdated: string;
}

/**
 * Get date range for a given period
 */
function getDateRange(period: Period): { start: Date; end: Date } {
  const now = new Date();

  switch (period) {
    case "today":
      return {
        start: startOfDay(now),
        end: endOfDay(now),
      };
    case "week":
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }), // Monday start
        end: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case "month":
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
  }
}

/**
 * Get previous period date range for trend comparison
 */
function getPreviousDateRange(period: Period): { start: Date; end: Date } {
  const now = new Date();

  switch (period) {
    case "today":
      const yesterday = subDays(now, 1);
      return {
        start: startOfDay(yesterday),
        end: endOfDay(yesterday),
      };
    case "week":
      const lastWeek = subWeeks(now, 1);
      return {
        start: startOfWeek(lastWeek, { weekStartsOn: 1 }),
        end: endOfWeek(lastWeek, { weekStartsOn: 1 }),
      };
    case "month":
      const lastMonth = subMonths(now, 1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      };
  }
}

/**
 * Calculate percentage change between two values
 */
function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Get request metrics for a period
 */
async function getRequestMetrics(
  adminClient: ReturnType<typeof createAdminClient>,
  startDate: Date,
  endDate: Date
): Promise<RequestMetrics> {
  // Get all requests in period
  const { data: requests, error } = await adminClient
    .from("water_requests")
    .select("id, status, created_at")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString());

  if (error || !requests) {
    console.error("[ADMIN] Error fetching request metrics:", error?.message);
    return {
      total: 0,
      withOffers: 0,
      withOffersPercent: 0,
      avgOffersPerRequest: 0,
      timeoutRate: 0,
    };
  }

  const total = requests.length;
  if (total === 0) {
    return {
      total: 0,
      withOffers: 0,
      withOffersPercent: 0,
      avgOffersPerRequest: 0,
      timeoutRate: 0,
    };
  }

  const requestIds = requests.map((r) => r.id);

  // Get offers for these requests
  const { data: offers } = await adminClient
    .from("offers")
    .select("request_id")
    .in("request_id", requestIds);

  // Count offers per request
  const offersByRequest = new Map<string, number>();
  (offers || []).forEach((o) => {
    offersByRequest.set(o.request_id, (offersByRequest.get(o.request_id) || 0) + 1);
  });

  const requestsWithOffers = offersByRequest.size;
  const totalOffers = (offers || []).length;
  const avgOffersPerRequest = total > 0 ? totalOffers / total : 0;

  // Calculate timeout rate (cancelled requests without offers or accepted)
  // In V2 model, timeout would be requests that expired without acceptance
  const cancelledRequests = requests.filter((r) => r.status === "cancelled");
  const timeoutRate = total > 0 ? (cancelledRequests.length / total) * 100 : 0;

  return {
    total,
    withOffers: requestsWithOffers,
    withOffersPercent: total > 0 ? (requestsWithOffers / total) * 100 : 0,
    avgOffersPerRequest: Math.round(avgOffersPerRequest * 10) / 10,
    timeoutRate: Math.round(timeoutRate * 10) / 10,
  };
}

/**
 * Get offer metrics for a period
 */
async function getOfferMetrics(
  adminClient: ReturnType<typeof createAdminClient>,
  startDate: Date,
  endDate: Date
): Promise<OfferMetrics> {
  // Get all offers in period
  const { data: offers, error } = await adminClient
    .from("offers")
    .select("id, status, created_at, accepted_at, request_id")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString());

  if (error || !offers) {
    console.error("[ADMIN] Error fetching offer metrics:", error?.message);
    return {
      total: 0,
      acceptanceRate: 0,
      avgTimeToFirstMinutes: null,
      expirationRate: 0,
    };
  }

  const total = offers.length;
  if (total === 0) {
    return {
      total: 0,
      acceptanceRate: 0,
      avgTimeToFirstMinutes: null,
      expirationRate: 0,
    };
  }

  const accepted = offers.filter((o) => o.status === "accepted").length;
  const expired = offers.filter((o) => o.status === "expired").length;

  // Calculate avg time to first offer
  // Group offers by request and find earliest per request
  const firstOfferByRequest = new Map<string, Date>();
  offers.forEach((o) => {
    const offerTime = new Date(o.created_at);
    const existing = firstOfferByRequest.get(o.request_id);
    if (!existing || offerTime < existing) {
      firstOfferByRequest.set(o.request_id, offerTime);
    }
  });

  // Get request creation times for these requests
  const requestIds = [...firstOfferByRequest.keys()];
  if (requestIds.length > 0) {
    const { data: requests } = await adminClient
      .from("water_requests")
      .select("id, created_at")
      .in("id", requestIds);

    if (requests && requests.length > 0) {
      let totalMinutes = 0;
      let count = 0;

      requests.forEach((req) => {
        const firstOffer = firstOfferByRequest.get(req.id);
        if (firstOffer && req.created_at) {
          const reqTime = new Date(req.created_at);
          const minutes = (firstOffer.getTime() - reqTime.getTime()) / (1000 * 60);
          if (minutes >= 0) {
            totalMinutes += minutes;
            count++;
          }
        }
      });

      const avgTimeToFirst = count > 0 ? Math.round(totalMinutes / count) : null;

      return {
        total,
        acceptanceRate: Math.round((accepted / total) * 100 * 10) / 10,
        avgTimeToFirstMinutes: avgTimeToFirst,
        expirationRate: Math.round((expired / total) * 100 * 10) / 10,
      };
    }
  }

  return {
    total,
    acceptanceRate: Math.round((accepted / total) * 100 * 10) / 10,
    avgTimeToFirstMinutes: null,
    expirationRate: Math.round((expired / total) * 100 * 10) / 10,
  };
}

/**
 * Get financial metrics for a period
 */
async function getFinancialMetrics(
  adminClient: ReturnType<typeof createAdminClient>,
  startDate: Date,
  endDate: Date
): Promise<FinancialMetrics> {
  // Get delivered requests for transaction volume (using standard prices)
  const { data: deliveredRequests, error: reqError } = await adminClient
    .from("water_requests")
    .select("amount, delivered_at")
    .eq("status", "delivered")
    .gte("delivered_at", startDate.toISOString())
    .lte("delivered_at", endDate.toISOString());

  if (reqError) {
    console.error("[ADMIN] Error fetching delivered requests:", reqError.message);
  }

  // Calculate transaction volume based on standard prices
  const PRICES: Record<number, number> = {
    100: 5000,
    1000: 15000,
    5000: 45000,
    10000: 80000,
  };

  const transactionVolume = (deliveredRequests || []).reduce((sum, req) => {
    return sum + (PRICES[req.amount] || 0);
  }, 0);

  // Get commission earned in period from commission_ledger
  const { data: commissions, error: commError } = await adminClient
    .from("commission_ledger")
    .select("amount, type")
    .eq("type", "commission_owed")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString());

  if (commError) {
    console.error("[ADMIN] Error fetching commission data:", commError.message);
  }

  const commissionEarned = (commissions || []).reduce((sum, c) => sum + c.amount, 0);

  // Get pending settlements (total outstanding balance)
  const { data: allOwed } = await adminClient
    .from("commission_ledger")
    .select("amount, type");

  let pendingSettlements = 0;
  (allOwed || []).forEach((entry) => {
    if (entry.type === "commission_owed") {
      pendingSettlements += entry.amount;
    } else if (entry.type === "commission_paid") {
      pendingSettlements -= entry.amount;
    }
  });

  return {
    transactionVolume,
    commissionEarned,
    pendingSettlements: Math.max(0, pendingSettlements),
  };
}

/**
 * Get provider metrics for a period
 */
async function getProviderMetrics(
  adminClient: ReturnType<typeof createAdminClient>,
  startDate: Date,
  endDate: Date
): Promise<ProviderMetrics> {
  // Get all providers with supplier/provider role
  const { data: providers, error } = await adminClient
    .from("profiles")
    .select("id, verification_status, is_available, created_at")
    .in("role", ["supplier", "provider"]);

  if (error || !providers) {
    console.error("[ADMIN] Error fetching provider metrics:", error?.message);
    return {
      activeCount: 0,
      onlineNow: 0,
      newApplications: 0,
    };
  }

  // Active = approved
  const activeCount = providers.filter((p) => p.verification_status === "approved").length;

  // Online now = approved and is_available
  const onlineNow = providers.filter(
    (p) => p.verification_status === "approved" && p.is_available === true
  ).length;

  // New applications in period = pending verification_status created in period
  const newApplications = providers.filter((p) => {
    if (p.verification_status !== "pending") return false;
    if (!p.created_at) return false;
    const createdAt = new Date(p.created_at);
    return createdAt >= startDate && createdAt <= endDate;
  }).length;

  return {
    activeCount,
    onlineNow,
    newApplications,
  };
}

/**
 * Get all dashboard metrics for a period
 */
export async function getDashboardMetrics(period: Period): Promise<DashboardMetrics> {
  const adminClient = createAdminClient();

  const { start, end } = getDateRange(period);
  const { start: prevStart, end: prevEnd } = getPreviousDateRange(period);

  // Fetch current and previous period metrics in parallel
  const [currentRequests, prevRequests, currentOffers, prevOffers, currentFinancial, prevFinancial, currentProviders, prevProviders] =
    await Promise.all([
      getRequestMetrics(adminClient, start, end),
      getRequestMetrics(adminClient, prevStart, prevEnd),
      getOfferMetrics(adminClient, start, end),
      getOfferMetrics(adminClient, prevStart, prevEnd),
      getFinancialMetrics(adminClient, start, end),
      getFinancialMetrics(adminClient, prevStart, prevEnd),
      getProviderMetrics(adminClient, start, end),
      getProviderMetrics(adminClient, prevStart, prevEnd),
    ]);

  // Calculate trends
  const trends: TrendData = {
    requests: calculateTrend(currentRequests.total, prevRequests.total),
    offers: calculateTrend(currentOffers.total, prevOffers.total),
    financial: calculateTrend(currentFinancial.transactionVolume, prevFinancial.transactionVolume),
    providers: calculateTrend(currentProviders.activeCount, prevProviders.activeCount),
  };

  return {
    period,
    requests: currentRequests,
    offers: currentOffers,
    financial: currentFinancial,
    providers: currentProviders,
    trends,
    lastUpdated: new Date().toISOString(),
  };
}

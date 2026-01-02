"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/guards";

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

export interface OrderFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  comuna?: string;
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

/**
 * Server action to fetch admin orders data
 * Can be called from client components for real-time refresh
 */
export async function getAdminOrders(filters?: OrderFilters): Promise<{
  success: boolean;
  orders: OrderSummary[];
  stats: OrderStats;
  comunas: string[];
  error?: string;
}> {
  try {
    // Verify admin access
    await requireAdmin();

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
      const endDate = new Date(filters.dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt("created_at", endDate.toISOString());
    }

    const { data: requests, error: reqError } = await query;

    if (reqError) {
      console.error("[ADMIN] Error fetching orders:", reqError.message);
      return { success: false, orders: [], stats: getEmptyStats(), comunas: [], error: reqError.message };
    }

    // Get unique IDs for batch fetching
    const providerIds = [...new Set((requests || [])
      .map(r => r.supplier_id)
      .filter((id): id is string => id !== null))];

    const consumerIds = [...new Set((requests || [])
      .map(r => r.consumer_id)
      .filter((id): id is string => id !== null))];

    const requestIds = (requests || []).map(r => r.id);

    // Fetch related data IN PARALLEL
    const [providersResult, consumersResult, offerCountsResult] = await Promise.all([
      providerIds.length > 0
        ? adminClient.from("profiles").select("id, name").in("id", providerIds)
        : Promise.resolve({ data: [] }),
      consumerIds.length > 0
        ? adminClient.from("profiles").select("id, name, phone, email").in("id", consumerIds)
        : Promise.resolve({ data: [] }),
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

    // Extract comuna from address
    const extractComuna = (address: string): string => {
      const parts = address.split(",");
      if (parts.length >= 2) {
        return parts[parts.length - 1].trim();
      }
      return address;
    };

    // Build orders array
    const orders: OrderSummary[] = (requests || []).map(r => {
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

    // Apply comuna filter
    const filteredOrders = filters?.comuna && filters.comuna !== "all"
      ? orders.filter(o => o.comuna.toLowerCase().includes(filters.comuna!.toLowerCase()))
      : orders;

    // Get unique comunas for filter dropdown
    const comunas = [...new Set(orders.map(o => o.comuna))].filter(Boolean).sort();

    console.log(`[ADMIN] getAdminOrders: ${filteredOrders.length} orders fetched`);

    return { success: true, orders: filteredOrders, stats, comunas };
  } catch (error) {
    console.error("[ADMIN] getAdminOrders error:", error);
    return { success: false, orders: [], stats: getEmptyStats(), comunas: [], error: "Error interno" };
  }
}

export async function cancelOrder(
  orderId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify admin access
    const user = await requireAdmin();

    if (!orderId || !reason.trim()) {
      return { success: false, error: "ID del pedido y razon son requeridos" };
    }

    const adminClient = createAdminClient();

    // First, verify the order exists and can be cancelled
    const { data: order, error: fetchError } = await adminClient
      .from("water_requests")
      .select("id, status, supplier_id, consumer_id, guest_email")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      console.error("[ADMIN] Order not found:", orderId);
      return { success: false, error: "Pedido no encontrado" };
    }

    // Check if order can be cancelled
    if (order.status === "cancelled") {
      return { success: false, error: "Este pedido ya esta cancelado" };
    }

    if (order.status === "delivered") {
      return { success: false, error: "No se puede cancelar un pedido entregado" };
    }

    // Get admin user ID from profiles (if email exists)
    let adminProfileId: string | null = null;
    if (user.email) {
      const { data: adminProfile } = await adminClient
        .from("profiles")
        .select("id")
        .eq("email", user.email)
        .single();
      adminProfileId = adminProfile?.id || null;
    }

    // Update the order status
    const { error: updateError } = await adminClient
      .from("water_requests")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
        cancelled_by: adminProfileId,
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("[ADMIN] Error cancelling order:", updateError.message);
      return { success: false, error: "Error al cancelar el pedido" };
    }

    // Mark any active offers as "request_filled" (cancelled because request was cancelled)
    const { error: offersError } = await adminClient
      .from("offers")
      .update({ status: "cancelled" })
      .eq("request_id", orderId)
      .in("status", ["active", "accepted"]);

    if (offersError) {
      console.error("[ADMIN] Error updating offers:", offersError.message);
      // Non-fatal - continue
    }

    // Log the action
    console.log(`[ADMIN] Order ${orderId} cancelled by ${user.email}: ${reason}`);

    // TODO: Send notifications to consumer and provider (if assigned)
    // This would be implemented with the notification system from Epic 5

    return { success: true };
  } catch (error) {
    console.error("[ADMIN] Cancel order error:", error);
    return { success: false, error: "Error interno del servidor" };
  }
}

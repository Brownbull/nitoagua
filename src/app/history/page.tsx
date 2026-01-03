"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Loader2,
  Droplets,
  Package,
  Clock,
  History,
  ChevronRight,
  Check,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ConsumerNav } from "@/components/layout/consumer-nav";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { StatusBadge, type RequestStatus } from "@/components/shared/status-badge";
import { formatShortDate } from "@/lib/utils/format";

interface WaterRequest {
  id: string;
  status: string;
  amount: number;
  address: string;
  is_urgent: boolean;
  created_at: string;
  delivered_at: string | null;
  has_dispute?: boolean;
}

interface Statistics {
  totalRequests: number;
  deliveredRequests: number;
  totalLiters: number;
  pendingRequests: number;
}

export default function HistoryPage() {
  const [requests, setRequests] = useState<WaterRequest[]>([]);
  const [stats, setStats] = useState<Statistics>({
    totalRequests: 0,
    deliveredRequests: 0,
    totalLiters: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);

      // Get user profile for name
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserName(profile.name);
      }

      // Fetch all requests for this consumer
      const { data: requestsData, error } = await supabase
        .from("water_requests")
        .select("id, status, amount, address, is_urgent, created_at, delivered_at")
        .eq("consumer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching requests:", error);
        setLoading(false);
        return;
      }

      // Fetch consumer's disputes separately (RLS allows consumers to see their own disputes)
      const { data: disputesData } = await supabase
        .from("disputes")
        .select("request_id")
        .eq("consumer_id", user.id);

      // Create a set of request IDs that have disputes
      const requestsWithDisputes = new Set(
        (disputesData || []).map((d) => d.request_id)
      );

      // Transform data to include has_dispute flag
      const typedRequests = (requestsData || []).map((r) => ({
        id: r.id,
        status: r.status,
        amount: r.amount,
        address: r.address,
        is_urgent: r.is_urgent,
        created_at: r.created_at,
        delivered_at: r.delivered_at,
        has_dispute: requestsWithDisputes.has(r.id),
      })) as WaterRequest[];
      setRequests(typedRequests);

      // Calculate statistics
      const totalRequests = typedRequests.length;
      const deliveredRequests = typedRequests.filter(
        (r) => r.status === "delivered"
      ).length;
      const pendingRequests = typedRequests.filter(
        (r) => r.status === "pending" || r.status === "accepted"
      ).length;
      const totalLiters = typedRequests
        .filter((r) => r.status === "delivered")
        .reduce((sum, r) => sum + r.amount, 0);

      setStats({
        totalRequests,
        deliveredRequests,
        totalLiters,
        pendingRequests,
      });

      setLoading(false);
    }

    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pb-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#0077B6]" />
      </div>
    );
  }

  // Not authenticated - show login prompt with mockup styling
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 pb-20">
        {/* Header */}
        <div
          className="shrink-0 px-4 pt-3 pb-4"
          style={{
            background: "linear-gradient(180deg, #CAF0F8 0%, white 100%)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <Link href="/">
              <span
                className="text-[22px] text-[#0077B6]"
                style={{ fontFamily: "'Pacifico', cursive" }}
              >
                nitoagua
              </span>
            </Link>
          </div>
          <p className="text-[13px] text-gray-500 mb-0.5">Tu historial</p>
          <h1 className="text-lg font-bold text-gray-900">Mi Historial</h1>
        </div>

        <div className="flex-1 p-4">
          <div className="bg-white rounded-[14px] shadow-sm p-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#CAF0F8] flex items-center justify-center mb-4">
              <History className="h-8 w-8 text-[#0077B6]" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Inicia sesión para ver tu historial
            </h2>
            <p className="text-gray-500 mb-6">
              Crea una cuenta para guardar tus solicitudes y ver tu historial de
              consumo
            </p>
            <Link
              href="/login?role=consumer"
              className="inline-flex items-center justify-center rounded-xl bg-[#0077B6] px-6 py-3 text-white font-semibold hover:bg-[#005f8f] transition-colors shadow-[0_4px_14px_rgba(0,119,182,0.3)]"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
        <ConsumerNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-20">
      {/* Dashboard Header */}
      <DashboardHeader
        title="Mi Historial"
        subtitle="Tu historial"
        userName={userName || undefined}
        showNotifications
      />

      {/* Content */}
      <div className="flex-1 px-4 py-3">
        {/* Statistics Cards - 2x2 grid */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="grid grid-cols-2">
            {/* Total consumed */}
            <div className="p-3.5 border-r border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#CAF0F8] flex items-center justify-center shrink-0">
                  <Droplets className="h-5 w-5 text-[#0077B6]" />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#0077B6] leading-tight">
                    {stats.totalLiters.toLocaleString("es-CL")}L
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase font-medium tracking-wide">
                    Total consumido
                  </p>
                </div>
              </div>
            </div>

            {/* Deliveries */}
            <div className="p-3.5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 leading-tight">
                    {stats.deliveredRequests}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase font-medium tracking-wide">
                    Entregas
                  </p>
                </div>
              </div>
            </div>

            {/* Total requests */}
            <div className="p-3.5 border-r border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                  <History className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 leading-tight">
                    {stats.totalRequests}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase font-medium tracking-wide">
                    Solicitudes
                  </p>
                </div>
              </div>
            </div>

            {/* In progress */}
            <div className="p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 leading-tight">
                    {stats.pendingRequests}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase font-medium tracking-wide">
                    En progreso
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Request List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              Mis Solicitudes
            </h2>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Droplets className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-4">Aún no tienes solicitudes</p>
              <Link
                href="/request"
                className="inline-flex items-center justify-center rounded-xl bg-[#0077B6] px-4 py-2 text-sm text-white font-medium hover:bg-[#005f8f] transition-colors"
              >
                Solicitar Agua
              </Link>
            </div>
          ) : (
            <div>
              {requests.map((request, index) => (
                <Link
                  key={request.id}
                  href={`/request/${request.id}`}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    index !== requests.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  {/* Status icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      request.has_dispute
                        ? "bg-red-100"
                        : request.status === "delivered"
                          ? "bg-green-100"
                          : "bg-amber-100"
                    }`}
                  >
                    {request.has_dispute ? (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    ) : request.status === "delivered" ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-600" />
                    )}
                  </div>

                  {/* Request info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {request.amount.toLocaleString("es-CL")}L
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {request.address}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatShortDate(request.created_at)}
                    </p>
                  </div>

                  {/* Status and arrow */}
                  <div className="flex items-center gap-2">
                    {request.has_dispute && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        <AlertTriangle className="h-3 w-3" />
                        Disputa
                      </span>
                    )}
                    <StatusBadge status={request.status as RequestStatus} size="sm" />
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConsumerNav />
    </div>
  );
}

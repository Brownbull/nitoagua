"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Droplets, Package, Clock, History, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsumerNav } from "@/components/layout/consumer-nav";
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

  useEffect(() => {
    async function loadHistory() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);

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

      const typedRequests = (requestsData || []) as WaterRequest[];
      setRequests(typedRequests);

      // Calculate statistics
      const totalRequests = typedRequests.length;
      const deliveredRequests = typedRequests.filter(r => r.status === "delivered").length;
      const pendingRequests = typedRequests.filter(r => r.status === "pending" || r.status === "accepted").length;
      const totalLiters = typedRequests
        .filter(r => r.status === "delivered")
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

  // Not authenticated - show login prompt
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 pb-20">
        <div className="flex-1 p-4">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Mi Historial</h1>

          <Card className="text-center">
            <CardContent className="pt-8 pb-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <History className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Inicia sesión para ver tu historial
              </h2>
              <p className="text-gray-600 mb-6">
                Crea una cuenta para guardar tus solicitudes y ver tu historial de consumo
              </p>
              <Link
                href="/login?role=consumer"
                className="inline-flex items-center justify-center rounded-md bg-[#0077B6] px-6 py-3 text-white font-medium hover:bg-[#006699] transition-colors"
              >
                Iniciar Sesión
              </Link>
            </CardContent>
          </Card>
        </div>
        <ConsumerNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-20">
      <div className="flex-1 p-4">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Mi Historial</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Droplets className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalLiters.toLocaleString("es-CL")}L
                  </p>
                  <p className="text-xs text-gray-500">Total consumido</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.deliveredRequests}</p>
                  <p className="text-xs text-gray-500">Entregas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <History className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                  <p className="text-xs text-gray-500">Solicitudes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
                  <p className="text-xs text-gray-500">En progreso</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Request List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Mis Solicitudes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {requests.length === 0 ? (
              <div className="text-center py-8 px-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Droplets className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">Aún no tienes solicitudes</p>
                <Link
                  href="/request"
                  className="inline-flex items-center justify-center rounded-md bg-[#0077B6] px-4 py-2 text-sm text-white font-medium hover:bg-[#006699] transition-colors"
                >
                  Solicitar Agua
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {requests.map((request) => (
                  <Link
                    key={request.id}
                    href={`/request/${request.id}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {request.amount.toLocaleString("es-CL")}L
                        </span>
                        {request.is_urgent && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                            Urgente
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{request.address}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatShortDate(request.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <StatusBadge status={request.status as RequestStatus} />
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConsumerNav />
    </div>
  );
}

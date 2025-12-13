"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Search,
  Filter,
  ChevronRight,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRealtimeOrders } from "@/hooks/use-realtime-orders";
import type { OrderSummary, OrderStats } from "@/app/admin/orders/page";

interface OrdersTableProps {
  orders: OrderSummary[];
  stats: OrderStats;
  comunas: string[];
  currentFilters: {
    status: string;
    dateFrom: string;
    dateTo: string;
    comuna: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  pending: { label: "Pendiente", color: "text-amber-700", bgColor: "bg-amber-100", icon: Clock },
  offers_pending: { label: "Esperando Ofertas", color: "text-blue-700", bgColor: "bg-blue-100", icon: Package },
  assigned: { label: "Asignado", color: "text-indigo-700", bgColor: "bg-indigo-100", icon: Truck },
  en_route: { label: "En Camino", color: "text-purple-700", bgColor: "bg-purple-100", icon: Truck },
  delivered: { label: "Entregado", color: "text-green-700", bgColor: "bg-green-100", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "text-red-700", bgColor: "bg-red-100", icon: XCircle },
};

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendientes" },
  { value: "offers_pending", label: "Esperando Ofertas" },
  { value: "assigned", label: "Asignados" },
  { value: "en_route", label: "En Camino" },
  { value: "delivered", label: "Entregados" },
  { value: "cancelled", label: "Cancelados" },
];

const ITEMS_PER_PAGE = 25;

export function OrdersTable({ orders, stats, comunas, currentFilters }: OrdersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(currentFilters);

  // Enable real-time updates
  const { isConnected, lastUpdate } = useRealtimeOrders({ enabled: true });

  // Filter orders by search query (local filter)
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase();
    return orders.filter(order =>
      order.id.toLowerCase().includes(query) ||
      order.consumer_name.toLowerCase().includes(query) ||
      order.consumer_phone.includes(query) ||
      order.address.toLowerCase().includes(query)
    );
  }, [orders, searchQuery]);

  // Paginate
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Apply filters (updates URL)
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (localFilters.status && localFilters.status !== "all") {
      params.set("status", localFilters.status);
    } else {
      params.delete("status");
    }

    if (localFilters.dateFrom) {
      params.set("dateFrom", localFilters.dateFrom);
    } else {
      params.delete("dateFrom");
    }

    if (localFilters.dateTo) {
      params.set("dateTo", localFilters.dateTo);
    } else {
      params.delete("dateTo");
    }

    if (localFilters.comuna && localFilters.comuna !== "all") {
      params.set("comuna", localFilters.comuna);
    } else {
      params.delete("comuna");
    }

    router.push(`/admin/orders?${params.toString()}`);
    setShowFilters(false);
    setCurrentPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setLocalFilters({ status: "all", dateFrom: "", dateTo: "", comuna: "all" });
    router.push("/admin/orders");
    setShowFilters(false);
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = currentFilters.status !== "all" ||
    currentFilters.dateFrom !== "" ||
    currentFilters.dateTo !== "" ||
    currentFilters.comuna !== "all";

  // Toggle status filter from stats cards
  const toggleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // If clicking same status that's already active, clear it
    if (currentFilters.status === status) {
      params.delete("status");
    } else {
      // Otherwise, set the new status filter
      if (status === "all") {
        params.delete("status");
      } else {
        params.set("status", status);
      }
    }

    router.push(`/admin/orders?${params.toString()}`);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Real-time Indicator */}
      <div className="flex items-center justify-end gap-2">
        <span className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
          isConnected
            ? "bg-green-50 text-green-700"
            : "bg-gray-100 text-gray-500"
        )}>
          <Radio className={cn("w-3 h-3", isConnected && "animate-pulse")} />
          {isConnected ? "En vivo" : "Conectando..."}
        </span>
        {lastUpdate && (
          <span className="text-xs text-gray-400">
            Actualizado: {format(lastUpdate, "HH:mm:ss")}
          </span>
        )}
      </div>

      {/* Stats Cards - Scrollable (not sticky), Clickable Filters */}
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
        <StatsCard
          label="Pendientes"
          value={stats.pending}
          color="amber"
          isActive={currentFilters.status === "pending"}
          onClick={() => toggleStatusFilter("pending")}
        />
        <StatsCard
          label="Asignados"
          value={stats.assigned}
          color="indigo"
          isActive={currentFilters.status === "assigned"}
          onClick={() => toggleStatusFilter("assigned")}
        />
        <StatsCard
          label="En Camino"
          value={stats.en_route}
          color="purple"
          isActive={currentFilters.status === "en_route"}
          onClick={() => toggleStatusFilter("en_route")}
        />
        <StatsCard
          label="Entregados"
          value={stats.delivered}
          color="green"
          isActive={currentFilters.status === "delivered"}
          onClick={() => toggleStatusFilter("delivered")}
        />
        <StatsCard
          label="Cancelados"
          value={stats.cancelled}
          color="red"
          isActive={currentFilters.status === "cancelled"}
          onClick={() => toggleStatusFilter("cancelled")}
        />
        <StatsCard
          label="Total"
          value={stats.total}
          color="gray"
          isActive={currentFilters.status === "all"}
          onClick={() => toggleStatusFilter("all")}
        />
      </div>

      {/* Search and Filter Bar - Sticky */}
      <div className="sticky top-[108px] z-20 bg-white rounded-xl p-3 shadow-sm space-y-3">
        <div className="flex gap-2">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID, nombre, telefono..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              data-testid="orders-search"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors",
              hasActiveFilters
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            )}
            data-testid="toggle-filters"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="bg-white text-gray-800 text-xs px-1.5 py-0.5 rounded-full">
                Activos
              </span>
            )}
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="pt-3 border-t border-gray-100 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
                <select
                  value={localFilters.status}
                  onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                  data-testid="filter-status"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
                <input
                  type="date"
                  value={localFilters.dateFrom}
                  onChange={(e) => setLocalFilters({ ...localFilters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                  data-testid="filter-date-from"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
                <input
                  type="date"
                  value={localFilters.dateTo}
                  onChange={(e) => setLocalFilters({ ...localFilters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                  data-testid="filter-date-to"
                />
              </div>

              {/* Comuna Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Comuna</label>
                <select
                  value={localFilters.comuna}
                  onChange={(e) => setLocalFilters({ ...localFilters, comuna: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                  data-testid="filter-comuna"
                >
                  <option value="all">Todas</option>
                  {comunas.map(comuna => (
                    <option key={comuna} value={comuna}>{comuna}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                data-testid="clear-filters"
              >
                Limpiar
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700"
                data-testid="apply-filters"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Orders List - Card Layout */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No se encontraron pedidos</p>
          <p className="text-gray-400 text-sm mt-1">
            {hasActiveFilters ? "Intenta ajustar los filtros" : "Aun no hay pedidos registrados"}
          </p>
        </div>
      ) : (
        <>
          {/* Order Cards */}
          <div className="space-y-3">
            {paginatedOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-sm">
              <p className="text-sm text-gray-500">
                Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} de {filteredOrders.length}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "px-3 py-1 text-sm font-medium rounded-lg",
                        currentPage === pageNum
                          ? "bg-gray-800 text-white"
                          : "text-gray-600 border border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface StatsCardProps {
  label: string;
  value: number;
  color: string;
  isActive?: boolean;
  onClick?: () => void;
}

function StatsCard({ label, value, color, isActive, onClick }: StatsCardProps) {
  const colorClasses: Record<string, { normal: string; active: string }> = {
    amber: {
      normal: "bg-amber-50 text-amber-700",
      active: "bg-amber-500 text-white ring-2 ring-amber-600 ring-offset-2"
    },
    indigo: {
      normal: "bg-indigo-50 text-indigo-700",
      active: "bg-indigo-500 text-white ring-2 ring-indigo-600 ring-offset-2"
    },
    purple: {
      normal: "bg-purple-50 text-purple-700",
      active: "bg-purple-500 text-white ring-2 ring-purple-600 ring-offset-2"
    },
    green: {
      normal: "bg-green-50 text-green-700",
      active: "bg-green-500 text-white ring-2 ring-green-600 ring-offset-2"
    },
    red: {
      normal: "bg-red-50 text-red-700",
      active: "bg-red-500 text-white ring-2 ring-red-600 ring-offset-2"
    },
    gray: {
      normal: "bg-gray-100 text-gray-700",
      active: "bg-gray-700 text-white ring-2 ring-gray-800 ring-offset-2"
    },
  };

  const colors = colorClasses[color] || colorClasses.gray;

  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl p-3 text-center w-full transition-all duration-200",
        isActive ? colors.active : colors.normal,
        onClick && "cursor-pointer hover:scale-105 active:scale-95"
      )}
      data-testid={`stats-card-${label.toLowerCase().replace(/\s/g, "-")}`}
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className={cn("text-xs font-medium", isActive ? "opacity-90" : "opacity-80")}>{label}</p>
    </button>
  );
}

function OrderCard({ order }: { order: OrderSummary }) {
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  // Format ID (truncate for display)
  const shortId = order.id.slice(0, 8);

  // Format date
  const formattedDate = format(new Date(order.created_at), "d MMM, HH:mm", { locale: es });

  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className="block bg-white rounded-xl p-3.5 shadow-sm hover:shadow-md transition-shadow"
      data-testid={`order-card-${order.id}`}
    >
      {/* Top row: ID/Name, Status Badge */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono text-sm font-bold text-gray-900">#{shortId}</span>
            {order.is_urgent && (
              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-semibold rounded">
                URGENTE
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 truncate">{order.consumer_name}</p>
        </div>

        {/* Status badge */}
        <div className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0",
          statusConfig.bgColor,
          statusConfig.color
        )}>
          <StatusIcon className="w-3.5 h-3.5" />
          {statusConfig.label}
        </div>
      </div>

      {/* Metadata badges row */}
      <div className="flex flex-wrap gap-2 mb-2.5">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-md text-xs text-gray-600">
          <Package className="w-3 h-3" />
          {order.amount.toLocaleString("es-CL")}L
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-md text-xs text-gray-600">
          <Calendar className="w-3 h-3" />
          {formattedDate}
        </span>
        {order.offers_count > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
            {order.offers_count} ofertas
          </span>
        )}
        {order.comuna && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-md text-xs text-gray-600">
            <MapPin className="w-3 h-3" />
            {order.comuna}
          </span>
        )}
      </div>

      {/* Provider info (if assigned) */}
      {order.provider_name && (
        <p className="text-xs text-gray-500 mb-2.5">
          Proveedor: <span className="font-medium text-gray-700">{order.provider_name}</span>
        </p>
      )}

      {/* View button */}
      <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
        <span className="text-xs text-gray-400">{order.consumer_phone}</span>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-600">
          Ver detalle
          <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}

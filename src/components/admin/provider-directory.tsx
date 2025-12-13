"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  X,
  User,
} from "lucide-react";
import type { ProviderDirectoryEntry } from "@/app/admin/providers/page";
import { ProviderDetailPanel } from "./provider-detail-panel";

interface ProviderDirectoryProps {
  providers: ProviderDirectoryEntry[];
  total: number;
  currentPage: number;
  totalPages: number;
  serviceAreas: string[];
  currentFilters: {
    status: string;
    search: string;
    area: string;
    sort: string;
    order: string;
  };
}

const STATUS_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "pending", label: "Pendiente" },
  { value: "approved", label: "Aprobado" },
  { value: "suspended", label: "Suspendido" },
  { value: "banned", label: "Baneado" },
  { value: "rejected", label: "Rechazado" },
];

function getStatusBadge(status: string | null, isAvailable: boolean | null) {
  switch (status) {
    case "approved":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-md text-xs font-medium">
          <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-green-500" : "bg-gray-400"}`} />
          {isAvailable ? "Activo" : "Inactivo"}
        </span>
      );
    case "suspended":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 rounded-md text-xs font-medium">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
          Suspendido
        </span>
      );
    case "banned":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded-md text-xs font-medium">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
          Baneado
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-xs font-medium">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
          Pendiente
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
          Rechazado
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
          Desconocido
        </span>
      );
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function ProviderDirectory({
  providers,
  total,
  currentPage,
  totalPages,
  serviceAreas,
  currentFilters,
}: ProviderDirectoryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(currentFilters.search);
  const [selectedProvider, setSelectedProvider] = useState<ProviderDirectoryEntry | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Reset to page 1 when filters change (except for page changes)
      if (!("page" in updates)) {
        params.set("page", "1");
      }

      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "all" && value !== "") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      router.push(`/admin/providers?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Handle search with debounce
  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      // Use setTimeout for debounce
      const timeoutId = setTimeout(() => {
        updateFilters({ search: value });
      }, 300);
      return () => clearTimeout(timeoutId);
    },
    [updateFilters]
  );

  const handleSort = (column: string) => {
    const newOrder =
      currentFilters.sort === column && currentFilters.order === "asc"
        ? "desc"
        : "asc";
    updateFilters({ sort: column, order: newOrder });
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page: page.toString() });
  };

  const clearFilters = () => {
    setSearchValue("");
    router.push("/admin/providers");
  };

  const hasActiveFilters =
    currentFilters.status !== "all" ||
    currentFilters.search ||
    currentFilters.area !== "all";

  return (
    <div className="space-y-4" data-testid="provider-directory">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o telefono"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
            data-testid="search-input"
          />
          {searchValue && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button (Mobile) */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700"
        >
          <Filter className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </button>

        {/* Filters Row */}
        <div className={`flex flex-wrap gap-2 ${showFilters ? "block" : "hidden lg:flex"}`}>
          {/* Status Filter */}
          <select
            value={currentFilters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            data-testid="status-filter"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Service Area Filter */}
          <select
            value={currentFilters.area}
            onChange={(e) => updateFilters({ area: e.target.value })}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            data-testid="area-filter"
          >
            <option value="all">Todas las areas</option>
            {serviceAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {providers.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm" data-testid="empty-directory">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">
            No se encontraron proveedores
          </p>
          <p className="text-xs text-gray-500">
            {hasActiveFilters
              ? "Intenta ajustar los filtros de busqueda"
              : "No hay proveedores registrados"}
          </p>
        </div>
      ) : (
        <>
          {/* Table (Desktop) */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="providers-table">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        Nombre
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Telefono
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Estado
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <button
                        onClick={() => handleSort("deliveries_count")}
                        className="flex items-center gap-1 hover:text-gray-700 ml-auto"
                      >
                        Entregas
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Comision
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <button
                        onClick={() => handleSort("created_at")}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        Registro
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((provider) => (
                    <tr
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider)}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                      data-testid={`provider-row-${provider.id}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {provider.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {provider.phone}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(provider.verification_status, provider.is_available)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                        {provider.deliveries_count}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">
                        {provider.commission_owed > 0
                          ? formatCurrency(provider.commission_owed)
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(provider.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards (Mobile) */}
          <div className="lg:hidden space-y-3">
            {providers.map((provider) => (
              <div
                key={provider.id}
                onClick={() => setSelectedProvider(provider)}
                className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                data-testid={`provider-card-${provider.id}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {provider.name}
                    </p>
                    <p className="text-xs text-gray-500">{provider.phone}</p>
                  </div>
                  {getStatusBadge(provider.verification_status, provider.is_available)}
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{provider.deliveries_count} entregas</span>
                  <span>Desde {formatDate(provider.created_at)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm">
              <p className="text-sm text-gray-500">
                Mostrando {(currentPage - 1) * 25 + 1}-
                {Math.min(currentPage * 25, total)} de {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="prev-page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="next-page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Provider Detail Panel */}
      {selectedProvider && (
        <ProviderDetailPanel
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
        />
      )}
    </div>
  );
}

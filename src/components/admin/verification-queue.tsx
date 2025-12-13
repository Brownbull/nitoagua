"use client";

import { User } from "lucide-react";
import Link from "next/link";
import type { ProviderApplication } from "@/app/admin/verification/page";

interface VerificationQueueProps {
  applications: ProviderApplication[];
}

function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return "Fecha desconocida";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `Hace ${diffMins} minuto${diffMins !== 1 ? "s" : ""}`;
  }
  if (diffHours < 24) {
    return `Hace ${diffHours} hora${diffHours !== 1 ? "s" : ""}`;
  }
  if (diffDays === 1) {
    return "Hace 1 dia";
  }
  return `Hace ${diffDays} dias`;
}

function getStatusBadge(status: string | null) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
          Pendiente
        </span>
      );
    case "more_info_needed":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-800 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
          Revisando
        </span>
      );
    default:
      return null;
  }
}

export function VerificationQueue({ applications }: VerificationQueueProps) {
  if (applications.length === 0) {
    return (
      <div
        className="bg-white rounded-xl p-6 text-center shadow-sm"
        data-testid="empty-queue"
      >
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-900 mb-1">
          No hay solicitudes pendientes
        </p>
        <p className="text-xs text-gray-500">
          Las nuevas solicitudes de proveedores apareceran aqui
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="verification-queue">
      {applications.map((application) => (
        <div
          key={application.id}
          className="bg-white rounded-xl p-3.5 shadow-sm"
          data-testid={`application-card-${application.id}`}
        >
          {/* Top row: Avatar, Name/Time, Status Badge */}
          <div className="flex items-center gap-3 mb-2.5">
            {/* Avatar */}
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-gray-500" />
            </div>

            {/* Name and time */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {application.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatTimeAgo(application.created_at)}
              </p>
            </div>

            {/* Status badge */}
            {getStatusBadge(application.verification_status)}
          </div>

          {/* Metadata badges row */}
          <div className="flex gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-md text-xs text-gray-600">
              {application.documents.length} docs
            </span>
            {application.service_area && (
              <span className="px-2 py-0.5 bg-gray-100 rounded-md text-xs text-gray-600">
                {application.service_area}
              </span>
            )}
          </div>

          {/* Review button */}
          <Link
            href={`/admin/verification/${application.id}`}
            className="block w-full py-2.5 bg-gray-800 text-white text-center rounded-lg text-sm font-semibold hover:bg-gray-900 transition-colors"
          >
            Revisar Solicitud
          </Link>
        </div>
      ))}
    </div>
  );
}

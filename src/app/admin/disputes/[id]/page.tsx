import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Truck,
  CheckCircle,
  User,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DisputeResolution } from "@/components/admin/dispute-resolution";
import {
  DISPUTE_TYPE_LABELS,
  DISPUTE_STATUS_CONFIG,
  RESOLVABLE_STATUSES,
  formatPhoneForWhatsApp,
} from "@/lib/utils/dispute-constants";

// Force dynamic rendering - admin dashboards must always show current data
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Detalle de Disputa - Admin nitoagua",
  description: "Ver detalles de la disputa y resolver",
};

interface DisputeDetail {
  id: string;
  request_id: string;
  dispute_type: string;
  description: string | null;
  evidence_url: string | null;
  status: string;
  resolution_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  // Consumer info
  consumer_id: string;
  consumer_name: string;
  consumer_phone: string | null;
  consumer_email: string | null;
  // Provider info
  provider_id: string;
  provider_name: string;
  provider_phone: string | null;
  provider_email: string | null;
  // Order info
  order_amount: number;
  order_address: string;
  order_status: string;
  order_created_at: string;
  order_accepted_at: string | null;
  order_delivered_at: string | null;
}

interface TimelineEvent {
  id: string;
  label: string;
  timestamp: string;
  icon: React.ElementType;
  color: string;
  description?: string;
}

async function getDisputeDetail(disputeId: string): Promise<DisputeDetail | null> {
  const adminClient = createAdminClient();

  // Fetch the dispute
  const { data: dispute, error: disputeError } = await adminClient
    .from("disputes")
    .select(`
      id,
      request_id,
      dispute_type,
      description,
      evidence_url,
      status,
      resolution_notes,
      resolved_by,
      resolved_at,
      created_at,
      updated_at,
      consumer_id,
      provider_id
    `)
    .eq("id", disputeId)
    .single();

  if (disputeError || !dispute) {
    console.error("[ADMIN] Error fetching dispute:", disputeError?.message);
    return null;
  }

  // Fetch consumer, provider, and request IN PARALLEL
  const [consumerResult, providerResult, requestResult] = await Promise.all([
    adminClient
      .from("profiles")
      .select("name, phone, email")
      .eq("id", dispute.consumer_id)
      .single(),
    adminClient
      .from("profiles")
      .select("name, phone, email")
      .eq("id", dispute.provider_id)
      .single(),
    adminClient
      .from("water_requests")
      .select("amount, address, status, created_at, accepted_at, delivered_at")
      .eq("id", dispute.request_id)
      .single(),
  ]);

  const consumer = consumerResult.data;
  const provider = providerResult.data;
  const request = requestResult.data;

  if (!request) {
    console.error("[ADMIN] Error fetching request for dispute:", dispute.request_id);
    return null;
  }

  return {
    id: dispute.id,
    request_id: dispute.request_id,
    dispute_type: dispute.dispute_type,
    description: dispute.description,
    evidence_url: dispute.evidence_url,
    status: dispute.status,
    resolution_notes: dispute.resolution_notes,
    resolved_by: dispute.resolved_by,
    resolved_at: dispute.resolved_at,
    created_at: dispute.created_at,
    updated_at: dispute.updated_at,
    consumer_id: dispute.consumer_id,
    consumer_name: consumer?.name || "Desconocido",
    consumer_phone: consumer?.phone || null,
    consumer_email: consumer?.email || null,
    provider_id: dispute.provider_id,
    provider_name: provider?.name || "Desconocido",
    provider_phone: provider?.phone || null,
    provider_email: provider?.email || null,
    order_amount: request.amount,
    order_address: request.address,
    order_status: request.status,
    order_created_at: request.created_at || new Date().toISOString(),
    order_accepted_at: request.accepted_at,
    order_delivered_at: request.delivered_at,
  };
}

function buildTimeline(dispute: DisputeDetail): TimelineEvent[] {
  const timeline: TimelineEvent[] = [];

  // Order created
  timeline.push({
    id: "order_created",
    label: "Pedido Creado",
    timestamp: dispute.order_created_at,
    icon: Package,
    color: "bg-blue-500",
    description: `${dispute.order_amount.toLocaleString("es-CL")}L solicitados`,
  });

  // Order accepted
  if (dispute.order_accepted_at) {
    timeline.push({
      id: "order_accepted",
      label: "Proveedor Asignado",
      timestamp: dispute.order_accepted_at,
      icon: Truck,
      color: "bg-indigo-500",
      description: dispute.provider_name,
    });
  }

  // Order delivered
  if (dispute.order_delivered_at) {
    timeline.push({
      id: "order_delivered",
      label: "Marcado como Entregado",
      timestamp: dispute.order_delivered_at,
      icon: CheckCircle,
      color: "bg-green-500",
    });
  }

  // Dispute created
  timeline.push({
    id: "dispute_created",
    label: "Disputa Abierta",
    timestamp: dispute.created_at,
    icon: AlertTriangle,
    color: "bg-red-500",
    description: DISPUTE_TYPE_LABELS[dispute.dispute_type] || dispute.dispute_type,
  });

  // Dispute resolved
  if (dispute.resolved_at) {
    const resolutionLabel =
      dispute.status === "resolved_consumer"
        ? "Resuelta a favor del Consumidor"
        : dispute.status === "resolved_provider"
        ? "Resuelta a favor del Proveedor"
        : "Cerrada";

    timeline.push({
      id: "dispute_resolved",
      label: resolutionLabel,
      timestamp: dispute.resolved_at,
      icon: dispute.status === "resolved_consumer" ? User : Truck,
      color: dispute.status === "resolved_consumer" ? "bg-green-500" : "bg-blue-500",
    });
  }

  return timeline;
}

export default async function DisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin();
  const { id: disputeId } = await params;

  const dispute = await getDisputeDetail(disputeId);

  if (!dispute) {
    notFound();
  }

  console.log(`[ADMIN] Dispute detail ${disputeId} viewed by ${user.email}`);

  const timeline = buildTimeline(dispute);
  const statusConfig = DISPUTE_STATUS_CONFIG[dispute.status] || DISPUTE_STATUS_CONFIG.open;
  const canResolve = RESOLVABLE_STATUSES.includes(dispute.status as typeof RESOLVABLE_STATUSES[number]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-200 to-white px-5 py-3">
        <div className="flex items-center gap-2 mb-3">
          <Link
            href="/admin/disputes"
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
            data-testid="back-to-disputes"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <span className="font-logo text-xl text-gray-700">nitoagua</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-gray-900" data-testid="dispute-id">
                  Disputa #{dispute.id.slice(0, 8)}
                </h1>
              </div>
              <p className="text-gray-500 text-sm">
                {format(new Date(dispute.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-semibold",
              statusConfig.bgColor,
              statusConfig.color
            )}
          >
            {statusConfig.label}
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Dispute Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Dispute Details Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Detalles de la Disputa
              </h2>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Tipo de problema</p>
                <p className="text-lg font-semibold text-gray-900">
                  {DISPUTE_TYPE_LABELS[dispute.dispute_type] || dispute.dispute_type}
                </p>
              </div>

              {dispute.description && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Descripción del consumidor</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                    {dispute.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow icon={Package} label="Pedido" value={`#${dispute.request_id.slice(0, 8)}`} />
                <InfoRow
                  icon={Package}
                  label="Cantidad"
                  value={`${dispute.order_amount.toLocaleString("es-CL")} litros`}
                />
                <InfoRow icon={MapPin} label="Direccion" value={dispute.order_address} />
              </div>
            </div>

            {/* Consumer Info Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Consumidor
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{dispute.consumer_name}</p>
                    <p className="text-xs text-gray-500">Reportó el problema</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dispute.consumer_phone && (
                    <a
                      href={`https://wa.me/${formatPhoneForWhatsApp(dispute.consumer_phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                      data-testid="consumer-whatsapp"
                    >
                      <Phone className="w-4 h-4" />
                      {dispute.consumer_phone}
                    </a>
                  )}
                  {dispute.consumer_email && (
                    <a
                      href={`mailto:${dispute.consumer_email}`}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                      data-testid="consumer-email"
                    >
                      <Mail className="w-4 h-4" />
                      {dispute.consumer_email}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Provider Info Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Proveedor
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{dispute.provider_name}</p>
                    <p className="text-xs text-gray-500">Proveedor asignado</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dispute.provider_phone && (
                    <a
                      href={`https://wa.me/${formatPhoneForWhatsApp(dispute.provider_phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                      data-testid="provider-whatsapp"
                    >
                      <Phone className="w-4 h-4" />
                      {dispute.provider_phone}
                    </a>
                  )}
                  {dispute.provider_email && (
                    <a
                      href={`mailto:${dispute.provider_email}`}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                      data-testid="provider-email"
                    >
                      <Mail className="w-4 h-4" />
                      {dispute.provider_email}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Resolution Actions */}
            {canResolve && (
              <DisputeResolution disputeId={dispute.id} />
            )}

            {/* Resolution Notes (if resolved) */}
            {dispute.resolved_at && dispute.resolution_notes && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-800">Notas de Resolución</h3>
                    <p className="text-sm text-green-700 mt-2">{dispute.resolution_notes}</p>
                    <p className="text-xs text-green-600 mt-2">
                      Resuelta el {format(new Date(dispute.resolved_at), "d 'de' MMMM, HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Timeline */}
          <div className="space-y-4">
            {/* Timeline Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Linea de Tiempo
              </h2>
              <div className="space-y-4">
                {timeline.map((event, index) => {
                  const EventIcon = event.icon;
                  const isLast = index === timeline.length - 1;
                  return (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white",
                            event.color
                          )}
                        >
                          <EventIcon className="w-4 h-4" />
                        </div>
                        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
                      </div>
                      <div className={cn("flex-1 pb-4", isLast && "pb-0")}>
                        <p className="font-medium text-gray-900">{event.label}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(event.timestamp), "d MMM, HH:mm", { locale: es })}
                        </p>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* View Order Link */}
            <Link
              href={`/admin/orders/${dispute.request_id}`}
              className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-center"
              data-testid="view-order"
            >
              <Package className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Ver Pedido Completo</p>
              <p className="text-xs text-gray-500">#{dispute.request_id.slice(0, 8)}</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

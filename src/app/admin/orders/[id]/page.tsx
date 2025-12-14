import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";

// Revalidate every 30 seconds - order details can be slightly stale
export const revalidate = 30;
import { format, formatDistanceToNow, differenceInMinutes } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  Package,
  Phone,
  Mail,
  MapPin,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  User,
  MessageCircle,
  Calendar,
  AlertTriangle,
  DollarSign,
  Timer,
  Tag,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CancelOrderButton } from "@/components/admin/cancel-order-button";
import { OrderOfferHistory } from "@/components/admin/order-offer-history";

export const metadata = {
  title: "Detalle de Pedido - Admin nitoagua",
  description: "Ver detalles del pedido y ofertas",
};

// Types
interface OrderDetail {
  id: string;
  consumer_name: string;
  consumer_phone: string;
  consumer_email: string | null;
  consumer_id: string | null;
  address: string;
  comuna: string;
  amount: number;
  is_urgent: boolean;
  status: string;
  special_instructions: string | null;
  created_at: string;
  accepted_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  cancelled_by: string | null;
  provider_id: string | null;
  provider_name: string | null;
  provider_phone: string | null;
  provider_email: string | null;
  delivery_window: string | null;
}

interface Offer {
  id: string;
  provider_id: string;
  provider_name: string;
  delivery_window_start: string;
  delivery_window_end: string;
  status: string;
  created_at: string;
  accepted_at: string | null;
}

interface TimelineEvent {
  id: string;
  label: string;
  timestamp: string;
  icon: React.ElementType;
  color: string;
  description?: string;
}

interface OfferAnalytics {
  total_offers: number;
  time_to_first_offer: number | null; // minutes
  time_to_selection: number | null; // minutes
}

async function getOrderDetail(orderId: string): Promise<{
  order: OrderDetail | null;
  offers: Offer[];
  analytics: OfferAnalytics;
}> {
  const adminClient = createAdminClient();

  // Fetch the order
  const { data: request, error: reqError } = await adminClient
    .from("water_requests")
    .select(`
      id,
      guest_name,
      guest_phone,
      guest_email,
      consumer_id,
      address,
      amount,
      is_urgent,
      status,
      special_instructions,
      created_at,
      accepted_at,
      delivered_at,
      cancelled_at,
      cancellation_reason,
      cancelled_by,
      supplier_id,
      delivery_window
    `)
    .eq("id", orderId)
    .single();

  if (reqError || !request) {
    console.error("[ADMIN] Error fetching order:", reqError?.message);
    return { order: null, offers: [], analytics: { total_offers: 0, time_to_first_offer: null, time_to_selection: null } };
  }

  // Fetch consumer, provider, and offers IN PARALLEL for better performance
  const [consumerResult, providerResult, offersResult] = await Promise.all([
    // Get consumer info if registered user
    request.consumer_id
      ? adminClient
          .from("profiles")
          .select("name, phone, email")
          .eq("id", request.consumer_id)
          .single()
      : Promise.resolve({ data: null }),

    // Get provider info if assigned
    request.supplier_id
      ? adminClient
          .from("profiles")
          .select("name, phone, email")
          .eq("id", request.supplier_id)
          .single()
      : Promise.resolve({ data: null }),

    // Fetch offers for this request
    adminClient
      .from("offers")
      .select(`
        id,
        provider_id,
        delivery_window_start,
        delivery_window_end,
        status,
        created_at,
        accepted_at
      `)
      .eq("request_id", orderId)
      .order("created_at", { ascending: true }),
  ]);

  const consumerInfo = consumerResult.data;
  const providerInfo = providerResult.data;
  const offersData = offersResult.data;

  if (offersResult.error) {
    console.error("[ADMIN] Error fetching offers:", offersResult.error.message);
  }

  // Get provider names for offers (second parallel batch)
  const offerProviderIds = [...new Set((offersData || []).map(o => o.provider_id))];
  const { data: offerProviders } = offerProviderIds.length > 0
    ? await adminClient
        .from("profiles")
        .select("id, name")
        .in("id", offerProviderIds)
    : { data: [] };

  // Extract comuna from address
  const extractComuna = (address: string): string => {
    const parts = address.split(",");
    if (parts.length >= 2) {
      return parts[parts.length - 1].trim();
    }
    return address;
  };

  const order: OrderDetail = {
    id: request.id,
    consumer_name: consumerInfo?.name || request.guest_name || "Anonimo",
    consumer_phone: consumerInfo?.phone || request.guest_phone,
    consumer_email: consumerInfo?.email || request.guest_email,
    consumer_id: request.consumer_id,
    address: request.address,
    comuna: extractComuna(request.address),
    amount: request.amount,
    is_urgent: request.is_urgent || false,
    status: request.status,
    special_instructions: request.special_instructions,
    created_at: request.created_at || new Date().toISOString(),
    accepted_at: request.accepted_at,
    delivered_at: request.delivered_at,
    cancelled_at: request.cancelled_at,
    cancellation_reason: request.cancellation_reason,
    cancelled_by: request.cancelled_by,
    provider_id: request.supplier_id,
    provider_name: providerInfo?.name || null,
    provider_phone: providerInfo?.phone || null,
    provider_email: providerInfo?.email || null,
    delivery_window: request.delivery_window,
  };

  const providerNameMap = new Map((offerProviders || []).map(p => [p.id, p.name]));

  const offers: Offer[] = (offersData || []).map(o => ({
    id: o.id,
    provider_id: o.provider_id,
    provider_name: providerNameMap.get(o.provider_id) || "Desconocido",
    delivery_window_start: o.delivery_window_start,
    delivery_window_end: o.delivery_window_end,
    status: o.status,
    created_at: o.created_at,
    accepted_at: o.accepted_at,
  }));

  // Calculate analytics
  const analytics: OfferAnalytics = {
    total_offers: offers.length,
    time_to_first_offer: null,
    time_to_selection: null,
  };

  if (offers.length > 0) {
    const firstOffer = offers[0];
    const orderCreated = new Date(order.created_at);
    const firstOfferTime = new Date(firstOffer.created_at);
    analytics.time_to_first_offer = differenceInMinutes(firstOfferTime, orderCreated);

    // Time to selection (if an offer was accepted)
    const acceptedOffer = offers.find(o => o.status === "accepted");
    if (acceptedOffer && acceptedOffer.accepted_at) {
      analytics.time_to_selection = differenceInMinutes(new Date(acceptedOffer.accepted_at), orderCreated);
    }
  }

  return { order, offers, analytics };
}

function buildTimeline(order: OrderDetail, offers: Offer[]): TimelineEvent[] {
  const timeline: TimelineEvent[] = [];

  // Created
  timeline.push({
    id: "created",
    label: "Pedido Creado",
    timestamp: order.created_at,
    icon: Package,
    color: "bg-blue-500",
    description: `${order.amount.toLocaleString("es-CL")}L solicitados`,
  });

  // Offers received
  if (offers.length > 0) {
    timeline.push({
      id: "offers",
      label: `${offers.length} Oferta${offers.length > 1 ? "s" : ""} Recibida${offers.length > 1 ? "s" : ""}`,
      timestamp: offers[0].created_at,
      icon: Tag,
      color: "bg-purple-500",
    });
  }

  // Offer accepted / Assigned
  if (order.accepted_at) {
    timeline.push({
      id: "assigned",
      label: "Proveedor Asignado",
      timestamp: order.accepted_at,
      icon: User,
      color: "bg-indigo-500",
      description: order.provider_name || undefined,
    });
  }

  // En route (if status indicates it)
  if (order.status === "en_route") {
    timeline.push({
      id: "en_route",
      label: "En Camino",
      timestamp: order.accepted_at || order.created_at,
      icon: Truck,
      color: "bg-amber-500",
    });
  }

  // Delivered
  if (order.delivered_at) {
    timeline.push({
      id: "delivered",
      label: "Entregado",
      timestamp: order.delivered_at,
      icon: CheckCircle,
      color: "bg-green-500",
    });
  }

  // Cancelled
  if (order.cancelled_at) {
    timeline.push({
      id: "cancelled",
      label: "Cancelado",
      timestamp: order.cancelled_at,
      icon: XCircle,
      color: "bg-red-500",
      description: order.cancellation_reason || undefined,
    });
  }

  return timeline;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin();
  const { id: orderId } = await params;

  const { order, offers, analytics } = await getOrderDetail(orderId);

  if (!order) {
    notFound();
  }

  console.log(`[ADMIN] Order detail ${orderId} viewed by ${user.email}`);

  const timeline = buildTimeline(order, offers);
  const canCancel = !["delivered", "cancelled"].includes(order.status);

  // Status config for badge
  const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    pending: { label: "Pendiente", color: "text-amber-700", bgColor: "bg-amber-100" },
    offers_pending: { label: "Esperando Ofertas", color: "text-blue-700", bgColor: "bg-blue-100" },
    assigned: { label: "Asignado", color: "text-indigo-700", bgColor: "bg-indigo-100" },
    en_route: { label: "En Camino", color: "text-purple-700", bgColor: "bg-purple-100" },
    delivered: { label: "Entregado", color: "text-green-700", bgColor: "bg-green-100" },
    cancelled: { label: "Cancelado", color: "text-red-700", bgColor: "bg-red-100" },
  };
  const currentStatus = statusConfig[order.status] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-200 to-white px-5 py-3">
        <div className="flex items-center gap-2 mb-3">
          <Link
            href="/admin/orders"
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
            data-testid="back-to-orders"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <span className="font-logo text-xl text-gray-700">nitoagua</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-gray-900" data-testid="order-id">
                  #{order.id.slice(0, 8)}
                </h1>
                {order.is_urgent && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                    URGENTE
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm">
                {format(new Date(order.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
              </p>
            </div>
          </div>
          <span className={cn("px-3 py-1.5 rounded-full text-sm font-semibold", currentStatus.bgColor, currentStatus.color)}>
            {currentStatus.label}
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Request Details Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Detalles del Pedido
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow icon={Package} label="Cantidad" value={`${order.amount.toLocaleString("es-CL")} litros`} />
                <InfoRow icon={MapPin} label="Direccion" value={order.address} />
                <InfoRow icon={MapPin} label="Comuna" value={order.comuna} />
                {order.delivery_window && (
                  <InfoRow icon={Clock} label="Ventana Entrega" value={order.delivery_window} />
                )}
                {order.special_instructions && (
                  <div className="md:col-span-2">
                    <InfoRow icon={FileText} label="Instrucciones" value={order.special_instructions} />
                  </div>
                )}
              </div>
            </div>

            {/* Consumer Info Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Informacion del Consumidor
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{order.consumer_name}</p>
                    <p className="text-xs text-gray-500">
                      {order.consumer_id ? "Usuario registrado" : "Invitado"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://wa.me/56${order.consumer_phone.replace(/\D/g, "").replace(/^56/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                    data-testid="consumer-whatsapp"
                  >
                    <Phone className="w-4 h-4" />
                    {order.consumer_phone}
                  </a>
                  {order.consumer_email && (
                    <a
                      href={`mailto:${order.consumer_email}`}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                      data-testid="consumer-email"
                    >
                      <Mail className="w-4 h-4" />
                      {order.consumer_email}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Provider Info Card (if assigned) */}
            {order.provider_id && (
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Proveedor Asignado
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Truck className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{order.provider_name || "Desconocido"}</p>
                      <p className="text-xs text-gray-500">Proveedor verificado</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.provider_phone && (
                      <a
                        href={`https://wa.me/56${order.provider_phone.replace(/\D/g, "").replace(/^56/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                        data-testid="provider-whatsapp"
                      >
                        <Phone className="w-4 h-4" />
                        {order.provider_phone}
                      </a>
                    )}
                    {order.provider_email && (
                      <a
                        href={`mailto:${order.provider_email}`}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                        data-testid="provider-email"
                      >
                        <Mail className="w-4 h-4" />
                        {order.provider_email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Offer History */}
            <OrderOfferHistory offers={offers} analytics={analytics} />

            {/* Cancel Button */}
            {canCancel && (
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Acciones
                </h2>
                <CancelOrderButton orderId={order.id} />
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
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white", event.color)}>
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

            {/* Analytics Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Analiticas de Ofertas
              </h2>
              <div className="space-y-3">
                <AnalyticRow
                  icon={Tag}
                  label="Ofertas recibidas"
                  value={analytics.total_offers.toString()}
                />
                <AnalyticRow
                  icon={Timer}
                  label="Tiempo a primera oferta"
                  value={analytics.time_to_first_offer !== null ? `${analytics.time_to_first_offer} min` : "-"}
                />
                <AnalyticRow
                  icon={Clock}
                  label="Tiempo a seleccion"
                  value={analytics.time_to_selection !== null ? `${analytics.time_to_selection} min` : "-"}
                />
              </div>
            </div>

            {/* Cancellation Info (if cancelled) */}
            {order.cancelled_at && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800">Pedido Cancelado</h3>
                    <p className="text-sm text-red-700 mt-1">
                      {format(new Date(order.cancelled_at), "d 'de' MMMM, HH:mm", { locale: es })}
                    </p>
                    {order.cancellation_reason && (
                      <p className="text-sm text-red-600 mt-2">
                        <span className="font-medium">Razon:</span> {order.cancellation_reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
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

function AnalyticRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { ChevronLeft, List, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MapRequest, ProviderServiceArea, MapProviderStatus } from "@/lib/actions/map";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import "leaflet/dist/leaflet.css";

// Villarrica region defaults - AC: 8.10.7
const VILLARRICA_CENTER: [number, number] = [-39.2768, -72.2274];
const DEFAULT_ZOOM = 12;

// Custom marker icons
const createRequestMarkerIcon = (offerCount: number, isUrgent: boolean, isMyDelivery: boolean) => {
  // Green for my active deliveries, red for urgent, orange for normal pending
  const bgColor = isMyDelivery ? "bg-green-500" : isUrgent ? "bg-red-500" : "bg-orange-500";
  // Show checkmark for deliveries, offer count for pending
  const content = isMyDelivery ? "&#10003;" : offerCount;

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative">
        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-[3px] border-white ${bgColor}">
          ${content}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

const providerLocationIcon = L.divIcon({
  className: "custom-marker",
  html: `
    <div class="relative">
      <div class="absolute -inset-2 bg-blue-500/20 rounded-full animate-ping"></div>
      <div class="w-5 h-5 rounded-full bg-blue-500 border-[3px] border-white shadow-lg"></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface MapClientProps {
  initialRequests: MapRequest[];
  serviceAreas: ProviderServiceArea[];
  providerStatus: MapProviderStatus;
}

// Component to update map center
function MapCenterController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [map, center]);
  return null;
}

// Component to handle provider location
function ProviderLocationMarker() {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    // AC: 8.10.6 - Request browser geolocation permission
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(newPos);
      },
      () => {
        // AC: 8.10.6 - Handle permission denied gracefully (no-op)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  if (!position) return null;

  return (
    <Marker position={position} icon={providerLocationIcon}>
      <Popup>
        <span className="font-medium">Tu ubicación</span>
      </Popup>
    </Marker>
  );
}

// Compute initial center based on requests or fallback to Villarrica
// AC: 8.10.7 - Center on service area by default
function getInitialCenter(requests: MapRequest[]): [number, number] {
  if (requests.length > 0) {
    const firstRequest = requests[0];
    return [firstRequest.latitude, firstRequest.longitude];
  }
  return VILLARRICA_CENTER;
}

export function MapClient({
  initialRequests,
  serviceAreas,
  providerStatus,
}: MapClientProps) {
  const [requests] = useState(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<MapRequest | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(() => getInitialCenter(initialRequests));
  const mapRef = useRef<L.Map | null>(null);

  // AC: 8.10.9 - Empty state when no requests have coordinates
  if (requests.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Map header with back button - consistent with non-empty state */}
        <div className="absolute top-4 left-4 z-[1000]">
          <Link
            href="/provider/requests"
            className="flex items-center justify-center w-11 h-11 bg-white rounded-xl shadow-md hover:bg-gray-50 transition-colors"
            data-testid="map-back-button"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </Link>
        </div>

        {/* Empty state centered */}
        <div
          className="flex-1 flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-orange-50 to-white"
          data-testid="map-empty-state"
        >
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <MapPin className="h-10 w-10 text-orange-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No hay solicitudes con ubicación
          </h2>
          <p className="text-gray-600 mb-8 max-w-xs">
            No hay solicitudes de agua con ubicación disponible en tus áreas de servicio.
          </p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/provider/requests">
              <List className="h-4 w-4 mr-2" />
              Ver lista
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Map header with back button - AC: 8.10.1 */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Link
          href="/provider/requests"
          className="flex items-center justify-center w-11 h-11 bg-white rounded-xl shadow-md hover:bg-gray-50 transition-colors"
          data-testid="map-back-button"
        >
          <ChevronLeft className="h-6 w-6 text-gray-700" />
        </Link>
      </div>

      {/* Filter chips - matches mockup */}
      <div className="absolute top-4 left-[72px] right-4 z-[1000] flex gap-2">
        <div className="px-4 py-2.5 bg-orange-500 text-white rounded-full text-sm font-semibold shadow-md">
          Todos ({requests.length})
        </div>
        <button
          className="px-4 py-2.5 bg-white text-gray-400 rounded-full text-sm font-medium shadow-md cursor-not-allowed"
          disabled
          title="Próximamente"
        >
          Cercanos
        </button>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={mapCenter}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        ref={mapRef}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCenterController center={mapCenter} />

        {/* Provider location marker - AC: 8.10.6 */}
        <ProviderLocationMarker />

        {/* Request markers - AC: 8.10.3, 8.10.4 */}
        {requests.map((request) => (
          <Marker
            key={request.id}
            position={[request.latitude, request.longitude]}
            icon={createRequestMarkerIcon(
              request.offer_count,
              request.is_urgent,
              request.is_my_delivery ?? false
            )}
            eventHandlers={{
              click: () => {
                setSelectedRequest(request);
              },
            }}
          />
        ))}
      </MapContainer>

      {/* Bottom card - Selected request preview - AC: 8.10.4, 8.10.5 */}
      {/* Position above bottom nav (80px) + some padding */}
      {selectedRequest && (
        <div
          className="absolute bottom-24 left-4 right-4 bg-white rounded-2xl p-4 shadow-lg z-[1000]"
          data-testid="request-preview-card"
        >
          {/* Close button */}
          <button
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
            onClick={() => setSelectedRequest(null)}
            aria-label="Cerrar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-xs text-gray-500 mb-0.5">
                Pedido #{selectedRequest.id.slice(0, 8)}
              </div>
              <div className="font-semibold text-gray-900 pr-6">
                {selectedRequest.address}
              </div>
              <div className="text-sm text-gray-500">
                {selectedRequest.comuna_name}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-gray-900">
                  {selectedRequest.amount.toLocaleString("es-CL")}L
                </span>
                {selectedRequest.is_urgent && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded">
                    Urgente
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400">
                {selectedRequest.created_at &&
                  formatDistanceToNow(new Date(selectedRequest.created_at), {
                    addSuffix: true,
                    locale: es,
                  })}
              </div>
            </div>
          </div>

          {/* Action buttons - different for deliveries vs pending requests */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              asChild
            >
              <Link href={`/provider/requests/${selectedRequest.id}`}>
                Ver detalle
              </Link>
            </Button>
            {selectedRequest.is_my_delivery ? (
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600"
                asChild
              >
                <Link href={`/provider/deliveries`}>
                  Ver entrega
                </Link>
              </Button>
            ) : (
              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                asChild
              >
                <Link href={`/provider/requests/${selectedRequest.id}?action=offer`}>
                  Hacer oferta
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Center on location button - position above bottom nav */}
      <button
        className="absolute bottom-24 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-[1000] hover:bg-gray-50"
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                setMapCenter([pos.coords.latitude, pos.coords.longitude]);
              },
              () => {
                // Silently fail if permission denied
              }
            );
          }
        }}
        title="Centrar en mi ubicación"
        data-testid="center-location-button"
      >
        <Navigation className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
}

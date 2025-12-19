"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { MapRequest, ProviderServiceArea, MapProviderStatus } from "@/lib/actions/map";

function MapLoadingSkeleton() {
  return (
    <div
      className="fixed inset-0 bg-gradient-to-b from-green-100 to-green-200 flex items-center justify-center"
      data-testid="map-loading"
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="text-sm text-gray-600 font-medium">Cargando mapa...</span>
      </div>
    </div>
  );
}

// Dynamically import the map client to avoid SSR issues with Leaflet
const MapClient = dynamic(
  () => import("./map-client").then((mod) => mod.MapClient),
  {
    ssr: false,
    loading: () => <MapLoadingSkeleton />,
  }
);

interface MapWrapperProps {
  initialRequests: MapRequest[];
  serviceAreas: ProviderServiceArea[];
  providerStatus: MapProviderStatus;
}

/**
 * Client-side wrapper for the map component
 * Handles dynamic import of Leaflet (which requires window)
 */
export function MapWrapper({
  initialRequests,
  serviceAreas,
  providerStatus,
}: MapWrapperProps) {
  return (
    <MapClient
      initialRequests={initialRequests}
      serviceAreas={serviceAreas}
      providerStatus={providerStatus}
    />
  );
}

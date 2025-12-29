"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

function MapLoadingSkeleton() {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center bg-gray-50"
      data-testid="map-loading"
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#0077B6]" />
        <span className="text-sm text-gray-600 font-medium">Cargando mapa...</span>
      </div>
    </div>
  );
}

// Dynamically import the map component to avoid SSR issues with Leaflet
// Pattern from Story 8-10: dynamic() with ssr: false
const LocationPinpoint = dynamic(
  () => import("./location-pinpoint").then((mod) => mod.LocationPinpoint),
  {
    ssr: false,
    loading: () => <MapLoadingSkeleton />,
  }
);

interface LocationPinpointWrapperProps {
  address: string;
  initialLatitude?: number;
  initialLongitude?: number;
  onConfirm: (latitude: number, longitude: number) => void;
  onBack: () => void;
  onSkip: () => void;
}

/**
 * Client-side wrapper for the location pinpoint map component
 * Handles dynamic import of Leaflet (which requires window)
 *
 * @see Story 8-10 for pattern reference
 */
export function LocationPinpointWrapper({
  address,
  initialLatitude,
  initialLongitude,
  onConfirm,
  onBack,
  onSkip,
}: LocationPinpointWrapperProps) {
  return (
    <LocationPinpoint
      address={address}
      initialLatitude={initialLatitude}
      initialLongitude={initialLongitude}
      onConfirm={onConfirm}
      onBack={onBack}
      onSkip={onSkip}
    />
  );
}

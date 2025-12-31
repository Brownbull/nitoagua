"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

function MapLoadingSkeleton() {
  // Match the wrapper's flex-1 structure for consistent height during loading
  return (
    <div className="flex-1 flex flex-col">
      <div
        className="flex-1 flex flex-col items-center justify-center bg-gray-50"
        data-testid="map-loading"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0077B6]" />
          <span className="text-sm text-gray-600 font-medium">Cargando mapa...</span>
        </div>
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
  // IMPORTANT: The wrapper MUST have flex-1 to fill available space
  // This ensures the h-full CSS chain works down to the Leaflet container
  // Without this, the map container has 0 height and tiles won't render (BUG-001)
  return (
    <div className="flex-1 flex flex-col">
      <LocationPinpoint
        address={address}
        initialLatitude={initialLatitude}
        initialLongitude={initialLongitude}
        onConfirm={onConfirm}
        onBack={onBack}
        onSkip={onSkip}
      />
    </div>
  );
}

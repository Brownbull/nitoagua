"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

// Component to handle map resize when container becomes visible
// Fixes: Map tiles not rendering when map appears in wizard step (BUG-001)
function MapResizeHandler({ onReady }: { onReady: () => void }) {
  const map = useMap();

  useEffect(() => {
    // Multiple invalidateSize calls at different intervals to handle
    // various mobile browser timing issues (BUG-001)
    const timers: NodeJS.Timeout[] = [];

    // Immediate call
    map.invalidateSize();

    // Short delay for initial layout
    timers.push(setTimeout(() => {
      map.invalidateSize();
    }, 100));

    // Medium delay for CSS/font loading
    timers.push(setTimeout(() => {
      map.invalidateSize();
    }, 300));

    // Longer delay for slow mobile connections
    timers.push(setTimeout(() => {
      map.invalidateSize();
      onReady();
    }, 500));

    // Also handle window resize and orientation change events
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [map, onReady]);

  return null;
}

// Villarrica region default - consistent with provider map (Story 8-10)
const VILLARRICA_CENTER: [number, number] = [-39.2768, -72.2274];
const DEFAULT_ZOOM = 15;

// Custom draggable pin marker
const createPinMarkerIcon = (isDragging: boolean) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative">
        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-[3px] border-white bg-[#0077B6] ${isDragging ? "scale-110 opacity-80" : ""}" style="transition: transform 0.15s, opacity 0.15s;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        ${isDragging ? '<div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-black/20 rounded-full blur-sm"></div>' : ""}
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 40],
  });
};

interface DraggableMarkerProps {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}

function DraggableMarker({ position, onPositionChange }: DraggableMarkerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const markerRef = useRef<L.Marker | null>(null);

  const eventHandlers = {
    dragstart: () => {
      setIsDragging(true);
    },
    dragend: () => {
      setIsDragging(false);
      const marker = markerRef.current;
      if (marker) {
        const { lat, lng } = marker.getLatLng();
        onPositionChange(lat, lng);
      }
    },
  };

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={createPinMarkerIcon(isDragging)}
      draggable={true}
      eventHandlers={eventHandlers}
    />
  );
}

// Component to handle map clicks for repositioning marker
function MapClickHandler({ onPositionChange }: { onPositionChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface LocationPinpointProps {
  address: string;
  initialLatitude?: number;
  initialLongitude?: number;
  onConfirm: (latitude: number, longitude: number) => void;
  onBack: () => void;
  onSkip: () => void;
}

export function LocationPinpoint({
  address,
  initialLatitude,
  initialLongitude,
  onConfirm,
  onBack,
  onSkip,
}: LocationPinpointProps) {
  // Use provided coordinates or fall back to Villarrica center
  const initialPosition: [number, number] = [
    initialLatitude ?? VILLARRICA_CENTER[0],
    initialLongitude ?? VILLARRICA_CENTER[1],
  ];

  const [position, setPosition] = useState<[number, number]>(initialPosition);
  const [mapError, setMapError] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const handlePositionChange = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng]);
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(position[0], position[1]);
  }, [onConfirm, position]);

  // Handle tile load errors
  useEffect(() => {
    // Set a timeout to detect if map doesn't load
    const timeout = setTimeout(() => {
      if (!mapLoaded) {
        console.error("Map tiles failed to load within timeout");
        setMapError(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [mapLoaded]);

  // If map failed to load, show graceful degradation - AC12.1.4
  if (mapError) {
    return (
      <div className="flex flex-col h-full" data-testid="map-error-state">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center bg-amber-50">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            No pudimos cargar el mapa
          </h2>
          <p className="text-gray-600 text-sm mb-6 max-w-xs">
            Tu dirección será usada sin coordenadas exactas. El proveedor usará
            las instrucciones que proporcionaste.
          </p>

          {/* Address display */}
          <div className="w-full bg-white rounded-xl p-4 mb-6 border border-amber-200">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 text-left">{address}</p>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1"
              data-testid="map-back-button"
            >
              Volver
            </Button>
            <Button
              onClick={onSkip}
              className="flex-1 bg-amber-500 hover:bg-amber-600"
              data-testid="map-skip-button"
            >
              Saltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" data-testid="location-pinpoint">
      {/* Map container - fills available space */}
      <div className="flex-1 relative min-h-[300px]">
        {!mapLoaded && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-[#0077B6]" />
              <span className="text-sm text-gray-500">Cargando mapa...</span>
            </div>
          </div>
        )}
        <MapContainer
          center={position}
          zoom={DEFAULT_ZOOM}
          className="h-full w-full"
          zoomControl={true}
        >
          {/* MapResizeHandler fixes BUG-001: tiles not rendering in PWA wizard */}
          <MapResizeHandler onReady={() => setMapLoaded(true)} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{
              tileerror: () => {
                console.error("Tile loading error");
                setMapError(true);
              },
            }}
          />

          <DraggableMarker
            position={position}
            onPositionChange={handlePositionChange}
          />

          <MapClickHandler onPositionChange={handlePositionChange} />
        </MapContainer>

        {/* Instruction overlay */}
        <div className="absolute top-4 left-4 right-4 z-[1000]">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-md">
            <p className="text-sm text-gray-700 text-center">
              Arrastra el marcador o toca el mapa para ajustar tu ubicación exacta
            </p>
          </div>
        </div>
      </div>

      {/* Bottom section - Address and buttons */}
      <div className="bg-white border-t border-gray-100 px-5 py-4 space-y-4">
        {/* Address display - AC12.1.1 */}
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl" data-testid="address-display">
          <MapPin className="h-5 w-5 text-[#0077B6] mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">Dirección</p>
            <p className="text-sm text-gray-900 break-words">{address}</p>
          </div>
        </div>

        {/* Coordinates display - real-time update - AC12.1.2 */}
        <div className="text-xs text-gray-400 text-center" data-testid="coordinates-display">
          Coordenadas: {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </div>

        {/* Action buttons - AC12.1.3 */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 h-12 rounded-xl"
            data-testid="map-back-button"
          >
            Volver
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!mapLoaded}
            className="flex-1 h-12 bg-[#0077B6] hover:bg-[#005f8f] text-white rounded-xl font-semibold shadow-[0_4px_14px_rgba(0,119,182,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="map-confirm-button"
          >
            Confirmar Ubicación
          </Button>
        </div>
      </div>
    </div>
  );
}

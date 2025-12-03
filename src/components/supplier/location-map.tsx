"use client";

import { ExternalLink, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LocationMapProps {
  latitude: number | null;
  longitude: number | null;
  address: string;
}

export function LocationMap({ latitude, longitude, address }: LocationMapProps) {
  const hasCoordinates = latitude !== null && longitude !== null;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Google Maps URL for "Open in Maps" link
  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : `https://www.google.com/maps/search/${encodeURIComponent(address)}`;

  // Static map image URL
  const staticMapUrl = hasCoordinates && apiKey
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x300&scale=2&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`
    : null;

  return (
    <Card data-testid="location-map-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Ubicación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasCoordinates ? (
          <>
            {staticMapUrl ? (
              // Map preview with API key
              // Using img because Google Maps Static API URL is dynamic and external
              <div className="relative rounded-lg overflow-hidden" data-testid="map-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={staticMapUrl}
                  alt="Ubicación de la entrega"
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              // Coordinates available but no API key
              <div
                className="bg-gray-100 rounded-lg p-6 text-center"
                data-testid="map-placeholder"
              >
                <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">
                  Coordenadas: {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
                </p>
              </div>
            )}
          </>
        ) : (
          // No coordinates available
          <div
            className="bg-gray-100 rounded-lg p-6 text-center"
            data-testid="no-location-message"
          >
            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">Ubicación no disponible</p>
            <p className="text-gray-500 text-sm mt-1">
              El cliente no compartió su ubicación GPS
            </p>
          </div>
        )}

        {/* Address display */}
        <div className="text-sm text-gray-600" data-testid="address-text">
          <span className="font-medium">Dirección:</span> {address}
        </div>

        {/* Open in Google Maps button */}
        <Button
          variant="outline"
          className="w-full"
          asChild
          data-testid="open-maps-button"
        >
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir en Google Maps
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

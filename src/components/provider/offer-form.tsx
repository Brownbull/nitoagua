"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Clock, DollarSign, MessageSquare, Send, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createOffer } from "@/lib/actions/offers";
import type { RequestDetail, OfferPlatformSettings } from "@/lib/actions/offers";
import { formatCLP, formatEarningsPreview, formatLiters } from "@/lib/utils/commission";

interface OfferFormProps {
  request: RequestDetail;
  settings: OfferPlatformSettings;
  onCancel?: () => void;
}

/**
 * Offer Form Component
 * AC: 8.2.1 - Delivery window picker (start + end time)
 * AC: 8.2.2 - Price displayed from platform settings (not editable)
 * AC: 8.2.3 - Earnings preview with commission
 * AC: 8.2.4 - Optional message field
 * AC: 8.2.5 - Offer validity displayed
 */
export function OfferForm({ request, settings, onCancel }: OfferFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Initialize delivery window with suggested times
  const now = new Date();
  const defaultStart = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
  const defaultEnd = new Date(defaultStart.getTime() + 2 * 60 * 60 * 1000); // 2 hours after start

  // Format date for datetime-local input
  const formatDateTimeLocal = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const [deliveryStart, setDeliveryStart] = useState(formatDateTimeLocal(defaultStart));
  const [deliveryEnd, setDeliveryEnd] = useState(formatDateTimeLocal(defaultEnd));
  const [message, setMessage] = useState("");

  // Calculate earnings preview
  const earningsPreview = formatEarningsPreview(settings.price, settings.commission_percent);

  // Validate delivery window
  const validateWindow = () => {
    const start = new Date(deliveryStart);
    const end = new Date(deliveryEnd);
    const now = new Date();

    if (start <= now) {
      return "La hora de inicio debe ser en el futuro";
    }
    if (end <= start) {
      return "La hora de fin debe ser después de la hora de inicio";
    }
    return null;
  };

  // Update end time when start changes to maintain 2-hour window
  useEffect(() => {
    const start = new Date(deliveryStart);
    const suggestedEnd = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    setDeliveryEnd(formatDateTimeLocal(suggestedEnd));
  }, [deliveryStart]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    const validationError = validateWindow();
    if (validationError) {
      setError(validationError);
      return;
    }

    startTransition(async () => {
      const result = await createOffer(request.id, {
        delivery_window_start: new Date(deliveryStart).toISOString(),
        delivery_window_end: new Date(deliveryEnd).toISOString(),
        message: message.trim() || undefined,
      });

      if (result.success) {
        // AC: 8.2.7 - Show toast and redirect to offers page with highlight
        toast.success("¡Oferta enviada!", {
          description: "Tu oferta ha sido enviada exitosamente",
        });
        // Pass new offer ID to highlight it in the list
        router.push(`/provider/offers?new=${result.offerId}`);
      } else {
        if (result.isDuplicate) {
          // AC: 8.2.8 - Duplicate offer handling
          setError("Ya enviaste una oferta para esta solicitud");
          toast.error("Oferta duplicada", {
            description: "Ya tienes una oferta activa para esta solicitud",
          });
        } else {
          setError(result.error || "Error al enviar la oferta");
          toast.error("Error", {
            description: result.error || "No se pudo enviar la oferta",
          });
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-1">
        <Send className="h-3.5 w-3.5 text-orange-500" />
        <span className="text-xs font-semibold text-gray-900">Hacer Oferta</span>
      </div>
      <p className="text-[11px] text-gray-500 mb-3">
        {formatLiters(request.amount)} en {request.comuna_name}
      </p>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        {/* Error display */}
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-[11px]">{error}</AlertDescription>
          </Alert>
        )}

        {/* Price + Earnings - Combined compact row */}
        <div className="grid grid-cols-2 gap-2">
          {/* AC: 8.2.2 - Price display (read-only) */}
          <div className="bg-blue-50 rounded-lg p-2">
            <div className="flex items-center gap-1 text-blue-700 text-[10px]">
              <DollarSign className="h-3 w-3" />
              <span>Precio</span>
            </div>
            <p className="text-sm font-bold text-blue-900">
              {formatCLP(settings.price)}
            </p>
            {request.is_urgent && (
              <p className="text-[9px] text-blue-600">
                +{settings.urgency_surcharge_percent}% urgencia
              </p>
            )}
          </div>

          {/* AC: 8.2.3 - Earnings preview */}
          <div className="bg-green-50 rounded-lg p-2">
            <p className="text-[10px] text-green-700">
              {earningsPreview.message}
            </p>
            <p className="text-sm font-bold text-green-800">
              {earningsPreview.formattedEarnings}
            </p>
            <p className="text-[9px] text-green-600">
              -{earningsPreview.formattedCommission} comisión
            </p>
          </div>
        </div>

        {/* AC: 8.2.1 - Delivery window picker */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium">
            <Clock className="h-3 w-3" />
            Ventana de Entrega
          </Label>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <Label htmlFor="delivery-start" className="text-[10px] text-gray-500">
                Desde
              </Label>
              <Input
                id="delivery-start"
                type="datetime-local"
                value={deliveryStart}
                onChange={(e) => setDeliveryStart(e.target.value)}
                min={formatDateTimeLocal(new Date())}
                required
                className="h-8 text-xs"
                data-testid="delivery-start-input"
              />
            </div>

            <div className="space-y-0.5">
              <Label htmlFor="delivery-end" className="text-[10px] text-gray-500">
                Hasta
              </Label>
              <Input
                id="delivery-end"
                type="datetime-local"
                value={deliveryEnd}
                onChange={(e) => setDeliveryEnd(e.target.value)}
                min={deliveryStart}
                required
                className="h-8 text-xs"
                data-testid="delivery-end-input"
              />
            </div>
          </div>
        </div>

        {/* AC: 8.2.4 - Optional message field */}
        <div className="space-y-0.5">
          <Label htmlFor="message" className="flex items-center gap-1.5 text-xs">
            <MessageSquare className="h-3 w-3" />
            Mensaje (opcional)
          </Label>
          <Textarea
            id="message"
            placeholder="Ej: Disponibilidad inmediata..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={2}
            className="text-xs resize-none"
            data-testid="offer-message-input"
          />
          <p className="text-[9px] text-gray-400 text-right">
            {message.length}/500
          </p>
        </div>

        {/* AC: 8.2.5 - Offer validity display */}
        <div className="bg-orange-50 rounded-lg px-2 py-1.5">
          <p className="text-[11px] text-orange-700 flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Oferta válida por {settings.offer_validity_minutes} min
          </p>
        </div>

        {/* Submit button */}
        <div className="flex gap-2 pt-1">
          <Button
            type="submit"
            size="sm"
            className="flex-1 bg-orange-500 hover:bg-orange-600 h-9 text-xs"
            disabled={isPending}
            data-testid="submit-offer-button"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Enviar Oferta
              </>
            )}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isPending}
              className="h-9 text-xs"
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

/**
 * Skeleton loader for offer form
 */
export function OfferFormSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 animate-pulse">
      <div className="flex items-center gap-1.5 mb-1">
        <div className="h-3.5 w-3.5 bg-gray-200 rounded" />
        <div className="h-3 w-20 bg-gray-200 rounded" />
      </div>
      <div className="h-3 w-28 bg-gray-200 rounded mb-3" />
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <div className="h-14 bg-gray-100 rounded-lg" />
          <div className="h-14 bg-gray-100 rounded-lg" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-8 bg-gray-200 rounded" />
            <div className="h-8 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="h-10 bg-gray-100 rounded-lg" />
        <div className="h-9 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

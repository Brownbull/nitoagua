"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Clock,
  Send,
  AlertCircle,
  Loader2,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createOffer } from "@/lib/actions/offers";
import type { RequestDetail, OfferPlatformSettings } from "@/lib/actions/offers";
import { formatCLP, formatEarningsPreview, formatLiters } from "@/lib/utils/commission";

interface OfferFormProps {
  request: RequestDetail;
  settings: OfferPlatformSettings;
  onCancel?: () => void;
}

type DateOption = "today" | "tomorrow" | "other";

/**
 * Offer Form Component - Redesigned for driver usability (Story 12.7-10)
 * AC: 12.7.10.1 - Simplified time selection with quick buttons
 * AC: 12.7.10.1 - Prominent earnings display
 * AC: 12.7.10.1 - Submit button shows earnings
 */
export function OfferForm({ request, settings, onCancel }: OfferFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Simplified date selection - AC12.7.10.1
  const [dateOption, setDateOption] = useState<DateOption>("today");
  const [selectedHour, setSelectedHour] = useState<string>("14:00");
  const [otherDate, setOtherDate] = useState<string>("");
  const [message, setMessage] = useState("");
  const [showMessageField, setShowMessageField] = useState(false);

  // Calculate earnings preview
  const earningsPreview = formatEarningsPreview(settings.price, settings.commission_percent);

  // Generate hour options (8:00 to 21:00)
  const hourOptions = useMemo(() => {
    const hours: string[] = [];
    for (let h = 8; h <= 21; h++) {
      hours.push(`${h.toString().padStart(2, "0")}:00`);
    }
    return hours;
  }, []);

  // Get the selected date as a Date object
  const getSelectedDate = (): Date => {
    const now = new Date();
    if (dateOption === "today") {
      return now;
    } else if (dateOption === "tomorrow") {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    } else if (otherDate) {
      return new Date(otherDate);
    }
    return now;
  };

  // Build delivery window from date + hour
  const buildDeliveryWindow = () => {
    const date = getSelectedDate();
    const [hours] = selectedHour.split(":").map(Number);

    const start = new Date(date);
    start.setHours(hours, 0, 0, 0);

    // 2-hour delivery window
    const end = new Date(start);
    end.setHours(end.getHours() + 2);

    return { start, end };
  };

  // Validate delivery window
  const validateWindow = () => {
    const { start } = buildDeliveryWindow();
    const now = new Date();

    if (start <= now) {
      return "La hora de entrega debe ser en el futuro";
    }
    if (dateOption === "other" && !otherDate) {
      return "Selecciona una fecha";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    const validationError = validateWindow();
    if (validationError) {
      setError(validationError);
      return;
    }

    const { start, end } = buildDeliveryWindow();

    startTransition(async () => {
      const result = await createOffer(request.id, {
        delivery_window_start: start.toISOString(),
        delivery_window_end: end.toISOString(),
        message: message.trim() || undefined,
      });

      if (result.success) {
        toast.success("¡Oferta enviada!", {
          description: "Tu oferta ha sido enviada exitosamente",
        });
        router.push(`/provider/offers?new=${result.offerId}`);
      } else {
        if (result.isDuplicate) {
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

  // Format date for display
  const getDateLabel = (opt: DateOption) => {
    const now = new Date();
    if (opt === "today") {
      return `Hoy (${now.toLocaleDateString("es-CL", { weekday: "short", day: "numeric" })})`;
    } else if (opt === "tomorrow") {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return `Mañana (${tomorrow.toLocaleDateString("es-CL", { weekday: "short", day: "numeric" })})`;
    }
    return "Otra fecha";
  };

  // Get min date for "other" option (today)
  const getMinDate = () => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* AC12.7.10.1 - Prominent Earnings Section */}
      <div
        className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white"
        data-testid="earnings-section"
      >
        <p className="text-sm opacity-90">Tu ganancia</p>
        <p className="text-3xl font-bold" data-testid="earnings-amount">
          {earningsPreview.formattedEarnings}
        </p>
        <div className="flex items-center gap-2 mt-1 text-sm opacity-80">
          <span>Precio: {formatCLP(settings.price)}</span>
          <span>•</span>
          <span>Comisión: {earningsPreview.formattedCommission}</span>
        </div>
        {request.is_urgent && (
          <div className="mt-2 inline-block bg-white/20 px-2 py-0.5 rounded text-xs">
            +{settings.urgency_surcharge_percent}% recargo urgencia
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Error display */}
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* AC12.7.10.1 - Simplified Date Selection with Quick Buttons */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            ¿Cuándo puedes entregar?
          </Label>

          {/* Quick date buttons */}
          <div className="grid grid-cols-3 gap-2" data-testid="date-quick-buttons">
            <Button
              type="button"
              variant={dateOption === "today" ? "default" : "outline"}
              className={`h-11 text-sm ${dateOption === "today" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
              onClick={() => setDateOption("today")}
              data-testid="date-today"
            >
              Hoy
            </Button>
            <Button
              type="button"
              variant={dateOption === "tomorrow" ? "default" : "outline"}
              className={`h-11 text-sm ${dateOption === "tomorrow" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
              onClick={() => setDateOption("tomorrow")}
              data-testid="date-tomorrow"
            >
              Mañana
            </Button>
            <Button
              type="button"
              variant={dateOption === "other" ? "default" : "outline"}
              className={`h-11 text-sm ${dateOption === "other" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
              onClick={() => setDateOption("other")}
              data-testid="date-other"
            >
              Otro
            </Button>
          </div>

          {/* Show date picker only for "other" option */}
          {dateOption === "other" && (
            <input
              type="date"
              value={otherDate}
              onChange={(e) => setOtherDate(e.target.value)}
              min={getMinDate()}
              className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm"
              data-testid="date-other-input"
            />
          )}
        </div>

        {/* AC12.7.10.1 - Hour Selection Dropdown */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            Hora de entrega
          </Label>
          <Select value={selectedHour} onValueChange={setSelectedHour}>
            <SelectTrigger className="h-11" data-testid="hour-select">
              <SelectValue placeholder="Selecciona hora" />
            </SelectTrigger>
            <SelectContent>
              {hourOptions.map((hour) => (
                <SelectItem key={hour} value={hour}>
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Ventana de entrega: {selectedHour} - {parseInt(selectedHour) + 2}:00
          </p>
        </div>

        {/* Offer validity display */}
        <div className="bg-orange-50 rounded-lg px-3 py-2">
          <p className="text-sm text-orange-700 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Tu oferta será válida por {settings.offer_validity_minutes} minutos
          </p>
        </div>

        {/* Collapsible message field */}
        {!showMessageField ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowMessageField(true)}
            className="text-gray-500"
            data-testid="add-message-button"
          >
            + Agregar mensaje (opcional)
          </Button>
        ) : (
          <div className="space-y-1">
            <Label htmlFor="message" className="text-sm text-gray-600">
              Mensaje para el cliente (opcional)
            </Label>
            <Textarea
              id="message"
              placeholder="Ej: Disponibilidad inmediata, camión con capacidad..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={2}
              className="text-sm resize-none"
              data-testid="offer-message-input"
            />
            <p className="text-xs text-gray-400 text-right">
              {message.length}/500
            </p>
          </div>
        )}

        {/* AC12.7.10.1 - Submit button shows earnings */}
        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700 h-14 text-base font-semibold"
            disabled={isPending}
            data-testid="submit-offer-button"
          >
            {isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                ENVIAR OFERTA
              </>
            )}
          </Button>
        </div>

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            className="w-full h-11"
          >
            Cancelar
          </Button>
        )}
      </form>
    </div>
  );
}

/**
 * Skeleton loader for offer form
 */
export function OfferFormSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      {/* Earnings section skeleton */}
      <div className="bg-gray-200 h-24" />

      {/* Form skeleton */}
      <div className="p-4 space-y-4">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-11 bg-gray-200 rounded" />
          <div className="h-11 bg-gray-200 rounded" />
          <div className="h-11 bg-gray-200 rounded" />
        </div>
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-11 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-100 rounded" />
        <div className="h-14 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

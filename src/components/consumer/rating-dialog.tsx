"use client";

import { useState, useEffect } from "react";
import { Loader2, Star, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RatingStars } from "@/components/shared/rating-stars";
import { submitRating, getRatingByRequest, type Rating } from "@/lib/actions/ratings";

interface RatingDialogProps {
  requestId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRatingSubmitted?: () => void;
  /** Optional provider name for personalized messaging */
  providerName?: string;
}

/**
 * Rating Dialog Component
 *
 * Story 12.7-13: Rating/Review System
 * AC12.7.13.1: Rating prompt after delivery complete
 * AC12.7.13.2: 5-star rating system with tap-to-select
 * AC12.7.13.3: Optional comment field (max 500 chars)
 *
 * Flow:
 * 1. Check for existing rating (allows updating)
 * 2. Select star rating (required)
 * 3. Add comment (optional)
 * 4. Submit or skip
 */
export function RatingDialog({
  requestId,
  open,
  onOpenChange,
  onRatingSubmitted,
  providerName,
}: RatingDialogProps) {
  // Form state
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingRating, setExistingRating] = useState<Rating | null>(null);

  // Load existing rating when dialog opens
  useEffect(() => {
    if (open && requestId) {
      setIsLoading(true);
      getRatingByRequest(requestId)
        .then((result) => {
          if (result.success && result.data) {
            setExistingRating(result.data);
            setRating(result.data.rating);
            setComment(result.data.comment || "");
          } else {
            setExistingRating(null);
            setRating(0);
            setComment("");
          }
        })
        .catch((err) => {
          console.error("[RatingDialog] Error loading existing rating:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, requestId]);

  // Handle dialog close
  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen);
    }
  };

  // Handle skip action - AC12.7.13.1
  const handleSkip = () => {
    onOpenChange(false);
    // Don't trigger onRatingSubmitted since nothing was submitted
  };

  // Handle submit
  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Selecciona una calificación", {
        description: "Toca las estrellas para calificar",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitRating({
        request_id: requestId,
        rating,
        comment: comment.trim() || undefined,
      });

      if (!result.success) {
        toast.error("Error al enviar calificación", {
          description: result.error || "Por favor, intenta de nuevo",
        });
        return;
      }

      // Success toast
      const message = result.data?.isUpdate
        ? "Calificación actualizada"
        : "Gracias por tu calificación";
      toast.success(message, {
        description: providerName
          ? `Tu opinión ayuda a otros usuarios a elegir a ${providerName}`
          : "Tu opinión ayuda a otros usuarios",
      });

      // Close dialog and notify parent
      onOpenChange(false);
      onRatingSubmitted?.();
    } catch (err) {
      console.error("[RatingDialog] Submit error:", err);
      toast.error("Error al enviar calificación", {
        description: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rating labels for accessibility and visual feedback
  const ratingLabels: Record<number, string> = {
    1: "Muy malo",
    2: "Malo",
    3: "Regular",
    4: "Bueno",
    5: "Excelente",
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        data-testid="rating-dialog"
        showCloseButton={!isSubmitting}
      >
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-2 text-center justify-center"
            data-testid="rating-dialog-title"
          >
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            {existingRating ? "Actualizar Calificación" : "¿Cómo fue tu experiencia?"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {providerName
              ? `Califica tu experiencia con ${providerName}`
              : "Tu opinión nos ayuda a mejorar el servicio"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          // Loading state
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-5 py-4">
            {/* Star rating input - AC12.7.13.2 */}
            <div className="flex flex-col items-center gap-3">
              <RatingStars
                value={rating}
                onChange={setRating}
                size="lg"
                data-testid="rating-stars-input"
              />
              {/* Rating label feedback */}
              <div className="h-6">
                {rating > 0 && (
                  <span
                    className="text-sm font-medium text-gray-600"
                    data-testid="rating-label"
                  >
                    {ratingLabels[rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Comment textarea - AC12.7.13.3 */}
            <div className="space-y-2">
              <Label
                htmlFor="rating-comment"
                className="text-sm text-gray-600"
              >
                Comentario (opcional)
              </Label>
              <Textarea
                id="rating-comment"
                placeholder="Cuentanos tu experiencia..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="resize-none"
                rows={3}
                maxLength={500}
                data-testid="rating-comment"
              />
              <p className="text-xs text-gray-400 text-right">
                {comment.length}/500
              </p>
            </div>

            {/* Existing rating indicator */}
            {existingRating && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                <Check className="h-4 w-4 text-green-500" />
                <span>Ya calificaste esta entrega. Puedes actualizar tu calificación.</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {/* Skip button - only show for new ratings - AC12.7.13.1 */}
          {!existingRating && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              disabled={isSubmitting || isLoading}
              className="text-gray-500"
              data-testid="rating-skip-button"
            >
              Omitir
            </Button>
          )}

          {/* Cancel button for existing ratings */}
          {existingRating && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              data-testid="rating-cancel-button"
            >
              Cancelar
            </Button>
          )}

          {/* Submit button */}
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting || isLoading}
            className="bg-[#0077B6] hover:bg-[#005f8f]"
            data-testid="rating-submit-button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : existingRating ? (
              "Actualizar"
            ) : (
              "Enviar Calificación"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RatingDialog;

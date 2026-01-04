"use client";

import { useState, memo, useCallback } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  /**
   * Current rating value (1-5)
   */
  value: number;
  /**
   * Callback when rating changes (only in interactive mode)
   */
  onChange?: (rating: number) => void;
  /**
   * Whether the component is read-only (display only)
   * @default false
   */
  readonly?: boolean;
  /**
   * Size of the stars
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Additional CSS classes for the container
   */
  className?: string;
  /**
   * Test ID for the component
   */
  "data-testid"?: string;
}

/**
 * Star size classes based on size prop
 */
const STAR_SIZES = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-10 h-10",
} as const;

/**
 * Gap classes based on size prop
 */
const GAP_SIZES = {
  sm: "gap-0.5",
  md: "gap-1",
  lg: "gap-1.5",
} as const;

/**
 * Reusable Rating Stars Component
 *
 * Story 12.7-13: Rating/Review System
 * AC12.7.13.2: 5-star rating system with tap-to-select
 *
 * Supports two modes:
 * - Interactive: User can tap stars to set rating (onChange required)
 * - Readonly: Display-only for showing existing ratings
 */
function RatingStarsComponent({
  value,
  onChange,
  readonly = false,
  size = "md",
  className,
  "data-testid": testId,
}: RatingStarsProps) {
  // Hover state for interactive mode visual feedback
  const [hoverValue, setHoverValue] = useState<number>(0);

  // Handle star click
  const handleClick = useCallback(
    (starValue: number) => {
      if (!readonly && onChange) {
        onChange(starValue);
      }
    },
    [readonly, onChange]
  );

  // Handle mouse enter for hover effect
  const handleMouseEnter = useCallback(
    (starValue: number) => {
      if (!readonly) {
        setHoverValue(starValue);
      }
    },
    [readonly]
  );

  // Handle mouse leave to reset hover
  const handleMouseLeave = useCallback(() => {
    setHoverValue(0);
  }, []);

  // Determine which value to use for display (hover takes precedence)
  const displayValue = hoverValue > 0 ? hoverValue : value;

  return (
    <div
      className={cn(
        "flex items-center",
        GAP_SIZES[size],
        readonly ? "" : "cursor-pointer",
        className
      )}
      role={readonly ? "img" : "group"}
      aria-label={
        readonly
          ? `Calificación: ${value} de 5 estrellas`
          : `Selecciona una calificación: ${value} de 5 estrellas`
      }
      data-testid={testId || "rating-stars"}
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isFilled = starValue <= displayValue;
        const isInteractive = !readonly && onChange;

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            disabled={readonly}
            className={cn(
              "transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-1 rounded",
              isInteractive ? "hover:scale-110 active:scale-95" : "",
              readonly ? "cursor-default" : "cursor-pointer"
            )}
            aria-label={`${starValue} ${starValue === 1 ? "estrella" : "estrellas"}`}
            data-testid={`star-${starValue}`}
          >
            <Star
              className={cn(
                STAR_SIZES[size],
                "transition-colors duration-150",
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-transparent text-gray-300"
              )}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}

// Memoized export to prevent unnecessary re-renders
export const RatingStars = memo(RatingStarsComponent);
export default RatingStars;

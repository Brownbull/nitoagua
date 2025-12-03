"use client";

import { Droplet } from "lucide-react";
import { cn } from "@/lib/utils";

interface BigActionButtonProps {
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function BigActionButton({
  onClick,
  loading = false,
  disabled = false,
}: BigActionButtonProps) {
  return (
    <button
      data-testid="big-action-button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        // Base styles - 200x200px circular button
        "flex h-[200px] w-[200px] flex-col items-center justify-center gap-3 rounded-full",
        // Gradient background
        "bg-gradient-to-br from-[#0077B6] to-[#00A8E8]",
        // Shadow
        "shadow-lg",
        // Text
        "text-white font-semibold text-lg",
        // Transitions
        "transition-all duration-200 ease-out",
        // States
        "hover:scale-105",
        "active:scale-[0.98]",
        // Focus ring for accessibility
        "focus:outline-none focus:ring-4 focus:ring-[#0077B6]/50",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
        // Loading pulse animation
        loading && "animate-pulse"
      )}
    >
      <Droplet className="h-12 w-12" strokeWidth={2} />
      <span>Solicitar Agua</span>
    </button>
  );
}

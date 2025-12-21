"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatusBadge, type RequestStatus } from "@/components/shared/status-badge";

interface GradientHeaderProps {
  title: string;
  status?: RequestStatus;
  showBack?: boolean;
  badgeText?: string;
}

/**
 * Gradient header component matching mockup design
 *
 * Features:
 * - Linear gradient from primary-lighter to white
 * - nitoagua logo in Pacifico font
 * - Back button with white background
 * - Status badge in header row
 * - Screen title below
 */
export function GradientHeader({
  title,
  status,
  showBack = true,
  badgeText
}: GradientHeaderProps) {
  const router = useRouter();

  return (
    <div
      className="px-5 pt-3 pb-2 flex-shrink-0"
      style={{
        background: "linear-gradient(180deg, #CAF0F8 0%, white 100%)"
      }}
    >
      {/* Header row with back button, logo, and status badge */}
      <div className="flex items-center gap-3 mb-2">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-gray-600 shadow-sm border-0 cursor-pointer"
            aria-label="Volver"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Logo */}
        <span
          className="text-[#0077B6] text-xl"
          style={{ fontFamily: "'Pacifico', cursive" }}
        >
          nitoagua
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Status badge */}
        {status && <StatusBadge status={status} />}
        {badgeText && !status && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#DBEAFE] text-[#1E40AF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
            {badgeText}
          </span>
        )}
      </div>

      {/* Screen title */}
      <h1 className="text-[1.375rem] font-extrabold text-gray-900 leading-tight">
        {title}
      </h1>
    </div>
  );
}

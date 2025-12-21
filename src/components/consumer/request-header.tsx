"use client";

import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequestHeaderProps {
  title: string;
  subtitle: string;
  step: number;
  totalSteps: number;
  onBack?: () => void;
  onNext?: () => void;
  backHref?: string;
  nextLabel?: string;
  backLabel?: string;
  showNavButtons?: boolean;
  nextDisabled?: boolean;
  nextVariant?: "default" | "success";
}

/**
 * Request flow header matching mockup design
 * Features:
 * - Gradient background (CAF0F8 to white)
 * - Back button with nitoagua logo
 * - Title and subtitle
 * - Progress bar with step indicator
 * - Navigation buttons after progress bar
 */
export function RequestHeader({
  title,
  subtitle,
  step,
  totalSteps,
  onBack,
  onNext,
  backHref = "/",
  nextLabel = "Continuar",
  backLabel = "Anterior",
  showNavButtons = false,
  nextDisabled = false,
  nextVariant = "default",
}: RequestHeaderProps) {
  const progress = Math.round((step / totalSteps) * 100);

  const HeaderBackButton = () => (
    <button
      onClick={onBack}
      className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
      data-testid="header-back-button"
    >
      <ArrowLeft className="w-5 h-5 text-gray-600" />
      <span className="sr-only">Volver</span>
    </button>
  );

  const HeaderBackLink = () => (
    <Link
      href={backHref}
      className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
      data-testid="header-back-button"
    >
      <ArrowLeft className="w-5 h-5 text-gray-600" />
      <span className="sr-only">Volver al inicio</span>
    </Link>
  );

  return (
    <div className="flex-shrink-0">
      {/* Gradient header */}
      <div
        className="px-5 pt-3 pb-2"
        style={{ background: "linear-gradient(180deg, #CAF0F8 0%, white 100%)" }}
      >
        {/* Header row */}
        <div className="flex items-center gap-3 mb-2">
          {step === 1 ? <HeaderBackLink /> : <HeaderBackButton />}
          <span
            className="text-[22px] text-[#0077B6]"
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            nitoagua
          </span>
        </div>

        {/* Title */}
        <h1 className="text-[22px] font-extrabold text-gray-900 leading-tight">
          {title}
        </h1>
        <p className="text-[15px] text-gray-600 mt-0.5">{subtitle}</p>
      </div>

      {/* Progress section */}
      <div className="px-5 py-3 bg-white border-b border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Paso {step} de {totalSteps}
          </span>
          <span className="text-sm text-gray-500">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded overflow-hidden">
          <div
            className="h-full bg-[#0077B6] rounded transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Navigation buttons row for steps > 1 */}
        {step > 1 && (
          <div className="flex justify-between items-center mt-3">
            {/* Back button */}
            {onBack && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="h-10 px-4 rounded-xl border-gray-200 text-gray-600"
                data-testid="nav-back-button"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {backLabel}
              </Button>
            )}

            {/* Next/Submit button */}
            {showNavButtons && onNext && (
              <Button
                type="button"
                onClick={onNext}
                disabled={nextDisabled}
                className={`h-10 px-6 text-white rounded-xl ${
                  nextVariant === "success"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-[#0077B6] hover:bg-[#005f8f]"
                }`}
                data-testid="nav-next-button"
              >
                {nextLabel}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

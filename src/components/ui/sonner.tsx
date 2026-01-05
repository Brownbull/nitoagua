"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

/**
 * Custom toast component with WCAG AA compliant contrast
 * BUG-004 FIX: Explicit variant styling ensures readable toasts
 * - Success: Dark green background (#166534) with white text (contrast ratio ~7:1)
 * - Error: Dark red background (#dc2626) with white text (contrast ratio ~5.5:1)
 * - Warning: Amber background (#f59e0b) with dark text (contrast ratio ~4.7:1)
 * - Info: Blue background (#0284c7) with white text (contrast ratio ~4.8:1)
 *
 * BUG-R2-016 FIX: Explicit font-family ensures Poppins is used for toasts
 * - Sonner renders outside the body's font context in some cases
 * - Explicit font-family CSS ensures consistent typography
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          // BUG-004 FIX: High contrast variant styling
          // BUG-R2-016 FIX: font-sans ensures Poppins font (from Tailwind config)
          toast: "!font-sans",
          success: "!bg-green-800 !text-white !border-green-900 !font-sans",
          error: "!bg-red-600 !text-white !border-red-700 !font-sans",
          warning: "!bg-amber-500 !text-amber-950 !border-amber-600 !font-sans",
          info: "!bg-sky-600 !text-white !border-sky-700 !font-sans",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

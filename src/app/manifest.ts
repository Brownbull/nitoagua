import type { MetadataRoute } from "next";

/**
 * PWA Manifest configuration
 * BUG-018 FIX: Added maskable purpose for notification icons on Android
 * The maskable purpose allows the icon to be displayed correctly in
 * adaptive icon containers on Android devices and notification trays.
 * Note: Next.js types only accept single purpose values per icon entry.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "nitoagua",
    short_name: "nitoagua",
    description: "Coordina tu entrega de agua",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0077B6",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      // Duplicate icons with "any" purpose for broader compatibility
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
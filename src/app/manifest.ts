import type { MetadataRoute } from "next";

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
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
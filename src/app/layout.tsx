import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "nitoagua",
  description: "Coordina tu entrega de agua",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "nitoagua",
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0077B6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <ServiceWorkerRegistration />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Poppins, Pacifico } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pacifico",
  display: "swap",
});

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
    <html lang="es" className={`${poppins.variable} ${pacifico.variable}`}>
      <body className="antialiased font-sans">
        <ServiceWorkerRegistration />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

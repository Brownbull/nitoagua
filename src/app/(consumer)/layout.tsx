import type { Metadata } from "next";
import { ConsumerNav } from "@/components/layout/consumer-nav";

export const metadata: Metadata = {
  title: "nitoagua - Solicitar Agua",
  description: "Solicita tu entrega de agua de manera fácil y rápida",
};

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col pb-16">{children}</main>
      <ConsumerNav />
    </div>
  );
}

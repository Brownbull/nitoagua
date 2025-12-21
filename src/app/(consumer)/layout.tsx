import type { Metadata } from "next";
import { ConsumerLayoutWrapper } from "@/components/layout/consumer-layout-wrapper";

export const metadata: Metadata = {
  title: "nitoagua - Solicitar Agua",
  description: "Solicita tu entrega de agua de manera fácil y rápida",
};

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConsumerLayoutWrapper>{children}</ConsumerLayoutWrapper>;
}

import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { Header, Footer, Button } from "./components";

const successGreen = "#10B981";

export interface RequestDeliveredProps {
  customerName: string;
  requestId: string;
  amount: number;
  address: string;
  supplierName: string;
  deliveredAt: string;
  feedbackUrl: string;
}

export function RequestDelivered({
  customerName = "Cliente",
  requestId = "REQ-001",
  amount = 20,
  address = "Tu dirección",
  supplierName = "Agua Pura SpA",
  deliveredAt = "14:32",
  feedbackUrl = "https://nitoagua.cl/feedback/REQ-001",
}: RequestDeliveredProps) {
  const previewText = `¡Tu agua ha sido entregada! ${amount}L de agua fresca para tu hogar.`;

  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Header title="¡Entrega Completada!" />

          <Section style={contentStyle}>
            <Text style={greetingStyle}>Hola {customerName},</Text>

            <Text style={paragraphStyle}>
              ¡Excelente! Tu pedido de agua ha sido{" "}
              <strong style={{ color: successGreen }}>entregado</strong>{" "}
              exitosamente.
            </Text>

            <Section style={successBannerStyle}>
              <Text style={successEmojiStyle}>🎉</Text>
              <Text style={successTextStyle}>¡Disfruta tu agua fresca!</Text>
            </Section>

            <Section style={detailsBoxStyle}>
              <Text style={detailLabelStyle}>Número de Solicitud:</Text>
              <Text style={detailValueStyle}>{requestId}</Text>

              <Text style={detailLabelStyle}>Cantidad Entregada:</Text>
              <Text style={detailValueStyle}>{amount} litros</Text>

              <Text style={detailLabelStyle}>Dirección:</Text>
              <Text style={detailValueStyle}>{address}</Text>

              <Text style={detailLabelStyle}>Proveedor:</Text>
              <Text style={detailValueStyle}>{supplierName}</Text>

              <Text style={detailLabelStyle}>Hora de Entrega:</Text>
              <Text style={deliveryTimeStyle}>✅ {deliveredAt}</Text>
            </Section>

            <Text style={paragraphStyle}>
              ¿Cómo fue tu experiencia? Tu opinión nos ayuda a mejorar el
              servicio.
            </Text>

            <Section style={buttonContainerStyle}>
              <Button href={feedbackUrl}>Dejar Comentario</Button>
            </Section>

            <Text style={thankYouStyle}>
              ¡Gracias por usar nitoagua! 💧
            </Text>
          </Section>

          <Footer />
        </Container>
      </Body>
    </Html>
  );
}

// Preview props for React Email dev server
RequestDelivered.PreviewProps = {
  customerName: "María García",
  requestId: "REQ-2024-001",
  amount: 20,
  address: "Av. Providencia 1234, Santiago",
  supplierName: "Agua Pura Los Andes",
  deliveredAt: "14:32",
  feedbackUrl: "https://nitoagua.cl/feedback/REQ-2024-001",
} satisfies RequestDeliveredProps;

export default RequestDelivered;

// Styles
const mainStyle: React.CSSProperties = {
  backgroundColor: "#f4f4f4",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  padding: "40px 0",
};

const containerStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
};

const contentStyle: React.CSSProperties = {
  padding: "32px 24px",
};

const greetingStyle: React.CSSProperties = {
  fontSize: "18px",
  color: "#333333",
  margin: "0 0 16px 0",
};

const paragraphStyle: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#333333",
  margin: "0 0 16px 0",
};

const successBannerStyle: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
  border: "2px solid #10B981",
};

const successEmojiStyle: React.CSSProperties = {
  fontSize: "48px",
  margin: "0 0 8px 0",
};

const successTextStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "bold",
  color: successGreen,
  margin: "0",
};

const detailsBoxStyle: React.CSSProperties = {
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  border: "1px solid #e0e0e0",
};

const detailLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "bold",
  color: "#666666",
  textTransform: "uppercase" as const,
  margin: "12px 0 4px 0",
};

const detailValueStyle: React.CSSProperties = {
  fontSize: "16px",
  color: "#333333",
  margin: "0 0 8px 0",
};

const deliveryTimeStyle: React.CSSProperties = {
  fontSize: "16px",
  color: successGreen,
  fontWeight: "bold",
  margin: "0",
};

const buttonContainerStyle: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const thankYouStyle: React.CSSProperties = {
  fontSize: "16px",
  textAlign: "center" as const,
  color: "#666666",
  margin: "24px 0 0 0",
};

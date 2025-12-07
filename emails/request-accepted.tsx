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

const brandPrimary = "#0077B6";
const successGreen = "#10B981";

export interface RequestAcceptedProps {
  customerName: string;
  requestId: string;
  trackingUrl: string;
  amount: number;
  address: string;
  supplierName: string;
  estimatedDelivery: string;
}

export function RequestAccepted({
  customerName = "Cliente",
  requestId = "REQ-001",
  trackingUrl = "https://nitoagua.cl/track/REQ-001",
  amount = 20,
  address = "Tu dirección",
  supplierName = "Agua Pura SpA",
  estimatedDelivery = "Hoy, 14:00 - 16:00",
}: RequestAcceptedProps) {
  const previewText = `¡Tu solicitud de agua ha sido aceptada! Entrega estimada: ${estimatedDelivery}`;

  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Header title="¡Solicitud Aceptada!" />

          <Section style={contentStyle}>
            <Text style={greetingStyle}>Hola {customerName},</Text>

            <Text style={paragraphStyle}>
              ¡Buenas noticias! Tu solicitud de agua ha sido{" "}
              <strong style={{ color: successGreen }}>aceptada</strong> por un
              proveedor.
            </Text>

            <Section style={detailsBoxStyle}>
              <Text style={detailLabelStyle}>Número de Solicitud:</Text>
              <Text style={detailValueStyle}>{requestId}</Text>

              <Text style={detailLabelStyle}>Cantidad:</Text>
              <Text style={detailValueStyle}>{amount} litros</Text>

              <Text style={detailLabelStyle}>Dirección de Entrega:</Text>
              <Text style={detailValueStyle}>{address}</Text>

              <Text style={detailLabelStyle}>Proveedor:</Text>
              <Text style={detailValueStyle}>{supplierName}</Text>

              <Text style={detailLabelStyle}>Entrega Estimada:</Text>
              <Text style={deliveryTimeStyle}>🚚 {estimatedDelivery}</Text>

              <Text style={detailLabelStyle}>Estado:</Text>
              <Text style={statusAcceptedStyle}>✅ Aceptada</Text>
            </Section>

            <Text style={paragraphStyle}>
              El proveedor está preparando tu pedido. Te notificaremos cuando el
              agua sea entregada.
            </Text>

            <Section style={buttonContainerStyle}>
              <Button href={trackingUrl}>Seguir Mi Pedido</Button>
            </Section>

            <Text style={helpTextStyle}>
              Si necesitas hacer cambios o tienes preguntas, contacta al
              proveedor a través de la aplicación.
            </Text>
          </Section>

          <Footer />
        </Container>
      </Body>
    </Html>
  );
}

// Preview props for React Email dev server
RequestAccepted.PreviewProps = {
  customerName: "María García",
  requestId: "REQ-2024-001",
  trackingUrl: "https://nitoagua.cl/track/REQ-2024-001",
  amount: 20,
  address: "Av. Providencia 1234, Santiago",
  supplierName: "Agua Pura Los Andes",
  estimatedDelivery: "Hoy, 14:00 - 16:00",
} satisfies RequestAcceptedProps;

export default RequestAccepted;

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

const detailsBoxStyle: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  border: "1px solid #bbf7d0",
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
  fontSize: "18px",
  color: brandPrimary,
  fontWeight: "bold",
  margin: "0 0 8px 0",
};

const statusAcceptedStyle: React.CSSProperties = {
  fontSize: "16px",
  color: successGreen,
  fontWeight: "bold",
  margin: "0",
};

const buttonContainerStyle: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const helpTextStyle: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#666666",
  margin: "24px 0 0 0",
};

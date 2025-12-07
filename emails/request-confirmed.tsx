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

export interface RequestConfirmedProps {
  customerName: string;
  requestId: string;
  trackingUrl: string;
  amount: number;
  address: string;
}

export function RequestConfirmed({
  customerName = "Cliente",
  requestId = "REQ-001",
  trackingUrl = "https://nitoagua.cl/track/REQ-001",
  amount = 20,
  address = "Tu dirección",
}: RequestConfirmedProps) {
  const previewText = `¡Tu solicitud de ${amount}L de agua ha sido recibida!`;

  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Header title="¡Solicitud Recibida!" />

          <Section style={contentStyle}>
            <Text style={greetingStyle}>Hola {customerName},</Text>

            <Text style={paragraphStyle}>
              Tu solicitud de <strong>{amount} litros</strong> de agua ha sido
              recibida exitosamente.
            </Text>

            <Section style={detailsBoxStyle}>
              <Text style={detailLabelStyle}>Número de Solicitud:</Text>
              <Text style={detailValueStyle}>{requestId}</Text>

              <Text style={detailLabelStyle}>Cantidad:</Text>
              <Text style={detailValueStyle}>{amount} litros</Text>

              <Text style={detailLabelStyle}>Dirección de Entrega:</Text>
              <Text style={detailValueStyle}>{address}</Text>

              <Text style={detailLabelStyle}>Estado:</Text>
              <Text style={statusStyle}>⏳ Pendiente</Text>
            </Section>

            <Text style={paragraphStyle}>
              Un proveedor cercano revisará tu solicitud pronto. Te notificaremos
              cuando sea aceptada.
            </Text>

            <Section style={buttonContainerStyle}>
              <Button href={trackingUrl}>Ver Estado de Solicitud</Button>
            </Section>

            <Text style={helpTextStyle}>
              Si tienes alguna pregunta, puedes responder a este correo o
              contactarnos directamente.
            </Text>
          </Section>

          <Footer />
        </Container>
      </Body>
    </Html>
  );
}

// Preview props for React Email dev server
RequestConfirmed.PreviewProps = {
  customerName: "María García",
  requestId: "REQ-2024-001",
  trackingUrl: "https://nitoagua.cl/track/REQ-2024-001",
  amount: 20,
  address: "Av. Providencia 1234, Santiago",
} satisfies RequestConfirmedProps;

export default RequestConfirmed;

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

const statusStyle: React.CSSProperties = {
  fontSize: "16px",
  color: brandPrimary,
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

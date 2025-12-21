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

const brandWarning = "#F59E0B"; // Orange/amber for warning state

export interface RequestTimeoutProps {
  customerName: string;
  requestId: string;
  trackingUrl: string;
  amount: number;
  address: string;
}

/**
 * Email template for request timeout notification
 *
 * Sent when a water request has been pending for 4+ hours
 * with no provider offers.
 *
 * Story 10.4: Request Timeout Notification
 * AC10.4.4: Consumer receives email notification about timeout
 */
export function RequestTimeoutEmail({
  customerName = "Cliente",
  requestId = "REQ-001",
  trackingUrl = "https://nitoagua.cl/track/REQ-001",
  amount = 1000,
  address = "Tu dirección",
}: RequestTimeoutProps) {
  const previewText = `Lo sentimos, tu solicitud de ${amount}L no recibió ofertas`;

  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Header title="Sin Ofertas Disponibles" />

          <Section style={contentStyle}>
            <Text style={greetingStyle}>Hola {customerName},</Text>

            <Text style={paragraphStyle}>
              Tu solicitud de <strong>{amount.toLocaleString("es-CL")} litros</strong> de agua
              no recibió ofertas de repartidores en las últimas 4 horas.
            </Text>

            <Section style={warningBoxStyle}>
              <Text style={warningIconStyle}>⏱️</Text>
              <Text style={warningTitleStyle}>Sin respuesta</Text>
              <Text style={warningTextStyle}>
                Esto puede ocurrir en horarios de baja demanda o zonas con
                pocos aguateros registrados.
              </Text>
            </Section>

            <Section style={detailsBoxStyle}>
              <Text style={detailLabelStyle}>Número de Solicitud:</Text>
              <Text style={detailValueStyle}>{requestId.slice(0, 8)}...</Text>

              <Text style={detailLabelStyle}>Cantidad:</Text>
              <Text style={detailValueStyle}>{amount.toLocaleString("es-CL")} litros</Text>

              <Text style={detailLabelStyle}>Dirección de Entrega:</Text>
              <Text style={detailValueStyle}>{address}</Text>

              <Text style={detailLabelStyle}>Estado:</Text>
              <Text style={statusStyle}>⚠️ Sin Ofertas</Text>
            </Section>

            <Text style={paragraphStyle}>
              Te invitamos a intentar de nuevo más tarde o contactar a nuestro
              equipo de soporte para recibir ayuda.
            </Text>

            <Section style={buttonContainerStyle}>
              <Button href={trackingUrl}>Nueva Solicitud</Button>
            </Section>

            <Section style={supportBoxStyle}>
              <Text style={supportTitleStyle}>¿Necesitas ayuda?</Text>
              <Text style={supportTextStyle}>
                Contáctanos por WhatsApp y te ayudaremos a encontrar un
                proveedor en tu zona.
              </Text>
              <Text style={whatsappLinkStyle}>
                <a
                  href="https://wa.me/56912345678?text=Hola,%20necesito%20ayuda%20con%20mi%20solicitud%20de%20agua"
                  style={{ color: "#25D366", textDecoration: "underline" }}
                >
                  📱 Contactar Soporte
                </a>
              </Text>
            </Section>

            <Text style={helpTextStyle}>
              Agradecemos tu paciencia y comprensión.
            </Text>
          </Section>

          <Footer />
        </Container>
      </Body>
    </Html>
  );
}

// Preview props for React Email dev server
RequestTimeoutEmail.PreviewProps = {
  customerName: "María García",
  requestId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  trackingUrl: "https://nitoagua.cl/track/abc123",
  amount: 5000,
  address: "Av. Providencia 1234, Quilicura",
} satisfies RequestTimeoutProps;

export default RequestTimeoutEmail;

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

const warningBoxStyle: React.CSSProperties = {
  backgroundColor: "#FEF3C7",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  textAlign: "center" as const,
  border: `1px solid ${brandWarning}`,
};

const warningIconStyle: React.CSSProperties = {
  fontSize: "32px",
  margin: "0 0 8px 0",
};

const warningTitleStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#92400E",
  margin: "0 0 8px 0",
};

const warningTextStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#92400E",
  margin: "0",
  lineHeight: "20px",
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
  color: brandWarning,
  fontWeight: "bold",
  margin: "0",
};

const buttonContainerStyle: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const supportBoxStyle: React.CSSProperties = {
  backgroundColor: "#ECFDF5",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
  textAlign: "center" as const,
  border: "1px solid #10B981",
};

const supportTitleStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#065F46",
  margin: "0 0 8px 0",
};

const supportTextStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#065F46",
  margin: "0 0 12px 0",
  lineHeight: "20px",
};

const whatsappLinkStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0",
};

const helpTextStyle: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#666666",
  margin: "24px 0 0 0",
};

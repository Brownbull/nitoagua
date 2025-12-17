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

export interface OfferAcceptedProps {
  providerName: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  amount: number;
  deliveryWindowStart: string;
  deliveryWindowEnd: string;
  requestId: string;
  deliveryUrl?: string;
}

/**
 * Email template for provider notification when their offer is accepted
 * AC: 8.5.2 - Email notification sent with delivery details
 * AC: 8.5.3 - Includes: customer name, phone, full address, amount, delivery window
 */
export function OfferAccepted({
  providerName = "Proveedor",
  customerName = "Cliente",
  customerPhone = "+56 9 1234 5678",
  deliveryAddress = "Av. Providencia 1234, Providencia",
  amount = 5000,
  deliveryWindowStart = "2025-12-16T14:00:00",
  deliveryWindowEnd = "2025-12-16T16:00:00",
  requestId = "REQ-001",
  deliveryUrl = "https://nitoagua.cl/provider/deliveries",
}: OfferAcceptedProps) {
  // Format delivery window for display
  const formatTime = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      return date.toLocaleString("es-CL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoDate;
    }
  };

  const formatTimeOnly = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      return date.toLocaleString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoDate;
    }
  };

  const previewText = `¡Tu oferta fue aceptada! Prepara la entrega de ${amount.toLocaleString("es-CL")}L`;

  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Header title="¡Tu Oferta Fue Aceptada!" />

          <Section style={contentStyle}>
            <Text style={greetingStyle}>Hola {providerName},</Text>

            <Text style={paragraphStyle}>
              <strong style={{ color: successGreen }}>¡Buenas noticias!</strong>{" "}
              Tu oferta ha sido aceptada por un cliente. Prepárate para realizar
              la entrega.
            </Text>

            {/* Delivery Details Box - AC: 8.5.3 */}
            <Section style={detailsBoxStyle}>
              <Text style={sectionTitleStyle}>DETALLES DE LA ENTREGA</Text>

              <Text style={detailLabelStyle}>Cliente:</Text>
              <Text style={detailValueStyle}>{customerName}</Text>

              <Text style={detailLabelStyle}>Teléfono:</Text>
              <Text style={phoneStyle}>
                <a href={`tel:${customerPhone}`} style={phoneLinkStyle}>
                  {customerPhone}
                </a>
              </Text>

              <Text style={detailLabelStyle}>Dirección:</Text>
              <Text style={addressStyle}>{deliveryAddress}</Text>

              <Text style={detailLabelStyle}>Cantidad:</Text>
              <Text style={amountStyle}>
                {amount.toLocaleString("es-CL")} litros
              </Text>

              <Text style={detailLabelStyle}>Ventana de Entrega:</Text>
              <Text style={deliveryTimeStyle}>
                {formatTime(deliveryWindowStart)} - {formatTimeOnly(deliveryWindowEnd)}
              </Text>
            </Section>

            {/* Call to Action - AC: 8.5.4 */}
            <Section style={buttonContainerStyle}>
              <Button href={deliveryUrl}>Ver Detalles de Entrega</Button>
            </Section>

            <Text style={instructionsStyle}>
              <strong>Próximos pasos:</strong>
            </Text>
            <Text style={instructionItemStyle}>
              1. Prepara el agua para la entrega
            </Text>
            <Text style={instructionItemStyle}>
              2. Llega a tiempo a la dirección indicada
            </Text>
            <Text style={instructionItemStyle}>
              3. Contacta al cliente si necesitas coordinar
            </Text>
            <Text style={instructionItemStyle}>
              4. Marca la entrega como completada en la app
            </Text>

            <Text style={helpTextStyle}>
              Referencia: {requestId}
            </Text>
          </Section>

          <Footer />
        </Container>
      </Body>
    </Html>
  );
}

// Preview props for React Email dev server
OfferAccepted.PreviewProps = {
  providerName: "Juan Pérez",
  customerName: "María García",
  customerPhone: "+56 9 8765 4321",
  deliveryAddress: "Av. Los Leones 456, Providencia",
  amount: 5000,
  deliveryWindowStart: "2025-12-16T14:00:00",
  deliveryWindowEnd: "2025-12-16T16:00:00",
  requestId: "REQ-2025-001",
  deliveryUrl: "https://nitoagua.cl/provider/deliveries/abc123",
} satisfies OfferAcceptedProps;

export default OfferAccepted;

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

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "bold",
  color: brandPrimary,
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 16px 0",
  borderBottom: "1px solid #bbf7d0",
  paddingBottom: "8px",
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

const phoneStyle: React.CSSProperties = {
  fontSize: "16px",
  color: brandPrimary,
  margin: "0 0 8px 0",
};

const phoneLinkStyle: React.CSSProperties = {
  color: brandPrimary,
  textDecoration: "none",
  fontWeight: "bold",
};

const addressStyle: React.CSSProperties = {
  fontSize: "16px",
  color: "#333333",
  margin: "0 0 8px 0",
  fontWeight: "500",
};

const amountStyle: React.CSSProperties = {
  fontSize: "18px",
  color: brandPrimary,
  fontWeight: "bold",
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

const instructionsStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#333333",
  margin: "24px 0 8px 0",
};

const instructionItemStyle: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#666666",
  margin: "4px 0",
  paddingLeft: "8px",
};

const helpTextStyle: React.CSSProperties = {
  fontSize: "12px",
  lineHeight: "18px",
  color: "#999999",
  margin: "24px 0 0 0",
  textAlign: "center" as const,
};

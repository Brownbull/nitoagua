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

const brandRed = "#EF4444";

export interface ProviderRejectedProps {
  providerName: string;
  rejectionReason?: string;
  supportEmail: string;
}

export function ProviderRejected({
  providerName = "Proveedor",
  rejectionReason = "Tu solicitud no cumple con los requisitos necesarios.",
  supportEmail = "soporte@nitoagua.cl",
}: ProviderRejectedProps) {
  const previewText = `Actualización sobre tu solicitud de proveedor en nitoagua`;

  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Header title="Actualización de Solicitud" />

          <Section style={contentStyle}>
            <Text style={greetingStyle}>Hola {providerName},</Text>

            <Text style={paragraphStyle}>
              Lamentamos informarte que tu solicitud para ser proveedor en
              nitoagua <span style={{ color: brandRed, fontWeight: "bold" }}>no ha sido aprobada</span>.
            </Text>

            <Section style={reasonBoxStyle}>
              <Text style={reasonLabelStyle}>Motivo:</Text>
              <Text style={reasonTextStyle}>{rejectionReason}</Text>
            </Section>

            <Text style={paragraphStyle}>
              Si crees que esto es un error o tienes preguntas sobre esta decisión,
              no dudes en contactar a nuestro equipo de soporte.
            </Text>

            <Section style={buttonContainerStyle}>
              <Button href={`mailto:${supportEmail}`}>Contactar Soporte</Button>
            </Section>

            <Text style={helpTextStyle}>
              Agradecemos tu interés en formar parte de nitoagua y te deseamos
              éxito en tus proyectos.
            </Text>
          </Section>

          <Footer />
        </Container>
      </Body>
    </Html>
  );
}

// Preview props for React Email dev server
ProviderRejected.PreviewProps = {
  providerName: "Juan Pérez",
  rejectionReason: "Los documentos proporcionados no cumplen con los requisitos mínimos de verificación.",
  supportEmail: "soporte@nitoagua.cl",
} satisfies ProviderRejectedProps;

export default ProviderRejected;

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

const reasonBoxStyle: React.CSSProperties = {
  backgroundColor: "#FEF2F2",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  border: `1px solid ${brandRed}`,
};

const reasonLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "bold",
  color: brandRed,
  textTransform: "uppercase" as const,
  margin: "0 0 8px 0",
};

const reasonTextStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#333333",
  margin: "0",
  lineHeight: "22px",
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

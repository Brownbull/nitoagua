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

const brandGreen = "#10B981";

export interface ProviderApprovedProps {
  providerName: string;
  dashboardUrl: string;
}

export function ProviderApproved({
  providerName = "Proveedor",
  dashboardUrl = "https://nitoagua.cl/supplier/dashboard",
}: ProviderApprovedProps) {
  const previewText = `¡Felicitaciones ${providerName}! Tu cuenta de proveedor ha sido aprobada`;

  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Header title="¡Cuenta Aprobada!" />

          <Section style={contentStyle}>
            <Text style={greetingStyle}>¡Hola {providerName}!</Text>

            <Text style={paragraphStyle}>
              <strong>¡Felicitaciones!</strong> Tu solicitud para ser proveedor en
              nitoagua ha sido <span style={{ color: brandGreen, fontWeight: "bold" }}>aprobada</span>.
            </Text>

            <Section style={successBoxStyle}>
              <Text style={successIconStyle}>✓</Text>
              <Text style={successTextStyle}>
                Tu cuenta de proveedor está activa
              </Text>
            </Section>

            <Text style={paragraphStyle}>
              Ya puedes comenzar a recibir solicitudes de entrega de agua en tu área de servicio.
            </Text>

            <Section style={stepsBoxStyle}>
              <Text style={stepsHeaderStyle}>Próximos pasos:</Text>
              <Text style={stepStyle}>1. Configura tu disponibilidad horaria</Text>
              <Text style={stepStyle}>2. Activa tu estado &quot;Disponible&quot;</Text>
              <Text style={stepStyle}>3. Comienza a recibir solicitudes</Text>
            </Section>

            <Section style={buttonContainerStyle}>
              <Button href={dashboardUrl}>Ir a mi Panel</Button>
            </Section>

            <Text style={helpTextStyle}>
              Si tienes alguna pregunta sobre cómo funciona la plataforma,
              no dudes en contactarnos.
            </Text>
          </Section>

          <Footer />
        </Container>
      </Body>
    </Html>
  );
}

// Preview props for React Email dev server
ProviderApproved.PreviewProps = {
  providerName: "Juan Pérez",
  dashboardUrl: "https://nitoagua.cl/supplier/dashboard",
} satisfies ProviderApprovedProps;

export default ProviderApproved;

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

const successBoxStyle: React.CSSProperties = {
  backgroundColor: "#ECFDF5",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  textAlign: "center" as const,
  border: `1px solid ${brandGreen}`,
};

const successIconStyle: React.CSSProperties = {
  fontSize: "32px",
  color: brandGreen,
  margin: "0 0 8px 0",
};

const successTextStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  color: brandGreen,
  margin: "0",
};

const stepsBoxStyle: React.CSSProperties = {
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  border: "1px solid #e0e0e0",
};

const stepsHeaderStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#333333",
  margin: "0 0 12px 0",
};

const stepStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#666666",
  margin: "8px 0",
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

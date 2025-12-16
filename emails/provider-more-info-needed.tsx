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

const brandOrange = "#F97316";

export interface ProviderMoreInfoNeededProps {
  providerName: string;
  missingDocuments: string[];
  additionalMessage?: string;
  resubmitUrl: string;
}

// Document type labels in Spanish
const DOCUMENT_LABELS: Record<string, string> = {
  cedula: "Cédula de Identidad",
  licencia: "Licencia de Conducir",
  permiso_sanitario: "Permiso Sanitario",
  certificacion: "Certificación",
  vehiculo: "Fotos del Vehículo",
};

export function ProviderMoreInfoNeeded({
  providerName = "Proveedor",
  missingDocuments = ["cedula", "permiso_sanitario"],
  additionalMessage,
  resubmitUrl = "https://nitoagua.cl/provider/onboarding/pending",
}: ProviderMoreInfoNeededProps) {
  const previewText = `Necesitamos información adicional para procesar tu solicitud`;

  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Header title="Información Adicional Requerida" />

          <Section style={contentStyle}>
            <Text style={greetingStyle}>Hola {providerName},</Text>

            <Text style={paragraphStyle}>
              Hemos revisado tu solicitud para ser proveedor en nitoagua y
              necesitamos que nos proporciones información adicional para
              completar el proceso de verificación.
            </Text>

            <Section style={warningBoxStyle}>
              <Text style={warningIconStyle}>!</Text>
              <Text style={warningTextStyle}>
                Por favor actualiza los siguientes documentos
              </Text>
            </Section>

            <Section style={documentsBoxStyle}>
              <Text style={documentsHeaderStyle}>Documentos requeridos:</Text>
              {missingDocuments.map((doc, index) => (
                <Text key={index} style={documentItemStyle}>
                  • {DOCUMENT_LABELS[doc] || doc}
                </Text>
              ))}
            </Section>

            {additionalMessage && (
              <Section style={messageBoxStyle}>
                <Text style={messageLabelStyle}>Mensaje adicional:</Text>
                <Text style={messageTextStyle}>{additionalMessage}</Text>
              </Section>
            )}

            <Text style={paragraphStyle}>
              Una vez que actualices los documentos, tu solicitud será revisada
              nuevamente y te notificaremos el resultado.
            </Text>

            <Section style={buttonContainerStyle}>
              <Button href={resubmitUrl}>Actualizar Documentos</Button>
            </Section>

            <Text style={helpTextStyle}>
              Si tienes alguna pregunta sobre los requisitos de documentación,
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
ProviderMoreInfoNeeded.PreviewProps = {
  providerName: "Juan Pérez",
  missingDocuments: ["cedula", "permiso_sanitario"],
  additionalMessage: "La imagen de tu cédula está borrosa y el permiso sanitario está vencido.",
  resubmitUrl: "https://nitoagua.cl/provider/onboarding/pending",
} satisfies ProviderMoreInfoNeededProps;

export default ProviderMoreInfoNeeded;

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
  backgroundColor: "#FFF7ED",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  textAlign: "center" as const,
  border: `1px solid ${brandOrange}`,
};

const warningIconStyle: React.CSSProperties = {
  fontSize: "24px",
  color: brandOrange,
  fontWeight: "bold",
  margin: "0 0 8px 0",
};

const warningTextStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: brandOrange,
  margin: "0",
};

const documentsBoxStyle: React.CSSProperties = {
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  border: "1px solid #e0e0e0",
};

const documentsHeaderStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#333333",
  margin: "0 0 12px 0",
};

const documentItemStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#666666",
  margin: "8px 0",
};

const messageBoxStyle: React.CSSProperties = {
  backgroundColor: "#FFF7ED",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
  borderLeft: `4px solid ${brandOrange}`,
};

const messageLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "bold",
  color: brandOrange,
  textTransform: "uppercase" as const,
  margin: "0 0 8px 0",
};

const messageTextStyle: React.CSSProperties = {
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

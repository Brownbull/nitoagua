import { Hr, Section, Text } from "@react-email/components";
import * as React from "react";

export function Footer() {
  return (
    <Section style={footerStyle}>
      <Hr style={hrStyle} />
      <Text style={footerTextStyle}>
        © {new Date().getFullYear()} nitoagua - Agua pura para tu hogar
      </Text>
      <Text style={footerTextStyle}>
        Este correo fue enviado automáticamente. Por favor no responda directamente.
      </Text>
    </Section>
  );
}

const footerStyle: React.CSSProperties = {
  padding: "24px",
  textAlign: "center" as const,
  backgroundColor: "#f4f4f4",
  borderRadius: "0 0 8px 8px",
};

const hrStyle: React.CSSProperties = {
  borderColor: "#e0e0e0",
  margin: "0 0 16px 0",
};

const footerTextStyle: React.CSSProperties = {
  color: "#666666",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "4px 0",
};

import {
  Container,
  Heading,
  Section,
} from "@react-email/components";
import * as React from "react";

const brandPrimary = "#0077B6";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <Section style={headerStyle}>
      <Container style={logoContainerStyle}>
        {/* Water droplet icon placeholder - in production, use hosted image */}
        <div style={logoIconStyle}>💧</div>
        <Heading as="h1" style={brandNameStyle}>
          nitoagua
        </Heading>
      </Container>
      {title && (
        <Heading as="h2" style={titleStyle}>
          {title}
        </Heading>
      )}
    </Section>
  );
}

const headerStyle: React.CSSProperties = {
  backgroundColor: brandPrimary,
  padding: "24px",
  textAlign: "center" as const,
  borderRadius: "8px 8px 0 0",
};

const logoContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
};

const logoIconStyle: React.CSSProperties = {
  fontSize: "32px",
  marginBottom: "8px",
};

const brandNameStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const titleStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "normal",
  margin: "16px 0 0 0",
};

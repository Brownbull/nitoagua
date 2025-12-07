import { Button as ReactEmailButton } from "@react-email/components";
import * as React from "react";

const brandPrimary = "#0077B6";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
}

export function Button({ href, children }: ButtonProps) {
  return (
    <ReactEmailButton href={href} style={buttonStyle}>
      {children}
    </ReactEmailButton>
  );
}

const buttonStyle: React.CSSProperties = {
  backgroundColor: brandPrimary,
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

import {
    Body,
    Button,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Preview,
    Section,
    Text,
  } from "@react-email/components";
  import * as React from "react";

  interface ZurpSignInEmailProps {
    signInUrl: string;
    expiresInMinutes?: number;
  }

  export const ZurpSignInEmail = ({
    signInUrl,
    expiresInMinutes = 10,
  }: ZurpSignInEmailProps) => (
    <Html>
      <Head />
      <Preview>Your zurp sign-in link</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src="https://zurp.io/zurp-logo-1024.png"
              width="48"
              height="48"
              alt="zurp"
              style={logoImg}
            />
            <Text style={logo}>zurp</Text>
          </Section>
  
          <Text style={body}>
            Tap the button below to sign in. No password needed.
          </Text>
  
          <Section style={buttonSection}>
            <Button style={button} href={signInUrl}>
              Sign in to zurp
            </Button>
          </Section>
  
          <Text style={expiry}>
            This link expires in {expiresInMinutes} minutes.
          </Text>
  
          <Hr style={divider} />
  
          <Text style={footnote}>
            If you didn't request this email, you can safely ignore it.
            No account will be created.
          </Text>
        </Container>
      </Body>
    </Html>
  );
  
  export default ZurpSignInEmail;
  
  const main = {
    backgroundColor: "#0b1120",
    fontFamily:
      "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  };
  
  const container = {
    margin: "0 auto",
    padding: "40px 24px",
    maxWidth: "460px",
  };
  
  const logoSection = {
    textAlign: "center" as const,
    margin: "0 0 32px 0",
  };

  const logoImg = {
    margin: "0 auto",
    borderRadius: "10px",
  };

  const logo = {
    fontFamily: "'Space Mono', 'Courier New', monospace",
    fontSize: "24px",
    fontWeight: 700 as const,
    color: "#e2e8f0",
    letterSpacing: "-0.02em",
    textAlign: "center" as const,
    margin: "8px 0 0 0",
  };
  
  const body = {
    fontSize: "15px",
    lineHeight: "24px",
    color: "#94a3b8",
    textAlign: "center" as const,
    margin: "0 0 28px 0",
  };
  
  const buttonSection = {
    textAlign: "center" as const,
    margin: "0 0 16px 0",
  };
  
  const button = {
    backgroundColor: "#22d3ee",
    color: "#0b1120",
    fontFamily:
      "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: "15px",
    fontWeight: 700 as const,
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "13px 44px",
    borderRadius: "8px",
  };
  
  const expiry = {
    fontFamily: "'Space Mono', 'Courier New', monospace",
    fontSize: "12px",
    color: "#64748b",
    textAlign: "center" as const,
    margin: "0 0 28px 0",
  };
  
  const divider = {
    borderColor: "#1e293b",
    borderTop: "1px solid #1e293b",
    margin: "0 0 20px 0",
  };
  
  const footnote = {
    fontSize: "12px",
    lineHeight: "20px",
    color: "#64748b",
    textAlign: "center" as const,
    margin: "0",
  };
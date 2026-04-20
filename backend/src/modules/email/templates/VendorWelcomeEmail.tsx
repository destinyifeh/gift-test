import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface VendorWelcomeEmailProps {
  fullName?: string;
  temporaryPassword?: string;
  loginUrl?: string;
}

export const VendorWelcomeEmail = ({
  fullName = 'there',
  temporaryPassword = '',
  loginUrl = 'https://gifthance.com/login',
}: VendorWelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to the Gifthance Vendor Program!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to Gifthance!</Heading>
          <Text style={text}>
            Hi {fullName},
          </Text>
          <Text style={text}>
            We're excited to have you as a vendor on Gifthance. Your account has been created, and you can now start setting up your shop.
          </Text>
          <Section style={passwordSection}>
            <Text style={text}>
              <strong>Your Temporary Password:</strong> {temporaryPassword}
            </Text>
            <Text style={text}>
              <em>Please change this password immediately after your first login for security.</em>
            </Text>
          </Section>
          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Login to Dashboard
            </Button>
          </Section>
          <Text style={text}>
            If you have any questions, feel free to reply to this email.
          </Text>
          <Text style={footer}>
            &copy; 2026 Gifthance. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default VendorWelcomeEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  padding: '0 48px',
};

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  padding: '0 48px',
};

const passwordSection = {
  padding: '0 48px',
  marginTop: '16px',
};

const buttonContainer = {
  padding: '24px 48px',
};

const button = {
  backgroundColor: '#5F51E8',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '200px',
  padding: '12px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  padding: '0 48px',
  marginTop: '48px',
};

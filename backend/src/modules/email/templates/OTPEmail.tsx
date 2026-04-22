import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface OTPEmailProps {
  userFirstname?: string;
  otp?: string;
}

export const OTPEmail = ({
  userFirstname = 'there',
  otp = '000000',
}: OTPEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your Gifthance verification code</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verify your email</Heading>
          <Text style={text}>
            Hi {userFirstname},
          </Text>
          <Text style={text}>
            Welcome to Gifthance! Please use the following 6-digit verification code to complete your registration and start receiving gifts.
          </Text>
          <Section style={otpContainer}>
            <Text style={otpText}>{otp}</Text>
          </Section>
          <Text style={text}>
            This code will expire in 5 minutes. If you didn't create an account, you can safely ignore this email.
          </Text>
          <Text style={footer}>
            &copy; 2026 Gifthance. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OTPEmail;

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

const otpContainer = {
  padding: '24px 48px',
  textAlign: 'center' as const,
};

const otpText = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#f97316',
  letterSpacing: '8px',
  padding: '12px',
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  display: 'inline-block',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  padding: '0 48px',
  marginTop: '48px',
};

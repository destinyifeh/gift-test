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

interface ResetPasswordEmailProps {
  userFirstname?: string;
  resetPasswordLink?: string;
}

export const ResetPasswordEmail = ({
  userFirstname = 'there',
  resetPasswordLink = '#',
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your Gifthance password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reset your password</Heading>
          <Text style={text}>
            Hi {userFirstname},
          </Text>
          <Text style={text}>
            Someone requested a password reset for your Gifthance account. If this was you, you can set a new password here:
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={resetPasswordLink}>
              Reset password
            </Button>
          </Section>
          <Text style={text}>
            If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
          </Text>
          <Text style={footer}>
            &copy; 2026 Gifthance. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ResetPasswordEmail;

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

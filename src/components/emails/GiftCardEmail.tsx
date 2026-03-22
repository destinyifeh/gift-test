import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface GiftCardEmailProps {
  senderName: string;
  recipientName?: string;
  vendorShopName: string;
  giftName: string;
  giftAmount: number;
  message?: string;
  claimUrl: string;
  currencySymbol?: string;
}

export const GiftCardEmail = ({
  senderName,
  recipientName,
  vendorShopName,
  giftName,
  giftAmount,
  message,
  claimUrl,
  currencySymbol = '₦',
}: GiftCardEmailProps) => (
  <Html>
    <Head />
    <Preview>You’ve just received a gift from {senderName}!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logo}>GIFTHANCE</Text>
        </Section>

        <Section style={hero}>
          <Heading style={h1}>Hi there 👋</Heading>
          <Text style={heroText}>You’ve just received a special gift!</Text>
        </Section>

        <Section style={card}>
          <Section style={cardGradient}>
            <Section style={cardContent}>
              <Text style={giftTitle}>🎁 {giftName}</Text>
              <Heading style={amount}>
                {currencySymbol}
                {giftAmount.toLocaleString()}
              </Heading>
              <Text style={fromText}>
                From: <span style={bold}>{vendorShopName}</span>
              </Text>
              <Text style={fromText}>
                Sent by: <span style={bold}>{senderName}</span>
              </Text>
            </Section>
          </Section>
        </Section>

        {message && (
          <Section style={messageSection}>
            <Text style={messageQuote}>"{message}"</Text>
          </Section>
        )}

        <Section style={ctaSection}>
          <Button style={button} href={claimUrl}>
            Claim Your Gift
          </Button>
        </Section>

        <Hr style={hr} />

        <Section style={footer}>
          <Text style={footerText}>
            This gift is waiting for you on Gifthance 🎉. Enjoy your gifting
            experience!
          </Text>
          <Text style={footerSubtext}>
            © 2026 Gifthance. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
  borderRadius: '24px',
  overflow: 'hidden',
};

const header = {
  textAlign: 'center' as const,
  marginBottom: '40px',
};

const logo = {
  fontSize: '24px',
  fontWeight: '900',
  letterSpacing: '-0.05em',
  color: '#f97316', // primary
  margin: '0',
};

const hero = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const h1 = {
  fontSize: '32px',
  fontWeight: '800',
  color: '#1c1917',
  margin: '0 0 8px 0',
};

const heroText = {
  fontSize: '18px',
  color: '#444',
  margin: '0',
};

const card = {
  borderRadius: '24px',
  overflow: 'hidden',
  boxShadow: '0 10px 30px -5px rgba(249, 115, 22, 0.2)',
  marginBottom: '32px',
};

const cardGradient = {
  backgroundColor: '#f97316',
  background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
  padding: '4px',
  borderRadius: '24px',
};

const image = {
  borderRadius: '20px 20px 0 0',
  width: '100%',
  maxWidth: '100%',
  display: 'block',
  objectFit: 'cover' as const,
};

const cardContent = {
  backgroundColor: '#ffffff',
  padding: '32px',
  textAlign: 'center' as const,
  borderRadius: '0 0 20px 20px',
};

const giftTitle = {
  fontSize: '14px',
  fontWeight: '800',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  color: '#666',
  margin: '0 0 8px 0',
};

const amount = {
  fontSize: '48px',
  fontWeight: '900',
  color: '#1c1917',
  margin: '0 0 16px 0',
};

const fromText = {
  fontSize: '16px',
  color: '#555',
  margin: '0',
};

const bold = {
  fontWeight: '700',
  color: '#000',
};

const messageSection = {
  textAlign: 'center' as const,
  padding: '0 32px',
  marginBottom: '40px',
};

const messageQuote = {
  fontSize: '18px',
  fontStyle: 'italic',
  color: '#555',
  lineHeight: '1.6',
};

const ctaSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const button = {
  backgroundColor: '#f97316',
  borderRadius: '16px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '800',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  width: '100%',
  maxWidth: '280px',
  padding: '18px 0',
  boxShadow: '0 8px 24px rgba(249, 115, 22, 0.4)',
};

const linkText = {
  fontSize: '12px',
  color: '#999',
  marginTop: '24px',
};

const link = {
  color: '#f97316',
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#eee',
  margin: '40px 0',
};

const footer = {
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '14px',
  color: '#666',
  lineHeight: '1.5',
  marginBottom: '16px',
};

const footerSubtext = {
  fontSize: '12px',
  color: '#ccc',
};

export default GiftCardEmail;

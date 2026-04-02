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

interface FlexCardEmailProps {
  senderName: string;
  recipientName?: string;
  amount: number;
  message?: string;
  claimUrl: string;
  code: string;
  currencySymbol?: string;
}

// Mask the code to show only first 5 and last 3 characters
function maskCode(code: string): string {
  if (code.length <= 8) return code;
  return `${code.slice(0, 5)}••••${code.slice(-3)}`;
}

export const FlexCardEmail = ({
  senderName,
  recipientName,
  amount,
  message,
  claimUrl,
  code,
  currencySymbol = '₦',
}: FlexCardEmailProps) => {
  const capitalizedSender = senderName
    ? senderName.charAt(0).toUpperCase() + senderName.slice(1)
    : 'A Friend';

  const maskedCode = maskCode(code);

  return (
    <Html>
      <Head />
      <Preview>You've received a Gifthance Flex Card worth {currencySymbol}{Number(amount).toLocaleString()} from {capitalizedSender}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>GIFTHANCE</Text>
          </Section>

          <Section style={hero}>
            <Heading style={h1}>Hi there! 👋</Heading>
            <Text style={heroText}>You've received a Gifthance Flex Card!</Text>
          </Section>

          {/* Premium Card Design - Orange Theme */}
          <Section style={cardOuter}>
            <Section style={card}>
              <Section style={cardHeader}>
                <Text style={brandName}>Gifthance</Text>
                <Text style={cardType}>FLEX CARD</Text>
              </Section>

              <Section style={balanceSection}>
                <Text style={balanceLabel}>Available Balance</Text>
                <Heading style={balanceAmount}>
                  {currencySymbol}
                  {Number(amount).toLocaleString()}
                </Heading>
              </Section>

              <Section style={codeSection}>
                <Text style={codeLabel}>CARD CODE</Text>
                <Text style={codeValue}>{maskedCode}</Text>
              </Section>

              <Section style={cardFooter}>
                <Text style={cardTag}>Use at any Gifthance vendor</Text>
              </Section>
            </Section>
          </Section>

          <Section style={senderSection}>
            <Text style={fromText}>
              Sent with ❤️ by <span style={bold}>{capitalizedSender}</span>
            </Text>
          </Section>

          {message && (
            <Section style={messageSection}>
              <Text style={messageQuote}>"{message}"</Text>
            </Section>
          )}

          <Section style={featuresSection}>
            <Text style={featuresTitle}>What you can do with Flex Card:</Text>
            <table width="100%" cellPadding="0" cellSpacing="0">
              <tr>
                <td style={featureIcon}>✓</td>
                <td style={featureText}>Use at any participating vendor</td>
              </tr>
              <tr>
                <td style={featureIcon}>✓</td>
                <td style={featureText}>Partial redemption - use only what you need</td>
              </tr>
              <tr>
                <td style={featureIcon}>✓</td>
                <td style={featureText}>Track your balance in real-time</td>
              </tr>
              <tr>
                <td style={featureIcon}>✓</td>
                <td style={featureText}>Never expires</td>
              </tr>
            </table>
          </Section>

          <Section style={ctaSection}>
            <Button style={button} href={claimUrl}>
              Claim Your Flex Card
            </Button>
            <Text style={expiryText}>
              Click the button above to add this card to your account and start using it!
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Your Flex Card is waiting for you on Gifthance 🎉
            </Text>
            <Text style={footerSubtext}>
              © 2026 Gifthance. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

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
  color: '#d97706',
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

// Premium card styling - Bronze/Copper gradient theme
const cardOuter = {
  padding: '0 16px',
  marginBottom: '32px',
};

const card = {
  background: 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #a16207 100%)',
  borderRadius: '20px',
  padding: '24px',
  boxShadow: '0 20px 50px rgba(180, 120, 60, 0.35)',
};

const cardHeader = {
  marginBottom: '24px',
};

const brandName = {
  fontSize: '18px',
  fontWeight: '900',
  color: '#ffffff',
  letterSpacing: '-0.02em',
  margin: '0',
};

const cardType = {
  fontSize: '10px',
  fontWeight: '700',
  color: 'rgba(255,255,255,0.6)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.2em',
  margin: '4px 0 0 0',
};

const balanceSection = {
  marginBottom: '24px',
};

const balanceLabel = {
  fontSize: '10px',
  fontWeight: '600',
  color: 'rgba(255,255,255,0.6)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.15em',
  margin: '0 0 4px 0',
};

const balanceAmount = {
  fontSize: '36px',
  fontWeight: '900',
  color: '#ffffff',
  letterSpacing: '-0.02em',
  margin: '0',
};

const codeSection = {
  backgroundColor: 'rgba(255,255,255,0.15)',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '16px',
};

const codeLabel = {
  fontSize: '10px',
  fontWeight: '600',
  color: 'rgba(255,255,255,0.6)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  margin: '0 0 4px 0',
};

const codeValue = {
  fontSize: '18px',
  fontWeight: '700',
  fontFamily: 'monospace',
  color: '#ffffff',
  letterSpacing: '0.1em',
  margin: '0',
};

const cardFooter = {
  textAlign: 'center' as const,
};

const cardTag = {
  fontSize: '11px',
  color: 'rgba(255,255,255,0.6)',
  margin: '0',
};

const senderSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
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
  marginBottom: '32px',
};

const messageQuote = {
  fontSize: '18px',
  fontStyle: 'italic',
  color: '#555',
  lineHeight: '1.6',
};

const featuresSection = {
  backgroundColor: '#fffbeb',
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '32px',
  marginLeft: '16px',
  marginRight: '16px',
  border: '1px solid #fde68a',
};

const featuresTitle = {
  fontSize: '14px',
  fontWeight: '700',
  color: '#92400e',
  marginBottom: '16px',
};

const featureIcon = {
  fontSize: '14px',
  color: '#d97706',
  fontWeight: '700',
  padding: '6px 12px 6px 0',
  verticalAlign: 'top' as const,
};

const featureText = {
  fontSize: '14px',
  color: '#78350f',
  padding: '6px 0',
};

const ctaSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const button = {
  backgroundColor: '#b45309',
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
  boxShadow: '0 8px 24px rgba(180, 83, 9, 0.35)',
};

const expiryText = {
  fontSize: '12px',
  color: '#94a3b8',
  marginTop: '16px',
  fontWeight: '500',
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

export default FlexCardEmail;

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
import React from 'react';

interface ThankYouEmailProps {
  donorName: string;
  creatorName: string;
  creatorUsername: string;
  thankYouMessage: string;
  giftName?: string | null;
  amount?: number;
  currency?: string;
}

export default function ThankYouEmail({
  donorName,
  creatorName,
  creatorUsername,
  thankYouMessage,
  giftName,
  amount,
  currency = 'NGN',
}: ThankYouEmailProps) {
  const displayAmount =
    amount && amount > 0
      ? new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency,
          maximumFractionDigits: 0,
        }).format(amount)
      : null;

  const initial = creatorName.charAt(0).toUpperCase();
  const cappedCreator = creatorName
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  const cappedDonor = donorName
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>💌 {cappedCreator} sent you a personal thank-you</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* ── Rainbow top bar ── */}
          <Section style={topBarStyle} />

          {/* ── Logo row ── */}
          <Section style={logoRowStyle}>
            <Text style={logoTextStyle}>✦ Gifthance</Text>
          </Section>

          {/* ── Hero card ── */}
          <Section style={heroStyle}>
            {/* Avatar */}
            <table
              width="100%"
              cellPadding={0}
              cellSpacing={0}
              role="presentation">
              <tr>
                <td align="center" style={{paddingBottom: '24px'}}>
                  <table cellPadding={0} cellSpacing={0} role="presentation">
                    <tr>
                      <td style={avatarTdStyle}>
                        <span style={avatarLetterStyle}>{initial}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            {/* Creator name */}
            <Heading style={creatorNameStyle}>{cappedCreator}</Heading>
            <Text style={creatorHandleStyle}>@{creatorUsername}</Text>

            <Hr style={hrStyle} />

            {/* Greeting */}
            <Text style={greetingStyle}>Hey {cappedDonor} 👋</Text>
            <Text style={subGreetingStyle}>
              {cappedCreator} wanted to share a personal note with you.
            </Text>

            {/* Quote block */}
            <Section style={quoteWrapStyle}>
              <Text style={quoteOpenStyle}>&ldquo;</Text>
              <Text style={quoteBodyStyle}>{thankYouMessage}</Text>
              <Text style={quoteCloseStyle}>&rdquo;</Text>
            </Section>

            {/* Gift pill */}
            {(giftName || displayAmount) && (
              <Section style={pillWrapStyle}>
                <Text style={pillStyle}>
                  🎁&nbsp;&nbsp;
                  {giftName ?? ''}
                  {giftName && displayAmount ? '  ·  ' : ''}
                  {displayAmount ?? ''}
                </Text>
              </Section>
            )}

            {/* Warm closing */}
            <Text style={closingStyle}>
              Your generosity truly makes a difference. Thank you for showing up
              and spreading joy. 🌟
            </Text>

            {/* CTA */}
            <Section style={{textAlign: 'center', paddingTop: '12px'}}>
              <Button
                href={`https://gifthance.com/u/${creatorUsername}`}
                style={ctaStyle}>
                Visit {cappedCreator}&apos;s Page
              </Button>
            </Section>
          </Section>

          {/* ── Footer ── */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              You received this because you gifted&nbsp;
              <strong style={{textTransform: 'capitalize'}}>
                {cappedCreator}
              </strong>
              &nbsp;on Gifthance.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* ─── Email-safe inline styles ──────────────────────────────────────────── */

const bodyStyle: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  margin: '0',
  padding: '40px 0',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const containerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  maxWidth: '560px',
  margin: '0 auto',
  borderRadius: '24px',
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  border: '1px solid #e2e8f0',
};

const topBarStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)',
  height: '8px',
  display: 'block',
};

const logoRowStyle: React.CSSProperties = {
  padding: '24px 32px 16px',
  textAlign: 'center',
};

const logoTextStyle: React.CSSProperties = {
  margin: '0',
  fontSize: '16px',
  fontWeight: 800,
  color: '#f97316',
  letterSpacing: '-0.3px',
};

const heroStyle: React.CSSProperties = {
  padding: '28px 48px 48px',
};

const avatarTdStyle: React.CSSProperties = {
  width: '80px',
  height: '80px',
  borderRadius: '40px',
  background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
  textAlign: 'center',
  verticalAlign: 'middle',
  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
};

const avatarLetterStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '34px',
  fontWeight: 900,
  display: 'block',
  lineHeight: '80px',
  width: '80px',
  textAlign: 'center',
};

const creatorNameStyle: React.CSSProperties = {
  margin: '0 0 6px',
  fontSize: '24px',
  fontWeight: 800,
  color: '#0f172a',
  textAlign: 'center',
  letterSpacing: '-0.5px',
  textTransform: 'capitalize',
};

const creatorHandleStyle: React.CSSProperties = {
  margin: '0 0 24px',
  fontSize: '14px',
  color: '#64748b',
  textAlign: 'center',
  fontWeight: 500,
};

const hrStyle: React.CSSProperties = {
  borderColor: '#f1f5f9',
  margin: '0 0 32px',
};

const greetingStyle: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: '22px',
  fontWeight: 800,
  color: '#0f172a',
  letterSpacing: '-0.3px',
};

const subGreetingStyle: React.CSSProperties = {
  margin: '0 0 28px',
  fontSize: '15px',
  color: '#475569',
  lineHeight: '1.6',
};

const quoteWrapStyle: React.CSSProperties = {
  backgroundColor: '#fff7ed',
  border: '1px solid #ffedd5',
  borderRadius: '20px',
  padding: '32px',
  marginBottom: '32px',
  position: 'relative',
};

const quoteOpenStyle: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: '64px',
  lineHeight: '1',
  color: '#f97316',
  opacity: 0.2,
  fontFamily: 'serif',
  position: 'absolute',
  top: '16px',
  left: '20px',
};

const quoteBodyStyle: React.CSSProperties = {
  margin: '0',
  fontSize: '17px',
  lineHeight: '1.8',
  color: '#1e293b',
  fontStyle: 'italic',
  fontWeight: 500,
  textAlign: 'center',
};

const quoteCloseStyle: React.CSSProperties = {
  margin: '8px 0 0',
  fontSize: '64px',
  lineHeight: '1',
  color: '#f97316',
  opacity: 0.2,
  textAlign: 'right',
  fontFamily: 'serif',
};

const pillWrapStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '32px',
};

const pillStyle: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#f1f5f9',
  borderRadius: '100px',
  padding: '10px 24px',
  fontSize: '14px',
  fontWeight: 700,
  color: '#334155',
  margin: '0 auto',
};

const closingStyle: React.CSSProperties = {
  margin: '0 0 36px',
  fontSize: '15px',
  lineHeight: '1.7',
  color: '#64748b',
  textAlign: 'center',
};

const ctaStyle: React.CSSProperties = {
  backgroundColor: '#f97316',
  color: '#ffffff',
  borderRadius: '14px',
  padding: '16px 40px',
  fontSize: '16px',
  fontWeight: 700,
  textDecoration: 'none',
  display: 'inline-block',
  boxShadow: '0 10px 20px rgba(249, 115, 22, 0.2)',
};

const footerStyle: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  padding: '24px 32px',
  textAlign: 'center',
};

const footerTextStyle: React.CSSProperties = {
  margin: '0',
  fontSize: '13px',
  color: '#94a3b8',
  lineHeight: '1.6',
};

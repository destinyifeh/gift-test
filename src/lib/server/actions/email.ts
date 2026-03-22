'use server';

import GiftCardEmail from '@/components/emails/GiftCardEmail';
import ThankYouEmail from '@/components/emails/ThankYouEmail';
import React from 'react';
import {Resend} from 'resend';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export async function sendGiftEmail({
  to,
  senderName,
  vendorShopName,
  giftName,
  giftAmount,
  message,
  claimUrl,
}: {
  to: string;
  senderName: string;
  vendorShopName: string;
  giftName: string;
  giftAmount: number;
  message?: string;
  claimUrl: string;
}) {
  try {
    const {data, error} = await resend.emails.send({
      // from: 'Gifthance <gifts@gifthance.com>',
      from: 'Gifthance <gifts@discussday.com>',
      to: [to],
      subject: `🎁 You've received a gift from ${senderName}!`,
      react: React.createElement(GiftCardEmail, {
        senderName,
        vendorShopName,
        giftName,
        giftAmount,
        message,
        claimUrl,
      }),
    });

    if (error) {
      console.error('Resend Error:', error);
      // Fallback for dev if the domain is not verified
      if (error.message.includes('onboarding')) {
        console.warn('Resend domain not verified. Email not sent to:', to);
        return {success: true, warning: 'Onboarding domain restriction'};
      }
      return {success: false, error: error.message};
    }

    return {success: true, data};
  } catch (err: any) {
    console.error('Email action error:', err);
    return {success: false, error: err.message};
  }
}

export async function sendThankYouEmail({
  to,
  donorName,
  creatorName,
  creatorUsername,
  thankYouMessage,
  giftName,
  amount,
  currency,
}: {
  to: string;
  donorName: string;
  creatorName: string;
  creatorUsername: string;
  thankYouMessage: string;
  giftName?: string | null;
  amount?: number;
  currency?: string;
}) {
  try {
    const {data, error} = await resend.emails.send({
      from: 'Gifthance <gifts@discussday.com>',
      to: [to],
      subject: `💌 A personal message from ${creatorName}`,
      react: React.createElement(ThankYouEmail, {
        donorName,
        creatorName,
        creatorUsername,
        thankYouMessage,
        giftName,
        amount,
        currency,
      }),
    });

    if (error) {
      console.error('Thank-you email error:', error);
      if (error.message.includes('onboarding')) {
        return {success: true, warning: 'Onboarding domain restriction'};
      }
      return {success: false, error: error.message};
    }

    return {success: true, data};
  } catch (err: any) {
    console.error('Thank-you email action error:', err);
    return {success: false, error: err.message};
  }
}

'use server';

import GiftCardEmail from '@/components/emails/GiftCardEmail';
import React from 'react';
import {Resend} from 'resend';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export async function sendGiftEmail({
  to,
  senderName,
  giftName,
  giftAmount,
  giftImage,
  message,
  claimUrl,
}: {
  to: string;
  senderName: string;
  giftName: string;
  giftAmount: number;
  giftImage?: string;
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
        giftName,
        giftAmount,
        giftImage,
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

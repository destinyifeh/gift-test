import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/render';
import * as React from 'react';
import GiftCardEmail from './templates/GiftCardEmail';
import ThankYouEmail from './templates/ThankYouEmail';
import ResetPasswordEmail from './templates/ResetPasswordEmail';
import VerificationEmail from './templates/VerificationEmail';



@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail = 'Gifthance <gifts@discussday.com>';

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY') || 'dummy_key';
    this.resend = new Resend(apiKey);
  }

  async sendGiftEmail(params: {
    to: string;
    senderName: string;
    vendorShopName: string;
    giftName: string;
    giftAmount: number;
    message?: string;
    claimUrl: string;
  }) {
    const html = await render(
      React.createElement(GiftCardEmail, {
        senderName: params.senderName,
        vendorShopName: params.vendorShopName,
        giftName: params.giftName,
        giftAmount: params.giftAmount,
        message: params.message,
        claimUrl: params.claimUrl,
      })
    );

    return this.sendEmail({
      to: params.to,
      subject: `🎁 You've received a gift from ${params.senderName}!`,
      html,
    });
  }

  async sendThankYouEmail(params: {
    to: string;
    donorName: string;
    creatorName: string;
    creatorUsername: string;
    thankYouMessage: string;
    giftName?: string | null;
    amount?: number;
    currency?: string;
  }) {
    const html = await render(
      React.createElement(ThankYouEmail, {
        donorName: params.donorName,
        creatorName: params.creatorName,
        creatorUsername: params.creatorUsername,
        thankYouMessage: params.thankYouMessage,
        giftName: params.giftName,
        amount: params.amount,
        currency: params.currency,
      })
    );

    return this.sendEmail({
      to: params.to,
      subject: `💌 A personal message from ${params.creatorName}`,
      html,
    });
  }

  async sendPasswordResetEmail(params: { to: string; userName: string; resetUrl: string }) {
    const html = await render(
      React.createElement(ResetPasswordEmail, {
        userFirstname: params.userName,
        resetPasswordLink: params.resetUrl,
      })
    );

    return this.sendEmail({
      to: params.to,
      subject: '🔑 Reset your Gifthance password',
      html,
    });
  }

  async sendVerificationEmail(params: { to: string; userName: string; verificationUrl: string }) {
    const html = await render(
      React.createElement(VerificationEmail, {
        userFirstname: params.userName,
        verificationLink: params.verificationUrl,
      })
    );

    return this.sendEmail({
      to: params.to,
      subject: '✨ Verify your Gifthance account',
      html,
    });
  }

  async sendEmail(params: { to: string; subject: string; html: string }) {


    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [params.to],
        subject: params.subject,
        html: params.html,
      });

      if (error) {
        this.logger.error('Resend Error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err: any) {
      this.logger.error('Email action error:', err);
      return { success: false, error: err.message };
    }
  }
}

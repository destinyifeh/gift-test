import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class WhatsappService {
  private client: Twilio;
  private readonly logger = new Logger(WhatsappService.name);
  private fromNumber: string;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_WHATSAPP_FROM') || 'whatsapp:+14155238886';

    if (accountSid && authToken) {
      this.client = new Twilio(accountSid, authToken);
    } else {
      this.logger.warn('Twilio credentials missing. WhatsApp messages will not be sent.');
    }
  }

  async sendWhatsapp(to: string, body: string): Promise<boolean> {
    if (!this.client) return false;

    try {
      // Ensure 'to' number is in whatsapp format
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

      await this.client.messages.create({
        body,
        from: this.fromNumber,
        to: formattedTo,
      });

      this.logger.log(`WhatsApp message sent to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp to ${to}:`, error.message);
      return false;
    }
  }

  async sendGiftCode(to: string, giftName: string, donorName: string, giftCode: string) {
    const siteUrl = this.configService.get<string>('FRONTEND_URL') || 'https://gifthance.com';
    const body = `🎁 *Gift Received!* \n\nHi! You've received a ${giftName} from ${donorName}. \n\nClaim code: *${giftCode}* \n\nClaim here: ${siteUrl}/claim/${giftCode} \n\nEnjoy! ✨`;
    return this.sendWhatsapp(to, body);
  }
}

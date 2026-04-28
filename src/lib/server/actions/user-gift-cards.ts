'use server';

import {revalidatePath} from 'next/cache';
import {serverFetch} from '../server-api';

export interface UserGiftCardCreateData {
  giftCardId: number;
  initialAmount: number;
  recipientEmail?: string;
  recipientPhone?: string;
  deliveryMethod?: 'email' | 'whatsapp';
  senderName?: string;
  message?: string;
  currency?: string;
}

export async function createUserGiftCard(data: UserGiftCardCreateData) {
  try {
    const response = await serverFetch('user-gift-cards', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    revalidatePath('/dashboard');
    return {success: true, data: response};
  } catch (err: any) {
    console.error('Error creating user gift card:', err);
    return {success: false, error: err.message};
  }
}

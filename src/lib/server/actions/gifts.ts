'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '../server-api';

/**
 * Handle direct gift creation (1-to-1 cash gifts and vouchers)
 */
export async function createDirectGift(data: any) {
  try {
    const response = await serverFetch('gifts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // The response from backend is the DirectGift object
    // Map it to include camelCase for frontend consistency if needed
    const mappedData = {
      ...response,
      giftCode: response.giftCode,
      // Add other mappings if necessary
    };

    revalidatePath('/dashboard');
    return { success: true, data: mappedData };
  } catch (error: any) {
    console.error('Error creating direct gift:', error);
    return { success: false, error: error.message };
  }
}

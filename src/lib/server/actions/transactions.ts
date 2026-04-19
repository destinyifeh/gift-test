'use server';

import { serverFetch } from '../server-api';

export async function verifyPaymentAndUpgrade(reference: string) {
  try {
    const res = await serverFetch('transactions/upgrade', {
      method: 'POST',
      body: JSON.stringify({ reference }),
    });
    
    return { success: true, data: res };
  } catch (error: any) {
    console.error('Error verifying payment and upgrade:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to verify payment' 
    };
  }
}

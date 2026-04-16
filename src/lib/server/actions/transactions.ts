'use server';

import api from '@/lib/api-client';

export async function verifyPaymentAndUpgrade(reference: string) {
  try {
    const res = await api.post('/transactions/upgrade', { reference });
    return res.data;
  } catch (error: any) {
    console.error('Error verifying payment and upgrade:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to verify payment' 
    };
  }
}

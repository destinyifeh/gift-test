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

export async function recordCampaignContribution(data: any) {
  try {
    const res = await serverFetch('transactions/campaign-contribution', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: true, data: res };
  } catch (error: any) {
    console.error('Error recording campaign contribution:', error);
    return { success: false, error: error.message };
  }
}

export async function recordCreatorGift(data: any) {
  try {
    const res = await serverFetch('transactions/creator-gift', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: true, data: res };
  } catch (error: any) {
    console.error('Error recording creator gift:', error);
    return { success: false, error: error.message };
  }
}

export async function recordShopGiftPurchase(data: any) {
  try {
    const res = await serverFetch('transactions/shop-gift', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: true, data: res };
  } catch (error: any) {
    console.error('Error recording shop gift purchase:', error);
    return { success: false, error: error.message };
  }
}
export async function collectCreatorEarnings(amount?: number) {
  try {
    const res = await serverFetch('transactions/collect-earnings', {
      method: 'POST',
      body: amount ? JSON.stringify({ amount }) : undefined,
    });
    return { success: true, amount: res.amount };
  } catch (error: any) {
    console.error('Error collecting creator earnings:', error);
    return { success: false, error: error.message };
  }
}

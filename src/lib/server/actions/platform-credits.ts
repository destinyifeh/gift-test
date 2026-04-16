'use server';

import {revalidatePath} from 'next/cache';
import {serverFetch} from '../server-api';

/**
 * Converts a claimed gift card into Platform Credit.
 * Deducts a 2% fee. The gift must be 'claimed' but not 'redeemed'.
 */
export async function convertGiftToCredit(campaignId: string) {
  try {
    const response = await serverFetch('wallet/convert', {
      method: 'POST',
      body: JSON.stringify({campaignId}),
    });
    revalidatePath('/dashboard', 'layout');
    return response;
  } catch (err: any) {
    console.error('Conversion Error:', err);
    return {success: false, error: err.message || 'Failed to convert gift'};
  }
}

/**
 * Swaps a vendor gift card for another product from the SAME vendor.
 * Must be exact amount. No fee.
 */
export async function swapVendorGift(campaignId: string, newVendorGiftId: string) {
  try {
    const response = await serverFetch('wallet/swap', {
      method: 'POST',
      body: JSON.stringify({campaignId, newVendorGiftId}),
    });
    revalidatePath('/dashboard', 'layout');
    return response;
  } catch (err: any) {
    console.error('Swap Error:', err);
    return {success: false, error: err.message || 'Failed to swap gift'};
  }
}

/**
 * Fetch other gifts from the same vendor with the exact same amount.
 */
export async function fetchEligibleSwapGifts(vendorId: string, amount: number, currentGiftId: string) {
  try {
    const query = new URLSearchParams({
      vendor_id: vendorId,
      amount: amount.toString(),
      exclude: currentGiftId,
    });
    const response = await serverFetch(`products?${query.toString()}`);
    return {success: true, data: response.data || response || []};
  } catch (err: any) {
    return {success: false, error: err.message};
  }
}

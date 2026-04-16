'use server';

import {revalidatePath} from 'next/cache';
import {serverFetch} from '../server-api';

/**
 * Submits a rating for a voucher gift (campaigns table).
 */
export async function rateVoucherGift(campaignId: string, rating: number) {
  try {
    const response = await serverFetch('ratings/voucher', {
      method: 'POST',
      body: JSON.stringify({campaignId, rating}),
    });
    revalidatePath('/dashboard');
    return response;
  } catch (error: any) {
    console.error('Error rating voucher:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Submits a rating for a direct support gift (creator_support table).
 */
export async function rateSupportGift(supportId: string, rating: number) {
  try {
    const response = await serverFetch('ratings/support', {
      method: 'POST',
      body: JSON.stringify({supportId, rating}),
    });
    revalidatePath('/dashboard');
    return response;
  } catch (error: any) {
    console.error('Error rating support gift:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Calculates the average rating and total review count for a specific vendor.
 */
export async function getVendorRatingStats(vendorId: string) {
  try {
    return await serverFetch(`ratings/vendor/${vendorId}`);
  } catch (error: any) {
    console.error('Error fetching vendor rating stats:', error);
    return {average: 0, count: 0};
  }
}

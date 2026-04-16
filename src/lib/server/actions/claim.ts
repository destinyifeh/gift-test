'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '../server-api';

/**
 * Fetch a gift by its unique gift_code.
 */
export async function fetchGiftByCode(code: string) {
  try {
    const data = await serverFetch(`campaigns/${code}`);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Claim a gift. Updates the campaign's user_id to the current user.
 */
export async function claimGiftByCode(code: string) {
  try {
    const response = await serverFetch(`campaigns/claim`, {
      method: 'POST',
      body: JSON.stringify({ code: code.trim() }),
    });
    
    revalidatePath('/dashboard', 'layout');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

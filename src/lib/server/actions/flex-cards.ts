'use server';

import {revalidatePath} from 'next/cache';
import {serverFetch} from '../server-api';

export interface FlexCardCreateData {
  initial_amount: number;
  recipient_email?: string;
  recipient_phone?: string;
  delivery_method?: 'email' | 'whatsapp';
  sender_name?: string;
  message?: string;
  currency?: string;
}

export interface FlexCard {
  id: number;
  user_id: string | null;
  sender_id: string | null;
  initial_amount: number;
  current_balance: number;
  currency: string;
  code: string;
  claim_token: string;
  status: 'active' | 'partially_used' | 'redeemed';
  sender_name: string | null;
  recipient_email: string | null;
  recipient_phone: string | null;
  delivery_method: string;
  message: string | null;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string;
    username: string;
    avatar_url: string;
  };
  sender?: {
    display_name: string;
    username: string;
  };
}

export interface FlexCardTransaction {
  id: number;
  flex_card_id: number;
  vendor_id: string;
  amount: number;
  balance_after: number;
  description: string | null;
  created_at: string;
  vendor?: {
    shop_name: string;
    display_name: string;
  };
}

// Create a new flex card
export async function createFlexCard(data: FlexCardCreateData) {
  try {
    const response = await serverFetch('flex-cards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    revalidatePath('/dashboard');
    return response;
  } catch (err: any) {
    console.error('Error creating flex card:', err);
    return {success: false, error: err.message};
  }
}

// Fetch all flex cards for the current user (both sent and received)
export async function fetchUserFlexCards(options?: {type?: 'sent' | 'received'}) {
  try {
    const params = new URLSearchParams();
    if (options?.type) params.set('type', options.type);
    const response = await serverFetch(`flex-cards/my-cards?${params.toString()}`);
    return {success: true, data: (response.data || response) as FlexCard[]};
  } catch (err: any) {
    console.error('Error fetching flex cards:', err);
    return {success: false, error: err.message};
  }
}

// Fetch a flex card by its code (for vendor redemption)
export async function fetchFlexCardByCode(code: string) {
  try {
    const response = await serverFetch(`flex-cards/code/${code.toUpperCase()}`);
    return {success: true, data: (response.data || response) as FlexCard};
  } catch (err: any) {
    console.error('Error fetching flex card:', err);
    return {success: false, error: 'Flex card not found'};
  }
}

// Fetch a flex card by its claim token (for claim pages - keeps code private)
export async function fetchFlexCardByClaimToken(claimToken: string) {
  try {
    const response = await serverFetch(`flex-cards/token/${claimToken}`);
    return {success: true, data: (response.data || response) as FlexCard};
  } catch (err: any) {
    console.error('Error fetching flex card by claim token:', err);
    return {success: false, error: 'Flex card not found'};
  }
}

// Claim a flex card by code (legacy - for direct code entry)
export async function claimFlexCard(code: string) {
  try {
    const response = await serverFetch('flex-cards/claim/code', {
      method: 'POST',
      body: JSON.stringify({code: code.toUpperCase()}),
    });
    revalidatePath('/dashboard');
    return response;
  } catch (err: any) {
    console.error('Error claiming flex card:', err);
    return {success: false, error: err.message};
  }
}

// Claim a flex card by claim token (used from claim URLs)
export async function claimFlexCardByToken(claimToken: string) {
  try {
    const response = await serverFetch('flex-cards/claim/token', {
      method: 'POST',
      body: JSON.stringify({token: claimToken}),
    });
    revalidatePath('/dashboard');
    return response;
  } catch (err: any) {
    console.error('Error claiming flex card:', err);
    return {success: false, error: err.message};
  }
}

// Redeem (partial or full) from a flex card at a vendor
export async function redeemFlexCard(params: {
  code: string;
  amount: number;
  vendorId: string;
  description?: string;
}) {
  try {
    const response = await serverFetch('flex-cards/redeem', {
      method: 'POST',
      body: JSON.stringify({
        code: params.code.toUpperCase(),
        amount: params.amount,
        description: params.description,
      }),
    });
    revalidatePath('/dashboard');
    revalidatePath('/vendor/dashboard');
    return response;
  } catch (err: any) {
    console.error('Error redeeming flex card:', err);
    return {success: false, error: err.message};
  }
}

// Get transaction history for a flex card
export async function getFlexCardTransactions(cardId: number) {
  try {
    const response = await serverFetch(`flex-cards/${cardId}/transactions`);
    return {success: true, data: (response.data || response) as FlexCardTransaction[]};
  } catch (err: any) {
    console.error('Error fetching flex card transactions:', err);
    return {success: false, error: err.message};
  }
}

// Admin/Vendor: Look up a flex card for redemption (by vendor)
export async function lookupFlexCardForRedemption(code: string) {
  try {
    const response = await serverFetch(`flex-cards/lookup/${code.toUpperCase()}`);
    return {success: true, data: response.data || response};
  } catch (err: any) {
    console.error('Error looking up flex card:', err);
    return {success: false, error: err.message};
  }
}

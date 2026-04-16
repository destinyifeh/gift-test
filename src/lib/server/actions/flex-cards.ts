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

// Helper to map NestJS camelCase responses to the legacy snake_case FlexCard interface the UI expects
function mapBackendCard(card: any): FlexCard {
  if (!card) return card;
  return {
    ...card,
    user_id: card.userId,
    sender_id: card.senderId,
    initial_amount: Number(card.initialAmount || card.initial_amount || 0),
    current_balance: Number(card.currentBalance || card.current_balance || 0),
    claim_token: card.claimToken || card.claim_token,
    sender_name: card.senderName || card.sender_name,
    recipient_email: card.recipientEmail || card.recipient_email,
    recipient_phone: card.recipientPhone || card.recipient_phone,
    delivery_method: card.deliveryMethod || card.delivery_method,
    claimed_at: card.claimedAt || card.claimed_at,
    created_at: card.createdAt || card.created_at,
    updated_at: card.updatedAt || card.updated_at,
    sender: card.sender ? {
      ...card.sender,
      display_name: card.sender.displayName || card.sender.display_name,
      avatar_url: card.sender.avatarUrl || card.sender.avatar_url,
    } : undefined
  } as FlexCard;
}

// Create a new flex card
export async function createFlexCard(data: FlexCardCreateData) {
  try {
    // Map snake_case to camelCase for NestJS backend
    const payload = {
      initialAmount: data.initial_amount,
      recipientEmail: data.recipient_email,
      recipientPhone: data.recipient_phone,
      deliveryMethod: data.delivery_method,
      senderName: data.sender_name,
      message: data.message,
      currency: data.currency,
    };

    const response = await serverFetch('flex-cards', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    revalidatePath('/dashboard');
    return {success: true, data: response};
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
    const cards = (response.data || response).map((c: any) => mapBackendCard(c));
    return {success: true, data: cards as FlexCard[]};
  } catch (err: any) {
    console.error('Error fetching flex cards:', err);
    return {success: false, error: err.message};
  }
}

// Fetch a flex card by its code (for vendor redemption)
export async function fetchFlexCardByCode(code: string) {
  try {
    const response = await serverFetch(`flex-cards/code/${code.toUpperCase()}`);
    const card = mapBackendCard(response.data || response);
    return {success: true, data: card};
  } catch (err: any) {
    console.error('Error fetching flex card:', err);
    return {success: false, error: 'Flex card not found'};
  }
}

// Fetch a flex card by its claim token (for claim pages - keeps code private)
export async function fetchFlexCardByClaimToken(claimToken: string) {
  try {
    const response = await serverFetch(`flex-cards/token/${claimToken}`);
    const card = mapBackendCard(response.data || response);
    return {success: true, data: card};
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
    return {success: true, data: response};
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
    return {success: true, data: response};
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
    return {success: true, data: response};
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
    const card = mapBackendCard(response.data || response);
    return {success: true, data: card};
  } catch (err: any) {
    console.error('Error looking up flex card:', err);
    return {success: false, error: err.message};
  }
}

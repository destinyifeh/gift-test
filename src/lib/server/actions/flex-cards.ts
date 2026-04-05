'use server';

import {revalidatePath} from 'next/cache';
import {createClient} from '../supabase/server';
import {createAdminClient} from '../supabase/admin';
import {generateShortId} from '@/lib/utils/slugs';
import {Resend} from 'resend';
import FlexCardEmail from '@/components/emails/FlexCardEmail';
import React from 'react';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

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

// Generate a unique flex card code
function generateFlexCardCode(): string {
  const prefix = 'FLEX';
  const code = generateShortId().toUpperCase();
  return `${prefix}-${code}`;
}

// Generate a unique claim token (used for URLs to keep code private)
function generateClaimToken(): string {
  // Generate a longer, URL-safe token
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let token = '';
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Create a new flex card
export async function createFlexCard(data: FlexCardCreateData) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  const code = generateFlexCardCode();
  const claimToken = generateClaimToken();

  const {data: flexCard, error} = await supabase
    .from('flex_cards')
    .insert({
      sender_id: user.id,
      initial_amount: data.initial_amount,
      current_balance: data.initial_amount,
      currency: data.currency || 'NGN',
      code,
      claim_token: claimToken,
      status: 'active',
      sender_name: data.sender_name,
      recipient_email: data.recipient_email,
      recipient_phone: data.recipient_phone,
      delivery_method: data.delivery_method || 'email',
      message: data.message,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating flex card:', error);
    return {success: false, error: error.message};
  }

  revalidatePath('/v2/dashboard');

  // Send notification based on delivery method
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  // Use claim_token for URL (keeps the actual code private)
  const claimUrl = `${siteUrl}/v2/claim/flex/${claimToken}`;

  // Get sender profile for name
  const {data: senderProfile} = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single();

  const senderName = data.sender_name || senderProfile?.display_name || 'Someone';

  if (data.delivery_method === 'email' && data.recipient_email) {
    try {
      const {error: emailError} = await resend.emails.send({
        from: 'Gifthance <gifts@discussday.com>',
        to: [data.recipient_email],
        subject: `🎁 You've received a Gifthance Flex Card from ${senderName}!`,
        react: React.createElement(FlexCardEmail, {
          senderName,
          amount: data.initial_amount,
          message: data.message,
          claimUrl,
          code,
          currencySymbol: data.currency === 'USD' ? '$' : '₦',
        }),
      });

      if (emailError) {
        console.error('Flex Card email error:', emailError);
      } else {
        console.log(`Flex Card email sent to ${data.recipient_email}`);
      }
    } catch (err) {
      console.error('Error sending Flex Card email:', err);
    }
  } else if (data.delivery_method === 'whatsapp' && data.recipient_phone) {
    // TODO: Integrate WhatsApp Business API / Twilio
    console.log('=== WhatsApp Flex Card Notification (Mock) ===');
    console.log(`To: ${data.recipient_phone}`);
    console.log(`From: ${senderName}`);
    console.log(`Amount: ₦${data.initial_amount.toLocaleString()}`);
    console.log(`Claim URL: ${claimUrl}`);
    console.log('=============================================');
  }

  return {success: true, data: flexCard};
}

// Fetch all flex cards for the current user (both sent and received)
export async function fetchUserFlexCards(options?: {type?: 'sent' | 'received'}) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  let query = supabase
    .from('flex_cards')
    .select(`
      *,
      sender:profiles!flex_cards_sender_id_fkey(display_name, username, avatar_url)
    `)
    .order('created_at', {ascending: false});

  if (options?.type === 'sent') {
    query = query.eq('sender_id', user.id);
  } else if (options?.type === 'received') {
    query = query.eq('user_id', user.id);
  } else {
    // Both sent and received
    query = query.or(`sender_id.eq.${user.id},user_id.eq.${user.id}`);
  }

  const {data, error} = await query;

  if (error) {
    console.error('Error fetching flex cards:', error);
    return {success: false, error: error.message};
  }

  return {success: true, data: data as FlexCard[]};
}

// Fetch a flex card by its code (for vendor redemption)
export async function fetchFlexCardByCode(code: string) {
  const supabase = await createClient();

  const {data, error} = await supabase
    .from('flex_cards')
    .select(`
      *,
      sender:profiles!flex_cards_sender_id_fkey(display_name, username, avatar_url)
    `)
    .eq('code', code.toUpperCase())
    .single();

  if (error) {
    console.error('Error fetching flex card:', error);
    return {success: false, error: 'Flex card not found'};
  }

  return {success: true, data: data as FlexCard};
}

// Fetch a flex card by its claim token (for claim pages - keeps code private)
export async function fetchFlexCardByClaimToken(claimToken: string) {
  const supabase = await createClient();

  const {data, error} = await supabase
    .from('flex_cards')
    .select(`
      *,
      sender:profiles!flex_cards_sender_id_fkey(display_name, username, avatar_url)
    `)
    .eq('claim_token', claimToken)
    .single();

  if (error) {
    console.error('Error fetching flex card by claim token:', error);
    return {success: false, error: 'Flex card not found'};
  }

  return {success: true, data: data as FlexCard};
}

// Claim a flex card by code (legacy - for direct code entry)
export async function claimFlexCard(code: string) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  // First, verify the card exists and is not already claimed
  const {data: flexCard, error: fetchError} = await supabase
    .from('flex_cards')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (fetchError || !flexCard) {
    return {success: false, error: 'Flex card not found'};
  }

  if (flexCard.user_id) {
    return {success: false, error: 'This flex card has already been claimed'};
  }

  if (flexCard.status === 'redeemed') {
    return {success: false, error: 'This flex card has been fully redeemed'};
  }

  // Claim the card
  const {data: updatedCard, error: updateError} = await supabase
    .from('flex_cards')
    .update({
      user_id: user.id,
      claimed_at: new Date().toISOString(),
    })
    .eq('id', flexCard.id)
    .select()
    .single();

  if (updateError) {
    console.error('Error claiming flex card:', updateError);
    return {success: false, error: updateError.message};
  }

  revalidatePath('/v2/dashboard');

  return {success: true, data: updatedCard};
}

// Claim a flex card by claim token (used from claim URLs)
export async function claimFlexCardByToken(claimToken: string) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  // First, verify the card exists and is not already claimed
  const {data: flexCard, error: fetchError} = await supabase
    .from('flex_cards')
    .select('*')
    .eq('claim_token', claimToken)
    .single();

  if (fetchError || !flexCard) {
    return {success: false, error: 'Flex card not found'};
  }

  if (flexCard.user_id) {
    return {success: false, error: 'This flex card has already been claimed'};
  }

  if (flexCard.status === 'redeemed') {
    return {success: false, error: 'This flex card has been fully redeemed'};
  }

  // Claim the card
  const {data: updatedCard, error: updateError} = await supabase
    .from('flex_cards')
    .update({
      user_id: user.id,
      claimed_at: new Date().toISOString(),
    })
    .eq('id', flexCard.id)
    .select()
    .single();

  if (updateError) {
    console.error('Error claiming flex card:', updateError);
    return {success: false, error: updateError.message};
  }

  revalidatePath('/v2/dashboard');

  return {success: true, data: updatedCard};
}

// Redeem (partial or full) from a flex card at a vendor
export async function redeemFlexCard(params: {
  code: string;
  amount: number;
  vendorId: string;
  description?: string;
}) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  // Verify vendor role
  const {data: vendorProfile} = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', params.vendorId)
    .single();

  if (!vendorProfile?.roles?.includes('vendor')) {
    return {success: false, error: 'Invalid vendor'};
  }

  // Fetch the flex card
  const {data: flexCard, error: fetchError} = await supabase
    .from('flex_cards')
    .select('*')
    .eq('code', params.code.toUpperCase())
    .single();

  if (fetchError || !flexCard) {
    return {success: false, error: 'Flex card not found'};
  }

  if (flexCard.status === 'redeemed') {
    return {success: false, error: 'This flex card has been fully redeemed'};
  }

  if (params.amount > flexCard.current_balance) {
    return {success: false, error: `Insufficient balance. Available: ₦${flexCard.current_balance.toLocaleString()}`};
  }

  if (params.amount <= 0) {
    return {success: false, error: 'Amount must be greater than 0'};
  }

  const newBalance = flexCard.current_balance - params.amount;
  const newStatus = newBalance === 0 ? 'redeemed' : 'partially_used';

  // Start transaction: update flex card and create transaction record
  const {error: updateError} = await supabase
    .from('flex_cards')
    .update({
      current_balance: newBalance,
      status: newStatus,
    })
    .eq('id', flexCard.id);

  if (updateError) {
    console.error('Error updating flex card:', updateError);
    return {success: false, error: updateError.message};
  }

  // Create transaction record
  const {data: transaction, error: txError} = await supabase
    .from('flex_card_transactions')
    .insert({
      flex_card_id: flexCard.id,
      vendor_id: params.vendorId,
      amount: params.amount,
      balance_after: newBalance,
      description: params.description || `Redeemed at vendor`,
    })
    .select()
    .single();

  if (txError) {
    console.error('Error creating flex card transaction:', txError);
    // Note: In production, you'd want to rollback the flex card update
    return {success: false, error: txError.message};
  }

  revalidatePath('/v2/dashboard');
  revalidatePath('/v2/vendor/dashboard');

  // Record in main transactions table for user wallet history
  if (flexCard.user_id) {
    const adminSupabase = createAdminClient();
    await adminSupabase.from('transactions').insert({
      user_id: flexCard.user_id,
      amount: Math.round(params.amount * 100),
      type: 'flex_card_redemption',
      status: 'success',
      reference: `FLEX-${flexCard.code}-${Date.now()}`,
      description: params.description || `Payment with Flex Card at vendor`,
    });
  }

  return {
    success: true,
    data: {
      transaction,
      newBalance,
      status: newStatus,
    },
  };
}

// Get transaction history for a flex card
export async function getFlexCardTransactions(cardId: number) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  // First verify the user owns/sent this card
  const {data: flexCard} = await supabase
    .from('flex_cards')
    .select('id, user_id, sender_id')
    .eq('id', cardId)
    .single();

  if (!flexCard || (flexCard.user_id !== user.id && flexCard.sender_id !== user.id)) {
    return {success: false, error: 'Unauthorized'};
  }

  const {data, error} = await supabase
    .from('flex_card_transactions')
    .select(`
      *,
      vendor:profiles!flex_card_transactions_vendor_id_fkey(shop_name, display_name)
    `)
    .eq('flex_card_id', cardId)
    .order('created_at', {ascending: false});

  if (error) {
    console.error('Error fetching flex card transactions:', error);
    return {success: false, error: error.message};
  }

  return {success: true, data: data as FlexCardTransaction[]};
}

// Admin/Vendor: Look up a flex card for redemption (by vendor)
export async function lookupFlexCardForRedemption(code: string) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  // Verify vendor role
  const {data: profile} = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  if (!profile?.roles?.includes('vendor')) {
    return {success: false, error: 'Only vendors can look up flex cards for redemption'};
  }

  const {data: flexCard, error} = await supabase
    .from('flex_cards')
    .select(`
      id,
      code,
      current_balance,
      currency,
      status,
      user_id,
      profiles:user_id(display_name, avatar_url)
    `)
    .eq('code', code.toUpperCase())
    .single();

  if (error || !flexCard) {
    return {success: false, error: 'Flex card not found'};
  }

  if (flexCard.status === 'redeemed') {
    return {success: false, error: 'This flex card has been fully redeemed'};
  }

  return {
    success: true,
    data: {
      id: flexCard.id,
      code: flexCard.code,
      balance: flexCard.current_balance,
      currency: flexCard.currency,
      status: flexCard.status,
      userName: (flexCard.profiles as any)?.display_name || 'Unknown User',
      userAvatar: (flexCard.profiles as any)?.avatar_url,
    },
  };
}

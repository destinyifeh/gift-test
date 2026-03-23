'use server';

import {revalidatePath} from 'next/cache';
import {createAdminClient} from '../supabase/admin';
import {createClient} from '../supabase/server';

/**
 * Fetch a gift by its unique gift_code.
 * We query the campaigns table because that's where vouchers are stored.
 */
export async function fetchGiftByCode(code: string) {
  const supabase = await createClient();

  const {data: gift, error} = await supabase
    .from('campaigns')
    .select(
      `
      *,
      sender:profiles!campaigns_user_id_fkey(display_name, email),
      product:vendor_gifts(
        name, 
        image_url, 
        description,
        vendor:profiles!vendor_gifts_vendor_id_fkey(shop_name, display_name, shop_logo_url)
      )
    `,
    )
    .eq('gift_code', code.trim())
    .maybeSingle();

  if (error) {
    console.error('Error fetching gift by code:', error);
    return {success: false, error: error.message};
  }

  if (!gift) {
    return {success: false, error: 'Gift not found or invalid code'};
  }

  return {success: true, data: gift};
}

/**
 * Claim a gift. Updates the campaign's user_id to the current user.
 */
export async function claimGiftByCode(code: string) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'You must be logged in to claim a gift'};
  }

  // 1. Fetch the gift to ensure it's not already claimed
  const {data: gift, error: fetchError} = await supabase
    .from('campaigns')
    .select(
      'user_id, claimable_type, current_amount, goal_amount, currency, status, sender_name, sender_email, message',
    )
    .eq('gift_code', code.trim())
    .single();

  if (fetchError || !gift) {
    return {success: false, error: 'Gift not found'};
  }

  if (gift.status === 'claimed' || gift.status === 'redeemed') {
    return {success: false, error: 'This gift has already been claimed'};
  }

  const isMoney = gift.claimable_type === 'money';
  const amountToClaim = Number(gift.goal_amount || gift.current_amount || 0);

  // 2. Update the campaign status and owner (Use ADMIN client to bypass RLS)
  const adminSupabase = createAdminClient();
  const {error: updateError} = await adminSupabase
    .from('campaigns')
    .update({
      user_id: user.id,
      status: isMoney ? 'redeemed' : 'claimed',
      category: 'gift-received',
    })
    .eq('gift_code', code.trim());

  if (updateError) {
    console.error('Error claiming gift:', updateError);
    return {success: false, error: updateError.message};
  }

  // 3. Record the transaction
  // For money gifts, this actually increases their wallet balance
  const {data: txData, error: txError} = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      amount: Math.round(amountToClaim * 100), // Store in smallest unit (kobo/cents)
      currency: gift.currency || 'NGN',
      type: isMoney ? 'creator_support' : 'receipt', // creator_support contributes to balance in this system
      status: 'success',
      reference: `claim-${code}-${Date.now()}`,
      description: `Claimed ${isMoney ? 'monetary gift' : 'gift card'}: ${code}`,
    })
    .select()
    .single();

  if (txError) {
    console.error('Error recording claim transaction:', txError);
  }

  // 4. If it's a money gift, also record in creator_support table for dashboard visibility
  if (isMoney) {
    const {error: supportError} = await adminSupabase
      .from('creator_support')
      .insert({
        user_id: user.id,
        transaction_id: txData?.id || null,
        amount: amountToClaim,
        currency: gift.currency || 'NGN',
        donor_name: (gift as any).sender_name || 'A Friend',
        donor_email: (gift as any).sender_email || '',
        message: (gift as any).message || 'Claimed monetary gift',
      });

    if (supportError) {
      console.error('Error recording creator support for claim:', supportError);
    }
  }

  revalidatePath('/dashboard', 'layout');
  return {success: true};
}

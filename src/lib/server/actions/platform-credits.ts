'use server';

import {revalidatePath} from 'next/cache';
import {createAdminClient} from '../supabase/admin';
import {createClient} from '../supabase/server';

/**
 * Converts a claimed gift card into Platform Credit.
 * Deducts a 2% fee. The gift must be 'claimed' but not 'redeemed'.
 */
export async function convertGiftToCredit(campaignId: string) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return {success: false, error: 'Not authenticated'};

  // 1. Fetch gift and verify ownership/status
  const {data: gift, error: fetchError} = await supabase
    .from('campaigns')
    .select('id, user_id, status, goal_amount, currency, gift_code')
    .eq('id', campaignId)
    .single();

  if (fetchError || !gift) return {success: false, error: 'Gift not found'};
  if (gift.user_id !== user.id) return {success: false, error: 'Unauthorized'};
  if (gift.status !== 'claimed') {
    return {success: false, error: 'Only claimed, non-redeemed gifts can be converted'};
  }

  const originalAmount = Number(gift.goal_amount);
  const fee = originalAmount * 0.02;
  const creditAmount = originalAmount - fee;

  const adminSupabase = createAdminClient();

  try {
    // 2. Update profile balance
    const {data: profile, error: profileError} = await adminSupabase
      .from('profiles')
      .select('platform_balance')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    const newBalance = (Number(profile.platform_balance || 0)) + Math.round(creditAmount * 100);

    const {error: balanceUpdateError} = await adminSupabase
      .from('profiles')
      .update({platform_balance: newBalance})
      .eq('id', user.id);

    if (balanceUpdateError) throw balanceUpdateError;

    // 3. Mark gift as converted
    const {error: giftUpdateError} = await adminSupabase
      .from('campaigns')
      .update({status: 'converted'})
      .eq('id', campaignId);

    if (giftUpdateError) throw giftUpdateError;

    // 4. Record transaction
    const {error: txError} = await adminSupabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: Math.round(creditAmount * 100),
        currency: gift.currency || 'NGN',
        type: 'platform_credit_conversion',
        status: 'success',
        reference: `conv-${gift.id}-${Date.now()}`,
        description: `Converted gift card ${gift.gift_code} to platform credit (2% fee applied)`,
        metadata: {
          original_amount: originalAmount,
          fee: fee,
          campaign_id: gift.id
        }
      });

    if (txError) console.error('Transaction log error:', txError);

    revalidatePath('/dashboard', 'layout');
    return {success: true, creditAmount};
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
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return {success: false, error: 'Not authenticated'};

  // 1. Fetch current gift and its vendor
  const {data: currentGift, error: giftError} = await supabase
    .from('campaigns')
    .select('*, vendor_gifts(vendor_id, amount)')
    .eq('id', campaignId)
    .single();

  if (giftError || !currentGift) return {success: false, error: 'Gift not found'};
  if (currentGift.user_id !== user.id) return {success: false, error: 'Unauthorized'};
  if (currentGift.status !== 'claimed') return {success: false, error: 'Gift cannot be swapped'};

  // 2. Fetch new gift product
  const {data: newProduct, error: prodError} = await supabase
    .from('vendor_gifts')
    .select('vendor_id, amount, name')
    .eq('id', newVendorGiftId)
    .single();

  if (prodError || !newProduct) return {success: false, error: 'New product not found'};

  // 3. Validation: Same vendor and same amount
  const currentVendorId = (currentGift.vendor_gifts as any)?.vendor_id;
  const currentAmount = Number(currentGift.goal_amount);
  
  if (newProduct.vendor_id !== currentVendorId) {
    return {success: false, error: 'Swap must be with the same vendor'};
  }
  
  if (Number(newProduct.amount) !== currentAmount) {
    return {success: false, error: 'Swap must be for the exact same amount'};
  }

  const adminSupabase = createAdminClient();
  
  // 4. Update the campaign record
  const {error: updateError} = await adminSupabase
    .from('campaigns')
    .update({
      claimable_gift_id: newVendorGiftId,
      title: `Swap: ${newProduct.name}`
    })
    .eq('id', campaignId);

  if (updateError) return {success: false, error: updateError.message};

  revalidatePath('/dashboard', 'layout');
  return {success: true};
}

/**
 * Fetch other gifts from the same vendor with the exact same amount.
 */
export async function fetchEligibleSwapGifts(vendorId: string, amount: number, currentGiftId: string) {
  const supabase = await createClient();
  
  const {data, error} = await supabase
    .from('vendor_gifts')
    .select('*')
    .eq('vendor_id', vendorId)
    .eq('amount', amount)
    .not('id', 'eq', currentGiftId);

  if (error) return {success: false, error: error.message};
  return {success: true, data: data || []};
}

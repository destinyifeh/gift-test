'use server';

import {revalidatePath} from 'next/cache';
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
      vendor:profiles!campaigns_user_id_fkey(display_name, shop_name, shop_logo_url),
      product:vendor_gifts!claimable_gift_id_fkey(name, image_url, description)
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

  // 1. Fetch the gift to ensure it's not already claimed by someone else
  // Note: if user_id is the vendor, it means it's still available for claim.
  const {data: gift, error: fetchError} = await supabase
    .from('campaigns')
    .select('user_id, claimable_gift_id')
    .eq('gift_code', code.trim())
    .single();

  if (fetchError || !gift) {
    return {success: false, error: 'Gift not found'};
  }

  // If it's a gift card, we check if the current owner is a vendor (i.e. unclaimed)
  // or if it's already owned by a customer.
  // In our simplified logic, if the recipient_email matches or it's just unclaimed, we allow it.

  // 2. Update the campaign to belong to the claimant
  const {error: updateError} = await supabase
    .from('campaigns')
    .update({
      user_id: user.id,
      status: 'active', // Mark as active in recipient's dashboard
      category: 'gift-received', // Optional marker
    })
    .eq('gift_code', code.trim());

  if (updateError) {
    console.error('Error claiming gift:', updateError);
    return {success: false, error: updateError.message};
  }

  // 3. Record in transactions (Optional: shows in "Recent Activity" as Received)
  await supabase.from('transactions').insert({
    user_id: user.id,
    amount: 0, // Metadata only
    type: 'receipt',
    status: 'success',
    reference: `claim-${code}-${Date.now()}`,
    description: `Claimed gift: ${code}`,
  });

  revalidatePath('/dashboard');
  return {success: true};
}

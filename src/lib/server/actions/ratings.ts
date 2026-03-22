'use server';

import {revalidatePath} from 'next/cache';
import {createClient} from '../supabase/server';

/**
 * Submits a rating for a voucher gift (campaigns table).
 */
export async function rateVoucherGift(campaignId: string, rating: number) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return {success: false, error: 'Not authenticated'};

  const {error} = await supabase
    .from('campaigns')
    .update({vendor_rating: rating})
    .eq('id', campaignId)
    .eq('user_id', user.id); // Ensure they own it

  if (error) {
    console.error('Error rating voucher:', error);
    return {success: false, error: error.message};
  }

  revalidatePath('/dashboard');
  return {success: true};
}

/**
 * Submits a rating for a direct support gift (creator_support table).
 */
export async function rateSupportGift(supportId: string, rating: number) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return {success: false, error: 'Not authenticated'};

  const {error} = await supabase
    .from('creator_support')
    .update({vendor_rating: rating})
    .eq('id', supportId)
    .eq('user_id', user.id); // Ensure they own it

  if (error) {
    console.error('Error rating support gift:', error);
    return {success: false, error: error.message};
  }

  revalidatePath('/dashboard');
  return {success: true};
}

/**
 * Calculates the average rating and total review count for a specific vendor.
 */
export async function getVendorRatingStats(vendorId: string) {
  const supabase = await createClient();

  // 1. Get campaign ratings
  const {data: gifts} = await supabase
    .from('vendor_gifts')
    .select('id')
    .eq('vendor_id', vendorId);
  const giftIds = gifts?.map(g => g.id) || [];

  let campaignsData: any[] = [];
  if (giftIds.length > 0) {
    const {data} = await supabase
      .from('campaigns')
      .select('vendor_rating')
      .in('claimable_gift_id', giftIds)
      .not('vendor_rating', 'is', null)
      .gt('vendor_rating', 0);
    campaignsData = data || [];
  }

  // 2. Get creator_support ratings
  const {data: supportData} = await supabase
    .from('creator_support')
    .select('vendor_rating')
    .eq('user_id', vendorId)
    .not('vendor_rating', 'is', null)
    .gt('vendor_rating', 0);

  const allRatings = [
    ...campaignsData.map(c => c.vendor_rating),
    ...(supportData || []).map(s => s.vendor_rating),
  ].filter(r => typeof r === 'number');

  if (allRatings.length === 0) {
    return {average: 0, count: 0};
  }

  const sum = allRatings.reduce((a, b) => a + b, 0);
  return {
    average: Math.round((sum / allRatings.length) * 10) / 10,
    count: allRatings.length,
  };
}

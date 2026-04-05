'use server';

import {revalidatePath} from 'next/cache';
import {createClient} from '../supabase/server';

/**
 * Toggle favorite status for a product.
 */
export async function toggleFavorite(productId: number) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return {success: false, error: 'Not authenticated'};

  // 1. Check if already favorited
  const {data: existing} = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    // Remove if exists
    const {error} = await supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id);

    if (error) return {success: false, error: error.message};
  } else {
    // Add if not exists
    const {error} = await supabase.from('favorites').insert({
      user_id: user.id,
      product_id: productId,
    });

    if (error) return {success: false, error: error.message};
  }

  revalidatePath('/dashboard');
  revalidatePath(`/gift-shop`);
  return {success: true, wasAdded: !existing};
}

/**
 * Fetch all favorited products for the current user.
 */
export async function fetchUserFavorites() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return {success: false, error: 'Not authenticated'};

  const {data, error} = await supabase
    .from('favorites')
    .select(
      `
      id,
      product_id,
      vendor_gifts (
        *,
        profiles:vendor_gifts_vendor_id_fkey (
          shop_name,
          display_name,
          shop_slug,
          country
        )
      )
    `,
    )
    .eq('user_id', user.id)
    .order('created_at', {ascending: false});

  if (error) {
    console.error('Error fetching favorites:', error);
    return {success: false, error: error.message};
  }

  // Flatten the response
  const flattened = (data || []).map((f: any) => ({
    favoriteId: f.id,
    ...f.vendor_gifts,
    shopSlug: f.vendor_gifts.profiles?.shop_slug,
    vendor:
      f.vendor_gifts.profiles?.shop_name ||
      f.vendor_gifts.profiles?.display_name ||
      'Vendor',
  }));

  return {success: true, data: flattened};
}

/**
 * Check if a specific product is favorited by the current user.
 */
export async function checkIsFavorited(productId: number) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return false;

  const {data} = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();

  return !!data;
}

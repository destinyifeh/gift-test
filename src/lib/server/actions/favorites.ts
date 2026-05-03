'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '../server-api';

/**
 * Toggle favorite status for a product.
 */
export async function toggleFavorite(productId: number) {
  try {
    const response = await serverFetch(`favorites/toggle/${productId}`, {
      method: 'POST',
    });
    
    revalidatePath('/dashboard');
    revalidatePath(`/gift-shop`);
    return { success: true, wasAdded: response.wasAdded };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Fetch all favorited products for the current user.
 */
export async function fetchUserFavorites() {
  try {
    const data = await serverFetch('favorites');
    
    // The backend `FavoriteController` should ideally map the data correctly, 
    // but we add a fallback mapping to prevent frontend breaks.
    const flattened = (data || []).map((f: any) => {
      // If the backend already returns flattened data, use it directly
      if (f.vendor) return f;
      
      // Legacy mapping fallback
      return {
        favoriteId: f.id || f.favoriteId,
        ...(f.vendor_gifts || f.vendorGift || f),
        businessSlug: f.vendor_gifts?.profiles?.business_slug || f.businessSlug,
        vendor:
          f.vendor_gifts?.profiles?.business_name ||
          f.vendor_gifts?.profiles?.display_name ||
          f.vendor ||
          'Vendor',
      };
    });

    return { success: true, data: flattened };
  } catch (error: any) {
    console.error('Error fetching favorites:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if a specific product is favorited by the current user.
 */
export async function checkIsFavorited(productId: number) {
  try {
    const response = await serverFetch(`favorites/check/${productId}`);
    return response.isFavorited;
  } catch (error) {
    return false;
  }
}

'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '../server-api';

export type FeaturedItemPlacement = 'featured' | 'new_arrivals';

export interface FeaturedItem {
  id: number;
  admin_id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  cta_text: string;
  cta_url: string;
  placement: FeaturedItemPlacement;
  display_order: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface FeaturedItemCreateData {
  title: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  cta_text?: string;
  cta_url: string;
  placement: FeaturedItemPlacement;
  display_order?: number;
}

export interface FeaturedItemUpdateData {
  title?: string;
  subtitle?: string | null;
  description?: string | null;
  image_url?: string | null;
  cta_text?: string;
  cta_url?: string;
  placement?: FeaturedItemPlacement;
  display_order?: number;
  status?: 'active' | 'inactive';
}

// Fetch all featured items (admin)
export async function fetchAllFeaturedItems() {
  try {
    const data = await serverFetch('featured-items');
    return { success: true, data: data as FeaturedItem[] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Fetch active featured items by placement (public)
export async function fetchFeaturedItemsByPlacement(placement: FeaturedItemPlacement) {
  try {
    const data = await serverFetch(`featured-items/placement/${placement}`);
    return { success: true, data: data as FeaturedItem[] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Create a featured item (admin only)
export async function createFeaturedItem(data: FeaturedItemCreateData) {
  try {
    const item = await serverFetch('featured-items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    revalidatePath('/gifts');
    revalidatePath('/');
    revalidatePath('/admin');
    
    return { success: true, data: item };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Update a featured item (admin only)
export async function updateFeaturedItem(id: number, data: FeaturedItemUpdateData) {
  try {
    const item = await serverFetch(`featured-items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    
    revalidatePath('/gifts');
    revalidatePath('/');
    revalidatePath('/admin');
    
    return { success: true, data: item };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Delete a featured item (admin only)
export async function deleteFeaturedItem(id: number) {
  try {
    await serverFetch(`featured-items/${id}`, {
      method: 'DELETE',
    });
    
    revalidatePath('/gifts');
    revalidatePath('/');
    revalidatePath('/admin');
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Upload featured item image (admin only)
export async function uploadFeaturedItemImage(formData: FormData) {
  // Pending Backend Storage Service integration
  return { success: false, error: 'Migration Notice: Native file upload proxy needs backend Storage Service integration.' };
}

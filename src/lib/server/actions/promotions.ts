'use server';

import {serverFetch} from '@/lib/server/server-api';

export type PromotionPlacement =
  | 'featured'
  | 'new_arrivals'
  | 'sponsored'
  | 'category_banner';

export interface Promotion {
  id: number;
  userId: string;
  vendorId: string;
  productId: number;
  placement: PromotionPlacement;
  duration_days: number;
  amount_paid: number;
  status: 'pending_approval' | 'active' | 'paused' | 'rejected' | 'expired';
  views: number;
  clicks: number;
  conversions: number;
  start_date?: string;
  end_date?: string;
  rejection_reason?: string;
  created_at: string;
  vendor_gifts?: {
    id: number;
    name: string;
    price: number;
    image_url: string;
  };
  profiles?: {
    business_name: string;
    display_name: string;
  };
}

export interface ExternalPromotion {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  redirect_url: string;
  price?: number;
  placement: PromotionPlacement;
  status: 'active' | 'paused' | 'expired';
  views: number;
  clicks: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export async function fetchAllPromotions(status?: string) {
  try {
    const url = `/promotions/all${status ? `?status=${status}` : ''}`;
    const res = await serverFetch(url);
    return res;
  } catch (error: any) {
    console.error('Error fetching promotions:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch promotions',
    };
  }
}

export async function fetchAllExternalPromotions() {
  try {
    const res = await serverFetch('/promotions/external/all');
    return res;
  } catch (error: any) {
    console.error('Error fetching external promotions:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch external promotions',
    };
  }
}

export async function approvePromotion(id: number) {
  try {
    const res = await serverFetch(`/promotions/${id}/approve`, {
      method: 'PATCH',
    });
    return res;
  } catch (error: any) {
    console.error('Error approving promotion:', error);
    return {
      success: false,
      error: error.message || 'Failed to approve promotion',
    };
  }
}

export async function rejectPromotion(id: number, reason: string) {
  try {
    const res = await serverFetch(`/promotions/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({reason}),
    });
    return res;
  } catch (error: any) {
    console.error('Error rejecting promotion:', error);
    return {
      success: false,
      error: error.message || 'Failed to reject promotion',
    };
  }
}

export async function createExternalPromotion(
  data: Partial<ExternalPromotion>,
) {
  try {
    const res = await serverFetch('/promotions/external', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  } catch (error: any) {
    console.error('Error creating external promotion:', error);
    return {
      success: false,
      error: error.message || 'Failed to create external promotion',
    };
  }
}

export async function updateExternalPromotion(
  id: number,
  data: Partial<ExternalPromotion>,
) {
  try {
    const res = await serverFetch(`/promotions/external/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res;
  } catch (error: any) {
    console.error('Error updating external promotion:', error);
    return {
      success: false,
      error: error.message || 'Failed to update external promotion',
    };
  }
}

export async function deleteExternalPromotion(id: number) {
  try {
    const res = await serverFetch(`/promotions/external/${id}`, {
      method: 'DELETE',
    });
    return res;
  } catch (error: any) {
    console.error('Error deleting external promotion:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete external promotion',
    };
  }
}

export async function uploadPromotionImage(formData: FormData) {
  try {
    // Explicitly target the promotions folder for uploads
    const res = await serverFetch('/files/upload?folder=promotions', {
      method: 'POST',
      body: formData,
    });
    return res;
  } catch (error: any) {
    console.error('Error uploading promotion image:', error);
    return {success: false, error: error.message || 'Failed to upload image'};
  }
}

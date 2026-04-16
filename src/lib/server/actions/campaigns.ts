'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '../server-api';

export async function createCampaign(data: any) {
  try {
    const response = await serverFetch('campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    revalidatePath('/dashboard');
    return response;
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    return { success: false, error: error.message };
  }
}

export async function getMyCampaigns({ pageParam = 0 }: { pageParam?: number } = {}) {
  try {
    const limit = 10;
    const response = await serverFetch(`campaigns/my?page=${pageParam + 1}&limit=${limit}`);
    
    return {
      success: true,
      data: response,
      nextPage: response.length === limit ? pageParam + 1 : undefined,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCampaignBySlug(slug: string) {
  try {
    const data = await serverFetch(`campaigns/${slug}`);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCampaign(id: string, data: any) {
  try {
    const response = await serverFetch(`campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    revalidatePath('/dashboard');
    revalidatePath('/dashboard');
    return response;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminUpdateCampaign(id: string, data: any) {
  try {
    const response = await serverFetch(`campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    revalidatePath('/dashboard');
    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return response;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function uploadCampaignImage(formData: FormData) {
  return { success: false, error: 'Migration Notice: Native file upload proxy needs backend Storage Service integration.' };
}

export async function getTopCampaignsByAmountRaised(limit: number = 6) {
  try {
    const response = await serverFetch(`campaigns/public/top?limit=${limit}`);
    return { success: true, data: Array.isArray(response) ? response : (response.data || []) };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function getAllPublicCampaigns({
  pageParam = 0,
  category,
  search,
  sort = 'recent',
}: {
  pageParam?: number;
  category?: string;
  search?: string;
  sort?: 'all' | 'trending' | 'recent' | 'new' | 'near-goal' | 'ending-soon';
} = {}) {
  try {
    const limit = 12;
    const query = new URLSearchParams({
      page: (pageParam + 1).toString(),
      limit: limit.toString(),
      ...(category && category !== 'All' ? { category } : {}),
      ...(search ? { search } : {}),
      ...(sort ? { sortBy: sort } : {}),
    });

    const response = await serverFetch(`campaigns/public/all?${query.toString()}`);
    
    return {
      success: true,
      data: response.data || [],
      nextPage: response.pagination?.hasMore ? pageParam + 1 : undefined,
      pagination: response.pagination,
    };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function deleteCampaignImage(url: string) {
  return { success: false, error: 'Storage removal requires backend Bucket proxy.' };
}

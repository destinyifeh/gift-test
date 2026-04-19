'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '../server-api';

const mapCampaign = (c: any) => ({
  ...c,
  goal_amount: c.goalAmount,
  current_amount: c.currentAmount,
  gift_code: c.giftCode,
  created_at: c.createdAt,
  updated_at: c.updatedAt,
  user_id: c.userId,
  short_id: c.campaignShortId,
  campaign_short_id: c.campaignShortId,
  slug: c.campaignSlug || c.campaignShortId,
  campaign_slug: c.campaignSlug || c.campaignShortId,
  user: c.user ? {
    ...c.user,
    display_name: c.user.displayName,
    avatar_url: c.user.avatarUrl,
  } : undefined,
  raisedAmount: c.contributions?.reduce((sum: number, contrib: any) => sum + Number(contrib.amount || 0), 0) || 0,
  contributorsCount: c.contributions?.length || 0,
  contributions: c.contributions?.map((contrib: any) => ({
    ...contrib,
    donor_name: contrib.donor_name || (contrib.isAnonymous ? 'Anonymous' : contrib.donorName) || 'Guest',
    created_at: contrib.createdAt,
  }))
});

export async function createCampaign(data: any) {
  try {
    const response = await serverFetch('campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    revalidatePath('/dashboard');
    return { success: true, data: mapCampaign(response) };
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    return { success: false, error: error.message };
  }
}

export async function getMyCampaigns({ pageParam = 0, category }: { pageParam?: number; category?: string } = {}) {
  try {
    const limit = 10;
    const query = new URLSearchParams({
      page: (pageParam + 1).toString(),
      limit: limit.toString(),
      ...(category && category !== 'all' ? { category } : {}),
    });
    
    const response = await serverFetch(`campaigns/my?${query.toString()}`);
    
    const data = Array.isArray(response) ? response : (response.data || []);
    return {
      success: true,
      data: data.map(mapCampaign),
      nextPage: data.length === limit ? pageParam + 1 : undefined,
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
    return { success: true, data: response };
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
    return { success: true, data: response };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function uploadCampaignImage(formData: FormData): Promise<{success: boolean; error?: string; url?: string}> {
  return { success: false, error: 'Migration Notice: Native file upload proxy needs backend Storage Service integration.' };
}

export async function getTopCampaignsByAmountRaised(limit: number = 6) {
  try {
    const response = await serverFetch(`campaigns/public/top?limit=${limit}`);
    const dataArray = Array.isArray(response) ? response : (response.data || []);
    return { success: true, data: dataArray.map(mapCampaign) };
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
      data: (response.data || []).map(mapCampaign),
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

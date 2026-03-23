'use server';

import {generateSlug} from '@/lib/utils/slugs';
import {revalidatePath} from 'next/cache';
import {createClient} from '../supabase/server';
import {sendGiftEmail} from './email';
import {fetchVendorProductById} from './vendor';

export async function createCampaign(data: {
  category: string;
  title: string;
  description?: string;
  goal_amount?: number;
  min_amount?: number;
  end_date?: string;
  image_url?: string;
  visibility?: 'public' | 'private';
  contributors_see_each_other?: boolean;
  claimable_type?: 'money' | 'gift-card';
  claimable_gift_id?: number;
  claimable_recipient_type?: 'self' | 'other';
  recipient_email?: string;
  sender_email?: string;
  gift_code?: string;
  currency?: string;
  payment_reference?: string;
}) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  // Generate a unique slug from title
  const slug = generateSlug(data.title);

  const {data: campaign, error} = await supabase
    .from('campaigns')
    .insert({
      ...data,
      user_id: user.id,
      slug,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating campaign:', error);
    return {success: false, error: error.message};
  }

  revalidatePath('/dashboard');

  // Handle Email Sending for Claimable Gifts
  if (data.category === 'claimable' && data.recipient_email && data.gift_code) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const claimUrl = `${siteUrl}/claim/${data.gift_code}`;

    // Get sender info
    const {data: profile} = await supabase
      .from('profiles')
      .select('display_name, shop_name')
      .eq('id', user.id)
      .single();

    const senderName = profile?.display_name || user.email || 'Someone';

    // Get vendor info if it's a gift card
    let vendorShopName = 'Gifthance';
    if (data.claimable_type === 'gift-card' && data.claimable_gift_id) {
      const productRes = await fetchVendorProductById(data.claimable_gift_id);
      if (productRes.success && productRes.data) {
        vendorShopName =
          productRes.data.profiles?.shop_name ||
          productRes.data.profiles?.display_name ||
          'Gifthance';
      }
    }

    await sendGiftEmail({
      to: data.recipient_email,
      senderName,
      vendorShopName,
      giftName: data.title || 'Gift',
      giftAmount: data.goal_amount || 0,
      message: data.description,
      claimUrl,
    });
  }

  return {success: true, data: campaign};
}

export async function getMyCampaigns({
  pageParam = 0,
}: {pageParam?: number} = {}) {
  const limit = 10;
  const from = pageParam * limit;
  const to = from + limit - 1;
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  const {data, error} = await supabase
    .from('campaigns')
    .select('*, contributions(id)')
    .eq('user_id', user.id)
    .is('gift_code', null)
    .order('created_at', {ascending: false})
    .range(from, to);

  if (error) {
    return {success: false, error: error.message};
  }

  return {
    success: true,
    data,
    nextPage: data?.length === limit ? pageParam + 1 : undefined,
  };
}

export async function getCampaignBySlug(slug: string) {
  const supabase = await createClient();

  const {data, error} = await supabase
    .from('campaigns')
    .select(
      '*, profiles!campaigns_user_id_fkey(id, username, display_name, avatar_url), contributions(*)',
    )
    .eq('slug', slug)
    .order('created_at', {foreignTable: 'contributions', ascending: false})
    .single();

  if (error) {
    return {success: false, error: error.message};
  }

  return {success: true, data};
}

export async function updateCampaign(id: string, data: any) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  const {error} = await supabase
    .from('campaigns')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return {success: false, error: error.message};
  }

  revalidatePath('/dashboard');
  return {success: true};
}

export async function uploadCampaignImage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  const file = formData.get('file') as File;
  if (!file) {
    return {success: false, error: 'No file provided'};
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const {error} = await supabase.storage
    .from('campaign-images')
    .upload(filePath, file);

  if (error) {
    return {success: false, error: error.message};
  }

  const {
    data: {publicUrl},
  } = supabase.storage.from('campaign-images').getPublicUrl(filePath);

  return {success: true, url: publicUrl};
}
export async function getAllPublicCampaigns({
  pageParam = 0,
}: {pageParam?: number} = {}) {
  const limit = 12;
  const from = pageParam * limit;
  const to = from + limit - 1;
  const supabase = await createClient();

  const {data, error} = await supabase
    .from('campaigns')
    .select(
      '*, profiles!campaigns_user_id_fkey(id, username, display_name, avatar_url), contributions(id)',
    )
    .eq('visibility', 'public')
    .eq('status', 'active')
    .is('gift_code', null)
    .order('created_at', {ascending: false})
    .range(from, to);

  if (error) {
    return {success: false, error: error.message};
  }

  return {
    success: true,
    data,
    nextPage: data?.length === limit ? pageParam + 1 : undefined,
  };
}

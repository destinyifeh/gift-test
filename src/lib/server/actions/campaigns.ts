'use server';

import {generateSlug} from '@/lib/utils/slugs';
import {revalidatePath} from 'next/cache';
import {createClient} from '../supabase/server';

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
  gift_code?: string;
  currency?: string;
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
  return {success: true, data: campaign};
}

export async function getMyCampaigns() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  const {data, error} = await supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {ascending: false});

  if (error) {
    return {success: false, error: error.message};
  }

  return {success: true, data};
}

export async function getCampaignBySlug(slug: string) {
  const supabase = await createClient();

  const {data, error} = await supabase
    .from('campaigns')
    .select('*, profiles(id, username, display_name, avatar_url)')
    .eq('slug', slug)
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
export async function getAllPublicCampaigns() {
  const supabase = await createClient();

  const {data, error} = await supabase
    .from('campaigns')
    .select('*, profiles(id, username, display_name, avatar_url)')
    .eq('visibility', 'public')
    .eq('status', 'active')
    .order('created_at', {ascending: false});

  if (error) {
    return {success: false, error: error.message};
  }

  return {success: true, data};
}

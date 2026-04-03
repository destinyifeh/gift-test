'use server';

import {revalidatePath} from 'next/cache';
import {createClient} from '../supabase/server';

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
  const supabase = await createClient();

  const {data, error} = await supabase
    .from('featured_items')
    .select('*')
    .order('display_order', {ascending: true})
    .order('created_at', {ascending: false});

  if (error) {
    return {success: false, error: error.message};
  }

  return {success: true, data: data as FeaturedItem[]};
}

// Fetch active featured items by placement (public)
export async function fetchFeaturedItemsByPlacement(placement: FeaturedItemPlacement) {
  const supabase = await createClient();

  const {data, error} = await supabase
    .from('featured_items')
    .select('*')
    .eq('status', 'active')
    .eq('placement', placement)
    .order('display_order', {ascending: true});

  if (error) {
    return {success: false, error: error.message};
  }

  return {success: true, data: data as FeaturedItem[]};
}

// Create a featured item (admin only)
export async function createFeaturedItem(data: FeaturedItemCreateData) {
  const supabase = await createClient();

  // Get current user
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  // Verify admin role
  const {data: profile} = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  if (!profile?.roles?.includes('admin')) {
    return {success: false, error: 'Unauthorized'};
  }

  const {data: item, error} = await supabase
    .from('featured_items')
    .insert({
      admin_id: user.id,
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      image_url: data.image_url,
      cta_text: data.cta_text || 'Learn More',
      cta_url: data.cta_url,
      placement: data.placement,
      display_order: data.display_order || 0,
    })
    .select()
    .single();

  if (error) {
    return {success: false, error: error.message};
  }

  revalidatePath('/v2/gift-shop');
  revalidatePath('/v2');
  revalidatePath('/v2/admin');

  return {success: true, data: item};
}

// Update a featured item (admin only)
export async function updateFeaturedItem(id: number, data: FeaturedItemUpdateData) {
  const supabase = await createClient();

  // Get current user
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  // Verify admin role
  const {data: profile} = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  if (!profile?.roles?.includes('admin')) {
    return {success: false, error: 'Unauthorized'};
  }

  const {data: item, error} = await supabase
    .from('featured_items')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return {success: false, error: error.message};
  }

  revalidatePath('/v2/gift-shop');
  revalidatePath('/v2');
  revalidatePath('/v2/admin');

  return {success: true, data: item};
}

// Delete a featured item (admin only)
export async function deleteFeaturedItem(id: number) {
  const supabase = await createClient();

  // Get current user
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  // Verify admin role
  const {data: profile} = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  if (!profile?.roles?.includes('admin')) {
    return {success: false, error: 'Unauthorized'};
  }

  const {error} = await supabase
    .from('featured_items')
    .delete()
    .eq('id', id);

  if (error) {
    return {success: false, error: error.message};
  }

  revalidatePath('/v2/gift-shop');
  revalidatePath('/v2');
  revalidatePath('/v2/admin');

  return {success: true};
}

// Upload featured item image (admin only)
export async function uploadFeaturedItemImage(formData: FormData) {
  const supabase = await createClient();

  const {data: {user}} = await supabase.auth.getUser();
  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  // Verify admin role
  const {data: profile} = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  if (!profile?.roles?.includes('admin')) {
    return {success: false, error: 'Unauthorized'};
  }

  const file = formData.get('file') as File;
  if (!file) {
    return {success: false, error: 'No file provided'};
  }

  // Check file size (2MB limit)
  const MAX_SIZE = 2 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return {success: false, error: 'Image size must be less than 2MB'};
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `featured-${Date.now()}.${fileExt}`;
  const filePath = `featured-items/${fileName}`;

  const {error} = await supabase.storage
    .from('promotions')
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading featured item image:', error);
    return {success: false, error: error.message};
  }

  const {data: {publicUrl}} = supabase.storage.from('promotions').getPublicUrl(filePath);

  return {success: true, url: publicUrl};
}

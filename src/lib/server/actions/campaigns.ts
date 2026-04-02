'use server';

import {generateSlug, generateShortId} from '@/lib/utils/slugs';
import {revalidatePath} from 'next/cache';
import {createClient} from '../supabase/server';
import {sendGiftEmail} from './email';
import {fetchVendorProductById} from './vendor';

// Mock WhatsApp message sending function
// TODO: Replace with Twilio/WhatsApp Business API integration
async function sendWhatsAppMessage(params: {
  to: string;
  senderName: string;
  giftName: string;
  giftAmount: number;
  message?: string;
  claimUrl: string;
}) {
  // Mock implementation - just log for now
  console.log('=== WhatsApp Message (Mock) ===');
  console.log(`To: ${params.to}`);
  console.log(`From: ${params.senderName}`);
  console.log(`Gift: ${params.giftName}`);
  console.log(`Amount: ₦${params.giftAmount.toLocaleString()}`);
  console.log(`Message: ${params.message || 'No message'}`);
  console.log(`Claim URL: ${params.claimUrl}`);
  console.log('===============================');

  // In production, this would be:
  // const message = `Hey! ${params.senderName} sent you a gift on Gifthance!\n\n${params.message || ''}\n\nClaim your gift: ${params.claimUrl}\n\nDon't share this link with anyone else.`;
  // await twilioClient.messages.create({ body: message, to: params.to, from: 'whatsapp:+...' });

  return {success: true};
}

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
  sender_name?: string;
  gift_code?: string;
  currency?: string;
  payment_reference?: string;
  // WhatsApp delivery fields
  delivery_method?: 'email' | 'whatsapp';
  recipient_phone?: string;
  recipient_country_code?: string;
  whatsapp_fee?: number;
}) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  const campaign_short_id = generateShortId();
  const campaign_slug = generateSlug(data.title);

  // Prepare insert data with WhatsApp fields
  const insertData: any = {
    ...data,
    user_id: user.id,
    campaign_short_id,
    campaign_slug,
    status: 'active',
  };

  // Include WhatsApp delivery fields if present
  if (data.delivery_method) {
    insertData.delivery_method = data.delivery_method;
  }
  if (data.recipient_phone) {
    insertData.recipient_phone = data.recipient_phone;
  }
  if (data.recipient_country_code) {
    insertData.recipient_country_code = data.recipient_country_code;
  }
  if (data.whatsapp_fee) {
    insertData.whatsapp_fee = data.whatsapp_fee;
  }

  const {data: campaign, error} = await supabase
    .from('campaigns')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error creating campaign:', error);
    return {success: false, error: error.message};
  }

  // Handle Recording the Outbound Transaction for Paid Claimable Gifts
  if (
    data.category === 'claimable' &&
    data.payment_reference &&
    data.goal_amount
  ) {
    // Avoid transaction ID collisions by suffixing the reference
    const txRef = `${data.payment_reference}-out`;
    const {error: txError} = await supabase.from('transactions').insert({
      user_id: user.id, // the sender
      campaign_id: campaign.id,
      amount: Math.round(data.goal_amount * 100), // stored in kobo
      currency: data.currency || 'NGN',
      type: 'campaign_contribution', // Since creator_support_sent isn't in DB enum
      status: 'success',
      reference: txRef,
      description: `Gift: ${data.title || 'Gift'} to ${data.recipient_email || 'Friend'}`,
    });
    if (txError) {
      console.error('Error recording outbound gift transaction:', txError);
    }
  }

  revalidatePath('/dashboard');

  // Handle Email/WhatsApp Sending for Claimable Gifts
  if (data.category === 'claimable' && data.gift_code) {
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

    const finalSenderName = data.sender_name || senderName;

    // Send via WhatsApp if delivery_method is whatsapp
    if (data.delivery_method === 'whatsapp' && data.recipient_phone) {
      await sendWhatsAppMessage({
        to: data.recipient_phone,
        senderName: finalSenderName,
        giftName: data.title || 'Gift',
        giftAmount: data.goal_amount || 0,
        message: data.description,
        claimUrl,
      });
    }
    // Send via Email if delivery_method is email (or default)
    else if (data.recipient_email) {
      await sendGiftEmail({
        to: data.recipient_email,
        senderName: finalSenderName,
        vendorShopName,
        giftName: data.title || 'Gift',
        giftAmount: data.goal_amount || 0,
        message: data.description,
        claimUrl,
      });
    }
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
    .eq('campaign_short_id', slug)
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

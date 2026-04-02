'use server';

import {revalidatePath} from 'next/cache';
import {createClient} from '../supabase/server';
import type {PromotionPlacement} from '@/lib/utils/promotions';

// Re-export types from the utility file for convenience
export type {PromotionPlacement} from '@/lib/utils/promotions';

export type PromotionStatus = 'pending_approval' | 'active' | 'paused' | 'completed' | 'cancelled' | 'rejected';

export interface PromotionCreateData {
  product_id: number;
  placement: 'featured' | 'new_arrivals' | 'sponsored';
  duration_days: number;
  amount_paid: number;
  payment_reference?: string;
}

export interface Promotion {
  id: number;
  vendor_id: string;
  product_id: number;
  placement: 'featured' | 'new_arrivals' | 'sponsored';
  duration_days: number;
  start_date: string | null;
  end_date: string | null;
  amount_paid: number;
  status: PromotionStatus;
  views: number;
  clicks: number;
  conversions: number;
  payment_reference: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  vendor_gifts?: {
    id: number;
    name: string;
    price: number;
    image_url: string;
    vendor_id: string;
  };
  profiles?: {
    shop_name: string;
    display_name: string;
  };
}

// Create a new promotion (vendor)
export async function createPromotion(data: PromotionCreateData) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  // Verify user is a vendor
  const {data: profile} = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  if (!profile?.roles?.includes('vendor')) {
    return {success: false, error: 'Only vendors can create promotions'};
  }

  // Verify the product belongs to this vendor
  const {data: product} = await supabase
    .from('vendor_gifts')
    .select('id, vendor_id')
    .eq('id', data.product_id)
    .single();

  if (!product || product.vendor_id !== user.id) {
    return {success: false, error: 'Product not found or does not belong to you'};
  }

  // Check for existing active/pending promotion for this product
  const {data: existingPromotion} = await supabase
    .from('promotions')
    .select('id, status')
    .eq('product_id', data.product_id)
    .in('status', ['pending_approval', 'active'])
    .single();

  if (existingPromotion) {
    return {
      success: false,
      error: existingPromotion.status === 'pending_approval'
        ? 'This product already has a pending promotion request'
        : 'This product already has an active promotion',
    };
  }

  // Get product and vendor details for notification
  const {data: productDetails} = await supabase
    .from('vendor_gifts')
    .select('name')
    .eq('id', data.product_id)
    .single();

  const {data: vendorDetails} = await supabase
    .from('profiles')
    .select('shop_name, display_name')
    .eq('id', user.id)
    .single();

  const {data: promotion, error} = await supabase
    .from('promotions')
    .insert({
      vendor_id: user.id,
      product_id: data.product_id,
      placement: data.placement,
      duration_days: data.duration_days,
      amount_paid: data.amount_paid,
      payment_reference: data.payment_reference,
      status: 'pending_approval',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating promotion:', error);
    return {success: false, error: error.message};
  }

  // Send global notification to all admins about new promotion request
  const productName = productDetails?.name || 'a product';
  const vendorName = vendorDetails?.shop_name || vendorDetails?.display_name || 'A vendor';
  const placementLabel = data.placement.replace('_', ' ');

  const {createAdminNotification} = await import('./notifications');
  await createAdminNotification({
    type: 'system',
    title: 'New Promotion Request',
    message: `${vendorName} has submitted a promotion request for "${productName}" in the ${placementLabel} section for ${data.duration_days} days (NGN ${data.amount_paid.toLocaleString()}). Please review and approve or reject.`,
    data: {
      promotion_id: promotion.id,
      product_name: productName,
      vendor_name: vendorName,
      placement: data.placement,
      duration_days: data.duration_days,
      amount_paid: data.amount_paid,
    },
  });

  revalidatePath('/v2/vendor/dashboard');
  revalidatePath('/v2/admin');

  return {success: true, data: promotion};
}

// Pause a promotion (vendor)
export async function pausePromotion(promotionId: number) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  const {data: promotion, error: fetchError} = await supabase
    .from('promotions')
    .select('*')
    .eq('id', promotionId)
    .eq('vendor_id', user.id)
    .single();

  if (fetchError || !promotion) {
    return {success: false, error: 'Promotion not found'};
  }

  if (promotion.status !== 'active') {
    return {success: false, error: 'Only active promotions can be paused'};
  }

  const {error} = await supabase
    .from('promotions')
    .update({status: 'paused'})
    .eq('id', promotionId);

  if (error) {
    return {success: false, error: error.message};
  }

  revalidatePath('/v2/vendor/dashboard');
  return {success: true};
}

// Resume a paused promotion (vendor)
export async function resumePromotion(promotionId: number) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  const {data: promotion, error: fetchError} = await supabase
    .from('promotions')
    .select('*')
    .eq('id', promotionId)
    .eq('vendor_id', user.id)
    .single();

  if (fetchError || !promotion) {
    return {success: false, error: 'Promotion not found'};
  }

  if (promotion.status !== 'paused') {
    return {success: false, error: 'Only paused promotions can be resumed'};
  }

  // Check if promotion hasn't expired
  if (promotion.end_date && new Date(promotion.end_date) < new Date()) {
    return {success: false, error: 'This promotion has expired'};
  }

  const {error} = await supabase
    .from('promotions')
    .update({status: 'active'})
    .eq('id', promotionId);

  if (error) {
    return {success: false, error: error.message};
  }

  revalidatePath('/v2/vendor/dashboard');
  return {success: true};
}

// Fetch vendor's promotions
export async function fetchVendorPromotions(options?: {status?: PromotionStatus}) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  let query = supabase
    .from('promotions')
    .select(`
      *,
      vendor_gifts(id, name, price, image_url)
    `)
    .eq('vendor_id', user.id)
    .order('created_at', {ascending: false});

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  const {data, error} = await query;

  if (error) {
    console.error('Error fetching promotions:', error);
    return {success: false, error: error.message};
  }

  return {success: true, data: data as Promotion[]};
}

// Fetch all active promoted products (public, for gift shop)
export async function fetchPromotedProducts(placement?: PromotionPlacement) {
  const supabase = await createClient();

  let query = supabase
    .from('promotions')
    .select(`
      *,
      vendor_gifts(
        id, name, slug, price, description, image_url, category, type, status, vendor_id,
        profiles!vendor_gifts_vendor_id_fkey(shop_name, shop_slug, display_name, avatar_url, shop_address)
      )
    `)
    .eq('status', 'active')
    .gte('end_date', new Date().toISOString());

  if (placement) {
    query = query.eq('placement', placement);
  }

  const {data, error} = await query.order('created_at', {ascending: false});

  if (error) {
    console.error('Error fetching promoted products:', error);
    return {success: false, error: error.message};
  }

  return {success: true, data: data as Promotion[]};
}

// Track promotion view (called when product is displayed)
export async function trackPromotionView(promotionId: number) {
  const supabase = await createClient();

  const {error} = await supabase.rpc('increment_promotion_views', {
    promotion_id: promotionId,
  });

  // If RPC doesn't exist, fallback to direct update
  if (error) {
    await supabase
      .from('promotions')
      .update({views: supabase.rpc('views', {}) as any})
      .eq('id', promotionId);
  }

  return {success: true};
}

// Track promotion click (called when user clicks on promoted product)
export async function trackPromotionClick(promotionId: number) {
  const supabase = await createClient();

  const {error} = await supabase.rpc('increment_promotion_clicks', {
    promotion_id: promotionId,
  });

  // If RPC doesn't exist, fallback to direct update
  if (error) {
    const {data: promotion} = await supabase
      .from('promotions')
      .select('clicks')
      .eq('id', promotionId)
      .single();

    if (promotion) {
      await supabase
        .from('promotions')
        .update({clicks: promotion.clicks + 1})
        .eq('id', promotionId);
    }
  }

  return {success: true};
}

// Track conversion (called when a promoted product is purchased)
export async function trackPromotionConversion(productId: number) {
  const supabase = await createClient();

  // Find active promotion for this product
  const {data: promotion} = await supabase
    .from('promotions')
    .select('id, conversions')
    .eq('product_id', productId)
    .eq('status', 'active')
    .single();

  if (!promotion) {
    return {success: true}; // No active promotion, nothing to track
  }

  await supabase
    .from('promotions')
    .update({conversions: promotion.conversions + 1})
    .eq('id', promotion.id);

  return {success: true};
}

// ==========================================
// Admin functions
// ==========================================

// Admin: Approve a promotion
export async function approvePromotion(promotionId: number) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

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

  // Use admin client to bypass RLS
  const {createAdminClient} = await import('../supabase/admin');
  const adminSupabase = createAdminClient();

  const {data: promotion} = await adminSupabase
    .from('promotions')
    .select(`
      *,
      vendor_gifts(name, price),
      profiles:vendor_id(email, display_name, shop_name)
    `)
    .eq('id', promotionId)
    .single();

  if (!promotion) {
    return {success: false, error: 'Promotion not found'};
  }

  if (promotion.status !== 'pending_approval') {
    return {success: false, error: 'Only pending promotions can be approved'};
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + promotion.duration_days);

  const {error} = await adminSupabase
    .from('promotions')
    .update({
      status: 'active',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    })
    .eq('id', promotionId);

  if (error) {
    return {success: false, error: error.message};
  }

  const productName = promotion.vendor_gifts?.name || 'your product';
  const vendorName = promotion.profiles?.shop_name || promotion.profiles?.display_name || 'Vendor';
  const vendorEmail = promotion.profiles?.email;

  // Create in-app notification for the vendor
  const {createNotification} = await import('./notifications');
  await createNotification({
    user_id: promotion.vendor_id,
    type: 'promotion_approved',
    title: 'Promotion Approved!',
    message: `Your promotion for "${productName}" is now live! It will run for ${promotion.duration_days} days until ${endDate.toLocaleDateString()}.`,
    data: {
      promotion_id: promotionId,
      product_name: productName,
      duration_days: promotion.duration_days,
      end_date: endDate.toISOString(),
      placement: promotion.placement,
    },
  });

  // Send approval email to vendor
  if (vendorEmail) {
    try {
      const {sendEmail} = await import('./email');
      await sendEmail({
        to: vendorEmail,
        subject: 'Your Promotion is Now Live! - Gifthance',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">Your Promotion is Live!</h2>
            <p>Hi ${vendorName},</p>
            <p>Great news! Your promotion request for <strong>"${productName}"</strong> has been approved and is now live on Gifthance.</p>
            <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #16a34a;">
              <p style="margin: 0;"><strong>Promotion Details:</strong></p>
              <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                <li>Product: ${productName}</li>
                <li>Placement: ${promotion.placement?.replace('_', ' ')}</li>
                <li>Duration: ${promotion.duration_days} days</li>
                <li>Start Date: ${startDate.toLocaleDateString()}</li>
                <li>End Date: ${endDate.toLocaleDateString()}</li>
              </ul>
            </div>
            <p>Your product will now appear in the <strong>${promotion.placement?.replace('_', ' ')}</strong> section of the Gift Shop, reaching more potential customers.</p>
            <p>You can track views, clicks, and conversions in your Vendor Dashboard under the Promotions tab.</p>
            <p style="color: #666; margin-top: 24px;">Best regards,<br>The Gifthance Team</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the approval if email fails
    }
  }

  revalidatePath('/v2/admin');
  revalidatePath('/v2/vendor/dashboard');
  revalidatePath('/v2/gift-shop');

  return {success: true};
}

// Admin: Reject a promotion
export async function rejectPromotion(promotionId: number, reason: string) {
  if (!reason || reason.trim().length < 10) {
    return {success: false, error: 'Please provide a detailed rejection reason (at least 10 characters)'};
  }

  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

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

  // Use admin client to bypass RLS
  const {createAdminClient} = await import('../supabase/admin');
  const adminSupabase = createAdminClient();

  // Fetch the promotion with vendor and product details
  const {data: promotion} = await adminSupabase
    .from('promotions')
    .select(`
      *,
      vendor_gifts(name),
      profiles:vendor_id(email, display_name, shop_name)
    `)
    .eq('id', promotionId)
    .eq('status', 'pending_approval')
    .single();

  if (!promotion) {
    return {success: false, error: 'Promotion not found or already processed'};
  }

  // Update promotion status
  const {error} = await adminSupabase
    .from('promotions')
    .update({
      status: 'rejected',
      rejection_reason: reason,
    })
    .eq('id', promotionId);

  if (error) {
    return {success: false, error: error.message};
  }

  // Create in-app notification for the vendor
  const {createNotification} = await import('./notifications');
  await createNotification({
    user_id: promotion.vendor_id,
    type: 'promotion_rejected',
    title: 'Promotion Request Rejected',
    message: `Your promotion request for "${promotion.vendor_gifts?.name || 'your product'}" has been rejected. Reason: ${reason}. A refund will be processed within 3-5 business days.`,
    data: {
      promotion_id: promotionId,
      product_name: promotion.vendor_gifts?.name,
      amount_paid: promotion.amount_paid,
      reason: reason,
    },
  });

  // Send rejection email to vendor
  const vendorEmail = promotion.profiles?.email;
  const vendorName = promotion.profiles?.shop_name || promotion.profiles?.display_name || 'Vendor';
  const productName = promotion.vendor_gifts?.name || 'your product';

  if (vendorEmail) {
    try {
      const {sendEmail} = await import('./email');
      await sendEmail({
        to: vendorEmail,
        subject: 'Promotion Request Rejected - Gifthance',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Promotion Request Rejected</h2>
            <p>Hi ${vendorName},</p>
            <p>Unfortunately, your promotion request for <strong>"${productName}"</strong> has been rejected.</p>
            <div style="background: #f8f8f8; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0; color: #666;"><strong>Reason:</strong></p>
              <p style="margin: 8px 0 0 0; color: #333;">${reason}</p>
            </div>
            <p><strong>Refund Information:</strong></p>
            <p>The amount of <strong>NGN ${promotion.amount_paid?.toLocaleString()}</strong> will be refunded to your original payment method within 3-5 business days.</p>
            <p>If you have any questions, please contact our support team.</p>
            <p style="color: #666; margin-top: 24px;">Best regards,<br>The Gifthance Team</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
      // Don't fail the rejection if email fails
    }
  }

  // Initiate refund via Paystack (if payment reference exists)
  if (promotion.payment_reference) {
    try {
      await initiatePaystackRefund(promotion.payment_reference, promotion.amount_paid);
    } catch (refundError) {
      console.error('Failed to initiate refund:', refundError);
      // Log for manual processing - don't fail the rejection
    }
  }

  revalidatePath('/v2/admin');
  revalidatePath('/v2/vendor/dashboard');

  return {success: true};
}

// Helper: Initiate Paystack refund
async function initiatePaystackRefund(reference: string, amount: number) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    console.warn('PAYSTACK_SECRET_KEY not configured, skipping refund');
    return;
  }

  // First, fetch the transaction to get the transaction ID
  const txResponse = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    }
  );

  const txData = await txResponse.json();
  if (!txData.status || !txData.data?.id) {
    throw new Error('Could not verify transaction for refund');
  }

  // Create refund
  const refundResponse = await fetch('https://api.paystack.co/refund', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transaction: txData.data.id,
      amount: Math.round(amount * 100), // Convert to kobo
    }),
  });

  const refundData = await refundResponse.json();
  if (!refundData.status) {
    throw new Error(refundData.message || 'Refund failed');
  }

  console.log('Refund initiated:', refundData);
  return refundData;
}

// Admin: Fetch all promotions (for management)
export async function fetchAllPromotions(options?: {status?: PromotionStatus}) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

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

  // Use admin client to bypass RLS and see all promotions
  const {createAdminClient} = await import('../supabase/admin');
  const adminSupabase = createAdminClient();

  let query = adminSupabase
    .from('promotions')
    .select(`
      *,
      vendor_gifts(id, name, price, image_url),
      profiles:vendor_id(shop_name, display_name)
    `)
    .order('created_at', {ascending: false});

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  const {data, error} = await query;

  if (error) {
    console.error('Error fetching all promotions:', error);
    return {success: false, error: error.message};
  }

  return {success: true, data: data as Promotion[]};
}

// ==========================================
// External Promotions (Admin-managed)
// ==========================================

export interface ExternalPromotion {
  id: number;
  admin_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  redirect_url: string;
  placement: PromotionPlacement;
  start_date: string | null;
  end_date: string | null;
  status: 'active' | 'paused' | 'completed';
  views: number;
  clicks: number;
  created_at: string;
}

// Admin: Create external promotion
export async function createExternalPromotion(data: {
  title: string;
  description?: string;
  image_url?: string;
  price?: number;
  redirect_url: string;
  placement: PromotionPlacement;
  start_date?: string;
  end_date?: string;
}) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

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

  const {data: promotion, error} = await supabase
    .from('external_promotions')
    .insert({
      admin_id: user.id,
      ...data,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating external promotion:', error);
    return {success: false, error: error.message};
  }

  revalidatePath('/v2/admin');
  revalidatePath('/v2/gift-shop');

  return {success: true, data: promotion};
}

// Fetch active external promotions (public)
export async function fetchExternalPromotions(placement?: PromotionPlacement) {
  const supabase = await createClient();

  let query = supabase
    .from('external_promotions')
    .select('*')
    .eq('status', 'active');

  if (placement) {
    query = query.eq('placement', placement);
  }

  const {data, error} = await query.order('created_at', {ascending: false});

  if (error) {
    console.error('Error fetching external promotions:', error);
    return {success: false, error: error.message};
  }

  return {success: true, data: data as ExternalPromotion[]};
}

// Track external promotion click
export async function trackExternalPromotionClick(promotionId: number) {
  const supabase = await createClient();

  const {data: promotion} = await supabase
    .from('external_promotions')
    .select('clicks')
    .eq('id', promotionId)
    .single();

  if (promotion) {
    await supabase
      .from('external_promotions')
      .update({clicks: promotion.clicks + 1})
      .eq('id', promotionId);
  }

  return {success: true};
}

// Admin: Fetch all external promotions (including inactive)
export async function fetchAllExternalPromotions() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

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

  const {data, error} = await supabase
    .from('external_promotions')
    .select('*')
    .order('created_at', {ascending: false});

  if (error) {
    console.error('Error fetching all external promotions:', error);
    return {success: false, error: error.message};
  }

  return {success: true, data: data as ExternalPromotion[]};
}

// Admin: Update external promotion
export async function updateExternalPromotion(
  promotionId: number,
  data: Partial<{
    title: string;
    description: string;
    image_url: string;
    price: number;
    redirect_url: string;
    placement: PromotionPlacement;
    start_date: string;
    end_date: string;
    status: 'active' | 'paused' | 'completed';
  }>
) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

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
    .from('external_promotions')
    .update(data)
    .eq('id', promotionId);

  if (error) {
    console.error('Error updating external promotion:', error);
    return {success: false, error: error.message};
  }

  revalidatePath('/v2/admin');
  revalidatePath('/v2/gift-shop');

  return {success: true};
}

// Admin: Delete external promotion
export async function deleteExternalPromotion(promotionId: number) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

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
    .from('external_promotions')
    .delete()
    .eq('id', promotionId);

  if (error) {
    console.error('Error deleting external promotion:', error);
    return {success: false, error: error.message};
  }

  revalidatePath('/v2/admin');
  revalidatePath('/v2/gift-shop');

  return {success: true};
}

// ==========================================
// Promotion Image Storage
// ==========================================

/**
 * Upload promotion image to the promotions storage bucket.
 * Images are stored in folders by user ID for RLS policies.
 */
export async function uploadPromotionImage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return {success: false, error: 'Not authenticated'};

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
  const fileName = `promotion-${Date.now()}.${fileExt}`;
  // Store in user folder for RLS policies
  const filePath = `${user.id}/${fileName}`;

  const {error} = await supabase.storage
    .from('promotions')
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading promotion image:', error);
    return {success: false, error: error.message};
  }

  const {
    data: {publicUrl},
  } = supabase.storage.from('promotions').getPublicUrl(filePath);

  return {success: true, url: publicUrl};
}

/**
 * Delete a promotion image from storage.
 */
export async function deletePromotionImage(url: string) {
  if (!url) return {success: false, error: 'No URL provided'};

  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return {success: false, error: 'Not authenticated'};

  // Extract file path from URL
  const bucketName = 'promotions';
  const parts = url.split(`${bucketName}/`);
  if (parts.length < 2) {
    return {success: false, error: 'Invalid storage URL'};
  }

  const filePath = parts[1];

  // Check if user owns this file (file path should start with their user ID)
  // Admins can delete any file
  const {data: profile} = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.roles?.includes('admin');
  const ownsFile = filePath.startsWith(user.id);

  if (!isAdmin && !ownsFile) {
    return {success: false, error: 'Unauthorized to delete this image'};
  }

  const {error} = await supabase.storage.from(bucketName).remove([filePath]);

  if (error) {
    console.error('Error deleting promotion image:', error);
    return {success: false, error: error.message};
  }

  return {success: true};
}

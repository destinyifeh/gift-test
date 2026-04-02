'use server';

import {revalidatePath} from 'next/cache';
import {createAdminClient} from '../supabase/admin';
import {createClient} from '../supabase/server';

/**
 * Fetch products for a specific vendor or all products (for the gift shop).
 */
export async function fetchVendorProducts(
  vendorId?: string,
  includeDrafts = false,
) {
  const supabase = await createClient();
  let query = supabase
    .from('vendor_gifts')
    .select(
      '*, profiles!vendor_gifts_vendor_id_fkey(display_name, country, shop_slug, shop_name, shop_logo_url)',
    );

  if (vendorId) {
    query = query.eq('vendor_id', vendorId);
  }

  if (!includeDrafts) {
    query = query.eq('status', 'active');
  }

  const {data, error} = await query.order('created_at', {ascending: false});
  if (error) {
    console.error('Error fetching vendor products:', error);
    return {success: false, error: error.message};
  }

  if (!data || data.length === 0) {
    return {success: true, data: []};
  }

  // Fetch 'sold' counts from campaigns tracking purchased gifts
  const productIds = data.map((p: any) => p.id);
  const {data: soldCounts} = await supabase
    .from('campaigns')
    .select('claimable_gift_id')
    .in('claimable_gift_id', productIds);

  const soldMap = new Map();
  if (soldCounts) {
    for (const row of soldCounts) {
      if (row.claimable_gift_id) {
        soldMap.set(
          row.claimable_gift_id,
          (soldMap.get(row.claimable_gift_id) || 0) + 1,
        );
      }
    }
  }

  const dataWithSold = data.map((p: any) => ({
    ...p,
    sold: soldMap.get(p.id) || 0,
  }));

  return {success: true, data: dataWithSold};
}

/**
 * Fetch products with pagination for the gift shop.
 * Supports filtering by category and search query.
 */
export async function fetchVendorProductsPaginated(options: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  vendorId?: string;
}) {
  const {
    page = 1,
    limit = 12,
    category,
    search,
    vendorId,
  } = options;

  const supabase = await createClient();
  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from('vendor_gifts')
    .select(
      '*, profiles!vendor_gifts_vendor_id_fkey(display_name, country, shop_slug, shop_name, shop_logo_url)',
      { count: 'exact' }
    )
    .eq('status', 'active');

  if (vendorId) {
    query = query.eq('vendor_id', vendorId);
  }

  if (category && category !== 'All Gifts') {
    query = query.ilike('category', category);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const {data, error, count} = await query
    .order('created_at', {ascending: false})
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching paginated products:', error);
    return {success: false, error: error.message};
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / limit);
  const hasMore = page < totalPages;

  // Fetch 'sold' counts
  if (data && data.length > 0) {
    const productIds = data.map((p: any) => p.id);
    const {data: soldCounts} = await supabase
      .from('campaigns')
      .select('claimable_gift_id')
      .in('claimable_gift_id', productIds);

    const soldMap = new Map();
    if (soldCounts) {
      for (const row of soldCounts) {
        if (row.claimable_gift_id) {
          soldMap.set(
            row.claimable_gift_id,
            (soldMap.get(row.claimable_gift_id) || 0) + 1,
          );
        }
      }
    }

    const dataWithSold = data.map((p: any) => ({
      ...p,
      sold: soldMap.get(p.id) || 0,
    }));

    return {
      success: true,
      data: dataWithSold,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore,
      },
    };
  }

  return {
    success: true,
    data: [],
    pagination: {
      page,
      limit,
      totalCount: 0,
      totalPages: 0,
      hasMore: false,
    },
  };
}

/**
 * Fetch a single vendor product by ID.
 */
export async function fetchVendorProductById(productId: string | number) {
  const supabase = await createClient();
  const {data, error} = await supabase
    .from('vendor_gifts')
    .select(
      '*, profiles!vendor_gifts_vendor_id_fkey(display_name, country, bio)',
    )
    .eq('id', productId)
    .single();

  if (error) {
    console.error('Error fetching product by id:', error);
    return {success: false, error: error.message};
  }

  return {success: true, data};
}

/**
 * Fetch a product by vendor slug and product slug.
 */
export async function fetchVendorProductBySlugs(
  vendorSlug: string,
  productSlug: string,
) {
  const supabase = await createClient();

  // 1. Get vendor ID from slug
  const {data: vendor, error: vError} = await supabase
    .from('profiles')
    .select('id')
    .eq('shop_slug', vendorSlug)
    .single();

  if (vError || !vendor) {
    return {success: false, error: 'Vendor not found'};
  }

  // 2. Get product by vendor_id and (product_slug OR id)
  let productQuery = supabase
    .from('vendor_gifts')
    .select(
      '*, profiles!vendor_gifts_vendor_id_fkey(display_name, country, bio, shop_slug, shop_name, shop_description, shop_address, shop_logo_url)',
    )
    .eq('vendor_id', vendor.id);

  // Try matching by slug first, if that fails, try numeric/uuid id
  const {data, error} = await productQuery
    .eq('slug', productSlug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching product by slug:', error);
    return {success: false, error: error.message};
  }

  if (data) return {success: true, data};

  // If slug failed, try ID
  const {data: idData, error: idError} = await supabase
    .from('vendor_gifts')
    .select(
      '*, profiles!vendor_gifts_vendor_id_fkey(display_name, country, bio, shop_slug, shop_name, shop_description, shop_address, shop_logo_url)',
    )
    .eq('vendor_id', vendor.id)
    .eq('id', productSlug) // Supabase will error if productSlug isn't valid UUID/Int
    .maybeSingle();

  if (idError || !idData) {
    return {success: false, error: 'Product not found'};
  }

  return {success: true, data: idData};
}

/**
 * Create or update a vendor product.
 */
export async function manageVendorProduct(product: any) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return {success: false, error: 'Not authenticated'};

  const payload = {
    ...product,
    vendor_id: user.id,
    slug:
      product.slug ||
      product.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, ''),
    updated_at: new Date().toISOString(),
  };

  let result;
  if (product.id && !String(product.id).includes('new')) {
    result = await supabase
      .from('vendor_gifts')
      .update(payload)
      .eq('id', product.id)
      .eq('vendor_id', user.id);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {id, ...newPayload} = payload;
    result = await supabase.from('vendor_gifts').insert(newPayload);
  }

  if (result.error) {
    console.error('Error managing product:', result.error);
    return {success: false, error: result.error.message};
  }

  revalidatePath('/vendor');
  revalidatePath('/gift-shop');
  return {success: true};
}

/**
 * Delete a vendor product.
 */
export async function deleteVendorProduct(productId: number) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return {success: false, error: 'Not authenticated'};

  // 1. Fetch product to get image_url for cleanup
  const {data: product} = await supabase
    .from('vendor_gifts')
    .select('image_url')
    .eq('id', productId)
    .eq('vendor_id', user.id)
    .single();

  if (product?.image_url) {
    await deleteVendorProductImage(product.image_url);
  }

  // 2. Delete product record
  const {error} = await supabase
    .from('vendor_gifts')
    .delete()
    .eq('id', productId)
    .eq('vendor_id', user.id);

  if (error) {
    console.error('Error deleting product:', error);
    return {success: false, error: error.message};
  }

  revalidatePath('/vendor');
  revalidatePath('/gift-shop');
  return {success: true};
}

/**
 * Verify a voucher code.
 */
export async function verifyVoucherCode(code: string) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return {success: false, error: 'Not authenticated'};

  // Join with profiles to get buyer info and gifts to verify vendor ownership
  const {data: campaign, error} = await supabase
    .from('campaigns')
    .select('*, profiles!campaigns_user_id_fkey(username, display_name)')
    .eq('gift_code', code.trim())
    .single();

  if (error) {
    if (error.code === 'PGRST116')
      return {success: false, error: 'Invalid or expired code'};
    return {success: false, error: error.message};
  }

  // If it's a gift-card, check if it belongs to this vendor
  // For now, we allow any vendor to check any code if it's not strictly tied
  // but let's assume if claimable_gift_id exists, we check ownership.
  if (campaign.claimable_gift_id) {
    const {data: gift} = await supabase
      .from('vendor_gifts')
      .select('vendor_id, name')
      .eq('id', campaign.claimable_gift_id)
      .single();

    if (gift && gift.vendor_id !== user.id) {
      return {
        success: false,
        error: 'This gift card belongs to another vendor.',
      };
    }
  }

  // CHECK: If the gift has already been redeemed
  if (campaign.status === 'redeemed') {
    return {
      success: true,
      data: campaign,
    };
  }

  // CHECK: If the gift hasn't been claimed yet, it shouldn't be redeemed
  if (
    campaign.status === 'active' ||
    campaign.status === 'pending' ||
    !campaign.user_id ||
    campaign.user_id === campaign.profiles?.id
  ) {
    return {
      success: true,
      data: campaign,
    };
  }

  return {success: true, data: campaign};
}

/**
 * Redeem a voucher code.
 */
export async function redeemVoucherCode(code: string) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return {success: false, error: 'Not authenticated'};

  // 1. Verify it's claimable and already claimed
  const {data: campaign, error: vError} = await supabase
    .from('campaigns')
    .select('status')
    .eq('gift_code', code.trim())
    .single();

  if (vError || !campaign) {
    return {success: false, error: 'Invalid or expired code'};
  }

  if (campaign.status !== 'claimed') {
    return {
      success: false,
      error:
        campaign.status === 'active'
          ? 'This gift card is yet to be claimed by the recipient.'
          : `This gift card cannot be redeemed (Status: ${campaign.status})`,
    };
  }

  const adminSupabase = createAdminClient();
  const {error} = await adminSupabase
    .from('campaigns')
    .update({
      status: 'redeemed',
      redeemed_at: new Date().toISOString(),
      redeemed_by_vendor_id: user.id,
    })
    .eq('gift_code', code.trim());

  if (error) {
    console.error('Error redeeming voucher:', error);
    return {success: false, error: error.message};
  }

  revalidatePath('/vendor');
  return {success: true};
}

/**
 * Fetch vendor specific wallet stats.
 */
export async function fetchVendorWallet() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return {success: false, error: 'Not authenticated'};

  // Total sales: campaigns tied to this vendor's gifts
  // 1. Get vendor products
  const {data: products} = await supabase
    .from('vendor_gifts')
    .select('id')
    .eq('vendor_id', user.id);

  const productIds = (products || []).map(p => p.id);

  // 2. Get redeemed campaigns for these products
  const {data: redeemed} = await supabase
    .from('campaigns')
    .select('goal_amount, current_amount, status, redeemed_at, gift_code')
    .in('claimable_gift_id', productIds)
    .not('redeemed_at', 'is', null);

  const {data: allOrders} = await supabase
    .from('campaigns')
    .select('goal_amount, current_amount, status, created_at, gift_code')
    .in('claimable_gift_id', productIds);

  const totalSales = (allOrders || []).reduce(
    (acc, c) => acc + (Number(c.goal_amount) || 0),
    0,
  );
  const available = (redeemed || []).reduce(
    (acc, c) => acc + (Number(c.goal_amount) || 0),
    0,
  );
  // Pending are those not yet redeemed
  const pending = totalSales - available;

  const productsCount = products?.length || 0;
  const ordersCount = allOrders?.length || 0;

  return {
    success: true,
    data: {
      available,
      pending,
      totalSales,
      productsCount,
      ordersCount,
      transactions: (redeemed || []).map((r, i) => ({
        id: i,
        type: 'redeemed',
        desc: `Redemption: ${r.gift_code || 'GIFT'}`,
        amount: Number(r.goal_amount),
        date: r.redeemed_at?.split('T')[0],
      })),
    },
  };
}

/**
 * Fetch all orders (campaigns) for a vendor's products.
 */
export async function fetchVendorOrders() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return {success: false, error: 'Not authenticated'};

  // 1. Get vendor products
  const {data: products} = await supabase
    .from('vendor_gifts')
    .select('id')
    .eq('vendor_id', user.id);

  const productIds = (products || []).map(p => p.id);

  // 2. Get all campaigns for these products
  const {data: orders, error} = await supabase
    .from('campaigns')
    .select('*, profiles!campaigns_user_id_fkey(username, display_name)')
    .in('claimable_gift_id', productIds)
    .order('created_at', {ascending: false});

  if (error) {
    console.error('Error fetching vendor orders:', error);
    return {success: false, error: error.message};
  }

  return {success: true, data: orders};
}

/**
 * Upload a vendor product image.
 */
export async function uploadVendorProductImage(formData: FormData) {
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
  const fileName = `product-${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const {error} = await supabase.storage
    .from('vendor-products')
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading product image:', error);
    return {success: false, error: error.message};
  }

  const {
    data: {publicUrl},
  } = supabase.storage.from('vendor-products').getPublicUrl(filePath);

  return {success: true, url: publicUrl};
}

/**
 * Delete a vendor product image from storage.
 */
export async function deleteVendorProductImage(url: string) {
  if (!url) return {success: false, error: 'No URL provided'};

  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return {success: false, error: 'Not authenticated'};

  // Extract file path from URL
  // Format: .../vendor-products/product-USER_ID-TIMESTAMP.ext
  const bucketName = 'vendor-products';
  const parts = url.split(`${bucketName}/`);
  if (parts.length < 2) {
    return {success: false, error: 'Invalid storage URL'};
  }

  const filePath = parts[1];

  const {error} = await supabase.storage.from(bucketName).remove([filePath]);

  if (error) {
    console.error('Error deleting product image:', error);
    return {success: false, error: error.message};
  }

  return {success: true};
}

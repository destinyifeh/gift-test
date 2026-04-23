import api from '@/lib/api-client';
import {useInfiniteQuery, useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

// Helper to map backend camelCase to frontend snake_case where needed
const mapProduct = (p: any) => ({
  ...p,
  image_url: p.imageUrl,
  vendor_id: p.vendorId,
  created_at: p.createdAt,
  updated_at: p.updatedAt,
  stock_quantity: p.stockQuantity,
  units_sold: p.unitsSold,
  vendor: p.vendor ? {
    ...p.vendor,
    display_name: p.vendor.displayName,
    shop_slug: p.vendor.shopSlug,
    shop_name: p.vendor.shopName,
    shop_logo_url: p.vendor.shopLogoUrl,
  } : undefined,
  // Add profiles as alias for vendor for legacy component support
  profiles: p.vendor ? {
    ...p.vendor,
    display_name: p.vendor.displayName,
    shop_slug: p.vendor.shopSlug,
    shop_name: p.vendor.shopName,
    shop_logo_url: p.vendor.shopLogoUrl,
  } : undefined
});

export function useVendorProducts(vendorId?: string, includeDrafts = false) {
  return useQuery({
    queryKey: ['vendor-products', vendorId || 'all', includeDrafts],
    queryFn: async () => {
      const endpoint = includeDrafts
        ? '/vendor/my-products'
        : vendorId
        ? `/vendor/products?vendorId=${vendorId}`
        : '/vendor/products';
      const res = await api.get(endpoint);
      const data = res.data.data || res.data;
      return Array.isArray(data) ? data.map(mapProduct) : [];
    },
  });
}

/**
 * Infinite scroll hook for vendor products (gift shop).
 * Supports category filtering and search.
 */
export function useInfiniteVendorProducts(options: {
  category?: string;
  search?: string;
  vendorId?: string;
  limit?: number;
}) {
  const {category, search, vendorId, limit = 12} = options;

  return useInfiniteQuery({
    queryKey: ['vendor-products-infinite', category, search, vendorId, limit],
    initialPageParam: 1,
    queryFn: async ({pageParam = 1}) => {
      const params = new URLSearchParams();
      params.append('page', String(pageParam));
      params.append('limit', String(limit));
      if (category && category !== 'All Gifts') params.append('category', category);
      if (search) params.append('search', search);
      if (vendorId) params.append('vendorId', vendorId);

      const res = await api.get(`/vendor/products/paginated?${params.toString()}`);
      const result = res.data;
      
      return {
        ...result,
        data: result.data.map(mapProduct)
      };
    },
    getNextPageParam: lastPage => {
      if (lastPage.pagination?.hasMore) {
        return (lastPage.pagination?.page || 1) + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useVendorProduct(productId: string | number, recordView = false) {
  return useQuery({
    queryKey: ['vendor-product', productId, recordView],
    queryFn: async () => {
      const res = await api.get(`/vendor/products/${productId}${recordView ? '?recordView=true' : ''}`);
      return mapProduct(res.data.data || res.data);
    },
    enabled: !!productId,
  });
}

export function useVendorProductBySlugs(
  vendorSlug: string,
  productSlug: string,
  recordView = false,
) {
  return useQuery({
    queryKey: ['vendor-product', vendorSlug, productSlug, recordView],
    queryFn: async () => {
      const res = await api.get(`/vendor/shop/${vendorSlug}/${productSlug}${recordView ? '?recordView=true' : ''}`);
      return mapProduct(res.data.data || res.data);
    },
    enabled: !!vendorSlug && !!productSlug,
  });
}

export function useVendorOrders() {
  return useQuery({
    queryKey: ['vendor-orders'],
    queryFn: async () => {
      const res = await api.get('/vendor/orders');
      return res.data.data || res.data;
    },
  });
}

export function useVendorWallet() {
  return useQuery({
    queryKey: ['vendor-wallet'],
    queryFn: async () => {
      const res = await api.get('/vendor/wallet');
      return res.data.data || res.data;
    },
  });
}

export function useVendorRatingStats(vendorId: string | undefined) {
  return useQuery({
    queryKey: ['vendor-rating', vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      const res = await api.get(`/ratings/vendor/${vendorId}`);
      return res.data.data || res.data;
    },
    enabled: !!vendorId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Mutation to create or update a vendor product
 */
export function useManageVendorProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/vendor/products', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
    },
  });
}

/**
 * Mutation to delete a vendor product
 */
export function useDeleteVendorProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: number) => {
      const res = await api.delete(`/vendor/products/${productId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
    },
  });
}

/**
 * Mutation to upload a product image
 */
export function useUploadProductImage() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/files/upload?folder=products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
  });
}

/**
 * Mutation to delete a product image
 */
export function useDeleteProductImage() {
  return useMutation({
    mutationFn: async (url: string) => {
      const res = await api.post('/files/delete', { url });
      return res.data;
    },
  });
}

/**
 * Mutation to record product click
 */
export function useRecordClick() {
  return useMutation({
    mutationFn: async (productId: number | string) => {
      const res = await api.post(`/vendor/products/${productId}/click`);
      return res.data;
    },
  });
}

/**
 * Mutation to record product view
 */
export function useRecordView() {
  return useMutation({
    mutationFn: async (productId: number | string) => {
      const res = await api.post(`/vendor/products/${productId}/view`);
      return res.data;
    },
  });
}

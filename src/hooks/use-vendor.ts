import {getVendorRatingStats} from '@/lib/server/actions/ratings';
import {
  fetchVendorOrders,
  fetchVendorProductById,
  fetchVendorProductBySlugs,
  fetchVendorProducts,
  fetchVendorProductsPaginated,
  fetchVendorWallet,
} from '@/lib/server/actions/vendor';
import {useInfiniteQuery, useQuery} from '@tanstack/react-query';

export function useVendorProducts(vendorId?: string, includeDrafts = false) {
  return useQuery({
    queryKey: ['vendor-products', vendorId || 'all', includeDrafts],
    queryFn: async () => {
      const result = await fetchVendorProducts(vendorId, includeDrafts);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
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
      const result = await fetchVendorProductsPaginated({
        page: pageParam,
        limit,
        category: category !== 'All Gifts' ? category : undefined,
        search: search || undefined,
        vendorId,
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
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

export function useVendorProduct(productId: string | number) {
  return useQuery({
    queryKey: ['vendor-product', productId],
    queryFn: async () => {
      const result = await fetchVendorProductById(productId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!productId,
  });
}

export function useVendorProductBySlugs(
  vendorSlug: string,
  productSlug: string,
) {
  return useQuery({
    queryKey: ['vendor-product', vendorSlug, productSlug],
    queryFn: async () => {
      const result = await fetchVendorProductBySlugs(vendorSlug, productSlug);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!vendorSlug && !!productSlug,
  });
}

export function useVendorOrders() {
  return useQuery({
    queryKey: ['vendor-orders'],
    queryFn: async () => {
      const result = await fetchVendorOrders();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

export function useVendorWallet() {
  return useQuery({
    queryKey: ['vendor-wallet'],
    queryFn: async () => {
      const result = await fetchVendorWallet();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

export function useVendorRatingStats(vendorId: string | undefined) {
  return useQuery({
    queryKey: ['vendor-rating', vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      return await getVendorRatingStats(vendorId);
    },
    enabled: !!vendorId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

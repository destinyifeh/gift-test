import {
  fetchVendorOrders,
  fetchVendorProductById,
  fetchVendorProductBySlugs,
  fetchVendorProducts,
  fetchVendorWallet,
} from '@/lib/server/actions/vendor';
import {useQuery} from '@tanstack/react-query';

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

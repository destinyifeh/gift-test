import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import api from '@/lib/api-client';

export interface ProductTag {
  id: number;
  name: string;
  slug: string;
  subcategoryId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSubcategory {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  tags?: ProductTag[];
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  subcategories?: ProductSubcategory[];
}

export const useCatalogHierarchy = () => {
  return useQuery({
    queryKey: ['catalog', 'hierarchy'],
    queryFn: async () => {
      const response = await api.get('/catalog/hierarchy');
      return response.data as ProductCategory[];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['catalog', 'categories'],
    queryFn: async () => {
      const response = await api.get('/catalog/categories');
      return response.data as ProductCategory[];
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
};

export const useSubcategories = (categoryId?: number) => {
  return useQuery({
    queryKey: ['catalog', 'subcategories', categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      const response = await api.get(`/catalog/categories/${categoryId}/subcategories`);
      return response.data as ProductSubcategory[];
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 60 * 24,
  });
};

export const useTags = (subcategoryId?: number) => {
  return useQuery({
    queryKey: ['catalog', 'tags', subcategoryId],
    queryFn: async () => {
      if (!subcategoryId) return [];
      const response = await api.get(`/catalog/subcategories/${subcategoryId}/tags`);
      return response.data as ProductTag[];
    },
    enabled: !!subcategoryId,
    staleTime: 1000 * 60 * 60 * 24,
  });
};

export const useRequestTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { subcategoryId: number; requestedName: string; reason?: string }) => {
      const response = await api.post('/catalog/requests', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate tag requests lists if any
      queryClient.invalidateQueries({ queryKey: ['catalog', 'requests'] });
    },
  });
};

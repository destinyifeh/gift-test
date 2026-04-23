'use server';

import api from '@/lib/api-client';

export async function fetchAllProducts(page: number = 1, limit: number = 50, vendorId?: string) {
  try {
    const url = `/products?page=${page}&limit=${limit}${vendorId ? `&vendorId=${vendorId}` : ''}`;
    const res = await api.get(url);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to fetch products' 
    };
  }
}


export async function fetchVendorProductById(id: number) {
  try {
    const res = await api.get(`/products/${id}`);
    return res.data;
  } catch (error: any) {
    console.error(`Error fetching vendor product ${id}:`, error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to fetch product' 
    };
  }
}
export async function recordProductClick(productId: number | string) {
  try {
    const res = await api.post(`/vendor/products/${productId}/click`);
    return res.data;
  } catch (error: any) {
    console.error('Error recording click:', error);
    return { success: false };
  }
}

export async function recordProductView(productId: number | string) {
  try {
    const res = await api.post(`/vendor/products/${productId}/view`);
    return res.data;
  } catch (error: any) {
    console.error('Error recording view:', error);
    return { success: false };
  }
}

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

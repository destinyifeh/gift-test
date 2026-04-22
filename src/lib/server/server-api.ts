import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function serverFetch(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(allCookies ? { cookie: allCookies } : {}),
    ...Object.fromEntries(Object.entries(options.headers || {}).filter(([k]) => k !== 'Content-Type')),
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = res.statusText;
    try {
      const errorData = await res.json();
      console.log('[serverFetch] Error data:', errorData);
      if (Array.isArray(errorData.message)) {
        errorMsg = errorData.message.join(', ');
      } else {
        errorMsg = errorData.message || errorData.error || errorMsg;
      }
    } catch (e) {
      // Ignore JSON parse error
    }
    throw new Error(errorMsg);
  }

  const data = await res.json();

  // Handle global response envelope { success: true, data: T }
  if (data && typeof data === 'object' && 'success' in data && 'data' in data && Object.keys(data).length === 2) {
    return data.data;
  }

  return data;
}

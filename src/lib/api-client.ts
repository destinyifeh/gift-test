import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true, // Important for Better Auth cookies
});

// Optional: Add request interceptors for logging or extra headers
api.interceptors.request.use((config) => {
  return config;
});

// Global response interceptor: unwraps the { success: true, data: T } envelope
api.interceptors.response.use((response) => {
  // If the response body has the standard success/data envelope, unwrap it
  if (
    response.data &&
    typeof response.data === 'object' &&
    'success' in response.data &&
    'data' in response.data &&
    Object.keys(response.data).length === 2
  ) {
    return {
      ...response,
      data: response.data.data,
    };
  }
  return response;
});

export default api;

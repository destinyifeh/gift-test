'use server';

import {revalidatePath} from 'next/cache';
import { serverFetch } from '../server-api';

export async function login(formData: FormData) {
  // Login is primarily handled on the client side via authClient.signIn.email
  // This server action is kept for compatibility or forced server-side login
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const data = await serverFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    revalidatePath('/', 'layout');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function signup(formData: FormData) {
  // Signup is primarily handled on the client side via authClient.signUp.email
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;
  const displayName = formData.get('display_name') as string;
  const country = formData.get('country') as string;

  try {
    const data = await serverFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        username,
        displayName,
        country,
      }),
    });
    revalidatePath('/', 'layout');
    return { success: true, message: 'Please check your email to verify your account.' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function signOut() {
  try {
    await serverFetch('/api/auth/sign-out', { method: 'POST' });
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    // If backend signout fails, we should still revalidate and return success true
    // as the client will clear its own session.
    revalidatePath('/', 'layout');
    return { success: true };
  }
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get('email') as string;

  try {
    await serverFetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return { success: true, message: 'Password reset link sent to your email.' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string;

  try {
    await serverFetch('/api/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify({ newPassword: password }),
    });
    return { success: true, message: 'Password updated successfully.' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCreatorStatus(enabled: boolean) {
  try {
    await serverFetch('/users/creator-status', {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProfile(updates: {
  display_name?: string;
  username?: string;
  bio?: string;
  suggested_amounts?: number[];
  social_links?: any;
  theme_settings?: any;
  avatar_url?: string;
  is_creator?: boolean;
  country?: string;
  shop_name?: string;
  shop_description?: string;
  shop_address?: string;
  shop_slug?: string;
  shop_logo_url?: string;
}) {
  try {
    // Map snake_case to camelCase for backend
    const payload: any = {};
    if (updates.display_name !== undefined) payload.displayName = updates.display_name;
    if (updates.username !== undefined) payload.username = updates.username.toLowerCase();
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.suggested_amounts !== undefined) payload.suggestedAmounts = updates.suggested_amounts;
    if (updates.social_links !== undefined) payload.socialLinks = updates.social_links;
    if (updates.theme_settings !== undefined) payload.themeSettings = updates.theme_settings;
    if (updates.avatar_url !== undefined) payload.avatarUrl = updates.avatar_url;
    if (updates.is_creator !== undefined) payload.isCreator = updates.is_creator;
    if (updates.country !== undefined) payload.country = updates.country;
    if (updates.shop_name !== undefined) payload.shopName = updates.shop_name;
    if (updates.shop_description !== undefined) payload.shopDescription = updates.shop_description;
    if (updates.shop_address !== undefined) payload.shopAddress = updates.shop_address;
    if (updates.shop_slug !== undefined) payload.shopSlug = updates.shop_slug.toLowerCase();
    if (updates.shop_logo_url !== undefined) payload.shopLogoUrl = updates.shop_logo_url;

    const data = await serverFetch('/users', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    revalidatePath('/dashboard');
    if (updates.username) {
      revalidatePath(`/u/${updates.username.toLowerCase()}`);
    } else if (data?.username) {
       revalidatePath(`/u/${data.username}`);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function uploadBannerImage(formData: FormData) {
  try {
    // Forward the formData to the backend file upload endpoint
    const res = await serverFetch('/files/upload?folder=campaign-images', {
      method: 'POST',
      // When sending FormData, we should NOT set Content-Type header manually
      // but serverFetch currently sets it to application/json. 
      // I'll need a way to override it.
      body: formData,
      headers: {
        'Content-Type': 'omit', // Special flag or just handle it in serverFetch
      } as any
    });
    
    // If we're updating a banner, call the banner update endpoint
    if (res.url) {
      await updateProfile({ shop_logo_url: res.url }); // Assuming this is for shop banner/logo
    }

    return { success: true, url: res.url };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function uploadAvatar(formData: FormData) {
  try {
    const res = await serverFetch('/files/upload?folder=avatars', {
      method: 'POST',
      body: formData,
    });
    
    return { success: true, url: res.url };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUploadedFile(url: string) {
  try {
    await serverFetch('/files/delete', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

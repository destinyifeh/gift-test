'use server';

import {revalidatePath} from 'next/cache';
import {createClient} from '../supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const {data, error} = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {success: false, error: error.message};
  }

  revalidatePath('/', 'layout');
  return {success: true, data};
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;
  const display_name = formData.get('display_name') as string;
  const country = formData.get('country') as string;

  // 1. Check if username is already taken
  const {data: existingProfile} = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (existingProfile) {
    return {success: false, error: 'Username is already taken'};
  }

  // Check if email already exists
  const {data: existingEmail} = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingEmail) {
    return {success: false, error: 'Email already registered'};
  }

  const {error} = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name,
        country,
      },
    },
  });

  if (error) {
    return {success: false, error: error.message};
  }
  revalidatePath('/', 'layout');
  return {
    success: true,
    message: 'Please check your email to verify your account.',
  };
}

export async function signOut() {
  const supabase = await createClient();
  const {error} = await supabase.auth.signOut();

  if (error) {
    return {success: false, error: error.message};
  }

  revalidatePath('/', 'layout');
  return {success: true};
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;

  const {error} = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return {success: false, error: error.message};
  }

  return {success: true, message: 'Password reset link sent to your email.'};
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get('password') as string;

  const {error} = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return {success: false, error: error.message};
  }

  // Sign out after password update so the user can log in with new credentials
  // and the middleware doesn't immediately redirect them to /dashboard
  await supabase.auth.signOut();

  return {success: true, message: 'Password updated successfully.'};
}

export async function updateCreatorStatus(enabled: boolean) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  const {error} = await supabase
    .from('profiles')
    .update({is_creator: enabled})
    .eq('id', user.id);

  if (error) {
    return {success: false, error: error.message};
  }

  revalidatePath('/dashboard');
  return {success: true};
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
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  // If username is being updated, check if it's already taken
  if (updates.username) {
    const {data: existingProfile} = await supabase
      .from('profiles')
      .select('id')
      .eq('username', updates.username.toLowerCase())
      .neq('id', user.id)
      .maybeSingle();

    if (existingProfile) {
      return {success: false, error: 'Username is already taken'};
    }
    updates.username = updates.username.toLowerCase();
  }

  // If shop_slug is being updated, check if it's already taken
  if (updates.shop_slug) {
    const {data: existingShop} = await supabase
      .from('profiles')
      .select('id')
      .eq('shop_slug', updates.shop_slug.toLowerCase())
      .neq('id', user.id)
      .maybeSingle();

    if (existingShop) {
      return {success: false, error: 'Shop URL identifier is already taken'};
    }
    updates.shop_slug = updates.shop_slug.toLowerCase();
  }

  // PROTECT THE PLAN FIELD: Ensure theme_settings doesn't overwrite the user's plan
  if (updates.theme_settings) {
    const {data: currentProfile} = await supabase
      .from('profiles')
      .select('theme_settings')
      .eq('id', user.id)
      .single();

    const existingTheme = currentProfile?.theme_settings || {};
    const existingPlan = existingTheme.plan || 'free';

    // If the plan is being forced to 'pro', ensure is_creator is also true
    if (existingPlan === 'pro') {
      updates.is_creator = true;
    }

    // Merge new settings but ABSOLUTELY prevent plan downgrade in theme_settings
    updates.theme_settings = {
      ...updates.theme_settings,
      plan: existingPlan,
    };
  }

  const {error} = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    return {success: false, error: error.message};
  }

  // Fetch current username for revalidation if it wasn't updated
  let currentUsername = updates.username;
  if (!currentUsername) {
    const {data: profile} = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();
    currentUsername = profile?.username;
  }

  revalidatePath('/dashboard');
  revalidatePath('/v2/dashboard');
  if (currentUsername) {
    revalidatePath(`/u/${currentUsername}`);
    revalidatePath(`/v2/u/${currentUsername}`);
  }

  return {success: true};
}

export async function uploadBannerImage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  const file = formData.get('file') as File;
  if (!file) {
    return {success: false, error: 'No file provided'};
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `banner-${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const {error} = await supabase.storage
    .from('campaign-images')
    .upload(filePath, file);

  if (error) {
    return {success: false, error: error.message};
  }

  const {
    data: {publicUrl},
  } = supabase.storage.from('campaign-images').getPublicUrl(filePath);

  return {success: true, url: publicUrl};
}

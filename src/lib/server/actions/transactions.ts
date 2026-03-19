'use server';

import {revalidatePath} from 'next/cache';
import {createClient} from '../supabase/server';

export async function verifyPaymentAndUpgrade(reference: string) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  // 1. Verify payment with Paystack
  const secretKey = process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY;
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      },
    );

    const body = await response.json();
    if (!body.status || body.data.status !== 'success') {
      return {success: false, error: 'Payment verification failed'};
    }

    // 2. Update user plan
    const {data: profile} = await supabase
      .from('profiles')
      .select('theme_settings, username')
      .eq('id', user.id)
      .single();

    const theme_settings = profile?.theme_settings || {};

    const {error} = await supabase
      .from('profiles')
      .update({
        is_creator: true,
        theme_settings: {
          ...theme_settings,
          plan: 'pro',
        },
      })
      .eq('id', user.id);

    if (error) {
      return {success: false, error: error.message};
    }

    revalidatePath('/dashboard');
    if (profile?.username) {
      revalidatePath(`/u/${profile.username}`);
    }

    return {success: true};
  } catch (err: any) {
    return {success: false, error: err.message || 'Verification error'};
  }
}

export async function resetPlan() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  const {data: profile} = await supabase
    .from('profiles')
    .select('theme_settings')
    .eq('id', user.id)
    .single();

  const theme_settings = profile?.theme_settings || {};

  const {error} = await supabase
    .from('profiles')
    .update({
      theme_settings: {
        ...theme_settings,
        plan: 'free',
      },
    })
    .eq('id', user.id);

  if (error) {
    return {success: false, error: error.message};
  }

  revalidatePath('/dashboard');
  return {success: true};
}

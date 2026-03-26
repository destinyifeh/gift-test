import {createClient as createSupabaseClient} from '@supabase/supabase-js';

/**
 * Creates a Supabase client using the service_role key.
 * This client BYPASSES Row Level Security and should ONLY
 * be used inside Server Actions that have already verified
 * the caller is an admin via checkIsAdmin().
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY!;

  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Please add it to your environment variables.',
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {persistSession: false},
  });
}

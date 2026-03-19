import {createClient} from '@/lib/server/supabase/server';
import {type EmailOtpType} from '@supabase/supabase-js';
import {type NextRequest, NextResponse} from 'next/server';

export async function GET(request: NextRequest) {
  const {searchParams, origin} = new URL(request.url);

  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/dashboard';

  // Create base redirect URL
  const redirectTo = new URL(next, origin);
  if (token_hash && type) {
    const supabase = await createClient();
    const {error} = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      if (type === 'recovery') {
        redirectTo.pathname = '/reset-password';
      }
      return NextResponse.redirect(redirectTo);
    }
  }

  // If there's an error or no valid code/token, redirect to error page
  const errorRedirect = new URL('/auth/auth-code-error', origin);
  return NextResponse.redirect(errorRedirect);
}

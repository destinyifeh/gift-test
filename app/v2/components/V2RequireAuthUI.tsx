'use client';

import {useProfile} from '@/hooks/use-profile';
import {useUserStore} from '@/lib/store/useUserStore';
import Link from 'next/link';
import {ReactNode} from 'react';

export interface V2RequireAuthUIProps {
  children: ReactNode;
  /** Title for the locked card */
  title?: string;
  /** Description for the locked card */
  description?: string;
  /** Custom UI element to render above the card (like a Navbar) */
  header?: ReactNode;
  /** Redirect path for the login/signup buttons */
  redirectPath?: string;
}

/**
 * V2 styled guard that requires the user to be authenticated.
 * Shows a beautifully styled Login/Signup card in the v2 design system.
 */
export function V2RequireAuthUI({
  children,
  title = 'Authentication Required',
  description = 'You must be logged in to view this page.',
  header,
  redirectPath,
}: V2RequireAuthUIProps) {
  const user = useUserStore(state => state.user);
  const {isLoading} = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex flex-col items-center justify-center p-6">
        {header}
        <div className="flex-1 flex items-center justify-center">
          <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
            progress_activity
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex flex-col items-center p-6">
        {header}
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="w-full max-w-md bg-[var(--v2-surface-container-lowest)] shadow-[0_20px_60px_rgba(73,38,4,0.08)] rounded-[2rem] p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-[var(--v2-primary)]/10 rounded-2xl flex items-center justify-center mx-auto">
              <span
                className="v2-icon text-3xl text-[var(--v2-primary)]"
                style={{fontVariationSettings: "'FILL' 1"}}
              >
                lock
              </span>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold v2-headline text-[var(--v2-on-surface)]">
                {title}
              </h1>
              <p className="text-[var(--v2-on-surface-variant)] text-sm">
                {description}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href={redirectPath ? `/v2/login?redirect=${redirectPath}` : '/v2/login'}
                className="w-full h-12 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              >
                <span className="v2-icon">login</span>
                Sign In
              </Link>
              <Link
                href={redirectPath ? `/v2/signup?redirect=${redirectPath}` : '/v2/signup'}
                className="w-full h-12 bg-[var(--v2-surface-container-high)] text-[var(--v2-primary)] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[var(--v2-surface-container-highest)] transition-colors"
              >
                <span className="v2-icon">person_add</span>
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

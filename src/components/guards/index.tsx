'use client';

import {useProfile} from '@/hooks/use-profile';
import {useUserStore} from '@/lib/store/useUserStore';
import {notFound, useRouter} from 'next/navigation';
import {ReactNode, useEffect} from 'react';
import {Card} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Lock} from 'lucide-react';
import Link from 'next/link';

/**
 * Loading spinner shown while guards are checking access.
 */
function GuardLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface BaseGuardProps {
  children: ReactNode;
  /** What to show on access denied. Defaults to notFound(). */
  fallback?: 'notFound' | 'redirect';
  /** Redirect path when fallback is 'redirect'. Defaults to '/login'. */
  redirectTo?: string;
}

// ─── RequireAuth ─────────────────────────────────────────────────────────────

/**
 * Guard that requires the user to be authenticated.
 *
 * @example
 * <RequireAuth>
 *   <ProtectedPageContent />
 * </RequireAuth>
 */
export function RequireAuth({
  children,
  fallback = 'redirect',
  redirectTo = '/login',
}: BaseGuardProps) {
  const user = useUserStore(state => state.user);
  const router = useRouter();
  const {isLoading} = useProfile();

  useEffect(() => {
    if (!isLoading && !user && fallback === 'redirect') {
      router.replace(redirectTo);
    }
  }, [isLoading, user, fallback, redirectTo, router]);

  if (isLoading) return <GuardLoader />;

  if (!user) {
    if (fallback === 'redirect') {
      return <GuardLoader />;
    }
    notFound();
  }

  return <>{children}</>;
}

export interface RequireAuthUIProps {
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
 * Guard that requires the user to be authenticated, but shows a beautifully styled
 * Login/Signup card instead of redirecting or throwing a 404.
 */
export function RequireAuthUI({
  children,
  title = 'Authentication Required',
  description = 'You must be logged in to view this page.',
  header,
  redirectPath,
}: RequireAuthUIProps) {
  const user = useUserStore(state => state.user);
  const {isLoading} = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        {header}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center p-6">
        {header}
        <div className="flex-1 flex items-center justify-center w-full">
          <Card className="w-full max-w-md border-border shadow-2xl rounded-3xl p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild className="h-12 font-bold rounded-xl">
                <Link
                  href={
                    redirectPath ? `/login?redirect=${redirectPath}` : '/login'
                  }>
                  Sign In
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 font-bold rounded-xl">
                <Link
                  href={
                    redirectPath
                      ? `/signup?redirect=${redirectPath}`
                      : '/signup'
                  }>
                  Create Account
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ─── RequireRole ─────────────────────────────────────────────────────────────

interface RequireRoleProps extends BaseGuardProps {
  /** The role string to check for in profile.roles array. */
  role: string;
}

/**
 * Generic guard that checks for a specific role in the user's roles array.
 *
 * @example
 * <RequireRole role="vendor">
 *   <VendorDashboard />
 * </RequireRole>
 */
export function RequireRole({
  children,
  role,
  fallback = 'notFound',
  redirectTo = '/login',
}: RequireRoleProps) {
  const {data: profile, isLoading} = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !profile?.roles?.includes(role) && fallback === 'redirect') {
      router.replace(redirectTo);
    }
  }, [isLoading, profile, role, fallback, redirectTo, router]);

  if (isLoading) return <GuardLoader />;

  if (!profile?.roles?.includes(role)) {
    if (fallback === 'redirect') {
      return <GuardLoader />;
    }
    notFound();
  }

  return <>{children}</>;
}

// ─── RequireAdmin ────────────────────────────────────────────────────────────

/**
 * Guard that checks the user has an admin_role.
 *
 * @example
 * <RequireAdmin>
 *   <AdminPanel />
 * </RequireAdmin>
 */
export function RequireAdmin({
  children,
  fallback = 'notFound',
  redirectTo = '/login',
}: BaseGuardProps) {
  const {data: profile, isLoading} = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !profile?.admin_role && fallback === 'redirect') {
      router.replace(redirectTo);
    }
  }, [isLoading, profile, fallback, redirectTo, router]);

  if (isLoading) return <GuardLoader />;

  if (!profile?.admin_role) {
    if (fallback === 'redirect') {
      return <GuardLoader />;
    }
    notFound();
  }

  return <>{children}</>;
}

// ─── RequireVendor ───────────────────────────────────────────────────────────

/**
 * Guard that checks the user has the 'vendor' role.
 *
 * @example
 * <RequireVendor>
 *   <VendorDashboard />
 * </RequireVendor>
 */
export function RequireVendor({
  children,
  fallback = 'notFound',
  redirectTo = '/login',
}: BaseGuardProps) {
  return (
    <RequireRole role="vendor" fallback={fallback} redirectTo={redirectTo}>
      {children}
    </RequireRole>
  );
}

// ─── RequireCreator ──────────────────────────────────────────────────────────

/**
 * Guard that checks the user has the 'creator' role or is_creator flag.
 *
 * @example
 * <RequireCreator>
 *   <CreatorSettings />
 * </RequireCreator>
 */
export function RequireCreator({
  children,
  fallback = 'notFound',
  redirectTo = '/login',
}: BaseGuardProps) {
  const {data: profile, isLoading} = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !profile?.is_creator && !profile?.roles?.includes('creator') && fallback === 'redirect') {
      router.replace(redirectTo);
    }
  }, [isLoading, profile, fallback, redirectTo, router]);

  if (isLoading) return <GuardLoader />;

  if (!profile?.is_creator && !profile?.roles?.includes('creator')) {
    if (fallback === 'redirect') {
      return <GuardLoader />;
    }
    notFound();
  }

  return <>{children}</>;
}

'use client';

import {useProfile} from '@/hooks/use-profile';
import {useUserStore} from '@/lib/store/useUserStore';
import {notFound, useRouter} from 'next/navigation';
import {ReactNode} from 'react';

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

  if (isLoading) return <GuardLoader />;

  if (!user) {
    if (fallback === 'redirect') {
      router.replace(redirectTo);
      return <GuardLoader />;
    }
    notFound();
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

  if (isLoading) return <GuardLoader />;

  if (!profile?.roles?.includes(role)) {
    if (fallback === 'redirect') {
      router.replace(redirectTo);
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

  if (isLoading) return <GuardLoader />;

  if (!profile?.admin_role) {
    if (fallback === 'redirect') {
      router.replace(redirectTo);
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

  if (isLoading) return <GuardLoader />;

  if (!profile?.is_creator && !profile?.roles?.includes('creator')) {
    if (fallback === 'redirect') {
      router.replace(redirectTo);
      return <GuardLoader />;
    }
    notFound();
  }

  return <>{children}</>;
}

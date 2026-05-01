'use client';

import {useIsMobile} from '@/hooks/use-mobile';
import {useProfile} from '@/hooks/use-profile';
import { authClient } from '@/lib/auth-client';
import {useUserStore} from '@/lib/store/useUserStore';
import {useQueryClient} from '@tanstack/react-query';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {Suspense, useEffect, useState} from 'react';
import {toast} from 'sonner';
import {SelectedSection, sectionTitles, sectionIcons} from './components/dashboard-config';
import {V2BottomTabBar} from './components/V2BottomTabBar';
import {V2RoleSwitcher} from '../components/V2RoleSwitcher';
import {V2NotificationsPanel} from '../components/V2NotificationsPanel';
import {V2MobileMenu} from './components/V2MobileMenu';
import {V2LogoutModal} from '@/components/V2LogoutModal';

import {GifthanceLogo} from '@/components/GifthanceLogo';
import {
  V2OverviewTab,
  V2SentGiftsTab,
  V2ReceivedGiftsTab,
  V2MyGiftsTab,
  V2ContributionsTab,
  V2FavoritesTab,
  V2MyCampaignsTab,
  V2WalletTab,
  V2SettingsTab,
  V2GiftPageTab,
  V2SupportersTab,
  V2AnalyticsTab,
} from './components/tabs';

// Desktop sidebar nav items
const navItems: {id: SelectedSection; label: string; icon: string}[] = [
  {id: 'overview', label: 'Overview', icon: 'dashboard'},
  {id: 'sent', label: 'Gifts Sent', icon: 'send'},
  {id: 'my-gifts', label: 'My Gifts', icon: 'card_giftcard'},
  {id: 'received', label: 'Campaign Donations', icon: 'volunteer_activism'},
  {id: 'contributions', label: 'My Contributions', icon: 'paid'},
  {id: 'campaigns', label: 'My Campaigns', icon: 'campaign'},
  {id: 'favorites', label: 'Favorites', icon: 'favorite'},
  {id: 'wallet', label: 'Wallet', icon: 'account_balance_wallet'},
  {id: 'settings', label: 'Settings', icon: 'settings'},
];

const creatorNavItems: {id: SelectedSection; label: string; icon: string}[] = [
  {id: 'gift-page', label: 'My Gift Page', icon: 'auto_awesome'},
  {id: 'supporters', label: 'Supporters', icon: 'group'},
  {id: 'analytics', label: 'Analytics', icon: 'analytics'},
];

function DashboardLoadingFallback() {
  return (
    <div className="min-h-screen bg-[var(--v2-background)] flex items-center justify-center">
      <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
        progress_activity
      </span>
    </div>
  );
}

export default function V2DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoadingFallback />}>
      <V2DashboardContent />
    </Suspense>
  );
}

function V2DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: session, isPending } = authClient.useSession();
  const { data: profile } = useProfile();
  const isMobile = useIsMobile();
  const user = useUserStore(state => state.user);
  const clearUser = useUserStore(state => state.clearUser);

  // Authentication and Redirect
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  // Get initial tab from URL or default to overview
  const initialTab = (searchParams.get('tab') as SelectedSection) || 'overview';
  const [section, setSection] = useState<SelectedSection>(initialTab);
  const [dbIsCreator, setDbIsCreator] = useState(false);
  const [dbPlan, setDbPlan] = useState<'free' | 'pro'>('free');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);


  useEffect(() => {
    if (profile) {
      setDbIsCreator(profile.is_creator);
      setDbPlan(profile.theme_settings?.plan || 'free');
    }
  }, [profile]);

  // Update URL when section changes
  useEffect(() => {
    const url = section === 'overview' ? '/dashboard' : `/dashboard?tab=${section}`;
    window.history.replaceState(null, '', url);
  }, [section]);

  const isEffectivelyCreator = dbIsCreator || dbPlan === 'pro';

  // Prevent hydration errors by ensuring client and server match on initial render
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading while checking auth or until mounted
  if (!mounted || isPending) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex items-center justify-center">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      queryClient.clear();
      clearUser();
      toast.success('Signed out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to sign out');
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };


  const handleSectionChange = (newSection: SelectedSection) => {
    setSection(newSection);
  };

  const userName = profile?.display_name || user?.display_name || 'User';

  return (
    <div className="min-h-screen bg-[var(--v2-background)]">
      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 z-50 w-full px-4 h-14 flex justify-between items-center v2-glass-nav">
        <GifthanceLogo size="sm" />
        <div className="flex items-center gap-2">
          <V2NotificationsPanel />
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-10 h-10 rounded-xl bg-[var(--v2-surface-container-high)] flex items-center justify-center">
            <span className="v2-icon text-[var(--v2-on-surface)]">menu</span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <V2MobileMenu 
        open={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        onLogoutClick={() => setIsLogoutModalOpen(true)}
      />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full py-6 px-4 w-64 flex-col bg-[var(--v2-surface-container-low)] z-30 border-r border-[var(--v2-outline-variant)]/10">
        <div className="px-4 mb-4">
          <GifthanceLogo size="md" />
        </div>

        <V2RoleSwitcher />

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleSectionChange(item.id)}
              className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-xl transition-colors duration-200 text-left ${
                section === item.id
                  ? 'text-[var(--v2-primary)] font-bold bg-[var(--v2-primary)]/10'
                  : 'text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] hover:bg-[var(--v2-surface)]/50'
              }`}>
              <span
                className="v2-icon text-xl"
                style={section === item.id ? {fontVariationSettings: "'FILL' 1"} : undefined}>
                {item.icon}
              </span>
              <span className="v2-headline text-sm font-semibold tracking-tight">{item.label}</span>
            </button>
          ))}

          {/* Creator Section */}
          {isEffectivelyCreator && (
            <>
              <div className="pt-4 pb-2 px-4">
                <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                  Creator
                </p>
              </div>
              {creatorNavItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-xl transition-colors duration-200 text-left ${
                    section === item.id
                      ? 'text-[var(--v2-primary)] font-bold bg-[var(--v2-primary)]/10'
                      : 'text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] hover:bg-[var(--v2-surface)]/50'
                  }`}>
                  <span
                    className="v2-icon text-xl"
                    style={section === item.id ? {fontVariationSettings: "'FILL' 1"} : undefined}>
                    {item.icon}
                  </span>
                  <span className="v2-headline text-sm font-semibold tracking-tight">
                    {item.label}
                  </span>
                </button>
              ))}
            </>
          )}
        </nav>

        <div className="mt-auto pt-4 border-t border-[var(--v2-outline-variant)]/10">
          <Link
            href="/create-campaign"
            className="w-full h-12 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[var(--v2-primary)]/10 transition-transform active:scale-[0.98] mb-4">
            <span className="v2-icon">add</span>
            New Campaign
          </Link>

          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--v2-surface-container-high)] transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-[var(--v2-primary)] capitalize">
                  {userName.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[var(--v2-on-surface)] truncate capitalize">
                {userName}
              </p>
              <p className="text-xs text-[var(--v2-on-surface-variant)] truncate">
                @{user?.username || 'username'}
              </p>
            </div>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-2 rounded-lg hover:bg-[var(--v2-error)]/10 text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-error)] transition-colors"
              title="Sign out">
              <span className="v2-icon text-lg">logout</span>
            </button>
          </div>
        </div>

        <V2LogoutModal
          open={isLogoutModalOpen}
          onOpenChange={setIsLogoutModalOpen}
          onConfirm={handleSignOut}
          isLoggingOut={isLoggingOut}
          portalName="Personal"
        />
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen pt-14 md:pt-0 pb-24 md:pb-8">
        {/* Desktop Header */}
        <header className="hidden md:flex sticky top-0 z-40 bg-[var(--v2-background)]/80 backdrop-blur-xl border-b border-[var(--v2-outline-variant)]/10 px-6 h-16 items-center justify-between">
          <h1 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)]">
            {sectionTitles[section]}
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href="/send-gift"
              className="h-10 px-4 text-[var(--v2-on-surface-variant)] font-medium text-sm rounded-xl flex items-center gap-2 hover:bg-[var(--v2-surface-container-low)] transition-colors">
              Send Gift
            </Link>
            <Link
              href="/gifts"
              className="h-10 px-4 text-[var(--v2-on-surface-variant)] font-medium text-sm rounded-xl flex items-center gap-2 hover:bg-[var(--v2-surface-container-low)] transition-colors">
              Gifts
            </Link>
            <Link
              href="/campaigns"
              className="h-10 px-4 text-[var(--v2-on-surface-variant)] font-medium text-sm rounded-xl flex items-center gap-2 hover:bg-[var(--v2-surface-container-low)] transition-colors">
              Campaigns
            </Link>
            <V2NotificationsPanel />
          </div>
        </header>

        {/* Tab Content */}
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {section === 'overview' && (
            <V2OverviewTab
              creatorEnabled={isEffectivelyCreator}
              setCreatorEnabled={setDbIsCreator}
              setSection={handleSectionChange}
            />
          )}

          {section === 'sent' && <V2SentGiftsTab />}

          {section === 'my-gifts' && <V2MyGiftsTab />}

          {section === 'received' && (
            <V2ReceivedGiftsTab
              setSection={handleSectionChange}
              setWalletView={() => handleSectionChange('wallet')}
            />
          )}

          {section === 'contributions' && <V2ContributionsTab />}

          {section === 'favorites' && <V2FavoritesTab />}

          {section === 'campaigns' && <V2MyCampaignsTab />}

          {section === 'wallet' && <V2WalletTab />}

          {section === 'settings' && <V2SettingsTab />}

          {section === 'gift-page' && isEffectivelyCreator && (
            <V2GiftPageTab creatorPlan={dbPlan} setCreatorPlan={setDbPlan} />
          )}

          {section === 'supporters' && isEffectivelyCreator && (
            <V2SupportersTab setSection={handleSectionChange} />
          )}

          {section === 'analytics' && isEffectivelyCreator && (
            <V2AnalyticsTab
              setSection={handleSectionChange}
              setWalletView={() => handleSectionChange('wallet')}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      {isMobile && (
        <V2BottomTabBar activeSection={section} onNavigate={handleSectionChange} />
      )}
    </div>
  );
}

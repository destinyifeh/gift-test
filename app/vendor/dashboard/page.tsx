'use client';

import {RequireVendor} from '@/components/guards';
import {useIsMobile} from '@/hooks/use-mobile';
import {useProfile} from '@/hooks/use-profile';
import {authClient} from '@/lib/auth-client';
import {useQueryClient} from '@tanstack/react-query';
import {useRouter, useSearchParams} from 'next/navigation';
import {Suspense, useEffect, useState} from 'react';
import {toast} from 'sonner';
import {
  V2VendorOverviewTab,
  V2VendorCodesTab,
  V2VendorWalletTab,
  V2VendorOrdersTab,
  V2VendorSettingsTab,
} from './components/tabs';
import {V2VendorBottomTabBar} from './components/V2VendorBottomTabBar';
import {V2VendorMobileMenu} from './components/V2VendorMobileMenu';
import {V2RoleSwitcher, V2MobileRoleSwitcher} from '../../components/V2RoleSwitcher';
import {V2NotificationsPanel} from '../../components/V2NotificationsPanel';
import {V2LogoutModal} from './components/V2LogoutModal';


type VendorSection = 'dashboard' | 'orders' | 'codes' | 'wallet' | 'settings';

const sectionTitles: Record<VendorSection, string> = {
  dashboard: 'Dashboard',
  orders: 'Redemptions',
  codes: 'Verify Codes',
  wallet: 'Wallet',
  settings: 'Settings',
};

// Desktop sidebar nav items
const navItems: {id: VendorSection; label: string; icon: string}[] = [
  {id: 'dashboard', label: 'Dashboard', icon: 'dashboard'},
  {id: 'orders', label: 'Redemptions', icon: 'receipt_long'},
  {id: 'codes', label: 'Verify Codes', icon: 'qr_code_scanner'},
  {id: 'wallet', label: 'Wallet', icon: 'payments'},
  {id: 'settings', label: 'Settings', icon: 'settings'},
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

export default function V2VendorDashboardPage() {
  return (
    <RequireVendor fallback="redirect" redirectTo="/login">
      <Suspense fallback={<DashboardLoadingFallback />}>
        <V2VendorDashboardContent />
      </Suspense>
    </RequireVendor>
  );
}

function V2VendorDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const {data: profile} = useProfile();
  const isMobile = useIsMobile();

  // Get initial tab from URL or default to dashboard
  const initialTab = (searchParams.get('tab') as VendorSection) || 'dashboard';
  const [section, setSection] = useState<VendorSection>(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');


  // Update URL when section changes
  useEffect(() => {
    const url = section === 'dashboard' ? '/vendor/dashboard' : `/vendor/dashboard?tab=${section}`;
    window.history.replaceState(null, '', url);
  }, [section]);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      queryClient.clear();
      toast.success('Signed out successfully');
      router.push('/login');
    } catch (error: any) {
      toast.error('Failed to sign out');
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };


  const handleSectionChange = (newSection: VendorSection) => {
    setSection(newSection);
  };

  const shopName = profile?.shop_name || profile?.display_name || 'Vendor';

  return (
    <div className="min-h-screen bg-[var(--v2-background)]">
      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 z-50 w-full px-3 h-13 flex justify-between items-center v2-glass-nav pt-safe">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--v2-primary-container)] flex items-center justify-center overflow-hidden shrink-0">
            {profile?.shop_logo_url ? (
              <img src={profile.shop_logo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-[var(--v2-on-primary-container)] capitalize">
                {shopName.charAt(0)}
              </span>
            )}
          </div>
          <h1 className="font-bold text-base v2-headline text-[var(--v2-on-surface)] tracking-tight truncate max-w-[140px]">
            {sectionTitles[section]}
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <V2MobileRoleSwitcher />
          <V2NotificationsPanel />
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-9 h-9 rounded-xl bg-[var(--v2-surface-container-high)] flex items-center justify-center">
            <span className="v2-icon text-lg text-[var(--v2-on-surface)]">menu</span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <V2VendorMobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full py-8 px-4 w-64 flex-col bg-[var(--v2-surface-container-low)] z-30">
        <div className="mb-10 px-4">
          <h1 className="text-2xl font-bold text-[var(--v2-on-surface)] tracking-tight v2-headline">
            Vendor Portal
          </h1>
          <p className="text-xs font-semibold text-[var(--v2-on-surface-variant)] mt-1 uppercase tracking-wider">
            Verified Business
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleSectionChange(item.id)}
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-colors duration-200 text-left ${
                section === item.id
                  ? 'text-[var(--v2-primary)] font-bold bg-[var(--v2-surface)] border-r-4 border-[var(--v2-primary)]'
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
        </nav>

        <div className="mt-auto pt-6 border-t border-[var(--v2-outline-variant)]/10">

          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--v2-surface-container-high)] transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center overflow-hidden">
              {profile?.shop_logo_url ? (
                <img src={profile.shop_logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-[var(--v2-primary)] capitalize">
                  {shopName.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[var(--v2-on-surface)] truncate capitalize">
                {shopName}
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
        />
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen pt-14 md:pt-0 pb-24 md:pb-8">
        {/* Desktop Header */}
        <header className="hidden md:flex sticky top-0 z-40 bg-[var(--v2-surface-container-lowest)]/80 backdrop-blur-xl h-16 items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <span className="v2-icon absolute left-3 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)] text-lg">
                search
              </span>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--v2-surface-container-low)] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 ring-[var(--v2-outline-variant)]/15 transition-all outline-none"
                placeholder="Search orders, codes..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 text-[var(--v2-primary)]">
            <V2RoleSwitcher />
            <V2NotificationsPanel />
            <div className="h-8 w-8 rounded-full bg-[var(--v2-primary-container)]/20 overflow-hidden">
              {profile?.shop_logo_url ? (
                <img src={profile.shop_logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs font-bold text-[var(--v2-primary)] capitalize">
                    {shopName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {section === 'dashboard' && <V2VendorOverviewTab setSection={handleSectionChange} />}
          {section === 'orders' && <V2VendorOrdersTab searchQuery={searchQuery} />}
          {section === 'codes' && <V2VendorCodesTab />}
          {section === 'wallet' && <V2VendorWalletTab />}
          {section === 'settings' && <V2VendorSettingsTab />}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      {isMobile && (
        <V2VendorBottomTabBar activeSection={section} onNavigate={handleSectionChange} />
      )}


    </div>
  );
}

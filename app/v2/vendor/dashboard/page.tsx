'use client';

import {RequireVendor} from '@/components/guards';
import {useIsMobile} from '@/hooks/use-mobile';
import {useProfile} from '@/hooks/use-profile';
import {signOut} from '@/lib/server/actions/auth';
import {useQueryClient} from '@tanstack/react-query';
import {useRouter, useSearchParams} from 'next/navigation';
import {Suspense, useEffect, useState} from 'react';
import {toast} from 'sonner';
import {
  V2VendorOverviewTab,
  V2VendorInventoryTab,
  V2VendorShopTab,
  V2VendorCodesTab,
  V2VendorWalletTab,
  V2VendorOrdersTab,
  V2VendorSettingsTab,
} from './components/tabs';
import {V2VendorBottomTabBar} from './components/V2VendorBottomTabBar';
import {V2VendorMobileMenu} from './components/V2VendorMobileMenu';
import {V2RoleSwitcher} from '../../components/V2RoleSwitcher';

type VendorSection = 'dashboard' | 'shop' | 'inventory' | 'orders' | 'codes' | 'wallet' | 'settings';

const sectionTitles: Record<VendorSection, string> = {
  dashboard: 'Dashboard',
  shop: 'Shop Details',
  inventory: 'Inventory',
  orders: 'Orders',
  codes: 'Gift Codes',
  wallet: 'Wallet',
  settings: 'Settings',
};

// Desktop sidebar nav items
const navItems: {id: VendorSection; label: string; icon: string}[] = [
  {id: 'dashboard', label: 'Dashboard', icon: 'dashboard'},
  {id: 'shop', label: 'Shop Details', icon: 'store'},
  {id: 'inventory', label: 'Inventory', icon: 'inventory_2'},
  {id: 'orders', label: 'Orders', icon: 'shopping_bag'},
  {id: 'codes', label: 'Verify Codes', icon: 'qr_code_scanner'},
  {id: 'wallet', label: 'Finances', icon: 'payments'},
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
    <RequireVendor fallback="redirect" redirectTo="/v2/login">
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
  const [searchQuery, setSearchQuery] = useState('');

  // Update URL when section changes
  useEffect(() => {
    const url = section === 'dashboard' ? '/v2/vendor/dashboard' : `/v2/vendor/dashboard?tab=${section}`;
    window.history.replaceState(null, '', url);
  }, [section]);

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      queryClient.clear();
      toast.success('Signed out successfully');
      router.push('/v2/login');
    } else {
      toast.error(result.error || 'Failed to sign out');
    }
  };

  const handleSectionChange = (newSection: VendorSection) => {
    setSection(newSection);
  };

  const shopName = profile?.shop_name || profile?.display_name || 'Vendor';

  return (
    <div className="min-h-screen bg-[var(--v2-background)]">
      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 z-50 w-full px-4 h-14 flex justify-between items-center v2-glass-nav">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--v2-primary-container)] flex items-center justify-center overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-[var(--v2-on-primary-container)] capitalize">
                {shopName.charAt(0)}
              </span>
            )}
          </div>
          <h1 className="font-bold text-lg v2-headline text-[var(--v2-on-surface)] tracking-tight">
            Vendor Hub
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <V2RoleSwitcher />
          <button className="w-10 h-10 rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center relative">
            <span className="v2-icon text-[var(--v2-primary)]">notifications</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-10 h-10 rounded-xl bg-[var(--v2-surface-container-high)] flex items-center justify-center">
            <span className="v2-icon text-[var(--v2-on-surface)]">menu</span>
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
            Premium Merchant
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
          <button
            className="w-full h-14 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[var(--v2-primary)]/10 transition-transform active:scale-[0.98] mb-4">
            <span className="v2-icon">add</span>
            Add Product
          </button>

          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--v2-surface-container-high)] transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
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
              <p className="text-xs text-[var(--v2-on-surface-variant)] truncate">
                @{profile?.username || 'vendor'}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-[var(--v2-error)]/10 text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-error)] transition-colors"
              title="Sign out">
              <span className="v2-icon text-lg">logout</span>
            </button>
          </div>
        </div>
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
                placeholder="Search orders, products..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 text-[var(--v2-primary)]">
            <V2RoleSwitcher />
            <button className="hover:opacity-80 transition-opacity flex items-center gap-1">
              <span className="v2-icon">notifications</span>
            </button>
            <button className="hover:opacity-80 transition-opacity flex items-center gap-1">
              <span className="v2-icon">help_outline</span>
            </button>
            <div className="h-8 w-8 rounded-full bg-[var(--v2-primary-container)]/20 overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
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
          {section === 'shop' && <V2VendorShopTab />}
          {section === 'inventory' && <V2VendorInventoryTab searchQuery={searchQuery} />}
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

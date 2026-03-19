'use client';

import {Button} from '@/components/ui/button';
import {signOut} from '@/lib/server/actions/auth';
import {useUserStore} from '@/lib/store/useUserStore';
import {Menu, Plus} from 'lucide-react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {AnalyticsTab} from './components/AnalyticsTab';
import {ContributionsTab} from './components/ContributionsTab';
import {DesktopSidebar} from './components/DesktopSidebar';
import {FavoritesTab} from './components/FavoritesTab';
import {GiftPageTab} from './components/GiftPageTab';
import {IntegrationsTab} from './components/IntegrationsTab';
import {MobileSidebar} from './components/MobileSidebar';
import {SelectedSection} from './components/mock';
import {MyCampaignsTab} from './components/MyCampaignsTab';
import {OverviewTab} from './components/OverviewTab';
import {ReceivedGiftsTab} from './components/ReceivedGiftsTab';
import {SentGiftsTab} from './components/SentGiftsTab';
import {SettingsTab} from './components/SettingsTab';
import {SupportersTab} from './components/SupportersTab';
import {getTitle} from './components/utils';
import {WalletTab} from './components/WalletTab';

export default function DashboardPage() {
  const [section, setSection] = useState<SelectedSection>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [creatorEnabled, setCreatorEnabled] = useState(false);
  const [creatorPlan, setCreatorPlan] = useState<'free' | 'pro'>('free');

  const user = useUserStore(state => state.user);

  useEffect(() => {
    if (user?.is_creator) {
      setCreatorEnabled(true);
    }
  }, [user?.is_creator]);

  const router = useRouter();
  const clearUser = useUserStore(state => state.clearUser);

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      clearUser();
      toast.success('Signed out successfully');
      router.push('/login');
    } else {
      toast.error(result.error || 'Failed to sign out');
    }
  };

  const commonProps = {
    setSection,
    sidebarOpen,
    setSidebarOpen,
    creatorEnabled,
    setCreatorEnabled,
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DesktopSidebar
        section={section}
        commonProps={commonProps}
        onSignOut={handleSignOut}
      />

      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        section={section}
        commonProps={commonProps}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 md:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-base sm:text-lg font-semibold font-display text-foreground capitalize">
              {getTitle(section)}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/create-campaign">
              <Button variant="hero" size="sm" className="text-xs sm:text-sm">
                <Plus className="w-4 h-4 mr-1" />{' '}
                <span className="hidden sm:inline">New Campaign</span>
              </Button>
            </Link>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-5xl">
          {section === 'overview' && (
            <OverviewTab
              {...commonProps}
              creatorPlan={creatorPlan}
              setCreatorPlan={setCreatorPlan}
              setSection={setSection}
            />
          )}

          {section === 'sent' && <SentGiftsTab />}

          {section === 'received' && (
            <ReceivedGiftsTab
              setSection={setSection}
              setWalletView={() => setSection('wallet')}
            />
          )}

          {section === 'contributions' && <ContributionsTab />}

          {section === 'favorites' && <FavoritesTab />}

          {section === 'campaigns' && <MyCampaignsTab />}

          {section === 'wallet' && <WalletTab />}

          {section === 'settings' && <SettingsTab />}

          {section === 'gift-page' && creatorEnabled && (
            <GiftPageTab
              creatorPlan={creatorPlan}
              setCreatorPlan={setCreatorPlan}
            />
          )}

          {section === 'supporters' && creatorEnabled && <SupportersTab />}

          {section === 'analytics' && creatorEnabled && <AnalyticsTab />}

          {section === 'integrations' && creatorEnabled && <IntegrationsTab />}
        </div>
      </main>
    </div>
  );
}

'use client';

import {Button} from '@/components/ui/button';
import {useProfile} from '@/hooks/use-profile';
import {signOut} from '@/lib/server/actions/auth';
import {useUserStore} from '@/lib/store/useUserStore';
import {useQueryClient} from '@tanstack/react-query';
import {Menu, Plus, Send} from 'lucide-react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {AnalyticsTab} from './components/AnalyticsTab';
import {ContributionsTab} from './components/ContributionsTab';
import {CreatorGiftsTab} from './components/CreatorGiftsTab';
import {SelectedSection} from './components/dashboard-config';
import {DesktopSidebar} from './components/DesktopSidebar';
import {FavoritesTab} from './components/FavoritesTab';
import {GiftPageTab} from './components/GiftPageTab';
import {MobileSidebar} from './components/MobileSidebar';
import {MyCampaignsTab} from './components/MyCampaignsTab';
import {MyGiftsTab} from './components/MyGiftsTab';
import {OverviewTab} from './components/OverviewTab';
import {ReceivedGiftsTab} from './components/ReceivedGiftsTab';
import {SentGiftsTab} from './components/SentGiftsTab';
import {SettingsTab} from './components/SettingsTab';
import {SupportersTab} from './components/SupportersTab';
import {getTitle} from './components/utils';
import {WalletTab} from './components/WalletTab';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const {data: profile} = useProfile();
  const [section, setSection] = useState<SelectedSection>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dbIsCreator, setDbIsCreator] = useState(false);
  const [dbPlan, setDbPlan] = useState<'free' | 'pro'>('free');

  const user = useUserStore(state => state.user);

  useEffect(() => {
    if (profile) {
      setDbIsCreator(profile.is_creator);
      setDbPlan(profile.theme_settings?.plan || 'free');
    }
  }, [profile]);

  const isEffectivelyCreator = dbIsCreator || dbPlan === 'pro';

  const router = useRouter();
  const clearUser = useUserStore(state => state.clearUser);

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      queryClient.clear();
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
    creatorEnabled: isEffectivelyCreator,
    setCreatorEnabled: setDbIsCreator,
    creatorPlan: dbPlan,
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
            <Link href="/send-gift">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm text-primary font-medium hover:text-primary/80 hover:bg-primary/5">
                <Send className="w-4 h-4 mr-1 pb-0.5" />
                Send Gift
              </Button>
            </Link>
            <Link href="/gift-shop">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                Gift Shop
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                Campaigns
              </Button>
            </Link>
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
              setCreatorPlan={setDbPlan}
              setSection={setSection}
            />
          )}

          {section === 'sent' && <SentGiftsTab />}

          {section === 'my-gifts' && <MyGiftsTab />}

          {section === 'creator-gifts' && (
            <CreatorGiftsTab
              setSection={setSection}
              setWalletView={() => setSection('wallet')}
            />
          )}

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

          {section === 'gift-page' && isEffectivelyCreator && (
            <GiftPageTab creatorPlan={dbPlan} setCreatorPlan={setDbPlan} />
          )}

          {section === 'supporters' && isEffectivelyCreator && (
            <SupportersTab />
          )}

          {section === 'analytics' && isEffectivelyCreator && <AnalyticsTab />}

        </div>
      </main>
    </div>
  );
}

'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {useProfile} from '@/hooks/use-profile';
import {getCurrencyByCountry} from '@/lib/constants/currencies';
import {
  fetchDashboardAnalytics,
  fetchUnclaimedGifts,
} from '@/lib/server/actions/analytics';
import {updateCreatorStatus} from '@/lib/server/actions/auth';
import {useUserStore} from '@/lib/store/useUserStore';
import {formatCurrency} from '@/lib/utils/currency';
import {cn} from '@/lib/utils';
import {useQuery} from '@tanstack/react-query';
import {motion} from 'framer-motion';
import {DollarSign, Gift, Loader2, Send, Sparkles, Users} from 'lucide-react';
import Link from 'next/link';
import {toast} from 'sonner';
import {SelectedSection} from './dashboard-config';
import {DashboardListItem, DashboardStatCard} from './shared';
import {statusColor} from './utils';

interface OverviewTabProps {
  creatorEnabled: boolean;
  setCreatorEnabled: (enabled: boolean) => void;
  creatorPlan: 'free' | 'pro';
  setCreatorPlan: (plan: 'free' | 'pro') => void;
  setSection: (section: SelectedSection) => void;
}

export function OverviewTab({
  creatorEnabled,
  setCreatorEnabled,
  creatorPlan,
  setCreatorPlan,
  setSection,
}: OverviewTabProps) {
  const user = useUserStore(state => state.user);

  const handleEnableCreator = async () => {
    const result = await updateCreatorStatus(true);
    if (result.success) {
      setCreatorEnabled(true);
      setSection('gift-page');
      toast.success('Gift page enabled!');
    } else {
      toast.error(result.error || 'Failed to enable gift page');
    }
  };

  const {data: analyticsRes, isLoading} = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => fetchDashboardAnalytics(),
  });
  const {data: unclaimedRes} = useQuery({
    queryKey: ['unclaimed-gifts'],
    queryFn: () => fetchUnclaimedGifts(),
  });

  const {data: userProfile} = useProfile();

  const unclaimedGifts = unclaimedRes?.data || [];
  const profile = userProfile || null;
  const userCurrency = getCurrencyByCountry(profile?.country);

  const analytics = analyticsRes?.data || {
    giftsSent: 0,
    giftsReceived: 0,
    totalGiven: 0,
    campaignsCount: 0,
    recentActivity: {sent: [], received: []},
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Gift Banner */}
      {unclaimedGifts.length > 0 && (
        <motion.div
          initial={{opacity: 0, y: -10}}
          animate={{opacity: 1, y: 0}}
          className={cn(
            'relative overflow-hidden rounded-2xl p-4 md:p-5',
            'bg-gradient-to-r from-primary/20 via-primary/10 to-transparent',
            'border border-primary/20',
          )}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
                <Gift className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {unclaimedGifts.length} unclaimed gift{unclaimedGifts.length > 1 ? 's' : ''} waiting! 🎁
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sent to your email. Claim now!
                </p>
              </div>
            </div>
            <Button asChild variant="hero" size="lg" className="w-full sm:w-auto">
              <Link href={`/claim/${unclaimedGifts[0].gift_code}`}>
                Claim Now
              </Link>
            </Button>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardStatCard
          icon={<Send className="w-5 h-5" />}
          value={analytics.giftsSent.toString()}
          label="Gifts Sent"
          color="primary"
        />
        <DashboardStatCard
          icon={<Gift className="w-5 h-5" />}
          value={analytics.giftsReceived.toString()}
          label="Gifts Received"
          color="secondary"
        />
        <DashboardStatCard
          icon={<DollarSign className="w-5 h-5" />}
          value={formatCurrency(analytics.totalGiven, userCurrency)}
          label="Total Given"
          color="accent"
        />
        <DashboardStatCard
          icon={<Users className="w-5 h-5" />}
          value={analytics.campaignsCount.toString()}
          label="Campaigns"
          color="primary"
        />
      </div>

      {/* Recent Activity */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>

        {analytics.recentActivity.sent.length === 0 &&
          analytics.recentActivity.received.length === 0 ? (
          <div className="text-center py-8 rounded-xl border border-dashed border-border bg-card/50">
            <p className="text-sm text-muted-foreground">
              No recent activity found.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {analytics.recentActivity.sent.map((g: any) => (
              <DashboardListItem
                key={g.id}
                icon={<Send className="w-4 h-4" />}
                iconBg="bg-primary/10 text-primary"
                title={g.name}
                subtitle={`${g.giftCategory ? `${g.giftCategory} • ` : ''}${g.date}`}
                badge={{label: g.status, variant: statusColor(g.status) as any}}
              />
            ))}
            {analytics.recentActivity.received.map((g: any) => (
              <DashboardListItem
                key={g.id}
                icon={<Gift className="w-4 h-4" />}
                iconBg="bg-secondary/10 text-secondary"
                title={g.name}
                subtitle={`${g.type ? `${g.type.replace('-', ' ')} • ` : ''}${g.date}`}
                badge={{label: g.status, variant: statusColor(g.status) as any}}
              />
            ))}
          </div>
        )}
      </div>

      {/* Creator CTA */}
      {!creatorEnabled && creatorPlan !== 'pro' && (
        <div
          className={cn(
            'p-4 rounded-2xl',
            'bg-gradient-to-r from-primary/10 to-secondary/10',
            'border border-primary/20',
          )}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Enable Your Gift Page
                </h3>
                <p className="text-sm text-muted-foreground">
                  Let people send you gifts at gifthance.com/{user?.username || 'username'}
                </p>
              </div>
            </div>
            <Button variant="hero" onClick={handleEnableCreator} className="w-full sm:w-auto">
              Enable Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

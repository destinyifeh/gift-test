'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {useProfile} from '@/hooks/use-profile';
import {getCurrencyByCountry} from '@/lib/constants/currencies';
import {
  fetchDashboardAnalytics,
  fetchUnclaimedGifts,
} from '@/lib/server/actions/analytics';
import {updateCreatorStatus} from '@/lib/server/actions/auth';
import {useUserStore} from '@/lib/store/useUserStore';
import {formatCurrency} from '@/lib/utils/currency';
import {useQuery} from '@tanstack/react-query';
import {motion} from 'framer-motion';
import {DollarSign, Gift, Loader2, Send, Sparkles, Users} from 'lucide-react';
import Link from 'next/link';
import {toast} from 'sonner';
import {SelectedSection} from './dashboard-config';
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
      <div className="flex flex-col items-center justify-center min-h-[300px] opacity-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Gift Banner */}
      {unclaimedGifts.length > 0 && (
        <motion.div
          initial={{opacity: 0, y: -20}}
          animate={{opacity: 1, y: 0}}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
              <Gift className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                You have {unclaimedGifts.length} unclaimed gift
                {unclaimedGifts.length > 1 ? 's' : ''} waiting! 🎁
              </h3>
              <p className="text-sm text-muted-foreground">
                Sent to your email. Claim now to add to your dashboard.
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="hero"
            size="lg"
            className="rounded-xl font-bold shadow-xl shadow-primary/20 transition-transform active:scale-95 px-8 relative z-10">
            <Link href={`/claim/${unclaimedGifts[0].gift_code}`}>
              Claim Now
            </Link>
          </Button>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: 'Gifts Sent',
            value: analytics.giftsSent.toString(),
            icon: Send,
            color: 'text-primary',
          },
          {
            label: 'Gifts Received',
            value: analytics.giftsReceived.toString(),
            icon: Gift,
            color: 'text-secondary',
          },
          {
            label: 'Total Given',
            value: formatCurrency(analytics.totalGiven, userCurrency),
            icon: DollarSign,
            color: 'text-accent',
          },
          {
            label: 'Campaigns',
            value: analytics.campaignsCount.toString(),
            icon: Users,
            color: 'text-primary',
          },
        ].map(s => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4 sm:w-5 h-4 sm:h-5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-body">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analytics.recentActivity.sent.length === 0 &&
            analytics.recentActivity.received.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No recent activity found.
              </p>
            )}
          {analytics.recentActivity.sent.map((g: any) => (
            <div key={g.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3 min-w-0">
                <Send className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate capitalize">
                    {g.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{g.date}</p>
                </div>
              </div>
              <Badge variant={statusColor(g.status) as any}>{g.status}</Badge>
            </div>
          ))}
          {analytics.recentActivity.received.map((g: any) => (
            <div key={g.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3 min-w-0">
                <Gift className="w-4 h-4 text-secondary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate capitalize">
                    {g.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{g.date}</p>
                </div>
              </div>
              <Badge variant={statusColor(g.status) as any}>{g.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Explicitly hide if Pro OR enabled */}
      {creatorEnabled || creatorPlan === 'pro' ? null : (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Enable Your Gift
                Page
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Let people send you gifts at gifthance.com/
                {user?.username || 'username'}
              </p>
            </div>
            <Button variant="hero" size="sm" onClick={handleEnableCreator}>
              Enable
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

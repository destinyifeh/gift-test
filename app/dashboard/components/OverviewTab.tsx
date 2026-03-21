'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {useProfile} from '@/hooks/use-profile';
import {getCurrencyByCountry} from '@/lib/constants/currencies';
import {fetchDashboardAnalytics} from '@/lib/server/actions/analytics';
import {updateCreatorStatus} from '@/lib/server/actions/auth';
import {useUserStore} from '@/lib/store/useUserStore';
import {formatCurrency} from '@/lib/utils/currency';
import {useQuery} from '@tanstack/react-query';
import {DollarSign, Gift, Loader2, Send, Sparkles, Users} from 'lucide-react';
import {toast} from 'sonner';
import {SelectedSection} from './mock';
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
  const {data: profile} = useProfile();
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
                  <p className="text-sm font-medium text-foreground truncate">
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
                  <p className="text-sm font-medium text-foreground truncate">
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

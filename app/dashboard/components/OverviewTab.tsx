'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {updateCreatorStatus} from '@/lib/server/actions/auth';
import {useUserStore} from '@/lib/store/useUserStore';
import {
  CheckCircle,
  Crown,
  DollarSign,
  Gift,
  Send,
  Sparkles,
  Users,
} from 'lucide-react';
import {toast} from 'sonner';
import {receivedGifts, SelectedSection, sentGifts} from './mock';
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
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: 'Gifts Sent',
            value: '12',
            icon: Send,
            color: 'text-primary',
          },
          {
            label: 'Gifts Received',
            value: '8',
            icon: Gift,
            color: 'text-secondary',
          },
          {
            label: 'Total Given',
            value: '$430',
            icon: DollarSign,
            color: 'text-accent',
          },
          {
            label: 'Campaigns',
            value: '3',
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
          {sentGifts.slice(0, 2).map(g => (
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
          {receivedGifts.slice(0, 2).map(g => (
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

      {!creatorEnabled && (
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

      {creatorEnabled && creatorPlan === 'free' && (
        <Card className="border-accent/30 bg-gradient-to-r from-accent/5 to-primary/5">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Crown className="w-5 h-5 text-accent" /> Upgrade to Pro
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  Remove branding and unlock powerful tools for your gift page.
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-secondary" />{' '}
                    Remove "Powered by" branding
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-secondary" />{' '}
                    Custom themes and layout
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-secondary" />{' '}
                    Advanced supporter insights
                  </li>
                </ul>
              </div>
              <Button
                variant="hero"
                size="sm"
                onClick={() => setCreatorPlan('pro')}>
                <Crown className="w-4 h-4 mr-1" /> Upgrade — $8/mo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

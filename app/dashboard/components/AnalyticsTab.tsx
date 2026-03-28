'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {useProfile} from '@/hooks/use-profile';
import {fetchCreatorAnalytics} from '@/lib/server/actions/analytics';
import {formatCurrency} from '@/lib/utils/currency';
import {cn} from '@/lib/utils';
import {useQuery} from '@tanstack/react-query';
import {BarChart3, DollarSign, Eye, Loader2, TrendingUp, Users} from 'lucide-react';
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from 'recharts';
import {DashboardStatCard} from './shared';

const chartConfig = {
  views: {
    label: 'Page Views',
    color: 'hsl(var(--primary))',
  },
  gifts: {
    label: 'Gifts Received',
    color: 'hsl(var(--secondary))',
  },
};

export function AnalyticsTab() {
  const {data: profile} = useProfile();
  const username = profile?.username;

  const {data: analyticsRes, isLoading} = useQuery({
    queryKey: ['creator-analytics', username],
    queryFn: () => (username ? fetchCreatorAnalytics({username}) : null),
    enabled: !!username,
  });

  const analytics =
    analyticsRes && 'success' in analyticsRes && analyticsRes.success
      ? (analyticsRes.data as any)
      : null;

  if (isLoading || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats - Horizontal scroll on mobile */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 hide-scrollbar">
        <div className="shrink-0 w-[160px] md:w-auto">
          <DashboardStatCard
            icon={<DollarSign className="w-5 h-5" />}
            value={formatCurrency(analytics.totalReceived, analytics.currency)}
            label="Total Received"
            color="primary"
          />
        </div>
        <div className="shrink-0 w-[160px] md:w-auto">
          <DashboardStatCard
            icon={<Users className="w-5 h-5" />}
            value={analytics.totalSupporters.toString()}
            label="Supporters"
            color="secondary"
          />
        </div>
        <div className="shrink-0 w-[160px] md:w-auto relative">
          <DashboardStatCard
            icon={<Eye className="w-5 h-5" />}
            value="0"
            label="Page Views"
            color="accent"
          />
          <span className="absolute top-2 right-2 text-[9px] bg-muted px-1.5 py-0.5 rounded uppercase font-bold text-muted-foreground">
            Soon
          </span>
        </div>
        <div className="shrink-0 w-[160px] md:w-auto relative">
          <DashboardStatCard
            icon={<TrendingUp className="w-5 h-5" />}
            value="0%"
            label="Conversion"
            color="primary"
          />
          <span className="absolute top-2 right-2 text-[9px] bg-muted px-1.5 py-0.5 rounded uppercase font-bold text-muted-foreground">
            Soon
          </span>
        </div>
      </div>

      {/* Chart */}
      <div
        className={cn(
          'p-4 rounded-xl',
          'bg-card border border-border',
        )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Last 7 Days</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            Gift Activity
          </span>
        </div>

        <div className="h-[250px] md:h-[300px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart data={analytics.chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={value => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', {
                    weekday: 'short',
                  });
                }}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                fontSize={12}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar
                dataKey="gifts"
                fill="var(--color-gifts)"
                radius={4}
                barSize={24}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}

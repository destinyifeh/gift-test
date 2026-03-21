'use client';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {useProfile} from '@/hooks/use-profile';
import {fetchCreatorAnalytics} from '@/lib/server/actions/analytics';
import {formatCurrency} from '@/lib/utils/currency';
import {useQuery} from '@tanstack/react-query';
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from 'recharts';
import {chartConfig} from './mock';

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: 'Total Received',
            value: formatCurrency(analytics.totalReceived, analytics.currency),
          },
          {label: 'Supporters', value: analytics.totalSupporters.toString()},
          {label: 'Page Views', value: '0', badge: 'Soon'},
          {label: 'Conversion', value: '0%', badge: 'Soon'},
        ].map(s => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-3 sm:p-4 text-center relative">
              {s.badge && (
                <span className="absolute top-1 right-2 text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase font-bold text-muted-foreground">
                  {s.badge}
                </span>
              )}
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-border p-4 sm:p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-base font-body flex items-center justify-between">
            Last 7 Days Gift Activity
            <span className="text-xs font-normal text-muted-foreground">
              Direct & Campaigns
            </span>
          </CardTitle>
        </CardHeader>
        <div className="h-[300px] w-full">
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
                barSize={30}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </Card>
    </div>
  );
}

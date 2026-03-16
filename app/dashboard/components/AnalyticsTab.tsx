'use client';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from 'recharts';
import {analyticsData, chartConfig} from './mock';

export function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          {label: 'Total Received', value: '$320'},
          {label: 'Supporters', value: '28'},
          {label: 'Page Views', value: '1.2k'},
          {label: 'Conversion', value: '4.2%'},
        ].map(s => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-3 sm:p-4 text-center">
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
            Last 7 Days Activity
            <span className="text-xs font-normal text-muted-foreground">
              Total Views: 1.2k
            </span>
          </CardTitle>
        </CardHeader>
        <div className="h-[300px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart data={analyticsData}>
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
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar
                dataKey="views"
                fill="var(--color-views)"
                radius={4}
                barSize={20}
              />
              <Bar
                dataKey="gifts"
                fill="var(--color-gifts)"
                radius={4}
                barSize={20}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </Card>
    </div>
  );
}

'use client';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {BarChart3, Star, TrendingUp, Zap} from 'lucide-react';

export function AnalyticsTab() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Conversion Rate',
            value: '4.2%',
            icon: TrendingUp,
            color: 'text-secondary',
          },
          {
            label: 'Avg. Gift Size',
            value: '$24.50',
            icon: BarChart3,
            color: 'text-primary',
          },
          {
            label: 'Daily Active Gifts',
            value: '1,240',
            icon: Zap,
            color: 'text-accent',
          },
          {
            label: 'Retention Rate',
            value: '88%',
            icon: Star,
            color: 'text-success',
          },
        ].map(m => (
          <Card key={m.label} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${m.color}`}>
                  <m.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">
                    {m.label}
                  </p>
                  <p className="text-xl font-bold text-foreground">{m.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Top Creators
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              {name: 'Mark Dev', amount: '$12,450', gifts: 342},
              {name: 'Sarah Blogger', amount: '$8,210', gifts: 215},
              {name: 'John Writer', amount: '$5,540', gifts: 189},
            ].map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                    #{i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold capitalize">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground font-body">
                      {c.gifts} gifts received
                    </p>
                  </div>
                </div>
                <span className="font-bold text-primary">{c.amount}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Most Gifted Pages
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              {path: '/blog/future-of-ai', views: '24k', revenue: '$1,240'},
              {path: '/docs/getting-started', views: '18k', revenue: '$980'},
              {path: '/creators/mark-dev', views: '12k', revenue: '$850'},
            ].map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border-b border-border last:border-0">
                <div className="max-w-[180px]">
                  <p className="text-sm font-semibold truncate font-mono text-foreground">
                    {p.path}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-body">
                    {p.views} views
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-secondary">{p.revenue}</p>
                  <p className="text-[10px] text-success font-semibold">
                    +12% vs last week
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

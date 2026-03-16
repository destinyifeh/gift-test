'use client';

import {Card, CardContent} from '@/components/ui/card';
import {Briefcase, Gift, TrendingUp, Users} from 'lucide-react';
import {partnerStats} from './mock';

export function OverviewTab() {
  const stats = [
    {
      label: 'Total Gifts',
      value: `$${partnerStats.totalGifts.toLocaleString()}`,
      icon: Gift,
      color: 'text-primary',
    },
    {
      label: 'Creators',
      value: partnerStats.creatorsCount.toString(),
      icon: Users,
      color: 'text-secondary',
    },
    {
      label: 'Contributors',
      value: partnerStats.contributorsCount.toString(),
      icon: Users,
      color: 'text-accent',
    },
    {
      label: 'Total Revenue',
      value: `$${partnerStats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-success',
    },
    {
      label: 'Platform Earnings',
      value: `$${partnerStats.platformEarnings.toLocaleString()}`,
      icon: Briefcase,
      color: 'text-primary',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map(s => (
        <Card key={s.label} className="border-border">
          <CardContent className="p-4 sm:p-6 text-center">
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 ${s.color}`}>
              <s.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              {s.value}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

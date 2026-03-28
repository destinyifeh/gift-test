'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {useIsMobile} from '@/hooks/use-mobile';
import {fetchAdminDashboardStats} from '@/lib/server/actions/admin';
import {cn} from '@/lib/utils';
import {useQuery} from '@tanstack/react-query';
import {
  Award,
  BarChart,
  DollarSign,
  Gift,
  Heart,
  Loader2,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import {useState} from 'react';
import {
  Bar,
  BarChart as ReBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function ReportsTab() {
  const [period, setPeriod] = useState('monthly');
  const isMobile = useIsMobile();

  const {data: stats, isLoading} = useQuery({
    queryKey: ['admin-stats', period],
    queryFn: () => fetchAdminDashboardStats(period),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Generating platform reports...</p>
      </div>
    );
  }

  const dashboardData = stats?.data || {
    totalUsers: 0,
    totalCampaigns: 0,
    totalSupport: 0,
    revenueData: [],
    topCreators: [],
    topDonors: [],
    topCampaigns: [],
  };

  const statsCards = [
    {
      label: 'Total Revenue',
      value: `$${dashboardData.totalSupport.toLocaleString()}`,
      subtitle: 'All contributions',
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Campaigns',
      value: dashboardData.totalCampaigns,
      subtitle: 'Public & Private',
      icon: Gift,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Users',
      value: dashboardData.totalUsers,
      subtitle: 'Total registered',
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      label: 'Growth',
      value: '+12.5%',
      subtitle: `From last ${period}`,
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Platform Analytics</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-28 h-9">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats - Horizontal scroll on mobile */}
      <div className="-mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide md:grid md:grid-cols-4 md:gap-4">
          {statsCards.map(m => (
            <div
              key={m.label}
              className={cn(
                'shrink-0 w-[140px] md:w-auto',
                'p-4 rounded-xl bg-card border border-border',
              )}>
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', m.bgColor)}>
                <m.icon className={cn('w-4 h-4', m.color)} />
              </div>
              <p className="text-xl md:text-2xl font-bold text-foreground">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="rounded-xl bg-card border border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Revenue Trend</h3>
        </div>
        <div className="h-[200px] md:h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={dashboardData.revenueData}>
              <XAxis
                dataKey="month"
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={value => `$${value}`}
                width={45}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                cursor={{fill: 'hsl(var(--muted)/0.2)'}}
              />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={24} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Creators */}
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">Top Creators</h3>
          </div>
          <div className="space-y-3">
            {dashboardData.topCreators.map((creator: any, i: number) => (
              <div key={creator.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{creator.name}</p>
                    <p className="text-xs text-muted-foreground">Creator</p>
                  </div>
                </div>
                <div className="text-sm font-bold text-foreground font-mono">
                  ${creator.total.toLocaleString()}
                </div>
              </div>
            ))}
            {dashboardData.topCreators.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No creator data yet.</p>
            )}
          </div>
        </div>

        {/* Top Donors */}
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-semibold text-foreground">Highest Donors</h3>
          </div>
          <div className="space-y-3">
            {dashboardData.topDonors?.map((donor: any, i: number) => (
              <div key={donor.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-xs font-bold text-rose-500">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{donor.name}</p>
                    <p className="text-xs text-muted-foreground">Contributor</p>
                  </div>
                </div>
                <div className="text-sm font-bold text-foreground font-mono">
                  ${donor.total.toLocaleString()}
                </div>
              </div>
            ))}
            {dashboardData.topDonors?.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No donor data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Campaigns */}
      <div className="rounded-xl bg-card border border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-yellow-500" />
          <h3 className="text-sm font-semibold text-foreground">Top Campaigns</h3>
        </div>
        <div className="space-y-3">
          {dashboardData.topCampaigns?.map((campaign: any, i: number) => (
            <div key={campaign.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-xs font-bold text-yellow-500 shrink-0">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <Link
                    href={campaign.slug}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate block"
                    target="_blank">
                    {campaign.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">Trending</p>
                </div>
              </div>
              <div className="text-sm font-bold text-foreground font-mono shrink-0 ml-3">
                ${campaign.total.toLocaleString()}
              </div>
            </div>
          ))}
          {dashboardData.topCampaigns?.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">No campaigns ranked yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import {Button} from '@/components/ui/button';
import {
  fetchAdminDashboardStats,
  fetchAdminLogs,
} from '@/lib/server/actions/admin';
import {cn} from '@/lib/utils';
import {useQuery} from '@tanstack/react-query';
import {
  Activity,
  ArrowRight,
  DollarSign,
  FileText,
  Loader2,
  ShieldAlert,
  Store,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {Section} from './Sidebar';

interface DashboardTabProps {
  searchQuery: string;
  setSection: (section: Section) => void;
}

export function DashboardTab({searchQuery, setSection}: DashboardTabProps) {
  const {data: statsResponse, isLoading} = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => fetchAdminDashboardStats(),
  });

  const {data: logsResponse} = useQuery({
    queryKey: ['admin-logs-recent'],
    queryFn: () => fetchAdminLogs(),
  });

  const stats = statsResponse?.data;
  const recentLogs = (logsResponse?.data || []).slice(0, 6);

  const metrics = [
    {
      label: 'Total Users',
      value: isLoading ? '—' : (stats?.totalUsers || 0).toLocaleString(),
      subtitle: 'Platform-wide',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Campaigns',
      value: isLoading ? '—' : (stats?.totalCampaigns || 0).toLocaleString(),
      subtitle: 'Running & past',
      icon: Store,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Support Vol.',
      value: isLoading
        ? '—'
        : `₦${(stats?.totalSupport || 0).toLocaleString()}`,
      subtitle: 'Processed',
      icon: DollarSign,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Flagged',
      value: '0',
      subtitle: 'Needs attention',
      icon: ShieldAlert,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
    },
  ];

  const quickActions = [
    {
      label: 'Pending Withdrawals',
      icon: DollarSign,
      section: 'withdrawals' as Section,
    },
    {
      label: 'Moderation Queue',
      icon: ShieldAlert,
      section: 'moderation' as Section,
    },
    {
      label: 'Manage Users',
      icon: Users,
      section: 'users' as Section,
    },
    {
      label: 'Vendor Review',
      icon: Store,
      section: 'vendors' as Section,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats - Horizontal scroll on mobile */}
      <div className="-mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide md:grid md:grid-cols-4 md:gap-4">
          {metrics.map(m => (
            <div
              key={m.label}
              className={cn(
                'shrink-0 w-[140px] md:w-auto',
                'p-4 rounded-xl bg-card border border-border',
              )}>
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', m.bgColor)}>
                <m.icon className={cn('w-4 h-4', m.color)} />
              </div>
              <p className="text-xl md:text-2xl font-bold text-foreground">
                {m.value}
              </p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions - Grid on mobile */}
      <div className="rounded-xl bg-card border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map(action => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto py-3 px-3 justify-start gap-2 text-left"
              onClick={() => setSection(action.section)}>
              <action.icon className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-xs font-medium truncate">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="rounded-xl bg-card border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Revenue Overview</h3>
            <p className="text-xs text-muted-foreground">Monthly revenue growth</p>
          </div>
        </div>
        <div className="h-[200px] md:h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.revenueData || []}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 11,
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 11,
                }}
                tickFormatter={value => `₦${value}`}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                itemStyle={{color: 'hsl(var(--secondary))'}}
              />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl bg-card border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 px-2"
            onClick={() => setSection('logs')}>
            View All
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
        {recentLogs.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No recent admin activity
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log: any) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground line-clamp-2">
                    {log.action}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    @{log.admin?.username || 'Unknown'} ·{' '}
                    {new Date(log.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

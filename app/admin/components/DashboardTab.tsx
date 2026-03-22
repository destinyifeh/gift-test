'use client';

import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  fetchAdminDashboardStats,
  fetchAdminLogs,
} from '@/lib/server/actions/admin';
import {useQuery} from '@tanstack/react-query';
import {
  Activity,
  DollarSign,
  FileText,
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
  const recentLogs = (logsResponse?.data || []).slice(0, 8);

  const metrics = [
    {
      label: 'Total Users',
      value: isLoading ? '...' : (stats?.totalUsers || 0).toLocaleString(),
      change: 'Platform-wide',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Total Campaigns',
      value: isLoading ? '...' : (stats?.totalCampaigns || 0).toLocaleString(),
      change: 'Running & past',
      icon: Store,
      color: 'text-emerald-500',
    },
    {
      label: 'Direct Support Vol.',
      value: isLoading
        ? '...'
        : `₦${(stats?.totalSupport || 0).toLocaleString()}`,
      change: 'Processed',
      icon: DollarSign,
      color: 'text-amber-500',
    },
    {
      label: 'Flagged Reports',
      value: '0',
      change: 'Needs attention',
      icon: ShieldAlert,
      color: 'text-rose-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(m => (
          <Card key={m.label} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <m.icon className={`w-5 h-5 ${m.color}`} />
                <span className="text-xs text-secondary font-medium">
                  {m.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Revenue Overview
            </CardTitle>
            <CardDescription>
              Monthly revenue growth for the current year
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
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
                    fontSize: 12,
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: 'hsl(var(--muted-foreground))',
                    fontSize: 12,
                  }}
                  tickFormatter={value => `₦${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  itemStyle={{color: 'hsl(var(--secondary))'}}
                />
                <Bar
                  dataKey="revenue"
                  fill="hsl(var(--secondary))"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setSection('withdrawals')}>
              <DollarSign className="w-4 h-4 mr-2" /> Pending Withdrawals
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setSection('moderation')}>
              <ShieldAlert className="w-4 h-4 mr-2" /> Moderation Queue
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setSection('users')}>
              <Users className="w-4 h-4 mr-2" /> Manage Users
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setSection('vendors')}>
              <Store className="w-4 h-4 mr-2" /> Vendor Review
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-body flex items-center gap-2">
              <Activity className="w-4 h-4 text-secondary" /> Recent Activity
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setSection('logs')}>
              View All →
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No recent admin activity recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 group">
                  <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground break-words">
                      {log.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by @{log.admin?.username || 'Unknown'} ·{' '}
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

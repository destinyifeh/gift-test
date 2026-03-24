'use client';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {fetchAdminDashboardStats} from '@/lib/server/actions/admin';
import {useQuery} from '@tanstack/react-query';
import {
  BarChart,
  DollarSign,
  Gift,
  TrendingUp,
  Users,
  Award,
  Heart,
  Star,
} from 'lucide-react';
import {useState} from 'react';
import {
  Bar,
  BarChart as ReBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Link from 'next/link';

export function ReportsTab() {
  const [period, setPeriod] = useState('monthly');

  const {data: stats, isLoading} = useQuery({
    queryKey: ['admin-stats', period],
    queryFn: () => fetchAdminDashboardStats(period),
  });

  if (isLoading) {
    return (
      <div className="text-muted-foreground p-4">
        Generating platform reports...
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Platform Analytics</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardData.totalSupport.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all contributions
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Campaigns
            </CardTitle>
            <Gift className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.totalCampaigns}
            </div>
            <p className="text-xs text-muted-foreground">Public & Private</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Platform Users
            </CardTitle>
            <Users className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">Total registered</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Growth Rate
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">From last {period}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart className="w-4 h-4" /> Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={dashboardData.revenueData}>
                  <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={value => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    cursor={{fill: 'hsl(var(--muted)/0.2)'}}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Top Performing Creators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-4">
              {dashboardData.topCreators.map((creator: any, i: number) => (
                <div key={creator.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{creator.name}</p>
                      <p className="text-xs text-muted-foreground">Content Creator</p>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    ${creator.total.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Top Donors and Top Campaigns Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" /> Highest Donors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-4">
              {dashboardData.topDonors?.map((donor: any, i: number) => (
                <div key={donor.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-xs font-bold text-rose-500">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{donor.name}</p>
                      <p className="text-xs text-muted-foreground">Power Contributor</p>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    ${donor.total.toLocaleString()}
                  </div>
                </div>
              ))}
              {dashboardData.topDonors?.length === 0 && (
                 <p className="text-sm text-muted-foreground py-4 text-center">No donation activity found yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" /> Top Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-4">
              {dashboardData.topCampaigns?.map((campaign: any, i: number) => (
                <div key={campaign.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-xs font-bold text-yellow-500 shrink-0">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <Link 
                        href={campaign.slug} 
                        className="text-sm font-medium hover:text-primary transition-colors truncate block"
                        target="_blank"
                      >
                        {campaign.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">Trending Now</p>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    ${campaign.total.toLocaleString()}
                  </div>
                </div>
              ))}
              {dashboardData.topCampaigns?.length === 0 && (
                 <p className="text-sm text-muted-foreground py-4 text-center">No active campaigns ranked.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

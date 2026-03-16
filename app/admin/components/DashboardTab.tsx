'use client';

import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Activity, DollarSign, ShieldAlert, Store, Users} from 'lucide-react';
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
  metrics: any[];
  revenueData: any[];
  recentActivity: any[];
  searchQuery: string;
  setSection: (section: Section) => void;
}

export function DashboardTab({
  metrics,
  revenueData,
  recentActivity,
  searchQuery,
  setSection,
}: DashboardTabProps) {
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
              <BarChart data={revenueData}>
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
                  tickFormatter={value => `$${value}`}
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

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-body flex items-center gap-2">
              <Activity className="w-4 h-4 text-secondary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity
              .filter(a =>
                a.text.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map(a => (
                <div key={a.id} className="flex items-start gap-3">
                  <a.icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-foreground">{a.text}</p>
                    <p className="text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

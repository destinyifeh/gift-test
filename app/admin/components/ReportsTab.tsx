'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {fetchAdminDashboardStats} from '@/lib/server/actions/admin';
import {useQuery} from '@tanstack/react-query';
import {ChevronRight, Download} from 'lucide-react';
import {handleExport} from './utils';

export function ReportsTab() {
  const {data} = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminDashboardStats,
  });

  const stats = data?.data || {
    totalSupport: 0,
    totalUsers: 0,
    totalCampaigns: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <Select defaultValue="monthly">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" /> Export Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv', 'Reports')}>
                CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {[
          {
            title: 'Revenue Report',
            items: [
              `Total Platform Volume: ₦${stats.totalSupport.toLocaleString()}`,
              'Subscription Revenue: ₦0',
            ],
          },
          {
            title: 'Gift Activity',
            items: [
              `Total Campaigns: ${stats.totalCampaigns.toLocaleString()}`,
              `Total Platform Verified Users: ${stats.totalUsers.toLocaleString()}`,
            ],
          },
          {
            title: 'Top Creators',
            items: ['No robust tracking data yet.'],
          },
          {
            title: 'Integration Performance',
            items: ['Internal Payments API connected', 'Mailers Operational'],
          },
        ].map(r => (
          <Card key={r.title} className="border-border">
            <CardHeader>
              <CardTitle className="text-base font-body">{r.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {r.items.map((item, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-primary shrink-0" />{' '}
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

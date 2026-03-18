'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {BarChart3, DollarSign, Gift, TrendingUp, Users} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface PartnerAnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: any;
}

const mockData = [
  {name: 'Week 1', gifts: 45, revenue: 450},
  {name: 'Week 2', gifts: 52, revenue: 520},
  {name: 'Week 3', gifts: 48, revenue: 480},
  {name: 'Week 4', gifts: 61, revenue: 610},
];

export function PartnerAnalyticsModal({
  open,
  onOpenChange,
  partner,
}: PartnerAnalyticsModalProps) {
  if (!partner) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="w-5 h-5 text-primary" />
            Analytics for {partner.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
          <div className="p-3 bg-muted/50 rounded-xl border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold">Users</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {partner.users.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-muted/50 rounded-xl border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Gift className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold">Gifts</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {partner.gifts.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-muted/50 rounded-xl border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold">Revenue</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              ${partner.revenue.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-muted/50 rounded-xl border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold">Growth</span>
            </div>
            <p className="text-xl font-bold text-secondary">+12.5%</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="h-[250px] w-full">
            <p className="text-sm font-semibold mb-4 text-muted-foreground">
              Weekly Gift Performance
            </p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#333"
                />
                <XAxis dataKey="name" fontSize={12} stroke="#888" />
                <YAxis fontSize={12} stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                  itemStyle={{color: '#f0f0f0'}}
                />
                <Bar dataKey="gifts" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="h-[250px] w-full">
            <p className="text-sm font-semibold mb-4 text-muted-foreground">
              Revenue Trend
            </p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#333"
                />
                <XAxis dataKey="name" fontSize={12} stroke="#888" />
                <YAxis fontSize={12} stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                  itemStyle={{color: '#f0f0f0'}}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{fill: '#10B981'}}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

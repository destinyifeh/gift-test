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
import {ChevronRight, Download} from 'lucide-react';
import {handleExport} from './utils';

interface ReportsTabProps {}

export function ReportsTab({}: ReportsTabProps) {
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
              <DropdownMenuItem
                onClick={() => handleExport('excel', 'Reports')}>
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf', 'Reports')}>
                PDF
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
              'Total Revenue: $18,300',
              'Gift Fees: $12,100',
              'Subscription Revenue: $6,200',
            ],
          },
          {
            title: 'Gift Activity',
            items: [
              'Total Gifts: 4,230',
              'Money Gifts: 3,100',
              'Vendor Gifts: 890',
              'Gift Cards: 240',
            ],
          },
          {
            title: 'Top Creators',
            items: [
              '1. Lisa K. — $1,200 received',
              '2. John D. — $500 received',
              '3. Destiny O. — $320 received',
            ],
          },
          {
            title: 'Top Campaigns',
            items: [
              '1. Gaming Setup — $450 raised',
              '2. Birthday Gift — $340 raised',
              '3. Team Fund — $200 raised',
            ],
          },
          {
            title: 'Top Vendors',
            items: [
              '1. GameVault — $7,020 revenue',
              '2. Relax Spa — $4,450 revenue',
              '3. Sweet Delights — $3,550 revenue',
            ],
          },
          {
            title: 'Integration Performance',
            items: [
              'CommunityApp: $12,400 in gifts',
              'ForumPlatform: $8,200 in gifts',
              'CreatorHub: $4,500 in gifts',
            ],
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

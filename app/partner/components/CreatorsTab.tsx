'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Eye} from 'lucide-react';
import {partnerCreators} from './mock';

export function CreatorsTab() {
  return (
    <Card className="border-border">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left p-4 font-medium">Creator Name</th>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Total Gifts</th>
                <th className="text-left p-4 font-medium">Wallet Balance</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {partnerCreators.map(c => (
                <tr
                  key={c.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-4 font-semibold text-foreground capitalize">
                    {c.name}
                  </td>
                  <td className="p-4 text-muted-foreground">{c.email}</td>
                  <td className="p-4 text-foreground font-medium">
                    ${c.totalGifts.toLocaleString()}
                  </td>
                  <td className="p-4 text-foreground font-medium">
                    ${c.walletBalance.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={c.status === 'active' ? 'secondary' : 'outline'}>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" title="View Activity">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

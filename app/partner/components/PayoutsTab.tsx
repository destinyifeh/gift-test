'use client';

import {Badge} from '@/components/ui/badge';
import {Card, CardContent} from '@/components/ui/card';
import {partnerPayouts} from './mock';

export function PayoutsTab() {
  return (
    <Card className="border-border">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left p-4 font-medium">Creator</th>
                <th className="text-left p-4 font-medium">Amount</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {partnerPayouts.map((p, idx) => (
                <tr
                  key={idx}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-4 font-semibold text-foreground">
                    {p.creator}
                  </td>
                  <td className="p-4 text-foreground font-medium">
                    ${p.amount.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        p.status === 'paid'
                          ? 'secondary'
                          : p.status === 'pending'
                            ? 'outline'
                            : 'destructive'
                      }>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right text-muted-foreground">
                    {p.date}
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

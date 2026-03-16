'use client';

import {Badge} from '@/components/ui/badge';
import {Card, CardContent} from '@/components/ui/card';
import {partnerTransactions} from './mock';

export function TransactionsTab() {
  return (
    <Card className="border-border">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left p-4 font-medium">Transaction ID</th>
                <th className="text-left p-4 font-medium">Sender</th>
                <th className="text-left p-4 font-medium">Recipient</th>
                <th className="text-left p-4 font-medium">Amount</th>
                <th className="text-left p-4 font-medium">Platform Fee</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {partnerTransactions.map(t => (
                <tr
                  key={t.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-4 font-mono text-xs text-foreground">
                    {t.id}
                  </td>
                  <td className="p-4 text-foreground">{t.sender}</td>
                  <td className="p-4 text-foreground">{t.recipient}</td>
                  <td className="p-4 text-foreground font-semibold">
                    ${t.amount}
                  </td>
                  <td className="p-4 text-secondary font-medium">
                    ${t.platformFee}
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        t.status === 'completed' ? 'secondary' : 'outline'
                      }>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right text-muted-foreground">
                    {t.date}
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

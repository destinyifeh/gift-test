'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Download} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {handleExport} from './utils';

export function SubscriptionsTab({
  searchQuery,
  addLog,
  setViewDetailsModal,
}: any) {
  const [subscriptions] = useState<any[]>([]); // Future true backend connection
  const [advancedModal, setAdvancedModal] = useState<{
    isOpen: boolean;
    type: 'cancel';
    targetId: string;
    targetName: string;
  }>({
    isOpen: false,
    type: 'cancel',
    targetId: '',
    targetName: '',
  });

  const onConfirmAdvancedAction = (data: {days?: string; reason: string}) => {
    toast.success(`Action confirmed for ${advancedModal.targetName}`);
    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  const filteredSubscriptions = subscriptions.filter(
    (s: any) =>
      s.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.plan.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {plan: 'Free', count: 0, price: '$0'},
          {plan: 'Pro (Monthly)', count: 0, price: '$8/mo'},
          {plan: 'Pro (Yearly)', count: 0, price: '$79/yr'},
          {plan: 'White-Label', count: 0, price: 'Custom'},
        ].map(p => (
          <Card key={p.plan} className="border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {p.count.toLocaleString()}
              </p>
              <p className="text-sm font-medium text-foreground">{p.plan}</p>
              <p className="text-xs text-muted-foreground">{p.price}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => handleExport('csv', 'Subscriptions')}>
              CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 font-medium">User</th>
              <th className="text-left py-2 font-medium">Plan</th>
              <th className="text-left py-2 font-medium">Price</th>
              <th className="text-left py-2 font-medium">Started</th>
              <th className="text-left py-2 font-medium pl-6">Status</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscriptions.map((s: any) => (
              <tr
                key={s.user}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="py-3 font-medium text-foreground">{s.user}</td>
                <td className="py-3 pl-6">
                  <Badge variant={s.plan === 'Pro' ? 'default' : 'outline'}>
                    {s.plan}
                  </Badge>
                </td>
                <td className="py-3 text-foreground">{s.price}</td>
                <td className="py-3 text-muted-foreground">{s.started}</td>
                <td className="py-3">
                  <Badge variant="secondary">{s.status}</Badge>
                </td>
                <td className="py-3 text-right"></td>
              </tr>
            ))}
            {filteredSubscriptions.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground">
                  No active premium subscriptions found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ActionAdvancedModal
        isOpen={advancedModal.isOpen}
        onOpenChange={open =>
          setAdvancedModal(prev => ({...prev, isOpen: open}))
        }
        type={advancedModal.type as any}
        targetType="subscription"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />
    </div>
  );
}

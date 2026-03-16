'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Download, Eye, MoreVertical, X} from 'lucide-react';
import React, {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {handleExport} from './utils';

interface SubscriptionsTabProps {
  subscriptions: any[];
  setSubscriptions: React.Dispatch<React.SetStateAction<any[]>>;
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

export function SubscriptionsTab({
  subscriptions,
  setSubscriptions,
  searchQuery,
  addLog,
  setViewDetailsModal,
}: SubscriptionsTabProps) {
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

  const handleAdvancedAction = (
    type: any,
    targetType: string,
    targetId: string,
    targetName: string,
  ) => {
    setAdvancedModal({
      isOpen: true,
      type,
      targetId,
      targetName,
    });
  };

  const onConfirmAdvancedAction = (data: {days?: string; reason: string}) => {
    const {type, targetName, targetId} = advancedModal;
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    const logMessage = `${formattedType}ed subscription for ${targetName}. Reason: ${data.reason}`;

    if (type === 'cancel') {
      setSubscriptions(prev =>
        prev.map(s => (s.user === targetId ? {...s, status: 'cancelled'} : s)),
      );
    }

    toast.success(`${formattedType} action confirmed for ${targetName}`);
    addLog(logMessage);
    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  const filteredSubscriptions = subscriptions.filter(
    s =>
      s.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.plan.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {plan: 'Free', count: 10200, price: '$0'},
          {plan: 'Pro (Monthly)', count: 1540, price: '$8/mo'},
          {plan: 'Pro (Yearly)', count: 300, price: '$79/yr'},
          {plan: 'White-Label', count: 12, price: 'Custom'},
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
            <DropdownMenuItem
              onClick={() => handleExport('excel', 'Subscriptions')}>
              Excel
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExport('pdf', 'Subscriptions')}>
              PDF
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
            {filteredSubscriptions.map(s => (
              <tr key={s.user} className="border-b border-border last:border-0">
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
                <td className="py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() =>
                          setViewDetailsModal({
                            isOpen: true,
                            title: 'Subscription Details',
                            data: s,
                          })
                        }>
                        <Eye className="w-4 h-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() =>
                          handleAdvancedAction(
                            'cancel',
                            'subscription',
                            s.user,
                            s.user,
                          )
                        }>
                        <X className="w-4 h-4 mr-2" /> Cancel Subscription
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ActionAdvancedModal
        isOpen={advancedModal.isOpen}
        onOpenChange={open =>
          setAdvancedModal(prev => ({...prev, isOpen: open}))
        }
        type={advancedModal.type}
        targetType="subscription"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />
    </div>
  );
}

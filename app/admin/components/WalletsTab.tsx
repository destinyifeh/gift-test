'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {
  fetchAdminWallets,
  updateWalletStatus,
} from '@/lib/server/actions/admin';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {Ban, Download, Eye, MoreVertical, ShieldCheck} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {handleExport, statusBadge} from './utils';

interface WalletsTabProps {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

export function WalletsTab({
  searchQuery,
  addLog,
  setViewDetailsModal,
}: WalletsTabProps) {
  const queryClient = useQueryClient();

  const {data, isLoading} = useQuery({
    queryKey: ['admin-wallets', searchQuery],
    queryFn: () => fetchAdminWallets(searchQuery),
  });

  const wallets = data?.data || [];

  const [advancedModal, setAdvancedModal] = useState<{
    isOpen: boolean;
    type: 'restrict' | 'unsuspend';
    targetId: string;
    targetName: string;
  }>({
    isOpen: false,
    type: 'restrict',
    targetId: '',
    targetName: '',
  });

  const mutation = useMutation({
    mutationFn: ({id, status}: {id: string; status: string}) =>
      updateWalletStatus(id, status),
    onSuccess: (res, vars) => {
      if (!res.success) {
        toast.error(res.error || 'Failed to update wallet state');
        return;
      }
      queryClient.invalidateQueries({queryKey: ['admin-wallets']});
      toast.success('Wallet operations updated successfully.');
      addLog(
        `${vars.status === 'restricted' ? 'Restricted' : 'Unrestricted'} wallet for @${advancedModal.targetName}`,
      );
    },
    onError: () => toast.error('System error enforcing wallet lock'),
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
    const {type, targetId} = advancedModal;
    if (type === 'restrict') {
      mutation.mutate({id: targetId, status: 'restricted'});
    } else if (type === 'unsuspend') {
      mutation.mutate({id: targetId, status: 'active'});
    }
    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  if (isLoading) {
    return (
      <div className="text-muted-foreground p-4">
        Computing user balances...
      </div>
    );
  }

  const filteredWallets = wallets.filter((w: any) =>
    (w.user || '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {filteredWallets.length} active wallets
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExport('csv', 'Wallets')}>
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
              <th className="text-right py-2 font-medium">Balance</th>
              <th className="text-right py-2 font-medium">Pending Output</th>
              <th className="text-right py-2 font-medium">Total Earned</th>
              <th className="text-right py-2 font-medium">Total Withdrawn</th>
              <th className="text-left py-2 font-medium pl-6">Status</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWallets.map((w: any) => (
              <tr
                key={w.id}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="py-3 font-medium text-foreground">@{w.user}</td>
                <td className="py-3 text-right text-foreground font-mono font-medium">
                  {getCurrencySymbol(getCurrencyByCountry(w.country))}
                  {w.balance}
                </td>
                <td className="py-3 text-right text-accent font-mono">
                  {getCurrencySymbol(getCurrencyByCountry(w.country))}
                  {w.pending}
                </td>
                <td className="py-3 text-right text-secondary font-mono">
                  {getCurrencySymbol(getCurrencyByCountry(w.country))}
                  {w.earned}
                </td>
                <td className="py-3 text-right text-muted-foreground font-mono">
                  {getCurrencySymbol(getCurrencyByCountry(w.country))}
                  {w.withdrawn}
                </td>
                <td className="py-3 pl-6">
                  <Badge
                    variant={statusBadge(w.status) as any}
                    className="capitalize">
                    {w.status}
                  </Badge>
                </td>
                <td className="py-3 text-right">
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            setViewDetailsModal({
                              isOpen: true,
                              title: 'Wallet Profile',
                              data: w,
                            })
                          }>
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>

                        {w.status === 'restricted' ? (
                          <DropdownMenuItem
                            className="text-emerald-500 focus:text-emerald-500"
                            onClick={() =>
                              handleAdvancedAction(
                                'unsuspend',
                                'wallet',
                                w.id,
                                w.user,
                              )
                            }>
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            Lift Restriction
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() =>
                              handleAdvancedAction(
                                'restrict',
                                'wallet',
                                w.id,
                                w.user,
                              )
                            }>
                            <Ban className="w-4 h-4 mr-2" />
                            Restrict Wallet
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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
        type={advancedModal.type as any}
        targetType="wallet"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />
    </div>
  );
}

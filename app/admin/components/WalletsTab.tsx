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
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {useIsMobile} from '@/hooks/use-mobile';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {
  fetchAdminWallets,
  updateWalletStatus,
} from '@/lib/server/actions/admin';
import {cn} from '@/lib/utils';
import {useInfiniteQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Ban, Download, Eye, Loader2, MoreVertical, ShieldCheck, Wallet} from 'lucide-react';
import {useEffect, useState} from 'react';
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
  const isMobile = useIsMobile();

  const {
    data: infiniteData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['admin-wallets', searchQuery],
    queryFn: ({pageParam = 0}) => fetchAdminWallets({search: searchQuery, pageParam}),
    getNextPageParam: lastPage => lastPage.nextPage,
    initialPageParam: 0,
  });

  useEffect(() => {
    const errorPage = infiniteData?.pages.find(p => p.success === false);
    if (errorPage) toast.error(errorPage.error || 'Failed to load wallets');
  }, [infiniteData]);

  const wallets = infiniteData?.pages.flatMap(page => page.data || []) || [];

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
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Computing user balances...</p>
      </div>
    );
  }

  const WalletActions = ({w}: {w: any}) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
            onClick={() => handleAdvancedAction('unsuspend', 'wallet', w.id, w.user)}>
            <ShieldCheck className="w-4 h-4 mr-2" />
            Lift Restriction
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => handleAdvancedAction('restrict', 'wallet', w.id, w.user)}>
            <Ban className="w-4 h-4 mr-2" />
            Restrict Wallet
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const getCurrency = (country: string) => getCurrencySymbol(getCurrencyByCountry(country));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {wallets.length} active wallets loaded
        </p>
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          onClick={() => handleExport('csv', 'Wallets')}>
          <Download className="w-4 h-4 mr-1.5" /> Export
        </Button>
      </div>

      {/* Mobile Card View */}
      {isMobile ? (
        <div className="space-y-2">
          {wallets.map((w: any) => (
            <div
              key={w.id}
              className={cn(
                'p-4 rounded-xl bg-card border border-border',
                'active:bg-muted/50 transition-colors',
              )}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">@{w.user}</p>
                      <Badge
                        variant={statusBadge(w.status) as any}
                        className="capitalize text-[10px]">
                        {w.status}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold font-mono text-foreground">
                      {getCurrency(w.country)}{w.balance}
                    </p>
                  </div>
                </div>
                <WalletActions w={w} />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Pending</p>
                  <p className="font-mono text-sm text-accent">
                    {getCurrency(w.country)}{w.pending}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Earned</p>
                  <p className="font-mono text-sm text-secondary">
                    {getCurrency(w.country)}{w.earned}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Withdrawn</p>
                  <p className="font-mono text-sm text-muted-foreground">
                    {getCurrency(w.country)}{w.withdrawn}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Desktop Table View */
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Balance</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Pending</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Earned</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Withdrawn</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((w: any) => (
                <tr
                  key={w.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">@{w.user}</td>
                  <td className="py-3 px-4 text-right text-foreground font-mono font-medium">
                    {getCurrency(w.country)}{w.balance}
                  </td>
                  <td className="py-3 px-4 text-right text-accent font-mono">
                    {getCurrency(w.country)}{w.pending}
                  </td>
                  <td className="py-3 px-4 text-right text-secondary font-mono">
                    {getCurrency(w.country)}{w.earned}
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground font-mono">
                    {getCurrency(w.country)}{w.withdrawn}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={statusBadge(w.status) as any} className="capitalize">
                      {w.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <WalletActions w={w} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {wallets.length === 0 && (
        <div className="text-center py-12">
          <Wallet className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No wallets found</p>
        </div>
      )}

      <InfiniteScroll
        hasMore={!!hasNextPage}
        isLoading={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />

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

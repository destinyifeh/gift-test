'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {useIsMobile} from '@/hooks/use-mobile';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {
  fetchAdminWithdrawals,
  updateTransactionStatus,
} from '@/lib/server/actions/admin';
import {cn} from '@/lib/utils';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {ArrowUpRight, CheckCircle, DollarSign, Eye, Loader2, MoreVertical, X} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {statusBadge} from './utils';

interface WithdrawalsTabProps {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

export function WithdrawalsTab({
  searchQuery,
  addLog,
  setViewDetailsModal,
}: WithdrawalsTabProps) {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const {data, isLoading} = useQuery({
    queryKey: ['admin-withdrawals', searchQuery],
    queryFn: () => fetchAdminWithdrawals({search: searchQuery}),
  });

  const withdrawals = data?.data || [];

  const [advancedModal, setAdvancedModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'pay' | 'reject';
    targetId: string;
    targetName: string;
  }>({
    isOpen: false,
    type: 'approve',
    targetId: '',
    targetName: '',
  });

  const mutation = useMutation({
    mutationFn: ({id, status}: {id: string; status: string}) =>
      updateTransactionStatus(id, status),
    onSuccess: (res, vars) => {
      if (!res.success) {
        toast.error(res.error || 'Failed to update withdrawal');
        return;
      }
      queryClient.invalidateQueries({queryKey: ['admin-withdrawals']});
      toast.success(`Withdrawal marked as ${vars.status}`);
      addLog(
        `Updated withdrawal ${vars.id.slice(0, 8)}… → status: "${vars.status}"`,
      );
    },
    onError: () => toast.error('Error updating withdrawal'),
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

    if (type === 'approve') mutation.mutate({id: targetId, status: 'approved'});
    else if (type === 'reject')
      mutation.mutate({id: targetId, status: 'failed'});
    else if (type === 'pay') mutation.mutate({id: targetId, status: 'success'});

    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  const onUpdateStatus = (
    id: string,
    status: 'approved' | 'paid' | 'rejected',
    user: string,
  ) => {
    const action =
      status === 'approved' ? 'approve' : status === 'paid' ? 'pay' : 'reject';
    handleAdvancedAction(action, 'withdrawal', id, user);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading payout queue...</p>
      </div>
    );
  }

  const filteredWithdrawals = withdrawals.filter(
    (w: any) =>
      (w.recipient_profile?.username || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      w.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const WithdrawalActions = ({w}: {w: any}) => (
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
              title: 'Payout Details',
              data: w,
            })
          }>
          <Eye className="w-4 h-4 mr-2" /> View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        {w.status === 'pending' && (
          <>
            <DropdownMenuItem
              className="text-secondary focus:text-secondary"
              onClick={() => onUpdateStatus(w.id, 'approved', w.recipient_profile?.username)}>
              <CheckCircle className="w-4 h-4 mr-2" /> Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onUpdateStatus(w.id, 'rejected', w.recipient_profile?.username)}>
              <X className="w-4 h-4 mr-2" /> Reject
            </DropdownMenuItem>
          </>
        )}

        {w.status === 'approved' && (
          <DropdownMenuItem
            className="text-primary focus:text-primary"
            onClick={() => onUpdateStatus(w.id, 'paid', w.recipient_profile?.username)}>
            <DollarSign className="w-4 h-4 mr-2" /> Mark as Paid
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const getCurrency = (country: string) => getCurrencySymbol(getCurrencyByCountry(country));
  const getDisplayStatus = (status: string) => status === 'success' ? 'paid' : status;

  return (
    <div className="space-y-4">
      {/* Header */}
      <p className="text-sm text-muted-foreground">
        {filteredWithdrawals.length} withdrawal requests
      </p>

      {/* Mobile Card View */}
      {isMobile ? (
        <div className="space-y-2">
          {filteredWithdrawals.map((w: any) => (
            <div
              key={w.id}
              className={cn(
                'p-4 rounded-xl bg-card border border-border',
                'active:bg-muted/50 transition-colors',
              )}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-5 h-5 text-rose-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">
                        @{w.recipient_profile?.username || 'Unknown'}
                      </p>
                      <Badge
                        variant={statusBadge(getDisplayStatus(w.status)) as any}
                        className="capitalize text-[10px]">
                        {getDisplayStatus(w.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {w.description || 'Bank Account'}
                    </p>
                  </div>
                </div>
                <WithdrawalActions w={w} />
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">
                    #{w.id.split('-')[0]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(w.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="font-mono font-semibold text-foreground">
                  {getCurrency(w.recipient_profile?.country)}{w.amount}
                </p>
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
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Target</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWithdrawals.map((w: any) => (
                <tr
                  key={w.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground" title={w.id}>
                    {w.id.split('-')[0]}...
                  </td>
                  <td className="py-3 px-4 font-medium text-foreground">
                    {w.recipient_profile?.username || 'Unknown'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium">
                    {getCurrency(w.recipient_profile?.country)}{w.amount}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground truncate max-w-[200px]" title={w.description}>
                    {w.description || 'Bank Account'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={statusBadge(getDisplayStatus(w.status)) as any} className="capitalize">
                      {getDisplayStatus(w.status)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {new Date(w.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <WithdrawalActions w={w} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredWithdrawals.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No withdrawal requests</p>
        </div>
      )}

      <ActionAdvancedModal
        isOpen={advancedModal.isOpen}
        onOpenChange={open =>
          setAdvancedModal(prev => ({...prev, isOpen: open}))
        }
        type={advancedModal.type as any}
        targetType="withdrawal"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />
    </div>
  );
}

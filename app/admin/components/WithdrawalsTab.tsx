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
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {
  fetchAdminWithdrawals,
  updateTransactionStatus,
} from '@/lib/server/actions/admin';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {CheckCircle, DollarSign, Eye, MoreVertical, X} from 'lucide-react';
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

  const {data, isLoading} = useQuery({
    queryKey: ['admin-withdrawals', searchQuery],
    queryFn: () => fetchAdminWithdrawals(searchQuery),
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
      <div className="text-muted-foreground p-4">Loading payout queue...</div>
    );
  }

  const filteredWithdrawals = withdrawals.filter(
    (w: any) =>
      (w.recipient_profile?.username || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      w.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        {filteredWithdrawals.length} withdrawal requests
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 font-medium">ID</th>
              <th className="text-left py-2 font-medium">User</th>
              <th className="text-right py-2 font-medium pr-8">Amount</th>
              <th className="text-left py-2 font-medium">Target</th>
              <th className="text-left py-2 font-medium pl-6">Status</th>
              <th className="text-left py-2 font-medium">Date requested</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWithdrawals.map((w: any) => (
              <tr
                key={w.id}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td
                  className="py-3 font-mono text-xs text-muted-foreground"
                  title={w.id}>
                  {w.id.split('-')[0]}...
                </td>
                <td className="py-3 font-medium text-foreground">
                  {w.recipient_profile?.username || 'Unknown User'}
                </td>
                <td className="py-3 text-right text-foreground pr-8 font-mono">
                  {getCurrencySymbol(
                    getCurrencyByCountry(w.recipient_profile?.country),
                  )}
                  {w.amount}{' '}
                  <span className="text-muted-foreground text-xs">
                    {w.currency}
                  </span>
                </td>
                <td
                  className="py-3 text-muted-foreground truncate max-w-[200px]"
                  title={w.description}>
                  {w.description || 'Bank Account'}
                </td>
                <td className="py-3 pl-6">
                  <Badge
                    variant={
                      statusBadge(
                        w.status === 'success' ? 'paid' : w.status,
                      ) as any
                    }
                    className="capitalize">
                    {w.status === 'success' ? 'paid' : w.status}
                  </Badge>
                </td>
                <td className="py-3 text-muted-foreground">
                  {new Date(w.created_at).toLocaleDateString()}
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
                              onClick={() =>
                                onUpdateStatus(
                                  w.id,
                                  'approved',
                                  w.recipient_profile?.username,
                                )
                              }>
                              <CheckCircle className="w-4 h-4 mr-2" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() =>
                                onUpdateStatus(
                                  w.id,
                                  'rejected',
                                  w.recipient_profile?.username,
                                )
                              }>
                              <X className="w-4 h-4 mr-2" /> Reject
                            </DropdownMenuItem>
                          </>
                        )}

                        {w.status === 'approved' && (
                          <DropdownMenuItem
                            className="text-primary focus:text-primary"
                            onClick={() =>
                              onUpdateStatus(
                                w.id,
                                'paid',
                                w.recipient_profile?.username,
                              )
                            }>
                            <DollarSign className="w-4 h-4 mr-2" /> Mark as Paid
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
        targetType="withdrawal"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />
    </div>
  );
}

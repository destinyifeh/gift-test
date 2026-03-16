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
import {CheckCircle, DollarSign, Eye, MoreVertical, X} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {mockWithdrawals} from './mock';
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
  const [withdrawals, setWithdrawals] = useState(mockWithdrawals);
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
    const logMessage = `${formattedType}ed withdrawal for ${targetName}. Reason: ${data.reason}`;

    const newStatus =
      type === 'reject'
        ? 'rejected'
        : type === 'approve'
          ? 'approved'
          : type === 'pay'
            ? 'paid'
            : null;

    if (newStatus) {
      setWithdrawals(prev =>
        prev.map(w =>
          w.id === targetId ? {...w, status: newStatus as any} : w,
        ),
      );
    }

    toast.success(`${formattedType} action confirmed for ${targetName}`);
    addLog(logMessage);
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
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        {withdrawals.length} withdrawal requests
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 font-medium">ID</th>
              <th className="text-left py-2 font-medium">User</th>
              <th className="text-right py-2 font-medium pr-8">Amount</th>
              <th className="text-left py-2 font-medium">Bank</th>
              <th className="text-left py-2 font-medium pl-6">Status</th>
              <th className="text-left py-2 font-medium">Date</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals
              .filter(
                w =>
                  w.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  w.user.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map(w => (
                <tr key={w.id} className="border-b border-border last:border-0">
                  <td className="py-3 font-mono text-xs text-muted-foreground">
                    {w.id}
                  </td>
                  <td className="py-3 font-medium text-foreground">{w.user}</td>
                  <td className="py-3 text-right text-foreground pr-8">
                    ${w.amount}
                  </td>
                  <td className="py-3 text-muted-foreground">{w.bank}</td>
                  <td className="py-3 pl-6">
                    <Badge variant={statusBadge(w.status) as any}>
                      {w.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-muted-foreground">{w.date}</td>
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
                                title: 'Withdrawal Details',
                                data: w,
                              })
                            }>
                            <Eye className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />

                          {(w.status === 'pending' ||
                            w.status === 'rejected') && (
                            <DropdownMenuItem
                              className="text-secondary focus:text-secondary"
                              onClick={() =>
                                onUpdateStatus(w.id, 'approved', w.user)
                              }>
                              <CheckCircle className="w-4 h-4 mr-2" /> Approve
                            </DropdownMenuItem>
                          )}

                          {w.status === 'approved' && (
                            <DropdownMenuItem
                              className="text-primary focus:text-primary"
                              onClick={() =>
                                onUpdateStatus(w.id, 'paid', w.user)
                              }>
                              <DollarSign className="w-4 h-4 mr-2" /> Mark as
                              Paid
                            </DropdownMenuItem>
                          )}

                          {w.status === 'pending' && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() =>
                                onUpdateStatus(w.id, 'rejected', w.user)
                              }>
                              <X className="w-4 h-4 mr-2" /> Reject
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
        type={advancedModal.type}
        targetType="withdrawal"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />
    </div>
  );
}

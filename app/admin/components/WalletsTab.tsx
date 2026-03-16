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
import {Ban, Download, Eye, MoreVertical} from 'lucide-react';
import React, {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {handleExport, statusBadge} from './utils';

interface WalletsTabProps {
  wallets: any[];
  setWallets: React.Dispatch<React.SetStateAction<any[]>>;
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

export function WalletsTab({
  wallets,
  setWallets,
  searchQuery,
  addLog,
  setViewDetailsModal,
}: WalletsTabProps) {
  const [advancedModal, setAdvancedModal] = useState<{
    isOpen: boolean;
    type: 'restrict' | 'unsuspend';
    targetName: string;
  }>({
    isOpen: false,
    type: 'restrict',
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
      targetName,
    });
  };

  const onConfirmAdvancedAction = (data: {days?: string; reason: string}) => {
    const {type, targetName} = advancedModal;
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    const logMessage = `${formattedType}ed wallet for ${targetName}. Reason: ${data.reason}`;

    if (type === 'restrict') {
      setWallets(prev =>
        prev.map(w =>
          w.user === targetName ? {...w, status: 'restricted'} : w,
        ),
      );
    } else if (type === 'unsuspend') {
      setWallets(prev =>
        prev.map(w => (w.user === targetName ? {...w, status: 'active'} : w)),
      );
    }

    toast.success(`${formattedType} action confirmed for ${targetName}`);
    addLog(logMessage);
    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  const onToggleRestriction = (userName: string, status: string) => {
    const action = status === 'active' ? 'restrict' : 'unsuspend';
    handleAdvancedAction(action, 'wallet', userName, userName);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{wallets.length} wallets</p>
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
            <DropdownMenuItem onClick={() => handleExport('excel', 'Wallets')}>
              Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf', 'Wallets')}>
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
              <th className="text-right py-2 font-medium">Balance</th>
              <th className="text-right py-2 font-medium">Pending</th>
              <th className="text-right py-2 font-medium">Total Earned</th>
              <th className="text-right py-2 font-medium">Withdrawn</th>
              <th className="text-left py-2 font-medium pl-6">Status</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {wallets
              .filter(w =>
                w.user.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map(w => (
                <tr
                  key={w.user}
                  className="border-b border-border last:border-0">
                  <td className="py-3 font-medium text-foreground">{w.user}</td>
                  <td className="py-3 text-right text-foreground">
                    ${w.balance}
                  </td>
                  <td className="py-3 text-right text-accent">${w.pending}</td>
                  <td className="py-3 text-right text-secondary">
                    ${w.earned}
                  </td>
                  <td className="py-3 text-right text-muted-foreground">
                    ${w.withdrawn}
                  </td>
                  <td className="py-3 pl-6">
                    <Badge variant={statusBadge(w.status) as any}>
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
                                title: 'Wallet Details',
                                data: w,
                              })
                            }>
                            <Eye className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              onToggleRestriction(w.user, w.status)
                            }>
                            <Ban className="w-4 h-4 mr-2" />
                            {w.status === 'active'
                              ? 'Restrict Wallet'
                              : 'Unrestrict Wallet'}
                          </DropdownMenuItem>
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
        targetType="wallet"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />
    </div>
  );
}

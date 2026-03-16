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
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  Download,
  Eye,
  MoreVertical,
  Pause,
} from 'lucide-react';
import React, {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {handleExport, statusBadge} from './utils';

interface UsersTabProps {
  users: any[];
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

export function UsersTab({
  users,
  setUsers,
  searchQuery,
  addLog,
  setViewDetailsModal,
}: UsersTabProps) {
  const [advancedModal, setAdvancedModal] = useState<{
    isOpen: boolean;
    type: 'warn' | 'suspend' | 'ban' | 'activate';
    targetId: string;
    targetName: string;
  }>({
    isOpen: false,
    type: 'warn',
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
    const logMessage = `${formattedType}ed user ${targetName}. Reason: ${data.reason}${data.days ? ` (${data.days} days)` : ''}`;

    if (type === 'suspend' || type === 'ban') {
      setUsers(prev =>
        prev.map(u => (u.id === targetId ? {...u, status: 'suspended'} : u)),
      );
    } else if (type === 'activate') {
      setUsers(prev =>
        prev.map(u => (u.id === targetId ? {...u, status: 'active'} : u)),
      );
    }

    toast.success(`${formattedType} action confirmed for ${targetName}`);
    addLog(logMessage);
    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  const onToggleStatus = (id: string, currentStatus: string, name: string) => {
    const action = currentStatus === 'active' ? 'suspend' : 'activate';
    handleAdvancedAction(action, 'user', id, name);
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{users.length} users</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExport('csv', 'Users')}>
              CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel', 'Users')}>
              Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf', 'Users')}>
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
              <th className="text-left py-2 font-medium">Role</th>
              <th className="text-right py-2 font-medium">Balance</th>
              <th className="text-right py-2 font-medium">Received</th>
              <th className="text-right py-2 font-medium">Sent</th>
              <th className="text-left py-2 font-medium pl-6">Status</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter(
                u =>
                  u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.username
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  u.email.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map(u => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="py-3">
                    <div>
                      <p className="font-medium text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground">
                        @{u.username} · {u.email}
                      </p>
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge variant="outline" className="text-xs">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="py-3 text-right text-foreground">
                    ${u.balance}
                  </td>
                  <td className="py-3 text-right text-secondary pr-4">
                    ${u.received}
                  </td>
                  <td className="py-3 text-right text-primary pr-6">
                    ${u.sent}
                  </td>
                  <td className="py-3 pl-6">
                    <Badge variant={statusBadge(u.status) as any}>
                      {u.status}
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
                                title: 'User Details',
                                data: u,
                              })
                            }>
                            <Eye className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleAdvancedAction('warn', 'user', u.id, u.name)
                            }>
                            <AlertTriangle className="w-4 h-4 mr-2" /> Warn User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              u.status === 'suspended'
                                ? onToggleStatus(u.id, u.status, u.name)
                                : handleAdvancedAction(
                                    'suspend',
                                    'user',
                                    u.id,
                                    u.name,
                                  )
                            }>
                            {u.status === 'suspended' ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />{' '}
                                Activate Account
                              </>
                            ) : (
                              <>
                                <Pause className="w-4 h-4 mr-2" /> Suspend
                                (Timed)
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() =>
                              handleAdvancedAction('ban', 'user', u.id, u.name)
                            }>
                            <Ban className="w-4 h-4 mr-2" /> Ban User
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
        targetType="user"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />
    </div>
  );
}

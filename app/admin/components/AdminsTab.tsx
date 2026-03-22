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
  fetchAdminUsers,
  updateUserRole,
  updateUserSystemStatus,
} from '@/lib/server/actions/admin';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  AlertTriangle,
  Ban,
  Download,
  Eye,
  MoreVertical,
  Pause,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {ManageRolesModal} from './ManageRolesModal';
import {handleExport, statusBadge} from './utils';

export function AdminsTab({searchQuery, addLog, setViewDetailsModal}: any) {
  const queryClient = useQueryClient();

  const {data, isLoading} = useQuery({
    queryKey: ['admin-users', searchQuery],
    queryFn: () => fetchAdminUsers(searchQuery),
  });

  const users = data?.data || [];

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

  const [manageRolesModal, setManageRolesModal] = useState<{
    isOpen: boolean;
    user: any;
  }>({
    isOpen: false,
    user: null,
  });

  const roleMutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: (result, vars) => {
      if (!result.success) {
        toast.error(result.error || 'Failed to update roles');
        return;
      }
      toast.success('User roles updated!');
      queryClient.invalidateQueries({queryKey: ['admin-users']});
      const targetUser = manageRolesModal.user;
      const roleList = vars.roles.join(', ');
      const adminSub = vars.adminRole
        ? ` (admin sub-role: ${vars.adminRole})`
        : '';
      addLog(
        `Updated roles for @${targetUser?.username || 'unknown'} → [${roleList}]${adminSub}`,
      );
      setManageRolesModal({isOpen: false, user: null});
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update roles');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({id, updates}: {id: string; updates: any}) =>
      updateUserSystemStatus(id, updates),
    onSuccess: (res, vars) => {
      if (!res.success) throw new Error(res.error);
      queryClient.invalidateQueries({queryKey: ['admin-users']});
      toast.success('User system status updated');
      addLog(
        `Changed status of user ${vars.id.slice(0, 8)}… to "${vars.updates.status}"`,
      );
    },
    onError: () => toast.error('Failed to change user access'),
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

    if (type === 'warn') {
      toast.error('User formally warned.');
    } else if (type === 'suspend') {
      const end = data.days
        ? new Date(Date.now() + parseInt(data.days) * 86400000).toISOString()
        : null;
      statusMutation.mutate({
        id: targetId,
        updates: {status: 'suspended', suspension_end: end},
      });
    } else if (type === 'ban') {
      statusMutation.mutate({id: targetId, updates: {status: 'banned'}});
    } else if (type === 'activate') {
      statusMutation.mutate({
        id: targetId,
        updates: {status: 'active', suspension_end: null},
      });
    }

    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  if (isLoading) {
    return (
      <div className="text-muted-foreground p-4">Loading user directory...</div>
    );
  }

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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 font-medium">User</th>
              <th className="text-left py-2 font-medium">Roles</th>
              <th className="text-left py-2 font-medium pl-6">Status</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr
                key={u.id}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    {u.avatar_url ? (
                      <img
                        src={u.avatar_url}
                        alt=""
                        className="w-8 h-8 rounded-full bg-muted object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {(u.display_name || u.username)
                          ?.charAt(0)
                          .toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">
                        {u.display_name || 'No Name'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{u.username} · {u.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.roles?.map((role: string) => (
                      <Badge
                        key={role}
                        variant="secondary"
                        className="text-[10px] capitalize">
                        {role}
                        {role === 'admin' && u.admin_role
                          ? ` (${u.admin_role})`
                          : ''}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="py-3 pl-6">
                  <Badge
                    variant={statusBadge(u.status || 'active') as any}
                    className="capitalize">
                    {u.status || 'active'}
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
                        <DropdownMenuItem
                          onClick={() =>
                            setManageRolesModal({isOpen: true, user: u})
                          }>
                          <ShieldAlert className="w-4 h-4 mr-2" /> Manage Roles
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />

                        {u.status === 'banned' || u.status === 'suspended' ? (
                          <DropdownMenuItem
                            className="text-emerald-500 focus:text-emerald-500"
                            onClick={() =>
                              handleAdvancedAction(
                                'activate',
                                'user',
                                u.id,
                                u.username,
                              )
                            }>
                            <RotateCcw className="w-4 h-4 mr-2" /> Restore
                            Access
                          </DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleAdvancedAction(
                                  'warn',
                                  'user',
                                  u.id,
                                  u.username,
                                )
                              }>
                              <AlertTriangle className="w-4 h-4 mr-2" /> Warn
                              User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleAdvancedAction(
                                  'suspend',
                                  'user',
                                  u.id,
                                  u.username,
                                )
                              }>
                              <Pause className="w-4 h-4 mr-2" /> Suspend
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() =>
                                handleAdvancedAction(
                                  'ban',
                                  'user',
                                  u.id,
                                  u.username,
                                )
                              }>
                              <Ban className="w-4 h-4 mr-2" /> Ban User
                            </DropdownMenuItem>
                          </>
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
        targetType="user"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />

      <ManageRolesModal
        isOpen={manageRolesModal.isOpen}
        user={manageRolesModal.user}
        onOpenChange={open =>
          setManageRolesModal(prev => ({...prev, isOpen: open}))
        }
        onSave={(roles, adminRole) => {
          if (!manageRolesModal.user) return;
          roleMutation.mutate({
            userId: manageRolesModal.user.id,
            roles,
            adminRole,
          });
        }}
        isLoading={roleMutation.isPending}
      />
    </div>
  );
}

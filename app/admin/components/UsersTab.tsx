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
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {useIsMobile} from '@/hooks/use-mobile';
import {
  fetchAdminUsers,
  updateUserSystemStatus,
} from '@/lib/server/actions/admin';
import {cn} from '@/lib/utils';
import {useInfiniteQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
  AlertTriangle,
  Ban,
  Download,
  Eye,
  Loader2,
  MoreVertical,
  Pause,
  RotateCcw,
  Users,
} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {statusBadge, handleExport} from './utils';

interface UsersTabProps {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

export function UsersTab({
  searchQuery,
  addLog,
  setViewDetailsModal,
}: UsersTabProps) {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const {
    data: infiniteData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['admin-all-users', searchQuery],
    queryFn: ({pageParam = 0}) => fetchAdminUsers({search: searchQuery, pageParam}),
    getNextPageParam: lastPage => lastPage.nextPage,
    initialPageParam: 0,
  });

  const users = infiniteData?.pages.flatMap(page => page.data || []) || [];

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

  const mutation = useMutation({
    mutationFn: ({id, updates}: {id: string; updates: any}) =>
      updateUserSystemStatus(id, updates),
    onSuccess: (res, vars) => {
      if (!res.success) {
        toast.error(res.error || 'Failed to update user status');
        return;
      }
      queryClient.invalidateQueries({queryKey: ['admin-all-users']});
      toast.success('User access level updated globally.');
      addLog(
        `Updated system status for @${advancedModal.targetName} → "${vars.updates.status || 'warned'}"`,
      );
    },
    onError: () => toast.error('System error enforcing penalty'),
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
      toast.error('User formally warned via platform notification.');
    } else if (type === 'suspend') {
      const end = data.days
        ? new Date(Date.now() + parseInt(data.days) * 86400000).toISOString()
        : null;
      mutation.mutate({
        id: targetId,
        updates: {status: 'suspended', suspension_end: end},
      });
    } else if (type === 'ban') {
      mutation.mutate({id: targetId, updates: {status: 'banned'}});
    } else if (type === 'activate') {
      mutation.mutate({
        id: targetId,
        updates: {status: 'active', suspension_end: null},
      });
    }

    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  const UserActions = ({u}: {u: any}) => (
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
              title: 'User Details',
              data: u,
            })
          }>
          <Eye className="w-4 h-4 mr-2" /> View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        {u.status === 'banned' || u.status === 'suspended' ? (
          <DropdownMenuItem
            className="text-emerald-500 focus:text-emerald-500"
            onClick={() =>
              handleAdvancedAction('activate', 'user', u.id, u.username)
            }>
            <RotateCcw className="w-4 h-4 mr-2" /> Restore Access
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem
              onClick={() =>
                handleAdvancedAction('warn', 'user', u.id, u.username)
              }>
              <AlertTriangle className="w-4 h-4 mr-2" /> Warn User
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                handleAdvancedAction('suspend', 'user', u.id, u.username)
              }>
              <Pause className="w-4 h-4 mr-2" /> Suspend
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() =>
                handleAdvancedAction('ban', 'user', u.id, u.username)
              }>
              <Ban className="w-4 h-4 mr-2" /> Ban User
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{users.length} users loaded</p>
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          onClick={() => handleExport('csv', 'Users')}>
          <Download className="w-4 h-4 mr-1.5" /> Export
        </Button>
      </div>

      {/* Mobile Card View */}
      {isMobile ? (
        <div className="space-y-2">
          {users.map((u: any) => (
            <div
              key={u.id}
              className={cn(
                'p-4 rounded-xl bg-card border border-border',
                'active:bg-muted/50 transition-colors',
              )}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground capitalize truncate">
                      {u.display_name || u.username}
                    </p>
                    <Badge
                      variant={statusBadge(u.status || 'active') as any}
                      className="capitalize text-[10px]">
                      {u.status || 'active'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    @{u.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {u.email}
                  </p>
                </div>
                <UserActions u={u} />
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                <div className="flex gap-1 flex-wrap flex-1">
                  {u.roles?.map((r: string) => (
                    <Badge
                      key={r}
                      variant="outline"
                      className="text-[10px] capitalize">
                      {r}
                    </Badge>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {u.created_at
                    ? new Date(u.created_at).toLocaleDateString()
                    : '—'}
                </span>
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
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Roles</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Joined</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr
                  key={u.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <p className="font-medium text-foreground capitalize">
                        {u.display_name || u.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{u.username} · {u.email}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 flex-wrap">
                      {u.roles?.map((r: string) => (
                        <Badge
                          key={r}
                          variant="outline"
                          className="text-[10px] capitalize">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={statusBadge(u.status || 'active') as any}
                      className="capitalize">
                      {u.status || 'active'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <UserActions u={u} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {users.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No users found</p>
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
        type={advancedModal.type}
        targetType="user"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />
    </div>
  );
}

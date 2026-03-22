'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {
  fetchAdminModerationQueue,
  resolveModerationTicket,
} from '@/lib/server/actions/admin';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {AlertOctagon, CheckCircle2, XCircle} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';

export function ModerationTab({addLog}: any) {
  const queryClient = useQueryClient();

  const {data, isLoading} = useQuery({
    queryKey: ['admin-moderation'],
    queryFn: () => fetchAdminModerationQueue(),
  });

  const moderationQueue = data?.data || [];

  const [advancedModal, setAdvancedModal] = useState<{
    isOpen: boolean;
    type: 'resolve' | 'dismiss' | 'suspend';
    targetId: string;
    targetName: string;
  }>({
    isOpen: false,
    type: 'resolve',
    targetId: '',
    targetName: '',
  });

  const mutation = useMutation({
    mutationFn: ({id, updates}: {id: string; updates: any}) =>
      resolveModerationTicket(id, updates),
    onSuccess: (res, vars) => {
      if (!res.success) {
        toast.error(res.error || 'Failed to update ticket');
        return;
      }
      queryClient.invalidateQueries({queryKey: ['admin-moderation']});
      toast.success('Moderation ticket processed successfully.');
      addLog(
        `Resolved moderation ticket ${vars.id.slice(0, 8)}… → "${vars.updates.status}"`,
      );
    },
    onError: () => toast.error('System error processing ticket'),
  });

  const onConfirmAdvancedAction = (data: {days?: string; reason: string}) => {
    const {type, targetId} = advancedModal;
    if (type === 'resolve') {
      mutation.mutate({
        id: targetId,
        updates: {status: 'resolved', resolution_notes: data.reason},
      });
    } else if (type === 'dismiss') {
      mutation.mutate({
        id: targetId,
        updates: {status: 'dismissed', resolution_notes: data.reason},
      });
    } else if (type === 'suspend') {
      mutation.mutate({
        id: targetId,
        updates: {
          status: 'resolved',
          resolution_notes: 'Enforced suspension. ' + data.reason,
        },
      });
      toast.info(
        'Ticket resolved. Please navigate to the Users tab to officially suspend the account.',
      );
    }
    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  const onResolve = (
    id: string,
    action: 'dismiss' | 'resolve' | 'suspend',
    itemName: string,
  ) => {
    setAdvancedModal({
      isOpen: true,
      type: action,
      targetId: id,
      targetName: itemName,
    });
  };

  if (isLoading) {
    return (
      <div className="text-muted-foreground p-4">Loading active tickets...</div>
    );
  }

  const activeTickets = moderationQueue.filter(
    (m: any) => m.status === 'pending',
  );

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        {activeTickets.length} items requiring review
      </p>

      {activeTickets.length === 0 && (
        <div className="p-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">All Clear!</h3>
          <p className="text-sm text-muted-foreground">
            The moderation queue is completely clean.
          </p>
        </div>
      )}

      {activeTickets.map((m: any) => (
        <Card
          key={m.id}
          className="border-border border-l-4 border-l-destructive/50 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="destructive"
                    className="text-[10px] uppercase">
                    {m.target_type}
                  </Badge>
                  <p className="font-semibold text-foreground text-sm flex items-center gap-1">
                    <AlertOctagon className="w-4 h-4 text-destructive" />
                    Target ID: {m.target_id.split('-')[0]}...
                  </p>
                </div>
                <p className="text-sm text-foreground mt-2 bg-muted/50 p-3 rounded-md border border-border">
                  "{m.reason}"
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <p className="text-xs text-muted-foreground font-medium">
                    Reported by: @{m.reporter_profile?.username || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-2 min-w-[120px]">
                <Button
                  size="sm"
                  variant="default"
                  className="w-full text-xs"
                  onClick={() => onResolve(m.id, 'resolve', m.target_id)}>
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Resolve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => onResolve(m.id, 'dismiss', m.target_id)}>
                  <XCircle className="w-3 h-3 mr-1" /> Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <ActionAdvancedModal
        isOpen={advancedModal.isOpen}
        onOpenChange={open =>
          setAdvancedModal(prev => ({...prev, isOpen: open}))
        }
        type={advancedModal.type as any}
        targetType="moderation"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />
    </div>
  );
}

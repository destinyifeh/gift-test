'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {useIsMobile} from '@/hooks/use-mobile';
import {
  fetchAdminModerationQueue,
  resolveModerationTicket,
} from '@/lib/server/actions/admin';
import {cn} from '@/lib/utils';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {AlertOctagon, CheckCircle2, Loader2, Shield, XCircle} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';

export function ModerationTab({addLog}: any) {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

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
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading active tickets...</p>
      </div>
    );
  }

  const activeTickets = moderationQueue.filter(
    (m: any) => m.status === 'pending',
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <p className="text-sm text-muted-foreground">
        {activeTickets.length} items requiring review
      </p>

      {activeTickets.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500/30 mb-3" />
          <h3 className="text-base font-medium text-foreground">All Clear!</h3>
          <p className="text-sm text-muted-foreground mt-1">
            The moderation queue is completely clean.
          </p>
        </div>
      )}

      {/* Tickets List */}
      <div className="space-y-2">
        {activeTickets.map((m: any) => (
          <div
            key={m.id}
            className={cn(
              'p-4 rounded-xl bg-card border border-border',
              'border-l-4 border-l-destructive/50',
            )}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="destructive" className="text-[10px] uppercase">
                    {m.target_type}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    #{m.target_id.split('-')[0]}
                  </span>
                </div>
                <p className="text-sm text-foreground mt-2 bg-muted/50 p-3 rounded-lg border border-border">
                  "{m.reason}"
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <p className="text-xs text-muted-foreground">
                    by @{m.reporter_profile?.username || 'Unknown'}
                  </p>
                  <span className="text-xs text-muted-foreground">•</span>
                  <p className="text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button
                size="sm"
                variant="default"
                className="flex-1 h-10"
                onClick={() => onResolve(m.id, 'resolve', m.target_id)}>
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Resolve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-10"
                onClick={() => onResolve(m.id, 'dismiss', m.target_id)}>
                <XCircle className="w-4 h-4 mr-1.5" /> Dismiss
              </Button>
            </div>
          </div>
        ))}
      </div>

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

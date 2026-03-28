'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {useIsMobile} from '@/hooks/use-mobile';
import {deleteAdminLog, fetchAdminLogs} from '@/lib/server/actions/admin';
import {cn} from '@/lib/utils';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {Download, FileText, Loader2, RefreshCw, Trash2} from 'lucide-react';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {handleExport} from './utils';

export function LogsTab() {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const {data, isLoading, refetch} = useQuery({
    queryKey: ['admin-logs'],
    queryFn: () => fetchAdminLogs(),
  });

  const dbLogs = data?.data || [];

  // Also capture real-time logs from current session
  const [sessionLogs, setSessionLogs] = useState<any[]>([]);

  useEffect(() => {
    const handleNewLog = (e: any) => {
      const action = e.detail;
      const newLog = {
        id: `session-${Date.now()}`,
        action,
        admin: {username: 'You', display_name: 'Current Session'},
        created_at: new Date().toISOString(),
        _isSession: true,
      };
      setSessionLogs(prev => [newLog, ...prev]);
    };

    window.addEventListener('admin-log', handleNewLog);
    return () => window.removeEventListener('admin-log', handleNewLog);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: (logId: string) => deleteAdminLog(logId),
    onSuccess: (res, logId) => {
      if (!res.success) {
        toast.error(res.error || 'Failed to delete log');
        return;
      }
      queryClient.invalidateQueries({queryKey: ['admin-logs']});
      // Also remove from session logs if it was there
      setSessionLogs(prev => prev.filter(l => l.id !== logId));
      toast.success('Log entry deleted');
    },
    onError: () => toast.error('Error deleting log entry'),
  });

  // Merge: show session logs on top, then DB logs
  const sessionActions = new Set(sessionLogs.map(l => l.action + l.created_at));
  const mergedLogs = [
    ...sessionLogs,
    ...dbLogs.filter((l: any) => !sessionActions.has(l.action + l.created_at)),
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading audit trail...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">{mergedLogs.length} audit logs</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => {
              refetch();
              setSessionLogs([]);
            }}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> {!isMobile && 'Refresh'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => {
              handleExport('csv', 'AuditLogs');
              toast.success('Logs exported successfully');
            }}>
            <Download className="w-4 h-4 mr-1.5" /> Export
          </Button>
        </div>
      </div>

      {mergedLogs.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <FileText className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <h3 className="text-base font-medium text-foreground">No Audit Logs Yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Actions performed in the admin portal will be recorded here.
          </p>
        </div>
      )}

      {/* Logs List */}
      <div className="space-y-2">
        {mergedLogs.map((l: any) => (
          <div
            key={l.id}
            className={cn(
              'p-4 rounded-xl bg-card border border-border group',
              'active:bg-muted/50 transition-colors',
            )}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground break-words line-clamp-2">
                  {l.action}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <p className="text-xs text-muted-foreground">
                    by @{l.admin?.username || 'Unknown'}
                  </p>
                  {l._isSession && (
                    <Badge variant="outline" className="text-[9px] py-0 px-1">
                      Live
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {l.created_at ? new Date(l.created_at).toLocaleString() : 'Just now'}
                  </span>
                </div>
              </div>
              {!l._isSession && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'text-destructive hover:text-destructive h-8 w-8 p-0 shrink-0',
                    !isMobile && 'opacity-0 group-hover:opacity-100 transition-opacity',
                  )}
                  onClick={() => deleteMutation.mutate(l.id)}
                  disabled={deleteMutation.isPending}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

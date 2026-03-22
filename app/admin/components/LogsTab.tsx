'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {deleteAdminLog, fetchAdminLogs} from '@/lib/server/actions/admin';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {Download, FileText, RefreshCw, Trash2} from 'lucide-react';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {handleExport} from './utils';

export function LogsTab() {
  const queryClient = useQueryClient();

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
      <div className="text-muted-foreground p-4">Loading audit trail...</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{mergedLogs.length} audit logs</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch();
              setSessionLogs([]);
            }}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleExport('csv', 'AuditLogs');
              toast.success('Logs exported successfully');
            }}>
            <Download className="w-4 h-4 mr-1" /> Export Logs
          </Button>
        </div>
      </div>

      {mergedLogs.length === 0 && (
        <div className="p-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-xl">
          <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">
            No Audit Logs Yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Actions performed in the admin portal will be recorded here.
          </p>
        </div>
      )}

      {mergedLogs.map((l: any) => (
        <Card key={l.id} className="border-border group">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-foreground break-words">
                  {l.action}
                </p>
                <p className="text-xs text-muted-foreground">
                  by @{l.admin?.username || 'Unknown'}
                  {l._isSession && (
                    <Badge
                      variant="outline"
                      className="ml-2 text-[9px] py-0 px-1">
                      Live
                    </Badge>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4">
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                {l.created_at
                  ? new Date(l.created_at).toLocaleString()
                  : 'Just now'}
              </p>
              {!l._isSession && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive h-7 w-7 p-0"
                  onClick={() => deleteMutation.mutate(l.id)}
                  disabled={deleteMutation.isPending}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

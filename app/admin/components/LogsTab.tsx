'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Download, FileText} from 'lucide-react';
import {toast} from 'sonner';

interface LogsTabProps {
  logs: any[];
  addLog: (action: string) => void;
}

export function LogsTab({logs, addLog}: LogsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{logs.length} audit logs</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            toast.success('Logs exported to CSV');
            addLog('Exported audit logs');
          }}>
          <Download className="w-4 h-4 mr-1" /> Export Logs
        </Button>
      </div>
      {logs.map(l => (
        <Card key={l.id} className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm text-foreground">{l.action}</p>
                <p className="text-xs text-muted-foreground">by {l.admin}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              {l.date}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

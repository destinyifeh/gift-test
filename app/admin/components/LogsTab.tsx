'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Download, FileText} from 'lucide-react';
import {toast} from 'sonner';

import {useEffect, useState} from 'react';

interface LogsTabProps {
  // logs is now local
}

export function LogsTab({}: LogsTabProps) {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const handleNewLog = (e: any) => {
      const action = e.detail;
      const newLog = {
        id: Math.floor(Math.random() * 1000000),
        admin: 'Current Admin',
        action,
        date: new Date().toLocaleString(),
      };
      setLogs(prev => [newLog, ...prev]);
    };

    window.addEventListener('admin-log', handleNewLog);
    return () => window.removeEventListener('admin-log', handleNewLog);
  }, []);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{logs.length} audit logs</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            toast.success('Logs exported to CSV');
            const event = new CustomEvent('admin-log', {
              detail: 'Exported audit logs',
            });
            window.dispatchEvent(event);
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

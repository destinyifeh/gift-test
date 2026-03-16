'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {CheckCircle, MoreVertical, Pause, Trash2} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {mockModerationQueue} from './mock';

interface ModerationTabProps {
  addLog: (action: string) => void;
}

export function ModerationTab({addLog}: ModerationTabProps) {
  const [moderationQueue, setModerationQueue] = useState(mockModerationQueue);
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
    const logMessage = `${formattedType}d moderation report ${targetId}. Reason: ${data.reason}`;

    setModerationQueue(prev => prev.filter(m => m.id !== targetId));

    toast.success(`${formattedType} action confirmed for moderation item`);
    addLog(logMessage);
    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  const onResolve = (id: string, action: 'dismiss' | 'resolve' | 'suspend') => {
    handleAdvancedAction(action, 'moderation', id, id);
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        {moderationQueue.length} items in moderation queue
      </p>
      {moderationQueue.map(m => (
        <Card
          key={m.id}
          className="border-border border-l-4 border-l-destructive/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    {m.type}
                  </Badge>
                  <p className="font-semibold text-foreground">{m.item}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Reported by: {m.reporter} · Reason: {m.reason}
                </p>
                <p className="text-xs text-muted-foreground">{m.date}</p>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-secondary focus:text-secondary"
                      onClick={() => onResolve(m.id, 'resolve')}>
                      <CheckCircle className="w-4 h-4 mr-2" /> Resolve Issue
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-orange-500 focus:text-orange-500"
                      onClick={() => onResolve(m.id, 'suspend')}>
                      <Pause className="w-4 h-4 mr-2" /> Suspend Entity
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onResolve(m.id, 'dismiss')}>
                      <Trash2 className="w-4 h-4 mr-2" /> Dismiss Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
        type={advancedModal.type}
        targetType="moderation"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />
    </div>
  );
}

'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Ban, Eye, Key} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {mockIntegrations} from './mock';
import {statusBadge} from './utils';

interface IntegrationsTabProps {
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

export function IntegrationsTab({
  addLog,
  setViewDetailsModal,
}: IntegrationsTabProps) {
  const [integrations, setIntegrations] = useState(mockIntegrations);
  const [advancedModal, setAdvancedModal] = useState<{
    isOpen: boolean;
    type: 'generate' | 'disable';
    targetId: string;
    targetName: string;
  }>({
    isOpen: false,
    type: 'generate',
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
    const logMessage = `${formattedType}d ${targetName} integration. Reason: ${data.reason}`;

    if (type === 'generate') {
      const newKey = `gk_${Math.random().toString(36).substr(2, 24)}`;
      setIntegrations(prev =>
        prev.map(i => (i.name === targetId ? {...i, apiKey: newKey} : i)),
      );
    } else if (type === 'disable') {
      setIntegrations(prev =>
        prev.map(i => (i.name === targetId ? {...i, status: 'disabled'} : i)),
      );
    }

    toast.success(`${formattedType} action confirmed for ${targetName}`);
    addLog(logMessage);
    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  const onGenerateKey = (name: string) => {
    handleAdvancedAction('generate', 'integration', name, name);
  };

  const onDisable = (name: string, status: string) => {
    const action = status === 'active' ? 'disable' : 'activate';
    handleAdvancedAction(action, 'integration', name, name);
  };
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        {integrations.length} platform integrations
      </p>
      {integrations.map(i => (
        <Card key={i.name} className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-foreground">{i.name}</p>
                <p className="text-sm text-muted-foreground">{i.owner}</p>
              </div>
              <Badge variant={statusBadge(i.status) as any}>{i.status}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="font-bold text-foreground">
                  {i.users.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Users</p>
              </div>
              <div>
                <p className="font-bold text-foreground">{i.gifts}</p>
                <p className="text-xs text-muted-foreground">Total Gifts</p>
              </div>
              <div>
                <p className="font-bold text-secondary">{i.revenue}</p>
                <p className="text-xs text-muted-foreground">Revenue Share</p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-muted rounded-lg text-xs space-y-1">
              <p className="font-medium text-foreground">SDK Installs:</p>
              <p className="text-muted-foreground">
                React: <code className="text-foreground">@gifthance/react</code>
              </p>
              <p className="text-muted-foreground">
                React Native:{' '}
                <code className="text-foreground">@gifthance/react-native</code>
              </p>
              <p className="text-muted-foreground">
                Flutter: <code className="text-foreground">gifthance</code>{' '}
                (pub.dev)
              </p>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onGenerateKey(i.name)}>
                <Key className="w-3.5 h-3.5 mr-1" /> Generate API Key
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast.info(`Viewing activity for ${i.name}`)}>
                <Eye className="w-3.5 h-3.5 mr-1" /> View Activity
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => onDisable(i.name, i.status)}>
                <Ban className="w-3.5 h-3.5 mr-1" />{' '}
                {i.status === 'active' ? 'Disable' : 'Activate'}
              </Button>
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
        targetType="integration"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />
    </div>
  );
}

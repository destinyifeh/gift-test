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
import {fetchAdminUsers} from '@/lib/server/actions/admin';
import {useQuery} from '@tanstack/react-query';
import {
  AlertTriangle,
  Ban,
  Download,
  Eye,
  Key,
  MoreVertical,
  Pause,
} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {handleExport} from './utils';

export function PartnersTab({searchQuery, addLog, setViewDetailsModal}: any) {
  const {data, isLoading} = useQuery({
    queryKey: ['admin-partners', searchQuery],
    queryFn: () => fetchAdminUsers(searchQuery, 'partner'),
  });

  const partners = data?.data || [];

  const [advancedModal, setAdvancedModal] = useState<{
    isOpen: boolean;
    type: 'warn' | 'suspend' | 'ban' | 'delete' | 'activate' | 'generate';
    targetId: string;
    targetName: string;
  }>({
    isOpen: false,
    type: 'warn',
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

    if (type === 'generate') {
      toast.info(`New API Key generated for ${targetName}`);
    } else {
      toast.success(`${formattedType} action logged for ${targetName}`);
    }
    addLog(`Logged action ${formattedType} for ${targetName}`);
    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  if (isLoading) {
    return <div className="text-muted-foreground p-4">Loading partners...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {partners.length} platform partners
        </p>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv', 'Partners')}>
                CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 font-medium">Partner</th>
              <th className="text-left py-2 font-medium">Country</th>
              <th className="text-right py-2 font-medium pr-6">Joined</th>
              <th className="text-left py-2 font-medium pl-6">Status</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p: any) => (
              <tr
                key={p.id}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="py-3">
                  <p className="font-medium text-foreground capitalize">
                    {p.display_name || 'No Name'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{p.username} · {p.email}
                  </p>
                </td>
                <td className="py-3 text-left text-foreground font-mono">
                  {p.country || 'Not set'}
                </td>
                <td className="py-3 text-right text-foreground font-mono">
                  {p.created_at
                    ? new Date(p.created_at).toLocaleDateString()
                    : 'Unknown'}
                </td>
                <td className="py-3 pl-6">
                  <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-none">
                    Active
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
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>
                          Partner Management
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            setViewDetailsModal({
                              isOpen: true,
                              title: 'Partner Details',
                              data: p,
                            })
                          }>
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleAdvancedAction(
                              'generate',
                              'partner',
                              p.id,
                              p.username,
                            )
                          }>
                          <Key className="w-4 h-4 mr-2" /> Generate Key
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground py-1">
                          Moderation
                        </DropdownMenuLabel>

                        <DropdownMenuItem
                          onClick={() =>
                            handleAdvancedAction(
                              'warn',
                              'partner',
                              p.id,
                              p.username,
                            )
                          }>
                          <AlertTriangle className="w-4 h-4 mr-2" /> Warn
                          Partner
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleAdvancedAction(
                              'suspend',
                              'partner',
                              p.id,
                              p.username,
                            )
                          }>
                          <Pause className="w-4 h-4 mr-2" /> Suspend
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleAdvancedAction(
                              'ban',
                              'partner',
                              p.id,
                              p.username,
                            )
                          }>
                          <Ban className="w-4 h-4 mr-2" /> Ban Partner
                        </DropdownMenuItem>
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
        type={advancedModal.type as any}
        targetType="partner"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />
    </div>
  );
}

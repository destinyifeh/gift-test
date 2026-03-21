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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {fetchAdminGifts, flagCreatorGift} from '@/lib/server/actions/admin';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {Download, Eye, Flag, MoreVertical} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {handleExport, statusBadge} from './utils';

interface GiftsTabProps {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

export function GiftsTab({
  searchQuery,
  addLog,
  setViewDetailsModal,
}: GiftsTabProps) {
  const queryClient = useQueryClient();

  const {data, isLoading} = useQuery({
    queryKey: ['admin-gifts', searchQuery],
    queryFn: () => fetchAdminGifts(searchQuery),
  });

  const gifts = data?.data || [];

  const [advancedModal, setAdvancedModal] = useState<{
    isOpen: boolean;
    type: 'flag';
    targetId: string;
    targetName: string;
  }>({
    isOpen: false,
    type: 'flag',
    targetId: '',
    targetName: '',
  });

  const [typeFilter, setTypeFilter] = useState('all');

  const mutation = useMutation({
    mutationFn: ({id, reason}: {id: string; reason: string}) =>
      flagCreatorGift(id, reason),
    onSuccess: (res, vars) => {
      if (!res.success) {
        toast.error(res.error || 'Failed to flag gift record');
        return;
      }
      queryClient.invalidateQueries({queryKey: ['admin-gifts']});
      toast.success('System moderation flag attached to gift log.');
      addLog(`Flagged anomalous direct support transaction ID: ${vars.id}`);
    },
    onError: () => toast.error('System error flagging gift'),
  });

  const filteredGifts = gifts.filter((g: any) => {
    const sender = g.donor_name || '';
    const recipient = g.recipient?.username || '';
    const id = g.id || '';

    const matchesSearch =
      sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      id.toLowerCase().includes(searchQuery.toLowerCase());

    const isMoney = !g.gift_name;
    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'money' && isMoney) ||
      (typeFilter === 'giftcard' && !isMoney);

    return matchesSearch && matchesType;
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
    mutation.mutate({id: advancedModal.targetId, reason: data.reason});
    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  const onFlag = (id: string, name: string) => {
    handleAdvancedAction('flag', 'gift', id, name);
  };

  if (isLoading) {
    return (
      <div className="text-muted-foreground p-4">
        Loading creator support volume...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {filteredGifts.length} creator gifts
        </p>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="money">Money</SelectItem>
              <SelectItem value="giftcard">Gift Card</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv', 'Gifts')}>
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
              <th className="text-left py-2 font-medium">ID</th>
              <th className="text-left py-2 font-medium">Sender</th>
              <th className="text-left py-2 font-medium">Recipient</th>
              <th className="text-left py-2 font-medium">Type</th>
              <th className="text-right py-2 font-medium">Amount</th>
              <th className="text-right py-2 font-medium pr-6">Fee</th>
              <th className="text-left py-2 font-medium pl-6">Status</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGifts.map((g: any) => (
              <tr
                key={g.id}
                className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${g.is_flagged ? 'bg-destructive/10' : ''}`}>
                <td
                  className="py-3 font-mono text-xs text-muted-foreground"
                  title={g.id}>
                  {g.is_flagged && (
                    <Flag className="w-3 h-3 text-destructive inline mr-1" />
                  )}
                  {g.id.split('-')[0]}...
                </td>
                <td className="py-3 text-foreground font-medium">
                  {g.donor_name} {g.is_anonymous ? '(Anon)' : ''}
                </td>
                <td className="py-3 text-foreground">
                  {g.recipient?.username || 'Unknown'}
                </td>
                <td className="py-3">
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase truncate max-w-[120px]">
                    {g.gift_name ? 'Gift Card' : 'Money'}
                  </Badge>
                </td>
                <td className="py-3 text-right text-foreground font-mono">
                  {getCurrencySymbol(
                    getCurrencyByCountry(g.recipient?.country),
                  )}
                  {g.amount}
                </td>
                <td className="py-3 text-right text-muted-foreground pr-6 font-mono">
                  {getCurrencySymbol(
                    getCurrencyByCountry(g.recipient?.country),
                  )}
                  0
                </td>
                <td className="py-3 pl-6">
                  <Badge
                    variant={
                      statusBadge(g.transactions?.status || 'success') as any
                    }
                    className="capitalize">
                    {g.transactions?.status || 'success'}
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
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            setViewDetailsModal({
                              isOpen: true,
                              title: 'Gift Details',
                              data: g,
                            })
                          }>
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>

                        {!g.is_flagged && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => onFlag(g.id, g.amount)}>
                              <Flag className="w-4 h-4 mr-2" /> Flag Gift
                            </DropdownMenuItem>
                          </>
                        )}
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
        targetType="gift"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />
    </div>
  );
}

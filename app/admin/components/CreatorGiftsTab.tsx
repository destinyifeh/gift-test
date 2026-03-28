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
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {useIsMobile} from '@/hooks/use-mobile';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {fetchAdminCreatorGifts, flagCreatorGift} from '@/lib/server/actions/admin';
import {cn} from '@/lib/utils';
import {useInfiniteQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Download, Eye, Flag, Gift, Loader2, MoreVertical} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {handleExport, statusBadge} from './utils';

interface CreatorGiftsTabProps {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

export function CreatorGiftsTab({
  searchQuery,
  addLog,
  setViewDetailsModal,
}: CreatorGiftsTabProps) {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const {
    data: infiniteData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['admin-creator-gifts', searchQuery],
    queryFn: ({pageParam = 0}) => fetchAdminCreatorGifts({search: searchQuery, pageParam}),
    getNextPageParam: lastPage => lastPage.nextPage,
    initialPageParam: 0,
  });

  const gifts = infiniteData?.pages.flatMap(page => page.data || []) || [];

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
      queryClient.invalidateQueries({queryKey: ['admin-creator-gifts']});
      toast.success('System moderation flag attached to gift log.');
      addLog(
        `Flagged gift (amount: ${vars.id.slice(0, 8)}…) — Reason: "${vars.reason}"`,
      );
    },
    onError: () => toast.error('System error flagging gift'),
  });

  const filteredGifts = gifts.filter((g: any) => {
    const isMoney = !g.gift_name;
    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'money' && isMoney) ||
      (typeFilter === 'giftcard' && !isMoney);

    return matchesType;
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
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading creator support volume...</p>
      </div>
    );
  }

  const GiftActions = ({g}: {g: any}) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
  );

  const getCurrency = (country: string) => getCurrencySymbol(getCurrencyByCountry(country));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">
          {filteredGifts.length} creator gifts loaded
        </p>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-28 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="money">Money</SelectItem>
              <SelectItem value="giftcard">Gift Card</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => handleExport('csv', 'Gifts')}>
            <Download className="w-4 h-4 mr-1.5" /> Export
          </Button>
        </div>
      </div>

      {/* Mobile Card View */}
      {isMobile ? (
        <div className="space-y-2">
          {filteredGifts.map((g: any) => (
            <div
              key={g.id}
              className={cn(
                'p-4 rounded-xl bg-card border border-border',
                'active:bg-muted/50 transition-colors',
                g.is_flagged && 'border-destructive/50 bg-destructive/5',
              )}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    g.is_flagged ? 'bg-destructive/10' : 'bg-primary/10',
                  )}>
                    {g.is_flagged ? (
                      <Flag className="w-5 h-5 text-destructive" />
                    ) : (
                      <Gift className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">
                        {g.donor_name} {g.is_anonymous ? '(Anon)' : ''}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      → {g.recipient?.display_name || g.recipient?.username || 'Unknown'}
                    </p>
                  </div>
                </div>
                <GiftActions g={g} />
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {g.gift_name ? 'Gift Card' : 'Money'}
                  </Badge>
                  <Badge
                    variant={statusBadge(g.transactions?.status || 'success') as any}
                    className="capitalize text-[10px]">
                    {g.transactions?.status || 'success'}
                  </Badge>
                </div>
                <p className="font-mono font-semibold text-foreground">
                  {getCurrency(g.recipient?.country)}{g.amount}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Desktop Table View */
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Sender</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Recipient</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGifts.map((g: any) => (
                <tr
                  key={g.id}
                  className={cn(
                    'border-b border-border last:border-0 hover:bg-muted/30 transition-colors',
                    g.is_flagged && 'bg-destructive/10',
                  )}>
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground" title={g.id}>
                    {g.is_flagged && <Flag className="w-3 h-3 text-destructive inline mr-1" />}
                    {g.id.split('-')[0]}...
                  </td>
                  <td className="py-3 px-4 text-foreground font-medium">
                    {g.donor_name} {g.is_anonymous ? '(Anon)' : ''}
                  </td>
                  <td className="py-3 px-4 text-foreground">
                    {g.recipient?.display_name || g.recipient?.username || 'Unknown'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {g.gift_name ? 'Gift Card' : 'Money'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right text-foreground font-mono">
                    {getCurrency(g.recipient?.country)}{g.amount}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={statusBadge(g.transactions?.status || 'success') as any}
                      className="capitalize">
                      {g.transactions?.status || 'success'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <GiftActions g={g} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredGifts.length === 0 && (
        <div className="text-center py-12">
          <Gift className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No creator gifts found</p>
        </div>
      )}

      <InfiniteScroll
        hasMore={!!hasNextPage}
        isLoading={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />

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

'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {useIsMobile} from '@/hooks/use-mobile';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {fetchAdminShopGifts} from '@/lib/server/actions/admin';
import {cn} from '@/lib/utils';
import {useInfiniteQuery} from '@tanstack/react-query';
import {Ban, Download, Eye, Gift, Loader2, MoreVertical} from 'lucide-react';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {statusBadge, handleExport} from './utils';

interface ClaimableGiftsTabProps {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

export function ClaimableGiftsTab({
  searchQuery,
  addLog,
  setViewDetailsModal,
}: ClaimableGiftsTabProps) {
  const isMobile = useIsMobile();
  const {
    data: infiniteData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['admin-claimable-gifts', searchQuery],
    queryFn: ({pageParam = 0}) => fetchAdminShopGifts({search: searchQuery, pageParam}),
    getNextPageParam: lastPage => lastPage.nextPage,
    initialPageParam: 0,
  });

  useEffect(() => {
    const errorPage = infiniteData?.pages.find(p => p.success === false);
    if (errorPage) toast.error(errorPage.error || 'Failed to load claimable gifts');
  }, [infiniteData]);

  const claimableGifts = infiniteData?.pages.flatMap(page => page.data || []) || [];

  const [advancedModal, setAdvancedModal] = useState<{
    isOpen: boolean;
    type: 'invalidate';
    targetId: string;
    targetName: string;
  }>({
    isOpen: false,
    type: 'invalidate',
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
    const {type, targetName} = advancedModal;
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    const logMessage = `${formattedType}ed code ${targetName}. Reason: ${data.reason}`;

    toast.info(
      `Mock ${formattedType} tracked for ${targetName}. (Review backend hook).`,
    );
    addLog(logMessage);
    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  const onInvalidate = (code: string) => {
    handleAdvancedAction('invalidate', 'gift', code, code);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading claimable items...</p>
      </div>
    );
  }

  const ClaimableActions = ({c}: {c: any}) => (
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
              data: {
                ...c,
                vendor_name: c.vendor?.display_name || c.vendor?.username || 'System',
                shop_name: c.vendor?.shop_name || 'Gatherly Gift Shop',
                shop_address: c.vendor?.shop_address || 'N/A',
                gift_type: c.gift_code ? 'Gift Card' : 'Prepaid Claimable',
              },
            })
          }>
          <Eye className="w-4 h-4 mr-2" /> View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onInvalidate(c.gift_code || c.id)}>
          <Ban className="w-4 h-4 mr-2" /> Invalidate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const getCurrency = (country: string) => getCurrencySymbol(getCurrencyByCountry(country));
  const getDisplayStatus = (status: string) => status === 'completed' ? 'redeemed' : status;
  const getMaskedCode = (code: string | null) =>
    code ? `${code.slice(0, 6)}${'*'.repeat(Math.max(0, code.length - 6))}` : 'PREPAID';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{claimableGifts.length} items loaded</p>
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          onClick={() => handleExport('csv', 'ClaimableGifts')}>
          <Download className="w-4 h-4 mr-1.5" /> Export
        </Button>
      </div>

      {/* Mobile Card View */}
      {isMobile ? (
        <div className="space-y-2">
          {claimableGifts.map((c: any) => (
            <div
              key={c.id}
              className={cn(
                'p-4 rounded-xl bg-card border border-border',
                'active:bg-muted/50 transition-colors',
              )}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono font-semibold text-foreground text-sm">
                      {getMaskedCode(c.gift_code)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.title}
                    </p>
                  </div>
                </div>
                <ClaimableActions c={c} />
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Badge variant={statusBadge(c.status) as any} className="capitalize text-[10px]">
                    {getDisplayStatus(c.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground capitalize truncate">
                    {c.profiles?.display_name || c.profiles?.username || 'System'}
                  </span>
                </div>
                <p className="font-mono font-semibold text-foreground">
                  {getCurrency(c.profiles?.country)}{c.current_amount || 0}
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
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Code/Item</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Vendor</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {claimableGifts.map((c: any) => (
                <tr
                  key={c.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-foreground">
                    {getMaskedCode(c.gift_code)}
                  </td>
                  <td className="py-3 px-4 text-foreground capitalize">
                    {c.profiles?.display_name || c.profiles?.username || 'System'}
                  </td>
                  <td className="py-3 px-4 text-foreground">{c.title}</td>
                  <td className="py-3 px-4 text-right text-foreground font-mono">
                    {getCurrency(c.profiles?.country)}{c.current_amount || 0}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={statusBadge(c.status) as any} className="capitalize">
                      {getDisplayStatus(c.status)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <ClaimableActions c={c} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {claimableGifts.length === 0 && (
        <div className="text-center py-12">
          <Gift className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No claimable gifts found</p>
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

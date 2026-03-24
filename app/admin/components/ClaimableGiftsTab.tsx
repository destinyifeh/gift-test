'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {fetchAdminShopGifts} from '@/lib/server/actions/admin';
import {useInfiniteQuery} from '@tanstack/react-query';
import {Ban, Download, Eye} from 'lucide-react';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {statusBadge, handleExport} from './utils';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {MoreVertical} from 'lucide-react';

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
      <div className="text-muted-foreground p-4">
        Loading claimable items...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{claimableGifts.length} items loaded</p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExport('csv', 'ClaimableGifts')}
          >
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 font-medium">Code/Item</th>
              <th className="text-left py-2 font-medium">Vendor</th>
              <th className="text-left py-2 font-medium">Product</th>
              <th className="text-right py-2 font-medium pr-6">Amount</th>
              <th className="text-left py-2 font-medium pl-6">Status</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {claimableGifts.map((c: any) => (
              <tr
                key={c.id}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="py-3 font-mono font-semibold text-foreground">
                  {c.gift_code || 'PREPAID'}
                </td>
                <td className="py-3 text-foreground capitalize">
                   {c.profiles?.display_name || c.profiles?.username || 'System'}
                </td>
                <td className="py-3 text-foreground">{c.title}</td>
                <td className="py-3 text-right text-foreground pr-6 font-mono">
                  {getCurrencySymbol(getCurrencyByCountry(c.profiles?.country))}
                  {c.current_amount || 0}
                </td>
                <td className="py-3 pl-6">
                  <Badge variant={statusBadge(c.status) as any} className="capitalize">
                    {c.status === 'completed' ? 'redeemed' : c.status}
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
                  </div>
                </td>
              </tr>
            ))}
            {claimableGifts.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground">
                  No claimable gifts found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

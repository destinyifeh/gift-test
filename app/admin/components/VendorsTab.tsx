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
import {useIsMobile} from '@/hooks/use-mobile';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {fetchAdminVendors, updateVendorStatus} from '@/lib/server/actions/admin';
import {cn} from '@/lib/utils';
import {useInfiniteQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
  CheckCircle2,
  Download,
  ExternalLink,
  Loader2,
  MoreVertical,
  Store,
  XCircle,
} from 'lucide-react';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {AddVendorModal} from './AddVendorModal';
import {EditVendorModal} from './EditVendorModal';
import {statusBadge, handleExport} from './utils';

interface VendorsTabProps {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

export function VendorsTab({
  searchQuery,
  addLog,
  setViewDetailsModal,
}: VendorsTabProps) {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editModal, setEditModal] = useState<{isOpen: boolean; vendor: any}>({
    isOpen: false,
    vendor: null,
  });

  const {
    data: infiniteData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['admin-vendors', searchQuery],
    queryFn: ({pageParam = 0}) => fetchAdminVendors({search: searchQuery, pageParam}),
    getNextPageParam: lastPage => lastPage.nextPage,
    initialPageParam: 0,
  });

  useEffect(() => {
    const errorPage = infiniteData?.pages.find(p => p.success === false);
    if (errorPage) toast.error(errorPage.error || 'Failed to load vendors');
  }, [infiniteData]);

  const vendors = infiniteData?.pages.flatMap(page => page.data || []) || [];

  const mutation = useMutation({
    mutationFn: ({id, status}: {id: string; status: string}) =>
      updateVendorStatus(id, status),
    onSuccess: (res, vars) => {
      if (!res.success) {
        toast.error(res.error || 'Failed to update vendor status');
        return;
      }
      queryClient.invalidateQueries({queryKey: ['admin-vendors']});
      toast.success('Vendor status updated');
      addLog(`Updated vendor status to ${vars.status} for vendor ${vars.id}`);
    },
    onError: () => toast.error('Error updating vendor'),
  });

  const onToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    mutation.mutate({id, status: newStatus});
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading vendor profiles...</p>
      </div>
    );
  }

  const VendorActions = ({v}: {v: any}) => (
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
              title: 'Vendor Details',
              data: {
                ...v,
                shop_name: v.shop_name || v.display_name,
                shop_address: v.shop_address || 'N/A',
              },
            })
          }>
          <ExternalLink className="w-4 h-4 mr-2" /> View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setEditModal({isOpen: true, vendor: v})}>
          Edit Configuration
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={v.status === 'active' ? 'text-destructive' : 'text-emerald-500'}
          onClick={() => onToggleStatus(v.id, v.status)}>
          {v.status === 'active' ? (
            <>
              <XCircle className="w-4 h-4 mr-2" /> Suspend
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Activate
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{vendors.length} vendors loaded</p>
        <div className="flex gap-2">
          <Button
            variant="hero"
            size="sm"
            className="h-9"
            onClick={() => setIsAddModalOpen(true)}>
            <Store className="w-4 h-4 mr-1.5" /> Add
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => handleExport('csv', 'vendors')}>
            <Download className="w-4 h-4 mr-1.5" /> Export
          </Button>
        </div>
      </div>

      {/* Mobile Card View */}
      {isMobile ? (
        <div className="space-y-2">
          {vendors.map((v: any) => (
            <div
              key={v.id}
              className={cn(
                'p-4 rounded-xl bg-card border border-border',
                'active:bg-muted/50 transition-colors',
              )}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">
                        {v.shop_name || v.display_name}
                      </p>
                      <Badge
                        variant={statusBadge(v.status) as any}
                        className="capitalize text-[10px]">
                        {v.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">@{v.username}</p>
                  </div>
                </div>
                <VendorActions v={v} />
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {v.category || 'General'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {v.orders_count || 0} orders
                  </span>
                </div>
                <p className="font-mono font-semibold text-secondary">
                  {getCurrencySymbol(getCurrencyByCountry(v.country))}
                  {v.sales_volume || 0}
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
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Vendor</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Orders</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total Sales</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v: any) => (
                <tr
                  key={v.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-foreground">{v.shop_name || v.display_name}</p>
                    <p className="text-xs text-muted-foreground">@{v.username}</p>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {v.category || 'General'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right text-foreground font-mono">
                    {v.orders_count || 0}
                  </td>
                  <td className="py-3 px-4 text-right text-secondary font-mono">
                    {getCurrencySymbol(getCurrencyByCountry(v.country))}
                    {v.sales_volume || 0}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={statusBadge(v.status) as any} className="capitalize">
                      {v.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <VendorActions v={v} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {vendors.length === 0 && (
        <div className="text-center py-12">
          <Store className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No vendors found</p>
        </div>
      )}

      <InfiniteScroll
        hasMore={!!hasNextPage}
        isLoading={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />

      {isAddModalOpen && (
        <AddVendorModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          onAdd={() => {
            toast.info('Feature coming soon: Manual vendor addition');
            setIsAddModalOpen(false);
          }}
          vendor={{name: '', email: '', products: 0, status: 'active'}}
          setVendor={() => {}}
        />
      )}

      {editModal.isOpen && (
        <EditVendorModal
          isOpen={editModal.isOpen}
          onOpenChange={open => setEditModal(prev => ({...prev, isOpen: open}))}
          vendor={editModal.vendor}
          onSuccess={() => {
            queryClient.invalidateQueries({queryKey: ['admin-vendors']});
            addLog(`Updated configuration for vendor ${editModal.vendor?.id}`);
          }}
        />
      )}
    </div>
  );
}

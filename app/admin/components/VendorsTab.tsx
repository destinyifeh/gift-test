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
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {fetchAdminVendors, updateVendorStatus} from '@/lib/server/actions/admin';
import {useInfiniteQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
  CheckCircle2,
  Download,
  ExternalLink,
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
      <div className="text-muted-foreground p-4">Loading vendor profiles...</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{vendors.length} vendors loaded</p>
        <div className="flex gap-2">
          <Button
            variant="hero"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}>
            <Store className="w-4 h-4 mr-1" /> Add Vendor
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExport('csv', 'vendors')}
          >
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 font-medium">Vendor Name</th>
              <th className="text-left py-2 font-medium">Category</th>
              <th className="text-right py-2 font-medium">Orders</th>
              <th className="text-right py-2 font-medium">Total Sales</th>
              <th className="text-left py-2 font-medium pl-6">Status</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v: any) => (
              <tr
                key={v.id}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="py-3">
                  <p className="font-medium text-foreground">{v.shop_name || v.display_name}</p>
                  <p className="text-xs text-muted-foreground">@{v.username}</p>
                </td>
                <td className="py-3">
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {v.category || 'General'}
                  </Badge>
                </td>
                <td className="py-3 text-right text-foreground font-mono">
                  {v.orders_count || 0}
                </td>
                <td className="py-3 text-right text-secondary font-mono">
                   {getCurrencySymbol(getCurrencyByCountry(v.country))}
                   {v.sales_volume || 0}
                </td>
                <td className="py-3 pl-6">
                  <Badge
                    variant={statusBadge(v.status) as any}
                    className="capitalize">
                    {v.status}
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
                              title: 'Vendor Details',
                              data: {
                                ...v,
                                shop_name: v.shop_name || v.display_name,
                                shop_address: v.shop_address || 'N/A',
                              },
                            })
                          }>
                          <ExternalLink className="w-4 h-4 mr-2" /> View Public
                          Page
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEditModal({isOpen: true, vendor: v})}>
                          Edit Configuration
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className={
                            v.status === 'active'
                              ? 'text-destructive'
                              : 'text-emerald-500'
                          }
                          onClick={() => onToggleStatus(v.id, v.status)}>
                          {v.status === 'active' ? (
                            <>
                              <XCircle className="w-4 h-4 mr-2" /> Suspend
                              Vendor
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Activate
                              Vendor
                            </>
                          )}
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

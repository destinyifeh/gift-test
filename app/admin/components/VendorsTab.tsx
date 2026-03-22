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
  MoreVertical,
  Pause,
  Store,
} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {EditVendorModal} from './EditVendorModal';
import {handleExport} from './utils';

export function VendorsTab({searchQuery, addLog, setViewDetailsModal}: any) {
  const {data, isLoading} = useQuery({
    queryKey: ['admin-vendors', searchQuery],
    queryFn: () => fetchAdminUsers(searchQuery, 'vendor'),
  });

  const vendors = data?.data || [];

  const [advancedModal, setAdvancedModal] = useState<{
    isOpen: boolean;
    type: 'warn' | 'suspend' | 'ban' | 'delete' | 'activate';
    targetName: string;
  }>({
    isOpen: false,
    type: 'warn',
    targetName: '',
  });

  const [editVendorModal, setEditVendorModal] = useState<{
    isOpen: boolean;
    vendor: any;
  }>({
    isOpen: false,
    vendor: null,
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
      targetName,
    });
  };

  const onConfirmAdvancedAction = (data: {days?: string; reason: string}) => {
    const {type, targetName} = advancedModal;
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    toast.success(`${formattedType} verb action logged for ${targetName}`);
    addLog(`${formattedType} vendor ${targetName}`);
    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  if (isLoading) {
    return <div className="text-muted-foreground p-4">Loading vendors...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{vendors.length} vendors</p>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv', 'Vendors')}>
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
              <th className="text-left py-2 font-medium">Vendor</th>
              <th className="text-left py-2 font-medium">Country</th>
              <th className="text-right py-2 font-medium pr-6">Joined</th>
              <th className="text-left py-2 font-medium pl-6">Status</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v: any) => (
              <tr key={v.id} className="border-b border-border last:border-0">
                <td className="py-3">
                  <p className="font-medium text-foreground capitalize">
                    {v.display_name || 'No Name'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{v.username} · {v.email}
                  </p>
                </td>
                <td className="py-3 text-left text-foreground">
                  {v.country || 'Not set'}
                </td>
                <td className="py-3 text-right text-secondary pr-6">
                  {v.created_at
                    ? new Date(v.created_at).toLocaleDateString()
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
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            setViewDetailsModal({
                              isOpen: true,
                              title: 'Vendor Details',
                              data: v,
                            })
                          }>
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        {v.shop_slug && (
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(`/gift-shop/${v.shop_slug}`, '_blank')
                            }>
                            <Store className="w-4 h-4 mr-2" /> View Shop
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() =>
                            setEditVendorModal({isOpen: true, vendor: v})
                          }>
                          <MoreVertical className="w-4 h-4 mr-2" /> Edit Vendor
                          Info
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleAdvancedAction(
                              'warn',
                              'vendor',
                              v.id,
                              v.username,
                            )
                          }>
                          <AlertTriangle className="w-4 h-4 mr-2" /> Warn Vendor
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleAdvancedAction(
                              'suspend',
                              'vendor',
                              v.id,
                              v.username,
                            )
                          }>
                          <Pause className="w-4 h-4 mr-2" /> Suspend
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleAdvancedAction(
                              'ban',
                              'vendor',
                              v.id,
                              v.username,
                            )
                          }>
                          <Ban className="w-4 h-4 mr-2" /> Ban Vendor
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
        type={advancedModal.type}
        targetType="vendor"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />
      <EditVendorModal
        isOpen={editVendorModal.isOpen}
        onOpenChange={(open: boolean) =>
          setEditVendorModal(prev => ({...prev, isOpen: open}))
        }
        vendor={editVendorModal.vendor}
        onSuccess={() => {
          // No direct refetch here as it's a mutation, but the user might want a refetch
          // However, vendors list usually doesn't show shop details so no immediate need
        }}
      />
    </div>
  );
}

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
  AlertTriangle,
  Ban,
  CheckCircle,
  Download,
  Eye,
  MoreVertical,
  Pause,
  Plus,
  Trash2,
} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {AddVendorModal} from './AddVendorModal';
import {mockVendors} from './mock';
import {handleExport, statusBadge} from './utils';

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
  const [vendors, setVendors] = useState(mockVendors);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [advancedModal, setAdvancedModal] = useState<{
    isOpen: boolean;
    type: 'warn' | 'suspend' | 'ban' | 'delete' | 'activate';
    targetName: string;
  }>({
    isOpen: false,
    type: 'warn',
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
      targetName,
    });
  };

  const onConfirmAdvancedAction = (data: {days?: string; reason: string}) => {
    const {type, targetName} = advancedModal;
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    const logMessage = `${formattedType}ed vendor ${targetName}. Reason: ${data.reason}`;

    if (type === 'suspend' || type === 'ban') {
      setVendors(prev =>
        prev.map(v =>
          v.name === targetName ? {...v, status: 'suspended'} : v,
        ),
      );
    } else if (type === 'delete') {
      setVendors(prev => prev.filter(v => v.name !== targetName));
    } else if (type === 'activate') {
      setVendors(prev =>
        prev.map(v => (v.name === targetName ? {...v, status: 'active'} : v)),
      );
    }

    toast.success(`${formattedType} action confirmed for ${targetName}`);
    addLog(logMessage);
    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  const [newVendor, setNewVendor] = useState({
    name: '',
    email: '',
    products: 0,
    orders: 0,
    revenue: 0,
    status: 'active' as const,
  });

  const handleAddVendor = () => {
    if (!newVendor.name || !newVendor.email) {
      toast.error('Please fill in all fields');
      return;
    }
    const vendorToAdd = {
      ...newVendor,
      joined: new Date().toISOString().split('T')[0],
    };
    setVendors([vendorToAdd, ...vendors]);
    setIsVendorModalOpen(false);
    setNewVendor({
      name: '',
      email: '',
      products: 0,
      orders: 0,
      revenue: 0,
      status: 'active',
    });
    toast.success('Vendor added successfully');
  };

  const onUpdateStatus = (vendorName: string, currentStatus: string) => {
    const action = currentStatus === 'active' ? 'suspend' : 'activate';
    handleAdvancedAction(action, 'vendor', vendorName, vendorName);
  };

  const onDelete = (vendorName: string) => {
    handleAdvancedAction('delete', 'vendor', vendorName, vendorName);
  };
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
              <DropdownMenuItem
                onClick={() => handleExport('excel', 'Vendors')}>
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf', 'Vendors')}>
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="hero"
            size="sm"
            onClick={() => setIsVendorModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Vendor
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 font-medium">Vendor</th>
              <th className="text-right py-2 font-medium">Products</th>
              <th className="text-right py-2 font-medium">Orders</th>
              <th className="text-right py-2 font-medium pr-6">Revenue</th>
              <th className="text-left py-2 font-medium pl-6">Status</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors
              .filter(
                v =>
                  v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  v.email.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map(v => (
                <tr
                  key={v.name}
                  className="border-b border-border last:border-0">
                  <td className="py-3">
                    <p className="font-medium text-foreground">{v.name}</p>
                    <p className="text-xs text-muted-foreground">{v.email}</p>
                  </td>
                  <td className="py-3 text-right text-foreground">
                    {v.products}
                  </td>
                  <td className="py-3 text-right text-foreground">
                    {v.orders}
                  </td>
                  <td className="py-3 text-right text-secondary pr-6">
                    ${v.revenue.toLocaleString()}
                  </td>
                  <td className="py-3 pl-6">
                    <Badge variant={statusBadge(v.status) as any}>
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
                                data: v,
                              })
                            }>
                            <Eye className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleAdvancedAction(
                                'warn',
                                'vendor',
                                v.name,
                                v.name,
                              )
                            }>
                            <AlertTriangle className="w-4 h-4 mr-2" /> Warn
                            Vendor
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onUpdateStatus(v.name, v.status)}>
                            {v.status === 'suspended' ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />{' '}
                                Activate Vendor
                              </>
                            ) : (
                              <>
                                <Pause className="w-4 h-4 mr-2" /> Suspend
                                (Timed)
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleAdvancedAction(
                                'ban',
                                'vendor',
                                v.name,
                                v.name,
                              )
                            }>
                            <Ban className="w-4 h-4 mr-2" /> Ban Vendor
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete(v.name)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Vendor
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
      <AddVendorModal
        open={isVendorModalOpen}
        onOpenChange={setIsVendorModalOpen}
        onAdd={handleAddVendor}
        vendor={newVendor}
        setVendor={setNewVendor}
      />
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
    </div>
  );
}

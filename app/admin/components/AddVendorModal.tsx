'use client';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Store} from 'lucide-react';

interface AddVendorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: () => void;
  vendor: any;
  setVendor: any;
}

export function AddVendorModal({
  open,
  onOpenChange,
  onAdd,
  vendor,
  setVendor,
}: AddVendorModalProps) {
  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-md">
        <ResponsiveModalHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <ResponsiveModalTitle>Add New Vendor</ResponsiveModalTitle>
              <ResponsiveModalDescription>
                Create a new vendor account
              </ResponsiveModalDescription>
            </div>
          </div>
        </ResponsiveModalHeader>

        <div className="px-4 md:px-6 py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vendor-name" className="text-sm font-medium">
              Vendor Name
            </Label>
            <Input
              id="vendor-name"
              placeholder="e.g. Sweet Delights"
              value={vendor.name}
              onChange={e => setVendor({...vendor, name: e.target.value})}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor-email" className="text-sm font-medium">
              Vendor Email
            </Label>
            <Input
              id="vendor-email"
              type="email"
              placeholder="vendor@email.com"
              value={vendor.email}
              onChange={e => setVendor({...vendor, email: e.target.value})}
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="vendor-products" className="text-sm font-medium">
                Initial Products
              </Label>
              <Input
                id="vendor-products"
                type="number"
                value={vendor.products}
                onChange={e =>
                  setVendor({...vendor, products: parseInt(e.target.value) || 0})
                }
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-status" className="text-sm font-medium">
                Status
              </Label>
              <Select
                value={vendor.status}
                onValueChange={v => setVendor({...vendor, status: v})}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <ResponsiveModalFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-11">
            Cancel
          </Button>
          <Button
            variant="hero"
            onClick={onAdd}
            className="w-full sm:w-auto h-11">
            Add Vendor
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

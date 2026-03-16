'use client';

import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Vendor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="vendor-name">Vendor Name</Label>
            <Input
              id="vendor-name"
              placeholder="e.g. Sweet Delights"
              value={vendor.name}
              onChange={e => setVendor({...vendor, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor-email">Vendor Email</Label>
            <Input
              id="vendor-email"
              placeholder="vendor@email.com"
              value={vendor.email}
              onChange={e => setVendor({...vendor, email: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor-products">Initial Products</Label>
              <Input
                id="vendor-products"
                type="number"
                value={vendor.products}
                onChange={e =>
                  setVendor({...vendor, products: parseInt(e.target.value)})
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-status">Status</Label>
              <Select
                value={vendor.status}
                onValueChange={v => setVendor({...vendor, status: v})}>
                <SelectTrigger>
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
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="hero" onClick={onAdd}>
            Add Vendor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

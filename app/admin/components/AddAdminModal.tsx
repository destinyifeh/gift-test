'use client';

import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

interface AddAdminModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: () => void;
  admin: any;
  setAdmin: any;
  isEditing: boolean;
}

export function AddAdminModal({
  isOpen,
  onOpenChange,
  onAdd,
  admin,
  setAdmin,
  isEditing,
}: AddAdminModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Admin Account' : 'Add New Admin'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modify administrative account settings and permissions.'
              : 'Create a new administrative account and assign roles/permissions.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                placeholder="Admin Name"
                value={admin.name}
                onChange={e => setAdmin({...admin, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                placeholder="admin@gifthance.com"
                value={admin.email}
                onChange={e => setAdmin({...admin, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={admin.role}
              onValueChange={v => setAdmin({...admin, role: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Super Admin">Super Admin</SelectItem>
                <SelectItem value="Finance Admin">Finance Admin</SelectItem>
                <SelectItem value="Support Admin">Support Admin</SelectItem>
                <SelectItem value="Moderation Admin">
                  Moderation Admin
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Permissions</Label>
            <div className="grid grid-cols-2 gap-3 p-3 border border-border rounded-lg">
              {[
                'Users',
                'Campaigns',
                'Vendors',
                'Finance',
                'Moderation',
                'Reports',
                'Integrations',
                'Settings',
              ].map(permission => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={`perm-${permission}`}
                    checked={admin.permissions.includes(permission)}
                    onCheckedChange={(checked: boolean) => {
                      const currentPerms = admin.permissions
                        ? admin.permissions.split(', ').filter(Boolean)
                        : [];
                      let newPerms: string[];
                      if (checked) {
                        newPerms = [...currentPerms, permission];
                      } else {
                        newPerms = currentPerms.filter(
                          (p: string) => p !== permission,
                        );
                      }
                      setAdmin({
                        ...admin,
                        permissions: newPerms.join(', '),
                      });
                    }}
                  />
                  <Label
                    htmlFor={`perm-${permission}`}
                    className="text-sm font-normal cursor-pointer">
                    {permission}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Define the areas this admin can access.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="hero" onClick={onAdd}>
            {isEditing ? 'Save Changes' : 'Create Admin Account'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

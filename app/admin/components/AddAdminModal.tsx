'use client';

import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
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
import {UserCog} from 'lucide-react';

interface AddAdminModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: () => void;
  admin: any;
  setAdmin: any;
  isEditing: boolean;
}

const PERMISSIONS = [
  'Users',
  'Campaigns',
  'Vendors',
  'Finance',
  'Moderation',
  'Reports',
  'Integrations',
  'Settings',
];

export function AddAdminModal({
  isOpen,
  onOpenChange,
  onAdd,
  admin,
  setAdmin,
  isEditing,
}: AddAdminModalProps) {
  const handlePermissionChange = (permission: string, checked: boolean) => {
    const currentPerms = admin.permissions
      ? admin.permissions.split(', ').filter(Boolean)
      : [];
    let newPerms: string[];
    if (checked) {
      newPerms = [...currentPerms, permission];
    } else {
      newPerms = currentPerms.filter((p: string) => p !== permission);
    }
    setAdmin({
      ...admin,
      permissions: newPerms.join(', '),
    });
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-lg">
        <ResponsiveModalHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserCog className="w-5 h-5 text-primary" />
            </div>
            <div>
              <ResponsiveModalTitle>
                {isEditing ? 'Edit Admin Account' : 'Add New Admin'}
              </ResponsiveModalTitle>
              <ResponsiveModalDescription>
                {isEditing
                  ? 'Modify administrative account settings'
                  : 'Create a new administrative account'}
              </ResponsiveModalDescription>
            </div>
          </div>
        </ResponsiveModalHeader>

        <div className="px-4 md:px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Full Name</Label>
              <Input
                placeholder="Admin Name"
                value={admin.name}
                onChange={e => setAdmin({...admin, name: e.target.value})}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email Address</Label>
              <Input
                type="email"
                placeholder="admin@gifthance.com"
                value={admin.email}
                onChange={e => setAdmin({...admin, email: e.target.value})}
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Role</Label>
            <Select
              value={admin.role}
              onValueChange={v => setAdmin({...admin, role: v})}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Super Admin">Super Admin</SelectItem>
                <SelectItem value="Finance Admin">Finance Admin</SelectItem>
                <SelectItem value="Support Admin">Support Admin</SelectItem>
                <SelectItem value="Moderation Admin">Moderation Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Permissions</Label>
            <div className="grid grid-cols-2 gap-3 p-4 border border-border rounded-xl bg-muted/30">
              {PERMISSIONS.map(permission => (
                <div key={permission} className="flex items-center space-x-3">
                  <Checkbox
                    id={`perm-${permission}`}
                    checked={admin.permissions?.includes(permission)}
                    onCheckedChange={(checked: boolean) =>
                      handlePermissionChange(permission, checked)
                    }
                  />
                  <Label
                    htmlFor={`perm-${permission}`}
                    className="text-sm font-normal cursor-pointer">
                    {permission}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Define the areas this admin can access
            </p>
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
            {isEditing ? 'Save Changes' : 'Create Admin'}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

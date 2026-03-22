import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Switch} from '@/components/ui/switch';
import {useEffect, useState} from 'react';

interface ManageRolesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onSave: (roles: string[], adminRole: string | null) => void;
  isLoading: boolean;
}

const AVAILABLE_ROLES = [
  {id: 'user', label: 'User (Default)', disabled: true},
  {id: 'vendor', label: 'Vendor', disabled: false},
  {id: 'partner', label: 'Partner', disabled: false},
  {id: 'admin', label: 'Admin', disabled: false},
];

const ADMIN_SUBROLES = ['support', 'finance', 'mod', 'super_admin'];

export function ManageRolesModal({
  isOpen,
  onOpenChange,
  user,
  onSave,
  isLoading,
}: ManageRolesModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [adminRole, setAdminRole] = useState<string | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      setSelectedRoles(user.roles || ['user']);
      setAdminRole(user.admin_role || null);
    }
  }, [user, isOpen]);

  const toggleRole = (roleId: string, checked: boolean) => {
    if (roleId === 'user') return; // Cannot toggle base user role
    setSelectedRoles(prev =>
      checked ? [...prev, roleId] : prev.filter(r => r !== roleId),
    );
  };

  const handleSave = () => {
    onSave(selectedRoles, selectedRoles.includes('admin') ? adminRole : null);
  };

  const isAdminSelected = selectedRoles.includes('admin');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Manage Roles for{' '}
            <span className="capitalize">
              {user?.display_name || user?.username}
            </span>
          </DialogTitle>
          <DialogDescription>
            Assign or revoke system roles and admin privileges.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            {AVAILABLE_ROLES.map(role => (
              <div key={role.id} className="flex items-center justify-between">
                <Label htmlFor={`role-${role.id}`} className="flex flex-col">
                  <span className="font-medium">{role.label}</span>
                </Label>
                <Switch
                  id={`role-${role.id}`}
                  checked={selectedRoles.includes(role.id)}
                  onCheckedChange={checked => toggleRole(role.id, checked)}
                  disabled={role.disabled || isLoading}
                />
              </div>
            ))}
          </div>

          {isAdminSelected && (
            <div className="space-y-3 pt-4 border-t border-border">
              <Label>Admin Sub-Role</Label>
              <Select
                value={adminRole || 'support'}
                onValueChange={setAdminRole}
                disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select admin sub-role" />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_SUBROLES.map(role => (
                    <SelectItem key={role} value={role} className="capitalize">
                      {role.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import {Button} from '@/components/ui/button';
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
import {Switch} from '@/components/ui/switch';
import {Loader2, UserCog} from 'lucide-react';
import {useEffect, useState} from 'react';

interface ManageRolesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onSave: (roles: string[], adminRole: string | null) => void;
  isLoading: boolean;
}

const AVAILABLE_ROLES = [
  {id: 'user', label: 'User', description: 'Default role for all users', disabled: true},
  {id: 'vendor', label: 'Vendor', description: 'Can sell products', disabled: false},
  {id: 'partner', label: 'Partner', description: 'Partner privileges', disabled: false},
  {id: 'admin', label: 'Admin', description: 'Administrative access', disabled: false},
];

const ADMIN_SUBROLES = [
  {id: 'support', label: 'Support'},
  {id: 'finance', label: 'Finance'},
  {id: 'mod', label: 'Moderator'},
  {id: 'super_admin', label: 'Super Admin'},
];

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
    if (roleId === 'user') return;
    setSelectedRoles(prev =>
      checked ? [...prev, roleId] : prev.filter(r => r !== roleId),
    );
  };

  const handleSave = () => {
    onSave(selectedRoles, selectedRoles.includes('admin') ? adminRole : null);
  };

  const isAdminSelected = selectedRoles.includes('admin');

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-md">
        <ResponsiveModalHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserCog className="w-5 h-5 text-primary" />
            </div>
            <div>
              <ResponsiveModalTitle>
                Manage Roles
              </ResponsiveModalTitle>
              <ResponsiveModalDescription>
                <span className="capitalize">
                  {user?.display_name || user?.username}
                </span>
              </ResponsiveModalDescription>
            </div>
          </div>
        </ResponsiveModalHeader>

        <div className="px-4 md:px-6 py-4 space-y-4">
          {/* Role Toggles */}
          <div className="space-y-3">
            {AVAILABLE_ROLES.map(role => (
              <div
                key={role.id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div>
                  <Label
                    htmlFor={`role-${role.id}`}
                    className="text-sm font-medium cursor-pointer">
                    {role.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{role.description}</p>
                </div>
                <Switch
                  id={`role-${role.id}`}
                  checked={selectedRoles.includes(role.id)}
                  onCheckedChange={checked => toggleRole(role.id, checked)}
                  disabled={role.disabled || isLoading}
                />
              </div>
            ))}
          </div>

          {/* Admin Sub-Role */}
          {isAdminSelected && (
            <div className="space-y-3 pt-3 border-t border-border">
              <Label className="text-sm font-medium">Admin Sub-Role</Label>
              <Select
                value={adminRole || 'support'}
                onValueChange={setAdminRole}
                disabled={isLoading}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select admin sub-role" />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_SUBROLES.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Determines administrative permissions level
              </p>
            </div>
          )}
        </div>

        <ResponsiveModalFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto h-11">
            Cancel
          </Button>
          <Button
            variant="hero"
            onClick={handleSave}
            disabled={isLoading}
            className="w-full sm:w-auto h-11">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

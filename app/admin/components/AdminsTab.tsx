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
  Eye,
  MoreVertical,
  Pause,
  Settings,
  Trash2,
  Users,
} from 'lucide-react';
import React, {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {AddAdminModal} from './AddAdminModal';
import {Admin} from './mock';
import {statusBadge} from './utils';

interface AdminsTabProps {
  admins: Admin[];
  setAdmins: React.Dispatch<React.SetStateAction<Admin[]>>;
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

export function AdminsTab({
  admins,
  setAdmins,
  searchQuery,
  addLog,
  setViewDetailsModal,
}: AdminsTabProps) {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [advancedModal, setAdvancedModal] = useState<{
    isOpen: boolean;
    type: 'warn' | 'suspend' | 'ban' | 'remove' | 'activate';
    targetId: string;
    targetName: string;
  }>({
    isOpen: false,
    type: 'warn',
    targetId: '',
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
      targetId,
      targetName,
    });
  };

  const onConfirmAdvancedAction = (data: {days?: string; reason: string}) => {
    const {type, targetName} = advancedModal;
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    const logMessage = `${formattedType}ed admin ${targetName}. Reason: ${data.reason}`;

    if (type === 'suspend' || type === 'ban') {
      setAdmins(prev =>
        prev.map(a =>
          a.name === targetName ? {...a, status: 'suspended'} : a,
        ),
      );
    } else if (type === 'remove') {
      setAdmins(prev => prev.filter(a => a.name !== targetName));
    } else if (type === 'activate') {
      setAdmins(prev =>
        prev.map(a => (a.name === targetName ? {...a, status: 'active'} : a)),
      );
    }

    toast.success(`${formattedType} action confirmed for ${targetName}`);
    addLog(logMessage);
    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  const [adminToEdit, setAdminToEdit] = useState<Admin | null>(null);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    role: 'Support Admin' as const,
    permissions: '',
  });

  const handleAddAdmin = () => {
    if (!newAdmin.name || !newAdmin.email) {
      toast.error('Please fill in Name and Email');
      return;
    }

    if (adminToEdit) {
      setAdmins(
        admins.map(a =>
          a.id === adminToEdit.id
            ? {
                ...a,
                name: newAdmin.name,
                email: newAdmin.email,
                role: newAdmin.role,
                permissions: newAdmin.permissions,
              }
            : a,
        ),
      );
      toast.success('Admin account updated');
      addLog(`Updated admin account for ${newAdmin.name}`);
      setAdminToEdit(null);
    } else {
      const adminToAdd: Admin = {
        ...newAdmin,
        id: `ADM${Math.floor(Math.random() * 1000)}`,
        lastLogin: 'Never',
        status: 'active',
      };
      setAdmins([...admins, adminToAdd]);
      toast.success('Admin account created');
      addLog(`Created admin account for ${adminToAdd.name}`);
    }

    setIsAdminModalOpen(false);
    setNewAdmin({
      name: '',
      email: '',
      role: 'Support Admin',
      permissions: '',
    });
  };

  const onToggleStatus = (adminName: string, currentStatus: string) => {
    const action = currentStatus === 'active' ? 'suspend' : 'activate';
    handleAdvancedAction(action, 'admin', adminName, adminName);
  };

  const onRemove = (name: string, id: string) => {
    handleAdvancedAction('remove', 'admin', id || name, name);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{admins.length} admin accounts</p>
        <Button
          variant="hero"
          size="sm"
          onClick={() => {
            setAdminToEdit(null);
            setNewAdmin({
              name: '',
              email: '',
              role: 'Support Admin',
              permissions: '',
            });
            setIsAdminModalOpen(true);
          }}>
          <Users className="w-4 h-4 mr-1" /> Add Admin
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 font-medium">Name</th>
              <th className="text-left py-2 font-medium">Role</th>
              <th className="text-left py-2 font-medium">Permissions</th>
              <th className="text-left py-2 font-medium">Last Login</th>
              <th className="text-left py-2 font-medium pl-6">Status</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins
              .filter(
                a =>
                  a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  a.email.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map((a: any) => (
                <tr
                  key={a.name}
                  className="border-b border-border last:border-0">
                  <td className="py-3 font-medium text-foreground">{a.name}</td>
                  <td className="py-3">
                    <Badge variant="outline">{a.role}</Badge>
                  </td>
                  <td className="py-3 text-sm text-muted-foreground max-w-xs truncate">
                    {a.permissions}
                  </td>
                  <td className="py-3 text-muted-foreground">{a.lastLogin}</td>
                  <td className="py-3 pl-6">
                    <Badge variant={statusBadge(a.status) as any}>
                      {a.status}
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
                                title: 'Admin Details',
                                data: a,
                              })
                            }>
                            <Eye className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setAdminToEdit(a);
                              setNewAdmin({
                                name: a.name,
                                email: a.email,
                                role: a.role as any,
                                permissions: a.permissions,
                              });
                              setIsAdminModalOpen(true);
                            }}>
                            <Settings className="w-4 h-4 mr-2" /> Edit Admin
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleAdvancedAction(
                                'warn',
                                'admin',
                                a.name,
                                a.name,
                              )
                            }>
                            <AlertTriangle className="w-4 h-4 mr-2" /> Warn
                            Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onToggleStatus(a.name, a.status)}>
                            {a.status === 'suspended' ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />{' '}
                                Activate Admin
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
                                'admin',
                                a.name,
                                a.name,
                              )
                            }>
                            <Ban className="w-4 h-4 mr-2" /> Ban Admin
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onRemove(a.name, a.id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Remove Admin
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
      <AddAdminModal
        isOpen={isAdminModalOpen}
        onOpenChange={setIsAdminModalOpen}
        onAdd={handleAddAdmin}
        admin={newAdmin}
        setAdmin={setNewAdmin}
        isEditing={!!adminToEdit}
      />
      <ActionAdvancedModal
        isOpen={advancedModal.isOpen}
        onOpenChange={open =>
          setAdvancedModal(prev => ({...prev, isOpen: open}))
        }
        type={advancedModal.type}
        targetType="admin"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />
    </div>
  );
}

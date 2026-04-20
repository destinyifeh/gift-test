'use client';

import {useIsMobile} from '@/hooks/use-mobile';
import {
  fetchAdminUsers,
  updateUserRole,
  updateUserSystemStatus,
} from '@/lib/server/actions/admin';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {useDeleteUser} from '@/hooks/use-admin';

interface V2AdminRolesTabProps {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

const AVAILABLE_ROLES = [
  {id: 'user', label: 'User', description: 'Default role for all users', disabled: true},
  {id: 'vendor', label: 'Vendor', description: 'Can sell products', disabled: false},
  {id: 'admin', label: 'Admin', description: 'Administrative access', disabled: false},
];

const ADMIN_SUBROLES = [
  {id: 'support', label: 'Support'},
  {id: 'finance', label: 'Finance'},
  {id: 'moderator', label: 'Moderator'},
  {id: 'superadmin', label: 'Super Admin'},
];

type FilterType = 'all' | 'admin' | 'vendor' | 'user';

export function V2AdminRolesTab({
  searchQuery: externalSearchQuery,
  addLog,
}: V2AdminRolesTabProps) {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Local search state
  const [localSearch, setLocalSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewDetailsModal, setViewDetailsModal] = useState<{isOpen: boolean; user: any}>({
    isOpen: false,
    user: null,
  });
  const [manageRolesModal, setManageRolesModal] = useState<{isOpen: boolean; user: any}>({
    isOpen: false,
    user: null,
  });
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'warn' | 'suspend' | 'ban' | 'activate' | 'delete';
    user: any;
  }>({isOpen: false, type: 'warn', user: null});
  const [actionReason, setActionReason] = useState('');
  const [suspensionDays, setSuspensionDays] = useState('7');

  // Bottom sheet for mobile actions
  const [mobileActionSheet, setMobileActionSheet] = useState<{isOpen: boolean; user: any}>({
    isOpen: false,
    user: null,
  });

  // Desktop dropdown
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Manage roles state
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [adminRole, setAdminRole] = useState<string | null>(null);

  // Add admin form state
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    role: 'support',
  });

  // Fetch ALL users (not just admins)
  const {data: usersData, isLoading} = useQuery({
    queryKey: ['admin-all-users', externalSearchQuery],
    queryFn: () => fetchAdminUsers({search: externalSearchQuery, pageParam: 0}),
  });

  const allUsers = usersData?.data || [];

  // Filter users based on local search and filter type
  const filteredUsers = allUsers.filter((user: any) => {
    // Search filter
    const searchMatch = !localSearch ||
      user.username?.toLowerCase().includes(localSearch.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(localSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(localSearch.toLowerCase());

    // Role filter
    let roleMatch = true;
    if (filterType === 'admin') {
      roleMatch = user.roles?.includes('admin') || !!user.adminRole;
    } else if (filterType === 'vendor') {
      roleMatch = user.roles?.includes('vendor');
    } else if (filterType === 'user') {
      // Users who are only regular users (no admin/vendor)
      roleMatch = !user.roles?.includes('admin') && !user.roles?.includes('vendor') && !user.adminRole;
    }

    return searchMatch && roleMatch;
  });

  // Calculate stats
  const stats = {
    totalAdmins: allUsers.filter((u: any) => u.roles?.includes('admin') || u.adminRole).length,
    superAdmins: allUsers.filter((u: any) => u.adminRole === 'superadmin').length,
    supportAdmins: allUsers.filter((u: any) => u.adminRole === 'support').length,
    financeAdmins: allUsers.filter((u: any) => u.adminRole === 'finance').length,
    moderators: allUsers.filter((u: any) => u.adminRole === 'mod' || u.adminRole === 'moderator').length,
    vendors: allUsers.filter((u: any) => u.roles?.includes('vendor')).length,
    regularUsers: allUsers.filter((u: any) => !u.roles?.includes('admin') && !u.roles?.includes('vendor') && !u.adminRole).length,
    totalUsers: allUsers.length,
  };

  // Role mutation
  const roleMutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: (result, vars) => {
      if (!result.success) {
        toast.error(result.error || 'Failed to update roles');
        return;
      }
      toast.success('User roles updated!');
      queryClient.invalidateQueries({queryKey: ['admin-all-users']});
      const targetUser = manageRolesModal.user;
      const roleList = vars.roles.join(', ');
      const adminSub = vars.adminRole ? ` (admin sub-role: ${vars.adminRole})` : '';
      addLog(`Updated roles for @${targetUser?.username || 'unknown'} → [${roleList}]${adminSub}`);
      setManageRolesModal({isOpen: false, user: null});
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update roles');
    },
  });

  // Status mutation
  const statusMutation = useMutation({
    mutationFn: ({id, updates}: {id: string; updates: any}) => updateUserSystemStatus(id, updates),
    onSuccess: (res, vars) => {
      if (!res.success) {
        toast.error(res.error || 'Failed to update status');
        return;
      }
      queryClient.invalidateQueries({queryKey: ['admin-all-users']});
      toast.success('User status updated');
      addLog(`Changed status of user ${vars.id.slice(0, 8)}… to "${vars.updates.status}"`);
      setActionModal({isOpen: false, type: 'warn', user: null});
      setActionReason('');
    },
    onError: () => toast.error('Failed to change user access'),
  });

  const deleteMutation = useDeleteUser();

  // Initialize manage roles modal state when opened
  useEffect(() => {
    if (manageRolesModal.user && manageRolesModal.isOpen) {
      setSelectedRoles(manageRolesModal.user.roles || ['user']);
      setAdminRole(manageRolesModal.user.adminRole || null);
    }
  }, [manageRolesModal.user, manageRolesModal.isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => setOpenDropdownId(null);
    if (openDropdownId) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [openDropdownId]);

  const toggleRole = (roleId: string, checked: boolean) => {
    if (roleId === 'user') return;
    setSelectedRoles(prev => (checked ? [...prev, roleId] : prev.filter(r => r !== roleId)));
  };

  const handleSaveRoles = () => {
    if (!manageRolesModal.user) return;
    roleMutation.mutate({
      userId: manageRolesModal.user.id,
      roles: selectedRoles,
      adminRole: selectedRoles.includes('admin') ? adminRole : null,
    });
  };

  const handleStatusAction = () => {
    const {type, user} = actionModal;
    if (!user) return;

    if (type === 'warn') {
      toast.info(`Warning sent to @${user.username}`);
      addLog(`Warned user @${user.username}: ${actionReason}`);
      setActionModal({isOpen: false, type: 'warn', user: null});
      setActionReason('');
    } else if (type === 'suspend') {
      const end = suspensionDays
        ? new Date(Date.now() + parseInt(suspensionDays) * 86400000).toISOString()
        : null;
      statusMutation.mutate({
        id: user.id,
        updates: {status: 'suspended', suspension_end: end},
      });
    } else if (type === 'ban') {
      statusMutation.mutate({id: user.id, updates: {status: 'banned'}});
    } else if (type === 'activate') {
      statusMutation.mutate({
        id: user.id,
        updates: {status: 'active', suspension_end: null},
      });
    } else if (type === 'delete') {
      deleteMutation.mutate(user.id, {
        onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['admin-all-users']});
          addLog(`Permanently deleted user @${user.username}`);
          setActionModal({isOpen: false, type: 'warn', user: null});
        }
      });
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Username', 'Display Name', 'Email', 'Roles', 'Admin Role', 'Status', 'Joined'].join(','),
      ...filteredUsers.map((u: any) =>
        [
          u.username,
          u.displayName || '',
          u.email || '',
          (u.roles || []).join('; '),
          u.adminRole || '',
          u.status || 'active',
          u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-roles-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Exported user list');
  };

  // Get display roles for a user
  const getUserRoles = (user: any) => {
    const roles: string[] = [];
    if (user.roles?.includes('admin') || user.adminRole) {
      const adminLabel = user.adminRole ? `Admin (${user.adminRole.replace('_', ' ')})` : 'Admin';
      roles.push(adminLabel);
    }
    if (user.roles?.includes('vendor')) roles.push('Vendor');
    if (user.roles?.includes('user')) roles.push('User');
    if (roles.length === 0) roles.push('User');
    return roles;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)] mt-3">Loading users...</p>
      </div>
    );
  }

  const isAdminSelected = selectedRoles.includes('admin');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
            Role Management
          </h2>
          <p className="text-[var(--v2-on-surface-variant)] mt-2 font-medium">
            Manage user roles and permissions across the platform.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] rounded-full font-bold text-sm hover:bg-[var(--v2-surface-container-highest)] transition-colors"
          >
            <span className="v2-icon text-lg">download</span>
            Export
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 v2-hero-gradient text-white rounded-full font-bold text-sm shadow-lg shadow-[var(--v2-primary)]/20"
          >
            <span className="v2-icon text-lg">person_add</span>
            Add Admin
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Admins Card */}
        <div
          className={`p-6 rounded-xl cursor-pointer transition-all ${
            filterType === 'admin'
              ? 'bg-[var(--v2-primary)] text-white ring-2 ring-[var(--v2-primary)] ring-offset-2'
              : 'bg-[var(--v2-primary-container)]/20 hover:bg-[var(--v2-primary-container)]/30'
          }`}
          onClick={() => setFilterType(filterType === 'admin' ? 'all' : 'admin')}
        >
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-bold uppercase tracking-wider ${filterType === 'admin' ? 'text-white/80' : 'text-[var(--v2-primary)]'}`}>
              Admins
            </p>
            <span className={`v2-icon ${filterType === 'admin' ? 'text-white' : 'text-[var(--v2-primary)]'}`}>
              admin_panel_settings
            </span>
          </div>
          <p className={`text-3xl font-black v2-headline ${filterType === 'admin' ? 'text-white' : ''}`}>
            {stats.totalAdmins}
          </p>
          <div className={`mt-3 pt-3 border-t ${filterType === 'admin' ? 'border-white/20' : 'border-[var(--v2-primary)]/10'} space-y-1`}>
            <div className="flex justify-between text-xs">
              <span className={filterType === 'admin' ? 'text-white/70' : 'text-[var(--v2-on-surface-variant)]'}>Super Admin</span>
              <span className="font-bold">{stats.superAdmins}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className={filterType === 'admin' ? 'text-white/70' : 'text-[var(--v2-on-surface-variant)]'}>Support</span>
              <span className="font-bold">{stats.supportAdmins}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className={filterType === 'admin' ? 'text-white/70' : 'text-[var(--v2-on-surface-variant)]'}>Finance</span>
              <span className="font-bold">{stats.financeAdmins}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className={filterType === 'admin' ? 'text-white/70' : 'text-[var(--v2-on-surface-variant)]'}>Moderator</span>
              <span className="font-bold">{stats.moderators}</span>
            </div>
          </div>
        </div>

        {/* Vendors Card */}
        <div
          className={`p-6 rounded-xl cursor-pointer transition-all ${
            filterType === 'vendor'
              ? 'bg-purple-600 text-white ring-2 ring-purple-600 ring-offset-2'
              : 'bg-purple-100 hover:bg-purple-200'
          }`}
          onClick={() => setFilterType(filterType === 'vendor' ? 'all' : 'vendor')}
        >
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-bold uppercase tracking-wider ${filterType === 'vendor' ? 'text-white/80' : 'text-purple-700'}`}>
              Vendors
            </p>
            <span className={`v2-icon ${filterType === 'vendor' ? 'text-white' : 'text-purple-700'}`}>
              storefront
            </span>
          </div>
          <p className={`text-3xl font-black v2-headline ${filterType === 'vendor' ? 'text-white' : ''}`}>
            {stats.vendors}
          </p>
          <p className={`text-xs mt-2 ${filterType === 'vendor' ? 'text-white/70' : 'text-purple-600'}`}>
            Users who can sell products
          </p>
        </div>

        {/* Users Card */}
        <div
          className={`p-6 rounded-xl cursor-pointer transition-all ${
            filterType === 'user'
              ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
              : 'bg-blue-100 hover:bg-blue-200'
          }`}
          onClick={() => setFilterType(filterType === 'user' ? 'all' : 'user')}
        >
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-bold uppercase tracking-wider ${filterType === 'user' ? 'text-white/80' : 'text-blue-700'}`}>
              Regular Users
            </p>
            <span className={`v2-icon ${filterType === 'user' ? 'text-white' : 'text-blue-700'}`}>
              group
            </span>
          </div>
          <p className={`text-3xl font-black v2-headline ${filterType === 'user' ? 'text-white' : ''}`}>
            {stats.regularUsers}
          </p>
          <p className={`text-xs mt-2 ${filterType === 'user' ? 'text-white/70' : 'text-blue-600'}`}>
            Total: {stats.totalUsers} users
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <span className="v2-icon absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]">
            search
          </span>
          <input
            type="text"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            placeholder="Search by name, username, or email..."
            className="w-full pl-12 pr-4 py-3 bg-[var(--v2-surface-container)] rounded-full border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
          />
        </div>
        {filterType !== 'all' && (
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className="flex items-center gap-2 px-4 py-3 bg-[var(--v2-surface-container)] rounded-full text-sm font-medium hover:bg-[var(--v2-surface-container-high)] transition-colors"
          >
            <span className="v2-icon text-lg">filter_alt_off</span>
            Clear Filter
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 md:px-8 py-6 border-b border-[var(--v2-surface-container)] flex items-center justify-between">
          <h4 className="v2-headline font-bold text-lg">
            {filterType === 'all' ? 'All Users' : filterType === 'admin' ? 'Admin Users' : filterType === 'vendor' ? 'Vendors' : 'Regular Users'}
          </h4>
          <span className="text-sm text-[var(--v2-on-surface-variant)]">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <span className="v2-icon text-6xl text-[var(--v2-on-surface-variant)]/20">
              person_search
            </span>
            <p className="text-sm text-[var(--v2-on-surface-variant)] mt-4">No users found</p>
            {(localSearch || filterType !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  setFilterType('all');
                }}
                className="mt-4 px-4 py-2 text-[var(--v2-primary)] font-medium text-sm hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : isMobile ? (
          // Mobile Card View
          <div className="divide-y divide-[var(--v2-surface-container)]">
            {filteredUsers.map((user: any) => {
              const userRoles = getUserRoles(user);
              const statusColor =
                user.status === 'active' || !user.status
                  ? 'bg-emerald-100 text-emerald-700'
                  : user.status === 'suspended'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-600';

              return (
                <div key={user.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center font-bold text-[var(--v2-primary)] shrink-0">
                        {(user.displayName || user.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold capitalize truncate">
                          {user.displayName || user.username}
                        </p>
                        <p className="text-sm text-[var(--v2-on-surface-variant)] truncate">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileActionSheet({isOpen: true, user})}
                      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--v2-surface-container)] transition-colors"
                    >
                      <span className="v2-icon">more_vert</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--v2-surface-container)] flex-wrap">
                    {userRoles.map((role, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          role.includes('Admin')
                            ? 'bg-[var(--v2-primary-container)]/20 text-[var(--v2-primary)]'
                            : role === 'Vendor'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {role}
                      </span>
                    ))}
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusColor}`}>
                      {user.status || 'active'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Desktop Table View
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--v2-surface-container)]/30">
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  User
                </th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Roles
                </th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Email
                </th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Status
                </th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Joined
                </th>
                <th className="px-8 py-4 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--v2-surface-container)]">
              {filteredUsers.map((user: any) => {
                const userRoles = getUserRoles(user);
                const statusColor =
                  user.status === 'active' || !user.status
                    ? 'bg-emerald-100 text-emerald-700'
                    : user.status === 'suspended'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-600';
                const isDropdownOpen = openDropdownId === user.id;
                const isBannedOrSuspended = user.status === 'banned' || user.status === 'suspended';

                return (
                  <tr key={user.id} className="hover:bg-[var(--v2-surface-container)]/20">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center font-bold text-[var(--v2-primary)]">
                          {(user.displayName || user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold capitalize">
                            {user.displayName || user.username}
                          </p>
                          <p className="text-xs text-[var(--v2-on-surface-variant)]">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex flex-wrap gap-1">
                        {userRoles.map((role, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              role.includes('Admin')
                                ? 'bg-[var(--v2-primary-container)]/20 text-[var(--v2-primary)]'
                                : role === 'Vendor'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-[var(--v2-on-surface-variant)]">
                      {user.email || '—'}
                    </td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusColor}`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-[var(--v2-on-surface-variant)]">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-8 py-4">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(isDropdownOpen ? null : user.id);
                          }}
                          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--v2-surface-container)] transition-colors"
                        >
                          <span className="v2-icon">more_vert</span>
                        </button>

                        {isDropdownOpen && (
                          <div
                            className="absolute right-0 top-full mt-1 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2"
                            style={{ zIndex: 50 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                              Actions
                            </p>

                            <button
                              type="button"
                              onClick={() => {
                                setViewDetailsModal({isOpen: true, user});
                                setOpenDropdownId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                            >
                              <span className="v2-icon text-lg text-gray-600">visibility</span>
                              <span className="text-sm font-medium text-gray-700">View Details</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setManageRolesModal({isOpen: true, user});
                                setOpenDropdownId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                            >
                              <span className="v2-icon text-lg text-gray-600">shield_person</span>
                              <span className="text-sm font-medium text-gray-700">Manage Roles</span>
                            </button>

                            <div className="h-px bg-gray-100 my-2" />

                            {isBannedOrSuspended ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setActionModal({isOpen: true, type: 'activate', user});
                                  setOpenDropdownId(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 transition-colors text-left"
                              >
                                <span className="v2-icon text-lg text-emerald-600">restore</span>
                                <span className="text-sm font-medium text-emerald-600">Restore Access</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActionModal({isOpen: true, type: 'warn', user});
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                                >
                                  <span className="v2-icon text-lg text-gray-600">warning</span>
                                  <span className="text-sm font-medium text-gray-700">Warn</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActionModal({isOpen: true, type: 'suspend', user});
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 transition-colors text-left"
                                >
                                  <span className="v2-icon text-lg text-amber-600">pause_circle</span>
                                  <span className="text-sm font-medium text-amber-600">Suspend</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActionModal({isOpen: true, type: 'ban', user});
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left"
                                >
                                  <span className="v2-icon text-lg text-red-600">block</span>
                                  <span className="text-sm font-medium text-red-600">Ban</span>
                                </button>
                              </>
                            )}

                            <div className="h-px bg-gray-100 my-2" />
                            
                            <button
                              type="button"
                              onClick={() => {
                                setActionModal({isOpen: true, type: 'delete', user});
                                setOpenDropdownId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left"
                            >
                              <span className="v2-icon text-lg text-red-600">delete_forever</span>
                              <span className="text-sm font-medium text-red-600">Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Bottom Sheet for Actions */}
      {mobileActionSheet.isOpen && mobileActionSheet.user && (
        <div className="fixed inset-0 md:hidden" style={{ zIndex: 10000 }}>
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileActionSheet({isOpen: false, user: null})}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="px-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center font-bold text-[var(--v2-primary)]">
                  {(mobileActionSheet.user.displayName || mobileActionSheet.user.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold capitalize">
                    {mobileActionSheet.user.displayName || mobileActionSheet.user.username}
                  </p>
                  <p className="text-sm text-gray-500">@{mobileActionSheet.user.username}</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setViewDetailsModal({isOpen: true, user: mobileActionSheet.user});
                  setMobileActionSheet({isOpen: false, user: null});
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="v2-icon text-blue-600">visibility</span>
                </div>
                <span className="font-medium">View Details</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setManageRolesModal({isOpen: true, user: mobileActionSheet.user});
                  setMobileActionSheet({isOpen: false, user: null});
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="v2-icon text-purple-600">shield_person</span>
                </div>
                <span className="font-medium">Manage Roles</span>
              </button>

              <div className="h-px bg-gray-100 my-2" />

              {mobileActionSheet.user.status === 'banned' || mobileActionSheet.user.status === 'suspended' ? (
                <button
                  type="button"
                  onClick={() => {
                    setActionModal({isOpen: true, type: 'activate', user: mobileActionSheet.user});
                    setMobileActionSheet({isOpen: false, user: null});
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-emerald-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="v2-icon text-emerald-600">restore</span>
                  </div>
                  <span className="font-medium text-emerald-600">Restore Access</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setActionModal({isOpen: true, type: 'warn', user: mobileActionSheet.user});
                      setMobileActionSheet({isOpen: false, user: null});
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="v2-icon text-gray-600">warning</span>
                    </div>
                    <span className="font-medium">Warn User</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionModal({isOpen: true, type: 'suspend', user: mobileActionSheet.user});
                      setMobileActionSheet({isOpen: false, user: null});
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-amber-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <span className="v2-icon text-amber-600">pause_circle</span>
                    </div>
                    <span className="font-medium text-amber-600">Suspend User</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionModal({isOpen: true, type: 'ban', user: mobileActionSheet.user});
                      setMobileActionSheet({isOpen: false, user: null});
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="v2-icon text-red-600">block</span>
                    </div>
                    <span className="font-medium text-red-600">Ban User</span>
                  </button>
                </>
              )}

              <div className="h-px bg-gray-100 my-2 mx-2" />

              <button
                type="button"
                onClick={() => {
                  setActionModal({isOpen: true, type: 'delete', user: mobileActionSheet.user});
                  setMobileActionSheet({isOpen: false, user: null});
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="v2-icon text-red-600">delete_forever</span>
                </div>
                <span className="font-medium text-red-600">Delete User</span>
              </button>
            </div>

            <div className="p-4 pt-0">
              <button
                type="button"
                onClick={() => setMobileActionSheet({isOpen: false, user: null})}
                className="w-full py-4 bg-gray-100 rounded-2xl font-bold text-gray-600"
              >
                Cancel
              </button>
            </div>
            <div className="h-8" />
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDetailsModal.isOpen && viewDetailsModal.user && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setViewDetailsModal({isOpen: false, user: null})}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold v2-headline">User Details</h3>
              <button
                type="button"
                onClick={() => setViewDetailsModal({isOpen: false, user: null})}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <span className="v2-icon">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center font-bold text-2xl text-[var(--v2-primary)]">
                  {(viewDetailsModal.user.displayName || viewDetailsModal.user.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xl font-bold capitalize">
                    {viewDetailsModal.user.displayName || viewDetailsModal.user.username}
                  </p>
                  <p className="text-gray-500">@{viewDetailsModal.user.username}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="font-medium">{viewDetailsModal.user.email || '—'}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Roles</p>
                  <div className="flex flex-wrap gap-2">
                    {getUserRoles(viewDetailsModal.user).map((role, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          role.includes('Admin')
                            ? 'bg-[var(--v2-primary-container)]/20 text-[var(--v2-primary)]'
                            : role === 'Vendor'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                    <p className={`font-medium capitalize ${
                      viewDetailsModal.user.status === 'active' || !viewDetailsModal.user.status
                        ? 'text-emerald-600'
                        : viewDetailsModal.user.status === 'suspended'
                          ? 'text-amber-600'
                          : 'text-red-600'
                    }`}>
                      {viewDetailsModal.user.status || 'active'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Joined</p>
                    <p className="font-medium">
                      {viewDetailsModal.user.createdAt
                        ? new Date(viewDetailsModal.user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">User ID</p>
                  <p className="font-medium font-mono text-sm">{viewDetailsModal.user.id}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setManageRolesModal({isOpen: true, user: viewDetailsModal.user});
                    setViewDetailsModal({isOpen: false, user: null});
                  }}
                  className="flex-1 py-3 bg-gray-100 rounded-full font-bold flex items-center justify-center gap-2"
                >
                  <span className="v2-icon text-lg">shield_person</span>
                  Manage Roles
                </button>
                <button
                  type="button"
                  onClick={() => setViewDetailsModal({isOpen: false, user: null})}
                  className="flex-1 py-3 v2-hero-gradient text-white rounded-full font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center">
                <span className="v2-icon text-2xl text-[var(--v2-primary)]">person_add</span>
              </div>
              <div>
                <h3 className="text-xl font-bold v2-headline">Add New Admin</h3>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">
                  Grant admin access to a user
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={newAdmin.username}
                  onChange={e => setNewAdmin({...newAdmin, username: e.target.value})}
                  placeholder="Enter username"
                  className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2">
                  Admin Role
                </label>
                <select
                  value={newAdmin.role}
                  onChange={e => setNewAdmin({...newAdmin, role: e.target.value})}
                  className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
                >
                  <option value="support">Support</option>
                  <option value="mod">Moderator</option>
                  <option value="finance">Finance</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-[var(--v2-surface-container)] rounded-full font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newAdmin.username.trim()) {
                    toast.error('Please enter a username');
                    return;
                  }
                  toast.success(`Admin role granted to @${newAdmin.username}`);
                  addLog(`Granted admin role to @${newAdmin.username} with sub-role: ${newAdmin.role}`);
                  setNewAdmin({username: '', role: 'support'});
                  setShowAddModal(false);
                }}
                className="flex-1 py-3 v2-hero-gradient text-white rounded-full font-bold"
              >
                Add Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Roles Modal */}
      {manageRolesModal.isOpen && manageRolesModal.user && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setManageRolesModal({isOpen: false, user: null})}
          />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center">
                <span className="v2-icon text-2xl text-[var(--v2-primary)]">shield_person</span>
              </div>
              <div>
                <h3 className="text-xl font-bold v2-headline">Manage Roles</h3>
                <p className="text-sm text-[var(--v2-on-surface-variant)] capitalize">
                  {manageRolesModal.user.displayName || manageRolesModal.user.username}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {AVAILABLE_ROLES.map(role => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-[var(--v2-surface-container)]/50"
                >
                  <div>
                    <p className="text-sm font-bold">{role.label}</p>
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">{role.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => !role.disabled && toggleRole(role.id, !selectedRoles.includes(role.id))}
                    disabled={role.disabled || roleMutation.isPending}
                    className={`w-12 h-7 rounded-full transition-colors relative ${
                      selectedRoles.includes(role.id)
                        ? 'bg-[var(--v2-primary)]'
                        : 'bg-gray-300'
                    } ${role.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        selectedRoles.includes(role.id) ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            {isAdminSelected && (
              <div className="space-y-3 pt-4 border-t border-[var(--v2-surface-container)]">
                <label className="text-sm font-bold text-[var(--v2-on-surface)] block">
                  Admin Sub-Role
                </label>
                <select
                  value={adminRole || 'support'}
                  onChange={e => setAdminRole(e.target.value)}
                  disabled={roleMutation.isPending}
                  className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
                >
                  {ADMIN_SUBROLES.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[var(--v2-on-surface-variant)]">
                  Determines administrative permissions level
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setManageRolesModal({isOpen: false, user: null})}
                disabled={roleMutation.isPending}
                className="flex-1 py-3 bg-[var(--v2-surface-container)] rounded-full font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRoles}
                disabled={roleMutation.isPending}
                className="flex-1 py-3 v2-hero-gradient text-white rounded-full font-bold flex items-center justify-center gap-2"
              >
                {roleMutation.isPending ? (
                  <>
                    <span className="v2-icon text-lg animate-spin">progress_activity</span>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Warn/Suspend/Ban/Activate) */}
      {actionModal.isOpen && actionModal.user && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setActionModal({isOpen: false, type: 'warn', user: null});
              setActionReason('');
            }}
          />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  actionModal.type === 'activate'
                    ? 'bg-emerald-100 text-emerald-600'
                    : actionModal.type === 'ban' || actionModal.type === 'delete'
                      ? 'bg-red-100 text-red-600'
                      : actionModal.type === 'suspend'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-gray-100 text-gray-600'
                }`}
              >
                <span className="v2-icon text-2xl">
                  {actionModal.type === 'activate'
                    ? 'restore'
                    : actionModal.type === 'ban'
                      ? 'block'
                      : actionModal.type === 'delete'
                        ? 'delete_forever'
                        : actionModal.type === 'suspend'
                          ? 'pause_circle'
                          : 'warning'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold v2-headline capitalize">
                  {actionModal.type === 'activate' ? 'Restore Access' : actionModal.type === 'delete' ? 'Delete Permanently' : `${actionModal.type} User`}
                </h3>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">
                  @{actionModal.user.username}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {actionModal.type === 'suspend' && (
                <div>
                  <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2">
                    Suspension Duration (days)
                  </label>
                  <input
                    type="number"
                    value={suspensionDays}
                    onChange={e => setSuspensionDays(e.target.value)}
                    min="1"
                    max="365"
                    className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
                  />
                </div>
              )}

              {['warn', 'suspend', 'ban'].includes(actionModal.type) && (
                <div>
                  <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2">
                    Reason
                  </label>
                  <textarea
                    value={actionReason}
                    onChange={e => setActionReason(e.target.value)}
                    placeholder={`Reason for ${actionModal.type}ing this user...`}
                    rows={3}
                    className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none resize-none"
                  />
                </div>
              )}

              {actionModal.type === 'activate' && (
                <p className="text-sm text-[var(--v2-on-surface-variant)] bg-[var(--v2-surface-container)] p-4 rounded-xl">
                  This will restore full access for @{actionModal.user.username}. Any previous
                  suspension or ban will be lifted.
                </p>
              )}

              {actionModal.type === 'delete' && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <p className="text-sm text-red-700 font-bold mb-1">Warning: Permanent Deletion</p>
                  <p className="text-xs text-red-600 leading-relaxed">
                    This action cannot be undone. All data associated with @{actionModal.user.username} will be permanently removed.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setActionModal({isOpen: false, type: 'warn', user: null});
                  setActionReason('');
                }}
                disabled={statusMutation.isPending || deleteMutation.isPending}
                className="flex-1 py-3 bg-[var(--v2-surface-container)] rounded-full font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusAction}
                disabled={statusMutation.isPending || deleteMutation.isPending || (['warn', 'suspend', 'ban'].includes(actionModal.type) && !actionReason.trim())}
                className={`flex-1 py-3 rounded-full font-bold flex items-center justify-center gap-2 ${
                  actionModal.type === 'activate'
                    ? 'bg-emerald-500 text-white'
                    : actionModal.type === 'ban' || actionModal.type === 'delete'
                      ? 'bg-red-500 text-white'
                      : 'v2-hero-gradient text-white'
                } disabled:opacity-50`}
              >
                {statusMutation.isPending || deleteMutation.isPending ? (
                  <>
                    <span className="v2-icon text-lg animate-spin">progress_activity</span>
                    Processing...
                  </>
                ) : actionModal.type === 'activate' ? (
                  'Restore Access'
                ) : actionModal.type === 'delete' ? (
                  'Delete Permanently'
                ) : (
                  `${actionModal.type.charAt(0).toUpperCase() + actionModal.type.slice(1)} User`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

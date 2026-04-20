import { useIsMobile } from '@/hooks/use-mobile';
import { useAdminUsers, useUpdateUserStatus, useDeleteUser } from '@/hooks/use-admin';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface V2AdminUsersTabProps {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

const statusColors: Record<string, {bg: string; text: string; dot: string}> = {
  active: {bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-600'},
  suspended: {bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-600'},
  banned: {bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-600'},
  pending: {bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400'},
};

type FilterType = 'all' | 'active' | 'suspended' | 'banned' | 'admin' | 'vendor' | 'creator';

export function V2AdminUsersTab({
  searchQuery,
  addLog,
}: V2AdminUsersTabProps) {
  const isMobile = useIsMobile();

  // Local search and filter
  const [localSearch, setLocalSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Action states
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [mobileActionSheet, setMobileActionSheet] = useState<{isOpen: boolean; user: any}>({
    isOpen: false,
    user: null,
  });

  // View Details Modal
  const [viewDetailsModal, setViewDetailsModal] = useState<{isOpen: boolean; user: any}>({
    isOpen: false,
    user: null,
  });

  // Action Modal (Suspend/Ban)
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'suspend' | 'ban' | 'activate' | 'warn' | 'delete';
    user: any;
  }>({isOpen: false, type: 'suspend', user: null});
  const [actionReason, setActionReason] = useState('');
  const [suspensionDays, setSuspensionDays] = useState('7');

  // Fetch users with filters
  const {
    data: infiniteData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAdminUsers({
    search: searchQuery || localSearch,
    role: ['admin', 'vendor', 'creator'].includes(filterType) ? filterType : undefined,
  });

  const allUsers = infiniteData?.pages.flatMap(page => page.data || []) || [];

  // Local filtering for statuses (since backend doesn't support status filter in fetchUsers yet)
  const users = allUsers.filter((user: any) => {
    let filterMatch = true;
    const status = user.status || 'active';
    if (filterType === 'active') filterMatch = status === 'active';
    else if (filterType === 'suspended') filterMatch = status === 'suspended';
    else if (filterType === 'banned') filterMatch = status === 'banned';
    
    return filterMatch;
  });

  // Calculate stats
  const stats = {
    totalUsers: allUsers.length,
    activeUsers: allUsers.filter((u: any) => (u.status || 'active') === 'active').length,
    suspendedUsers: allUsers.filter((u: any) => u.status === 'suspended').length,
    bannedUsers: allUsers.filter((u: any) => u.status === 'banned').length,
    admins: allUsers.filter((u: any) => u.roles?.includes('admin') || u.adminRole).length,
    vendors: allUsers.filter((u: any) => u.roles?.includes('vendor')).length,
    creators: allUsers.filter((u: any) => u.is_creator).length,
  };

  // Status mutation
  // Mutations
  const statusMutation = useUpdateUserStatus();
  const deleteMutation = useDeleteUser();

  const handleUpdateStatus = async (userId: string, status: string, suspensionEnd?: string) => {
    try {
      await statusMutation.mutateAsync({ userId, status, suspensionEnd });
      toast.success('User status updated successfully');
      setActionModal({isOpen: false, type: 'suspend', user: null});
      setActionReason('');
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => {
      setOpenDropdownId(null);
      setShowFilterDropdown(false);
    };
    if (openDropdownId || showFilterDropdown) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [openDropdownId, showFilterDropdown]);

  const handleViewDetails = (user: any) => {
    setViewDetailsModal({isOpen: true, user});
    setOpenDropdownId(null);
    setMobileActionSheet({isOpen: false, user: null});
  };

  const handleSuspend = (user: any) => {
    setActionModal({isOpen: true, type: 'suspend', user});
    setOpenDropdownId(null);
    setMobileActionSheet({isOpen: false, user: null});
  };

  const handleBan = (user: any) => {
    setActionModal({isOpen: true, type: 'ban', user});
    setOpenDropdownId(null);
    setMobileActionSheet({isOpen: false, user: null});
  };

  const handleActivate = (user: any) => {
    setActionModal({isOpen: true, type: 'activate', user});
    setOpenDropdownId(null);
    setMobileActionSheet({isOpen: false, user: null});
  };
  
  const handleWarn = (user: any) => {
    setActionModal({isOpen: true, type: 'warn', user});
    setOpenDropdownId(null);
    setMobileActionSheet({isOpen: false, user: null});
  };

  const handleDelete = (user: any) => {
    setActionModal({isOpen: true, type: 'delete', user});
    setOpenDropdownId(null);
    setMobileActionSheet({isOpen: false, user: null});
  };

  const confirmAction = () => {
    if (!actionModal.user) return;

    if (actionModal.type === 'activate') {
      handleUpdateStatus(actionModal.user.id, 'active');
      addLog(`恢复了用户 @${actionModal.user.username} 的访问权限`);
    } else if (actionModal.type === 'suspend') {
      if (!actionReason.trim()) {
        toast.error('Please provide a reason');
        return;
      }
      const suspensionEnd = new Date(Date.now() + parseInt(suspensionDays) * 86400000).toISOString();
      handleUpdateStatus(actionModal.user.id, 'suspended', suspensionEnd);
      addLog(`Suspended user @${actionModal.user.username} for ${suspensionDays} days. Reason: ${actionReason}`);
    } else if (actionModal.type === 'ban') {
      if (!actionReason.trim()) {
        toast.error('Please provide a reason');
        return;
      }
      handleUpdateStatus(actionModal.user.id, 'banned');
      addLog(`Banned user @${actionModal.user.username}. Reason: ${actionReason}`);
    } else if (actionModal.type === 'warn') {
      if (!actionReason.trim()) {
        toast.error('Please provide a reason');
        return;
      }
      // For warning, we just log it for now as requested
      addLog(`Warned user @${actionModal.user.username}. Reason: ${actionReason}`);
      toast.success('User warned successfully');
      setActionModal({isOpen: false, type: 'warn', user: null});
      setActionReason('');
    } else if (actionModal.type === 'delete') {
      deleteMutation.mutate(actionModal.user.id, {
        onSuccess: () => {
          addLog(`Permanently deleted user @${actionModal.user.username}`);
          setActionModal({isOpen: false, type: 'delete', user: null});
        }
      });
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Username', 'Display Name', 'Email', 'Roles', 'Status', 'Creator', 'Joined'].join(','),
      ...users.map((u: any) =>
        [
          u.username,
          u.displayName || '',
          u.email || '',
          (u.roles || []).join('; '),
          u.status || 'active',
          u.is_creator ? 'Yes' : 'No',
          u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Exported users list');
  };

  // Get user roles display
  const getUserRoles = (user: any) => {
    const roles: string[] = [];
    if (user.roles?.includes('admin') || user.adminRole) {
      roles.push(user.adminRole ? `Admin (${user.adminRole.replace('_', ' ')})` : 'Admin');
    }
    if (user.roles?.includes('vendor')) roles.push('Vendor');
    if (user.is_creator) roles.push('Creator');
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
            User Management
          </h2>
          <p className="text-[var(--v2-on-surface-variant)] mt-2 font-medium">
            Manage all users on the platform.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] rounded-full font-bold text-sm hover:bg-[var(--v2-surface-container-highest)] transition-colors"
        >
          <span className="v2-icon text-lg">download</span>
          Export
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className={`p-5 rounded-xl cursor-pointer transition-all ${
            filterType === 'all'
              ? 'bg-[var(--v2-primary)] text-white ring-2 ring-[var(--v2-primary)] ring-offset-2'
              : 'bg-[var(--v2-primary-container)]/20 hover:bg-[var(--v2-primary-container)]/30'
          }`}
          onClick={() => setFilterType(filterType === 'all' ? 'all' : 'all')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`v2-icon ${filterType === 'all' ? 'text-white' : 'text-[var(--v2-primary)]'}`}>group</span>
          </div>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${filterType === 'all' ? 'text-white/70' : 'text-[var(--v2-on-surface-variant)]'}`}>
            Total Users
          </p>
          <p className="text-2xl font-black v2-headline mt-1">{stats.totalUsers}</p>
        </div>

        <div
          className={`p-5 rounded-xl cursor-pointer transition-all ${
            filterType === 'active'
              ? 'bg-emerald-600 text-white ring-2 ring-emerald-600 ring-offset-2'
              : 'bg-emerald-100 hover:bg-emerald-200'
          }`}
          onClick={() => setFilterType(filterType === 'active' ? 'all' : 'active')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`v2-icon ${filterType === 'active' ? 'text-white' : 'text-emerald-700'}`}>check_circle</span>
          </div>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${filterType === 'active' ? 'text-white/70' : 'text-emerald-700'}`}>
            Active
          </p>
          <p className="text-2xl font-black v2-headline mt-1">{stats.activeUsers}</p>
        </div>

        <div
          className={`p-5 rounded-xl cursor-pointer transition-all ${
            filterType === 'suspended'
              ? 'bg-amber-600 text-white ring-2 ring-amber-600 ring-offset-2'
              : 'bg-amber-100 hover:bg-amber-200'
          }`}
          onClick={() => setFilterType(filterType === 'suspended' ? 'all' : 'suspended')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`v2-icon ${filterType === 'suspended' ? 'text-white' : 'text-amber-700'}`}>pause_circle</span>
          </div>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${filterType === 'suspended' ? 'text-white/70' : 'text-amber-700'}`}>
            Suspended
          </p>
          <p className="text-2xl font-black v2-headline mt-1">{stats.suspendedUsers}</p>
        </div>

        <div
          className={`p-5 rounded-xl cursor-pointer transition-all ${
            filterType === 'banned'
              ? 'bg-red-600 text-white ring-2 ring-red-600 ring-offset-2'
              : 'bg-red-100 hover:bg-red-200'
          }`}
          onClick={() => setFilterType(filterType === 'banned' ? 'all' : 'banned')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`v2-icon ${filterType === 'banned' ? 'text-white' : 'text-red-700'}`}>block</span>
          </div>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${filterType === 'banned' ? 'text-white/70' : 'text-red-700'}`}>
            Banned
          </p>
          <p className="text-2xl font-black v2-headline mt-1">{stats.bannedUsers}</p>
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
        <div className="relative">
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setShowFilterDropdown(!showFilterDropdown);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-[var(--v2-surface-container)] rounded-full font-medium text-sm"
          >
            <span className="v2-icon text-lg">filter_list</span>
            Filter by Role
            <span className="v2-icon text-lg">expand_more</span>
          </button>
          {showFilterDropdown && (
            <div
              className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 w-48 z-50"
              onClick={e => e.stopPropagation()}
            >
              {[
                {value: 'all', label: 'All Users', icon: 'group'},
                {value: 'admin', label: 'Admins', icon: 'admin_panel_settings'},
                {value: 'vendor', label: 'Vendors', icon: 'storefront'},
                {value: 'creator', label: 'Creators', icon: 'brush'},
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setFilterType(opt.value as FilterType);
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    filterType === opt.value
                      ? 'bg-[var(--v2-primary-container)]/20 text-[var(--v2-primary)]'
                      : 'hover:bg-[var(--v2-surface-container)]'
                  }`}
                >
                  <span className="v2-icon text-lg">{opt.icon}</span>
                  <span className="text-sm font-medium">{opt.label}</span>
                  {filterType === opt.value && <span className="v2-icon ml-auto">check</span>}
                </button>
              ))}
            </div>
          )}
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
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 md:px-8 py-6 border-b border-[var(--v2-surface-container)] flex items-center justify-between">
          <h4 className="v2-headline font-bold text-lg">
            {filterType === 'all' ? 'All Users' : filterType.charAt(0).toUpperCase() + filterType.slice(1) + ' Users'}
          </h4>
          <span className="text-sm text-[var(--v2-on-surface-variant)]">
            {users.length} user{users.length !== 1 ? 's' : ''}
          </span>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-16">
            <span className="v2-icon text-6xl text-[var(--v2-on-surface-variant)]/20">group</span>
            <p className="text-sm text-[var(--v2-on-surface-variant)] mt-4">No users found</p>
          </div>
        ) : isMobile ? (
          // Mobile Card View
          <div className="divide-y divide-[var(--v2-surface-container)]">
            {users.map((user: any) => {
              const status = user.status || 'active';
              const colors = statusColors[status] || statusColors.active;
              const roles = getUserRoles(user);

              return (
                <div key={user.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-[var(--v2-primary-container)]/20 flex items-center justify-center shrink-0">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-[var(--v2-primary)]">
                            {(user.displayName || user.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold capitalize truncate">{user.displayName || user.username}</p>
                        <p className="text-sm text-[var(--v2-on-surface-variant)] truncate">@{user.username}</p>
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
                    {roles.map((role, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          role.includes('Admin')
                            ? 'bg-[var(--v2-primary-container)]/20 text-[var(--v2-primary)]'
                            : role === 'Vendor'
                              ? 'bg-purple-100 text-purple-700'
                              : role === 'Creator'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {role}
                      </span>
                    ))}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${colors.bg} ${colors.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                      {status}
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
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">User</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">Email</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">Roles</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">Status</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">Joined</th>
                <th className="px-8 py-4 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--v2-surface-container)]">
              {users.map((user: any) => {
                const status = user.status || 'active';
                const colors = statusColors[status] || statusColors.active;
                const roles = getUserRoles(user);
                const isDropdownOpen = openDropdownId === user.id;

                return (
                  <tr key={user.id} className="hover:bg-[var(--v2-surface-container)]/20">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--v2-primary-container)]/20 flex items-center justify-center overflow-hidden">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-[var(--v2-primary)]">
                              {(user.displayName || user.username || 'U').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold capitalize">{user.displayName || user.username}</p>
                          <p className="text-xs text-[var(--v2-on-surface-variant)]">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--v2-on-surface-variant)]">{user.email || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {roles.map((role, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              role.includes('Admin')
                                ? 'bg-[var(--v2-primary-container)]/20 text-[var(--v2-primary)]'
                                : role === 'Vendor'
                                  ? 'bg-purple-100 text-purple-700'
                                  : role === 'Creator'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${colors.bg} ${colors.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--v2-on-surface-variant)]">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-8 py-4">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setOpenDropdownId(isDropdownOpen ? null : user.id);
                        }}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--v2-surface-container)] transition-colors"
                      >
                        <span className="v2-icon">more_vert</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {hasNextPage && (
          <div className="p-6 bg-[var(--v2-surface-container)]/30 flex justify-center">
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-6 py-2.5 bg-[var(--v2-primary)] text-white rounded-full font-bold text-sm disabled:opacity-50"
            >
              {isFetchingNextPage ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>

      {/* Desktop Action Dropdown */}
      {openDropdownId && !isMobile && (() => {
        const user = users.find((u: any) => u.id === openDropdownId);
        if (!user) return null;
        const status = user.status || 'active';
        return (
          <>
            <div className="fixed inset-0" style={{zIndex: 9998}} onClick={() => setOpenDropdownId(null)} />
            <div
              className="fixed bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 w-48"
              style={{zIndex: 9999, top: '50%', right: '10%', transform: 'translateY(-50%)'}}
            >
              <button
                type="button"
                onClick={() => handleViewDetails(user)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--v2-surface-container)] transition-colors text-left"
              >
                <span className="v2-icon text-lg text-[var(--v2-on-surface-variant)]">visibility</span>
                <span className="text-sm font-medium">View Details</span>
              </button>

              <div className="h-px bg-gray-100 my-1" />

              {status === 'active' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleSuspend(user)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition-colors text-left"
                  >
                    <span className="v2-icon text-lg text-amber-600">pause_circle</span>
                    <span className="text-sm font-medium text-amber-600">Suspend</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBan(user)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                  >
                    <span className="v2-icon text-lg text-red-600">block</span>
                    <span className="text-sm font-medium text-red-600">Ban User</span>
                  </button>
                </>
              ) : (
                  <button
                    type="button"
                    onClick={() => handleActivate(user)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left"
                  >
                    <span className="v2-icon text-lg text-emerald-600">check_circle</span>
                    <span className="text-sm font-medium text-emerald-600">Restore Access</span>
                  </button>
                )}

                <div className="h-px bg-gray-100 my-1" />

                <button
                  type="button"
                  onClick={() => handleWarn(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                >
                  <span className="v2-icon text-lg text-blue-600">warning</span>
                  <span className="text-sm font-medium text-blue-600">Warn User</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                >
                  <span className="v2-icon text-lg text-red-600">delete_forever</span>
                  <span className="text-sm font-medium text-red-600">Delete Account</span>
                </button>
            </div>
          </>
        );
      })()}

      {/* Mobile Action Sheet */}
      {mobileActionSheet.isOpen && mobileActionSheet.user && (
        <div className="fixed inset-0 md:hidden" style={{zIndex: 10000}}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileActionSheet({isOpen: false, user: null})} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="px-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--v2-primary-container)]/20 flex items-center justify-center">
                  <span className="font-bold text-[var(--v2-primary)]">
                    {(mobileActionSheet.user.displayName || mobileActionSheet.user.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-bold capitalize">{mobileActionSheet.user.displayName || mobileActionSheet.user.username}</p>
                  <p className="text-sm text-gray-500">@{mobileActionSheet.user.username}</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <button
                type="button"
                onClick={() => handleViewDetails(mobileActionSheet.user)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--v2-surface-container)] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--v2-primary-container)]/20 flex items-center justify-center">
                  <span className="v2-icon text-[var(--v2-primary)]">visibility</span>
                </div>
                <span className="font-medium">View Details</span>
              </button>

              <div className="h-px bg-gray-100 my-2" />

              {(mobileActionSheet.user.status || 'active') === 'active' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleSuspend(mobileActionSheet.user)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-amber-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <span className="v2-icon text-amber-600">pause_circle</span>
                    </div>
                    <span className="font-medium text-amber-600">Suspend User</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBan(mobileActionSheet.user)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="v2-icon text-red-600">block</span>
                    </div>
                    <span className="font-medium text-red-600">Ban User</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleActivate(mobileActionSheet.user)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-emerald-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="v2-icon text-emerald-600">check_circle</span>
                  </div>
                  <span className="font-medium text-emerald-600">Restore Access</span>
                </button>
              )}
            </div>

            <div className="p-4 pt-0">
                <button
                  type="button"
                  onClick={() => setMobileActionSheet({isOpen: false, user: null})}
                  className="w-full py-4 bg-[var(--v2-surface-container)] rounded-2xl font-bold text-[var(--v2-on-surface-variant)]"
                >
                  Cancel
                </button>
              </div>

              <div className="h-px bg-gray-100 my-2 mx-4" />

              <div className="p-4 space-y-2">
                <button
                  type="button"
                  onClick={() => handleWarn(mobileActionSheet.user)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="v2-icon text-blue-600">warning</span>
                  </div>
                  <span className="font-medium text-blue-600">Warn User</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(mobileActionSheet.user)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="v2-icon text-red-600">delete_forever</span>
                  </div>
                  <span className="font-medium text-red-600">Delete Account</span>
                </button>
              </div>
            <div className="h-8" />
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDetailsModal.isOpen && viewDetailsModal.user && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{zIndex: 10000}}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewDetailsModal({isOpen: false, user: null})} />
          <div className="relative bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold v2-headline">User Details</h3>
              <button type="button" onClick={() => setViewDetailsModal({isOpen: false, user: null})} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="v2-icon">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[var(--v2-primary-container)]/20 flex items-center justify-center overflow-hidden">
                  {viewDetailsModal.user.avatarUrl ? (
                    <img src={viewDetailsModal.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-[var(--v2-primary)]">
                      {(viewDetailsModal.user.displayName || viewDetailsModal.user.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xl font-bold capitalize">{viewDetailsModal.user.displayName || viewDetailsModal.user.username}</p>
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
                      <span key={idx} className={`px-3 py-1 rounded-full text-sm font-medium ${
                        role.includes('Admin') ? 'bg-[var(--v2-primary-container)]/20 text-[var(--v2-primary)]'
                          : role === 'Vendor' ? 'bg-purple-100 text-purple-700'
                          : role === 'Creator' ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                    <p className={`font-medium capitalize ${
                      (viewDetailsModal.user.status || 'active') === 'active' ? 'text-emerald-600'
                        : viewDetailsModal.user.status === 'suspended' ? 'text-amber-600'
                        : 'text-red-600'
                    }`}>
                      {viewDetailsModal.user.status || 'active'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Country</p>
                    <p className="font-medium">{viewDetailsModal.user.country || '—'}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Joined</p>
                  <p className="font-medium">
                    {viewDetailsModal.user.createdAt
                      ? new Date(viewDetailsModal.user.createdAt).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})
                      : '—'}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">User ID</p>
                  <p className="font-medium font-mono text-sm">{viewDetailsModal.user.id}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setViewDetailsModal({isOpen: false, user: null})} className="flex-1 py-3 v2-hero-gradient text-white rounded-full font-bold">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal.isOpen && actionModal.user && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{zIndex: 10001}}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {setActionModal({isOpen: false, type: 'suspend', user: null}); setActionReason('');}} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                actionModal.type === 'activate' ? 'bg-emerald-100' : 
                (actionModal.type === 'ban' || actionModal.type === 'delete') ? 'bg-red-100' : 
                actionModal.type === 'warn' ? 'bg-blue-100' : 'bg-amber-100'
              }`}>
                <span className={`v2-icon text-2xl ${
                  actionModal.type === 'activate' ? 'text-emerald-600' : 
                  (actionModal.type === 'ban' || actionModal.type === 'delete') ? 'text-red-600' : 
                  actionModal.type === 'warn' ? 'text-blue-600' : 'text-amber-600'
                }`}>
                  {actionModal.type === 'activate' ? 'check_circle' : 
                   actionModal.type === 'ban' ? 'block' : 
                   actionModal.type === 'delete' ? 'delete_forever' :
                   actionModal.type === 'warn' ? 'warning' : 'pause_circle'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold v2-headline capitalize">
                  {actionModal.type === 'activate' ? 'Restore Access' : `${actionModal.type} User`}
                </h3>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">@{actionModal.user.username}</p>
              </div>
            </div>

            <div className="space-y-4">
              {actionModal.type === 'suspend' && (
                <div>
                  <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2">Suspension Duration (days)</label>
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

              {actionModal.type !== 'activate' && (
                <div>
                  <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2">Reason</label>
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
                <p className="text-sm text-[var(--v2-on-surface-variant)] bg-emerald-50 p-4 rounded-xl">
                  This will restore full access for @{actionModal.user.username}. Any previous suspension or ban will be lifted.
                </p>
              )}

              {actionModal.type === 'delete' && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <p className="text-sm text-red-700 font-bold mb-1">Warning: Permanent Deletion</p>
                  <p className="text-xs text-red-600 leading-relaxed">
                    This action cannot be undone. All data associated with @{actionModal.user.username} (sessions, gifts, transactions, etc.) will be permanently removed from the database.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {setActionModal({isOpen: false, type: 'suspend', user: null}); setActionReason('');}}
                disabled={statusMutation.isPending || deleteMutation.isPending}
                className="flex-1 py-3 bg-[var(--v2-surface-container)] rounded-full font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAction}
                disabled={statusMutation.isPending || deleteMutation.isPending || (['suspend', 'ban', 'warn'].includes(actionModal.type) && !actionReason.trim())}
                className={`flex-1 py-3 rounded-full font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 ${
                  actionModal.type === 'activate' ? 'bg-emerald-500' : 
                  actionModal.type === 'delete' || actionModal.type === 'ban' ? 'bg-red-500' : 
                  actionModal.type === 'warn' ? 'bg-blue-500' : 'bg-amber-500'
                }`}
              >
                {statusMutation.isPending || deleteMutation.isPending ? (
                  <>
                    <span className="v2-icon text-lg animate-spin">progress_activity</span>
                    Processing...
                  </>
                ) : actionModal.type === 'activate' ? 'Restore Access' : actionModal.type === 'delete' ? 'Delete Permanently' : `${actionModal.type.charAt(0).toUpperCase() + actionModal.type.slice(1)} User`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useIsMobile } from '@/hooks/use-mobile';
import { useAdminLogs, useDeleteAdminLog, useAdminSystemHealth } from '@/hooks/use-admin';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminSection } from '../../types';

// Helper to get icon and color based on action type
function getLogStyle(action: string) {
  const actionLower = action?.toLowerCase() || '';
  if (actionLower.includes('campaign') || actionLower.includes('created')) {
    return {
      icon: 'campaign',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      badge: 'SUCCESS',
      badgeStyle: 'bg-green-50 text-green-700',
    };
  }
  if (actionLower.includes('permission') || actionLower.includes('role') || actionLower.includes('admin')) {
    return {
      icon: 'shield_person',
      bgColor: 'bg-[var(--v2-secondary-container)]/20',
      textColor: 'text-[var(--v2-secondary)]',
      badge: 'SECURITY',
      badgeStyle: 'bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)]',
    };
  }
  if (actionLower.includes('error') || actionLower.includes('failed') || actionLower.includes('blocked')) {
    return {
      icon: 'report',
      bgColor: 'bg-[var(--v2-error-container)]/10',
      textColor: 'text-[var(--v2-error)]',
      badge: 'CRITICAL ERROR',
      badgeStyle: 'bg-[var(--v2-error-container)]/20 text-[var(--v2-error)]',
    };
  }
  if (actionLower.includes('update') || actionLower.includes('status') || actionLower.includes('system')) {
    return {
      icon: 'update',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      badge: 'SYSTEM',
      badgeStyle: 'bg-[var(--v2-surface-container)] text-[var(--v2-on-surface-variant)]',
    };
  }
  if (actionLower.includes('gift') || actionLower.includes('redeem')) {
    return {
      icon: 'redeem',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      badge: 'SUCCESS',
      badgeStyle: 'bg-green-50 text-green-700',
    };
  }
  if (actionLower.includes('config') || actionLower.includes('setting')) {
    return {
      icon: 'settings_suggest',
      bgColor: 'bg-[var(--v2-surface-container)]',
      textColor: 'text-[var(--v2-on-surface-variant)]',
      badge: 'SYSTEM',
      badgeStyle: 'bg-[var(--v2-surface-container)] text-[var(--v2-on-surface-variant)]',
    };
  }
  // Default
  return {
    icon: 'history',
    bgColor: 'bg-[var(--v2-surface-container)]',
    textColor: 'text-[var(--v2-on-surface-variant)]',
    badge: null,
    badgeStyle: '',
  };
}

// Group logs by date
function groupLogsByDate(logs: any[]) {
  const groups: Record<string, any[]> = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  logs.forEach(log => {
    const logDate = new Date(log.createdAt);
    let dateKey: string;

    if (logDate.toDateString() === today.toDateString()) {
      dateKey = 'Today';
    } else if (logDate.toDateString() === yesterday.toDateString()) {
      dateKey = 'Yesterday';
    } else {
      dateKey = logDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(log);
  });

  return groups;
}

export function V2AdminLogsTab({ setSection }: { setSection?: (section: AdminSection) => void }) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data: infiniteData,
    isLoading,
    isFetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAdminLogs({ search: debouncedQuery });

  const { data: health, refetch: refetchHealth } = useAdminSystemHealth();
  const deleteLog = useDeleteAdminLog();

  const handleRefresh = async () => {
    await Promise.all([refetch(), refetchHealth()]);
    toast.success('Dashboard data refreshed');
  };

  const logs = infiniteData?.pages.flatMap(page => page.data || []) || [];
  
  // Health metrics
  const isHealthy = health?.status === 'healthy';
  const isCritical = health?.status === 'critical' || health?.database === 'disconnected';
  const errorCount = health?.errorCount || 0;

  // For pagination (web)
  const filteredLogs = logs;
  const logsPerPage = 10;
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage,
  );

  // For grouped display (mobile)
  const groupedLogs = groupLogsByDate(filteredLogs);
  const todayCount = groupedLogs['Today']?.length || 0;

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this log entry?')) return;
    try {
      await deleteLog.mutateAsync(id);
      toast.success('Log deleted successfully');
    } catch (error) {
      toast.error('Failed to delete log');
    }
  };

  // Listen for new log events (local UI events)
  useEffect(() => {
    const handleNewLog = () => {
      refetch();
    };
    window.addEventListener('admin-log', handleNewLog);
    return () => window.removeEventListener('admin-log', handleNewLog);
  }, [refetch]);

  // Initial loading only
  const isInitialLoading = isLoading && logs.length === 0;

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)] mt-3">Loading logs...</p>
      </div>
    );
  }

  // Mobile View
  if (isMobile) {
    return (
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div>
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)]">
              Audit Logs
            </h2>
            <button 
              onClick={handleRefresh}
              className="w-10 h-10 rounded-full bg-[var(--v2-surface-container-high)] flex items-center justify-center">
              <span className="v2-icon text-xl text-[var(--v2-primary)]">refresh</span>
            </button>
          </div>
          <p className="text-sm text-[var(--v2-on-surface-variant)] leading-relaxed">
            System-wide transparency and activity tracking for the Editorial desk.
          </p>
        </div>

        {/* System Health Card (Mobile) */}
        <div className={`rounded-xl p-5 mb-6 flex flex-col border-l-4 ${
          isCritical ? 'bg-red-50 border-red-500' : isHealthy ? 'bg-[var(--v2-surface-container)] border-[var(--v2-primary)]' : 'bg-amber-50 border-amber-500'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isCritical ? 'bg-red-100 text-red-700' : isHealthy ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              <span className="v2-icon text-xl">{isCritical ? 'report' : isHealthy ? 'verified_user' : 'warning'}</span>
            </div>
            <div>
              <p className="text-sm font-bold">{isCritical ? 'Critical Issue' : isHealthy ? 'All Systems Normal' : 'Degraded Performance'}</p>
              <p className="text-[10px] text-[var(--v2-on-surface-variant)]">
                {isCritical ? 'Database connection failure' : isHealthy ? 'System stable' : `${errorCount} recent errors`}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSearchQuery('error')}
            className="text-[var(--v2-primary)] font-bold text-xs flex items-center gap-2 mt-2">
            View Error Logs <span className="v2-icon text-xs">arrow_forward</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[var(--v2-surface-container-low)] rounded-xl p-2 flex items-center gap-3 border border-[var(--v2-surface-container-highest)]/30">
          <div className="pl-3 text-[var(--v2-on-surface-variant)]">
            <span className="v2-icon text-xl">search</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-[var(--v2-outline)] outline-none"
            placeholder="Search activity..."
          />
          {isFetching && (
            <span className="v2-icon animate-spin text-[var(--v2-primary)] mr-2">progress_activity</span>
          )}
        </div>

        {/* Grouped Logs */}
        <div className="space-y-4">
          {Object.entries(groupedLogs).map(([dateLabel, dateLogs]) => (
            <div key={dateLabel}>
              <div className="flex items-center justify-between px-2 mb-4">
                <span className="v2-headline text-xs uppercase tracking-widest text-[var(--v2-outline-variant)] font-bold">
                  {dateLabel}
                </span>
                {dateLabel === 'Today' && todayCount > 0 && (
                  <span className="text-[10px] font-bold text-[var(--v2-primary)] px-2 py-0.5 bg-orange-50 rounded-full uppercase">
                    {todayCount} New
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {dateLogs.map((log: any) => {
                  const style = getLogStyle(log.action || '');
                  const logTime = log.createdAt
                    ? new Date(log.createdAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })
                    : '';

                  return (
                    <div
                      key={log.id}
                      className="bg-[var(--v2-surface-container-lowest)] rounded-lg p-5 shadow-[0_20px_40px_-15px_rgba(56,56,53,0.08)] flex gap-4 items-start border border-[var(--v2-surface-container-high)]/50">
                      <div className={`w-12 h-12 shrink-0 rounded-full ${style.bgColor} flex items-center justify-center ${style.textColor}`}>
                        <span className="v2-icon">{style.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-bold text-[var(--v2-on-surface)] leading-tight">{log.action}</p>
                          <span className="text-[10px] text-[var(--v2-outline-variant)] font-medium shrink-0 ml-2">{logTime}</span>
                        </div>
                        <p className="text-xs text-[var(--v2-on-surface-variant)]">Action by {log.admin?.username || 'System'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop View
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <p className="text-[var(--v2-primary)] font-bold tracking-widest text-xs uppercase mb-2">
            System Governance
          </p>
          <h2 className="text-4xl font-black v2-headline text-[var(--v2-on-surface)] leading-tight">
            Audit Logs
          </h2>
          <p className="text-[var(--v2-on-surface-variant)] mt-2 max-w-lg">
            Track administrative actions and monitor the health of the platform for reliability.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] font-bold text-sm hover:bg-[var(--v2-surface-container-highest)] transition-all active:scale-95">
            <span className="v2-icon text-lg">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Total Activities Card */}
        <div className="lg:col-span-2 bg-[var(--v2-primary-container)] rounded-xl p-8 flex justify-between items-center text-[var(--v2-on-primary-container)] relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Total Activities (24h)</p>
            <h3 className="text-6xl font-black v2-headline">{logs.length.toLocaleString()}</h3>
          </div>
          <span className="v2-icon text-[10rem] absolute -right-8 -bottom-8 opacity-10">history</span>
        </div>

        {/* System Health Card */}
        <div className={`rounded-xl p-8 flex flex-col justify-between border-l-8 ${
          isCritical ? 'bg-red-50 border-red-500' : isHealthy ? 'bg-[var(--v2-surface-container)] border-[var(--v2-primary)]' : 'bg-amber-50 border-amber-500'
        }`}>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--v2-on-surface-variant)] mb-4">System Health</p>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isCritical ? 'bg-red-100 text-red-700' : isHealthy ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>
                <span className="v2-icon" style={{fontVariationSettings: "'FILL' 1"}}>
                  {isCritical ? 'report' : isHealthy ? 'verified_user' : 'warning'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold">{isCritical ? 'Critical Issue' : isHealthy ? 'All Systems Normal' : 'Degraded Performance'}</span>
                <span className="text-xs text-[var(--v2-on-surface-variant)]">
                  {isCritical ? 'Database connection failure' : isHealthy ? 'System stable' : `${errorCount} recent errors detected`}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => {
              setSearchQuery('error');
              window.scrollTo({ top: 500, behavior: 'smooth' });
            }}
            className="text-[var(--v2-primary)] font-bold text-sm flex items-center gap-2 hover:translate-x-1 transition-transform">
            View Error Logs <span className="v2-icon text-sm">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md flex items-center">
        <span className="v2-icon absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]">search</span>
        <input
          type="text"
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-[var(--v2-surface-container-lowest)] border-none rounded-full py-3 pl-12 pr-12 text-sm focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
          placeholder="Search audit entries..."
        />
        {isFetching && (
          <span className="v2-icon animate-spin absolute right-4 text-[var(--v2-primary)]">progress_activity</span>
        )}
      </div>

      {/* Logs Table */}
      <div className="space-y-4">
        {paginatedLogs.map((log: any) => {
          const style = getLogStyle(log.action || '');
          const logDate = log.createdAt ? new Date(log.createdAt) : null;

          return (
            <div key={log.id} className="bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container-lowest)] transition-all rounded-lg p-6 flex items-center group">
              <div className={`w-14 h-14 rounded-2xl ${style.bgColor} flex items-center justify-center ${style.textColor} mr-6`}>
                <span className="v2-icon text-3xl">{style.icon}</span>
              </div>
              <div className="flex-grow">
                <h5 className="text-lg font-bold text-[var(--v2-on-surface)]">{log.action}</h5>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">
                  {log.details || `Action by ${log.admin?.username || 'System'}`}
                  {log.ip_address && ` (IP: ${log.ip_address})`}
                </p>
              </div>
              <div className="flex items-center gap-8 ml-6">
                <span className="px-3 py-1 rounded-full bg-[var(--v2-surface-container-highest)] text-[10px] font-black uppercase">
                  {log.admin?.username || 'System'}
                </span>
                <div className="text-right min-w-[100px]">
                  <p className="text-sm font-bold text-[var(--v2-on-surface)]">{logDate?.toLocaleDateString()}</p>
                  <p className="text-xs text-[var(--v2-on-surface-variant)]">{logDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <button 
                  onClick={() => handleDelete(log.id)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                  <span className="v2-icon">delete</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && !isLoading && (
          <div className="text-center py-16 opacity-30">
            <span className="v2-icon text-6xl">history</span>
            <p className="mt-4">No logs found</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 disabled:opacity-30"><span className="v2-icon">chevron_left</span></button>
            <span className="px-4 py-2 text-sm font-bold">Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 disabled:opacity-30"><span className="v2-icon">chevron_right</span></button>
          </div>
        )}
      </div>
    </div>
  );
}

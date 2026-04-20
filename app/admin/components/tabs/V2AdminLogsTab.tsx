import { useIsMobile } from '@/hooks/use-mobile';
import { useAdminLogs, useDeleteAdminLog } from '@/hooks/use-admin';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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

export function V2AdminLogsTab() {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: infiniteData,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAdminLogs({ search: searchQuery });

  const deleteLog = useDeleteAdminLog();

  const logs = infiniteData?.pages.flatMap(page => page.data || []) || [];
  
  // For pagination (web) - we'll stick to client-side pagination for now or refactor to server-side
  // Since useAdminLogs is now infinite, we can just use the flat list if it's small, 
  // or fetch more when needed.
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
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
          <h2 className="text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)] mb-2">
            Audit Logs
          </h2>
          <p className="text-sm text-[var(--v2-on-surface-variant)] leading-relaxed">
            System-wide transparency and activity tracking for the Editorial desk.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[var(--v2-surface-container-low)] rounded-xl p-2 flex items-center gap-3 border border-[var(--v2-surface-container-highest)]/30">
          <div className="pl-3 text-[var(--v2-on-surface-variant)]">
            <span className="v2-icon text-xl">search</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-[var(--v2-outline)] outline-none"
            placeholder="Search activity..."
          />
          <button className="bg-[var(--v2-surface-container-highest)] p-2 rounded-lg text-[var(--v2-on-surface)]">
            <span className="v2-icon text-xl">tune</span>
          </button>
        </div>

        {/* Grouped Logs */}
        <div className="space-y-4">
          {Object.entries(groupedLogs).map(([dateLabel, dateLogs]) => (
            <div key={dateLabel}>
              {/* Section Label */}
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

              {/* Log Cards */}
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
                      <div
                        className={`w-12 h-12 shrink-0 rounded-full ${style.bgColor} flex items-center justify-center ${style.textColor}`}>
                        <span
                          className="v2-icon"
                          style={{fontVariationSettings: "'FILL' 1"}}>
                          {style.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-bold text-[var(--v2-on-surface)] v2-headline leading-tight">
                            {log.action}
                          </p>
                          <span className="text-[10px] text-[var(--v2-outline-variant)] font-medium shrink-0 ml-2">
                            {logTime}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--v2-on-surface-variant)] mb-3">
                          Action by{' '}
                          <span className="text-[var(--v2-primary)] font-semibold underline decoration-[var(--v2-primary)]/20">
                            {log.admin?.username || 'System'}
                          </span>
                          {log.ip_address && (
                            <span className="text-[var(--v2-on-surface-variant)]">
                              {' '}
                              from {log.ip_address}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] bg-[var(--v2-surface-container)] rounded-full px-2 py-1 text-[var(--v2-on-surface-variant)] font-bold">
                            #{log.id?.slice(0, 8).toUpperCase() || 'LOG'}
                          </span>
                          {style.badge && (
                            <span
                              className={`text-[10px] rounded-full px-2 py-1 font-bold ${style.badgeStyle}`}>
                              {style.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="text-center py-16">
              <span className="v2-icon text-6xl text-[var(--v2-on-surface-variant)]/20">
                history
              </span>
              <p className="text-sm text-[var(--v2-on-surface-variant)] mt-4">
                No audit logs found
              </p>
            </div>
          )}
        </div>

        {/* FAB for Export */}
        <button className="fixed right-6 bottom-28 w-14 h-14 rounded-2xl v2-hero-gradient text-white flex items-center justify-center shadow-[0_20px_40px_-15px_rgba(56,56,53,0.08)] active:scale-90 transition-all z-40">
          <span className="v2-icon text-2xl">download</span>
        </button>
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
            Track every administrative action across the Gifthance platform for security and
            compliance monitoring.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] font-bold text-sm hover:bg-[var(--v2-surface-container-highest)] transition-all active:scale-95">
            <span className="v2-icon text-lg">refresh</span>
            Refresh
          </button>
          <button className="flex items-center gap-2 px-8 py-3 rounded-full v2-hero-gradient text-white font-bold text-sm shadow-lg shadow-[var(--v2-primary)]/20 hover:opacity-90 transition-all active:scale-95">
            <span className="v2-icon text-lg">download</span>
            Export Logs
          </button>
        </div>
      </div>

      {/* Power Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Total Activities Card */}
        <div className="lg:col-span-2 bg-[var(--v2-primary-container)] rounded-xl p-8 flex justify-between items-center text-[var(--v2-on-primary-container)] relative overflow-hidden shadow-2xl shadow-[var(--v2-primary-container)]/20">
          <div className="relative z-10">
            <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">
              Total Activities (24h)
            </p>
            <h3 className="text-6xl font-black v2-headline">{logs.length.toLocaleString()}</h3>
            <div className="flex items-center gap-2 mt-4 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full w-fit">
              <span className="v2-icon text-sm">trending_up</span>
              <span className="text-xs font-bold">12% higher than yesterday</span>
            </div>
          </div>
          <span className="v2-icon text-[10rem] absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            history
          </span>
        </div>

        {/* Security Status Card */}
        <div className="bg-[var(--v2-surface-container)] rounded-xl p-8 flex flex-col justify-between border-l-8 border-[var(--v2-primary)]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--v2-on-surface-variant)] mb-4">
              Security Status
            </p>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                <span
                  className="v2-icon"
                  style={{fontVariationSettings: "'FILL' 1"}}>
                  verified_user
                </span>
              </div>
              <span className="text-xl font-bold">All Systems Normal</span>
            </div>
          </div>
          <button className="text-[var(--v2-primary)] font-bold text-sm flex items-center gap-2 hover:translate-x-1 transition-transform">
            View Security Report <span className="v2-icon text-sm">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <span className="v2-icon absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-[var(--v2-surface-container-lowest)] border-none rounded-full py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
          placeholder="Search audit entries..."
        />
      </div>

      {/* Log Entries List */}
      <div className="space-y-4">
        {/* Table Header */}
        <div className="flex items-center justify-between px-8 mb-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-[var(--v2-on-surface-variant)]/60">
            Activity Details
          </h4>
          <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-[var(--v2-on-surface-variant)]/60">
            <span className="w-32 text-center">User</span>
            <span className="w-40 text-right">Timestamp</span>
            <span className="w-12"></span>
          </div>
        </div>

        {/* Log Items */}
        {paginatedLogs.map((log: any) => {
          const style = getLogStyle(log.action || '');
          const logDate = log.createdAt ? new Date(log.createdAt) : null;

          return (
            <div
              key={log.id}
              className="bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container-lowest)] transition-all duration-300 rounded-lg p-6 flex items-center group">
              <div
                className={`w-14 h-14 rounded-2xl ${style.bgColor} flex items-center justify-center ${style.textColor} mr-6`}>
                <span className="v2-icon text-3xl">{style.icon}</span>
              </div>
              <div className="flex-grow">
                <h5 className="text-lg font-bold text-[var(--v2-on-surface)]">{log.action}</h5>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">
                  {log.details || `Action performed by ${log.admin?.username || 'system'}`}
                  {log.ip_address && ` (IP: ${log.ip_address})`}
                </p>
              </div>
              <div className="flex items-center gap-8 ml-6">
                <div className="w-32 text-center">
                  <span className="inline-block px-3 py-1 rounded-full bg-[var(--v2-surface-container-highest)] text-[10px] font-black uppercase">
                    {log.admin?.username || 'System'}
                  </span>
                </div>
                <div className="w-40 text-right">
                  {logDate && (
                    <>
                      <p className="text-sm font-bold text-[var(--v2-on-surface)]">
                        {logDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)]">
                        {logDate.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </p>
                    </>
                  )}
                </div>
                <button 
                  onClick={() => handleDelete(log.id)}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-error-container)] hover:text-[var(--v2-on-error)] transition-all opacity-0 group-hover:opacity-100">
                  <span className="v2-icon">delete</span>
                </button>
              </div>
            </div>
          );
        })}

        {hasNextPage && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-8 py-3 rounded-full bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] font-bold text-sm hover:bg-[var(--v2-surface-container-highest)] transition-all active:scale-95 disabled:opacity-50">
              {isFetchingNextPage ? 'Loading more...' : 'Load More Logs'}
            </button>
          </div>
        )}

        {filteredLogs.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <span className="v2-icon text-6xl text-[var(--v2-on-surface-variant)]/20">history</span>
            <p className="text-sm text-[var(--v2-on-surface-variant)] mt-4">No audit logs found</p>
          </div>
        )}
      </div>

      {/* Pagination (kept for local navigation if desired, but could be removed for pure scroll) */}
      {filteredLogs.length > 0 && totalPages > 1 && (
        <div className="mt-12 flex justify-between items-center py-6 border-t border-[var(--v2-outline-variant)]/10">
          <p className="text-sm font-medium text-[var(--v2-on-surface-variant)]">
            Showing {paginatedLogs.length} of {filteredLogs.length} entries
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--v2-surface-container)] transition-colors disabled:opacity-30">
              <span className="v2-icon">chevron_left</span>
            </button>
            {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    currentPage === pageNum
                      ? 'v2-hero-gradient text-white'
                      : 'hover:bg-[var(--v2-surface-container)]'
                  }`}>
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="mx-2 text-[var(--v2-on-surface-variant)]">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--v2-surface-container)] transition-colors font-bold text-sm">
                  {totalPages}
                </button>
              </>
            )}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--v2-surface-container)] transition-colors disabled:opacity-30">
              <span className="v2-icon">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

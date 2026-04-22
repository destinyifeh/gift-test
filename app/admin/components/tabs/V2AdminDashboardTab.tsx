import { useAdminDashboardStats, useAdminLogs, useAdminSystemAnalytics } from '@/hooks/use-admin';
import { AdminSection } from '../../types';

interface V2AdminDashboardTabProps {
  searchQuery: string;
  setSection: (section: AdminSection) => void;
}

export function V2AdminDashboardTab({setSection}: V2AdminDashboardTabProps) {
  const { data: statsResponse, isLoading: isStatsLoading } = useAdminDashboardStats();
  const { data: analyticsResponse, isLoading: isAnalyticsLoading } = useAdminSystemAnalytics();
  const { data: logsResponse } = useAdminLogs({ limit: 4 });

  const stats = statsResponse;
  const analytics = analyticsResponse;
  const recentLogs = logsResponse?.pages?.[0]?.data || [];

  console.log('Admin Dashboard Debug:', { stats, analytics, recentLogs });

  const isLoading = isStatsLoading || isAnalyticsLoading;

  // Calculate active users (using analytics data if available)
  const totalUsers = analytics?.users?.total || stats?.totalUsers || 0;
  // We don't have a direct "active users" count in the basic stats, 
  // but we can use total if specific breakdown isn't provided by backend yet
  const activeUsers = totalUsers; 

  // Revenue data
  const revenueData = stats?.revenueData || [];
  const maxRevenue = Math.max(...revenueData.map((d: any) => d.revenue || 0), 1);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)] mt-3">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
            Overview
          </h2>
          <p className="text-[var(--v2-on-surface-variant)] mt-2 font-medium">
            Welcome back. Here is what's happening today.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] font-bold rounded-full text-sm hover:bg-[var(--v2-surface-container-highest)] transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Power Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 - Total Users */}
        <div className="bg-white p-8 rounded-xl shadow-[0_32px_48px_-12px_rgba(56,56,53,0.04)] hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
              <span className="v2-icon">group</span>
            </div>
            {analytics?.users?.newThisMonth > 0 && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                +{analytics.users.newThisMonth}
              </span>
            )}
          </div>
          <p className="text-[var(--v2-on-surface-variant)] text-xs font-bold uppercase tracking-widest mb-1">
            Total Users
          </p>
          <h3 className="text-3xl font-black v2-headline text-[var(--v2-on-surface)]">
            {totalUsers.toLocaleString()}
          </h3>
        </div>

        {/* Metric 2 - Total Active Vendors */}
        <div className="bg-white p-8 rounded-xl shadow-[0_32px_48px_-12px_rgba(56,56,53,0.04)] hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
              <span className="v2-icon">storefront</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              {analytics?.vendors?.active || 0} Active
            </span>
          </div>
          <p className="text-[var(--v2-on-surface-variant)] text-xs font-bold uppercase tracking-widest mb-1">
            Total Vendors
          </p>
          <h3 className="text-3xl font-black v2-headline text-[var(--v2-on-surface)]">
            {(analytics?.vendors?.total || 0).toLocaleString()}
          </h3>
        </div>

        {/* Metric 3 - Gross Transaction Volume */}
        <div className="bg-[var(--v2-primary-container)] p-8 rounded-xl shadow-lg shadow-[var(--v2-primary-container)]/20 text-white hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <span className="v2-icon">insights</span>
            </div>
            <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">
              Total Inflow
            </span>
          </div>
          <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">
            Gross Volume (GTV)
          </p>
          <h3 className="text-3xl font-black v2-headline">
            ₦{(analytics?.revenue?.grossVolume || stats?.totalGrossVolume || 0).toLocaleString()}
          </h3>
        </div>

        {/* Metric 4 - Platform Earnings (Fees) */}
        <div className="bg-white p-8 rounded-xl shadow-[0_32px_48px_-12px_rgba(56,56,53,0.04)] hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[var(--v2-secondary-container)]/20 rounded-2xl text-[var(--v2-secondary)]">
              <span className="v2-icon">account_balance_wallet</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] block font-bold text-emerald-600 uppercase">
                Fees Breakdown
              </span>
              <span className="text-[9px] block text-gray-400">
                Tx: ₦{(stats?.revenueBreakdown?.transactions || 0).toLocaleString()} | Wdl: ₦{(stats?.revenueBreakdown?.withdrawals || 0).toLocaleString()}
              </span>
            </div>
          </div>
          <p className="text-[var(--v2-on-surface-variant)] text-xs font-bold uppercase tracking-widest mb-1">
            Platform Earnings
          </p>
          <h3 className="text-3xl font-black v2-headline text-[var(--v2-on-surface)]">
            ₦{(analytics?.revenue?.total || stats?.platformRevenue || 0).toLocaleString()}
          </h3>
          <p className="text-[9px] text-gray-400 mt-1 italic">Calculated at 4% service fee + ₦100 per withdrawal</p>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Growth Chart */}
        <div className="lg:col-span-2 bg-[var(--v2-surface-container)] rounded-xl p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)]">
              Revenue Growth
            </h4>
            <div className="bg-[var(--v2-surface-container-high)] p-1 rounded-full flex">
              <button className="px-4 py-1.5 text-xs font-bold rounded-full bg-white shadow-sm text-[var(--v2-on-surface)]">
                Monthly
              </button>
              <button className="px-4 py-1.5 text-xs font-bold rounded-full text-[var(--v2-on-surface-variant)]">
                Yearly
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-[200px] md:min-h-[300px] flex items-end gap-3 px-4">
            {/* Chart bars from real data */}
            {revenueData.length > 0 ? (
              revenueData.slice(0, 12).map((data: any, i: number) => {
                const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 10;
                const isPeak = data.revenue === maxRevenue && maxRevenue > 0;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-full transition-colors ${
                      isPeak
                        ? 'bg-[var(--v2-primary-container)] relative'
                        : 'bg-[var(--v2-primary-container)]/20 hover:bg-[var(--v2-primary-container)]/40'
                    }`}
                    style={{height: `${Math.max(height, 5)}%`}}>
                    {isPeak && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--v2-on-surface)] text-white text-[10px] px-2 py-1 rounded-md font-bold whitespace-nowrap">
                        ₦{data.revenue.toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="w-full flex items-center justify-center h-full text-[var(--v2-on-surface-variant)]/40 italic">
                No revenue data yet
              </div>
            )}
          </div>
          <div className="flex justify-between mt-6 px-4 text-[10px] font-bold text-[var(--v2-on-surface-variant)]/40 uppercase tracking-widest">
            {revenueData.length > 0 && revenueData.map((data: any, i: number) => (
              <span key={i}>{data.month}</span>
            ))}
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="bg-white p-8 rounded-xl shadow-[0_32px_48px_-12px_rgba(56,56,53,0.04)] flex flex-col">
          <h4 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] mb-8">
            System Status
          </h4>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <span className="v2-icon">pending_actions</span>
                </div>
                <div>
                  <p className="text-sm font-bold">Withdrawals</p>
                  <p className="text-xs text-gray-500">Awaiting processing</p>
                </div>
              </div>
              <span className="text-xl font-bold">{analytics?.pending?.withdrawals || 0}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <span className="v2-icon">report</span>
                </div>
                <div>
                  <p className="text-sm font-bold">Reports</p>
                  <p className="text-xs text-gray-500">Unresolved tickets</p>
                </div>
              </div>
              <span className="text-xl font-bold">{analytics?.pending?.reports || 0}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <span className="v2-icon">inventory_2</span>
                </div>
                <div>
                  <p className="text-sm font-bold">Products</p>
                  <p className="text-xs text-gray-500">Vendor items</p>
                </div>
              </div>
              <span className="text-xl font-bold">{analytics?.products?.total || 0}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <span className="v2-icon">credit_card</span>
                </div>
                <div>
                  <p className="text-sm font-bold">Flex Cards</p>
                  <p className="text-xs text-gray-500">Total issued</p>
                </div>
              </div>
              <span className="text-xl font-bold">{analytics?.flexCards?.total || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setSection('withdrawals')}
          className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center">
            <span className="v2-icon text-[var(--v2-primary)]">payments</span>
          </div>
          <span className="text-sm font-bold text-[var(--v2-on-surface)]">
            Withdrawals
          </span>
        </button>
        <button
          onClick={() => setSection('moderation')}
          className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--v2-error)]/10 flex items-center justify-center">
            <span className="v2-icon text-[var(--v2-error)]">shield</span>
          </div>
          <span className="text-sm font-bold text-[var(--v2-on-surface)]">Moderation</span>
        </button>
        <button
          onClick={() => setSection('users')}
          className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <span className="v2-icon text-blue-500">group</span>
          </div>
          <span className="text-sm font-bold text-[var(--v2-on-surface)]">Users</span>
        </button>
        <button
          onClick={() => setSection('vendors')}
          className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <span className="v2-icon text-purple-500">storefront</span>
          </div>
          <span className="text-sm font-bold text-[var(--v2-on-surface)]">Vendors</span>
        </button>
      </div>

      {/* Recent Activity */}
      <section className="bg-[var(--v2-surface-container)] rounded-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)]">
            Recent System Activity
          </h4>
          <button
            onClick={() => setSection('logs')}
            className="text-[var(--v2-primary)] font-bold text-sm hover:underline">
            View All Logs
          </button>
        </div>
        {recentLogs.length === 0 ? (
          <div className="text-center py-12">
            <span className="v2-icon text-6xl text-[var(--v2-on-surface-variant)]/20">
              history
            </span>
            <p className="text-sm text-[var(--v2-on-surface-variant)] mt-4">
              No recent admin activity
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentLogs.map((log: any) => (
              <div
                key={log.id}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl group hover:bg-[var(--v2-primary)]/5 transition-colors">
                <div className="w-12 h-12 rounded-full bg-[var(--v2-surface-container)] flex items-center justify-center text-[var(--v2-primary)] group-hover:bg-[var(--v2-primary)] group-hover:text-white transition-all">
                  <span className="v2-icon">history</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-bold text-[var(--v2-on-surface)] truncate">{log.action}</h5>
                  <p className="text-xs text-[var(--v2-on-surface-variant)]">
                    @{log.admin?.username || 'Unknown'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--v2-on-surface-variant)]/40">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

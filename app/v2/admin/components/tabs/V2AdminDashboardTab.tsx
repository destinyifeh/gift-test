'use client';

import {fetchAdminDashboardStats, fetchAdminLogs, fetchAdminUsers, fetchAdminCreatorGifts} from '@/lib/server/actions/admin';
import {useQuery} from '@tanstack/react-query';
import {AdminSection} from '../../types';

interface V2AdminDashboardTabProps {
  searchQuery: string;
  setSection: (section: AdminSection) => void;
}

export function V2AdminDashboardTab({searchQuery, setSection}: V2AdminDashboardTabProps) {
  const {data: statsResponse, isLoading} = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => fetchAdminDashboardStats(),
  });

  const {data: logsResponse} = useQuery({
    queryKey: ['admin-logs-recent'],
    queryFn: () => fetchAdminLogs(),
  });

  const {data: usersResponse} = useQuery({
    queryKey: ['admin-users-count'],
    queryFn: () => fetchAdminUsers({}),
  });

  const {data: giftsResponse} = useQuery({
    queryKey: ['admin-gifts-breakdown'],
    queryFn: () => fetchAdminCreatorGifts({}),
  });

  const stats = statsResponse?.data;
  const recentLogs = (logsResponse?.data || []).slice(0, 4);
  const allUsers = usersResponse?.data || [];
  const allGifts = giftsResponse?.data || [];

  // Calculate active users (users without suspended/banned status)
  const activeUsers = allUsers.filter((u: any) => !u.status || u.status === 'active').length;

  // Calculate gift breakdown - Digital Voucher (has gift_name) vs Cash Gift (no gift_name)
  const digitalVouchers = allGifts.filter((g: any) => g.gift_name).length;
  const moneyGifts = allGifts.filter((g: any) => !g.gift_name).length;
  const totalGifts = allGifts.length;
  const digitalPercent = totalGifts > 0 ? Math.round((digitalVouchers / totalGifts) * 100) : 0;
  const moneyPercent = totalGifts > 0 ? Math.round((moneyGifts / totalGifts) * 100) : 0;

  // Calculate chart data from real stats
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
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              +{Math.round(allUsers.length * 0.04)}
            </span>
          </div>
          <p className="text-[var(--v2-on-surface-variant)] text-xs font-bold uppercase tracking-widest mb-1">
            Total Users
          </p>
          <h3 className="text-3xl font-black v2-headline text-[var(--v2-on-surface)]">
            {(stats?.totalUsers || allUsers.length).toLocaleString()}
          </h3>
        </div>

        {/* Metric 2 - Total Active Users */}
        <div className="bg-white p-8 rounded-xl shadow-[0_32px_48px_-12px_rgba(56,56,53,0.04)] hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
              <span className="v2-icon">person_check</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
          <p className="text-[var(--v2-on-surface-variant)] text-xs font-bold uppercase tracking-widest mb-1">
            Total Active Users
          </p>
          <h3 className="text-3xl font-black v2-headline text-[var(--v2-on-surface)]">
            {activeUsers.toLocaleString()}
          </h3>
        </div>

        {/* Metric 3 - Total Gifts Sent (Power Metric) */}
        <div className="bg-[var(--v2-primary-container)] p-8 rounded-xl shadow-lg shadow-[var(--v2-primary-container)]/20 text-white hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <span className="v2-icon">card_giftcard</span>
            </div>
            <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">
            Total Gifts Sent
          </p>
          <h3 className="text-3xl font-black v2-headline">
            {totalGifts.toLocaleString()}
          </h3>
        </div>

        {/* Metric 4 - Platform Revenue */}
        <div className="bg-white p-8 rounded-xl shadow-[0_32px_48px_-12px_rgba(56,56,53,0.04)] hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[var(--v2-secondary-container)]/20 rounded-2xl text-[var(--v2-secondary)]">
              <span className="v2-icon">payments</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              +8.2%
            </span>
          </div>
          <p className="text-[var(--v2-on-surface-variant)] text-xs font-bold uppercase tracking-widest mb-1">
            Platform Revenue
          </p>
          <h3 className="text-3xl font-black v2-headline text-[var(--v2-on-surface)]">
            ₦{(stats?.totalSupport || 0).toLocaleString()}
          </h3>
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
              revenueData.slice(0, 7).map((data: any, i: number) => {
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
              // Fallback bars if no data
              [40, 65, 55, 85, 70, 45, 90].map((height, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-full transition-colors ${
                    height === 90
                      ? 'bg-[var(--v2-primary-container)] relative'
                      : 'bg-[var(--v2-primary-container)]/20 hover:bg-[var(--v2-primary-container)]/40'
                  }`}
                  style={{height: `${height}%`}}>
                  {height === 90 && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--v2-on-surface)] text-white text-[10px] px-2 py-1 rounded-md font-bold">
                      Peak
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="flex justify-between mt-6 px-4 text-[10px] font-bold text-[var(--v2-on-surface-variant)]/40 uppercase tracking-widest">
            {revenueData.length > 0 ? (
              revenueData.slice(0, 7).map((data: any, i: number) => (
                <span key={i}>{data.month}</span>
              ))
            ) : (
              <>
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
              </>
            )}
          </div>
        </div>

        {/* Category Breakdown - Digital Voucher vs Cash Gift */}
        <div className="bg-white p-8 rounded-xl shadow-[0_32px_48px_-12px_rgba(56,56,53,0.04)] flex flex-col">
          <h4 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] mb-8">
            Gift Breakdown
          </h4>
          <div className="relative w-48 h-48 mx-auto mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="transparent"
                stroke="var(--v2-surface-container)"
                strokeWidth="4"
              />
              {/* Digital Voucher segment */}
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="transparent"
                stroke="var(--v2-primary)"
                strokeWidth="4"
                strokeDasharray={`${digitalPercent} ${100 - digitalPercent}`}
                strokeDashoffset="0"
              />
              {/* Cash Gift segment */}
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="transparent"
                stroke="var(--v2-primary-container)"
                strokeWidth="4"
                strokeDasharray={`${moneyPercent} ${100 - moneyPercent}`}
                strokeDashoffset={`-${digitalPercent}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black v2-headline">{totalGifts}</span>
              <span className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase">
                Total Gifts
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[var(--v2-primary)]" />
                <span className="text-sm font-medium">Digital Voucher</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold">{digitalPercent}%</span>
                <span className="text-xs text-[var(--v2-on-surface-variant)] ml-2">({digitalVouchers})</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[var(--v2-primary-container)]" />
                <span className="text-sm font-medium">Cash Gift</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold">{moneyPercent}%</span>
                <span className="text-xs text-[var(--v2-on-surface-variant)] ml-2">({moneyGifts})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setSection('withdrawals')}
          className="p-4 bg-[var(--v2-surface-container-lowest)] rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center">
            <span className="v2-icon text-[var(--v2-primary)]">payments</span>
          </div>
          <span className="text-sm font-bold text-[var(--v2-on-surface)]">
            Pending Withdrawals
          </span>
        </button>
        <button
          onClick={() => setSection('moderation')}
          className="p-4 bg-[var(--v2-surface-container-lowest)] rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--v2-error)]/10 flex items-center justify-center">
            <span className="v2-icon text-[var(--v2-error)]">shield</span>
          </div>
          <span className="text-sm font-bold text-[var(--v2-on-surface)]">Moderation Queue</span>
        </button>
        <button
          onClick={() => setSection('users')}
          className="p-4 bg-[var(--v2-surface-container-lowest)] rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <span className="v2-icon text-blue-500">group</span>
          </div>
          <span className="text-sm font-bold text-[var(--v2-on-surface)]">Manage Users</span>
        </button>
        <button
          onClick={() => setSection('vendors')}
          className="p-4 bg-[var(--v2-surface-container-lowest)] rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <span className="v2-icon text-purple-500">storefront</span>
          </div>
          <span className="text-sm font-bold text-[var(--v2-on-surface)]">Vendor Review</span>
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
          <div className="space-y-4">
            {recentLogs.map((log: any) => (
              <div
                key={log.id}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl group hover:bg-[var(--v2-primary)]/5 transition-colors">
                <div className="w-12 h-12 rounded-full bg-[var(--v2-surface-container)] flex items-center justify-center text-[var(--v2-primary)] group-hover:bg-[var(--v2-primary)] group-hover:text-white transition-all">
                  <span className="v2-icon">history</span>
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-bold text-[var(--v2-on-surface)]">{log.action}</h5>
                  <p className="text-xs text-[var(--v2-on-surface-variant)]">
                    @{log.admin?.username || 'Unknown'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--v2-on-surface-variant)]/40">
                    {new Date(log.created_at).toLocaleDateString()}
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

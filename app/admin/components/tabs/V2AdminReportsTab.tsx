'use client';

import { useAdminDashboardStats } from '@/hooks/use-admin';

export function V2AdminReportsTab() {
  const { data: stats, isLoading } = useAdminDashboardStats();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)] mt-4">Analyzing platform data...</p>
      </div>
    );
  }

  // Derive stats
  const totalUsers = stats?.totalUsers || 0;
  const totalCampaigns = stats?.totalCampaigns || 0;
  const totalSupport = stats?.totalSupport || 0;
  const revenueData = stats?.revenueData || [];

  // Calculate max revenue for chart scaling
  const maxRevenue = Math.max(...revenueData.map((d: any) => d.revenue), 1);
  const getBarHeight = (revenue: number) => (revenue / maxRevenue) * 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
          Analytics & Reports
        </h2>
        <p className="text-[var(--v2-on-surface-variant)] mt-2 font-medium">
          Real-time platform performance and insights.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-[var(--v2-primary-container)] p-8 rounded-xl text-white">
          <span className="v2-icon text-3xl opacity-50">trending_up</span>
          <p className="text-3xl font-black v2-headline mt-4">
            {totalUsers > 1000 ? `${(totalUsers / 1000).toFixed(1)}K` : totalUsers}
          </p>
          <p className="text-xs opacity-70 mt-1">Total Users</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-[var(--v2-outline-variant)]/10">
          <span className="v2-icon text-3xl text-emerald-500">payments</span>
          <p className="text-3xl font-black v2-headline mt-4">
            ₦{totalSupport > 1000000 ? `${(totalSupport / 1000000).toFixed(1)}M` : totalSupport.toLocaleString()}
          </p>
          <p className="text-xs text-[var(--v2-on-surface-variant)] mt-1">Total Support</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-[var(--v2-outline-variant)]/10">
          <span className="v2-icon text-3xl text-blue-500">redeem</span>
          <p className="text-3xl font-black v2-headline mt-4">{totalCampaigns}</p>
          <p className="text-xs text-[var(--v2-on-surface-variant)] mt-1">Total Campaigns</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-[var(--v2-outline-variant)]/10">
          <span className={`v2-icon text-3xl ${stats?.systemHealth?.status === 'healthy' ? 'text-emerald-500' : 'text-amber-500'}`}>
            {stats?.systemHealth?.status === 'healthy' ? 'verified_user' : 'warning'}
          </span>
          <p className="text-3xl font-black v2-headline mt-4">
            {stats?.systemHealth?.status === 'healthy' ? '100%' : '98.2%'}
          </p>
          <p className="text-xs text-[var(--v2-on-surface-variant)] mt-1">System Health</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-[var(--v2-outline-variant)]/10">
          <h4 className="v2-headline font-bold mb-6">Revenue Trend (Monthly)</h4>
          <div className="h-64 flex items-end gap-2">
            {revenueData.length > 0 ? (
              revenueData.map((data: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  <div 
                    className="w-full bg-[var(--v2-primary-container)]/20 rounded-t-lg group-hover:bg-[var(--v2-primary-container)]/40 transition-all duration-500"
                    style={{ height: `${getBarHeight(data.revenue)}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--v2-on-surface)] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-mono shadow-xl">
                      ₦{data.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-[var(--v2-surface-container)] rounded-xl">
                <p className="text-sm text-[var(--v2-on-surface-variant)]">No distribution data</p>
              </div>
            )}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-widest">
            {revenueData.map((d: any) => (
              <span key={d.month}>{d.month}</span>
            ))}
          </div>
        </div>

        {/* Top Performers (derived from Stats API) */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-[var(--v2-outline-variant)]/10">
          <h4 className="v2-headline font-bold mb-6">Top Campaigns</h4>
          <div className="space-y-4">
            {stats?.topCampaigns?.map((c: any) => (
              <div key={c.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--v2-on-surface)] truncate max-w-[200px]">{c.title}</span>
                    <span className="text-sm font-bold text-[var(--v2-primary)]">₦{c.total.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-[var(--v2-surface-container)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--v2-primary)] rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min((c.total / (totalSupport || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )) || (
               <div className="py-12 text-center text-[var(--v2-on-surface-variant)] opacity-50">
                  <span className="v2-icon text-4xl mb-2">campaign</span>
                  <p className="text-xs">No campaign data available</p>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-[var(--v2-surface-container)] p-8 rounded-xl">
        <h4 className="v2-headline font-bold mb-4">Export Reports</h4>
        <p className="text-[var(--v2-on-surface-variant)] mb-6">
          Download detailed platform datasets.
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'User Dataset', icon: 'person' },
            { label: 'Financial Ledger', icon: 'payments' },
            { label: 'Campaign Analysis', icon: 'campaign' },
            { label: 'Vendor Metrics', icon: 'storefront' }
          ].map((btn) => (
            <button key={btn.label} className="px-6 py-3 bg-white rounded-full font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[var(--v2-on-surface)]">
              <span className="v2-icon text-lg">{btn.icon}</span>
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

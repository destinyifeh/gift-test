'use client';

export function V2AdminReportsTab() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
          Analytics & Reports
        </h2>
        <p className="text-[var(--v2-on-surface-variant)] mt-2 font-medium">
          Platform performance and insights.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-[var(--v2-primary-container)] p-8 rounded-xl text-white">
          <span className="v2-icon text-3xl opacity-50">trending_up</span>
          <p className="text-3xl font-black v2-headline mt-4">+24%</p>
          <p className="text-xs opacity-70 mt-1">User Growth</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <span className="v2-icon text-3xl text-emerald-500">payments</span>
          <p className="text-3xl font-black v2-headline mt-4">N2.4M</p>
          <p className="text-xs text-[var(--v2-on-surface-variant)] mt-1">Total Revenue</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <span className="v2-icon text-3xl text-blue-500">group</span>
          <p className="text-3xl font-black v2-headline mt-4">12.4K</p>
          <p className="text-xs text-[var(--v2-on-surface-variant)] mt-1">Active Users</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <span className="v2-icon text-3xl text-purple-500">redeem</span>
          <p className="text-3xl font-black v2-headline mt-4">8,420</p>
          <p className="text-xs text-[var(--v2-on-surface-variant)] mt-1">Gifts Sent</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <h4 className="v2-headline font-bold mb-6">Revenue Trend</h4>
          <div className="h-64 flex items-end gap-2">
            {[45, 62, 55, 78, 85, 70, 92].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-[var(--v2-primary-container)]/20 rounded-t-lg hover:bg-[var(--v2-primary-container)]/40 transition-colors"
                style={{height: `${h}%`}}
              />
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-[var(--v2-on-surface-variant)]">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        {/* User Activity */}
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <h4 className="v2-headline font-bold mb-6">User Activity</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Sign ups</span>
                  <span className="text-sm font-bold">2,450</span>
                </div>
                <div className="h-2 bg-[var(--v2-surface-container)] rounded-full overflow-hidden">
                  <div className="h-full w-[75%] bg-[var(--v2-primary-container)] rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Gifts Sent</span>
                  <span className="text-sm font-bold">1,820</span>
                </div>
                <div className="h-2 bg-[var(--v2-surface-container)] rounded-full overflow-hidden">
                  <div className="h-full w-[60%] bg-emerald-500 rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Campaigns Created</span>
                  <span className="text-sm font-bold">342</span>
                </div>
                <div className="h-2 bg-[var(--v2-surface-container)] rounded-full overflow-hidden">
                  <div className="h-full w-[25%] bg-blue-500 rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Vendor Applications</span>
                  <span className="text-sm font-bold">86</span>
                </div>
                <div className="h-2 bg-[var(--v2-surface-container)] rounded-full overflow-hidden">
                  <div className="h-full w-[15%] bg-purple-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-[var(--v2-surface-container)] p-8 rounded-xl">
        <h4 className="v2-headline font-bold mb-4">Export Reports</h4>
        <p className="text-[var(--v2-on-surface-variant)] mb-6">
          Download detailed reports for analysis.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="px-6 py-3 bg-white rounded-full font-bold text-sm shadow-sm hover:shadow-md transition-shadow">
            <span className="v2-icon text-sm mr-2 align-middle">download</span>
            User Report
          </button>
          <button className="px-6 py-3 bg-white rounded-full font-bold text-sm shadow-sm hover:shadow-md transition-shadow">
            <span className="v2-icon text-sm mr-2 align-middle">download</span>
            Financial Report
          </button>
          <button className="px-6 py-3 bg-white rounded-full font-bold text-sm shadow-sm hover:shadow-md transition-shadow">
            <span className="v2-icon text-sm mr-2 align-middle">download</span>
            Campaign Report
          </button>
          <button className="px-6 py-3 bg-white rounded-full font-bold text-sm shadow-sm hover:shadow-md transition-shadow">
            <span className="v2-icon text-sm mr-2 align-middle">download</span>
            Vendor Report
          </button>
        </div>
      </div>
    </div>
  );
}

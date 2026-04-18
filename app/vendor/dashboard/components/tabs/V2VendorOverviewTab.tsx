'use client';

import {useProfile} from '@/hooks/use-profile';
import {useVendorOrders, useVendorWallet} from '@/hooks/use-vendor';
import {formatCurrency} from '@/lib/utils/currency';
import {getCurrencyByCountry} from '@/lib/currencies';

type VendorSection = 'dashboard' | 'shop' | 'inventory' | 'orders' | 'codes' | 'wallet' | 'settings';

interface V2VendorOverviewTabProps {
  setSection: (section: VendorSection) => void;
}

export function V2VendorOverviewTab({setSection}: V2VendorOverviewTabProps) {
  const {data: profile} = useProfile();
  const {data: stats, isLoading} = useVendorWallet();
  const {data: orders = []} = useVendorOrders();

  const currency = getCurrencyByCountry(profile?.country || 'Nigeria');

  // Get recent orders (last 5)
  const recentOrders = orders.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading dashboard...</p>
      </div>
    );
  }

  const totalRevenue = stats?.totalSales || 0;
  const productsCount = stats?.productsCount || 0;
  const ordersCount = stats?.ordersCount || 0;
  const pendingAmount = stats?.pending || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold v2-headline tracking-tight text-[var(--v2-on-surface)] mb-2">
            Welcome back
          </h2>
          <p className="text-[var(--v2-on-surface-variant)]">
            Here's what's happening with your store today.
          </p>
        </div>
        <button
          onClick={() => setSection('inventory')}
          className="v2-hero-gradient text-[var(--v2-on-primary)] font-bold px-8 py-4 rounded-xl flex items-center gap-2 shadow-lg shadow-[var(--v2-primary)]/10 hover:opacity-90 transition-all active:scale-95">
          <span className="v2-icon">add_circle</span>
          <span>Add Product</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="col-span-2 bg-[var(--v2-surface-container-lowest)] p-6 rounded-3xl space-y-2">
          <span className="text-sm font-bold uppercase tracking-wider text-[var(--v2-on-surface-variant)]">
            Total Revenue
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-3xl text-[var(--v2-on-surface)] v2-headline">
              {formatCurrency(totalRevenue, currency)}
            </span>
            {totalRevenue > 0 && (
              <span className="text-[var(--v2-primary)] font-bold text-sm">+12%</span>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="bg-[var(--v2-surface-container-low)] p-4 md:p-5 rounded-3xl flex flex-col justify-between">
          <span
            className="v2-icon text-[var(--v2-primary)] mb-2"
            style={{fontVariationSettings: "'FILL' 1"}}>
            inventory_2
          </span>
          <div>
            <span className="block font-bold text-xl v2-headline text-[var(--v2-on-surface)]">
              {productsCount}
            </span>
            <span className="text-xs font-semibold text-[var(--v2-on-surface-variant)]">
              Active Products
            </span>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-[var(--v2-surface-container-low)] p-4 md:p-5 rounded-3xl flex flex-col justify-between">
          <span className="v2-icon text-[var(--v2-secondary)] mb-2">shopping_cart</span>
          <div>
            <span className="block font-bold text-xl v2-headline text-[var(--v2-on-surface)]">
              {ordersCount}
            </span>
            <span className="text-xs font-semibold text-[var(--v2-on-surface-variant)]">
              Total Orders
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Verify Code Card */}
        <button
          onClick={() => setSection('codes')}
          className="bg-[var(--v2-primary)] rounded-3xl p-6 text-left relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[var(--v2-primary-container)] rounded-full blur-3xl opacity-30" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
              <span className="v2-icon text-white text-2xl">qr_code_scanner</span>
            </div>
            <h3 className="text-lg font-bold text-white v2-headline mb-1">Verify Gift Code</h3>
            <p className="text-white/70 text-sm">Scan or enter codes to redeem</p>
          </div>
        </button>

        {/* View Wallet Card */}
        <button
          onClick={() => setSection('wallet')}
          className="bg-[var(--v2-surface-container-lowest)] rounded-3xl p-6 text-left relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-[var(--v2-secondary-container)]/30 flex items-center justify-center mb-4">
            <span className="v2-icon text-[var(--v2-secondary)] text-2xl">account_balance_wallet</span>
          </div>
          <h3 className="text-lg font-bold text-[var(--v2-on-surface)] v2-headline mb-1">
            View Wallet
          </h3>
          <p className="text-[var(--v2-on-surface-variant)] text-sm">
            {formatCurrency(pendingAmount, currency)} pending
          </p>
        </button>

        {/* Orders Card */}
        <button
          onClick={() => setSection('orders')}
          className="bg-[var(--v2-surface-container-lowest)] rounded-3xl p-6 text-left relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-[var(--v2-tertiary-container)]/30 flex items-center justify-center mb-4">
            <span className="v2-icon text-[var(--v2-tertiary)] text-2xl">shopping_bag</span>
          </div>
          <h3 className="text-lg font-bold text-[var(--v2-on-surface)] v2-headline mb-1">
            View Orders
          </h3>
          <p className="text-[var(--v2-on-surface-variant)] text-sm">{ordersCount} total orders</p>
        </button>
      </div>

      {/* Recent Activity Section */}
      <section className="bg-[var(--v2-surface-container-low)] rounded-[2rem] p-6 md:p-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold v2-headline text-[var(--v2-on-surface)]">
              Recent Orders
            </h3>
            <p className="text-[var(--v2-on-surface-variant)] text-sm">Latest customer orders</p>
          </div>
          <button
            onClick={() => setSection('orders')}
            className="text-[var(--v2-primary)] font-bold text-sm flex items-center gap-1 hover:underline">
            View All <span className="v2-icon text-sm">arrow_forward</span>
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--v2-surface-container-lowest)] flex items-center justify-center mb-4">
              <span className="v2-icon text-3xl text-[var(--v2-on-surface-variant)]/50">
                shopping_cart
              </span>
            </div>
            <p className="text-[var(--v2-on-surface-variant)] mb-1">No orders yet</p>
            <p className="text-sm text-[var(--v2-on-surface-variant)]/70">
              Orders will appear here when customers purchase your products
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order: any) => {
              const statusColors: Record<string, string> = {
                active: 'bg-blue-100 text-blue-800',
                claimed: 'bg-amber-100 text-amber-800',
                redeemed: 'bg-emerald-100 text-emerald-800',
              };
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-[var(--v2-surface-container-lowest)] hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center">
                      <span className="v2-icon text-[var(--v2-primary)]">receipt</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[var(--v2-on-surface)]">
                        {order.title || 'Gift Card'}
                      </p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)]">
                      {order.senderName || order.user?.displayName || 'Customer'} · {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        statusColors[order.status] || 'bg-gray-100 text-gray-800'
                      }`}>
                      {order.status}
                    </span>
                    <span className="font-bold text-[var(--v2-on-surface)]">
                      {formatCurrency(order.goalAmount || 0, currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Tips Card */}
      <div className="bg-[var(--v2-secondary-container)] rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[var(--v2-secondary)]/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <span className="v2-icon text-[var(--v2-on-secondary-container)] text-3xl">lightbulb</span>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-[var(--v2-on-secondary-container)] v2-headline mb-1">
              Pro Tip
            </h4>
            <p className="text-[var(--v2-on-secondary-container)]/80 text-sm">
              Keep your inventory updated and add high-quality product images to increase sales.
              Customers are more likely to purchase from vendors with complete profiles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import {useProfile} from '@/hooks/use-profile';
import {useVendorOrders} from '@/hooks/use-vendor';
import {getCurrencyByCountry} from '@/lib/currencies';
import {formatCurrency} from '@/lib/utils/currency';
import {useState} from 'react';

type OrderStatus = 'all' | 'active' | 'claimed' | 'redeemed';

export function V2VendorOrdersTab() {
  const {data: profile} = useProfile();
  const {data: orders = [], isLoading} = useVendorOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [search, setSearch] = useState('');

  const currency = getCurrencyByCountry(profile?.country || 'Nigeria');

  // Filter orders
  const filteredOrders = orders.filter((o: any) => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesCode = o.gift_code?.toLowerCase().includes(searchLower);
      const matchesTitle = o.title?.toLowerCase().includes(searchLower);
      const matchesSender = o.sender_name?.toLowerCase().includes(searchLower) ||
        o.profiles?.display_name?.toLowerCase().includes(searchLower);
      if (!matchesCode && !matchesTitle && !matchesSender) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;

    return true;
  });

  // Stats
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o: any) => o.status === 'active').length;
  const claimedOrders = orders.filter((o: any) => o.status === 'claimed').length;
  const redeemedOrders = orders.filter((o: any) => o.status === 'redeemed').length;
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (Number(o.goal_amount) || 0), 0);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'claimed':
        return 'bg-amber-100 text-amber-800';
      case 'redeemed':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return 'schedule';
      case 'claimed':
        return 'redeem';
      case 'redeemed':
        return 'check_circle';
      default:
        return 'help';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold v2-headline tracking-tight text-[var(--v2-on-surface)] mb-2">
            Orders
          </h2>
          <p className="text-[var(--v2-on-surface-variant)]">
            Track and manage customer orders for your products.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center mb-3">
            <span className="v2-icon text-[var(--v2-primary)]">shopping_bag</span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)]">
            {totalOrders}
          </p>
          <p className="text-xs text-[var(--v2-on-surface-variant)] font-medium">Total Orders</p>
        </div>

        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3">
            <span className="v2-icon text-blue-600">schedule</span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)]">
            {activeOrders}
          </p>
          <p className="text-xs text-[var(--v2-on-surface-variant)] font-medium">Pending</p>
        </div>

        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-3">
            <span className="v2-icon text-amber-600">redeem</span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)]">
            {claimedOrders}
          </p>
          <p className="text-xs text-[var(--v2-on-surface-variant)] font-medium">Claimed</p>
        </div>

        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
            <span className="v2-icon text-emerald-600">check_circle</span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)]">
            {redeemedOrders}
          </p>
          <p className="text-xs text-[var(--v2-on-surface-variant)] font-medium">Redeemed</p>
        </div>
      </div>

      {/* Revenue Banner */}
      <div className="v2-gradient-primary rounded-2xl p-5 md:p-6 flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm font-medium mb-1">Total Revenue</p>
          <p className="text-2xl md:text-3xl font-extrabold text-white v2-headline">
            {formatCurrency(totalRevenue, currency)}
          </p>
        </div>
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
          <span className="v2-icon text-2xl text-white">payments</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <span className="v2-icon absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[var(--v2-surface-container-low)] border-none rounded-xl py-3 pl-12 pr-4 focus:ring-1 focus:ring-[var(--v2-primary)] text-[var(--v2-on-surface)] placeholder-[var(--v2-on-surface-variant)]/50"
            placeholder="Search by code, title, or customer..."
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'active', 'claimed', 'redeemed'] as OrderStatus[]).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-[var(--v2-primary)] text-[var(--v2-on-primary)]'
                  : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)]'
              }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-8 md:p-12 text-center">
          <span className="v2-icon text-5xl text-[var(--v2-on-surface-variant)]/30 mb-4 block">
            shopping_cart
          </span>
          <h3 className="text-lg font-bold text-[var(--v2-on-surface)] mb-2">No orders yet</h3>
          <p className="text-sm text-[var(--v2-on-surface-variant)]">
            Orders will appear here when customers purchase your products.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-[var(--v2-surface-container-lowest)] rounded-[2rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[var(--v2-on-surface-variant)]/60 text-xs uppercase tracking-widest border-b border-[var(--v2-outline-variant)]/10">
                    <th className="py-5 px-6 text-left font-semibold">Order</th>
                    <th className="py-5 px-4 text-left font-semibold">Customer</th>
                    <th className="py-5 px-4 text-left font-semibold">Status</th>
                    <th className="py-5 px-4 text-right font-semibold">Amount</th>
                    <th className="py-5 px-4 text-right font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order: any) => (
                    <tr
                      key={order.id}
                      className="hover:bg-[var(--v2-surface-container-low)] transition-colors border-b border-[var(--v2-outline-variant)]/5 last:border-0">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center">
                            <span className="v2-icon text-[var(--v2-primary)]">receipt</span>
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[var(--v2-on-surface)]">
                              {order.title || 'Gift Card'}
                            </p>
                            <p className="text-xs text-[var(--v2-on-surface-variant)] font-mono">
                              {order.gift_code
                                ? `${order.gift_code.split('-')[0]}-${order.gift_code.split('-')[1]?.charAt(0) || ''}***`
                                : 'GIFT'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-[var(--v2-on-surface)] capitalize">
                          {order.sender_name || order.profiles?.display_name || order.profiles?.username || 'Customer'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                          <span className="v2-icon text-xs">{getStatusIcon(order.status)}</span>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="font-bold text-[var(--v2-on-surface)]">
                          {formatCurrency(order.goal_amount || 0, currency)}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-sm text-[var(--v2-on-surface-variant)]">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredOrders.map((order: any) => (
              <div
                key={order.id}
                className="bg-[var(--v2-surface-container-lowest)] rounded-2xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center">
                      <span className="v2-icon text-[var(--v2-primary)]">receipt</span>
                    </div>
                    <div>
                      <p className="font-bold text-[var(--v2-on-surface)]">
                        {order.title || 'Gift Card'}
                      </p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)] font-mono">
                        {order.gift_code
                          ? `${order.gift_code.split('-')[0]}-${order.gift_code.split('-')[1]?.charAt(0) || ''}***`
                          : 'GIFT'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--v2-outline-variant)]/10">
                  <div>
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">Customer</p>
                    <p className="text-sm font-medium text-[var(--v2-on-surface)] capitalize">
                      {order.sender_name || order.profiles?.display_name || 'Customer'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">Amount</p>
                    <p className="text-lg font-bold text-[var(--v2-primary)]">
                      {formatCurrency(order.goal_amount || 0, currency)}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[var(--v2-on-surface-variant)] mt-2">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

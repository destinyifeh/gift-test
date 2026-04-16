'use client';

import {useIsMobile} from '@/hooks/use-mobile';
import { useAdminTransactions } from '@/hooks/use-admin';
import { toast } from 'sonner';

interface V2AdminTransactionsTabProps {
  searchQuery: string;
  setViewDetailsModal: (modal: any) => void;
}

const typeColors: Record<string, {bg: string; text: string}> = {
  gift: {bg: 'bg-purple-100', text: 'text-purple-700'},
  donation: {bg: 'bg-blue-100', text: 'text-blue-700'},
  withdrawal: {bg: 'bg-orange-100', text: 'text-orange-700'},
  purchase: {bg: 'bg-emerald-100', text: 'text-emerald-700'},
};

export function V2AdminTransactionsTab({
  searchQuery,
  setViewDetailsModal,
}: V2AdminTransactionsTabProps) {
  const isMobile = useIsMobile();

  const {
    data: infiniteData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAdminTransactions({ search: searchQuery });

  const transactions = infiniteData?.pages.flatMap(page => page.data || []) || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)] mt-3">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
            Transactions
          </h2>
          <p className="text-[var(--v2-on-surface-variant)] mt-2 font-medium">
            Complete transaction history across the platform.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-[var(--v2-surface-container-high)] rounded-full text-[var(--v2-on-surface)] font-bold text-sm">
            <span className="v2-icon text-lg">filter_list</span>
            Filter
          </button>
          <button
            onClick={() => toast.success('Exporting...')}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--v2-surface-container-high)] rounded-full text-[var(--v2-on-surface)] font-bold text-sm">
            <span className="v2-icon text-lg">file_download</span>
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isMobile ? (
          <div className="divide-y divide-[var(--v2-surface-container)]">
            {transactions.map((tx: any) => {
              const colors = typeColors[tx.type] || typeColors.gift;
              return (
                <div key={tx.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[var(--v2-primary)]">
                      N{(tx.amount || 0).toLocaleString()}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${colors.bg} ${colors.text}`}>
                      {tx.type || 'transaction'}
                    </span>
                  </div>
                  <p className="text-sm">Ref: {tx.reference || tx.id?.slice(0, 8)}</p>
                  <p className="text-xs text-[var(--v2-on-surface-variant)]">
                    {tx.created_at ? new Date(tx.created_at).toLocaleString() : '—'}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--v2-surface-container)]/30">
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Reference
                </th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Type
                </th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Amount
                </th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  User
                </th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Date
                </th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Status
                </th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--v2-surface-container)]">
              {transactions.map((tx: any) => {
                const colors = typeColors[tx.type] || typeColors.gift;
                return (
                  <tr key={tx.id} className="hover:bg-[var(--v2-surface-container)]/20">
                    <td className="px-8 py-4 font-mono text-sm">
                      {tx.reference || tx.id?.slice(0, 8)}
                    </td>
                    <td className="px-8 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${colors.bg} ${colors.text}`}>
                        {tx.type || 'transaction'}
                      </span>
                    </td>
                    <td className="px-8 py-4 font-bold text-[var(--v2-primary)]">
                      N{(tx.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-8 py-4">@{tx.user?.username || 'unknown'}</td>
                    <td className="px-8 py-4 text-[var(--v2-on-surface-variant)]">
                      {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-8 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          tx.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : tx.status === 'failed'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-amber-100 text-amber-700'
                        }`}>
                        {tx.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <button
                        onClick={() =>
                          setViewDetailsModal({
                            isOpen: true,
                            title: 'Transaction Details',
                            data: tx,
                          })
                        }
                        className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)]">
                        <span className="v2-icon text-sm">arrow_forward_ios</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="px-8 py-6 bg-[var(--v2-surface-container)]/30 flex justify-between items-center">
          <p className="text-xs text-[var(--v2-on-surface-variant)]">
            Showing {transactions.length} transactions
          </p>
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-6 py-2 bg-[var(--v2-primary)] text-white rounded-full font-bold text-sm">
              {isFetchingNextPage ? 'Loading...' : 'Load More'}
            </button>
          )}
        </div>
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-16">
          <span className="v2-icon text-6xl text-[var(--v2-on-surface-variant)]/20">
            receipt_long
          </span>
          <p className="text-sm text-[var(--v2-on-surface-variant)] mt-4">No transactions found</p>
        </div>
      )}
    </div>
  );
}

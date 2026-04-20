'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { useAdminWithdrawals, useProcessWithdrawal } from '@/hooks/use-admin';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface V2AdminWithdrawalsTabProps {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

export function V2AdminWithdrawalsTab({
  searchQuery,
  addLog,
  setViewDetailsModal,
}: V2AdminWithdrawalsTabProps) {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const { data: infiniteData, isLoading } = useAdminWithdrawals();

  const withdrawals = infiniteData?.pages.flatMap(page => page.data || []) || [];

  const mutation = useProcessWithdrawal();

  const handleProcess = async (id: number, status: 'completed' | 'rejected') => {
    try {
      await mutation.mutateAsync({
        id,
        action: status === 'completed' ? 'approve' : 'reject',
      });
      toast.success(`Withdrawal ${status}`);
      addLog(`Processed withdrawal: ${status}`);
    } catch (error) {
      toast.error('Failed to process withdrawal');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)] mt-3">Loading withdrawals...</p>
      </div>
    );
  }

  const pendingWithdrawals = withdrawals.filter((w: any) => w.status === 'pending');
  const totalPending = pendingWithdrawals.reduce((sum: number, w: any) => sum + (w.amount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
            Withdrawals
          </h2>
          <p className="text-[var(--v2-on-surface-variant)] mt-2 font-medium">
            Review and process user withdrawal requests.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--v2-primary-container)] p-8 rounded-xl text-white">
          <p className="text-white/70 font-bold uppercase tracking-widest text-xs mb-2">
            Pending Withdrawals
          </p>
          <h3 className="text-3xl font-black v2-headline">N{totalPending.toLocaleString()}</h3>
          <p className="mt-4 text-sm opacity-80">{pendingWithdrawals.length} requests waiting</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs mb-2">
            Approved Today
          </p>
          <h3 className="text-3xl font-black v2-headline text-[var(--v2-on-surface)]">
            {withdrawals.filter((w: any) => w.status === 'completed').length}
          </h3>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <p className="text-[var(--v2-error)] font-bold uppercase tracking-widest text-xs mb-2">
            Rejected
          </p>
          <h3 className="text-3xl font-black v2-headline text-[var(--v2-on-surface)]">
            {withdrawals.filter((w: any) => w.status === 'rejected').length}
          </h3>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-[var(--v2-surface-container)]">
          <h4 className="v2-headline font-bold text-lg">Withdrawal Requests</h4>
        </div>
        {isMobile ? (
          <div className="divide-y divide-[var(--v2-surface-container)]">
            {withdrawals.map((withdrawal: any) => (
              <div key={withdrawal.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[var(--v2-primary)]">
                    N{(withdrawal.amount || 0).toLocaleString()}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      withdrawal.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : withdrawal.status === 'rejected'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-amber-100 text-amber-700'
                    }`}>
                    {withdrawal.status || 'pending'}
                  </span>
                </div>
                <p className="text-sm">@{withdrawal.user?.username || 'unknown'}</p>
                <p className="text-xs text-[var(--v2-on-surface-variant)]">
                  {withdrawal.bank_name} - {withdrawal.account_number}
                </p>
                {withdrawal.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleProcess(withdrawal.id, 'completed')}
                      className="flex-1 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">
                      Approve
                    </button>
                    <button
                      onClick={() => handleProcess(withdrawal.id, 'rejected')}
                      className="flex-1 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-bold">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--v2-surface-container)]/30">
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  User
                </th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Amount
                </th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Bank
                </th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Date
                </th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Status
                </th>
                <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--v2-surface-container)]">
              {withdrawals.map((withdrawal: any) => (
                <tr key={withdrawal.id} className="hover:bg-[var(--v2-surface-container)]/20">
                  <td className="px-8 py-4">
                    <div>
                      <p className="font-bold">{withdrawal.user?.displayName || 'Unknown'}</p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)]">
                        @{withdrawal.user?.username}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-4 font-bold text-[var(--v2-primary)]">
                    N{(withdrawal.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-8 py-4">
                    <p>{withdrawal.bank_name || '—'}</p>
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">
                      {withdrawal.account_number}
                    </p>
                  </td>
                  <td className="px-8 py-4 text-[var(--v2-on-surface-variant)]">
                    {withdrawal.createdAt
                      ? new Date(withdrawal.createdAt).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-8 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        withdrawal.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : withdrawal.status === 'rejected'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-amber-100 text-amber-700'
                      }`}>
                      {withdrawal.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    {withdrawal.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleProcess(withdrawal.id, 'completed')}
                          className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold hover:bg-emerald-200">
                          Approve
                        </button>
                        <button
                          onClick={() => handleProcess(withdrawal.id, 'rejected')}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold hover:bg-red-200">
                          Reject
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          setViewDetailsModal({
                            isOpen: true,
                            title: 'Withdrawal Details',
                            data: withdrawal,
                          })
                        }
                        className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)]">
                        <span className="v2-icon text-sm">arrow_forward_ios</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {withdrawals.length === 0 && (
        <div className="text-center py-16">
          <span className="v2-icon text-6xl text-[var(--v2-on-surface-variant)]/20">payments</span>
          <p className="text-sm text-[var(--v2-on-surface-variant)] mt-4">No withdrawals found</p>
        </div>
      )}
    </div>
  );
}

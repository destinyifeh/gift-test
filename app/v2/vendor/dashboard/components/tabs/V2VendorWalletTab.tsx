'use client';

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {BankPicker} from '@/components/ui/bank-picker';
import {useProfile} from '@/hooks/use-profile';
import {useVendorWallet} from '@/hooks/use-vendor';
import {
  getCurrencyByCountry,
  getCurrencySymbol,
} from '@/lib/currencies';
import {
  addPaystackBankAccount,
  fetchWalletProfile,
  getPaystackBanks,
  initiateWithdrawal,
  resolvePaystackAccount,
  deleteBankAccount,
} from '@/lib/server/actions/transactions';
import {formatCurrency} from '@/lib/utils/currency';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect, useMemo, useState} from 'react';
import {toast} from 'sonner';

type VendorTransactionFilter = 'all' | 'sales' | 'flex_redemptions' | 'withdrawals';
type DateFilter = 'all' | 'week' | 'month' | '3months';

export function V2VendorWalletTab() {
  const queryClient = useQueryClient();
  const {data: profile} = useProfile();
  const {data: vendorStats, isLoading: vendorLoading} = useVendorWallet();
  const [activeModal, setActiveModal] = useState<'withdraw' | 'bank' | 'manage-banks' | 'transactions' | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Nigeria');
  const [withdrawBank, setWithdrawBank] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const [bankForm, setBankForm] = useState({
    bankCode: '',
    bankName: '',
    accountNumber: '',
    holderName: '',
  });

  // Transaction filtering
  const [transactionFilter, setTransactionFilter] = useState<VendorTransactionFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const {data: walletProfile, isLoading} = useQuery({
    queryKey: ['wallet-profile'],
    queryFn: () => fetchWalletProfile(),
  });

  const {data: banksData} = useQuery({
    queryKey: ['paystack-banks', selectedCountry],
    queryFn: () => getPaystackBanks(selectedCountry),
  });

  const [hasSetDefaultCountry, setHasSetDefaultCountry] = useState(false);

  useEffect(() => {
    if (profile?.country && !hasSetDefaultCountry) {
      setSelectedCountry(profile.country);
      setHasSetDefaultCountry(true);
    }
  }, [profile, hasSetDefaultCountry]);

  const banks = banksData?.data || [];
  const wallet = walletProfile?.data || {
    balance: 0,
    totalInflow: 0,
    pendingPayouts: 0,
    accounts: [],
    transactions: [],
  };

  const userCurrency = getCurrencyByCountry(profile?.country);
  const currencySymbol = getCurrencySymbol(userCurrency);

  // Use vendor stats for revenue and transactions
  const totalRevenue = vendorStats?.totalSales || 0;
  const pendingAmount = vendorStats?.pending || 0;
  const vendorTransactions = vendorStats?.transactions || [];

  // Filter transactions based on type and date
  const filteredTransactions = useMemo(() => {
    let transactions = vendorTransactions.map((t: any) => ({
      id: `vendor-${t.id}`,
      description: t.desc,
      amount: t.amount,
      date: t.date,
      type: t.type || 'sale',
      rawDate: t.rawDate || t.date,
    }));

    // Filter by type
    if (transactionFilter === 'sales') {
      transactions = transactions.filter((t: any) =>
        t.type === 'sale' || t.type === 'redemption' || !t.description?.toLowerCase().includes('flex')
      );
    } else if (transactionFilter === 'flex_redemptions') {
      transactions = transactions.filter((t: any) =>
        t.type === 'flex_redemption' || t.description?.toLowerCase().includes('flex')
      );
    } else if (transactionFilter === 'withdrawals') {
      transactions = transactions.filter((t: any) =>
        t.type === 'withdrawal' || t.type === 'payout'
      );
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      let cutoffDate: Date;

      if (dateFilter === 'week') {
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (dateFilter === 'month') {
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else {
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      }

      transactions = transactions.filter((t: any) => {
        const transactionDate = new Date(t.rawDate || t.date);
        return transactionDate >= cutoffDate;
      });
    }

    return transactions.sort((a: any, b: any) =>
      new Date(b.rawDate || b.date || 0).getTime() - new Date(a.rawDate || a.date || 0).getTime()
    );
  }, [vendorTransactions, transactionFilter, dateFilter]);

  // Calculate stats
  const flexRedemptionTotal = useMemo(() => {
    return vendorTransactions
      .filter((t: any) => t.type === 'flex_redemption' || t.desc?.toLowerCase().includes('flex'))
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
  }, [vendorTransactions]);

  const handleResolveAccount = async () => {
    if (bankForm.accountNumber.length !== 10 || !bankForm.bankCode) return;
    setIsResolving(true);
    try {
      const result = await resolvePaystackAccount(bankForm.accountNumber, bankForm.bankCode);
      if (result.success) {
        setBankForm({...bankForm, holderName: result.data.account_name});
        toast.success('Account verified!');
      } else {
        toast.error(result.error || 'Could not verify account');
      }
    } catch {
      toast.error('Verification failed');
    } finally {
      setIsResolving(false);
    }
  };

  const handleAddBank = async () => {
    if (!bankForm.holderName) return;
    setIsAdding(true);
    try {
      const result = await addPaystackBankAccount(
        bankForm.bankName,
        bankForm.bankCode,
        bankForm.accountNumber,
        bankForm.holderName,
        selectedCountry,
        getCurrencyByCountry(selectedCountry)
      );
      if (result.success) {
        toast.success('Bank account added!');
        setBankForm({bankCode: '', bankName: '', accountNumber: '', holderName: ''});
        setActiveModal(null);
        await queryClient.invalidateQueries({queryKey: ['wallet-profile']});
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to add bank account');
    } finally {
      setIsAdding(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawBank || !withdrawAmount) return;
    setIsWithdrawing(true);
    try {
      const result = await initiateWithdrawal(Number(withdrawAmount), withdrawBank);
      if (result.success) {
        toast.success('Withdrawal initiated!');
        setActiveModal(null);
        setWithdrawAmount('');
        await queryClient.invalidateQueries({queryKey: ['wallet-profile']});
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Withdrawal failed');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleRemoveBank = async (bankId: string) => {
    setIsDeleting(bankId);
    try {
      const result = await deleteBankAccount(bankId);
      if (result.success) {
        toast.success('Bank account removed');
        await queryClient.invalidateQueries({queryKey: ['wallet-profile']});
      } else {
        toast.error(result.error || 'Failed to remove bank account');
      }
    } catch (error) {
      toast.error('Failed to remove bank account');
    } finally {
      setIsDeleting(null);
    }
  };

  const resetBankForm = () => {
    setBankForm({
      bankCode: '',
      bankName: '',
      accountNumber: '',
      holderName: '',
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading wallet...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Balance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Balance Card */}
        <div className="lg:col-span-8 v2-gradient-primary rounded-[2rem] p-6 md:p-8 relative overflow-hidden min-h-[200px] md:min-h-[280px] flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-10 -mb-10 blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white/70 font-semibold text-xs md:text-sm tracking-wide uppercase">
                Available Balance
              </span>
              <span
                className="v2-icon text-sm text-white/80"
                style={{fontVariationSettings: "'FILL' 1"}}>
                verified_user
              </span>
            </div>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tighter v2-headline">
              {formatCurrency(wallet.balance, userCurrency)}
            </h3>
            <div className="mt-3 md:hidden">
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-white">
                <span className="v2-icon text-sm">lock</span>
                Secured Funds
              </span>
            </div>
            <div className="hidden md:flex gap-4 mt-4">
              <span className="flex items-center gap-1 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white">
                <span className="v2-icon text-sm">trending_up</span>
                From {vendorStats?.ordersCount || 0} orders
              </span>
            </div>
          </div>

          <div className="relative z-10 flex gap-3 mt-6">
            <button
              onClick={() => setActiveModal('withdraw')}
              className="flex-1 md:flex-none h-12 px-6 bg-white text-[var(--v2-primary)] font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]">
              <span className="v2-icon text-lg">arrow_upward</span>
              <span className="text-sm md:text-base">Withdraw</span>
            </button>
            <button
              onClick={() => setActiveModal('transactions')}
              className="h-12 w-12 md:w-auto md:px-4 bg-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
              <span className="v2-icon">history</span>
              <span className="hidden md:block text-sm">History</span>
            </button>
          </div>
        </div>

        {/* Quick Stats - Desktop */}
        <div className="hidden lg:flex lg:col-span-4 flex-col gap-4">
          <div className="flex-1 bg-[var(--v2-surface-container-lowest)] p-5 rounded-[1.5rem] flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[var(--v2-secondary-container)]/30 flex items-center justify-center">
              <span className="v2-icon text-[var(--v2-secondary)]">payments</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                Total Revenue
              </p>
              <p className="text-xl font-extrabold text-[var(--v2-on-surface)] tracking-tight v2-headline">
                {formatCurrency(totalRevenue, userCurrency)}
              </p>
            </div>
          </div>
          <div className="flex-1 bg-[var(--v2-surface-container-lowest)] p-5 rounded-[1.5rem] flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[var(--v2-tertiary-container)]/30 flex items-center justify-center">
              <span className="v2-icon text-[var(--v2-tertiary)]">schedule</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                Pending
              </p>
              <p className="text-xl font-extrabold text-[var(--v2-on-surface)] tracking-tight v2-headline">
                {formatCurrency(pendingAmount, userCurrency)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Mobile */}
      <div className="grid grid-cols-3 lg:hidden gap-2">
        <div className="bg-[var(--v2-surface-container-lowest)] p-3 rounded-[1.25rem] shadow-sm">
          <div className="w-8 h-8 rounded-full bg-[var(--v2-secondary-container)]/30 flex items-center justify-center mb-2">
            <span className="v2-icon text-sm text-[var(--v2-secondary)]">call_received</span>
          </div>
          <p className="text-[9px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
            Revenue
          </p>
          <p className="text-sm font-extrabold text-[var(--v2-on-surface)] tracking-tight v2-headline">
            {formatCurrency(totalRevenue, userCurrency)}
          </p>
        </div>

        <div className="bg-[var(--v2-surface-container-lowest)] p-3 rounded-[1.25rem] shadow-sm">
          <div className="w-8 h-8 rounded-full bg-[var(--v2-tertiary-container)]/30 flex items-center justify-center mb-2">
            <span className="v2-icon text-sm text-[var(--v2-tertiary)]">schedule</span>
          </div>
          <p className="text-[9px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
            Pending
          </p>
          <p className="text-sm font-extrabold text-[var(--v2-on-surface)] tracking-tight v2-headline">
            {formatCurrency(pendingAmount, userCurrency)}
          </p>
        </div>

        <div className="bg-[var(--v2-surface-container-lowest)] p-3 rounded-[1.25rem] shadow-sm">
          <div className="w-8 h-8 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center mb-2">
            <span className="v2-icon text-sm text-[var(--v2-primary)]">shopping_cart</span>
          </div>
          <p className="text-[9px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
            Orders
          </p>
          <p className="text-sm font-extrabold text-[var(--v2-on-surface)] tracking-tight v2-headline">
            {vendorStats?.ordersCount || 0}
          </p>
        </div>
      </div>

      {/* Recent Activity & Banks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-bold v2-headline text-[var(--v2-on-surface)]">
              Recent Transactions
            </h3>
            <button
              onClick={() => setActiveModal('transactions')}
              className="text-sm font-bold text-[var(--v2-primary)]">
              View All
            </button>
          </div>

          {(() => {
            // Only show successful redemption transactions from vendor stats
            const redemptionTransactions = vendorTransactions.map((t: any) => ({
              id: `vendor-${t.id}`,
              description: t.desc,
              amount: t.amount,
              date: t.date,
              type: 'credit',
            })).sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

            if (redemptionTransactions.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/30 mb-3">
                    receipt_long
                  </span>
                  <p className="text-sm text-[var(--v2-on-surface-variant)]">No transactions yet</p>
                  <p className="text-xs text-[var(--v2-on-surface-variant)]/70">
                    Your transaction history will appear here
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {redemptionTransactions.slice(0, 5).map((t: any) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--v2-secondary-container)]/30 text-[var(--v2-secondary)]">
                        <span className="v2-icon">check_circle</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[var(--v2-on-surface)]">{t.description}</p>
                        <p className="text-xs text-[var(--v2-on-surface-variant)]">{t.date}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[var(--v2-secondary)]">
                      +{formatCurrency(t.amount, userCurrency)}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Connected Banks */}
        <div className="bg-[var(--v2-surface-container-low)] rounded-[2rem] p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-bold v2-headline text-[var(--v2-on-surface)]">
              Withdrawal Banks
            </h3>
            {wallet.accounts.length > 0 && (
              <button
                onClick={() => setActiveModal('manage-banks')}
                className="text-sm font-bold text-[var(--v2-primary)] hover:underline">
                Manage
              </button>
            )}
          </div>

          {wallet.accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <span className="v2-icon text-3xl text-[var(--v2-on-surface-variant)]/30 mb-2">
                account_balance
              </span>
              <p className="text-sm text-[var(--v2-on-surface-variant)]">No banks linked</p>
            </div>
          ) : (
            <div className="space-y-3">
              {wallet.accounts.slice(0, 2).map((b: any) => (
                <div
                  key={b.id}
                  className="p-4 rounded-xl bg-[var(--v2-surface-container-lowest)] flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center">
                    <span className="v2-icon text-[var(--v2-primary)]">account_balance</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[var(--v2-on-surface)] truncate">
                      {b.bank_name}
                    </p>
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">
                      ****{b.account_number?.slice(-4)}
                    </p>
                  </div>
                </div>
              ))}
              {wallet.accounts.length > 2 && (
                <button
                  onClick={() => setActiveModal('manage-banks')}
                  className="w-full py-2 text-sm font-medium text-[var(--v2-primary)] hover:underline">
                  +{wallet.accounts.length - 2} more accounts
                </button>
              )}
            </div>
          )}

          {wallet.accounts.length < 2 ? (
            <button
              onClick={() => {
                resetBankForm();
                setActiveModal('bank');
              }}
              className="w-full py-4 rounded-xl bg-[var(--v2-surface-container-lowest)] flex items-center justify-center gap-3 hover:bg-[var(--v2-surface-container-high)] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center">
                <span className="v2-icon text-sm text-[var(--v2-primary)]">add</span>
              </div>
              <p className="font-bold text-[var(--v2-on-surface)]">Add Bank Account</p>
            </button>
          ) : (
            <p className="text-xs text-center text-[var(--v2-on-surface-variant)]">
              Maximum of 2 bank accounts allowed
            </p>
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      <ResponsiveModal open={activeModal === 'withdraw'} onOpenChange={() => setActiveModal(null)}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Withdraw Funds</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)] font-bold">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 bg-[var(--v2-surface-container-low)] border-none rounded-xl text-lg font-bold"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-[var(--v2-on-surface-variant)] mt-2">
                Available: {formatCurrency(wallet.balance, userCurrency)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Select Bank
              </label>
              {wallet.accounts.length === 0 ? (
                <button
                  onClick={() => setActiveModal('bank')}
                  className="w-full py-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-primary)] font-bold">
                  + Add Bank Account First
                </button>
              ) : (
                <select
                  value={withdrawBank}
                  onChange={e => setWithdrawBank(e.target.value)}
                  className="w-full py-4 px-4 bg-[var(--v2-surface-container-low)] border-none rounded-xl">
                  <option value="">Select bank...</option>
                  {wallet.accounts.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.bank_name} - ****{b.account_number?.slice(-4)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing || !withdrawBank || !withdrawAmount}
              className="w-full py-4 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl disabled:opacity-50">
              {isWithdrawing ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Add Bank Modal */}
      <ResponsiveModal open={activeModal === 'bank'} onOpenChange={() => setActiveModal(null)}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Add Bank Account</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={e => setSelectedCountry(e.target.value)}
                className="w-full py-4 px-4 bg-[var(--v2-surface-container-low)] border-none rounded-xl">
                <option value="Nigeria">Nigeria</option>
                <option value="Ghana">Ghana</option>
                <option value="South Africa">South Africa</option>
                <option value="Kenya">Kenya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Bank
              </label>
              <BankPicker
                banks={banks}
                value={bankForm.bankCode}
                onChange={(bank) =>
                  setBankForm({...bankForm, bankCode: bank.code, bankName: bank.name})
                }
                variant="v2"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Account Number
              </label>
              <input
                type="text"
                value={bankForm.accountNumber}
                onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})}
                onBlur={handleResolveAccount}
                maxLength={10}
                className="w-full py-4 px-4 bg-[var(--v2-surface-container-low)] border-none rounded-xl"
                placeholder="Enter 10-digit account number"
              />
            </div>

            {isResolving && (
              <p className="text-sm text-[var(--v2-on-surface-variant)]">Verifying account...</p>
            )}

            {bankForm.holderName && (
              <div className="p-4 bg-[var(--v2-secondary-container)]/30 rounded-xl">
                <p className="text-sm text-[var(--v2-on-surface-variant)]">Account Name</p>
                <p className="font-bold text-[var(--v2-on-surface)]">{bankForm.holderName}</p>
              </div>
            )}

            <button
              onClick={handleAddBank}
              disabled={isAdding || !bankForm.holderName}
              className="w-full py-4 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl disabled:opacity-50">
              {isAdding ? 'Adding...' : 'Add Bank Account'}
            </button>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Manage Banks Modal */}
      <ResponsiveModal open={activeModal === 'manage-banks'} onOpenChange={() => setActiveModal(null)}>
        <ResponsiveModalContent className="max-h-[80vh]">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Manage Bank Accounts</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <div className="p-6 space-y-4">
            {wallet.accounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/30 mb-3">
                  account_balance
                </span>
                <p className="text-[var(--v2-on-surface-variant)]">No bank accounts linked</p>
                <p className="text-xs text-[var(--v2-on-surface-variant)]/70 mt-1">
                  Add a bank account to withdraw your earnings
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                {wallet.accounts.map((b: any) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl bg-[var(--v2-surface-container-low)] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center">
                      <span className="v2-icon text-[var(--v2-primary)]">account_balance</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[var(--v2-on-surface)] truncate">
                        {b.bank_name}
                      </p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)]">
                        {b.account_number} • {b.account_name || b.holder_name}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveBank(b.id)}
                      disabled={isDeleting === b.id}
                      className="w-10 h-10 rounded-full bg-[var(--v2-error)]/10 flex items-center justify-center hover:bg-[var(--v2-error)]/20 transition-colors disabled:opacity-50">
                      {isDeleting === b.id ? (
                        <span className="v2-icon text-[var(--v2-error)] animate-spin text-sm">
                          progress_activity
                        </span>
                      ) : (
                        <span className="v2-icon text-[var(--v2-error)] text-sm">delete</span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {wallet.accounts.length < 2 ? (
              <button
                onClick={() => {
                  resetBankForm();
                  setActiveModal('bank');
                }}
                className="w-full py-4 rounded-xl bg-[var(--v2-surface-container-lowest)] border-2 border-dashed border-[var(--v2-outline-variant)]/30 flex items-center justify-center gap-3 hover:bg-[var(--v2-surface-container-high)] transition-colors">
                <span className="v2-icon text-[var(--v2-primary)]">add</span>
                <span className="font-bold text-[var(--v2-on-surface)]">Add New Bank Account</span>
              </button>
            ) : (
              <div className="w-full py-4 rounded-xl bg-[var(--v2-surface-container-lowest)] flex items-center justify-center gap-2">
                <span className="v2-icon text-sm text-[var(--v2-on-surface-variant)]">info</span>
                <span className="text-sm text-[var(--v2-on-surface-variant)]">Maximum of 2 accounts reached</span>
              </div>
            )}
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Transactions Modal */}
      <ResponsiveModal open={activeModal === 'transactions'} onOpenChange={() => setActiveModal(null)}>
        <ResponsiveModalContent className="max-h-[80vh] md:max-w-[600px]">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Transaction History</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <div className="p-4 md:p-6 space-y-4">
            {/* Filters */}
            <div className="space-y-3">
              {/* Type Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                {([
                  {id: 'all', label: 'All', icon: 'list'},
                  {id: 'sales', label: 'Sales', icon: 'shopping_bag'},
                  {id: 'flex_redemptions', label: 'Flex Cards', icon: 'credit_card'},
                  {id: 'withdrawals', label: 'Withdrawals', icon: 'account_balance'},
                ] as const).map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setTransactionFilter(filter.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                      transactionFilter === filter.id
                        ? 'bg-[var(--v2-primary)] text-white'
                        : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)]'
                    }`}>
                    <span className="v2-icon text-sm">{filter.icon}</span>
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Date Filter */}
              <div className="flex gap-2">
                {([
                  {id: 'all', label: 'All Time'},
                  {id: 'week', label: '7 Days'},
                  {id: 'month', label: '30 Days'},
                  {id: '3months', label: '90 Days'},
                ] as const).map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setDateFilter(filter.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      dateFilter === filter.id
                        ? 'bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)]'
                        : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)]'
                    }`}>
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction Summary */}
            {transactionFilter === 'all' && (
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[var(--v2-surface-container-low)] p-3 rounded-xl text-center">
                  <p className="text-xs text-[var(--v2-on-surface-variant)]">Total Revenue</p>
                  <p className="font-bold text-sm text-[var(--v2-on-surface)]">
                    {formatCurrency(totalRevenue, userCurrency)}
                  </p>
                </div>
                <div className="bg-[var(--v2-surface-container-low)] p-3 rounded-xl text-center">
                  <p className="text-xs text-[var(--v2-on-surface-variant)]">Flex Cards</p>
                  <p className="font-bold text-sm text-purple-600">
                    {formatCurrency(flexRedemptionTotal, userCurrency)}
                  </p>
                </div>
                <div className="bg-[var(--v2-surface-container-low)] p-3 rounded-xl text-center">
                  <p className="text-xs text-[var(--v2-on-surface-variant)]">Orders</p>
                  <p className="font-bold text-sm text-[var(--v2-on-surface)]">
                    {vendorStats?.ordersCount || 0}
                  </p>
                </div>
              </div>
            )}

            {/* Transaction List */}
            <div className="overflow-y-auto max-h-[40vh]">
              {filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/30 mb-3">
                    receipt_long
                  </span>
                  <p className="text-[var(--v2-on-surface-variant)]">No transactions found</p>
                  <p className="text-xs text-[var(--v2-on-surface-variant)]/70 mt-1">
                    {transactionFilter !== 'all' || dateFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Your transactions will appear here'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTransactions.map((t: any) => {
                    const isFlexRedemption = t.type === 'flex_redemption' || t.description?.toLowerCase().includes('flex');
                    const isWithdrawal = t.type === 'withdrawal' || t.type === 'payout';

                    const getIcon = () => {
                      if (isFlexRedemption) return 'credit_card';
                      if (isWithdrawal) return 'account_balance';
                      return 'check_circle';
                    };

                    const getIconStyle = () => {
                      if (isFlexRedemption) return 'bg-purple-100 text-purple-700';
                      if (isWithdrawal) return 'bg-orange-100 text-orange-700';
                      return 'bg-[var(--v2-secondary-container)]/30 text-[var(--v2-secondary)]';
                    };

                    const getTypeLabel = () => {
                      if (isFlexRedemption) return 'Flex Card Redemption';
                      if (isWithdrawal) return 'Withdrawal';
                      return 'Sale';
                    };

                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-[var(--v2-surface-container-low)]">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconStyle()}`}>
                            <span className="v2-icon">{getIcon()}</span>
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[var(--v2-on-surface)]">
                              {t.description}
                            </p>
                            <p className="text-xs text-[var(--v2-on-surface-variant)]">
                              {t.date} • {getTypeLabel()}
                            </p>
                          </div>
                        </div>
                        <span className={`font-bold ${isWithdrawal ? 'text-[var(--v2-error)]' : 'text-[var(--v2-secondary)]'}`}>
                          {isWithdrawal ? '-' : '+'}
                          {formatCurrency(t.amount, userCurrency)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}

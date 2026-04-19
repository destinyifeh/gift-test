'use client';

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {BankPicker} from '@/components/ui/bank-picker';
import {useProfile} from '@/hooks/use-profile';
import {
  useWalletProfile,
  useBanks,
  useResolveAccount,
  useAddBankAccount,
  useWithdraw,
  useDeleteBankAccount,
} from '@/hooks/use-transactions';
import {
  getCurrencyByCountry,
  getCurrencySymbol,
} from '@/lib/currencies';
import {formatCurrency} from '@/lib/utils/currency';
import {useEffect, useMemo, useState} from 'react';
import {toast} from 'sonner';
import {useGiftByCode, useClaimGift, useMyFlexCards} from '@/hooks/use-claims';
import {FlexCardComponent, FlexCardModal} from '../../../components/FlexCard';

type TransactionFilter = 'all' | 'gifts' | 'flex_card' | 'withdrawals';
type DateFilter = 'all' | 'week' | 'month' | '3months';

export function V2WalletTab() {
  const [activeModal, setActiveModal] = useState<'withdraw' | 'bank' | 'transactions' | 'flex_cards' | null>(null);
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
  const [transactionFilter, setTransactionFilter] = useState<TransactionFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  // Flex cards
  const [selectedFlexCard, setSelectedFlexCard] = useState<any | null>(null);

  const {data: walletProfile, isLoading} = useWalletProfile();
  const {data: banksData} = useBanks(selectedCountry);
  const {data: flexCardsRes, isLoading: isLoadingFlexCards} = useMyFlexCards();

  const flexCards = flexCardsRes?.data || [];
  const resolveAccount = useResolveAccount();
  const addBankAccountMutation = useAddBankAccount();
  const withdrawMutation = useWithdraw();
  const deleteBankAccountMutation = useDeleteBankAccount();

  const {data: profile} = useProfile();
  const [hasSetDefaultCountry, setHasSetDefaultCountry] = useState(false);

  useEffect(() => {
    if (profile?.country && !hasSetDefaultCountry) {
      setSelectedCountry(profile.country);
      setHasSetDefaultCountry(true);
    }
  }, [profile, hasSetDefaultCountry]);

  const banks = Array.isArray(banksData) ? banksData : (banksData?.data || []);
  const walletData = walletProfile || {};
  
  // Debug log to see the shape of the data
  console.log('--- Wallet Profile Debug ---');
  console.log('API Response (destructured):', walletData);

  const wallet = walletData.user || {
    balance: 0,
    totalInflow: 0,
    pending: 0,
    outflow: 0,
  };
  const accounts = walletData.accounts || [];
  const walletTransactions = walletData.transactions || [];

  // Filter transactions based on type and date
  const filteredTransactions = useMemo(() => {
    let txs = walletTransactions || [];

    // Filter by type
    if (transactionFilter === 'gifts') {
      txs = txs.filter((t: any) =>
        ['receipt', 'creator_support', 'campaign_contribution', 'gift_redemption'].includes(t.type)
      );
    } else if (transactionFilter === 'flex_card') {
      txs = txs.filter((t: any) =>
        ['flex_card', 'flex_card_redemption'].includes(t.type) || t.description?.toLowerCase().includes('flex')
      );
    } else if (transactionFilter === 'withdrawals') {
      txs = txs.filter((t: any) =>
        ['withdrawal', 'payout'].includes(t.type)
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

      txs = txs.filter((t: any) =>
        new Date(t.created_at) >= cutoffDate
      );
    }

    return txs;
  }, [walletTransactions, transactionFilter, dateFilter]);

  // Calculate flex card total balance
  const totalFlexCardBalance = useMemo(() => {
    return flexCards
      .filter((card: any) => card.status === 'active' || card.status === 'partially_used')
      .reduce((sum: number, card: any) => sum + (card.current_balance || 0), 0);
  }, [flexCards]);

  const userCurrency = getCurrencyByCountry(profile?.country);
  const currencySymbol = getCurrencySymbol(userCurrency);

  const handleResolveAccount = async () => {
    if (bankForm.accountNumber.length !== 10 || !bankForm.bankCode) return;
    setIsResolving(true);
    resolveAccount.mutate({
      accountNumber: bankForm.accountNumber,
      bankCode: bankForm.bankCode
    }, {
      onSuccess: (data) => {
        setBankForm({...bankForm, holderName: data.account_name});
        toast.success('Account verified!');
        setIsResolving(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Could not verify account');
        setIsResolving(false);
      }
    });
  };

  const handleAddBank = async () => {
    if (!bankForm.holderName) return;
    setIsAdding(true);
    addBankAccountMutation.mutate({
      bankName: bankForm.bankName,
      bankCode: bankForm.bankCode,
      accountNumber: bankForm.accountNumber,
      accountName: bankForm.holderName,
      country: selectedCountry,
      currency: getCurrencyByCountry(selectedCountry)
    }, {
      onSuccess: () => {
        setBankForm({bankCode: '', bankName: '', accountNumber: '', holderName: ''});
        setActiveModal(null);
        setIsAdding(false);
      },
      onError: () => {
        setIsAdding(false);
      }
    });
  };

  const handleWithdraw = async () => {
    if (!withdrawBank || !withdrawAmount) return;
    setIsWithdrawing(true);
    withdrawMutation.mutate({
      amount: Number(withdrawAmount),
      bankAccountId: withdrawBank
    }, {
      onSuccess: () => {
        setActiveModal(null);
        setWithdrawAmount('');
        setIsWithdrawing(false);
      },
      onError: () => {
        setIsWithdrawing(false);
      }
    });
  };

  const handleRemoveBank = async (bankId: string) => {
    deleteBankAccountMutation.mutate(bankId);
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
      {/* Hero Balance Section - Bento Grid */}
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
            {/* Mobile: Secured Assets badge */}
            <div className="mt-3 md:hidden">
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-white">
                <span className="v2-icon text-sm">lock</span>
                Secured Assets
              </span>
            </div>
            {/* Desktop: Trend indicator */}
            <div className="hidden md:flex gap-4 mt-4">
              <span className="flex items-center gap-1 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white">
                <span className="v2-icon text-sm">trending_up</span>
                +12.5% this month
              </span>
            </div>
          </div>

          {/* Desktop Action Buttons inside card */}
          <div className="hidden md:flex flex-wrap gap-3 mt-6 relative z-10">
            <button
              onClick={() => setActiveModal('withdraw')}
              className="bg-white text-[var(--v2-primary)] px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-[0.98] transition-transform shadow-lg">
              <span className="v2-icon">account_balance</span>
              Withdraw
            </button>
            <button
              onClick={() => setActiveModal('transactions')}
              className="bg-white/20 backdrop-blur text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white/30 transition-colors">
              <span className="v2-icon">receipt_long</span>
              Transactions
            </button>
            <button
              onClick={() => setActiveModal('bank')}
              className="bg-white/10 backdrop-blur text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white/20 transition-colors">
              <span className="v2-icon">add_card</span>
              Add Bank
            </button>
          </div>
        </div>

        {/* Platform Credit Card - Desktop only (Temporarily Disabled) */}
        {/* <div className="hidden lg:flex lg:col-span-4 bg-[var(--v2-primary)] text-white rounded-[2rem] p-6 flex-col justify-between relative overflow-hidden">
        </div> */}
      </div>

      {/* Mobile Action Buttons */}
      <div className="md:hidden flex justify-around gap-4 py-2">
        <button
          onClick={() => setActiveModal('withdraw')}
          className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-[var(--v2-surface-container-lowest)] shadow-sm flex items-center justify-center">
            <span className="v2-icon text-2xl text-[var(--v2-primary)]">account_balance</span>
          </div>
          <span className="text-xs font-medium text-[var(--v2-on-surface)]">Withdraw</span>
        </button>
        <button
          onClick={() => setActiveModal('bank')}
          className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-[var(--v2-surface-container-lowest)] shadow-sm flex items-center justify-center">
            <span className="v2-icon text-2xl text-[var(--v2-primary)]">account_balance</span>
          </div>
          <span className="text-xs font-medium text-[var(--v2-on-surface)]">Banks</span>
        </button>
        <button
          onClick={() => setActiveModal('transactions')}
          className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-[var(--v2-surface-container-lowest)] shadow-sm flex items-center justify-center">
            <span className="v2-icon text-2xl text-[var(--v2-primary)]">history</span>
          </div>
          <span className="text-xs font-medium text-[var(--v2-on-surface)]">History</span>
        </button>
      </div>

      {/* User Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Inflow */}
        <div className="bg-[var(--v2-surface-container-lowest)] p-3 md:p-5 rounded-[1.25rem] md:rounded-[1.5rem] shadow-sm">
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-[var(--v2-secondary-container)]/30 flex items-center justify-center mb-2">
            <span className="v2-icon text-sm md:text-base text-[var(--v2-secondary)]">call_received</span>
          </div>
          <p className="text-[9px] md:text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
            Total Inflow
          </p>
          <p className="text-sm md:text-xl font-extrabold text-[var(--v2-on-surface)] tracking-tight v2-headline">
            {formatCurrency(wallet.totalInflow, userCurrency)}
          </p>
        </div>

        {/* Pending Cash Gifts */}
        <div className="bg-[var(--v2-surface-container-lowest)] p-3 md:p-5 rounded-[1.25rem] md:rounded-[1.5rem] shadow-sm">
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-[var(--v2-tertiary-container)]/30 flex items-center justify-center mb-2">
            <span className="v2-icon text-sm md:text-base text-[var(--v2-tertiary)]">schedule</span>
          </div>
          <p className="text-[9px] md:text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
            Pending Gifts
          </p>
          <p className="text-sm md:text-xl font-extrabold text-[var(--v2-on-surface)] tracking-tight v2-headline">
            {formatCurrency(wallet.pending, userCurrency)}
          </p>
        </div>

        {/* Total Outflow */}
        <div className="bg-[var(--v2-surface-container-lowest)] p-3 md:p-5 rounded-[1.25rem] md:rounded-[1.5rem] shadow-sm">
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-[var(--v2-error)]/10 flex items-center justify-center mb-2">
            <span className="v2-icon text-sm md:text-base text-[var(--v2-error)]">call_made</span>
          </div>
          <p className="text-[9px] md:text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
            Total Outflow
          </p>
          <p className="text-sm md:text-xl font-extrabold text-[var(--v2-on-surface)] tracking-tight v2-headline">
            {formatCurrency(wallet.outflow, userCurrency)}
          </p>
        </div>
      </div>

      {/* Flex Cards Section */}
      {flexCards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg md:text-xl font-bold tracking-tight v2-headline text-[var(--v2-on-surface)]">
              My Flex Cards
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--v2-on-surface-variant)]">
                Total Balance:
              </span>
              <span className="font-bold text-[var(--v2-primary)]">
                {formatCurrency(totalFlexCardBalance, userCurrency)}
              </span>
            </div>
          </div>

          {flexCards.filter((card: any) => card.status === 'active' || card.status === 'partially_used').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flexCards
                .filter((card: any) => card.status === 'active' || card.status === 'partially_used')
                .slice(0, 3)
                .map((card: any) => (
                  <FlexCardComponent 
                    key={card.id} 
                    card={card} 
                    variant="compact" 
                    onClick={() => setSelectedFlexCard(card)}
                  />
                ))}
            </div>
          ) : (
            <div className="bg-[var(--v2-surface-container-low)] rounded-2xl p-6 text-center border-2 border-dashed border-[var(--v2-outline-variant)]/20">
              <span className="v2-icon text-3xl text-[var(--v2-on-surface-variant)]/30 mb-2">credit_card</span>
              <p className="text-sm text-[var(--v2-on-surface-variant)]">No active flex cards</p>
              <button 
                onClick={() => setActiveModal('flex_cards')}
                className="mt-2 text-[var(--v2-primary)] font-bold text-sm hover:underline">
                View card history
              </button>
            </div>
          )}

          {flexCards.length > 3 && flexCards.filter(card => card.status === 'active' || card.status === 'partially_used').length > 0 && (
            <button
              onClick={() => setActiveModal('flex_cards')}
              className="w-full py-3 text-center text-[var(--v2-primary)] font-bold text-sm hover:underline">
              View all {flexCards.length} Flex Cards
            </button>
          )}
        </div>
      )}

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg md:text-xl font-bold tracking-tight v2-headline text-[var(--v2-on-surface)]">
              Recent Activity
            </h4>
            <button
              onClick={() => setActiveModal('transactions')}
              className="text-[var(--v2-primary)] font-bold text-sm hover:underline">
              See all
            </button>
          </div>

          <div className="bg-[var(--v2-surface-container-low)] rounded-[1.5rem] md:rounded-[2rem] p-2">
            {walletTransactions.length === 0 ? (
              <div className="text-center py-12">
                <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/50 mb-2">
                  receipt_long
                </span>
                <p className="text-[var(--v2-on-surface-variant)]">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredTransactions.slice(0, 5).map((t: any) => {
                  const isInflow = ['receipt', 'creator_support'].includes(t.type);
                  const isFlexCard = t.type === 'flex_card' || t.type === 'flex_card_redemption' || t.description?.toLowerCase().includes('flex');
                  const isGiftRedemption = t.type === 'gift_redemption';
                  const isWithdrawal = t.type === 'withdrawal' || t.type === 'payout';

                  const getIcon = () => {
                    if (isFlexCard || isGiftRedemption) return 'shopping_bag';
                    if (isWithdrawal) return 'account_balance';
                    if (isInflow) return 'payments';
                    return 'receipt_long';
                  };

                  const getIconStyle = () => {
                    if (isFlexCard) return 'bg-purple-100 text-purple-700';
                    if (isGiftRedemption) return 'bg-blue-100 text-blue-700';
                    if (isWithdrawal) return 'bg-orange-100 text-orange-700';
                    if (isInflow) return 'bg-green-100 text-green-700';
                    return 'bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)]';
                  };

                  const getTypeLabel = () => {
                    if (isFlexCard) return 'Flex Card Payment';
                    if (isGiftRedemption) return 'Gift Redemption';
                    if (isWithdrawal) return 'Withdrawal';
                    if (t.type === 'creator_support') return 'Gift Received';
                    if (t.type === 'campaign_contribution') return 'Contribution';
                    return t.type?.replace(/_/g, ' ');
                  };

                  const isDebit = isWithdrawal || isFlexCard || isGiftRedemption;

                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-4 md:p-5 bg-[var(--v2-surface-container-lowest)] rounded-2xl hover:bg-white transition-colors">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${getIconStyle()}`}>
                          <span className="v2-icon">{getIcon()}</span>
                        </div>
                        <div>
                          <p className="font-bold text-sm md:text-base text-[var(--v2-on-surface)] truncate max-w-[150px] md:max-w-[200px]">
                            {t.description || 'Transaction'}
                          </p>
                          <p className="text-xs text-[var(--v2-on-surface-variant)]">
                            {new Date(t.created_at).toLocaleDateString()} • {getTypeLabel()}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`text-base md:text-lg font-extrabold ${
                          !isDebit ? 'text-green-700' : 'text-[var(--v2-error)]'
                        }`}>
                        {!isDebit ? '+' : '-'}
                        {formatCurrency(Math.abs(t.amount / 100), userCurrency)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Active Accounts - Desktop */}
        <div className="hidden lg:block space-y-4">
          <h4 className="text-xl font-bold tracking-tight v2-headline text-[var(--v2-on-surface)]">
            Active Accounts
          </h4>

          {/* Bank Cards */}
          {accounts.length > 0 ? (
            <div className="space-y-3">
              {accounts.slice(0, 1).map((b: any) => (
                <div
                  key={b.id}
                  className="bg-[var(--v2-surface-container-highest)] rounded-[1.5rem] p-5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--v2-primary)]/10 to-transparent" />
                  <div className="flex justify-between items-start relative z-10 mb-6">
                    <span className="text-[var(--v2-primary)] font-black italic text-lg">
                      {b.bank_name?.split(' ')[0] || 'BANK'}
                    </span>
                    <span className="v2-icon text-[var(--v2-on-surface-variant)]">
                      contactless
                    </span>
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] tracking-widest uppercase mb-1">
                      Account Number
                    </p>
                    <p className="text-lg font-bold text-[var(--v2-on-surface)] tracking-widest">
                      **** **** **** {b.account_number?.slice(-4) || '0000'}
                    </p>
                  </div>
                  <div className="flex justify-between items-end mt-5 relative z-10">
                    <div>
                      <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase">
                        Account Holder
                      </p>
                      <p className="text-sm font-bold text-[var(--v2-on-surface)] uppercase">
                        {b.account_name || 'Account Holder'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveBank(b.id)}
                      className="p-2 rounded-lg hover:bg-[var(--v2-error)]/10 text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-error)] transition-colors">
                      <span className="v2-icon text-sm">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Link New Bank Card */}
          <button
            onClick={() => setActiveModal('bank')}
            className="w-full bg-[var(--v2-surface-container-low)] rounded-[1.5rem] p-6 border-2 border-dashed border-[var(--v2-outline-variant)]/30 flex flex-col items-center justify-center gap-3 py-10 text-center hover:bg-[var(--v2-surface-container-high)] transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[var(--v2-outline)] transition-transform group-hover:scale-110">
              <span className="v2-icon">add</span>
            </div>
            <div>
              <p className="font-bold text-[var(--v2-on-surface)]">Link New Bank</p>
              <p className="text-xs text-[var(--v2-on-surface-variant)] px-4">
                Withdraw directly to your local bank account
              </p>
            </div>
          </button>

        </div>
      </div>

      {/* Connected Banks - Mobile only */}
      {accounts.length > 0 && (
        <div className="lg:hidden space-y-3">
          <h3 className="text-base font-bold text-[var(--v2-on-surface)] v2-headline">
            Connected Banks
          </h3>
          <div className="space-y-2">
            {accounts.map((b: any) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-[var(--v2-surface-container-lowest)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--v2-surface-container-high)] flex items-center justify-center">
                    <span className="v2-icon text-[var(--v2-on-surface-variant)]">
                      account_balance
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[var(--v2-on-surface)]">
                      {b.bank_name}
                      {b.is_primary && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]">
                          Primary
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">
                      {b.account_name} • ••••{b.account_number?.slice(-4)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveBank(b.id)}
                  className="p-2 rounded-xl hover:bg-[var(--v2-error)]/10 text-[var(--v2-error)] transition-colors">
                  <span className="v2-icon">delete</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      <ResponsiveModal open={activeModal === 'withdraw'} onOpenChange={open => !open && setActiveModal(null)}>
        <ResponsiveModalContent className="bg-[var(--v2-surface)]">
          <ResponsiveModalHeader className="border-b border-[var(--v2-outline-variant)]/10">
            <ResponsiveModalTitle className="text-xl font-bold v2-headline text-[var(--v2-on-surface)]">
              Withdraw Funds
            </ResponsiveModalTitle>
          </ResponsiveModalHeader>

          <div className="p-4 md:p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--v2-on-surface)]">
                Select Bank Account
              </label>
              <select
                value={withdrawBank}
                onChange={e => setWithdrawBank(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] border-none focus:ring-2 focus:ring-[var(--v2-primary)]">
                <option value="">Choose bank</option>
                {accounts.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.bank_name} — ••••{b.account_number?.slice(-4)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--v2-on-surface)]">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)] font-bold">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full h-14 pl-12 pr-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] text-xl font-bold border-none focus:ring-2 focus:ring-[var(--v2-primary)]"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  max={wallet.balance}
                />
              </div>
              <p className="text-xs text-[var(--v2-on-surface-variant)] text-right">
                Max: {formatCurrency(wallet.balance, userCurrency)}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 h-12 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-xl hover:bg-[var(--v2-surface-container-high)] transition-colors">
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={!withdrawBank || !withdrawAmount || isWithdrawing}
                className="flex-1 h-12 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl transition-transform active:scale-[0.98] disabled:opacity-50">
                {isWithdrawing ? (
                  <span className="v2-icon animate-spin">progress_activity</span>
                ) : (
                  'Withdraw'
                )}
              </button>
            </div>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Add Bank Modal */}
      <ResponsiveModal open={activeModal === 'bank'} onOpenChange={open => !open && setActiveModal(null)}>
        <ResponsiveModalContent className="bg-[var(--v2-surface)]">
          <ResponsiveModalHeader className="border-b border-[var(--v2-outline-variant)]/10">
            <ResponsiveModalTitle className="text-xl font-bold v2-headline text-[var(--v2-on-surface)]">
              Add Bank Account
            </ResponsiveModalTitle>
          </ResponsiveModalHeader>

          <div className="p-4 md:p-6 space-y-4 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--v2-on-surface-variant)]">
                  Country
                </label>
                <div className="h-12 px-4 rounded-xl bg-[var(--v2-surface-container-low)] flex items-center text-[var(--v2-on-surface)]">
                  {selectedCountry || 'Nigeria'}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--v2-on-surface-variant)]">
                  Bank
                </label>
                <BankPicker
                  banks={banks}
                  value={bankForm.bankCode}
                  onChange={bank =>
                    setBankForm({...bankForm, bankCode: bank.code, bankName: bank.name})
                  }
                  isLoading={!banksData}
                  placeholder="Select bank"
                  variant="v2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--v2-on-surface-variant)]">
                Account Number
              </label>
              <div className="flex gap-2">
                <input
                  value={bankForm.accountNumber}
                  onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})}
                  placeholder="0123456789"
                  maxLength={10}
                  className="flex-1 h-12 px-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] border-none focus:ring-2 focus:ring-[var(--v2-primary)]"
                />
                <button
                  onClick={handleResolveAccount}
                  disabled={isResolving || bankForm.accountNumber.length !== 10 || !bankForm.bankCode}
                  className="h-12 px-4 bg-[var(--v2-primary)] text-white font-bold rounded-xl hover:bg-[var(--v2-primary)]/90 transition-colors disabled:opacity-50 disabled:bg-[var(--v2-surface-container-high)] disabled:text-[var(--v2-on-surface-variant)]">
                  {isResolving ? (
                    <span className="v2-icon animate-spin">progress_activity</span>
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--v2-on-surface-variant)]">
                Account Holder Name
              </label>
              <input
                value={bankForm.holderName}
                readOnly
                placeholder="Verified name appears here"
                className="w-full h-12 px-4 rounded-xl bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] border-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 h-12 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-xl hover:bg-[var(--v2-surface-container-high)] transition-colors">
                Cancel
              </button>
              <button
                onClick={handleAddBank}
                disabled={!bankForm.holderName || isAdding}
                className="flex-1 h-12 bg-[var(--v2-primary)] text-white font-bold rounded-xl transition-all active:scale-[0.98] disabled:bg-[var(--v2-surface-container-high)] disabled:text-[var(--v2-on-surface-variant)] disabled:opacity-50 shadow-lg shadow-[var(--v2-primary)]/20">
                {isAdding ? (
                  <span className="v2-icon animate-spin">progress_activity</span>
                ) : (
                  'Add Account'
                )}
              </button>
            </div>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Transactions Modal */}
      <ResponsiveModal
        open={activeModal === 'transactions'}
        onOpenChange={open => !open && setActiveModal(null)}>
        <ResponsiveModalContent className="bg-[var(--v2-surface)] md:max-w-[600px]">
          <ResponsiveModalHeader className="border-b border-[var(--v2-outline-variant)]/10">
            <ResponsiveModalTitle className="text-xl font-bold v2-headline text-[var(--v2-on-surface)]">
              Transaction History
            </ResponsiveModalTitle>
          </ResponsiveModalHeader>

          <div className="p-4 md:p-6 space-y-4">
            {/* Filters */}
            <div className="space-y-3">
              {/* Type Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                {([
                  {id: 'all', label: 'All', icon: 'list'},
                  {id: 'gifts', label: 'Gifts', icon: 'redeem'},
                  {id: 'flex_card', label: 'Flex Card', icon: 'credit_card'},
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

            {/* Transaction List */}
            <div className="overflow-y-auto max-h-[50vh]">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/50 mb-2">
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
                    const isInflow = ['receipt', 'creator_support'].includes(t.type);
                    const isFlexCard = t.type === 'flex_card' || t.type === 'flex_card_redemption' || t.description?.toLowerCase().includes('flex');
                    const isGiftRedemption = t.type === 'gift_redemption';
                    const isWithdrawal = t.type === 'withdrawal' || t.type === 'payout';

                    const getIcon = () => {
                      if (isFlexCard || isGiftRedemption) return 'shopping_bag';
                      if (isWithdrawal) return 'account_balance';
                      if (isInflow) return 'payments';
                      return 'receipt_long';
                    };

                    const getIconStyle = () => {
                      if (isFlexCard) return 'bg-purple-100 text-purple-700';
                      if (isGiftRedemption) return 'bg-blue-100 text-blue-700';
                      if (isWithdrawal) return 'bg-orange-100 text-orange-700';
                      if (isInflow) return 'bg-green-100 text-green-700';
                      return 'bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)]';
                    };

                    const getTypeLabel = () => {
                      if (isFlexCard) return 'Flex Card Payment';
                      if (isGiftRedemption) return 'Gift Redemption';
                      if (isWithdrawal) return 'Withdrawal';
                      if (t.type === 'creator_support') return 'Gift Received';
                      if (t.type === 'campaign_contribution') return 'Contribution';
                      return t.type?.replace(/_/g, ' ');
                    };

                    const isDebit = isWithdrawal || isFlexCard || isGiftRedemption;

                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-[var(--v2-surface-container-low)]">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconStyle()}`}>
                            <span className="v2-icon text-[var(--v2-primary)]">
                              {t.type === 'withdrawal' ? 'arrow_upward' : 
                               t.type === 'campaign_withdrawal' ? 'volunteer_activism' : getIcon()}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[var(--v2-on-surface)] truncate max-w-[150px] md:max-w-[200px]">
                              {t.description || 'Transaction'}
                            </p>
                            <p className="text-xs text-[var(--v2-on-surface-variant)]">
                              {new Date(t.created_at).toLocaleDateString()} • {getTypeLabel()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-bold text-sm ${
                            !isDebit ? 'text-green-700' : 'text-[var(--v2-error)]'
                          }`}>
                          {!isDebit ? '+' : '-'}
                          {formatCurrency(Math.abs(t.amount / 100), userCurrency)}
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
      {/* Flex Cards Modal */}
      <ResponsiveModal
        open={activeModal === 'flex_cards'}
        onOpenChange={open => !open && setActiveModal(null)}>
        <ResponsiveModalContent className="bg-[var(--v2-surface)] md:max-w-[700px]">
          <ResponsiveModalHeader className="border-b border-[var(--v2-outline-variant)]/10">
            <ResponsiveModalTitle className="text-xl font-bold v2-headline text-[var(--v2-on-surface)]">
              All Flex Cards
            </ResponsiveModalTitle>
          </ResponsiveModalHeader>

          <div className="p-4 md:p-6 space-y-6 overflow-y-auto max-h-[70vh]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--v2-on-surface-variant)]">
                You have {flexCards.length} flex cards in total
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--v2-on-surface-variant)]">Total Balance:</span>
                <span className="font-bold text-[var(--v2-primary)]">
                  {formatCurrency(totalFlexCardBalance, userCurrency)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flexCards.map(card => (
                <FlexCardComponent 
                  key={card.id} 
                  card={card} 
                  variant="compact" 
                  onClick={() => setSelectedFlexCard(card)}
                />
              ))}
            </div>

            {flexCards.length === 0 && (
              <div className="text-center py-12">
                <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/50 mb-2">
                  credit_card
                </span>
                <p className="text-[var(--v2-on-surface-variant)]">No flex cards found</p>
              </div>
            )}
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Single Flex Card Detail Modal */}
      {selectedFlexCard && (
        <FlexCardModal
          card={selectedFlexCard}
          open={!!selectedFlexCard}
          onClose={() => setSelectedFlexCard(null)}
        />
      )}
    </div>
  );
}

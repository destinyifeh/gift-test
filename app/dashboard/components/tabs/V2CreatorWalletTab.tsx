'use client';

import { useProfile } from '@/hooks/use-profile';
import { useWalletProfile, useBanks, useResolveAccount, useAddBankAccount, useWithdraw } from '@/hooks/use-transactions';
import { collectCreatorEarnings } from '@/lib/server/actions/transactions';
import { useMyCountryConfig } from '@/hooks/use-country-config';
import { formatCurrency } from '@/lib/utils/currency';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { BankPicker } from '@/components/ui/bank-picker';

export function V2CreatorWalletTab() {
  const { data: profile } = useProfile();
  const { data: walletProfile, isLoading } = useWalletProfile();
  const { data: myCountryConfig } = useMyCountryConfig();
  const queryClient = useQueryClient();
  const [isCollecting, setIsCollecting] = useState(false);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [collectAmount, setCollectAmount] = useState('');
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  // Creator wallet balance from the profile (creator.wallet returned as `wallet` by user.service)
  const creatorWalletKobo = Number(profile?.wallet || 0);
  const creatorBalance = creatorWalletKobo / 100;

  const userCurrency = myCountryConfig?.currency || 'NGN';
  const currencySymbol = myCountryConfig?.currencySymbol || '₦';

  const handleCollect = async (amount?: number) => {
    if (creatorBalance <= 0) return;
    setIsCollecting(true);
    try {
      const result = await collectCreatorEarnings(amount);
      if (result.success) {
        toast.success(`Successfully collected ${formatCurrency(result.amount || 0, userCurrency)} to your main wallet!`);
        setShowCollectModal(false);
        setCollectAmount('');
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        queryClient.invalidateQueries({ queryKey: ['wallet-profile'] });
      } else {
        toast.error(result.error || 'Failed to collect earnings');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsCollecting(false);
    }
  };

  // Get support transactions from wallet profile 
  const allTransactions = walletProfile?.transactions || [];
  // Exclude individual fee records from the main list as they will be shown in the details modal
  const supportTransactions = allTransactions.filter(
    (t: any) => t.type === 'creator_support' || t.type === 'campaign_withdrawal'
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading creator wallet...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Balance */}
      <div className="rounded-[2rem] p-6 md:p-8 relative overflow-hidden min-h-[200px] md:min-h-[260px] flex flex-col justify-between v2-hero-gradient">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-10 -mb-10 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white/70 font-semibold text-xs md:text-sm tracking-wide uppercase">
              Creator Wallet
            </span>
            <span
              className="v2-icon text-sm text-white/80"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </div>
          <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tighter v2-headline break-all">
            {formatCurrency(creatorBalance, userCurrency)}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-white">
              <span className="v2-icon text-sm">volunteer_activism</span>
              Support Funds Only
            </span>
            
            <button
              onClick={() => setShowCollectModal(true)}
              disabled={isCollecting || creatorBalance <= 0}
              className="inline-flex items-center gap-1.5 bg-white text-[var(--v2-primary)] px-4 py-1.5 rounded-full text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-lg">
              {isCollecting ? (
                <span className="v2-icon text-sm animate-spin">progress_activity</span>
              ) : (
                <span className="v2-icon text-sm">account_balance_wallet</span>
              )}
              {isCollecting ? 'Collecting...' : 'Collect Earnings'}
            </button>
          </div>
        </div>
      </div>

      {/* Collect Earnings Modal */}
      <ResponsiveModal open={showCollectModal} onOpenChange={setShowCollectModal}>
        <ResponsiveModalContent className="max-w-[400px]">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle className="v2-headline font-bold">Collect Earnings</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
            <div className="bg-[var(--v2-primary)]/5 rounded-2xl p-4 text-center">
              <p className="text-[10px] text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1 font-bold">Available to Collect</p>
              <p className="text-2xl sm:text-3xl font-black text-[var(--v2-primary)] v2-headline">
                {formatCurrency(creatorBalance, userCurrency)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase mb-2">Collection Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[var(--v2-on-surface-variant)]">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={collectAmount}
                    onChange={(e) => setCollectAmount(e.target.value)}
                    className="w-full bg-[var(--v2-surface-container-low)] border-none rounded-xl py-4 pl-10 pr-4 font-bold text-base sm:text-lg text-[var(--v2-on-surface)]"
                  />
                </div>
                <p className="text-[10px] text-[var(--v2-on-surface-variant)] mt-2">
                  Leave empty to collect everything ({formatCurrency(creatorBalance, userCurrency)})
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleCollect(collectAmount ? Number(collectAmount) : undefined)}
                  disabled={isCollecting || (collectAmount !== '' && Number(collectAmount) > creatorBalance)}
                  className="w-full v2-hero-gradient text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[var(--v2-primary)]/20 active:scale-[0.98] transition-all disabled:opacity-50">
                  {isCollecting ? (
                    <span className="v2-icon animate-spin">progress_activity</span>
                  ) : (
                    <span className="v2-icon">account_balance_wallet</span>
                  )}
                  {isCollecting ? 'Processing...' : 'Confirm Collection'}
                </button>
                <button
                  onClick={() => {
                    setCollectAmount(creatorBalance.toString());
                  }}
                  className="w-full py-2 text-xs font-bold text-[var(--v2-primary)] hover:underline uppercase">
                  Use Maximum Amount
                </button>
              </div>
            </div>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Support Details Modal */}
      <ResponsiveModal open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <ResponsiveModalContent className="max-w-[450px]">
          <ResponsiveModalHeader>
             <ResponsiveModalTitle className="v2-headline font-bold">Support Details</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
            {selectedTx && (
              <>
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[1.25rem] sm:rounded-3xl bg-[var(--v2-primary)]/10 flex items-center justify-center text-[var(--v2-primary)] mb-2">
                    <span className="v2-icon text-2xl sm:text-3xl">favorite</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold v2-headline text-[var(--v2-on-surface)] px-2">
                    {selectedTx.description}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--v2-on-surface-variant)]">
                    {new Date(selectedTx.created_at || selectedTx.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="bg-[var(--v2-surface-container-low)] rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-[var(--v2-on-surface-variant)] font-medium">Total Support Received</span>
                    <span className="font-bold text-[var(--v2-on-surface)]">
                      {formatCurrency((selectedTx.metadata?.gross_amount || selectedTx.amount) / 100, userCurrency)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-start sm:items-center text-xs sm:text-sm border-b border-[var(--v2-outline-variant)]/10 pb-4 gap-4">
                    <div className="flex flex-col flex-1">
                      <span className="text-[var(--v2-on-surface-variant)] font-medium">Platform Fee ({selectedTx.metadata?.fee_percent || '4'}%)</span>
                      <p className="text-[10px] text-[var(--v2-on-surface-variant)] opacity-70 italic leading-tight mt-1">
                        For payment processing & maintenance.
                      </p>
                    </div>
                    <span className="font-bold text-[var(--v2-error)] whitespace-nowrap">
                      -{formatCurrency((selectedTx.metadata?.fee_amount || Math.round((selectedTx.amount || 0) * 0.0385)) / 100, userCurrency)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm sm:text-base font-bold text-[var(--v2-on-surface)]">Net Credited</span>
                    <span className="text-xl sm:text-2xl font-black text-green-700 v2-headline">
                      {formatCurrency((selectedTx.metadata?.net_amount || Math.round((selectedTx.amount || 0) * 0.9615)) / 100, userCurrency)}
                    </span>
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-[var(--v2-primary)]/5 flex items-start gap-3">
                  <span className="v2-icon text-[var(--v2-primary)] text-base sm:text-lg">info</span>
                  <p className="text-[10px] sm:text-xs text-[var(--v2-on-surface-variant)] leading-relaxed">
                    This breakdown shows the gross amount sent and the platform deduction. The net amount is what was added to your wallet.
                  </p>
                </div>
              </>
            )}
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Info Card */}
      <div className="bg-[var(--v2-surface-container-lowest)] rounded-2xl p-5 border border-[var(--v2-outline-variant)]/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center flex-shrink-0">
            <span className="v2-icon text-[var(--v2-primary)]">info</span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-[var(--v2-on-surface)] mb-1">About Creator Wallet</h4>
            <p className="text-xs text-[var(--v2-on-surface-variant)] leading-relaxed">
              This wallet exclusively holds funds received through your Creator Support page. When
              supporters send you money via your gift page, it appears here. To withdraw, use your
              main Wallet tab.
            </p>
          </div>
        </div>
      </div>

      {/* Support History */}
      <div className="space-y-4">
        <h4 className="text-lg md:text-xl font-bold tracking-tight v2-headline text-[var(--v2-on-surface)]">
          Support History
        </h4>

        <div className="bg-[var(--v2-surface-container-low)] rounded-[1.5rem] md:rounded-[2rem] p-2">
          {supportTransactions.length === 0 ? (
            <div className="text-center py-12">
              <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/50 mb-2">
                volunteer_activism
              </span>
              <p className="text-[var(--v2-on-surface-variant)] mt-2">No support received yet</p>
              <p className="text-xs text-[var(--v2-on-surface-variant)]/60 mt-1">
                Share your creator page to start receiving support
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {supportTransactions.slice(0, 20).map((t: any) => {
                const isCampaignWithdrawal = t.type === 'campaign_withdrawal';
                const isDebit = isCampaignWithdrawal;
                
                return (
                  <div
                    key={t.id || t.reference}
                    onClick={() => t.type === 'creator_support' && setSelectedTx(t)}
                    className={`flex items-center justify-between p-3 sm:p-4 md:p-5 bg-[var(--v2-surface-container-lowest)] rounded-2xl hover:bg-white transition-colors gap-3 ${t.type === 'creator_support' ? 'cursor-pointer group' : ''}`}>
                    <div className="flex items-center gap-3 md:gap-4 overflow-hidden flex-1">
                      <div
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0 flex items-center justify-center ${
                          isCampaignWithdrawal ? 'bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)]' : 
                          'bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]'
                        }`}>
                        <span className="v2-icon">
                          {isCampaignWithdrawal ? 'campaign' : 'favorite'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm md:text-base text-[var(--v2-on-surface)] truncate">
                          {t.description || (isCampaignWithdrawal ? 'Campaign Withdrawal' : 'Support Received')}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <p className="text-[10px] sm:text-xs text-[var(--v2-on-surface-variant)]">
                            {new Date(t.created_at || t.createdAt).toLocaleDateString()} • {
                              isCampaignWithdrawal ? 'Campaign' : 'Direct Support'
                            }
                          </p>
                          {t.type === 'creator_support' && (
                             <span className="flex items-center gap-0.5 text-[10px] font-bold text-[var(--v2-primary)] opacity-70 group-hover:opacity-100 transition-opacity">
                               Details <span className="v2-icon text-[10px]">arrow_forward</span>
                             </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className={`text-sm sm:text-base md:text-lg font-extrabold flex-shrink-0 ${isDebit ? 'text-[var(--v2-error)]' : 'text-green-700'}`}>
                      {isDebit ? '-' : '+'}{formatCurrency(Math.abs((t.metadata?.net_amount || t.amount) / 100), userCurrency)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

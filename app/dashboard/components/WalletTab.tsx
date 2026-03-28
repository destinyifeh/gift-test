'use client';

import {Badge} from '@/components/ui/badge';
import {BankPicker} from '@/components/ui/bank-picker';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalFooter,
} from '@/components/ui/responsive-modal';
import {useProfile} from '@/hooks/use-profile';
import {
  getCurrencyByCountry,
  getCurrencySymbol,
  PAYSTACK_COUNTRIES,
} from '@/lib/currencies';
import {
  addPaystackBankAccount,
  fetchWalletProfile,
  getPaystackBanks,
  initiateWithdrawal,
  resolvePaystackAccount,
} from '@/lib/server/actions/transactions';
import {useUserStore} from '@/lib/store/useUserStore';
import {formatCurrency} from '@/lib/utils/currency';
import {cn} from '@/lib/utils';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Building,
  CheckCircle,
  Clock,
  Coins,
  DollarSign,
  Loader2,
  Shield,
  Trash2,
  Wallet,
} from 'lucide-react';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {VerifyModal} from './VerifyModal';
import {DashboardStatCard} from './shared';

export function WalletTab() {
  const user = useUserStore(state => state.user);
  const queryClient = useQueryClient();
  const [activeModal, setActiveModal] = useState<'withdraw' | 'bank' | 'transactions' | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Nigeria');

  const {data: walletProfile, isLoading: isWalletLoading} = useQuery({
    queryKey: ['wallet-profile'],
    queryFn: () => fetchWalletProfile(),
  });

  const {data: banksData} = useQuery({
    queryKey: ['paystack-banks', selectedCountry],
    queryFn: () => getPaystackBanks(selectedCountry),
  });

  const [bankForm, setBankForm] = useState({
    bankCode: '',
    bankName: '',
    accountNumber: '',
    holderName: '',
  });
  const [isResolving, setIsResolving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [verifyAction, setVerifyAction] = useState<null | string>(null);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [withdrawBank, setWithdrawBank] = useState('');

  const {data: profile} = useProfile();
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

  const selectedWithdrawAccount = wallet.accounts.find(
    (a: any) => a.id === withdrawBank,
  );
  const isCurrencyMismatch =
    selectedWithdrawAccount &&
    selectedWithdrawAccount.currency !== userCurrency;

  const selectedCountryCurrency = PAYSTACK_COUNTRIES.find(
    c => c.name === selectedCountry,
  )?.currency;
  const isAddingMismatch =
    selectedCountry &&
    selectedCountryCurrency &&
    selectedCountryCurrency !== userCurrency;

  const handleResolveAccount = async () => {
    if (bankForm.accountNumber.length !== 10 || !bankForm.bankCode) return;
    setIsResolving(true);
    try {
      const result = await resolvePaystackAccount(
        bankForm.accountNumber,
        bankForm.bankCode,
      );
      if (result.success) {
        setBankForm({
          ...bankForm,
          holderName: result.data.account_name,
        });
        toast.success('Account verified!');
      } else {
        toast.error(result.error || 'Could not verify account');
      }
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setIsResolving(false);
    }
  };

  const confirmVerifiedAction = async () => {
    if (!verifyPassword) return;

    if (verifyAction?.startsWith('remove-bank-')) {
      const bankId = verifyAction.split('-')[2];
      const {deleteBankAccount} = await import('@/lib/server/actions/transactions');
      const result = await deleteBankAccount(bankId);
      if (result.success) {
        toast.success('Bank account removed');
        await queryClient.invalidateQueries({queryKey: ['wallet-profile']});
      } else {
        toast.error(result.error);
      }
    }

    if (verifyAction === 'withdraw') {
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
      } catch (error) {
        toast.error('Withdrawal failed');
      } finally {
        setIsWithdrawing(false);
      }
    }

    if (verifyAction === 'add-bank') {
      setIsAdding(true);
      try {
        const result = await addPaystackBankAccount(
          bankForm.bankName,
          bankForm.bankCode,
          bankForm.accountNumber,
          bankForm.holderName,
          selectedCountry,
          getCurrencyByCountry(selectedCountry),
        );
        if (result.success) {
          toast.success('Bank account added!');
          setBankForm({bankCode: '', bankName: '', accountNumber: '', holderName: ''});
          setActiveModal(null);
          await queryClient.invalidateQueries({queryKey: ['wallet-profile']});
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error('Failed to add bank account');
      } finally {
        setIsAdding(false);
      }
    }
    setVerifyAction(null);
    setVerifyPassword('');
  };

  if (isWalletLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading wallet...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <VerifyModal
        isOpen={!!verifyAction}
        onClose={() => {
          setVerifyAction(null);
          setVerifyPassword('');
        }}
        onConfirm={confirmVerifiedAction}
        password={verifyPassword}
        setPassword={setVerifyPassword}
        user={user || {id: '', email: '', display_name: 'User', username: ''}}
      />

      {/* Balance Cards - Horizontal scroll on mobile */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 hide-scrollbar">
        <div className="shrink-0 w-[160px] md:w-auto">
          <DashboardStatCard
            icon={<Wallet className="w-5 h-5" />}
            value={formatCurrency(wallet.balance, userCurrency)}
            label="Available"
            color="primary"
          />
        </div>
        <div className="shrink-0 w-[160px] md:w-auto">
          <DashboardStatCard
            icon={<Coins className="w-5 h-5" />}
            value={formatCurrency(profile?.platform_balance || 0, userCurrency)}
            label="Platform Credit"
            color="secondary"
          />
        </div>
        <div className="shrink-0 w-[160px] md:w-auto">
          <DashboardStatCard
            icon={<ArrowDownLeft className="w-5 h-5" />}
            value={formatCurrency(wallet.totalInflow, userCurrency)}
            label="Total Inflow"
            color="accent"
          />
        </div>
        <div className="shrink-0 w-[160px] md:w-auto">
          <DashboardStatCard
            icon={<DollarSign className="w-5 h-5" />}
            value={formatCurrency(wallet.pendingPayouts, userCurrency)}
            label="Pending"
            color="destructive"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="hero"
          onClick={() => setActiveModal('withdraw')}
          className="flex-1 sm:flex-none">
          <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw
        </Button>
        <Button
          variant="outline"
          onClick={() => setActiveModal('transactions')}
          className="flex-1 sm:flex-none">
          <Clock className="w-4 h-4 mr-2" /> Transactions
        </Button>
        <Button
          variant="outline"
          onClick={() => setActiveModal('bank')}
          className="flex-1 sm:flex-none">
          <Building className="w-4 h-4 mr-2" />
          {wallet.accounts.length > 0 ? 'Manage Banks' : 'Add Bank'}
        </Button>
      </div>

      {/* Connected Banks */}
      {wallet.accounts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Connected Banks</h3>
          <div className="space-y-2">
            {wallet.accounts.map((b: any) => (
              <div
                key={b.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl',
                  'bg-card border border-border',
                )}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Building className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {b.bank_name}
                      {b.is_primary && (
                        <Badge variant="secondary" className="ml-2 text-[10px]">
                          Primary
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {b.account_name} · ••••{b.account_number.slice(-4)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setVerifyAction(`remove-bank-${b.id}`)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      <ResponsiveModal open={activeModal === 'withdraw'} onOpenChange={open => !open && setActiveModal(null)}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Withdraw Funds</ResponsiveModalTitle>
          </ResponsiveModalHeader>

          <div className="space-y-4 p-4 md:px-6">
            <div className="space-y-2">
              <Label>Select Bank Account</Label>
              <Select value={withdrawBank} onValueChange={setWithdrawBank}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choose bank" />
                </SelectTrigger>
                <SelectContent>
                  {wallet.accounts.map((b: any) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.bank_name} — ••••{b.account_number.slice(-4)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="h-12 pl-10 text-lg font-semibold"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  max={wallet.balance}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                Max: {formatCurrency(wallet.balance, userCurrency)}
              </p>
            </div>

            {isCurrencyMismatch && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-xs font-bold text-destructive">
                  Payout not supported for this currency. Select a different account.
                </p>
              </div>
            )}
          </div>

          <ResponsiveModalFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="hero"
              onClick={() => setVerifyAction('withdraw')}
              disabled={!withdrawBank || !withdrawAmount || isWithdrawing || isCurrencyMismatch}
              className="flex-1">
              {isWithdrawing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Shield className="w-4 h-4 mr-2" />
              )}
              Withdraw
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Bank Management Modal */}
      <ResponsiveModal open={activeModal === 'bank'} onOpenChange={open => !open && setActiveModal(null)}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Add Bank Account</ResponsiveModalTitle>
          </ResponsiveModalHeader>

          <div className="space-y-4 p-4 md:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Country</Label>
                <Select value={selectedCountry} disabled onValueChange={setSelectedCountry}>
                  <SelectTrigger className="h-11 bg-muted/50">
                    <SelectValue placeholder="Select country">
                      {selectedCountry || 'Select country'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {PAYSTACK_COUNTRIES.map(c => (
                      <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Bank</Label>
                <BankPicker
                  banks={banks}
                  value={bankForm.bankCode}
                  onChange={bank => setBankForm({...bankForm, bankCode: bank.code, bankName: bank.name})}
                  isLoading={!banksData}
                  placeholder="Select bank"
                  className="h-11"
                />
              </div>
            </div>

            {isAddingMismatch && (
              <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                <p className="text-xs font-medium text-orange-800">
                  Warning: This is a {selectedCountryCurrency} account, but your wallet uses {userCurrency}.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs">Account Number</Label>
              <div className="flex gap-2">
                <Input
                  value={bankForm.accountNumber}
                  onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})}
                  placeholder="0123456789"
                  maxLength={10}
                  className="h-11"
                />
                <Button
                  variant="outline"
                  onClick={handleResolveAccount}
                  disabled={isResolving || bankForm.accountNumber.length !== 10 || !bankForm.bankCode}>
                  {isResolving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Account Holder Name</Label>
              <Input
                value={bankForm.holderName}
                readOnly
                placeholder="Verified name appears here"
                className="h-11 bg-muted"
              />
            </div>
          </div>

          <ResponsiveModalFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="hero"
              onClick={() => setVerifyAction('add-bank')}
              disabled={!bankForm.holderName || isAdding}
              className="flex-1">
              {isAdding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Add Account
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Transactions Modal */}
      <ResponsiveModal open={activeModal === 'transactions'} onOpenChange={open => !open && setActiveModal(null)}>
        <ResponsiveModalContent className="sm:max-w-lg">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Transaction History</ResponsiveModalTitle>
          </ResponsiveModalHeader>

          <div className="p-4 md:px-6 max-h-[60vh] overflow-y-auto">
            {wallet.transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-2">
                {wallet.transactions.map((t: any) => (
                  <div
                    key={t.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl',
                      'bg-muted/50',
                    )}>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {t.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.created_at).toLocaleDateString()} ·{' '}
                        {t.type === 'creator_support' ? 'Personal Gift' : t.type === 'campaign_contribution' ? 'Contribution' : t.type}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'font-bold text-sm',
                        ['receipt', 'creator_support'].includes(t.type) ? 'text-secondary' : 'text-destructive',
                      )}>
                      {['receipt', 'creator_support'].includes(t.type) ? '+' : '-'}
                      {formatCurrency(Math.abs(t.amount / 100), userCurrency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <ResponsiveModalFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)} className="w-full">
              Close
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}

'use client';

import {Badge} from '@/components/ui/badge';
import {BankPicker} from '@/components/ui/bank-picker';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {useProfile} from '@/hooks/use-profile';
import {useVendorWallet} from '@/hooks/use-vendor';
import {
  getCurrencyByCountry,
  getCurrencySymbol,
  PAYSTACK_COUNTRIES,
} from '@/lib/currencies';
import {
  getPaystackBanks,
  resolvePaystackAccount,
} from '@/lib/server/actions/transactions';
import {cn} from '@/lib/utils';
import {useQuery} from '@tanstack/react-query';
import {
  ArrowDownRight,
  ArrowUpRight,
  Building,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2,
  Plus,
  Trash2,
  Wallet,
} from 'lucide-react';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {SecurityModal} from './SecurityModal';

type ModalView = null | 'withdraw' | 'bank' | 'transactions';

export function WalletTab() {
  const {data: profile} = useProfile();
  const {
    data: vendorWallet = {
      available: 0,
      pending: 0,
      totalSales: 0,
      transactions: [],
    },
    isLoading: loading,
  } = useVendorWallet();

  const [modalView, setModalView] = useState<ModalView>(null);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawBank, setWithdrawBank] = useState('');
  const [verifyAction, setVerifyAction] = useState<null | string>(null);
  const [isResolving, setIsResolving] = useState(false);

  // Get country from profile, default to Nigeria
  const userCountry = profile?.country || 'Nigeria';

  // Fetch banks from Paystack API
  const {data: banksData, isLoading: banksLoading} = useQuery({
    queryKey: ['paystack-banks', userCountry],
    queryFn: () => getPaystackBanks(userCountry),
    enabled: !!userCountry,
  });

  const banks = banksData?.data || [];

  const [bankForm, setBankForm] = useState({
    country: '',
    bankCode: '',
    bankName: '',
    accountNumber: '',
    holderName: '',
  });

  useEffect(() => {
    if (profile?.country) {
      setBankForm(prev => ({...prev, country: profile.country}));
    }
  }, [profile?.country]);

  const currencyCode = getCurrencyByCountry(profile?.country);
  const currencySymbol = getCurrencySymbol(currencyCode);

  const handleResolveAccount = async () => {
    if (bankForm.accountNumber.length !== 10 || !bankForm.bankCode) return;
    setIsResolving(true);
    try {
      const result = await resolvePaystackAccount(
        bankForm.accountNumber,
        bankForm.bankCode,
      );
      if (result.success) {
        setBankForm(prev => ({
          ...prev,
          holderName: result.data.account_name,
        }));
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

  const handleAddBank = () => {
    if (
      !bankForm.country ||
      !bankForm.bankName ||
      !bankForm.accountNumber ||
      !bankForm.holderName
    ) {
      toast.error('Please fill in all fields');
      return;
    }
    setBankAccounts([
      ...bankAccounts,
      {
        id: Date.now(),
        bankCode: bankForm.bankCode,
        bankName: bankForm.bankName,
        accountNumber: '••••••••' + bankForm.accountNumber.slice(-4),
        fullAccountNumber: bankForm.accountNumber,
        holderName: bankForm.holderName,
        country: bankForm.country,
        isPrimary: bankAccounts.length === 0,
      },
    ]);
    setBankForm({country: profile?.country || '', bankCode: '', bankName: '', accountNumber: '', holderName: ''});
    setVerifyAction(null);
    toast.success('Bank account added');
  };

  const handleConfirmAction = (password: string) => {
    if (verifyAction?.startsWith('remove-bank-')) {
      const id = Number(verifyAction.split('-')[2]);
      setBankAccounts(bankAccounts.filter(b => b.id !== id));
      toast.success('Bank account removed');
    }
    if (verifyAction === 'withdraw') {
      toast.success('Withdrawal initiated');
      setModalView(null);
      setWithdrawAmount('');
      setWithdrawBank('');
    }
    if (verifyAction === 'add-bank') {
      handleAddBank();
    }
    setVerifyAction(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Loading wallet...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SecurityModal
        isOpen={!!verifyAction}
        onClose={() => setVerifyAction(null)}
        onConfirm={handleConfirmAction}
      />

      {/* Balance Cards - Horizontal scroll on mobile */}
      <div className="-mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide md:grid md:grid-cols-3 md:gap-4">
          <div className="shrink-0 w-[160px] md:w-auto p-4 md:p-5 rounded-xl bg-card border border-border text-center">
            <Wallet className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-xl md:text-2xl font-bold text-foreground">
              {currencySymbol}
              {vendorWallet.available.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Available</p>
          </div>
          <div className="shrink-0 w-[160px] md:w-auto p-4 md:p-5 rounded-xl bg-card border border-border text-center">
            <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-xl md:text-2xl font-bold text-foreground">
              {currencySymbol}
              {vendorWallet.pending.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Pending</p>
          </div>
          <div className="shrink-0 w-[160px] md:w-auto p-4 md:p-5 rounded-xl bg-card border border-border text-center">
            <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-xl md:text-2xl font-bold text-foreground">
              {currencySymbol}
              {vendorWallet.totalSales.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total Sales</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 md:gap-3">
        <Button
          variant="hero"
          onClick={() => setModalView('withdraw')}
          className="flex-1 sm:flex-initial h-11">
          <ArrowUpRight className="w-4 h-4 mr-2" />
          Withdraw
        </Button>
        <Button
          variant="outline"
          onClick={() => setModalView('bank')}
          className="flex-1 sm:flex-initial h-11">
          <Building className="w-4 h-4 mr-2" />
          Banks
        </Button>
        <Button
          variant="outline"
          onClick={() => setModalView('transactions')}
          className="flex-1 sm:flex-initial h-11">
          <Clock className="w-4 h-4 mr-2" />
          History
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        You can only withdraw from Available Balance ({currencySymbol}
        {vendorWallet.available.toLocaleString()}).
      </p>

      {/* Bank Accounts Quick View */}
      {bankAccounts.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground text-sm">Linked Banks</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => setModalView('bank')}>
              Manage
            </Button>
          </div>
          <div className="space-y-2">
            {bankAccounts.slice(0, 2).map(b => (
              <div key={b.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                <Building className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {b.bankName}
                    {b.isPrimary && (
                      <Badge variant="secondary" className="ml-2 text-[10px]">
                        Primary
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{b.accountNumber}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions Quick View */}
      {vendorWallet.transactions.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground text-sm">Recent Transactions</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => setModalView('transactions')}>
              View All
            </Button>
          </div>
          <div className="space-y-2">
            {vendorWallet.transactions.slice(0, 3).map((t: any) => (
              <div key={t.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      t.amount > 0 ? 'bg-green-500/10' : 'bg-destructive/10',
                    )}>
                    {t.amount > 0 ? (
                      <ArrowDownRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.desc}</p>
                    <p className="text-xs text-muted-foreground">{t.date}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    'text-sm font-semibold',
                    t.amount > 0 ? 'text-green-500' : 'text-destructive',
                  )}>
                  {t.amount > 0 ? '+' : ''}
                  {currencySymbol}
                  {Math.abs(t.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      <ResponsiveModal open={modalView === 'withdraw'} onOpenChange={open => !open && setModalView(null)}>
        <ResponsiveModalContent className="sm:max-w-md">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Withdraw Funds</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              Withdraw available balance to your bank account
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>

          <div className="px-4 md:px-6 py-4 space-y-4">
            {bankAccounts.length === 0 ? (
              <div className="text-center py-6">
                <Building className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Add a bank account first
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModalView('bank')}>
                  <Plus className="w-4 h-4 mr-1" /> Add Bank
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Select Bank</Label>
                  <Select value={withdrawBank} onValueChange={setWithdrawBank}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choose bank account" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map(b => (
                        <SelectItem key={b.id} value={String(b.id)}>
                          {b.bankName} — {b.accountNumber}
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
                      className="pl-12 h-11 text-lg"
                      value={withdrawAmount}
                      onChange={e => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Available: {currencySymbol}
                    {vendorWallet.available.toLocaleString()}
                  </p>
                </div>
              </>
            )}
          </div>

          {bankAccounts.length > 0 && (
            <ResponsiveModalFooter className="flex-col-reverse sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setModalView(null)}
                className="w-full sm:w-auto h-11">
                Cancel
              </Button>
              <Button
                variant="hero"
                onClick={() => setVerifyAction('withdraw')}
                disabled={!withdrawBank || !withdrawAmount || Number(withdrawAmount) > vendorWallet.available}
                className="w-full sm:w-auto h-11">
                <CheckCircle className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            </ResponsiveModalFooter>
          )}
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Bank Management Modal */}
      <ResponsiveModal open={modalView === 'bank'} onOpenChange={open => !open && setModalView(null)}>
        <ResponsiveModalContent className="sm:max-w-lg">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Bank Accounts</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              Manage your withdrawal bank accounts
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>

          <div className="px-4 md:px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Existing Banks */}
            {bankAccounts.length > 0 && (
              <div className="space-y-2">
                {bankAccounts.map(b => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {b.bankName}
                          {b.isPrimary && (
                            <Badge variant="secondary" className="ml-2 text-[10px]">
                              Primary
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {b.holderName} · {b.accountNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!b.isPrimary && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() =>
                            setBankAccounts(
                              bankAccounts.map(ba => ({
                                ...ba,
                                isPrimary: ba.id === b.id,
                              })),
                            )
                          }>
                          Set Primary
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setVerifyAction(`remove-bank-${b.id}`)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Bank Form */}
            <div className="border-t border-border pt-4 space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Add New Bank</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Country</Label>
                    <Select
                      value={bankForm.country || userCountry}
                      disabled>
                      <SelectTrigger className="h-10 bg-muted/50">
                        <SelectValue placeholder="Select country">
                          {bankForm.country || userCountry || 'Select country'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {PAYSTACK_COUNTRIES.map(c => (
                          <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground">Locked to profile</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Bank</Label>
                    <BankPicker
                      banks={banks}
                      value={bankForm.bankCode}
                      onChange={bank => setBankForm({...bankForm, bankCode: bank.code, bankName: bank.name})}
                      isLoading={banksLoading}
                      placeholder="Select bank"
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Account Number</Label>
                  <div className="flex gap-2">
                    <Input
                      value={bankForm.accountNumber}
                      onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})}
                      placeholder="0123456789"
                      maxLength={10}
                      className="h-10"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResolveAccount}
                      disabled={isResolving || bankForm.accountNumber.length !== 10 || !bankForm.bankCode}
                      className="h-10 px-4">
                      {isResolving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Account Holder</Label>
                  <Input
                    value={bankForm.holderName}
                    readOnly
                    placeholder="Verified name appears here"
                    className="h-10 bg-muted"
                  />
                </div>
              </div>
              <Button
                variant="hero"
                size="sm"
                onClick={() => setVerifyAction('add-bank')}
                disabled={!bankForm.bankName || !bankForm.accountNumber || !bankForm.holderName}
                className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-1" /> Add Bank Account
              </Button>
            </div>
          </div>

          <ResponsiveModalFooter>
            <Button variant="outline" onClick={() => setModalView(null)} className="w-full sm:w-auto h-11">
              Done
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Transactions Modal */}
      <ResponsiveModal open={modalView === 'transactions'} onOpenChange={open => !open && setModalView(null)}>
        <ResponsiveModalContent className="sm:max-w-lg">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Transaction History</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              Your recent wallet activity
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>

          <div className="px-4 md:px-6 py-4 max-h-[60vh] overflow-y-auto">
            {vendorWallet.transactions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {vendorWallet.transactions.map((t: any) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center',
                          t.amount > 0 ? 'bg-green-500/10' : 'bg-destructive/10',
                        )}>
                        {t.amount > 0 ? (
                          <ArrowDownRight className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.desc}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">{t.date}</p>
                          <Badge variant="outline" className="text-[10px]">
                            {t.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'text-sm font-bold',
                        t.amount > 0 ? 'text-green-500' : 'text-destructive',
                      )}>
                      {t.amount > 0 ? '+' : ''}
                      {currencySymbol}
                      {Math.abs(t.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <ResponsiveModalFooter>
            <Button variant="outline" onClick={() => setModalView(null)} className="w-full sm:w-auto h-11">
              Close
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}

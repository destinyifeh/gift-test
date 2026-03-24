'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Building,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2,
  Shield,
  Trash2,
  Wallet,
} from 'lucide-react';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {VerifyModal} from './VerifyModal';

export function WalletTab() {
  const user = useUserStore(state => state.user);
  const queryClient = useQueryClient();
  const [walletView, setWalletView] = useState<
    'overview' | 'transactions' | 'bank' | 'withdraw'
  >('overview');
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

  const primaryBank =
    wallet.accounts.find((a: any) => a.is_primary) || wallet.accounts[0];
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
      const {deleteBankAccount} =
        await import('@/lib/server/actions/transactions');
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
        const result = await initiateWithdrawal(
          Number(withdrawAmount),
          withdrawBank,
        );
        if (result.success) {
          toast.success('Withdrawal initiated!');
          setWalletView('overview');
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
          setBankForm({
            bankCode: '',
            bankName: '',
            accountNumber: '',
            holderName: '',
          });
          setWalletView('overview');
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-border">
          <CardContent className="p-4 sm:p-5 text-center">
            <Wallet className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              {formatCurrency(wallet.balance, userCurrency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Available Balance
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 sm:p-5 text-center">
            <ArrowDownLeft className="w-6 h-6 text-secondary mx-auto mb-2" />
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              {formatCurrency(wallet.totalInflow, userCurrency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total Inflow</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 sm:p-5 text-center">
            <DollarSign className="w-6 h-6 text-destructive mx-auto mb-2" />
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              {formatCurrency(wallet.pendingPayouts, userCurrency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Pending Payouts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3">
        <Button
          variant={walletView === 'withdraw' ? 'hero' : 'outline'}
          onClick={() =>
            setWalletView(walletView === 'withdraw' ? 'overview' : 'withdraw')
          }>
          <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw Funds
        </Button>
        <Button
          variant={walletView === 'transactions' ? 'hero' : 'outline'}
          onClick={() =>
            setWalletView(
              walletView === 'transactions' ? 'overview' : 'transactions',
            )
          }>
          <Clock className="w-4 h-4 mr-2" /> View Transactions
        </Button>
        <Button
          variant={walletView === 'bank' ? 'hero' : 'outline'}
          onClick={() =>
            setWalletView(walletView === 'bank' ? 'overview' : 'bank')
          }>
          <Building className="w-4 h-4 mr-2" />{' '}
          {wallet.accounts.length > 0 ? 'Manage Bank' : 'Connect Bank'}
        </Button>
      </div>

      {walletView === 'bank' && (
        <Card className="border-border">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Bank Accounts</h3>
            {wallet.accounts.map(b => (
              <div
                key={b.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted rounded-lg gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {b.bank_name}{' '}
                    {b.is_primary && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Primary
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {b.account_name} · ••••{b.account_number.slice(-4)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setVerifyAction(`remove-bank-${b.id}`)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="border-t border-border pt-4 space-y-3">
              <h4 className="text-sm font-medium text-foreground">
                Add New Bank Account
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Country</Label>
                  <Select
                    value={selectedCountry}
                    disabled
                    onValueChange={v => {
                      setSelectedCountry(v);
                      setBankForm({
                        ...bankForm,
                        bankCode: '',
                        bankName: '',
                        holderName: '',
                      });
                    }}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYSTACK_COUNTRIES.map(c => (
                        <SelectItem key={c.code} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Locked to your profile country of residence.
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Select Bank</Label>
                  <Select
                    value={bankForm.bankCode}
                    onValueChange={v => {
                      const bank = banks.find((b: any) => b.code === v);
                      setBankForm({
                        ...bankForm,
                        bankCode: v,
                        bankName: bank?.name || '',
                      });
                    }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Search bank..." />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((b: any) => (
                        <SelectItem key={b.id} value={b.code}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isAddingMismatch && (
                  <div className="sm:col-span-2 p-3 bg-orange-50 border border-orange-100 rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs font-medium text-orange-800 leading-normal">
                      Warning: You are adding a {selectedCountryCurrency}{' '}
                      account, but your wallet uses {userCurrency}. You won't be
                      able to withdraw to this account.
                    </p>
                  </div>
                )}
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">Account Number</Label>
                  <div className="flex gap-2">
                    <Input
                      value={bankForm.accountNumber}
                      onChange={e =>
                        setBankForm({
                          ...bankForm,
                          accountNumber: e.target.value,
                        })
                      }
                      placeholder="e.g. 0123456789"
                      maxLength={10}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResolveAccount}
                      disabled={
                        isResolving ||
                        bankForm.accountNumber.length !== 10 ||
                        !bankForm.bankCode
                      }>
                      {isResolving ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        'Verify'
                      )}
                    </Button>
                  </div>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">Account Holder Name</Label>
                  <Input
                    value={bankForm.holderName}
                    readOnly
                    placeholder="Verified name will appear here"
                    className="bg-muted"
                  />
                </div>
              </div>
              <Button
                variant="hero"
                size="sm"
                onClick={() => setVerifyAction('add-bank')}
                disabled={!bankForm.holderName || isAdding}>
                {isAdding ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-1" />
                )}
                Add Verified Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {walletView === 'withdraw' && (
        <Card className="border-primary/20">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Withdraw Funds</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Bank Account</Label>
                <Select value={withdrawBank} onValueChange={setWithdrawBank}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallet.accounts.map(b => (
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {currencySymbol}
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-8"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    max={wallet.balance}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right mt-1">
                  Max: {formatCurrency(wallet.balance, userCurrency)}
                </p>
              </div>
            </div>

            {isCurrencyMismatch && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-xs font-bold text-destructive leading-normal">
                  Payout not supported. Please select a supported payout
                  currency/account.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="hero"
                onClick={() => setVerifyAction('withdraw')}
                disabled={
                  !withdrawBank ||
                  !withdrawAmount ||
                  isWithdrawing ||
                  isCurrencyMismatch
                }>
                {isWithdrawing ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4 mr-1" />
                )}
                Confirm & Withdraw
              </Button>
              <Button
                variant="outline"
                onClick={() => setWalletView('overview')}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {walletView === 'transactions' && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-body">
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 font-medium">Date</th>
                    <th className="text-left py-2 font-medium">From</th>
                    <th className="text-left py-2 font-medium">Type</th>
                    <th className="text-right py-2 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {wallet.transactions.map((t: any) => (
                    <tr
                      key={t.id}
                      className="border-b border-border last:border-0">
                      <td className="py-3 text-foreground">
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-foreground">{t.description}</td>
                      <td className="py-3 text-muted-foreground">
                        {t.type === 'creator_support'
                          ? 'Personal Gift'
                          : t.type === 'campaign_contribution'
                            ? 'Contribution'
                            : t.type}
                      </td>
                      <td
                        className={`py-3 text-right font-semibold ${['receipt', 'creator_support'].includes(t.type) ? 'text-secondary' : 'text-destructive'}`}>
                        {['receipt', 'creator_support'].includes(t.type)
                          ? '+'
                          : '-'}
                        {formatCurrency(Math.abs(t.amount / 100), userCurrency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

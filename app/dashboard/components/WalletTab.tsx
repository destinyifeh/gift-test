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
import {useUserStore} from '@/lib/store/useUserStore';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building,
  CheckCircle,
  Clock,
  DollarSign,
  Shield,
  Trash2,
  Wallet,
} from 'lucide-react';
import {useState} from 'react';
import {walletData} from './mock';
import {VerifyModal} from './VerifyModal';

export function WalletTab() {
  const user = useUserStore(state => state.user);
  const [walletView, setWalletView] = useState<
    'overview' | 'transactions' | 'bank' | 'withdraw'
  >('overview');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankAccounts, setBankAccounts] = useState([
    {
      id: 1,
      bankName: 'First Bank',
      accountNumber: '••••••••1234',
      holderName: 'Destiny O.',
      country: 'Nigeria',
      isPrimary: true,
    },
  ]);
  const [bankForm, setBankForm] = useState({
    country: '',
    bankName: '',
    accountNumber: '',
    holderName: '',
  });
  const [verifyAction, setVerifyAction] = useState<null | string>(null);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [withdrawBank, setWithdrawBank] = useState('');

  const confirmVerifiedAction = () => {
    if (!verifyPassword) return;
    if (verifyAction?.startsWith('remove-bank-')) {
      const id = Number(verifyAction.split('-')[2]);
      setBankAccounts(bankAccounts.filter(b => b.id !== id));
    }
    if (verifyAction === 'withdraw') {
      setWalletView('overview');
      setWithdrawAmount('');
    }
    if (verifyAction === 'add-bank') {
      setBankAccounts([
        ...bankAccounts,
        {
          id: Date.now(),
          bankName: bankForm.bankName,
          accountNumber: '••••••••' + bankForm.accountNumber.slice(-4),
          holderName: bankForm.holderName,
          country: bankForm.country,
          isPrimary: bankAccounts.length === 0,
        },
      ]);
      setBankForm({
        country: '',
        bankName: '',
        accountNumber: '',
        holderName: '',
      });
    }
    setVerifyAction(null);
    setVerifyPassword('');
  };
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
              ${walletData.availableBalance}.00
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
              ${walletData.totalReceived}.00
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total Gifts Received
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 sm:p-5 text-center">
            <DollarSign className="w-6 h-6 text-destructive mx-auto mb-2" />
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              ${walletData.platformFees}.00
            </p>
            <p className="text-xs text-muted-foreground mt-1">Platform Fees</p>
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
          {bankAccounts.length > 0 ? 'Manage Bank' : 'Connect Bank'}
        </Button>
      </div>

      {walletView === 'bank' && (
        <Card className="border-border">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Bank Accounts</h3>
            {bankAccounts.map(b => (
              <div
                key={b.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted rounded-lg gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {b.bankName}{' '}
                    {b.isPrimary && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Primary
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {b.holderName} · {b.accountNumber} · {b.country}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!b.isPrimary && (
                    <Button
                      variant="ghost"
                      size="sm"
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
                    value={bankForm.country}
                    onValueChange={v => setBankForm({...bankForm, country: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nigeria">Nigeria</SelectItem>
                      <SelectItem value="United States">
                        United States
                      </SelectItem>
                      <SelectItem value="United Kingdom">
                        United Kingdom
                      </SelectItem>
                      <SelectItem value="Ghana">Ghana</SelectItem>
                      <SelectItem value="Kenya">Kenya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Bank Name</Label>
                  <Input
                    value={bankForm.bankName}
                    onChange={e =>
                      setBankForm({...bankForm, bankName: e.target.value})
                    }
                    placeholder="e.g. First Bank"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Account Number</Label>
                  <Input
                    value={bankForm.accountNumber}
                    onChange={e =>
                      setBankForm({...bankForm, accountNumber: e.target.value})
                    }
                    placeholder="e.g. 0123456789"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Account Holder Name</Label>
                  <Input
                    value={bankForm.holderName}
                    onChange={e =>
                      setBankForm({...bankForm, holderName: e.target.value})
                    }
                    placeholder="Full name"
                  />
                </div>
              </div>
              <Button
                variant="hero"
                size="sm"
                onClick={() => setVerifyAction('add-bank')}>
                <CheckCircle className="w-4 h-4 mr-1" /> Verify & Add Account
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
                <Input
                  type="number"
                  placeholder="$0.00"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  max={walletData.availableBalance}
                />
                <p className="text-xs text-muted-foreground text-right mt-1">
                  Max: ${walletData.availableBalance}.00
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="hero"
                onClick={() => setVerifyAction('withdraw')}
                disabled={!withdrawBank || !withdrawAmount}>
                <Shield className="w-4 h-4 mr-1" /> Verify & Withdraw
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
                  {walletData.transactions.map((t: any) => (
                    <tr
                      key={t.id}
                      className="border-b border-border last:border-0">
                      <td className="py-3 text-foreground">{t.date}</td>
                      <td className="py-3 text-foreground">{t.from}</td>
                      <td className="py-3 text-muted-foreground">{t.desc}</td>
                      <td
                        className={`py-3 text-right font-semibold ${t.amount > 0 ? 'text-secondary' : 'text-destructive'}`}>
                        {t.amount > 0 ? '+' : ''}${Math.abs(t.amount)}
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

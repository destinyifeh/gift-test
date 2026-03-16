import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Textarea} from '@/components/ui/textarea';
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  CreditCard,
  Gift,
  Heart,
  Search,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';
import {useState} from 'react';

interface SendGiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignTitle?: string;
  recipientName?: string;
  preselectedGift?: {name: string; price: number; vendor: string} | null;
  isLoggedIn?: boolean;
  hideRecipientFields?: boolean;
}

const presetAmounts = [5, 10, 25, 50, 100];

const allVendorGifts = [
  {
    id: 1,
    name: '☕ Coffee Gift Card',
    price: 10,
    vendor: 'BrewCraft',
    category: 'food',
  },
  {
    id: 2,
    name: '🎂 Cake Gift Card',
    price: 25,
    vendor: 'Sweet Delights',
    category: 'food',
  },
  {
    id: 3,
    name: '💆 Spa Voucher',
    price: 50,
    vendor: 'Relax Spa',
    category: 'spa',
  },
  {
    id: 4,
    name: '🎮 Gaming Credit',
    price: 20,
    vendor: 'GameVault',
    category: 'birthday',
  },
  {
    id: 5,
    name: '📚 Book Store Voucher',
    price: 20,
    vendor: 'PageTurner',
    category: 'birthday',
  },
  {
    id: 6,
    name: '💐 Flower Bouquet',
    price: 45,
    vendor: 'BloomBox',
    category: 'spa',
  },
  {
    id: 7,
    name: '🎵 Music Streaming Gift',
    price: 15,
    vendor: 'TuneWave',
    category: 'birthday',
  },
  {
    id: 8,
    name: '👕 Fashion Gift Card',
    price: 75,
    vendor: 'StyleHub',
    category: 'fashion',
  },
];

type Step = 'details' | 'recipient' | 'payment' | 'success';

const SendGiftModal = ({
  open,
  onOpenChange,
  campaignTitle,
  recipientName,
  preselectedGift,
  isLoggedIn = true,
  hideRecipientFields = false,
}: SendGiftModalProps) => {
  const [amount, setAmount] = useState<number | null>(
    preselectedGift?.price || null,
  );
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [hideAmount, setHideAmount] = useState(false);
  const [selectedGift, setSelectedGift] = useState<number | null>(null);
  const [step, setStep] = useState<Step>('details');
  const [giftSearch, setGiftSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>(
    preselectedGift ? 'vendor' : 'money',
  );

  // Recipient info
  const [recipientNameInput, setRecipientNameInput] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  // Sender info (if not logged in)
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');

  const handleClose = () => {
    setStep('details');
    setAmount(preselectedGift?.price || null);
    setCustomAmount('');
    setMessage('');
    setAnonymous(false);
    setHideAmount(false);
    setSelectedGift(null);
    setGiftSearch('');
    setRecipientNameInput('');
    setRecipientEmail('');
    setSenderName('');
    setSenderEmail('');
    onOpenChange(false);
  };

  const finalAmount = amount || (customAmount ? Number(customAmount) : 0);
  const target = campaignTitle || recipientName || 'this campaign';
  const selectedVendorGift =
    allVendorGifts.find(g => g.id === selectedGift) ||
    (preselectedGift
      ? {
          name: preselectedGift.name,
          price: preselectedGift.price,
          vendor: preselectedGift.vendor,
        }
      : null);
  const isVendorGift =
    activeTab === 'vendor' && (selectedGift || preselectedGift);
  const giftTotal = isVendorGift ? selectedVendorGift?.price || 0 : finalAmount;
  const platformFee = Math.round(giftTotal * 0.05 * 100) / 100;
  const totalCharge = giftTotal + platformFee;

  const filteredVendorGifts = allVendorGifts.filter(
    g =>
      !giftSearch ||
      g.name.toLowerCase().includes(giftSearch.toLowerCase()) ||
      g.vendor.toLowerCase().includes(giftSearch.toLowerCase()),
  );

  const canProceedToRecipient = isVendorGift || finalAmount > 0;
  const canProceedToPayment =
    (hideRecipientFields || (recipientNameInput && recipientEmail)) &&
    (isLoggedIn || (senderName && senderEmail));

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const prefix = isVendorGift ? 'GIFT' : 'GH';
    let code = prefix + '-';
    for (let i = 0; i < 4; i++)
      code += chars[Math.floor(Math.random() * chars.length)];
    code += '-';
    for (let i = 0; i < 3; i++)
      code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  };

  const [giftCode] = useState(generateCode());

  if (step === 'success') {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-4 sm:py-6">
            <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 text-secondary mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-bold font-display text-foreground mb-2">
              Gift Sent Successfully! 🎉
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your gift has been delivered.
            </p>

            <div className="bg-muted rounded-xl p-4 text-left text-sm space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gift:</span>
                <span className="font-medium text-foreground">
                  {isVendorGift
                    ? selectedVendorGift?.name
                    : `$${giftTotal} Money Gift`}
                </span>
              </div>
              {isVendorGift && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendor:</span>
                  <span className="text-foreground">
                    {selectedVendorGift?.vendor}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold text-foreground">
                  ${giftTotal}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipient:</span>
                <span className="text-foreground">
                  {hideRecipientFields ? target : recipientNameInput}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery:</span>
                <span className="text-foreground">Email sent</span>
              </div>
            </div>

            {isVendorGift && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
                <p className="text-xs text-muted-foreground mb-1">Gift Code</p>
                <p className="font-mono font-bold text-lg text-primary">
                  {giftCode}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  The recipient will receive this code via email to redeem at
                  the vendor store.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="hero" className="flex-1" onClick={handleClose}>
                Send Another Gift
              </Button>
              <Link href="/gift-shop" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleClose}>
                  Go to Gift Shop
                </Button>
              </Link>
            </div>
            {!isLoggedIn && (
              <Link href="/signup">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-primary"
                  onClick={handleClose}>
                  Create Account
                </Button>
              </Link>
            )}
            <p className="text-xs text-muted-foreground mt-4">
              Powered by{' '}
              <span className="font-semibold text-primary">Gifthance</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (step === 'payment') {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <button
              onClick={() => setStep('recipient')}
              className="text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Back
            </button>
            <DialogTitle className="font-display">Payment Summary</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="bg-muted rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {isVendorGift ? selectedVendorGift?.name : 'Money Gift'}
                </span>
                <span className="font-medium text-foreground">
                  ${giftTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform fee</span>
                <span className="text-foreground">
                  ${platformFee.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-primary">${totalCharge.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>To:</strong>{' '}
                {hideRecipientFields
                  ? target
                  : `${recipientNameInput} (${recipientEmail})`}
              </p>
              {message && (
                <p>
                  <strong>Message:</strong> {message}
                </p>
              )}
              {anonymous && (
                <p className="text-primary">✓ Sending anonymously</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Card Number</Label>
              <Input placeholder="4242 4242 4242 4242" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Expiry</Label>
                  <Input placeholder="MM/YY" />
                </div>
                <div>
                  <Label className="text-xs">CVC</Label>
                  <Input placeholder="123" />
                </div>
              </div>
            </div>

            <Button
              variant="hero"
              className="w-full h-12"
              onClick={() => setStep('success')}>
              <CreditCard className="w-4 h-4 mr-2" /> Pay $
              {totalCharge.toFixed(2)}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Powered by{' '}
              <span className="font-semibold text-primary">Gifthance</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (step === 'recipient') {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <button
              onClick={() => setStep('details')}
              className="text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Back
            </button>
            <DialogTitle className="font-display">
              {hideRecipientFields ? 'Sender Info' : 'Recipient & Sender Info'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {!hideRecipientFields && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Recipient Name *</Label>
                  <Input
                    value={recipientNameInput}
                    onChange={e => setRecipientNameInput(e.target.value)}
                    placeholder="e.g. Sarah"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Recipient Email or Phone *</Label>
                  <Input
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                    placeholder="sarah@email.com"
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Gift Message (optional)</Label>
              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Happy birthday 🎂"
                rows={2}
              />
            </div>

            {!isLoggedIn && (
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Your Information
                </p>
                <div className="space-y-2">
                  <Label>Your Name *</Label>
                  <Input
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Your Email *</Label>
                  <Input
                    value={senderEmail}
                    onChange={e => setSenderEmail(e.target.value)}
                    placeholder="you@email.com"
                  />
                </div>
              </div>
            )}

            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="anon2"
                  checked={anonymous}
                  onCheckedChange={v => setAnonymous(!!v)}
                />
                <Label
                  htmlFor="anon2"
                  className="text-sm font-normal cursor-pointer">
                  Send anonymously
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hideamt2"
                  checked={hideAmount}
                  onCheckedChange={v => setHideAmount(!!v)}
                />
                <Label
                  htmlFor="hideamt2"
                  className="text-sm font-normal cursor-pointer">
                  Hide contribution amount
                </Label>
              </div>
            </div>

            <Button
              variant="hero"
              className="w-full h-12"
              onClick={() => setStep('payment')}
              disabled={!canProceedToPayment}>
              Continue to Payment <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" /> Send a Gift
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Contributing to {target}
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="money" className="gap-2">
              <CreditCard className="w-4 h-4" /> Money
            </TabsTrigger>
            <TabsTrigger value="vendor" className="gap-2">
              <Gift className="w-4 h-4" /> Vendor Gift
            </TabsTrigger>
          </TabsList>

          <TabsContent value="money" className="space-y-4 mt-4">
            <div>
              <Label>Select Amount</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {presetAmounts.map(a => (
                  <button
                    key={a}
                    onClick={() => {
                      setAmount(a);
                      setCustomAmount('');
                    }}
                    className={`p-2 sm:p-3 rounded-xl border-2 text-sm font-semibold transition-all ${amount === a ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground hover:border-primary/30'}`}>
                    ${a}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <Input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={e => {
                    setCustomAmount(e.target.value);
                    setAmount(null);
                  }}
                  className="text-center"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vendor" className="space-y-3 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search gifts..."
                value={giftSearch}
                onChange={e => setGiftSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredVendorGifts.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGift(g.id)}
                  className={`w-full p-3 rounded-xl border-2 text-left flex items-center justify-between transition-all ${selectedGift === g.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {g.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{g.vendor}</p>
                  </div>
                  <span className="font-bold text-primary">${g.price}</span>
                </button>
              ))}
            </div>
            <Link href="/gift-shop" onClick={handleClose}>
              <Button variant="ghost" size="sm" className="w-full text-primary">
                <ShoppingBag className="w-4 h-4 mr-1" /> Browse All in Gift Shop
              </Button>
            </Link>
          </TabsContent>
        </Tabs>

        <Button
          variant="hero"
          className="w-full h-12 mt-2"
          onClick={() => setStep('recipient')}
          disabled={!canProceedToRecipient}>
          <Heart className="w-4 h-4 mr-2" /> Continue{' '}
          {giftTotal > 0 && `— $${giftTotal}`}{' '}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Powered by{' '}
          <span className="font-semibold text-primary">Gifthance</span>
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default SendGiftModal;

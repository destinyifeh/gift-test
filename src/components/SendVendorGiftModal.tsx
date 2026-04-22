'use client';

import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {VisuallyHidden} from '@/components/ui/visually-hidden';
import {allVendorGifts} from '@/lib/data/gifts';
import {recordShopGiftPurchase} from '@/lib/server/actions/transactions';
import PaystackPop from '@paystack/inline-js';
import {ArrowRight, CreditCard, Heart, Loader2} from 'lucide-react';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import GiftSelection from './GiftSelection';
import {usePublicSettings} from '@/hooks/use-transactions';
import {useProfile} from '@/hooks/use-profile';
import {calculatePlatformFee, calculateTotalWithFee} from '@/lib/utils/fees';
import {formatCurrency} from '@/lib/utils/currency';
import {getCurrencySymbol} from '@/lib/constants/currencies';

interface SendVendorGiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorName: string;
}

const SendVendorGiftModal = ({
  open,
  onOpenChange,
  vendorName,
}: SendVendorGiftModalProps) => {
  const [step, setStep] = useState<
    'details' | 'recipient' | 'payment' | 'success'
  >('details');
  const [selectedGift, setSelectedGift] = useState<number | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientUsername, setRecipientUsername] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { data: profile } = useProfile();
  const { data: settings } = usePublicSettings();
  
  const userCountry = profile?.country || 'Nigeria';
  const countryConfig = settings?.countryConfigs?.[userCountry] || settings?.countryConfigs?.['Nigeria'];
  
  const platformFeePercent = countryConfig?.transactionFeePercent || 4;
  const currencyCode = countryConfig?.currency || 'NGN';
  const currencySymbol = getCurrencySymbol(currencyCode);

  useEffect(() => {
    if (open) {
      setStep('details');
      setSelectedGift(null);
      setRecipientEmail('');
      setRecipientUsername('');
      setSenderName('');
      setMessage('');
      setIsAnonymous(false);
      setIsProcessing(false);
    }
  }, [open]);

  const handleNext = () => {
    if (step === 'details') setStep('recipient');
    else if (step === 'recipient') {
      if (!recipientEmail || !recipientEmail.includes('@')) {
        toast.error('Please enter a valid recipient email');
        return;
      }
      setStep('payment');
    } else if (step === 'payment') setStep('success');
  };

  const handleBack = () => {
    if (step === 'recipient') setStep('details');
    else if (step === 'payment') setStep('recipient');
  };

  const selectedGiftData = allVendorGifts.find(g => g.id === selectedGift);

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl sm:rounded-3xl">
        <VisuallyHidden>
          <ResponsiveModalTitle>Gift from {vendorName}</ResponsiveModalTitle>
        </VisuallyHidden>
        <div className="relative">
          <div className="bg-primary/5 px-6 pt-8 pb-6 border-b border-primary/10">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-14 h-14 border-4 border-background shadow-md">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xl uppercase">
                  {vendorName?.[0] || 'V'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold text-foreground leading-tight">
                  {step === 'success'
                    ? 'Gift Sent!'
                    : `Gift from ${vendorName}`}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Pick a card from this vendor
                </p>
              </div>
            </div>

            {step !== 'success' && (
              <div className="flex items-center gap-2 mt-6">
                {[1, 2, 3].map(s => (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${(s === 1 && (step === 'details' || step === 'recipient' || step === 'payment')) || (s === 2 && (step === 'recipient' || step === 'payment')) || (s === 3 && step === 'payment') ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]' : 'bg-muted'}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-6">
            {step === 'details' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <GiftSelection
                  activeTab="vendor"
                  onTabChange={() => {}}
                  amount={null}
                  setAmount={() => {}}
                  customAmount=""
                  setCustomAmount={() => {}}
                  selectedGift={selectedGift}
                  setSelectedGift={setSelectedGift}
                />
                <Button
                  className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 rounded-2xl"
                  disabled={!selectedGift}
                  onClick={handleNext}>
                  Choose Recipient <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {step === 'recipient' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      Recipient Email
                    </Label>
                    <Input
                      placeholder="E.g. alex@example.com"
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={e => setRecipientEmail(e.target.value)}
                      className="h-12 rounded-xl bg-muted/20 border-2 font-medium"
                    />
                    <p className="text-[10px] text-muted-foreground ml-1">
                      Please ensure the email is correct for gift delivery.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      Recipient Username (Optional)
                    </Label>
                    <Input
                      placeholder="E.g. alexsmith"
                      value={recipientUsername}
                      onChange={e => setRecipientUsername(e.target.value)}
                      className="h-12 rounded-xl bg-muted/20 border-2 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      Your Name
                    </Label>
                    <Input
                      placeholder="E.g. John Doe"
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                      className="h-12 rounded-xl bg-muted/20 border-2 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      Message (Optional)
                    </Label>
                    <textarea
                      className="w-full min-h-[100px] p-3 rounded-xl bg-muted/20 border-2 font-medium focus:outline-none focus:border-primary transition-all resize-none text-sm"
                      placeholder="Tell them why you chose this..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                    />
                  </div>
                  <div
                    className="flex items-center space-x-2 p-3 rounded-xl bg-muted/10 border border-transparent hover:border-primary/20 transition-all cursor-pointer"
                    onClick={() => setIsAnonymous(!isAnonymous)}>
                    <Checkbox
                      id="anonymous"
                      checked={isAnonymous}
                      onCheckedChange={checked =>
                        setIsAnonymous(checked as boolean)
                      }
                      className="pointer-events-none"
                    />
                    <label
                      htmlFor="anonymous"
                      className="text-sm font-medium leading-none cursor-pointer pointer-events-none">
                      Hide my name
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="h-14 px-6 rounded-2xl font-bold border-2"
                    onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    className="flex-1 h-14 text-lg font-bold shadow-lg shadow-primary/20 rounded-2xl"
                    onClick={handleNext}>
                    Continue <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-6 bg-[var(--v2-primary-container)]/5 rounded-3xl border border-[var(--v2-primary-container)]/10 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--v2-on-surface-variant)] font-medium">Gift Card Item</span>
                    <span className="font-bold">{selectedGiftData?.name}</span>
                  </div>
                  
                  <div className="h-px bg-[var(--v2-outline-variant)]/10" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[var(--v2-on-surface-variant)]">Gift Price</span>
                      <span className="font-bold">{formatCurrency(selectedGiftData?.price, currencyCode)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[var(--v2-on-surface-variant)]">Service Fee ({platformFeePercent}%)</span>
                      <span className="font-bold text-amber-600">+{formatCurrency(calculatePlatformFee(Number(selectedGiftData?.price || 0), platformFeePercent), currencyCode)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-dashed border-[var(--v2-outline-variant)]/20 flex justify-between items-center">
                    <span className="text-lg font-black v2-headline">Total</span>
                    <span className="text-3xl font-black text-[var(--v2-primary)] v2-headline">
                      {formatCurrency(calculateTotalWithFee(Number(selectedGiftData?.price || 0), platformFeePercent), currencyCode)}
                    </span>
                  </div>
                  
                  <p className="text-[10px] text-center text-[var(--v2-on-surface-variant)] italic">
                    Recipient receives the full {selectedGiftData?.name} worth {formatCurrency(selectedGiftData?.price, currencyCode)}
                  </p>
                </div>

                <div className="p-4 bg-muted/20 rounded-2xl border-2 border-dashed border-border text-center space-y-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-bold text-sm">Secure Payment Required</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed px-4">
                    You'll be redirected to our secure payment partner to
                    complete this purchase.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="h-14 px-6 rounded-2xl font-bold border-2"
                    onClick={handleBack}
                    disabled={isProcessing}>
                    Back
                  </Button>
                  <Button
                    className="flex-1 h-14 text-lg font-bold shadow-lg shadow-primary/20 rounded-2xl"
                    disabled={isProcessing}
                    onClick={async () => {
                      if (!selectedGiftData) return;
                      setIsProcessing(true);

                      const paystack = new PaystackPop();
                      paystack.newTransaction({
                        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
                        email: recipientEmail, // Or current user email
                        amount: Math.round(calculateTotalWithFee(Number(selectedGiftData.price), platformFeePercent) * 100),
                        currency: currencyCode,
                        onSuccess: async (response: any) => {
                          const result = await recordShopGiftPurchase({
                            reference: response.reference,
                            recipientEmail,
                            senderName: isAnonymous ? 'Anonymous' : senderName,
                            message,
                            giftId: selectedGiftData.id,
                            giftName: selectedGiftData.name,
                            expectedAmount: selectedGiftData.price,
                            currency: currencyCode,
                          });

                          if (result.success) {
                            setStep('success');
                          } else {
                            toast.error(
                              result.error ||
                                'Payment recorded but failed to finalize gift',
                            );
                          }
                          setIsProcessing(false);
                        },
                        onCancel: () => {
                          toast.info('Payment cancelled');
                          setIsProcessing(false);
                        },
                      });
                    }}>
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      `Pay ${formatCurrency(calculateTotalWithFee(Number(selectedGiftData?.price || 0), platformFeePercent), currencyCode)}`
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-8 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-ping opacity-20" />
                  <Heart className="w-12 h-12 text-green-500 fill-green-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Gift Card Sent!</h3>
                <p className="text-muted-foreground mb-8 text-balance">
                  Your{' '}
                  <span className="text-foreground font-bold">
                    {selectedGiftData?.name}
                  </span>{' '}
                  card has been successfully sent.
                </p>
                <Button
                  className="w-full h-14 rounded-2xl font-bold text-lg"
                  onClick={() => onOpenChange(false)}>
                  Back to Vendor
                </Button>
              </div>
            )}
          </div>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
};

export default SendVendorGiftModal;

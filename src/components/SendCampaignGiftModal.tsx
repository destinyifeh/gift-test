'use client';

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
import {useProfile} from '@/hooks/use-profile';
import {getCurrencySymbol} from '@/lib/constants/currencies';
import {recordCampaignContribution} from '@/lib/server/actions/transactions';
import {formatCurrency} from '@/lib/utils/currency';
import {useQueryClient} from '@tanstack/react-query';
import {ArrowRight, Heart, Loader2} from 'lucide-react';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import GiftSelection from './GiftSelection';
import {usePublicSettings} from '@/hooks/use-transactions';
import {calculatePlatformFee, calculateTotalWithFee} from '@/lib/utils/fees';

interface SendCampaignGiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignSlug: string;
  campaignTitle: string;
  creatorName: string;
  minAmount?: number;
  currency?: string;
  status?: string;
  statusReason?: string | null;
}

const SendCampaignGiftModal = ({
  open,
  onOpenChange,
  campaignSlug,
  campaignTitle,
  creatorName,
  minAmount = 0,
  currency = 'NGN',
  status = 'active',
  statusReason,
}: SendCampaignGiftModalProps) => {
  const [step, setStep] = useState<
    'details' | 'recipient' | 'payment' | 'success'
  >('details');
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  // Recipient info state
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hideAmount, setHideAmount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  const {data: profile} = useProfile();
  const {data: settings} = usePublicSettings();
  
  const userCountry = profile?.country || 'Nigeria';
  const countryConfig = settings?.countryConfigs?.[userCountry] || settings?.countryConfigs?.['Nigeria'];
  
  const platformFeePercent = countryConfig?.transactionFeePercent || 4;
  const currencyCode = countryConfig?.currency || 'NGN';

  useEffect(() => {
    if (open) {
      setStep('details');
      setAmount(null);
      setCustomAmount('');
      setDonorName(profile?.display_name || profile?.username || '');
      setDonorEmail(profile?.email || '');
      setMessage('');
      setIsAnonymous(false);
      setHideAmount(false);
      setIsProcessing(false);
    }
  }, [open, profile]);

  const handleNext = () => {
    if (step === 'details') setStep('recipient');
    else if (step === 'recipient') setStep('payment');
    else if (step === 'payment') setStep('success');
  };

  const handleBack = () => {
    if (step === 'recipient') setStep('details');
    else if (step === 'payment') setStep('recipient');
  };

  const isDetailsValid =
    amount !== null ||
    (customAmount !== '' && Number(customAmount) >= minAmount);

  const isRecipientValid =
    donorName.trim() !== '' &&
    donorEmail.trim() !== '' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail);

  const finalAmount = amount !== null ? amount : Number(customAmount);

  const handlePaystackPayment = async () => {
    if (!finalAmount || !donorEmail) return;

    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      toast.error(
        'Payment gateway not configured. Please check your config and restart the server.',
      );
      return;
    }

    setIsProcessing(true);
    try {
      // Dynamic import to avoid 'window is not defined' during SSR
      const PaystackPop = (await import('@paystack/inline-js')).default;
      const paystack = new (PaystackPop as any)();

      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
        email: donorEmail,
        amount: Math.round(calculateTotalWithFee(finalAmount, platformFeePercent) * 100), // Charge final amount including fee
        currency: currencyCode,
        onSuccess: async (response: any) => {
          const res = await recordCampaignContribution({
            reference: response.reference,
            campaignSlug,
            donorName,
            donorEmail,
            message,
            isAnonymous,
            hideAmount,
            expectedAmount: finalAmount,
            currency: currencyCode,
          });

          if (res.success) {
            queryClient.invalidateQueries({
              queryKey: ['campaign', campaignSlug],
            });
            queryClient.invalidateQueries({
              queryKey: ['campaign-contributions', campaignSlug],
            });
            queryClient.invalidateQueries({queryKey: ['dashboard-analytics']});
            queryClient.invalidateQueries({queryKey: ['my-contributions']});
            toast.success('Thank you! Your contribution has been added.');
          } else {
            toast.error(res.error || 'Failed to record contribution');
          }
          setIsProcessing(false);
        },
        onCancel: () => {
          setIsProcessing(false);
          toast.info('Payment window closed');
        },
      });

      // Close the modal immediately after opening the Paystack popup
      onOpenChange(false);
    } catch (err: any) {
      console.error('Paystack init error:', err);
      toast.error('Could not initialize payment: ' + err.message);
      setIsProcessing(false);
    }
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl sm:rounded-3xl">
        <VisuallyHidden>
          <ResponsiveModalTitle>Support {campaignTitle}</ResponsiveModalTitle>
        </VisuallyHidden>
        <div className="relative">
          <div className="bg-primary/5 px-6 pt-8 pb-6 border-b border-primary/10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Heart className="w-8 h-8 fill-current" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground leading-tight">
                  {step === 'success'
                    ? 'Contribution Sent!'
                    : 'Support this Campaign'}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                  {campaignTitle}
                </p>
              </div>
            </div>

            {status !== 'active' && step !== 'success' && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                 <span className="v2-icon text-amber-600">info</span>
                 <div>
                    <p className="text-sm font-bold text-amber-800">Campaign {status === 'paused' ? 'Paused' : 'Inactive'}</p>
                    <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                       {statusReason || (status === 'paused' ? 'The organizer has temporarily paused contributions.' : 'This campaign is currently inactive.')}
                    </p>
                 </div>
              </div>
            )}

            {status === 'active' && step !== 'success' && (
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
                  activeTab="money"
                  onTabChange={() => {}}
                  amount={amount}
                  setAmount={setAmount}
                  customAmount={customAmount}
                  setCustomAmount={setCustomAmount}
                  selectedGift={null}
                  setSelectedGift={() => {}}
                  minAmount={minAmount}
                  campaignTitle={campaignTitle}
                  currencySymbol={getCurrencySymbol(currency)}
                  currencyCode={currency}
                />
                <Button
                  className={`w-full h-14 text-lg font-bold shadow-lg rounded-2xl ${status !== 'active' ? 'bg-amber-100 text-amber-800 border-amber-200 border hover:bg-amber-100' : 'shadow-primary/20'}`}
                  disabled={!isDetailsValid || status !== 'active'}
                  onClick={handleNext}>
                  {status === 'active' ? (
                    <>Continue to Support <ArrowRight className="w-5 h-5 ml-2" /></>
                  ) : (
                    <>Contributions Paused</>
                  )}
                </Button>
              </div>
            )}

            {step === 'recipient' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      Your Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="E.g. John Doe"
                      value={donorName}
                      onChange={e => setDonorName(e.target.value)}
                      className="h-12 rounded-xl bg-muted/20 border-2 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={donorEmail}
                      onChange={e => setDonorEmail(e.target.value)}
                      className="h-12 rounded-xl bg-muted/20 border-2 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      Message (Optional)
                    </Label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="w-full min-h-[100px] p-3 rounded-xl bg-muted/20 border-2 font-medium focus:outline-none focus:border-primary transition-all resize-none text-sm"
                      placeholder="Add a public message to the campaign..."
                    />
                  </div>
                  <div className="flex flex-col gap-3 p-3 rounded-xl bg-muted/10 border border-transparent hover:border-primary/20 transition-all">
                    <div
                      className="flex items-center space-x-2 cursor-pointer"
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
                        Hide my name from campaign
                      </label>
                    </div>
                    <div
                      className="flex items-center space-x-2 cursor-pointer border-t border-muted pt-2"
                      onClick={() => setHideAmount(!hideAmount)}>
                      <Checkbox
                        id="hideAmount"
                        checked={hideAmount}
                        onCheckedChange={checked =>
                          setHideAmount(checked as boolean)
                        }
                        className="pointer-events-none"
                      />
                      <label
                        htmlFor="hideAmount"
                        className="text-sm font-medium leading-none cursor-pointer pointer-events-none">
                        Hide my contribution amount
                      </label>
                    </div>
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
                    disabled={!isRecipientValid}
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
                    <span className="text-[var(--v2-on-surface-variant)] font-medium">Support Destination</span>
                    <span className="font-bold truncate max-w-[200px]">{campaignTitle}</span>
                  </div>
                  
                  <div className="h-px bg-[var(--v2-outline-variant)]/10" />
                  
                   <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[var(--v2-on-surface-variant)]">Contribution</span>
                      <span className="font-bold">{formatCurrency(finalAmount, currencyCode)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[var(--v2-on-surface-variant)]">Service Fee ({platformFeePercent}%)</span>
                      <span className="font-bold text-amber-600">+{formatCurrency(calculatePlatformFee(finalAmount, platformFeePercent), currencyCode)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-dashed border-[var(--v2-outline-variant)]/20 flex justify-between items-center">
                    <span className="text-lg font-black v2-headline">Total to Pay</span>
                    <span className="text-3xl font-black text-[var(--v2-primary)] v2-headline">
                      {formatCurrency(calculateTotalWithFee(finalAmount, platformFeePercent), currencyCode)}
                    </span>
                  </div>
                  
                  <p className="text-[10px] text-center text-[var(--v2-on-surface-variant)] italic">
                    The campaign receives the full {formatCurrency(finalAmount, currencyCode)} contribution
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="h-14 px-6 rounded-2xl font-bold border-2"
                    disabled={isProcessing}
                    onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    className="flex-1 h-14 text-lg font-bold shadow-lg shadow-primary/20 rounded-2xl"
                    onClick={handlePaystackPayment}
                    disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />{' '}
                        Processing...
                      </>
                    ) : (
                      `Pay ${formatCurrency(calculateTotalWithFee(finalAmount, platformFeePercent), currencyCode)}`
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
                <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                <p className="text-muted-foreground mb-8 text-balance">
                  Your contribution of{' '}
                  <span className="text-foreground font-bold">
                    {formatCurrency(finalAmount, currencyCode)}
                  </span>{' '}
                  has been added to the campaign.
                </p>
                <Button
                  className="w-full h-14 rounded-2xl font-bold text-lg"
                  onClick={() => onOpenChange(false)}>
                  Return to Campaign
                </Button>
              </div>
            )}
          </div>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
};

export default SendCampaignGiftModal;

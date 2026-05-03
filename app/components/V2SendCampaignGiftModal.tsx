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
import {useRecordCampaignContribution} from '@/hooks/use-transactions';
import {formatCurrency} from '@/lib/utils/currency';
import {useQueryClient} from '@tanstack/react-query';
import {ArrowRight, Heart, Loader2} from 'lucide-react';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import V2GiftSelection from './V2GiftSelection';

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

const V2SendCampaignGiftModal = ({
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

  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hideAmount, setHideAmount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  const {data: profile} = useProfile();

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

  const recordContribution = useRecordCampaignContribution();

  const handlePaystackPayment = async () => {
    if (!finalAmount || !donorEmail) return;

    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      toast.error('Payment gateway not configured.');
      return;
    }

    setIsProcessing(true);
    try {
      const PaystackPop = (await import('@paystack/inline-js')).default;
      const paystack = new (PaystackPop as any)();

      // Close the internal modal early so it doesn't linger behind Paystack
      onOpenChange(false);

      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
        email: donorEmail,
        amount: Math.round(finalAmount * 1.04 * 100),
        currency: 'NGN',
        onSuccess: async (response: any) => {
          recordContribution.mutate({
            reference: response.reference,
            campaignSlug,
            donorName: isAnonymous ? 'Anonymous' : donorName,
            donorEmail,
            message,
            isAnonymous,
            hideAmount,
            expectedAmount: Math.round(finalAmount * 1.04 * 100) / 100,
            currency,
          }, {
            onSuccess: (res) => {
              if (res.success) {
                queryClient.invalidateQueries({queryKey: ['campaign', campaignSlug]});
                queryClient.invalidateQueries({queryKey: ['campaign-contributions', campaignSlug]});
                queryClient.invalidateQueries({queryKey: ['dashboard-analytics']});
                queryClient.invalidateQueries({queryKey: ['my-contributions']});
                toast.success('Thank you! Your contribution has been added.');
                setStep('success'); 
              } else {
                toast.error(res.error || 'Failed to record contribution');
              }
              setIsProcessing(false);
            },
            onError: (err: any) => {
              toast.error(err.response?.data?.message || 'Failed to record contribution');
              setIsProcessing(false);
            }
          });
        },
        onCancel: () => {
          setIsProcessing(false);
          toast.info('Payment window closed');
        },
      });
    } catch (err: any) {
      toast.error('Could not initialize payment: ' + err.message);
      setIsProcessing(false);
    }
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl sm:rounded-3xl bg-[var(--v2-surface)] flex flex-col max-h-[90vh]">
        <VisuallyHidden>
          <ResponsiveModalTitle>Support {campaignTitle}</ResponsiveModalTitle>
        </VisuallyHidden>
        <div className="relative flex-1 flex flex-col overflow-hidden">
          <div className="bg-[var(--v2-primary-container)]/10 px-6 pt-8 pb-6 border-b border-[var(--v2-outline-variant)]/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[var(--v2-primary)]/10 flex items-center justify-center text-[var(--v2-primary)] shadow-sm">
                <Heart className="w-8 h-8 fill-current" />
              </div>
              <div>
                <h3 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] leading-tight">
                  {step === 'success'
                    ? 'Contribution Sent!'
                    : 'Support this Campaign'}
                </h3>
                <p className="text-sm text-[var(--v2-on-surface-variant)] mt-0.5 line-clamp-1">
                  {campaignTitle}
                </p>
              </div>
            </div>

            {status !== 'active' && step !== 'success' && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                 <span className="v2-icon text-amber-600">info</span>
                 <div>
                    <p className="text-sm font-bold text-amber-800">Campaign {status === 'paused' ? 'Paused' : 'Inactive'}</p>
                    <p className="text-xs text-amber-700 mt-0.5">
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
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${(s === 1 && (step === 'details' || step === 'recipient' || step === 'payment')) || (s === 2 && (step === 'recipient' || step === 'payment')) || (s === 3 && step === 'payment') ? 'v2-gradient-primary shadow-[0_0_10px_rgba(var(--v2-primary),0.3)]' : 'bg-[var(--v2-outline-variant)]/20'}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-6 overflow-y-auto v2-no-scrollbar">
            {step === 'details' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <V2GiftSelection
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
                <button
                  className={`w-full h-14 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 transition-transform active:scale-[0.98] ${status !== 'active' ? 'bg-amber-100 text-amber-800 cursor-not-allowed border-amber-200 border' : 'v2-btn-primary'}`}
                  disabled={!isDetailsValid || status !== 'active'}
                  onClick={handleNext}
                >
                  {status === 'active' ? (
                    <>Continue to Support <ArrowRight className="w-5 h-5 ml-2" /></>
                  ) : (
                    <>Contributions Paused</>
                  )}
                </button>
              </div>
            )}

            {step === 'recipient' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-[var(--v2-on-surface-variant)] ml-1">
                      Your Name <span className="text-[var(--v2-error)]">*</span>
                    </Label>
                    <Input
                      placeholder="John Doe"
                      value={donorName}
                      onChange={e => setDonorName(e.target.value)}
                      className="h-12 rounded-xl bg-[var(--v2-surface-container-low)] border-2 border-transparent focus-visible:border-[var(--v2-primary)] font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-[var(--v2-on-surface-variant)] ml-1">
                      Email Address <span className="text-[var(--v2-error)]">*</span>
                    </Label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={donorEmail}
                      onChange={e => setDonorEmail(e.target.value)}
                      className="h-12 rounded-xl bg-[var(--v2-surface-container-low)] border-2 border-transparent focus-visible:border-[var(--v2-primary)] font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-[var(--v2-on-surface-variant)] ml-1">
                      Message (Optional)
                    </Label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="w-full min-h-[100px] p-3 rounded-xl bg-[var(--v2-surface-container-low)] border-2 border-transparent focus:border-[var(--v2-primary)] outline-none transition-all resize-none text-sm font-medium"
                      placeholder="Add a public message to the campaign..."
                    />
                  </div>
                  <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/20 shadow-sm">
                    <div
                      className="flex items-center space-x-2 cursor-pointer group"
                      onClick={() => setIsAnonymous(!isAnonymous)}>
                      <Checkbox
                        checked={isAnonymous}
                        onCheckedChange={checked => setIsAnonymous(checked as boolean)}
                        className="pointer-events-none"
                      />
                      <label className="text-sm font-medium text-[var(--v2-on-surface)] cursor-pointer">
                        Hide my name from campaign
                      </label>
                    </div>
                    <div
                      className="flex items-center space-x-2 cursor-pointer border-t border-[var(--v2-outline-variant)]/10 pt-3 group"
                      onClick={() => setHideAmount(!hideAmount)}>
                      <Checkbox
                        checked={hideAmount}
                        onCheckedChange={checked => setHideAmount(checked as boolean)}
                        className="pointer-events-none"
                      />
                      <label className="text-sm font-medium text-[var(--v2-on-surface)] cursor-pointer">
                        Hide my contribution amount
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="h-14 px-6 rounded-2xl font-bold border-2 border-[var(--v2-outline-variant)]/30 bg-transparent"
                    onClick={handleBack}>
                    Back
                  </Button>
                  <button
                    className="flex-1 h-14 v2-btn-primary rounded-2xl text-lg font-bold flex items-center justify-center gap-3 active:scale-[0.98]"
                    disabled={!isRecipientValid}
                    onClick={handleNext}>
                    Next Step <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-6 bg-[var(--v2-surface-container-low)] rounded-3xl border border-[var(--v2-outline-variant)]/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-widest">
                        Your Contribution
                      </p>
                      <p className="font-bold text-lg text-[var(--v2-on-surface)]">To Campaign</p>
                    </div>
                    <p className="text-xl font-bold text-[var(--v2-on-surface)]">
                      {formatCurrency(finalAmount, currency)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--v2-outline-variant)]/10">
                    <div>
                      <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-widest">
                        Platform Fee (4%)
                      </p>
                    </div>
                    <p className="text-lg font-bold text-[var(--v2-on-surface)]">
                      {formatCurrency(finalAmount * 0.04, currency)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t-2 border-[var(--v2-primary)]/20">
                    <div>
                      <p className="text-xs font-black text-[var(--v2-primary)] uppercase tracking-widest">
                        Total Payable
                      </p>
                    </div>
                    <p className="text-3xl font-black text-[var(--v2-primary)]">
                       {formatCurrency(finalAmount * 1.04, currency)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="h-14 px-6 rounded-2xl font-bold border-2 border-[var(--v2-outline-variant)]/30 bg-transparent"
                    disabled={isProcessing}
                    onClick={handleBack}>
                    Back
                  </Button>
                  <button
                    className="flex-1 h-14 v2-btn-primary rounded-2xl text-lg font-bold flex items-center justify-center gap-3"
                    onClick={handlePaystackPayment}
                    disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />{' '}
                        Processing...
                      </>
                    ) : (
                      'Pay Now'
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-10 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-ping opacity-20" />
                  <Heart className="w-12 h-12 text-emerald-500 fill-emerald-500" />
                </div>
                <h3 className="text-3xl font-black v2-headline text-[var(--v2-on-surface)] mb-2">Thank You!</h3>
                <p className="text-[var(--v2-on-surface-variant)] mb-10 text-balance px-4 leading-relaxed">
                  Your contribution of <span className="text-[var(--v2-primary)] font-black">{formatCurrency(finalAmount, currency)}</span> (plus 4% platform fee) has been securely added to the campaign.
                </p>
                <button
                  className="w-full h-14 v2-btn-primary rounded-2xl font-bold text-lg"
                  onClick={() => onOpenChange(false)}>
                  Return to Campaign
                </button>
              </div>
            )}
          </div>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
};

export default V2SendCampaignGiftModal;

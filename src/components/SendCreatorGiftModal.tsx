'use client';

import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Dialog, DialogContent, DialogTitle} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {VisuallyHidden} from '@/components/ui/visually-hidden';
import {recordCreatorGift} from '@/lib/server/actions/transactions';
import {formatCurrency} from '@/lib/utils/currency';
import {useQueryClient} from '@tanstack/react-query';
import {ArrowRight, Heart, Loader2} from 'lucide-react';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';

interface SendCreatorGiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorName: string;
  creatorUsername: string;
  minAmount?: number;
  initialAmount?: number | null;
  initialCustomAmount?: string;
  initialStep?: 'details' | 'recipient';
  currency?: string;
}

const SendCreatorGiftModal = ({
  open,
  onOpenChange,
  creatorName,
  creatorUsername,
  minAmount = 0,
  initialAmount = null,
  initialCustomAmount = '',
  initialStep = 'details',
  currency = 'NGN',
}: SendCreatorGiftModalProps) => {
  const [step, setStep] = useState<
    'details' | 'recipient' | 'payment' | 'success'
  >(initialStep as any);
  const [amount, setAmount] = useState<number | null>(initialAmount);
  const [customAmount, setCustomAmount] = useState(initialCustomAmount);

  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hideAmount, setHideAmount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    setAmount(initialAmount);
    setCustomAmount(initialCustomAmount);
    setStep(initialStep as any);
  }, [open, initialAmount, initialStep]);

  useEffect(() => {
    if (open) {
      setStep(initialStep as any);
      setAmount(initialAmount);
      setCustomAmount(initialCustomAmount);
      setDonorName('');
      setDonorEmail('');
      setMessage('');
      setIsAnonymous(false);
      setHideAmount(false);
      setIsProcessing(false);
    }
  }, [open, initialStep, initialAmount, initialCustomAmount]);

  const handleNext = () => {
    if (step === 'details') setStep('recipient');
    else if (step === 'recipient') setStep('payment');
    else if (step === 'payment') setStep('success');
  };

  const handleBack = () => {
    if (step === 'recipient') onOpenChange(false);
    else if (step === 'payment') setStep('recipient');
  };

  const isDetailsValid =
    (amount !== null && amount > 0 && amount >= minAmount) ||
    (customAmount !== '' &&
      Number(customAmount) > 0 &&
      Number(customAmount) >= minAmount);

  const isRecipientValid =
    donorName.trim() !== '' &&
    donorEmail.trim() !== '' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail);

  const finalAmount =
    amount !== null ? amount : Number(customAmount);

  const handlePaystackPayment = async () => {
    if (!donorEmail) return;

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
        amount: Math.round(finalAmount * 100),
        // currency,
        currency: 'NGN',
        onSuccess: async (response: any) => {
          const res = await recordCreatorGift({
            reference: response.reference,
            creatorUsername,
            donorName,
            donorEmail,
            message,
            isAnonymous,
            hideAmount,
            expectedAmount: finalAmount,
            currency,
            giftId: null,
            giftName: null,
          });

          if (res.success) {
            queryClient.invalidateQueries({queryKey: ['profile']});
            queryClient.invalidateQueries({queryKey: ['creator-supporters']});
            queryClient.invalidateQueries({queryKey: ['dashboard-analytics']});
            queryClient.invalidateQueries({queryKey: ['received-gifts']});
            queryClient.invalidateQueries({queryKey: ['sent-gifts']});
            queryClient.invalidateQueries({queryKey: ['transactions']});
            toast.success('Thank you! Your gift has been sent.');
            if ((res as any).warning) toast.warning((res as any).warning);
          } else {
            toast.error(res.error || 'Failed to record gift');
          }
          setIsProcessing(false);
        },
        onCancel: () => {
          setIsProcessing(false);
          toast.info('Payment window closed');
        },
      });

      onOpenChange(false);
    } catch (err: any) {
      console.error('Paystack transaction failed to start:', err);
      toast.error(
        err?.message ||
          'Could not start transaction. Please try again or contact support.',
      );
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <VisuallyHidden>
          <DialogTitle>Send a Gift to {creatorName}</DialogTitle>
        </VisuallyHidden>
        <div className="relative">
          <div className="bg-primary/5 px-6 pt-8 pb-6 border-b border-primary/10">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-14 h-14 border-4 border-background shadow-md">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xl">
                  {creatorName?.[0] || 'C'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold text-foreground leading-tight">
                  {step === 'success'
                    ? 'Gift Sent!'
                    : `Send a Gift to ${creatorName}`}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {step === 'success'
                    ? 'Thank you for your support'
                    : 'Personalize your gift'}
                </p>
              </div>
            </div>

            {step !== 'success' && (
              <div className="flex items-center gap-2 mt-6">
                {[1, 2].map(s => (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${(s === 1 && (step === 'recipient' || step === 'payment')) || (s === 2 && step === 'payment') ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]' : 'bg-muted'}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-6">
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
                      placeholder="Write a sweet note..."
                    />
                  </div>
                  <div className="flex flex-col gap-3 p-3 rounded-xl bg-muted/10 border border-transparent hover:border-primary/20 transition-all">
                    <div
                      className="flex items-center space-x-2 cursor-pointer"
                      onClick={() => setIsAnonymous(!isAnonymous)}>
                      <Checkbox
                        id="anonymous"
                        checked={isAnonymous}
                        onCheckedChange={(checked: boolean) =>
                          setIsAnonymous(checked)
                        }
                        className="pointer-events-none"
                      />
                      <label
                        htmlFor="anonymous"
                        className="text-sm font-medium leading-none cursor-pointer pointer-events-none">
                        Hide my name from recipient
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 cursor-pointer border-t border-muted pt-2">
                      <Checkbox
                        id="hideAmount"
                        checked={hideAmount}
                        onCheckedChange={checked =>
                          setHideAmount(checked as boolean)
                        }
                      />
                      <label
                        htmlFor="hideAmount"
                        className="text-sm font-medium leading-none cursor-pointer">
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
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                      Summary
                    </p>
                    <p className="font-bold text-lg">
                      Monetary Support
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(finalAmount, currency)}
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
                      'Pay Now'
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
                <h3 className="text-2xl font-bold mb-2">Awesome!</h3>
                  <p className="text-muted-foreground mb-8 text-balance">
                    Your contribution of{' '}
                    <span className="text-foreground font-bold">
                      {formatCurrency(
                        Number(amount || customAmount),
                        currency,
                      )}
                    </span>{' '}
                    has been sent to {creatorName}.
                  </p>
                <Button
                  className="w-full h-14 rounded-2xl font-bold text-lg"
                  onClick={() => onOpenChange(false)}>
                  Back to Profile
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendCreatorGiftModal;

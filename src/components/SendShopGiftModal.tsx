'use client';

import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Dialog, DialogContent, DialogTitle} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {VisuallyHidden} from '@/components/ui/visually-hidden';
import {recordShopGiftPurchase} from '@/lib/server/actions/transactions';
import {ArrowRight, Heart, Loader2} from 'lucide-react';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';

interface SendShopGiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gift: {
    id: string | number;
    name: string;
    price: number;
    vendor: string;
    image?: string;
    currency?: string;
    symbol?: string;
  };
}

const SendShopGiftModal = ({
  open,
  onOpenChange,
  gift,
}: SendShopGiftModalProps) => {
  const [step, setStep] = useState<'recipient' | 'payment' | 'success'>(
    'recipient',
  );
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    recipientEmail: '',
    senderName: '',
    senderEmail: '',
    message: '',
    isAnonymous: false,
  });

  useEffect(() => {
    if (open) {
      setStep('recipient');
      setIsLoading(false);
      setFormData({
        recipientEmail: '',
        senderName: '',
        senderEmail: '',
        message: '',
        isAnonymous: false,
      });
    }
  }, [open]);

  const validateRecipient = () => {
    if (!formData.recipientEmail) {
      toast.error('Recipient email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipientEmail)) {
      toast.error('Invalid recipient email format');
      return false;
    }
    if (!formData.senderEmail) {
      toast.error('Your email address is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.senderEmail)) {
      toast.error('Invalid sender email format');
      return false;
    }
    if (!formData.senderName && !formData.isAnonymous) {
      toast.error('Sender name is required');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 'recipient') {
      if (validateRecipient()) {
        setStep('payment');
      }
    } else if (step === 'payment') {
      handlePaystackPayment();
    }
  };

  const handleBack = () => {
    if (step === 'payment') setStep('recipient');
  };

  const handlePaystackPayment = async () => {
    setIsLoading(true);

    // Dynamically import Paystack to avoid SSR 'window is not defined' errors
    const PaystackPop = (await import('@paystack/inline-js')).default;

    const paystack = new PaystackPop();
    paystack.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
      email: formData.senderEmail, // Use sender email for Paystack receipt
      amount: gift.price * 100, // Paystack amount is in kobo/cents
      // currency: gift.currency || 'KES',
      currency: 'NGN',
      onSuccess: (transaction: any) => {
        setIsLoading(false);
        console.log('Payment successful', transaction);

        // Show immediate success toast as requested
        toast.success('Gift card sent successfully!');

        // Close the modal as the Paystack popup is now showing
        onOpenChange(false);

        // Record the gift purchase and send email completely asynchronously
        // so the user UI isn't blocked for multiple seconds.
        recordShopGiftPurchase({
          reference: transaction.reference,
          recipientEmail: formData.recipientEmail,
          senderName: formData.senderName,
          message: formData.message,
          giftId: Number(gift.id),
          giftName: gift.name,
          expectedAmount: gift.price,
          currency: gift.currency as string, // Based on user manual edit
        }).then(result => {
          if (!result.success) {
            toast.error(
              'Payment verified but background gift recording had an issue: ' +
                result.error,
            );
          }
        });
      },
      onCancel: () => {
        setIsLoading(false);
        toast.info('Payment cancelled');
      },
      onError: (error: any) => {
        setIsLoading(false);
        toast.error('Payment failed: ' + error.message);
      },
    });

    // Close the modal as the Paystack popup is now showing
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <VisuallyHidden>
          <DialogTitle>Send {gift.name} Gift Card</DialogTitle>
        </VisuallyHidden>
        <div className="relative">
          {/* Header Section */}
          <div className="bg-primary/5 px-6 pt-8 pb-6 border-b border-primary/10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-2xl border border-primary/10 overflow-hidden">
                {gift.image ? (
                  <img
                    src={gift.image}
                    alt={gift.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  gift.name.split(' ')[0]
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground leading-tight">
                  {step === 'success' ? 'Gift Sent!' : 'Send this Gift Card'}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {gift.name} • {gift.vendor}
                </p>
              </div>
            </div>

            {/* Stepper */}
            {step !== 'success' && (
              <div className="flex items-center gap-2 mt-6">
                <div
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step === 'recipient' || step === 'payment' ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]' : 'bg-muted'}`}
                />
                <div
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step === 'payment' ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]' : 'bg-muted'}`}
                />
              </div>
            )}
          </div>

          <div className="p-6">
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
                      name="recipient_email"
                      autoComplete="off"
                      value={formData.recipientEmail}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          recipientEmail: e.target.value,
                        })
                      }
                      className="h-12 rounded-xl bg-muted/20 border-2 font-medium"
                    />
                    <p className="text-[10px] text-muted-foreground ml-1">
                      Please ensure the email is correct for gift delivery.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      Your Email
                      {/* <span className="text-destructive">*</span> */}
                    </Label>
                    <Input
                      placeholder="E.g. you@example.com"
                      type="email"
                      name="sender_email"
                      autoComplete="email"
                      value={formData.senderEmail}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          senderEmail: e.target.value,
                        })
                      }
                      className="h-12 rounded-xl bg-muted/20 border-2 font-medium"
                    />
                    <p className="text-[10px] text-muted-foreground ml-1">
                      For your payment receipt and gift confirmation.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      Your Name
                    </Label>
                    <Input
                      placeholder="E.g. Mary K."
                      value={formData.senderName}
                      onChange={e =>
                        setFormData({...formData, senderName: e.target.value})
                      }
                      className="h-12 rounded-xl bg-muted/20 border-2 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      Message (Optional)
                    </Label>
                    <textarea
                      className="w-full min-h-[100px] p-3 rounded-xl bg-muted/20 border-2 font-medium focus:outline-none focus:border-primary transition-all resize-none text-sm"
                      placeholder="Write a sweet note..."
                      value={formData.message}
                      onChange={e =>
                        setFormData({...formData, message: e.target.value})
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-2 p-3 rounded-xl bg-muted/10 border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                    <Checkbox
                      id="anonymous"
                      checked={formData.isAnonymous}
                      onCheckedChange={(checked: boolean) =>
                        setFormData({...formData, isAnonymous: checked})
                      }
                    />
                    <label
                      htmlFor="anonymous"
                      className="text-sm font-medium leading-none cursor-pointer">
                      Hide my name from recipient
                    </label>
                  </div>
                </div>

                <Button
                  className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 rounded-2xl"
                  onClick={handleNext}>
                  Continue to Payment <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                      Item Total
                    </p>
                    <p className="font-bold text-lg">{gift.name}</p>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {gift.symbol || '$'}
                    {gift.price.toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="h-14 px-6 rounded-2xl font-bold border-2"
                    onClick={handleBack}
                    disabled={isLoading}>
                    Back
                  </Button>
                  <Button
                    className="flex-1 h-14 text-lg font-bold shadow-lg shadow-primary/20 rounded-2xl"
                    onClick={handleNext}
                    disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : null}
                    Pay {gift.symbol || '$'}
                    {gift.price.toLocaleString()}
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
                <p className="text-muted-foreground mb-8 text-balance px-4">
                  Your{' '}
                  <span className="text-foreground font-bold">{gift.name}</span>{' '}
                  worth{' '}
                  <span className="text-foreground font-bold">
                    {gift.symbol || '$'}
                    {gift.price.toLocaleString()}
                  </span>{' '}
                  has been successfully sent.
                </p>
                <Button
                  className="w-full h-14 rounded-2xl font-bold text-lg"
                  onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            )}
          </div>

          {step !== 'success' && (
            <div className="p-4 bg-muted/30 border-t border-muted text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center justify-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                Powered by Gifthance
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendShopGiftModal;

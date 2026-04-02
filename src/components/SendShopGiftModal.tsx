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
import {recordShopGiftPurchase} from '@/lib/server/actions/transactions';
import {ArrowRight, Gift, Heart, Loader2, Mail, MessageCircle} from 'lucide-react';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {CountryPhoneInput, formatE164} from './CountryPhoneInput';

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

type DeliveryMethod = 'email' | 'whatsapp';

const WHATSAPP_FEE = 100; // ₦100 flat fee for WhatsApp delivery

const SendShopGiftModal = ({
  open,
  onOpenChange,
  gift,
}: SendShopGiftModalProps) => {
  const [step, setStep] = useState<'recipient' | 'payment' | 'success'>(
    'recipient',
  );
  const [isLoading, setIsLoading] = useState(false);
  const {data: profile} = useProfile();

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('email');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+234');
  const [isPhoneValid, setIsPhoneValid] = useState(false);

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
      setDeliveryMethod('email');
      setPhoneNumber('');
      setCountryCode('+234');
      setIsPhoneValid(false);
      setFormData({
        recipientEmail: '',
        senderName: profile?.display_name || profile?.username || '',
        senderEmail: profile?.email || '',
        message: '',
        isAnonymous: false,
      });
    }
  }, [open, profile]);

  // Calculate total with WhatsApp fee
  const whatsappFee = deliveryMethod === 'whatsapp' ? WHATSAPP_FEE : 0;
  const totalAmount = gift.price + whatsappFee;

  const validateRecipient = () => {
    if (deliveryMethod === 'email') {
      if (!formData.recipientEmail) {
        toast.error('Recipient email is required');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipientEmail)) {
        toast.error('Invalid recipient email format');
        return false;
      }
    } else {
      // WhatsApp validation
      if (!phoneNumber || !isPhoneValid) {
        toast.error('Valid phone number is required for WhatsApp delivery');
        return false;
      }
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

  const handlePhoneChange = (phone: string, code: string, isValid: boolean) => {
    setPhoneNumber(phone);
    setCountryCode(code);
    setIsPhoneValid(isValid);
  };

  const handlePaystackPayment = async () => {
    setIsLoading(true);

    // Dynamically import Paystack to avoid SSR 'window is not defined' errors
    const PaystackPop = (await import('@paystack/inline-js')).default;

    const paystack = new PaystackPop();
    paystack.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
      email: formData.senderEmail, // Use sender email for Paystack receipt
      amount: totalAmount * 100, // Paystack amount is in kobo/cents
      currency: 'NGN',
      onSuccess: (transaction: any) => {
        setIsLoading(false);
        console.log('Payment successful', transaction);

        // Show immediate success toast as requested
        toast.success('Gift card sent successfully!');

        // Close the modal as the Paystack popup is now showing
        onOpenChange(false);

        // Record the gift purchase and send email/WhatsApp completely asynchronously
        recordShopGiftPurchase({
          reference: transaction.reference,
          recipientEmail: deliveryMethod === 'email' ? formData.recipientEmail : undefined,
          recipientPhone: deliveryMethod === 'whatsapp' ? formatE164(phoneNumber, countryCode) : undefined,
          recipientCountryCode: deliveryMethod === 'whatsapp' ? countryCode : undefined,
          deliveryMethod: deliveryMethod,
          senderName: formData.isAnonymous ? 'Anonymous' : formData.senderName,
          message: formData.message,
          giftId: Number(gift.id),
          giftName: gift.name,
          expectedAmount: totalAmount,
          whatsappFee: whatsappFee,
          currency: gift.currency as string,
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
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl sm:rounded-3xl max-h-[90vh] flex flex-col">
        <VisuallyHidden>
          <ResponsiveModalTitle>Send {gift.name} Gift Card</ResponsiveModalTitle>
        </VisuallyHidden>
        <div className="relative flex flex-col max-h-[90vh] overflow-hidden">
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
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <Gift className="w-7 h-7 text-primary" />
                  </div>
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

          <div className="p-6 overflow-y-auto flex-1">
            {step === 'recipient' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  {/* Delivery Method Radio */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      Delivery Method
                    </Label>
                    <div className="space-y-2">
                      <label
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          deliveryMethod === 'email'
                            ? 'bg-primary/5 border border-primary/30'
                            : 'bg-muted/10 border border-transparent hover:bg-muted/20'
                        }`}
                        onClick={() => setDeliveryMethod('email')}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          deliveryMethod === 'email' ? 'border-primary' : 'border-muted-foreground/30'
                        }`}>
                          {deliveryMethod === 'email' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">Email</span>
                      </label>

                      <label
                        className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          deliveryMethod === 'whatsapp'
                            ? 'bg-green-500/5 border border-green-500/30'
                            : 'bg-muted/10 border border-transparent hover:bg-muted/20'
                        }`}
                        onClick={() => setDeliveryMethod('whatsapp')}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          deliveryMethod === 'whatsapp' ? 'border-green-500' : 'border-muted-foreground/30'
                        }`}>
                          {deliveryMethod === 'whatsapp' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                          )}
                        </div>
                        <MessageCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="font-medium text-sm">WhatsApp</span>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            WhatsApp Delivery Fee: ₦{WHATSAPP_FEE}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Conditional: Email or WhatsApp input */}
                  {deliveryMethod === 'email' ? (
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
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                        Recipient WhatsApp Number
                      </Label>
                      <CountryPhoneInput
                        value={phoneNumber}
                        countryCode={countryCode}
                        onChange={handlePhoneChange}
                        placeholder="Enter phone number"
                      />
                      <p className="text-[10px] text-muted-foreground ml-1">
                        Gift card will be delivered via WhatsApp message.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      Your Email
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

                  <div
                    className="flex items-center space-x-2 p-3 rounded-xl bg-muted/10 border border-transparent hover:border-primary/20 transition-all cursor-pointer"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        isAnonymous: !formData.isAnonymous,
                      })
                    }>
                    <Checkbox
                      id="anonymous"
                      checked={formData.isAnonymous}
                      onCheckedChange={(checked: boolean) =>
                        setFormData({...formData, isAnonymous: checked})
                      }
                      className="pointer-events-none"
                    />
                    <label
                      htmlFor="anonymous"
                      className="text-sm font-medium leading-none cursor-pointer pointer-events-none">
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
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">
                        Gift Item
                      </p>
                      <p className="font-bold text-base">{gift.name}</p>
                    </div>
                    <p className="text-xl font-bold">
                      {gift.symbol || '₦'}
                      {gift.price.toLocaleString()}
                    </p>
                  </div>

                  {deliveryMethod === 'whatsapp' && (
                    <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-green-600" />
                        <p className="text-sm text-muted-foreground">WhatsApp Delivery</p>
                      </div>
                      <p className="font-semibold text-green-600">
                        +{gift.symbol || '₦'}{WHATSAPP_FEE}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-primary/10">
                    <p className="font-bold">Total</p>
                    <p className="text-2xl font-bold text-primary">
                      {gift.symbol || '₦'}
                      {totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Delivery summary */}
                <div className="p-3 rounded-xl bg-muted/30 flex items-center gap-3">
                  {deliveryMethod === 'email' ? (
                    <>
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Delivering to</p>
                        <p className="font-medium text-sm truncate">{formData.recipientEmail}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Delivering via WhatsApp to</p>
                        <p className="font-medium text-sm">{formatE164(phoneNumber, countryCode)}</p>
                      </div>
                    </>
                  )}
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
                    Pay {gift.symbol || '₦'}
                    {totalAmount.toLocaleString()}
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
                    {gift.symbol || '₦'}
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
            <div className="p-4 bg-muted/30 border-t border-muted text-center pb-safe">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center justify-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                Powered by Gifthance
              </p>
            </div>
          )}
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
};

export default SendShopGiftModal;

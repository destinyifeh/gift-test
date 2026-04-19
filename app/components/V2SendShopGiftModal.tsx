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
import {useRecordShopGiftPurchase} from '@/hooks/use-transactions';
import {ArrowRight, Gift, Heart, Loader2, Mail, MessageCircle} from 'lucide-react';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {CountryPhoneInput, formatE164} from '@/components/CountryPhoneInput';

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

const WHATSAPP_FEE = 100;

const V2SendShopGiftModal = ({
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

  const whatsappFee = deliveryMethod === 'whatsapp' ? WHATSAPP_FEE : 0;
  const totalAmount = Number(gift.price) + whatsappFee;

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

  const recordShopGift = useRecordShopGiftPurchase();

  const handlePaystackPayment = async () => {
    setIsLoading(true);
    const PaystackPop = (await import('@paystack/inline-js')).default;
    const paystack = new PaystackPop();
    
    // Close the current gift modal as soon as Paystack opens
    onOpenChange(false);

    paystack.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
      email: formData.senderEmail,
      amount: totalAmount * 100,
      currency: 'NGN',
      onSuccess: (transaction: any) => {
        recordShopGift.mutate({
          reference: transaction.reference,
          recipientEmail: deliveryMethod === 'email' ? formData.recipientEmail : undefined,
          recipientPhone: deliveryMethod === 'whatsapp' ? formatE164(phoneNumber, countryCode) : undefined,
          recipientCountryCode: deliveryMethod === 'whatsapp' ? countryCode : undefined,
          deliveryMethod: deliveryMethod,
          senderName: formData.isAnonymous ? 'Anonymous' : formData.senderName,
          senderEmail: formData.senderEmail,
          message: formData.message,
          giftId: Number(gift.id),
          giftName: gift.name,
          expectedAmount: totalAmount,
          whatsappFee: whatsappFee,
          currency: gift.currency as string || 'NGN',
        }, {
          onSuccess: () => {
            setIsLoading(false);
            toast.success('Gift card sent successfully!');
          },
          onError: (error: any) => {
            setIsLoading(false);
            toast.error(error.response?.data?.message || 'Failed to record gift purchase');
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
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent 
        className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl sm:rounded-3xl max-h-[90vh] flex flex-col bg-[var(--v2-surface)]"
      >
        <VisuallyHidden>
          <ResponsiveModalTitle>Send {gift.name} Gift Card</ResponsiveModalTitle>
        </VisuallyHidden>
        <div className="relative flex flex-col max-h-[90vh] overflow-hidden">
          {/* Header Section */}
          <div className="bg-[var(--v2-primary-container)]/10 px-6 pt-8 pb-6 border-b border-[var(--v2-outline-variant)]/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-2xl border border-[var(--v2-outline-variant)]/30 overflow-hidden">
                {gift.image ? (
                  <img src={gift.image} alt={gift.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[var(--v2-primary)]/10 flex items-center justify-center">
                    <Gift className="w-7 h-7 text-[var(--v2-primary)]" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] leading-tight">
                  {step === 'success' ? 'Gift Sent!' : 'Send this Gift Card'}
                </h3>
                <p className="text-sm text-[var(--v2-on-surface-variant)] mt-0.5">
                  {gift.name} • {gift.vendor}
                </p>
              </div>
            </div>

            {/* Stepper */}
            {step !== 'success' && (
              <div className="flex items-center gap-2 mt-6">
                <div
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step === 'recipient' || step === 'payment' ? 'v2-gradient-primary shadow-[0_0_10px_rgba(var(--v2-primary),0.3)]' : 'bg-[var(--v2-surface-container)]'}`}
                />
                <div
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step === 'payment' ? 'v2-gradient-primary shadow-[0_0_10px_rgba(var(--v2-primary),0.3)]' : 'bg-[var(--v2-surface-container)]'}`}
                />
              </div>
            )}
          </div>

          <div className="p-6 overflow-y-auto flex-1 v2-no-scrollbar">
            {step === 'recipient' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-wider text-[var(--v2-on-surface-variant)] ml-1">
                      Delivery Method
                    </Label>
                    <div className="space-y-2">
                      <label
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          deliveryMethod === 'email'
                            ? 'bg-[var(--v2-primary-container)]/20 border border-[var(--v2-primary)]/30'
                            : 'bg-[var(--v2-surface-container-low)] border border-transparent hover:bg-[var(--v2-surface-container)]'
                        }`}
                        onClick={() => setDeliveryMethod('email')}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          deliveryMethod === 'email' ? 'border-[var(--v2-primary)]' : 'border-[var(--v2-outline-variant)]/30'
                        }`}>
                          {deliveryMethod === 'email' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--v2-primary)]" />
                          )}
                        </div>
                        <Mail className="w-4 h-4 text-[var(--v2-on-surface-variant)]" />
                        <span className="font-medium text-sm text-[var(--v2-on-surface)]">Email</span>
                      </label>

                      <label
                        className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          deliveryMethod === 'whatsapp'
                            ? 'bg-emerald-500/5 border border-emerald-500/30'
                            : 'bg-[var(--v2-surface-container-low)] border border-transparent hover:bg-[var(--v2-surface-container)]'
                        }`}
                        onClick={() => setDeliveryMethod('whatsapp')}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          deliveryMethod === 'whatsapp' ? 'border-emerald-500' : 'border-[var(--v2-outline-variant)]/30'
                        }`}>
                          {deliveryMethod === 'whatsapp' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          )}
                        </div>
                        <MessageCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="font-medium text-sm text-[var(--v2-on-surface)]">WhatsApp</span>
                          <p className="text-[11px] text-[var(--v2-on-surface-variant)] mt-0.5">
                            WhatsApp Delivery Fee: ₦{WHATSAPP_FEE}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {deliveryMethod === 'email' ? (
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-[var(--v2-on-surface-variant)] ml-1">
                        Recipient Email
                      </Label>
                      <Input
                        placeholder="alex@example.com"
                        type="email"
                        value={formData.recipientEmail}
                        onChange={e => setFormData({...formData, recipientEmail: e.target.value})}
                        className="h-12 rounded-xl bg-[var(--v2-surface-container-low)] border-2 border-transparent focus-visible:border-[var(--v2-primary)] font-medium"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-[var(--v2-on-surface-variant)] ml-1">
                        Recipient WhatsApp
                      </Label>
                      <CountryPhoneInput
                        value={phoneNumber}
                        countryCode={countryCode}
                        onChange={handlePhoneChange}
                        placeholder="Enter phone number"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-[var(--v2-on-surface-variant)] ml-1">
                      Your Email
                    </Label>
                    <Input
                      placeholder="you@example.com"
                      type="email"
                      value={formData.senderEmail}
                      onChange={e => setFormData({...formData, senderEmail: e.target.value})}
                      className="h-12 rounded-xl bg-[var(--v2-surface-container-low)] border-2 border-transparent focus-visible:border-[var(--v2-primary)] font-medium"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-[var(--v2-on-surface-variant)] ml-1">
                      Your Name
                    </Label>
                    <Input
                      placeholder="Your name"
                      value={formData.senderName}
                      onChange={e => setFormData({...formData, senderName: e.target.value})}
                      className="h-12 rounded-xl bg-[var(--v2-surface-container-low)] border-2 border-transparent focus-visible:border-[var(--v2-primary)] font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-[var(--v2-on-surface-variant)] ml-1">
                      Message (Optional)
                    </Label>
                    <textarea
                      className="w-full min-h-[100px] p-3 rounded-xl bg-[var(--v2-surface-container-low)] border-2 border-transparent focus:border-[var(--v2-primary)] outline-none transition-all resize-none text-sm font-medium"
                      placeholder="Write a sweet note..."
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                    />
                  </div>

                  <div
                    className="flex items-center space-x-2 p-3 rounded-xl bg-[var(--v2-surface-container-low)] border border-transparent hover:border-[var(--v2-primary)]/20 transition-all cursor-pointer"
                    onClick={() => setFormData({...formData, isAnonymous: !formData.isAnonymous})}
                  >
                    <Checkbox
                      checked={formData.isAnonymous}
                      onCheckedChange={(checked: boolean) => setFormData({...formData, isAnonymous: checked})}
                      className="pointer-events-none"
                    />
                    <label className="text-sm font-medium text-[var(--v2-on-surface)] cursor-pointer">
                      Hide my name from recipient
                    </label>
                  </div>
                </div>

                <button
                  className="w-full h-14 v2-btn-primary rounded-2xl text-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-[var(--v2-primary)]/20"
                  onClick={handleNext}
                >
                  Continue to Payment <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-6 bg-[var(--v2-surface-container-low)] rounded-3xl border border-[var(--v2-outline-variant)]/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-widest">Gift Item</p>
                      <p className="font-bold text-lg text-[var(--v2-on-surface)]">{gift.name}</p>
                    </div>
                    <p className="text-xl font-black text-[var(--v2-on-surface)]">
                      {gift.symbol || '₦'}{gift.price.toLocaleString()}
                    </p>
                  </div>

                  {deliveryMethod === 'whatsapp' && (
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--v2-outline-variant)]/20">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <p className="text-sm text-[var(--v2-on-surface-variant)]">WhatsApp Delivery</p>
                      </div>
                      <p className="font-bold text-emerald-600">
                        +{gift.symbol || '₦'}{WHATSAPP_FEE}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-[var(--v2-outline-variant)]/30">
                    <p className="font-black text-lg text-[var(--v2-on-surface)]">Total</p>
                    <p className="text-3xl font-black text-[var(--v2-primary)]">
                      {gift.symbol || '₦'}{totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="h-14 px-6 rounded-2xl font-bold border-2 border-[var(--v2-outline-variant)]/30"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <button
                    className="flex-1 h-14 v2-btn-primary rounded-2xl text-lg font-bold flex items-center justify-center gap-2"
                    onClick={handleNext}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                    Pay {gift.symbol || '₦'}{totalAmount.toLocaleString()}
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
                <h3 className="text-3xl font-black v2-headline text-[var(--v2-on-surface)] mb-2">Gift Sent!</h3>
                <p className="text-[var(--v2-on-surface-variant)] mb-10 text-balance px-4 leading-relaxed">
                  Your <span className="text-[var(--v2-on-surface)] font-bold">{gift.name}</span> worth <span className="text-[var(--v2-primary)] font-black">{gift.symbol || '₦'}{gift.price.toLocaleString()}</span> has been successfully sent.
                </p>
                <button
                  className="w-full h-14 v2-btn-primary rounded-2xl font-bold text-lg"
                  onClick={() => onOpenChange(false)}
                >
                  Done
                </button>
              </div>
            )}
          </div>

          {step !== 'success' && (
            <div className="p-4 bg-[var(--v2-surface-container)]/30 text-center pb-safe">
              <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[var(--v2-primary)] animate-pulse" />
                Powered by Gifthance
              </p>
            </div>
          )}
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
};

export default V2SendShopGiftModal;

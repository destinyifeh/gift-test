'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { useProfile } from '@/hooks/use-profile';
import { ArrowRight, Gift, Heart, Loader2, Mail, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CountryPhoneInput, formatE164 } from '@/components/CountryPhoneInput';

interface SendGiftCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  giftCard: {
    id: string | number;
    slug: string;
    name: string;
    amount: number;
    currency: string;
    image?: string;
    isFlexCard?: boolean;
    serviceFeePercent?: number;
  };
}

type DeliveryMethod = 'email' | 'whatsapp';

const WHATSAPP_FEE = 100;

export const V2SendGiftCardModal = ({
  open,
  onOpenChange,
  giftCard,
}: SendGiftCardModalProps) => {
  const [step, setStep] = useState<'recipient' | 'payment' | 'success'>(
    'recipient',
  );
  const [isLoading, setIsLoading] = useState(false);
  const { data: profile } = useProfile();

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
  const serviceFeePercent = giftCard.serviceFeePercent || 4;
  const serviceFee = Math.round(giftCard.amount * serviceFeePercent / 100);
  const totalAmount = giftCard.amount + serviceFee + whatsappFee;

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
    try {
      const PaystackPop = (await import('@paystack/inline-js')).default;
      const paystack = new (PaystackPop as any)();
      
      onOpenChange(false);

      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        email: formData.senderEmail,
        amount: Math.round(totalAmount * 100),
        currency: giftCard.currency || 'NGN',
        metadata: {
          gift_card_slug: giftCard.slug,
          amount: giftCard.amount,
        },
        onSuccess: async (response: { reference: string }) => {
          try {
            if (giftCard.isFlexCard) {
              const { createFlexCard } = await import('@/lib/server/actions/flex-cards');
              await createFlexCard({
                initial_amount: giftCard.amount,
                recipient_email: deliveryMethod === 'email' ? formData.recipientEmail : undefined,
                recipient_phone: deliveryMethod === 'whatsapp' ? formatE164(phoneNumber, countryCode) : undefined,
                delivery_method: deliveryMethod,
                sender_name: formData.isAnonymous ? 'Anonymous' : formData.senderName || undefined,
                message: formData.message || undefined,
              });
            } else {
              const { createUserGiftCard } = await import('@/lib/server/actions/user-gift-cards');
              await createUserGiftCard({
                giftCardId: Number(giftCard.id),
                initialAmount: giftCard.amount,
                currency: giftCard.currency || 'NGN',
                recipientEmail: deliveryMethod === 'email' ? formData.recipientEmail : undefined,
                recipientPhone: deliveryMethod === 'whatsapp' ? formatE164(phoneNumber, countryCode) : undefined,
                deliveryMethod,
                senderName: formData.isAnonymous ? 'Anonymous' : formData.senderName || undefined,
                message: formData.message || undefined,
              });
            }
            toast.success('Gift card issued successfully!');
          } catch (e: any) {
            toast.error('Finalizing delivery failed: ' + e.message);
          }
          setIsLoading(false);
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
    } catch (e: any) {
      setIsLoading(false);
      toast.error('Failed to initialize payment gateway');
    }
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent 
        className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl sm:rounded-3xl max-h-[90vh] flex flex-col bg-[var(--v2-surface)]"
      >
        <VisuallyHidden>
          <ResponsiveModalTitle>Send {giftCard.name}</ResponsiveModalTitle>
        </VisuallyHidden>
        <div className="relative flex flex-col max-h-[90vh] overflow-hidden">
          {/* Header Section */}
          <div className="bg-[var(--v2-primary-container)]/10 px-6 pt-8 pb-6 border-b border-[var(--v2-outline-variant)]/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-2xl border border-[var(--v2-outline-variant)]/30 overflow-hidden">
                <Gift className="w-7 h-7 text-[var(--v2-primary)]" />
              </div>
              <div>
                <h3 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] leading-tight">
                   Send {giftCard.name}
                </h3>
                <p className="text-sm text-[var(--v2-on-surface-variant)] mt-0.5">
                   Confirm and send this digital asset.
                </p>
              </div>
            </div>

            {/* Stepper */}
            {step !== 'success' && (
              <div className="flex items-center gap-2 mt-6">
                <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step === 'recipient' || step === 'payment' ? 'v2-gradient-primary shadow-[0_0_10px_rgba(var(--v2-primary),0.3)]' : 'bg-[var(--v2-surface-container)]'}`} />
                <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step === 'payment' ? 'v2-gradient-primary shadow-[0_0_10px_rgba(var(--v2-primary),0.3)]' : 'bg-[var(--v2-surface-container)]'}`} />
              </div>
            )}
          </div>

          <div className="p-6 overflow-y-auto flex-1 v2-no-scrollbar">
            {step === 'recipient' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-wider text-[var(--v2-on-surface-variant)] ml-1">Delivery Method</Label>
                    <div className="space-y-2">
                      <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${deliveryMethod === 'email' ? 'bg-[var(--v2-primary-container)]/20 border border-[var(--v2-primary)]/30' : 'bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container)]'}`} onClick={() => setDeliveryMethod('email')}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryMethod === 'email' ? 'border-[var(--v2-primary)]' : 'border-[var(--v2-outline-variant)]/30'}`}>
                          {deliveryMethod === 'email' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--v2-primary)]" />}
                        </div>
                        <Mail className="w-4 h-4 text-[var(--v2-on-surface-variant)]" />
                        <span className="font-medium text-sm text-[var(--v2-on-surface)]">Email</span>
                      </label>
                      <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${deliveryMethod === 'whatsapp' ? 'bg-emerald-500/5 border border-emerald-500/30' : 'bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container)]'}`} onClick={() => setDeliveryMethod('whatsapp')}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${deliveryMethod === 'whatsapp' ? 'border-emerald-500' : 'border-[var(--v2-outline-variant)]/30'}`}>
                          {deliveryMethod === 'whatsapp' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                        </div>
                        <MessageCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="font-medium text-sm text-[var(--v2-on-surface)]">WhatsApp</span>
                          <p className="text-[11px] text-[var(--v2-on-surface-variant)] mt-0.5">WhatsApp Delivery Fee: ₦{WHATSAPP_FEE}</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {deliveryMethod === 'email' ? (
                    <div className="space-y-2">
                       <Label className="text-xs font-bold uppercase tracking-wider text-[var(--v2-on-surface-variant)] ml-1">Recipient Email</Label>
                       <Input placeholder="name@example.com" value={formData.recipientEmail} onChange={e => setFormData({...formData, recipientEmail: e.target.value})} className="h-12 rounded-xl bg-[var(--v2-surface-container-low)] border-none focus-visible:ring-2 focus-visible:ring-[var(--v2-primary)] font-medium" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                       <Label className="text-xs font-bold uppercase tracking-wider text-[var(--v2-on-surface-variant)] ml-1">Recipient WhatsApp</Label>
                       <CountryPhoneInput value={phoneNumber} countryCode={countryCode} onChange={(p, c, v) => { setPhoneNumber(p); setCountryCode(c); setIsPhoneValid(v); }} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-[var(--v2-on-surface-variant)] ml-1">Your Name</Label>
                    <Input placeholder="Your name" value={formData.senderName} onChange={e => setFormData({...formData, senderName: e.target.value})} className="h-12 rounded-xl bg-[var(--v2-surface-container-low)] border-none focus-visible:ring-2 focus-visible:ring-[var(--v2-primary)] font-medium" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-[var(--v2-on-surface-variant)] ml-1">Personal Message</Label>
                    <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full min-h-[100px] p-3 rounded-xl bg-[var(--v2-surface-container-low)] border-none focus-visible:ring-2 focus-visible:ring-[var(--v2-primary)] outline-none resize-none text-sm font-medium" placeholder="Add a personal touch..." />
                  </div>

                  <div className="flex items-center space-x-2 p-3 rounded-xl bg-[var(--v2-surface-container-low)] cursor-pointer" onClick={() => setFormData({...formData, isAnonymous: !formData.isAnonymous})}>
                    <Checkbox checked={formData.isAnonymous} onCheckedChange={(checked: boolean) => setFormData({...formData, isAnonymous: checked})} />
                    <label className="text-sm font-medium text-[var(--v2-on-surface)] cursor-pointer">Send Anonymously</label>
                  </div>
                </div>

                <button className="w-full h-14 v2-btn-primary rounded-2xl text-lg font-bold flex items-center justify-center gap-2" onClick={handleNext}>
                   Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-6 bg-[var(--v2-surface-container-low)] rounded-3xl border border-[var(--v2-outline-variant)]/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-widest">Gift Value</p>
                      <p className="font-bold text-lg text-[var(--v2-on-surface)]">{giftCard.name}</p>
                    </div>
                    <p className="text-xl font-black text-[var(--v2-on-surface)]">₦{giftCard.amount.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--v2-outline-variant)]/20">
                     <p className="text-sm text-[var(--v2-on-surface-variant)] font-medium">Platform Fee ({serviceFeePercent}%)</p>
                     <p className="font-bold text-[var(--v2-on-surface)]">₦{serviceFee.toLocaleString()}</p>
                  </div>

                  {deliveryMethod === 'whatsapp' && (
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--v2-outline-variant)]/20">
                      <p className="text-sm text-emerald-600 font-medium">WhatsApp Delivery</p>
                      <p className="font-bold text-emerald-600">₦{WHATSAPP_FEE}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-[var(--v2-outline-variant)]/30">
                    <p className="font-black text-lg text-[var(--v2-on-surface)]">Total Payment</p>
                    <p className="text-3xl font-black text-[var(--v2-primary)]">₦{totalAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="h-14 px-6 rounded-2xl font-bold border-2" onClick={handleBack} disabled={isLoading}>Back</Button>
                  <button className="flex-1 h-14 v2-btn-primary rounded-2xl text-lg font-bold flex items-center justify-center gap-2" onClick={handleNext} disabled={isLoading}>
                    {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                    Pay ₦{totalAmount.toLocaleString()}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-[var(--v2-surface-container)]/30 text-center pb-safe">
            <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-[0.3em] flex items-center justify-center gap-2">
              Powered by Gifthance
            </p>
          </div>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
};

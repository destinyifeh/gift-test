'use client';

import Navbar from '@/components/landing/Navbar';
import {RequireAuthUI} from '@/components/guards';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {ArrowLeft, ArrowRight, Loader2} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';

import {SelectGiftStep} from './components/SelectGiftStep';
import {GiftDetailsStep} from './components/GiftDetailsStep';
import {SendGiftSuccess} from './components/SendGiftSuccess';
import {createClient} from '@/lib/server/supabase/client';

export default function SendGiftPage() {
  const [step, setStep] = useState(0);

  // Form State
  const [giftType, setGiftType] = useState<'money' | 'gift-card' | null>(null);
  const [amount, setAmount] = useState('');
  const [giftId, setGiftId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  
  const [deliveryType, setDeliveryType] = useState<'direct' | 'claim-link'>('direct');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const [deliveryTime, setDeliveryTime] = useState<'now' | 'schedule'>('now');
  const [scheduledFor, setScheduledFor] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [campaignSlug, setCampaignSlug] = useState('');

  const steps = ['Select Gift', 'Gift Details'];

  // Handle constraints (scheduling disabled for claim links)
  if (deliveryType === 'claim-link' && deliveryTime === 'schedule') {
    setDeliveryTime('now');
  }

  const next = () => {
    if (step === 0 && !giftType) {
      toast.error('Please select a gift type');
      return;
    }
    if (step === 1) {
      if (giftType === 'money' && !amount) {
        toast.error('Please enter an amount');
        return;
      }
      if (giftType === 'gift-card' && !giftId) {
        toast.error('Please select a gift card');
        return;
      }
      if (deliveryType === 'direct' && !recipientEmail) {
        toast.error('Recipient email is required for direct delivery');
        return;
      }
      if (deliveryTime === 'schedule' && !scheduledFor) {
        toast.error('Please select a date and time');
        return;
      }
    }
    setStep(s => Math.min(s + 1, steps.length - 1));
  };

  const prev = () => setStep(s => Math.max(s - 1, 0));

  const handleSendGift = async () => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Fetch user data (currency, profile)
      const {data: profile} = await supabase.from('profiles').select('email').eq('id', user.id).single();

      // 2. Fetch standard gift card price if applying
      let finalGoal = Number(amount);
      if (giftType === 'gift-card' && giftId) {
        const {data: vendorGift} = await supabase.from('vendor_gifts').select('price').eq('id', giftId).single();
        if (vendorGift) finalGoal = Number(vendorGift.price);
      }

      // We launch the claimable 'campaign' via an API call
      // Because claim.ts logic and paystack integration expects standard payload
      // But wait! We need to process payment first. For now, since this platform does Paystack externally or on-page, 
      // I will assume we can hit the /api/paystack endpoint or call a server action.
      // Wait, in create-campaign it was handled by `createCampaign` action which returns an authorization URL.
      
      const payload = {
        category: 'claimable', // We still send claimable to backend so it knows how to handle it internally
        title: giftType === 'money' ? 'Monetary Gift' : 'Gift Card',
        claimable_type: giftType,
        goal_amount: finalGoal,
        currency: 'NGN', // Hardcoded for demo/simplicity, should ideally be from user pref
        claimable_gift_id: giftId || undefined,
        recipient_email: deliveryType === 'direct' ? recipientEmail : null, // claim-link means no forced recipient yet
        sender_email: profile?.email || user.email,
        sender_name: senderName || undefined,
        is_anonymous: isAnonymous,
        message: message || undefined,
        status: 'active', // Will be inactive/pending until payment if we use paystack
        scheduled_for: deliveryTime === 'schedule' && scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
      };

      const {createCampaign} = await import('@/lib/server/actions/campaigns');
      const result = await createCampaign(payload as any);

      if (result.success && result.data) {
        if (result.data.authorization_url) {
          window.location.href = result.data.authorization_url;
        } else {
          setCampaignSlug(result.data.campaign_short_id || '');
          setSubmitted(true);
        }
      } else {
        toast.error(result.error || 'Failed to initialize payment');
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return <SendGiftSuccess slug={campaignSlug} isClaimLink={deliveryType === 'claim-link'} />;
  }

  return (
    <RequireAuthUI header={<Navbar />} redirectPath="/send-gift">
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            {/* Steps indicator */}
            <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4 hide-scrollbar">
              {steps.map((label, idx) => {
                const isActive = step === idx;
                const isPast = step > idx;
                return (
                  <div key={label} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : isPast
                              ? 'bg-primary/20 text-primary cursor-pointer'
                              : 'bg-muted text-muted-foreground'
                        }`}
                        onClick={() => isPast && setStep(idx)}>
                        {idx + 1}
                      </div>
                      <span
                        className={`text-xs mt-2 font-medium whitespace-nowrap hidden sm:block ${
                          isActive || isPast ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                        {label}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`w-8 sm:w-16 h-1 mx-2 rounded-full transition-colors ${
                          isPast ? 'bg-primary/20' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <Card className="border-border shadow-sm">
              <CardContent className="p-6">
                {step === 0 && (
                  <SelectGiftStep
                    giftType={giftType}
                    setGiftType={setGiftType}
                  />
                )}
                {step === 1 && (
                  <GiftDetailsStep
                    giftType={giftType}
                    amount={amount}
                    setAmount={setAmount}
                    giftId={giftId}
                    setGiftId={setGiftId}
                    message={message}
                    setMessage={setMessage}
                    deliveryType={deliveryType}
                    setDeliveryType={setDeliveryType}
                    recipientEmail={recipientEmail}
                    setRecipientEmail={setRecipientEmail}
                    senderName={senderName}
                    setSenderName={setSenderName}
                    isAnonymous={isAnonymous}
                    setIsAnonymous={setIsAnonymous}
                    deliveryTime={deliveryTime}
                    setDeliveryTime={setDeliveryTime}
                    scheduledFor={scheduledFor}
                    setScheduledFor={setScheduledFor}
                  />
                )}

                <div className="flex justify-between mt-8">
                  {step > 0 ? (
                    <Button variant="outline" onClick={prev} disabled={isSubmitting}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                  ) : (
                    <div />
                  )}
                  {step < steps.length - 1 ? (
                    <Button variant="hero" onClick={next}>
                      Next <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      variant="hero"
                      onClick={handleSendGift}
                      disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Proceed to Payment 💳'
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RequireAuthUI>
  );
}

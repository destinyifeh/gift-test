'use client';

import {V2RequireAuthUI} from '../components/V2RequireAuthUI';
import {authClient} from '@/lib/auth-client';
import {fetchAllProducts} from '@/lib/server/actions/vendor';
import {cn} from '@/lib/utils';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {CountryPhoneInput, formatE164} from '@/components/CountryPhoneInput';

type GiftType = 'money' | 'gift-card' | 'flex-card' | null;
type DeliveryType = 'direct' | 'claim-link';
type DeliveryMethod = 'email' | 'whatsapp';
type DeliveryTime = 'now' | 'schedule';

const WHATSAPP_FEE = 100; // Flat fee in NGN

export default function V2SendGiftPage() {
  const router = useRouter();

  // Form State
  const [giftType, setGiftType] = useState<GiftType>(null);
  const [amount, setAmount] = useState('');
  const [giftId, setGiftId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('direct');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('email');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientCountryCode, setRecipientCountryCode] = useState('+234');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [deliveryTime, setDeliveryTime] = useState<DeliveryTime>('now');
  const [scheduledFor, setScheduledFor] = useState('');

  // Vendor gifts
  const [vendorGifts, setVendorGifts] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [campaignSlug, setCampaignSlug] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('gift');

  // Fetch vendor gifts when gift-card is selected
  useEffect(() => {
    if (giftType === 'gift-card') {
      const fetchGifts = async () => {
        const result = await fetchAllProducts(1, 100);
        if (result.success && result.data) {
          setVendorGifts(result.data);
        } else if (result.error) {
          console.error('Error fetching vendor gifts:', result.error);
        }
      };
      fetchGifts();
    }
  }, [giftType]);

  // Handle constraints
  useEffect(() => {
    if (deliveryType === 'claim-link' && deliveryTime === 'schedule') {
      setDeliveryTime('now');
    }
    // Reset delivery method fields when switching delivery type
    if (deliveryType === 'claim-link') {
      setDeliveryMethod('email');
    }
  }, [deliveryType, deliveryTime]);

  const selectedGift = vendorGifts.find(g => g.id === giftId);

  // Flex Card amount presets
  const flexCardPresets = [1000, 3000, 5000, 10000];
  const [flexCardAmount, setFlexCardAmount] = useState<number | null>(null);
  const [customFlexAmount, setCustomFlexAmount] = useState('');

  const canProceed = () => {
    if (!giftType) return false;
    if (giftType === 'money' && !amount) return false;
    if (giftType === 'gift-card' && !giftId) return false;
    if (giftType === 'flex-card' && !flexCardAmount && !customFlexAmount) return false;
    if (deliveryType === 'direct') {
      if (deliveryMethod === 'email' && !recipientEmail) return false;
      if (deliveryMethod === 'whatsapp' && (!recipientPhone || !isPhoneValid)) return false;
    }
    if (deliveryTime === 'schedule' && !scheduledFor) return false;
    return true;
  };

  const handleSendGift = async () => {
    if (!canProceed()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      toast.error('Payment gateway not configured. Please contact support.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: session } = await authClient.getSession();
      if (!session?.user) throw new Error('Not authenticated');
      const user = session.user;

      const userEmail = user.email;
      if (!userEmail) {
        toast.error('Unable to get your email for payment');
        setIsSubmitting(false);
        return;
      }

      let finalGoal = Number(amount);
      if (giftType === 'gift-card' && giftId) {
        const selectedVendorGift = vendorGifts.find(g => g.id === giftId);
        if (selectedVendorGift) finalGoal = Number(selectedVendorGift.price);
      }
      if (giftType === 'flex-card') {
        finalGoal = flexCardAmount || Number(customFlexAmount);
      }

      // Calculate total with WhatsApp fee if applicable
      const whatsappFee = deliveryType === 'direct' && deliveryMethod === 'whatsapp' ? WHATSAPP_FEE : 0;
      const totalAmount = finalGoal + whatsappFee;

      // Initialize Paystack payment
      const PaystackPop = (await import('@paystack/inline-js')).default;
      const paystack = new (PaystackPop as any)();

      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
        email: userEmail,
        amount: Math.round(totalAmount * 100), // Convert to kobo
        currency: 'NGN',
        metadata: {
          gift_type: giftType,
          gift_id: giftId,
          recipient_email: deliveryType === 'direct' && deliveryMethod === 'email' ? recipientEmail : null,
          recipient_phone: deliveryType === 'direct' && deliveryMethod === 'whatsapp' ? recipientPhone : null,
          custom_fields: [
            {
              display_name: 'Gift Type',
              variable_name: 'gift_type',
              value: giftType,
            },
          ],
        },
        onSuccess: async (response: {reference: string}) => {
          // Payment successful, now create the campaign/gift
          try {
            // Handle Flex Card creation
            if (giftType === 'flex-card') {
              const {createFlexCard} = await import('@/lib/server/actions/flex-cards');
              const flexResult = await createFlexCard({
                initial_amount: finalGoal,
                recipient_email: deliveryType === 'direct' && deliveryMethod === 'email' ? recipientEmail : undefined,
                recipient_phone: deliveryType === 'direct' && deliveryMethod === 'whatsapp'
                  ? formatE164(recipientPhone, recipientCountryCode)
                  : undefined,
                delivery_method: deliveryType === 'direct' ? deliveryMethod : 'email',
                sender_name: isAnonymous ? (senderName || 'Someone') : (senderName || undefined),
                message: message || undefined,
              });

              if (flexResult.success && flexResult.data) {
                setCampaignSlug(flexResult.data.claimToken || flexResult.data.code);
                setSubmitted(true);
              } else {
                toast.error(flexResult.error || 'Payment successful but failed to create Flex Card. Please contact support.');
              }
              setIsSubmitting(false);
              return;
            }

            // Handle Gift Card creation
            if (giftType === 'gift-card' && giftId) {
              const {createUserGiftCard} = await import('@/lib/server/actions/user-gift-cards');
              const giftCardResult = await createUserGiftCard({
                giftCardId: giftId,
                initialAmount: finalGoal,
                currency: 'NGN',
                recipientEmail: deliveryType === 'direct' && deliveryMethod === 'email' ? recipientEmail : undefined,
                senderName: isAnonymous ? (senderName || 'Someone') : (senderName || undefined),
                message: message || undefined,
                deliveryMethod: deliveryType === 'direct' ? deliveryMethod : 'email',
                recipientPhone: deliveryType === 'direct' && deliveryMethod === 'whatsapp'
                  ? formatE164(recipientPhone, recipientCountryCode)
                  : undefined,
              });

              if (giftCardResult.success && giftCardResult.data) {
                setCampaignSlug(deliveryType === 'claim-link' ? giftCardResult.data.claimToken || giftCardResult.data.code : giftCardResult.data.code);
                setSubmitted(true);
                toast.success('Gift sent successfully!');
              } else {
                toast.error(giftCardResult.error || 'Payment successful but failed to create gift card.');
              }
              setIsSubmitting(false);
              return;
            }

            // Create campaign for money
            const payload = {
              category: 'claimable',
              title: 'Cash Gift',
              claimableType: giftType,
              goalAmount: finalGoal,
              currency: 'NGN',
              recipientEmail: deliveryType === 'direct' && deliveryMethod === 'email' ? recipientEmail : undefined,
              senderEmail: userEmail,
              senderName: isAnonymous ? (senderName || 'Someone') : (senderName || undefined),
              isAnonymous: isAnonymous,
              message: message || undefined,
              status: 'active',
              paymentReference: response.reference,
              scheduledFor:
                deliveryTime === 'schedule' && scheduledFor
                  ? new Date(scheduledFor).toISOString()
                  : undefined,
              deliveryMethod: deliveryType === 'direct' ? deliveryMethod : 'email',
              recipientPhone: deliveryType === 'direct' && deliveryMethod === 'whatsapp'
                ? formatE164(recipientPhone, recipientCountryCode)
                : undefined,
              recipientCountryCode: deliveryType === 'direct' && deliveryMethod === 'whatsapp'
                ? recipientCountryCode
                : undefined,
              whatsappFee: whatsappFee,
            };

            const {createCampaign} = await import('@/lib/server/actions/campaigns');
            const result = await createCampaign(payload as any);

            if (result.success && result.data) {
              setCampaignSlug(deliveryType === 'claim-link' ? result.data.giftCode : (result.data.campaignShortId || result.data.campaign_short_id || ''));
              setSubmitted(true);
              toast.success('Gift sent successfully!');
            } else {
              toast.error(result.error || 'Payment successful but failed to create gift. Please contact support.');
            }
          } catch (err: any) {
            toast.error(err.message || 'Payment successful but an error occurred. Please contact support.');
          }
          setIsSubmitting(false);
        },
        onCancel: () => {
          toast.info('Payment cancelled');
          setIsSubmitting(false);
        },
        onError: (error: any) => {
          console.error('Paystack error:', error);
          toast.error('Payment failed. Please try again.');
          setIsSubmitting(false);
        },
      });
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return <V2SuccessScreen slug={campaignSlug} isClaimLink={deliveryType === 'claim-link'} giftType={giftType || undefined} />;
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const baseAmount = giftType === 'money'
    ? Number(amount)
    : giftType === 'flex-card'
      ? (flexCardAmount || Number(customFlexAmount) || 0)
      : Number(selectedGift?.price || 0);
  const whatsappDeliveryFee = deliveryType === 'direct' && deliveryMethod === 'whatsapp' ? WHATSAPP_FEE : 0;
  const totalAmount = baseAmount + whatsappDeliveryFee;

  return (
    <V2RequireAuthUI redirectPath="/send-gift">
      <div className="min-h-screen bg-[var(--v2-background)]">
        {/* Desktop Navigation */}
        <nav className="hidden md:block fixed top-0 w-full z-50 v2-glass-nav">
          <div className="flex justify-between items-center px-8 h-16 max-w-7xl mx-auto">
            <Link href="/" className="text-xl font-extrabold text-[var(--v2-primary)] tracking-tight v2-headline">
              Gifthance
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/gift-shop" className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] font-medium transition-colors">
                Gift Shop
              </Link>
              <Link href="/campaigns" className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] font-medium transition-colors">
                Campaigns
              </Link>
              <Link href="/dashboard" className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] font-medium transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </nav>

        {/* Mobile Header */}
        <header className="md:hidden fixed top-0 w-full z-50 v2-glass-nav h-14 flex items-center justify-between px-4">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-[var(--v2-primary)]">
            <span className="v2-icon">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold v2-headline text-[var(--v2-on-surface)]">Send Gift</h1>
          <div className="w-10" />
        </header>

        {/* Main Content */}
        <main className="pt-14 md:pt-24 pb-32 md:pb-16 px-4">
          <div className="max-w-xl mx-auto">
            {/* Header - Desktop only */}
            <div className="hidden md:block mb-8">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1 text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] transition-colors mb-6">
                <span className="v2-icon">arrow_back</span>
                <span className="font-medium">Back</span>
              </button>
              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--v2-primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="v2-icon text-3xl text-[var(--v2-primary)]" style={{fontVariationSettings: "'FILL' 1"}}>
                    card_giftcard
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)] tracking-tight">
                  Send a Gift
                </h1>
                <p className="text-[var(--v2-on-surface-variant)] mt-2">
                  Brighten someone's day with a thoughtful gift
                </p>
              </div>
            </div>

            {/* Form Sections */}
            <div className="space-y-4">
              {/* Section 1: Gift Type */}
              <V2FormSection
                title="Choose Gift Type"
                icon="card_giftcard"
                isExpanded={expandedSection === 'gift'}
                onToggle={() => toggleSection('gift')}
                isComplete={!!giftType}
                summary={
                  giftType === 'money'
                    ? 'Cash Gift'
                    : giftType === 'gift-card'
                      ? 'Vendor Gift Card'
                      : giftType === 'flex-card'
                        ? 'Gifthance Flex Card'
                        : undefined
                }>
                <div className="space-y-3">
                  {/* Flex Card - Featured */}
                  <V2ListItemRadio
                    selected={giftType === 'flex-card'}
                    onClick={() => setGiftType('flex-card')}
                    icon="card_giftcard"
                    title="Gifthance Flex"
                    description="Balance card - use anywhere"
                  />
                  <V2ListItemRadio
                    selected={giftType === 'gift-card'}
                    onClick={() => setGiftType('gift-card')}
                    icon="redeem"
                    title="Gift Card"
                    description="From verified vendors"
                  />
                  <V2ListItemRadio
                    selected={giftType === 'money'}
                    onClick={() => setGiftType('money')}
                    icon="payments"
                    title="Money"
                    description="Flexible cash gift"
                  />
                </div>

                {/* Flex Card Amount Selection */}
                {giftType === 'flex-card' && (
                  <div className="mt-4 space-y-3">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 text-white">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="v2-icon">card_giftcard</span>
                        <span className="font-bold">Gifthance Flex Card</span>
                      </div>
                      <p className="text-sm text-white/80">
                        A balance-based gift card that can be used at any vendor, with partial redemptions allowed.
                      </p>
                    </div>

                    <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider ml-1">
                      Select Amount
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {flexCardPresets.map(preset => (
                        <button
                          key={preset}
                          onClick={() => {
                            setFlexCardAmount(preset);
                            setCustomFlexAmount('');
                          }}
                          className={cn(
                            'p-4 rounded-xl font-bold text-lg transition-all',
                            flexCardAmount === preset && !customFlexAmount
                              ? 'bg-[var(--v2-primary)] text-[var(--v2-on-primary)]'
                              : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-high)]',
                          )}>
                          ₦{preset.toLocaleString()}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider ml-1 block mb-2">
                        Or enter custom amount
                      </label>
                      <span className="absolute left-4 bottom-4 text-[var(--v2-on-surface-variant)] font-bold text-lg">
                        ₦
                      </span>
                      <input
                        type="number"
                        placeholder="Custom amount"
                        value={customFlexAmount}
                        onChange={e => {
                          setCustomFlexAmount(e.target.value);
                          setFlexCardAmount(null);
                        }}
                        className="w-full h-14 pl-10 pr-4 bg-[var(--v2-surface-container-low)] border-none rounded-xl text-xl font-bold text-[var(--v2-on-surface)] focus:ring-2 focus:ring-[var(--v2-primary)]/20 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Amount Input for Money */}
                {giftType === 'money' && (
                  <div className="mt-4 space-y-2">
                    <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider ml-1">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)] font-bold text-lg">
                        ₦
                      </span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full h-14 pl-10 pr-4 bg-[var(--v2-surface-container-low)] border-none rounded-xl text-xl font-bold text-[var(--v2-on-surface)] focus:ring-2 focus:ring-[var(--v2-primary)]/20 focus:bg-[var(--v2-surface-container-lowest)] transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Gift Card Selection */}
                {giftType === 'gift-card' && (
                  <div className="mt-4 space-y-3">
                    <div className="relative">
                      <span className="v2-icon absolute left-3 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]">
                        search
                      </span>
                      <input
                        placeholder="Search gift cards..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 bg-[var(--v2-surface-container-low)] border-none rounded-xl text-[var(--v2-on-surface)] focus:ring-2 focus:ring-[var(--v2-primary)]/20 transition-all"
                      />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto space-y-2 v2-no-scrollbar">
                      {vendorGifts
                        .filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()))
                        .map(g => (
                          <button
                            key={g.id}
                            onClick={() => setGiftId(g.id)}
                            className={cn(
                              'w-full p-4 rounded-xl text-left flex items-center justify-between transition-all active:scale-[0.98]',
                              giftId === g.id
                                ? 'bg-[var(--v2-primary)]/10 ring-2 ring-[var(--v2-primary)]'
                                : 'bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container-high)]',
                            )}>
                            <div>
                              <p className="font-bold text-sm text-[var(--v2-on-surface)] capitalize">
                                {g.name}
                              </p>
                              <p className="text-xs text-[var(--v2-on-surface-variant)] capitalize">
                                {g.profiles?.shop_name || 'Vendor'}
                              </p>
                            </div>
                            <span className="font-bold text-[var(--v2-primary)]">
                              ₦{Number(g.price).toLocaleString()}
                            </span>
                          </button>
                        ))}
                      {vendorGifts.length === 0 && (
                        <div className="text-center py-6">
                          <span className="v2-icon text-3xl text-[var(--v2-on-surface-variant)]/40 block mb-2">inventory_2</span>
                          <p className="text-sm text-[var(--v2-on-surface-variant)]">
                            No gift cards available
                          </p>
                          <Link
                            href="/gift-shop"
                            className="text-xs text-[var(--v2-primary)] font-medium mt-1 inline-block">
                            Browse Gift Shop
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </V2FormSection>

              {/* Section 2: Delivery Method */}
              <V2FormSection
                title="Delivery Method"
                icon="send"
                isExpanded={expandedSection === 'delivery'}
                onToggle={() => toggleSection('delivery')}
                isComplete={
                  deliveryType === 'claim-link' ||
                  (deliveryType === 'direct' && deliveryMethod === 'email' && !!recipientEmail) ||
                  (deliveryType === 'direct' && deliveryMethod === 'whatsapp' && isPhoneValid)
                }
                summary={
                  deliveryType === 'claim-link'
                    ? 'Create claim link'
                    : deliveryMethod === 'whatsapp'
                      ? recipientPhone ? `WhatsApp: ${recipientCountryCode} ${recipientPhone}` : 'Send via WhatsApp'
                      : recipientEmail || 'Send to email'
                }>
                <div className="space-y-3">
                  <V2ListItemRadio
                    selected={deliveryType === 'direct'}
                    onClick={() => setDeliveryType('direct')}
                    icon="person"
                    title="Send to Someone"
                    description="Deliver directly via email or WhatsApp"
                  />

                  {deliveryType === 'direct' && (
                    <div className="pl-4 border-l-2 border-[var(--v2-primary)]/20 ml-2 space-y-3">
                      {/* Email/WhatsApp Toggle */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeliveryMethod('email')}
                          className={cn(
                            'flex-1 py-2.5 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all',
                            deliveryMethod === 'email'
                              ? 'bg-[var(--v2-primary)] text-[var(--v2-on-primary)]'
                              : 'bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-highest)]',
                          )}>
                          <span className="v2-icon text-lg">mail</span>
                          Email
                        </button>
                        <button
                          onClick={() => setDeliveryMethod('whatsapp')}
                          className={cn(
                            'flex-1 py-2.5 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all',
                            deliveryMethod === 'whatsapp'
                              ? 'bg-[#25D366] text-white'
                              : 'bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-highest)]',
                          )}>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          WhatsApp
                        </button>
                      </div>

                      {/* Email Input */}
                      {deliveryMethod === 'email' && (
                        <input
                          type="email"
                          placeholder="recipient@email.com"
                          value={recipientEmail}
                          onChange={e => setRecipientEmail(e.target.value)}
                          className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] border-none rounded-xl text-[var(--v2-on-surface)] focus:ring-2 focus:ring-[var(--v2-primary)]/20 transition-all"
                        />
                      )}

                      {/* WhatsApp Phone Input */}
                      {deliveryMethod === 'whatsapp' && (
                        <div className="space-y-2">
                          <CountryPhoneInput
                            value={recipientPhone}
                            countryCode={recipientCountryCode}
                            onChange={(phone, code, isValid) => {
                              setRecipientPhone(phone);
                              setRecipientCountryCode(code);
                              setIsPhoneValid(isValid);
                            }}
                            placeholder="Phone number"
                          />
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#25D366]/10 text-[#25D366]">
                            <span className="v2-icon text-lg">info</span>
                            <span className="text-xs font-medium">
                              +₦{WHATSAPP_FEE.toLocaleString()} WhatsApp delivery fee
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <V2ListItemRadio
                    selected={deliveryType === 'claim-link'}
                    onClick={() => setDeliveryType('claim-link')}
                    icon="link"
                    title="Create Claim Link"
                    description="Share a link for anyone to claim"
                  />
                </div>
              </V2FormSection>

              {/* Section 3: Schedule */}
              <V2FormSection
                title="When to Send"
                icon="schedule"
                isExpanded={expandedSection === 'schedule'}
                onToggle={() => toggleSection('schedule')}
                isComplete={deliveryTime === 'now' || !!scheduledFor}
                summary={deliveryTime === 'now' ? 'Send immediately' : 'Scheduled'}>
                <div className="space-y-3">
                  <V2ListItemRadio
                    selected={deliveryTime === 'now'}
                    onClick={() => setDeliveryTime('now')}
                    icon="bolt"
                    title="Send Now"
                    description="Deliver immediately"
                  />
                  <V2ListItemRadio
                    selected={deliveryTime === 'schedule'}
                    onClick={() => deliveryType !== 'claim-link' && setDeliveryTime('schedule')}
                    icon="event"
                    title="Schedule"
                    description={deliveryType === 'claim-link' ? 'Not available for claim links' : 'Choose date and time'}
                    disabled={deliveryType === 'claim-link'}
                  />

                  {deliveryTime === 'schedule' && (
                    <div className="pl-4 border-l-2 border-[var(--v2-primary)]/20 ml-2">
                      <input
                        type="datetime-local"
                        value={scheduledFor}
                        onChange={e => setScheduledFor(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] border-none rounded-xl text-[var(--v2-on-surface)] focus:ring-2 focus:ring-[var(--v2-primary)]/20 transition-all"
                      />
                    </div>
                  )}
                </div>
              </V2FormSection>

              {/* Section 4: Personal Touch */}
              <V2FormSection
                title="Personal Touch"
                icon="favorite"
                isExpanded={expandedSection === 'personal'}
                onToggle={() => toggleSection('personal')}
                optional
                summary={message ? 'Message added' : 'Add a message'}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider ml-1">
                      Your Name (optional)
                    </label>
                    <input
                      placeholder="E.g. John Doe"
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                      className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] border-none rounded-xl text-[var(--v2-on-surface)] focus:ring-2 focus:ring-[var(--v2-primary)]/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider ml-1">
                      Message (optional)
                    </label>
                    <textarea
                      placeholder="Add a personal note..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-[var(--v2-surface-container-low)] border-none rounded-xl text-[var(--v2-on-surface)] focus:ring-2 focus:ring-[var(--v2-primary)]/20 transition-all resize-none"
                    />
                  </div>

                  <label 
                    className="flex items-center gap-3 p-4 rounded-xl bg-[var(--v2-surface-container-low)] cursor-pointer hover:bg-[var(--v2-surface-container-high)] transition-colors"
                  >
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={isAnonymous} 
                      onChange={(e) => setIsAnonymous(e.target.checked)} 
                    />
                    <div
                      className={cn(
                        'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors',
                        isAnonymous
                          ? 'bg-[var(--v2-primary)] border-[var(--v2-primary)]'
                          : 'border-[var(--v2-outline-variant)]',
                      )}>
                      {isAnonymous && (
                        <span className="v2-icon text-sm text-[var(--v2-on-primary)]">check</span>
                      )}
                    </div>
                    <span className="font-medium text-[var(--v2-on-surface)]">Send anonymously</span>
                  </label>
                </div>
              </V2FormSection>
            </div>
          </div>
        </main>

        {/* Sticky Footer CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-[var(--v2-surface)]/95 backdrop-blur-xl border-t border-[var(--v2-outline-variant)]/10 p-4 pb-safe md:relative md:max-w-xl md:mx-auto md:mt-6 md:bg-transparent md:border-t-0 md:p-0 md:pb-8 z-40">
          <div className="flex items-center gap-4">
            {/* Price Summary */}
            {totalAmount > 0 && (
              <div className="flex-1">
                <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">Total</p>
                <p className="text-2xl font-extrabold v2-headline text-[var(--v2-on-surface)]">
                  ₦{totalAmount.toLocaleString()}
                </p>
                {whatsappDeliveryFee > 0 && (
                  <p className="text-xs text-[#25D366] font-medium">
                    incl. ₦{whatsappDeliveryFee} WhatsApp fee
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleSendGift}
              disabled={!canProceed() || isSubmitting}
              className={cn(
                'flex-1 md:flex-none md:px-12 h-14 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[var(--v2-primary)]/20 active:scale-[0.98] transition-all disabled:opacity-50',
                !totalAmount && 'flex-1',
              )}>
              {isSubmitting ? (
                <>
                  <span className="v2-icon animate-spin">progress_activity</span>
                  Processing...
                </>
              ) : (
                <>
                  Continue to Pay
                  <span className="v2-icon">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </V2RequireAuthUI>
  );
}

// V2 Form Section Component
function V2FormSection({
  title,
  icon,
  isExpanded,
  onToggle,
  isComplete,
  optional,
  summary,
  children,
}: {
  title: string;
  icon: string;
  isExpanded: boolean;
  onToggle: () => void;
  isComplete?: boolean;
  optional?: boolean;
  summary?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden transition-all',
        isExpanded
          ? 'bg-[var(--v2-surface-container-lowest)] ring-2 ring-[var(--v2-primary)]/20'
          : 'bg-[var(--v2-surface-container-low)]',
      )}>
      <button onClick={onToggle} className="w-full p-4 flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              isComplete
                ? 'bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]'
                : 'bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)]',
            )}>
            <span className="v2-icon" style={isComplete ? {fontVariationSettings: "'FILL' 1"} : undefined}>
              {isComplete ? 'check_circle' : icon}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--v2-on-surface)]">{title}</span>
              {optional && (
                <span className="text-[10px] uppercase tracking-wider text-[var(--v2-on-surface-variant)] bg-[var(--v2-surface-container-high)] px-2 py-0.5 rounded-full font-bold">
                  Optional
                </span>
              )}
            </div>
            {!isExpanded && summary && (
              <p className="text-xs text-[var(--v2-on-surface-variant)] mt-0.5">{summary}</p>
            )}
          </div>
        </div>
        <span
          className={cn(
            'v2-icon text-[var(--v2-on-surface-variant)] transition-transform',
            isExpanded && 'rotate-180',
          )}>
          expand_more
        </span>
      </button>

      {isExpanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// V2 List Item Radio Component
function V2ListItemRadio({
  selected,
  onClick,
  icon,
  title,
  description,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-3 p-4 rounded-xl transition-all active:scale-[0.98] min-h-[60px]',
        selected
          ? 'bg-[var(--v2-primary)]/10 ring-2 ring-[var(--v2-primary)]'
          : disabled
            ? 'bg-[var(--v2-surface-container-high)]/50 opacity-50 cursor-not-allowed'
            : 'bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container-high)]',
      )}>
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          selected ? 'bg-[var(--v2-primary)] text-[var(--v2-on-primary)]' : 'bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)]',
        )}>
        <span className="v2-icon">{icon}</span>
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className={cn('font-bold text-sm', selected ? 'text-[var(--v2-primary)]' : 'text-[var(--v2-on-surface)]')}>
          {title}
        </p>
        <p className="text-xs text-[var(--v2-on-surface-variant)] truncate">{description}</p>
      </div>
      <div
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
          selected ? 'border-[var(--v2-primary)] bg-[var(--v2-primary)]' : 'border-[var(--v2-outline-variant)]',
        )}>
        {selected && <div className="w-2 h-2 rounded-full bg-[var(--v2-on-primary)]" />}
      </div>
    </button>
  );
}

// V2 Success Screen
function V2SuccessScreen({slug, isClaimLink, giftType}: {slug: string; isClaimLink: boolean; giftType?: string}) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const claimUrl = giftType === 'flex-card' 
    ? `${origin}/claim/flex/${slug}` 
    : giftType === 'gift-card'
      ? `${origin}/claim/gift-card/${slug}`
      : `${origin}/claim/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(claimUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--v2-background)] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="v2-icon text-4xl text-green-600" style={{fontVariationSettings: "'FILL' 1"}}>
            check_circle
          </span>
        </div>

        <h1 className="text-2xl font-extrabold v2-headline text-[var(--v2-on-surface)] mb-2">
          Gift Created!
        </h1>
        <p className="text-[var(--v2-on-surface-variant)] mb-8">
          {isClaimLink
            ? 'Share the link below for someone to claim this gift'
            : 'The recipient will be notified via email'}
        </p>

        {isClaimLink && (
          <div className="bg-[var(--v2-surface-container-low)] rounded-2xl p-4 mb-8">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--v2-on-surface-variant)] block mb-2">
              Claim Link
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[var(--v2-surface-container-lowest)] rounded-xl px-4 py-3 overflow-hidden">
                <p className="font-mono text-sm text-[var(--v2-on-surface)] truncate">{claimUrl}</p>
              </div>
              <button
                onClick={handleCopy}
                className={cn(
                  'shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] hover:bg-[var(--v2-primary)]/20',
                )}>
                <span className="v2-icon">{copied ? 'check' : 'content_copy'}</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/send-gift" className="flex-1">
            <button
              onClick={() => window.location.reload()}
              className="w-full h-12 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl flex items-center justify-center gap-2">
              <span className="v2-icon">add</span>
              Send Another
            </button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <button className="w-full h-12 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-xl hover:bg-[var(--v2-surface-container-high)] transition-colors">
              Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import Navbar from '@/components/landing/Navbar';
import {RequireAuthUI} from '@/components/guards';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {useIsMobile} from '@/hooks/use-mobile';
import {createClient} from '@/lib/server/supabase/client';
import {cn} from '@/lib/utils';
import {motion, AnimatePresence} from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  Copy,
  CreditCard,
  Gift,
  Link as LinkIcon,
  Loader2,
  Mail,
  Search,
  Send,
  User,
} from 'lucide-react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';

type GiftType = 'money' | 'gift-card' | null;
type DeliveryType = 'direct' | 'claim-link';
type DeliveryTime = 'now' | 'schedule';

export default function SendGiftPage() {
  const isMobile = useIsMobile();
  const router = useRouter();

  // Form State
  const [giftType, setGiftType] = useState<GiftType>(null);
  const [amount, setAmount] = useState('');
  const [giftId, setGiftId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('direct');
  const [recipientEmail, setRecipientEmail] = useState('');
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
        const supabase = createClient();
        const {data} = await supabase
          .from('vendor_gifts')
          .select(
            'id, name, price, profiles!vendor_gifts_vendor_id_fkey(shop_name, display_name)',
          )
          .eq('is_active', true);
        if (data) setVendorGifts(data);
      };
      fetchGifts();
    }
  }, [giftType]);

  // Handle constraints
  useEffect(() => {
    if (deliveryType === 'claim-link' && deliveryTime === 'schedule') {
      setDeliveryTime('now');
    }
  }, [deliveryType, deliveryTime]);

  const selectedGift = vendorGifts.find(g => g.id === giftId);

  const canProceed = () => {
    if (!giftType) return false;
    if (giftType === 'money' && !amount) return false;
    if (giftType === 'gift-card' && !giftId) return false;
    if (deliveryType === 'direct' && !recipientEmail) return false;
    if (deliveryTime === 'schedule' && !scheduledFor) return false;
    return true;
  };

  const handleSendGift = async () => {
    if (!canProceed()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const {
        data: {user},
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const {data: profile} = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();

      let finalGoal = Number(amount);
      if (giftType === 'gift-card' && giftId) {
        const {data: vendorGift} = await supabase
          .from('vendor_gifts')
          .select('price')
          .eq('id', giftId)
          .single();
        if (vendorGift) finalGoal = Number(vendorGift.price);
      }

      const payload = {
        category: 'claimable',
        title: giftType === 'money' ? 'Monetary Gift' : 'Gift Card',
        claimable_type: giftType,
        goal_amount: finalGoal,
        currency: 'NGN',
        claimable_gift_id: giftId || undefined,
        recipient_email: deliveryType === 'direct' ? recipientEmail : null,
        sender_email: profile?.email || user.email,
        sender_name: senderName || undefined,
        is_anonymous: isAnonymous,
        message: message || undefined,
        status: 'active',
        scheduled_for:
          deliveryTime === 'schedule' && scheduledFor
            ? new Date(scheduledFor).toISOString()
            : undefined,
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
    return <SuccessScreen slug={campaignSlug} isClaimLink={deliveryType === 'claim-link'} />;
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <RequireAuthUI header={<Navbar />} redirectPath="/send-gift">
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 md:pt-24 pb-32 md:pb-16">
          <div className="container mx-auto px-4 max-w-xl">
            {/* Mobile Back Button */}
            <button
              onClick={() => router.back()}
              className="md:hidden flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 -ml-1">
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Gift className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <h1 className="text-xl md:text-3xl font-bold font-display text-foreground">
                Send a Gift
              </h1>
              <p className="text-muted-foreground mt-1 md:mt-2 text-sm">
                Brighten someone's day with a thoughtful gift
              </p>
            </div>

            {/* Main Form */}
            <div className="space-y-4">
              {/* Section 1: Gift Type */}
              <FormSection
                title="Choose Gift Type"
                icon={<Gift className="w-4 h-4" />}
                isExpanded={expandedSection === 'gift'}
                onToggle={() => toggleSection('gift')}
                isComplete={!!giftType}
                summary={
                  giftType === 'money'
                    ? 'Money Gift'
                    : giftType === 'gift-card'
                      ? 'Vendor Gift Card'
                      : undefined
                }>
                <div className="space-y-2">
                  <ListItemRadio
                    selected={giftType === 'gift-card'}
                    onClick={() => setGiftType('gift-card')}
                    icon={<Gift className="w-4 h-4" />}
                    title="Gift Card"
                    description="From verified vendors"
                  />
                  <ListItemRadio
                    selected={giftType === 'money'}
                    onClick={() => setGiftType('money')}
                    icon={<CreditCard className="w-4 h-4" />}
                    title="Money"
                    description="Flexible cash gift"
                  />
                </div>

                {/* Amount or Gift Selection */}
                <AnimatePresence mode="wait">
                  {giftType === 'money' && (
                    <motion.div
                      initial={{opacity: 0, height: 0}}
                      animate={{opacity: 1, height: 'auto'}}
                      exit={{opacity: 0, height: 0}}
                      className="mt-4">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Amount
                      </Label>
                      <div className="relative mt-2">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                          ₦
                        </span>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={e => setAmount(e.target.value)}
                          className="pl-10 h-14 text-xl font-semibold"
                        />
                      </div>
                    </motion.div>
                  )}

                  {giftType === 'gift-card' && (
                    <motion.div
                      initial={{opacity: 0, height: 0}}
                      animate={{opacity: 1, height: 'auto'}}
                      exit={{opacity: 0, height: 0}}
                      className="mt-4 space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search gift cards..."
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          className="pl-9 h-11"
                        />
                      </div>
                      <div className="max-h-[200px] overflow-y-auto space-y-2 hide-scrollbar">
                        {vendorGifts
                          .filter(
                            g =>
                              !search ||
                              g.name.toLowerCase().includes(search.toLowerCase()),
                          )
                          .map(g => (
                            <button
                              key={g.id}
                              onClick={() => setGiftId(g.id)}
                              className={cn(
                                'w-full p-3 rounded-xl border-2 text-left flex items-center justify-between transition-all',
                                giftId === g.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/30',
                              )}>
                              <div>
                                <p className="font-semibold text-sm capitalize">
                                  {g.name}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {g.profiles?.shop_name || 'Vendor'}
                                </p>
                              </div>
                              <span className="font-bold text-primary text-sm">
                                ₦{Number(g.price).toLocaleString()}
                              </span>
                            </button>
                          ))}
                        {vendorGifts.length === 0 && (
                          <p className="text-center text-sm text-muted-foreground py-4">
                            Loading gift cards...
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </FormSection>

              {/* Section 2: Delivery Method */}
              <FormSection
                title="Delivery Method"
                icon={<Send className="w-4 h-4" />}
                isExpanded={expandedSection === 'delivery'}
                onToggle={() => toggleSection('delivery')}
                isComplete={
                  deliveryType === 'claim-link' ||
                  (deliveryType === 'direct' && !!recipientEmail)
                }
                summary={
                  deliveryType === 'direct'
                    ? recipientEmail || 'Send to email'
                    : 'Create claim link'
                }>
                <div className="space-y-2">
                  <ListItemRadio
                    selected={deliveryType === 'direct'}
                    onClick={() => setDeliveryType('direct')}
                    icon={<Mail className="w-4 h-4" />}
                    title="Send to Email"
                    description="Deliver directly to recipient"
                  />

                  <AnimatePresence>
                    {deliveryType === 'direct' && (
                      <motion.div
                        initial={{opacity: 0, height: 0}}
                        animate={{opacity: 1, height: 'auto'}}
                        exit={{opacity: 0, height: 0}}
                        className="pl-4 border-l-2 border-primary/20 ml-2">
                        <Input
                          type="email"
                          placeholder="recipient@email.com"
                          value={recipientEmail}
                          onChange={e => setRecipientEmail(e.target.value)}
                          className="h-11"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <ListItemRadio
                    selected={deliveryType === 'claim-link'}
                    onClick={() => setDeliveryType('claim-link')}
                    icon={<LinkIcon className="w-4 h-4" />}
                    title="Create Claim Link"
                    description="Share a link for anyone to claim"
                  />
                </div>
              </FormSection>

              {/* Section 3: Schedule (optional) */}
              <FormSection
                title="When to Send"
                icon={<Calendar className="w-4 h-4" />}
                isExpanded={expandedSection === 'schedule'}
                onToggle={() => toggleSection('schedule')}
                isComplete={deliveryTime === 'now' || !!scheduledFor}
                summary={deliveryTime === 'now' ? 'Send immediately' : 'Scheduled'}>
                <div className="space-y-2">
                  <ListItemRadio
                    selected={deliveryTime === 'now'}
                    onClick={() => setDeliveryTime('now')}
                    icon={<Send className="w-4 h-4" />}
                    title="Send Now"
                    description="Deliver immediately"
                  />
                  <ListItemRadio
                    selected={deliveryTime === 'schedule'}
                    onClick={() =>
                      deliveryType !== 'claim-link' && setDeliveryTime('schedule')
                    }
                    icon={<Calendar className="w-4 h-4" />}
                    title="Schedule"
                    description={
                      deliveryType === 'claim-link'
                        ? 'Not available for claim links'
                        : 'Choose date and time'
                    }
                    disabled={deliveryType === 'claim-link'}
                  />

                  <AnimatePresence>
                    {deliveryTime === 'schedule' && (
                      <motion.div
                        initial={{opacity: 0, height: 0}}
                        animate={{opacity: 1, height: 'auto'}}
                        exit={{opacity: 0, height: 0}}
                        className="pl-4 border-l-2 border-primary/20 ml-2">
                        <Input
                          type="datetime-local"
                          value={scheduledFor}
                          onChange={e => setScheduledFor(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                          className="h-11"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FormSection>

              {/* Section 4: Personal Touch (optional) */}
              <FormSection
                title="Personal Touch"
                icon={<User className="w-4 h-4" />}
                isExpanded={expandedSection === 'personal'}
                onToggle={() => toggleSection('personal')}
                optional
                summary={message ? 'Message added' : 'Add a message'}>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Your Name (optional)
                    </Label>
                    <Input
                      placeholder="E.g. John Doe"
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                      className="h-11 mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Message (optional)
                    </Label>
                    <Textarea
                      placeholder="Add a personal note..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      rows={3}
                      className="mt-2 resize-none"
                    />
                  </div>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={e => setIsAnonymous(e.target.checked)}
                      className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">
                      Send anonymously
                    </span>
                  </label>
                </div>
              </FormSection>
            </div>
          </div>
        </div>

        {/* Sticky Footer CTA */}
        <div
          className={cn(
            'fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border',
            'p-4 pb-safe',
            'md:relative md:max-w-xl md:mx-auto md:mt-6 md:bg-transparent md:border-t-0 md:p-0 md:pb-8',
          )}>
          <div className="flex items-center gap-3">
            {/* Price Summary */}
            {(giftType === 'money' && amount) || selectedGift ? (
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-foreground">
                  ₦
                  {giftType === 'money'
                    ? Number(amount).toLocaleString()
                    : Number(selectedGift?.price || 0).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="flex-1" />
            )}

            <Button
              variant="hero"
              size="xl"
              onClick={handleSendGift}
              disabled={!canProceed() || isSubmitting}
              className="flex-1 md:flex-none md:px-12">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Continue to Pay
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </RequireAuthUI>
  );
}

// Collapsible Form Section Component
function FormSection({
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
  icon: React.ReactNode;
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
        'rounded-2xl border-2 overflow-hidden transition-all',
        isExpanded ? 'border-primary/30 bg-card' : 'border-border bg-card/50',
      )}>
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              isComplete
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground',
            )}>
            {isComplete ? <CheckCircle className="w-4 h-4" /> : icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{title}</span>
              {optional && (
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Optional
                </span>
              )}
            </div>
            {!isExpanded && summary && (
              <p className="text-xs text-muted-foreground mt-0.5">{summary}</p>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-muted-foreground transition-transform',
            isExpanded && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{height: 0, opacity: 0}}
            animate={{height: 'auto', opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={{duration: 0.2}}>
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// List Item with Radio Component
function ListItemRadio({
  selected,
  onClick,
  icon,
  title,
  description,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl transition-all',
        'active:scale-[0.99] min-h-[56px]',
        selected
          ? 'bg-primary/5 border border-primary'
          : disabled
            ? 'bg-muted/20 border border-muted opacity-50 cursor-not-allowed'
            : 'bg-card border border-border hover:border-primary/40',
      )}>
      <div
        className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
          selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
        )}>
        {icon}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className={cn('font-medium text-sm', selected ? 'text-primary' : 'text-foreground')}>
          {title}
        </p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <div
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
          selected ? 'border-primary bg-primary' : 'border-muted-foreground/30',
        )}>
        {selected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
      </div>
    </button>
  );
}

// Success Screen Component
function SuccessScreen({slug, isClaimLink}: {slug: string; isClaimLink: boolean}) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const claimUrl = `${origin}/claim/${slug}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <motion.div
            initial={{scale: 0}}
            animate={{scale: 1}}
            transition={{type: 'spring', duration: 0.5}}
            className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </motion.div>

          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.2}}>
            <h1 className="text-2xl font-bold font-display text-foreground mb-2">
              Gift Created!
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              {isClaimLink
                ? 'Share the link below for someone to claim this gift'
                : 'The recipient will be notified via email'}
            </p>

            {isClaimLink && (
              <div className="bg-card border border-border rounded-2xl p-4 mb-8">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Claim Link
                </Label>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-muted rounded-lg px-3 py-2.5 overflow-hidden">
                    <p className="font-mono text-sm text-foreground truncate">
                      {claimUrl}
                    </p>
                  </div>
                  <Button
                    variant={copied ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      'shrink-0 h-10',
                      copied && 'bg-green-500 hover:bg-green-600',
                    )}
                    onClick={() => {
                      navigator.clipboard.writeText(claimUrl);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}>
                    {copied ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/send-gift" className="flex-1">
                <Button
                  variant="hero"
                  className="w-full h-12"
                  onClick={() => window.location.reload()}>
                  Send Another
                </Button>
              </Link>
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full h-12">
                  Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

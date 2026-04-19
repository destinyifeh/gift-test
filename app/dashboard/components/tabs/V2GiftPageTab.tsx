'use client';

import {useProfile} from '@/hooks/use-profile';
import {updateProfile, uploadBannerImage} from '@/lib/server/actions/auth';
import {verifyPaymentAndUpgrade} from '@/lib/server/actions/transactions';
import {useUserStore} from '@/lib/store/useUserStore';
import {useQueryClient} from '@tanstack/react-query';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {formatCurrency} from '@/lib/utils/currency';

interface V2GiftPageTabProps {
  creatorPlan: 'free' | 'pro';
  setCreatorPlan: (plan: 'free' | 'pro') => void;
}

interface GiftTier {
  id: string;
  emoji: string;
  label: string;
  amount: number;
  enabled: boolean;
}

const DEFAULT_GIFT_TIERS: GiftTier[] = [
  {id: 'coffee', emoji: '☕', label: 'Coffee', amount: 500, enabled: true},
  {id: 'drink', emoji: '🥤', label: 'Drink', amount: 1000, enabled: true},
  {id: 'meal', emoji: '🍽️', label: 'Meal', amount: 2500, enabled: true},
  {id: 'treat', emoji: '🎉', label: 'Treat', amount: 5000, enabled: false},
  {id: 'lunch', emoji: '🍱', label: 'Lunch', amount: 3000, enabled: false},
];

const EMOJI_OPTIONS = ['☕', '🥤', '🍽️', '🎉', '🍱', '🎁', '💝', '🌟', '🎊', '🍕', '🍔', '🧁', '🍰', '🎂', '💐', '🎵', '📚', '🎮'];

export function V2GiftPageTab({creatorPlan, setCreatorPlan}: V2GiftPageTabProps) {
  const user = useUserStore(state => state.user);
  const {data: profile, isLoading} = useProfile();
  const queryClient = useQueryClient();

  const [bio, setBio] = useState('');
  const [giftTiers, setGiftTiers] = useState<GiftTier[]>(DEFAULT_GIFT_TIERS);
  const [acceptMoney, setAcceptMoney] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [showSupportTotal, setShowSupportTotal] = useState(false);
  const [showAmountOnSupport, setShowAmountOnSupport] = useState(true);
  const [dmNotifications, setDmNotifications] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTier, setSelectedTier] = useState(0);
  const [showAddTierModal, setShowAddTierModal] = useState(false);
  const [editingTier, setEditingTier] = useState<GiftTier | null>(null);
  const [newTier, setNewTier] = useState<Omit<GiftTier, 'id'>>({
    emoji: '🎁',
    label: '',
    amount: 1000,
    enabled: true,
  });

  // Pro features
  const [proBannerUrl, setProBannerUrl] = useState('');
  const [proThankYouMessage, setProThankYouMessage] = useState('Thank you for your support! 🎉');
  const [proRemoveBranding, setProRemoveBranding] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const currency = (profile as any)?.currency || 'NGN';

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');

      const theme = profile.theme_settings || {};
      setAcceptMoney(theme.acceptMoney ?? true);
      setPublicProfile(theme.publicProfile ?? true);
      setShowSupportTotal(theme.showSupportTotal ?? false);
      setShowAmountOnSupport(theme.showAmountOnSupport ?? true);
      setDmNotifications(theme.dmNotifications ?? false);

      // Pro features
      setProBannerUrl(theme.proBannerUrl || '');
      setProThankYouMessage(theme.proThankYouMessage || 'Thank you for your support! 🎉');
      setProRemoveBranding(theme.proRemoveBranding ?? false);

      // Load gift tiers from profile
      if (theme.giftTiers?.length) {
        setGiftTiers(theme.giftTiers);
      }
    }
  }, [profile]);

  const toggleGiftTier = (id: string) => {
    setGiftTiers(prev => {
      const isEnabling = prev.find(t => t.id === id)?.enabled === false;
      const currentlyEnabledCount = prev.filter(t => t.enabled).length;

      if (isEnabling && currentlyEnabledCount >= 3) {
        toast.error('Maximum 3 active tiers allowed', {
          description: 'Please turn off an active tier to enable this one.',
          duration: 5000,
        });
        return prev;
      }

      return prev.map(tier => (tier.id === id ? {...tier, enabled: !tier.enabled} : tier));
    });
  };

  const handleAddTier = () => {
    if (!newTier.label.trim()) {
      toast.error('Please enter a label for the gift tier');
      return;
    }
    if (newTier.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    const currentlyEnabledCount = giftTiers.filter(t => t.enabled).length;
    const shouldEnable = currentlyEnabledCount < 3;

    if (!shouldEnable) {
      toast.info('Maximum 3 active tiers reached', {
        description: 'New tier added but kept inactive. Turn off another tier to enable it.',
      });
    } else {
      toast.success('Gift tier added!');
    }

    const tier: GiftTier = {
      ...newTier,
      id: `custom-${Date.now()}`,
      enabled: shouldEnable,
    };

    setGiftTiers(prev => [...prev, tier]);
    setNewTier({emoji: '🎁', label: '', amount: 1000, enabled: true});
    setShowAddTierModal(false);
  };

  const handleUpdateTier = () => {
    if (!editingTier) return;

    setGiftTiers(prev =>
      prev.map(tier => (tier.id === editingTier.id ? editingTier : tier))
    );
    setEditingTier(null);
    toast.success('Gift tier updated!');
  };

  const handleDeleteTier = (id: string) => {
    setGiftTiers(prev => prev.filter(tier => tier.id !== id));
    toast.success('Gift tier removed');
  };

  const enabledTiers = giftTiers.filter(t => t.enabled);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Extract amounts from enabled tiers for backward compatibility
      const amounts = enabledTiers.map(t => t.amount);

      const result = await updateProfile({
        bio,
        suggested_amounts: amounts,
        theme_settings: {
          ...profile?.theme_settings,
          acceptMoney,
          publicProfile,
          showSupportTotal,
          showAmountOnSupport,
          dmNotifications,
          giftTiers,
          // Pro features
          proBannerUrl,
          proThankYouMessage,
          proRemoveBranding,
        },
      });

      if (result.success) {
        toast.success('Settings saved!');
        queryClient.invalidateQueries({queryKey: ['profile']});
        queryClient.invalidateQueries({queryKey: ['profile', user?.username]});
      } else {
        toast.error(result.error || 'Failed to save settings');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user?.email) {
      toast.error('User email not found. Please log in again.');
      return;
    }

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey) {
      toast.error('Payment system is not configured. Please contact support.');
      return;
    }

    try {
      const {default: PaystackPop} = await import('@paystack/inline-js');
      const paystack = new (PaystackPop as any)();
      paystack.newTransaction({
        key: paystackKey,
        email: user.email,
        amount: 10000 * 100,
        onSuccess: async (transaction: any) => {
          setIsSaving(true);
          try {
            const result = await verifyPaymentAndUpgrade(transaction.reference);
            if (result.success) {
              toast.success('Successfully upgraded to Pro!');
              setCreatorPlan('pro');
              await queryClient.invalidateQueries({queryKey: ['profile']});
            } else {
              toast.error(result.error || 'Upgrade failed after payment.');
            }
          } catch (error: any) {
            toast.error(error.message || 'An error occurred during upgrade.');
          } finally {
            setIsSaving(false);
          }
        },
        onCancel: () => toast.info('Payment cancelled.'),
        onError: (error: any) => {
          console.error('Paystack error:', error);
          toast.error('Payment failed. Please try again.');
        },
      });
    } catch (error: any) {
      console.error('Failed to load payment system:', error);
      toast.error('Failed to load payment system. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Desktop: Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Settings Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Desktop Header */}
          <div className="hidden md:block">
            <h1 className="text-4xl font-extrabold v2-headline text-[var(--v2-on-surface)] tracking-tight mb-2">
              Creator Profile
            </h1>
            <p className="text-[var(--v2-on-surface-variant)] max-w-2xl">
              Refine your public persona and configure how your audience interacts with your
              creative journey.
            </p>
          </div>

          {/* Mobile: Hero Profile Section */}
          <div className="md:hidden">
            <section className="relative h-48 rounded-3xl overflow-hidden mb-12">
              {proBannerUrl ? (
                <img src={proBannerUrl} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--v2-surface-container-high)] to-[var(--v2-surface-container-lowest)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute -bottom-8 left-6 flex items-end gap-4">
                <div className="w-24 h-24 rounded-2xl border-4 border-[var(--v2-surface)] overflow-hidden bg-white shadow-lg">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--v2-primary)]/10">
                      <span className="text-3xl font-bold text-[var(--v2-primary)] capitalize">
                        {user?.display_name?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <h2 className="v2-headline font-bold text-xl text-white">
                    {user?.display_name || 'Your Name'}
                  </h2>
                  <p className="text-sm text-white/90">@{user?.username || 'username'}</p>
                </div>
              </div>
            </section>

            {/* Mobile: View Public Page Link */}
            <Link
            href={`/u/${user?.username || 'username'}`}
              className="flex items-center justify-between p-4 bg-[var(--v2-primary)]/10 rounded-2xl mb-4">
              <div className="flex items-center gap-3">
                <span className="v2-icon text-[var(--v2-primary)]">open_in_new</span>
                <span className="font-bold text-[var(--v2-primary)]">View Public Page</span>
              </div>
              <span className="v2-icon text-[var(--v2-primary)]">chevron_right</span>
            </Link>

            {/* Mobile: Pro Upgrade Banner */}
            {creatorPlan !== 'pro' && (
              <div className="p-5 rounded-2xl v2-hero-gradient relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="relative z-10 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="v2-icon text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>
                      workspace_premium
                    </span>
                    <h3 className="font-bold text-lg v2-headline">Upgrade to Pro</h3>
                  </div>
                  <p className="text-white/80 text-sm mb-4">
                    Custom themes, remove branding, priority support and more!
                  </p>
                  <button
                    onClick={handleUpgrade}
                    disabled={isSaving}
                    className="w-full h-12 bg-white text-[var(--v2-primary)] font-bold rounded-xl transition-transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                    <span className="v2-icon">bolt</span>
                    Upgrade for ₦10,000/year
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Bio Section */}
          <section className="bg-[var(--v2-surface-container-lowest)] p-5 md:p-8 rounded-[2rem] space-y-4 md:space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="v2-icon text-[var(--v2-primary)]">face</span>
              <h2 className="v2-headline text-lg md:text-xl font-bold text-[var(--v2-on-surface)]">
                Public Identity
              </h2>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs md:text-sm font-semibold text-[var(--v2-on-surface-variant)] mb-2 block">
                  Profile Bio
                </span>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value.slice(0, 500))}
                  placeholder="Tell your story..."
                  className="w-full bg-[var(--v2-surface-container-low)] border-none rounded-xl md:rounded-2xl p-4 focus:ring-2 focus:ring-[var(--v2-primary)] focus:bg-[var(--v2-surface-container-lowest)] transition-all text-[var(--v2-on-surface)] placeholder-[var(--v2-on-surface-variant)]/50 min-h-[120px] md:min-h-[128px] resize-none"
                />
                <div className="flex justify-end mt-1 px-1">
                  <p className="text-[10px] text-[var(--v2-on-surface-variant)]">
                    {bio.length} / 500 characters
                  </p>
                </div>
              </label>

            </div>
          </section>

          {/* Gift Tiers Section - Combined Gift Options + Support Tiers */}
          <section className="bg-[var(--v2-surface-container-lowest)] md:bg-[var(--v2-surface-container-low)] p-5 md:p-8 rounded-[2rem] space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <span className="v2-icon text-[var(--v2-primary)]">card_giftcard</span>
                <div>
                  <h2 className="v2-headline text-lg md:text-xl font-bold text-[var(--v2-on-surface)]">
                    Gift Tiers
                  </h2>
                  <p className="text-xs text-[var(--v2-on-surface-variant)] hidden md:block">
                    Configure support options your audience can send you
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddTierModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] font-bold text-sm rounded-xl hover:bg-[var(--v2-primary)]/20 transition-colors">
                <span className="v2-icon text-lg">add</span>
                <span className="hidden md:inline">Add Tier</span>
              </button>
            </div>

            {/* Active Tiers Preview */}
            {enabledTiers.length > 0 && (
              <div className="p-4 rounded-2xl bg-[var(--v2-primary)]/5 border border-[var(--v2-primary)]/10">
                <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-3">
                  Active on your page ({enabledTiers.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {enabledTiers.map(tier => (
                    <div
                      key={tier.id}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-[var(--v2-surface-container-lowest)] rounded-xl">
                      <span className="text-lg">{tier.emoji}</span>
                      <span className="font-medium text-[var(--v2-on-surface)]">{tier.label}</span>
                      <span className="text-[var(--v2-on-surface-variant)]">—</span>
                      <span className="font-bold text-[var(--v2-primary)]">
                        {formatCurrency(tier.amount, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Gift Tiers List */}
            <div className="space-y-2">
              {giftTiers.map(tier => (
                <div
                  key={tier.id}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                    tier.enabled
                      ? 'bg-[var(--v2-surface-container-lowest)] md:bg-[var(--v2-surface-container-lowest)]'
                      : 'bg-[var(--v2-surface-container-high)]/50 opacity-60'
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tier.emoji}</span>
                    <div>
                      <p className="font-bold text-[var(--v2-on-surface)]">{tier.label}</p>
                      <p className="text-sm font-semibold text-[var(--v2-primary)]">
                        {formatCurrency(tier.amount, currency)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => setEditingTier(tier)}
                      className="w-9 h-9 rounded-xl bg-[var(--v2-surface-container-high)] flex items-center justify-center hover:bg-[var(--v2-surface-container-highest)] transition-colors">
                      <span className="v2-icon text-[var(--v2-on-surface-variant)] text-lg">edit</span>
                    </button>
                    {/* Toggle Button */}
                    <button
                      onClick={() => toggleGiftTier(tier.id)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        tier.enabled ? 'bg-[var(--v2-primary)]' : 'bg-[var(--v2-outline-variant)]/30'
                      }`}>
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                          tier.enabled ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Custom Tier Button */}
              <button
                onClick={() => setShowAddTierModal(true)}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-[var(--v2-outline-variant)]/30 hover:border-[var(--v2-primary)]/40 hover:bg-[var(--v2-primary)]/5 transition-all">
                <span className="v2-icon text-[var(--v2-on-surface-variant)]/60">add_circle</span>
                <span className="font-semibold text-[var(--v2-on-surface-variant)]/60">Add Custom Tier</span>
              </button>
            </div>
          </section>

          {/* Visibility Settings */}
          <section className="bg-[var(--v2-surface-container-lowest)] md:bg-[var(--v2-surface-container-low)] rounded-[2rem] overflow-hidden">
            <div className="hidden md:flex items-center gap-4 p-8 pb-0">
              <span className="v2-icon text-[var(--v2-primary)]">visibility</span>
              <h2 className="v2-headline text-xl font-bold text-[var(--v2-on-surface)]">
                Visibility Settings
              </h2>
            </div>
            <div className="p-5 md:p-8 space-y-4 md:space-y-6">
              {/* Public Profile */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--v2-surface-container-highest)] flex items-center justify-center">
                    <span className="v2-icon text-[var(--v2-primary)]">visibility</span>
                  </div>
                  <div>
                    <p className="font-bold text-[var(--v2-on-surface)]">Public Profile</p>
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">
                      Allow anyone to find and support you.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPublicProfile(!publicProfile)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    publicProfile ? 'bg-[var(--v2-primary)]' : 'bg-[var(--v2-outline-variant)]/30'
                  }`}>
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                      publicProfile ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Show Support Total - Both Mobile and Desktop */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--v2-surface-container-highest)] flex items-center justify-center">
                    <span className="v2-icon text-[var(--v2-primary)]">payments</span>
                  </div>
                  <div>
                    <p className="font-bold text-[var(--v2-on-surface)]">Show Support Total</p>
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">
                      Display total contributions on your profile.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSupportTotal(!showSupportTotal)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    showSupportTotal ? 'bg-[var(--v2-primary)]' : 'bg-[var(--v2-outline-variant)]/30'
                  }`}>
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                      showSupportTotal ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Show Amount on Support */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--v2-surface-container-highest)] flex items-center justify-center">
                    <span className="v2-icon text-[var(--v2-primary)]">attach_money</span>
                  </div>
                  <div>
                    <p className="font-bold text-[var(--v2-on-surface)]">Show Amount on Support</p>
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">
                      Display gift amounts in supporter feed
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAmountOnSupport(!showAmountOnSupport)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    showAmountOnSupport ? 'bg-[var(--v2-primary)]' : 'bg-[var(--v2-outline-variant)]/30'
                  }`}>
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                      showAmountOnSupport ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

            </div>
          </section>

          {/* Pro Features Section */}
          {creatorPlan === 'pro' && (
            <section className="bg-gradient-to-br from-[var(--v2-primary)]/5 to-[var(--v2-tertiary)]/5 border border-[var(--v2-primary)]/20 p-5 md:p-8 rounded-[2rem] space-y-4 md:space-y-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--v2-primary)] flex items-center justify-center">
                  <span className="v2-icon text-white" style={{fontVariationSettings: "'FILL' 1"}}>workspace_premium</span>
                </div>
                <div>
                  <h2 className="v2-headline text-lg md:text-xl font-bold text-[var(--v2-on-surface)]">
                    Pro Features
                  </h2>
                  <p className="text-xs text-[var(--v2-on-surface-variant)]">
                    Customize your gift page experience
                  </p>
                </div>
              </div>

              {/* Custom Banner */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-[var(--v2-on-surface)]">
                  Custom Banner Image
                </label>
                <div className="relative">
                  {proBannerUrl ? (
                    <div className="relative rounded-2xl overflow-hidden">
                      <img src={proBannerUrl} alt="Banner" className="w-full h-32 object-cover" />
                      <button
                        onClick={() => setProBannerUrl('')}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                        <span className="v2-icon text-sm">close</span>
                      </button>
                    </div>
                  ) : (
                    <label className={`flex flex-col items-center justify-center h-32 rounded-2xl border-2 border-dashed border-[var(--v2-outline-variant)]/30 bg-[var(--v2-surface-container-low)] cursor-pointer hover:border-[var(--v2-primary)]/40 hover:bg-[var(--v2-primary)]/5 transition-all ${isUploadingBanner ? 'opacity-50 pointer-events-none' : ''}`}>
                      {isUploadingBanner ? (
                        <>
                          <span className="v2-icon text-3xl text-[var(--v2-primary)] animate-spin mb-2">progress_activity</span>
                          <span className="text-sm font-medium text-[var(--v2-on-surface-variant)]">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <span className="v2-icon text-3xl text-[var(--v2-on-surface-variant)]/40 mb-2">add_photo_alternate</span>
                          <span className="text-sm font-medium text-[var(--v2-on-surface-variant)]">Upload Banner (1200x400 recommended)</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIsUploadingBanner(true);
                            try {
                              const formData = new FormData();
                              formData.append('file', file);
                              const result = await uploadBannerImage(formData);
                              if (result.success && result.url) {
                                setProBannerUrl(result.url);
                                toast.success('Banner uploaded!');
                              } else {
                                toast.error(result.error || 'Failed to upload banner');
                              }
                            } catch {
                              toast.error('Failed to upload banner');
                            } finally {
                              setIsUploadingBanner(false);
                            }
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Thank You Message */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-[var(--v2-on-surface)]">
                  Custom Thank You Message
                </label>
                <textarea
                  value={proThankYouMessage}
                  onChange={e => setProThankYouMessage(e.target.value)}
                  placeholder="Thank you for your support! 🎉"
                  rows={3}
                  className="w-full px-4 py-3 bg-[var(--v2-surface-container-lowest)] text-[var(--v2-on-surface)] rounded-xl border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] focus:outline-none transition-colors resize-none"
                />
                <p className="text-xs text-[var(--v2-on-surface-variant)]">
                  This message will be shown to supporters after they send a gift
                </p>
              </div>

              {/* Remove Branding */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--v2-surface-container-lowest)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center">
                    <span className="v2-icon text-[var(--v2-primary)]">visibility_off</span>
                  </div>
                  <div>
                    <p className="font-bold text-[var(--v2-on-surface)]">Remove Gifthance Branding</p>
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">
                      Hide "Powered by Gifthance" from your page
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setProRemoveBranding(!proRemoveBranding)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    proRemoveBranding ? 'bg-[var(--v2-primary)]' : 'bg-[var(--v2-outline-variant)]/30'
                  }`}>
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                      proRemoveBranding ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* DM Notifications */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--v2-surface-container-lowest)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center">
                    <span className="v2-icon text-[var(--v2-primary)]">mail</span>
                  </div>
                  <div>
                    <p className="font-bold text-[var(--v2-on-surface)]">DM Notifications</p>
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">
                      Email alerts for new supporter messages
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDmNotifications(!dmNotifications)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    dmNotifications ? 'bg-[var(--v2-primary)]' : 'bg-[var(--v2-outline-variant)]/30'
                  }`}>
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                      dmNotifications ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </section>
          )}

          {/* Save Button - Mobile Sticky */}
          <div className="md:hidden sticky bottom-20 pt-4 pb-4 bg-[var(--v2-background)]">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full h-14 v2-hero-gradient text-[var(--v2-on-primary)] v2-headline font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[var(--v2-primary)]/20 transition-transform active:scale-[0.98] disabled:opacity-50">
              {isSaving ? (
                <span className="v2-icon animate-spin">progress_activity</span>
              ) : (
                <>
                  Save Changes
                  <span className="v2-icon">check_circle</span>
                </>
              )}
            </button>
          </div>

          {/* Desktop: Action Buttons */}
          <div className="hidden md:flex justify-end gap-4">
            <button className="px-8 py-4 bg-[var(--v2-surface-container-high)] text-[var(--v2-primary)] font-bold rounded-2xl hover:bg-[var(--v2-surface-container-highest)] transition-colors">
              Discard Changes
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-10 py-4 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
              {isSaving ? (
                <span className="v2-icon animate-spin">progress_activity</span>
              ) : (
                'Save Profile'
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Preview Card - Desktop Only */}
        <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-24">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--v2-primary)]/20 to-[var(--v2-tertiary)]/20 rounded-[3rem] blur opacity-50" />
            <div className="relative bg-[var(--v2-surface-container-lowest)] rounded-[2.5rem] overflow-hidden shadow-2xl">
              {/* Preview Header */}
              <div className="h-48 relative overflow-hidden">
                {proBannerUrl ? (
                  <img src={proBannerUrl} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--v2-surface-container-high)] to-[var(--v2-surface-container-lowest)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-bold tracking-widest uppercase">
                  Live Preview
                </div>
              </div>
              {/* Profile Content */}
              <div className="px-8 pb-10 -mt-12 relative text-center">
                <div className="w-24 h-24 rounded-full border-4 border-[var(--v2-surface-container-lowest)] overflow-hidden mx-auto shadow-lg mb-4">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--v2-primary)]/10">
                      <span className="text-3xl font-bold text-[var(--v2-primary)] capitalize">
                        {user?.display_name?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="v2-headline text-2xl font-black text-[var(--v2-on-surface)]">
                  {user?.display_name || 'Your Name'}
                </h3>
                <p className="text-[var(--v2-on-surface-variant)] font-medium mb-6">
                  Visual Storyteller & Digital Nomad
                </p>
                <p className="text-sm text-[var(--v2-on-surface)]/80 leading-relaxed mb-6 italic">
                  "{bio || 'Your bio will appear here...'}"
                </p>
                {/* Gift Tiers Preview */}
                <div className="space-y-2 mb-6">
                  {enabledTiers.slice(0, 4).map((tier, i) => (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTier(i)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                        selectedTier === i
                          ? 'bg-[var(--v2-primary)] text-white'
                          : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-high)]'
                      }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{tier.emoji}</span>
                        <span>{tier.label}</span>
                      </div>
                      <span className={selectedTier === i ? 'text-white' : 'text-[var(--v2-primary)]'}>
                        {formatCurrency(tier.amount, currency)}
                      </span>
                    </button>
                  ))}
                  {enabledTiers.length < 4 && (
                    <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)] transition-all">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">✨</span>
                        <span>Custom Amount</span>
                      </div>
                      <span className="v2-icon text-sm">chevron_right</span>
                    </button>
                  )}
                </div>
                <button className="w-full py-4 bg-[var(--v2-on-surface)] text-[var(--v2-surface)] rounded-2xl font-bold hover:bg-[var(--v2-primary)] transition-colors">
                  Support {user?.display_name?.split(' ')[0] || 'Creator'}
                </button>
              </div>
            </div>
          </div>

          {/* Preview Link */}
          <Link
            href={`/u/${user?.username || 'username'}`}
            className="flex items-center justify-center gap-2 mt-4 p-4 rounded-2xl bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] font-bold hover:bg-[var(--v2-primary)]/20 transition-colors">
            <span className="v2-icon">open_in_new</span>
            View Live Page
          </Link>

          {/* Pro Upgrade Banner */}
          {creatorPlan !== 'pro' && (
            <div className="mt-4 p-5 rounded-2xl v2-hero-gradient relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="v2-icon text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>
                    workspace_premium
                  </span>
                  <h3 className="font-bold text-lg v2-headline">Upgrade to Pro</h3>
                </div>
                <p className="text-white/80 text-sm mb-4">
                  Custom themes, remove branding, and more!
                </p>
                <button
                  onClick={handleUpgrade}
                  disabled={isSaving}
                  className="px-6 h-10 bg-white text-[var(--v2-primary)] font-bold rounded-xl transition-transform active:scale-[0.98] disabled:opacity-50">
                  ₦10,000/year
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Gift Tier Modal */}
      <ResponsiveModal open={showAddTierModal} onOpenChange={setShowAddTierModal}>
        <ResponsiveModalContent className="bg-[var(--v2-surface)] md:max-w-[420px]">
          <ResponsiveModalHeader className="border-b border-[var(--v2-outline-variant)]/10">
            <ResponsiveModalTitle className="text-xl font-bold v2-headline text-[var(--v2-on-surface)]">
              Add Gift Tier
            </ResponsiveModalTitle>
          </ResponsiveModalHeader>

          <div className="p-4 space-y-5 overflow-y-auto max-h-[70vh]">
            {/* Emoji Selector */}
            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface)] mb-2">
                Choose an Emoji
              </label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setNewTier(prev => ({...prev, emoji}))}
                    className={`w-10 h-10 text-xl rounded-xl flex items-center justify-center transition-all ${
                      newTier.emoji === emoji
                        ? 'bg-[var(--v2-primary)] scale-110'
                        : 'bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container-high)]'
                    }`}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Label Input */}
            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface)] mb-2">
                Label
              </label>
              <input
                type="text"
                value={newTier.label}
                onChange={e => setNewTier(prev => ({...prev, label: e.target.value}))}
                placeholder="e.g. Coffee, Lunch, Treat"
                className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] rounded-xl border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] focus:outline-none transition-colors"
              />
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface)] mb-2">
                Amount ({currency})
              </label>
              <input
                type="number"
                value={newTier.amount}
                onChange={e => setNewTier(prev => ({...prev, amount: parseInt(e.target.value) || 0}))}
                placeholder="Enter amount"
                className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] rounded-xl border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] focus:outline-none transition-colors"
              />
            </div>

            {/* Preview */}
            <div className="p-4 rounded-2xl bg-[var(--v2-primary)]/5 border border-[var(--v2-primary)]/10">
              <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-2">
                Preview
              </p>
              <div className="flex items-center gap-3 p-3 bg-[var(--v2-surface-container-lowest)] rounded-xl">
                <span className="text-2xl">{newTier.emoji}</span>
                <span className="font-bold text-[var(--v2-on-surface)]">
                  {newTier.label || 'Label'}
                </span>
                <span className="text-[var(--v2-on-surface-variant)]">—</span>
                <span className="font-bold text-[var(--v2-primary)]">
                  {formatCurrency(newTier.amount, currency)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[var(--v2-outline-variant)]/10 space-y-3">
              <button
                onClick={handleAddTier}
                className="w-full h-12 v2-hero-gradient text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg">
                <span className="v2-icon">add</span>
                Add Gift Tier
              </button>
              <button
                onClick={() => setShowAddTierModal(false)}
                className="w-full h-12 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-2xl hover:bg-[var(--v2-surface-container-high)] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Edit Gift Tier Modal */}
      <ResponsiveModal open={!!editingTier} onOpenChange={open => !open && setEditingTier(null)}>
        <ResponsiveModalContent className="bg-[var(--v2-surface)] md:max-w-[420px]">
          <ResponsiveModalHeader className="border-b border-[var(--v2-outline-variant)]/10">
            <ResponsiveModalTitle className="text-xl font-bold v2-headline text-[var(--v2-on-surface)]">
              Edit Gift Tier
            </ResponsiveModalTitle>
          </ResponsiveModalHeader>

          {editingTier && (
            <div className="p-4 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* Emoji Selector */}
              <div>
                <label className="block text-sm font-bold text-[var(--v2-on-surface)] mb-2">
                  Choose an Emoji
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setEditingTier(prev => prev ? {...prev, emoji} : null)}
                      className={`w-10 h-10 text-xl rounded-xl flex items-center justify-center transition-all ${
                        editingTier.emoji === emoji
                          ? 'bg-[var(--v2-primary)] scale-110'
                          : 'bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container-high)]'
                      }`}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Label Input */}
              <div>
                <label className="block text-sm font-bold text-[var(--v2-on-surface)] mb-2">
                  Label
                </label>
                <input
                  type="text"
                  value={editingTier.label}
                  onChange={e => setEditingTier(prev => prev ? {...prev, label: e.target.value} : null)}
                  placeholder="e.g. Coffee, Lunch, Treat"
                  className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] rounded-xl border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] focus:outline-none transition-colors"
                />
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-bold text-[var(--v2-on-surface)] mb-2">
                  Amount ({currency})
                </label>
                <input
                  type="number"
                  value={editingTier.amount}
                  onChange={e => setEditingTier(prev => prev ? {...prev, amount: parseInt(e.target.value) || 0} : null)}
                  placeholder="Enter amount"
                  className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] rounded-xl border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] focus:outline-none transition-colors"
                />
              </div>

              {/* Preview */}
              <div className="p-4 rounded-2xl bg-[var(--v2-primary)]/5 border border-[var(--v2-primary)]/10">
                <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-2">
                  Preview
                </p>
                <div className="flex items-center gap-3 p-3 bg-[var(--v2-surface-container-lowest)] rounded-xl">
                  <span className="text-2xl">{editingTier.emoji}</span>
                  <span className="font-bold text-[var(--v2-on-surface)]">
                    {editingTier.label || 'Label'}
                  </span>
                  <span className="text-[var(--v2-on-surface-variant)]">—</span>
                  <span className="font-bold text-[var(--v2-primary)]">
                    {formatCurrency(editingTier.amount, currency)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[var(--v2-outline-variant)]/10 space-y-3">
                <button
                  onClick={handleUpdateTier}
                  className="w-full h-12 v2-hero-gradient text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg">
                  <span className="v2-icon">check</span>
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    handleDeleteTier(editingTier.id);
                    setEditingTier(null);
                  }}
                  className="w-full h-12 bg-[var(--v2-error-container)] text-[var(--v2-on-error-container)] font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                  <span className="v2-icon">delete</span>
                  Delete Tier
                </button>
                <button
                  onClick={() => setEditingTier(null)}
                  className="w-full h-12 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-2xl hover:bg-[var(--v2-surface-container-high)] transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}

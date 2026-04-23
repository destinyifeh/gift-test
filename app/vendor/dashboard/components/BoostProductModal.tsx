'use client';

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {VisuallyHidden} from '@/components/ui/visually-hidden';
import {useVendorProducts} from '@/hooks/use-vendor';
import {useProfile} from '@/hooks/use-profile';
import {getCurrencyByCountry} from '@/lib/currencies';
import {formatCurrency} from '@/lib/utils/currency';
import {cn} from '@/lib/utils';
import React, {useState, useEffect} from 'react';
import {toast} from 'sonner';
import {useQueryClient} from '@tanstack/react-query';
import api from '@/lib/api-client';

interface BoostProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  preselectedProductId?: number | null;
}

type AdType = 'featured' | 'sponsored';
type Step = 'product' | 'type' | 'featured_slots' | 'featured_duration' | 'sponsored_budget' | 'preview';

interface SlotInfo {
  slotNumber: number;
  available: boolean;
  booking: any;
}

interface AdConfig {
  featured: { pricePerDay: number; maxSlots: number };
  sponsored: { minBudget: number; costPerClick: number };
}

export function BoostProductModal({open, onOpenChange, onSuccess, preselectedProductId}: BoostProductModalProps) {
  const {data: profile} = useProfile();
  const queryClient = useQueryClient();
  const {data: products = [], isLoading: productsLoading} = useVendorProducts(profile?.id, true);

  const hasPreselection = preselectedProductId != null;
  const [step, setStep] = useState<Step>(hasPreselection ? 'type' : 'product');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(preselectedProductId ?? null);
  const [selectedAdType, setSelectedAdType] = useState<AdType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Featured state
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [adConfig, setAdConfig] = useState<AdConfig | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Sponsored state
  const [budget, setBudget] = useState<string>('');
  const [runMode, setRunMode] = useState<'unlimited' | 'duration'>('unlimited');
  const [sponsoredDuration, setSponsoredDuration] = useState<number>(5);

  const currency = getCurrencyByCountry(profile?.country || 'Nigeria');

  // Load ad config and slots when selecting featured
  const loadSlotsAndConfig = async () => {
    setSlotsLoading(true);
    try {
      // Get vendor country code
      const countryConfig = await api.get('/country-configs');
      const countries = countryConfig.data?.data || countryConfig.data || [];
      const vendorCountry = countries.find((c: any) =>
        c.countryName?.toLowerCase() === profile?.country?.toLowerCase()
      );
      const countryCode = vendorCountry?.countryCode || 'NG';

      const [slotsRes, configRes] = await Promise.all([
        api.get(`/ads/featured/slots?country=${countryCode}`),
        api.get(`/ads/config?country=${countryCode}`),
      ]);
      const slotsData = slotsRes.data?.data || slotsRes.data;
      setSlots(slotsData?.slots || []);
      const cfg = configRes.data?.data || configRes.data;
      setAdConfig(cfg);
    } catch {
      toast.error('Failed to load ad configuration');
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (open && preselectedProductId != null) {
      setSelectedProductId(preselectedProductId);
      setStep('type');
    }
  }, [open, preselectedProductId]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setStep(preselectedProductId != null ? 'type' : 'product');
      setSelectedProductId(preselectedProductId ?? null);
      setSelectedAdType(null);
      setSelectedSlot(null);
      setDurationDays(7);
      setBudget('');
      setRunMode('unlimited');
      setSponsoredDuration(5);
    }
    onOpenChange(newOpen);
  };

  const selectedProduct = products.find((p: any) => p.id === selectedProductId);

  // Calculate prices
  const featuredTotal = adConfig ? adConfig.featured.pricePerDay * durationDays : 0;
  const sponsoredTotal = Number(budget) || 0;

  const handleSelectAdType = (type: AdType) => {
    setSelectedAdType(type);
    if (type === 'featured') {
      loadSlotsAndConfig();
      setStep('featured_slots');
    } else {
      // Load config for min budget
      loadSlotsAndConfig();
      setStep('sponsored_budget');
    }
  };

  const handleBack = () => {
    if (step === 'type' && !hasPreselection) setStep('product');
    else if (step === 'featured_slots') setStep('type');
    else if (step === 'featured_duration') setStep('featured_slots');
    else if (step === 'sponsored_budget') setStep('type');
    else if (step === 'preview') {
      setStep(selectedAdType === 'featured' ? 'featured_duration' : 'sponsored_budget');
    }
  };

  const handlePayment = async () => {
    if (!selectedProductId || !selectedAdType) return;

    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      toast.error('Payment gateway not configured');
      return;
    }

    const amount = selectedAdType === 'featured' ? featuredTotal : sponsoredTotal;
    if (amount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const PaystackPop = (await import('@paystack/inline-js')).default;
      const paystack = new (PaystackPop as any)();

      handleOpenChange(false);

      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: profile?.email || '',
        amount: Math.round(amount * 100),
        currency: currency || 'NGN',
        metadata: {
          type: selectedAdType === 'featured' ? 'featured_ad' : 'sponsored_ad',
          product_id: selectedProductId,
        },
        onSuccess: async (response: any) => {
          try {
            if (selectedAdType === 'featured') {
              await api.post('/ads/featured', {
                productId: selectedProductId,
                slotNumber: selectedSlot,
                durationDays,
                paymentReference: response.reference,
              });
              toast.success('Featured ad activated!');
            } else {
              await api.post('/ads/sponsored', {
                productId: selectedProductId,
                budget: sponsoredTotal,
                durationDays: runMode === 'duration' ? sponsoredDuration : undefined,
                paymentReference: response.reference,
              });
              toast.success('Sponsored ad activated!');
            }
            queryClient.invalidateQueries({queryKey: ['vendor-featured-ads']});
            queryClient.invalidateQueries({queryKey: ['vendor-sponsored-ads']});
            queryClient.invalidateQueries({queryKey: ['vendor-products']});
            onSuccess?.();
          } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create ad');
          } finally {
            setIsSubmitting(false);
          }
        },
        onCancel: () => {
          setIsSubmitting(false);
          toast.info('Payment cancelled');
        },
      });
    } catch (err: any) {
      console.error('Paystack error:', err);
      toast.error('Failed to initialize payment');
      setIsSubmitting(false);
    }
  };

  const stepsList: Step[] = hasPreselection
    ? ['type', selectedAdType === 'featured' ? 'featured_slots' : 'sponsored_budget',
       selectedAdType === 'featured' ? 'featured_duration' : 'preview', 'preview']
    : ['product', 'type', selectedAdType === 'featured' ? 'featured_slots' : 'sponsored_budget', 'preview'];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {stepsList.filter((v, i, a) => a.indexOf(v) === i).map((s) => (
        <div key={s} className={cn(
          'h-2 rounded-full transition-all',
          s === step ? 'w-8 bg-[var(--v2-primary)]' : 'w-2 bg-[var(--v2-outline-variant)]/30',
        )} />
      ))}
    </div>
  );

  return (
    <ResponsiveModal open={open} onOpenChange={handleOpenChange}>
      <ResponsiveModalContent className="sm:max-w-lg p-0 overflow-hidden border-none shadow-2xl sm:rounded-3xl">
        <VisuallyHidden>
          <ResponsiveModalTitle>Boost Product</ResponsiveModalTitle>
        </VisuallyHidden>

        {/* Header */}
        <div className="bg-gradient-to-br from-[var(--v2-primary)] to-[var(--v2-primary-container)] px-6 pt-6 pb-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="v2-icon text-2xl text-white">rocket_launch</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Boost Your Product</h2>
              <p className="text-white/70 text-sm">Reach more customers</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {renderStepIndicator()}

          {/* Step: Select Product */}
          {step === 'product' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-bold text-[var(--v2-on-surface)] mb-4">Select a product to boost</h3>
              {productsLoading ? (
                <div className="text-center py-8">
                  <span className="v2-icon text-3xl text-[var(--v2-primary)] animate-spin">progress_activity</span>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/30">inventory_2</span>
                  <p className="text-sm text-[var(--v2-on-surface-variant)] mt-2">No products available</p>
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto space-y-2 v2-no-scrollbar">
                  {products.map((product: any) => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                      className={cn(
                        'w-full p-3 rounded-xl flex items-center gap-3 transition-all text-left',
                        selectedProductId === product.id
                          ? 'bg-[var(--v2-primary)]/10 ring-2 ring-[var(--v2-primary)]'
                          : 'bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container-high)]',
                      )}>
                      <div className="w-14 h-14 rounded-xl bg-[var(--v2-surface-container-high)] overflow-hidden shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="v2-icon text-[var(--v2-on-surface-variant)]/30">image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[var(--v2-on-surface)] capitalize truncate">{product.name}</p>
                        <p className="text-sm text-[var(--v2-primary)] font-medium">
                          {formatCurrency(product.price, currency)}
                        </p>
                      </div>
                      <div className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0',
                        selectedProductId === product.id
                          ? 'border-[var(--v2-primary)] bg-[var(--v2-primary)]'
                          : 'border-[var(--v2-outline-variant)]',
                      )}>
                        {selectedProductId === product.id && (
                          <span className="v2-icon text-sm text-white">check</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => selectedProductId && setStep('type')}
                disabled={!selectedProductId}
                className="w-full h-14 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                Continue
                <span className="v2-icon">arrow_forward</span>
              </button>
            </div>
          )}

          {/* Step: Select Ad Type */}
          {step === 'type' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-bold text-[var(--v2-on-surface)] mb-4">Choose promotion type</h3>
              <div className="space-y-3">
                {/* Featured */}
                <button
                  onClick={() => handleSelectAdType('featured')}
                  className="w-full p-5 rounded-2xl flex items-center gap-4 transition-all text-left bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container-high)] hover:ring-2 hover:ring-amber-400">
                  <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="v2-icon text-2xl text-amber-600">star</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[var(--v2-on-surface)] text-lg">Featured Ad</p>
                    <p className="text-sm text-[var(--v2-on-surface-variant)]">
                      Premium slot at the top of the shop. Limited slots, fixed daily price.
                    </p>
                  </div>
                  <span className="v2-icon text-[var(--v2-on-surface-variant)]">chevron_right</span>
                </button>

                {/* Sponsored */}
                <button
                  onClick={() => handleSelectAdType('sponsored')}
                  className="w-full p-5 rounded-2xl flex items-center gap-4 transition-all text-left bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container-high)] hover:ring-2 hover:ring-purple-400">
                  <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                    <span className="v2-icon text-2xl text-purple-600">campaign</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[var(--v2-on-surface)] text-lg">Sponsored Ad</p>
                    <p className="text-sm text-[var(--v2-on-surface-variant)]">
                      Budget-driven feed placement. Pay per click, runs until budget is exhausted.
                    </p>
                  </div>
                  <span className="v2-icon text-[var(--v2-on-surface-variant)]">chevron_right</span>
                </button>
              </div>

              {!hasPreselection && (
                <button
                  onClick={handleBack}
                  className="w-full h-12 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-xl hover:bg-[var(--v2-surface-container-high)] transition-colors">
                  Back
                </button>
              )}
            </div>
          )}

          {/* Step: Featured – Slot Selection */}
          {step === 'featured_slots' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-bold text-[var(--v2-on-surface)] mb-1">Select a slot</h3>
              {adConfig && (
                <p className="text-sm text-[var(--v2-on-surface-variant)] mb-4">
                  {formatCurrency(adConfig.featured.pricePerDay, currency)} per day
                </p>
              )}

              {slotsLoading ? (
                <div className="text-center py-8">
                  <span className="v2-icon text-3xl text-[var(--v2-primary)] animate-spin">progress_activity</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.slotNumber}
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot.slotNumber)}
                      className={cn(
                        'w-full p-4 rounded-xl flex items-center justify-between transition-all text-left',
                        !slot.available
                          ? 'bg-[var(--v2-surface-container-low)] opacity-50 cursor-not-allowed'
                          : selectedSlot === slot.slotNumber
                          ? 'bg-[var(--v2-primary)]/10 ring-2 ring-[var(--v2-primary)]'
                          : 'bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container-high)]',
                      )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg',
                          slot.available
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-600',
                        )}>
                          {slot.slotNumber}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--v2-on-surface)]">Slot {slot.slotNumber}</p>
                          <p className="text-xs text-[var(--v2-on-surface-variant)]">
                            {slot.available ? 'Available' : `Booked by ${slot.booking?.vendor?.shopName || 'vendor'}`}
                          </p>
                        </div>
                      </div>
                      {slot.available && (
                        <div className={cn(
                          'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                          selectedSlot === slot.slotNumber
                            ? 'border-[var(--v2-primary)] bg-[var(--v2-primary)]'
                            : 'border-[var(--v2-outline-variant)]',
                        )}>
                          {selectedSlot === slot.slotNumber && (
                            <span className="v2-icon text-sm text-white">check</span>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={handleBack}
                  className="flex-1 h-14 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-xl hover:bg-[var(--v2-surface-container-high)] transition-colors">
                  Back
                </button>
                <button
                  onClick={() => selectedSlot && setStep('featured_duration')}
                  disabled={!selectedSlot}
                  className="flex-1 h-14 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  Continue
                  <span className="v2-icon">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* Step: Featured – Duration */}
          {step === 'featured_duration' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-bold text-[var(--v2-on-surface)] mb-4">Select duration</h3>
              <div className="space-y-3">
                {[3, 7, 14, 30].map(days => (
                  <button
                    key={days}
                    onClick={() => setDurationDays(days)}
                    className={cn(
                      'w-full p-4 rounded-xl flex items-center justify-between transition-all text-left',
                      durationDays === days
                        ? 'bg-[var(--v2-primary)]/10 ring-2 ring-[var(--v2-primary)]'
                        : 'bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container-high)]',
                    )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                        durationDays === days
                          ? 'border-[var(--v2-primary)] bg-[var(--v2-primary)]'
                          : 'border-[var(--v2-outline-variant)]',
                      )}>
                        {durationDays === days && <span className="v2-icon text-sm text-white">check</span>}
                      </div>
                      <p className="font-bold text-[var(--v2-on-surface)]">{days} Days</p>
                    </div>
                    <p className="font-bold text-[var(--v2-primary)]">
                      {adConfig ? formatCurrency(adConfig.featured.pricePerDay * days, currency) : '...'}
                    </p>
                  </button>
                ))}
              </div>

              {/* Custom duration */}
              <div className="flex items-center gap-3 pt-2">
                <label className="text-sm font-medium text-[var(--v2-on-surface-variant)]">Custom:</label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={durationDays}
                  onChange={e => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 h-10 px-3 bg-[var(--v2-surface-container-low)] rounded-xl text-center font-bold"
                />
                <span className="text-sm text-[var(--v2-on-surface-variant)]">days</span>
                <span className="ml-auto font-bold text-[var(--v2-primary)]">
                  = {adConfig ? formatCurrency(featuredTotal, currency) : '...'}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleBack}
                  className="flex-1 h-14 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-xl hover:bg-[var(--v2-surface-container-high)] transition-colors">
                  Back
                </button>
                <button
                  onClick={() => setStep('preview')}
                  className="flex-1 h-14 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
                  Review & Pay
                  <span className="v2-icon">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* Step: Sponsored – Budget */}
          {step === 'sponsored_budget' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-bold text-[var(--v2-on-surface)] mb-4">Set your budget</h3>

              {adConfig && (
                <div className="bg-purple-50 rounded-xl p-4 flex items-start gap-3 mb-2">
                  <span className="v2-icon text-purple-600">info</span>
                  <div className="text-sm text-purple-700">
                    <p>Min budget: <strong>{formatCurrency(adConfig.sponsored.minBudget, currency)}</strong></p>
                    <p>Cost per click: <strong>{formatCurrency(adConfig.sponsored.costPerClick, currency)}</strong></p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">Budget Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[var(--v2-on-surface-variant)]">
                    {currency === 'GHS' ? 'GH₵' : '₦'}
                  </span>
                  <input
                    type="number"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    placeholder={adConfig ? String(adConfig.sponsored.minBudget) : '2000'}
                    className="w-full h-14 pl-10 pr-4 bg-[var(--v2-surface-container-low)] rounded-xl text-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-3">Run Mode</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setRunMode('unlimited')}
                    className={cn(
                      'w-full p-4 rounded-xl flex items-center gap-3 text-left transition-all',
                      runMode === 'unlimited'
                        ? 'bg-[var(--v2-primary)]/10 ring-2 ring-[var(--v2-primary)]'
                        : 'bg-[var(--v2-surface-container-low)]',
                    )}>
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      runMode === 'unlimited' ? 'border-[var(--v2-primary)] bg-[var(--v2-primary)]' : 'border-[var(--v2-outline-variant)]',
                    )}>
                      {runMode === 'unlimited' && <span className="v2-icon text-xs text-white">check</span>}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--v2-on-surface)]">Run until budget finishes</p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)]">Recommended - maximize exposure</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setRunMode('duration')}
                    className={cn(
                      'w-full p-4 rounded-xl flex items-center gap-3 text-left transition-all',
                      runMode === 'duration'
                        ? 'bg-[var(--v2-primary)]/10 ring-2 ring-[var(--v2-primary)]'
                        : 'bg-[var(--v2-surface-container-low)]',
                    )}>
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      runMode === 'duration' ? 'border-[var(--v2-primary)] bg-[var(--v2-primary)]' : 'border-[var(--v2-outline-variant)]',
                    )}>
                      {runMode === 'duration' && <span className="v2-icon text-xs text-white">check</span>}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--v2-on-surface)]">Set duration</p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)]">Spread budget over fixed days</p>
                    </div>
                  </button>
                </div>
              </div>

              {runMode === 'duration' && (
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-[var(--v2-on-surface-variant)]">Duration:</label>
                  <input
                    type="number"
                    min={1}
                    value={sponsoredDuration}
                    onChange={e => setSponsoredDuration(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 h-10 px-3 bg-[var(--v2-surface-container-low)] rounded-xl text-center font-bold"
                  />
                  <span className="text-sm text-[var(--v2-on-surface-variant)]">days</span>
                  {Number(budget) > 0 && (
                    <span className="ml-auto text-xs text-[var(--v2-on-surface-variant)]">
                      ≈ {formatCurrency(Number(budget) / sponsoredDuration, currency)}/day
                    </span>
                  )}
                </div>
              )}

              {runMode === 'unlimited' && Number(budget) > 0 && adConfig && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-sm text-blue-700">
                    Your ad will run continuously until your budget is exhausted.
                    Estimated duration: {Math.ceil(Number(budget) / (adConfig.sponsored.costPerClick * 20))}–{Math.ceil(Number(budget) / (adConfig.sponsored.costPerClick * 5))} days (based on activity).
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={handleBack}
                  className="flex-1 h-14 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-xl hover:bg-[var(--v2-surface-container-high)] transition-colors">
                  Back
                </button>
                <button
                  onClick={() => setStep('preview')}
                  disabled={!budget || (adConfig ? Number(budget) < adConfig.sponsored.minBudget : false)}
                  className="flex-1 h-14 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  Review & Pay
                  <span className="v2-icon">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* Step: Preview & Pay */}
          {step === 'preview' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-bold text-[var(--v2-on-surface)] mb-4">Review & Pay</h3>

              {/* Product Preview */}
              <div className="bg-[var(--v2-surface-container-low)] rounded-2xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-[var(--v2-surface-container-high)] overflow-hidden shrink-0">
                    {selectedProduct?.image_url ? (
                      <img src={selectedProduct.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="v2-icon text-2xl text-[var(--v2-on-surface-variant)]/30">image</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--v2-on-surface)] capitalize">{selectedProduct?.name}</p>
                    <p className="text-[var(--v2-primary)] font-medium">
                      {formatCurrency(selectedProduct?.price || 0, currency)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ad Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-[var(--v2-outline-variant)]/10">
                  <span className="text-[var(--v2-on-surface-variant)]">Type</span>
                  <span className="font-medium text-[var(--v2-on-surface)] capitalize flex items-center gap-2">
                    <span className={cn('v2-icon text-sm', selectedAdType === 'featured' ? 'text-amber-500' : 'text-purple-500')}>
                      {selectedAdType === 'featured' ? 'star' : 'campaign'}
                    </span>
                    {selectedAdType === 'featured' ? 'Featured Ad' : 'Sponsored Ad'}
                  </span>
                </div>
                {selectedAdType === 'featured' && (
                  <>
                    <div className="flex items-center justify-between py-2 border-b border-[var(--v2-outline-variant)]/10">
                      <span className="text-[var(--v2-on-surface-variant)]">Slot</span>
                      <span className="font-medium text-[var(--v2-on-surface)]">Slot {selectedSlot}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-[var(--v2-outline-variant)]/10">
                      <span className="text-[var(--v2-on-surface-variant)]">Duration</span>
                      <span className="font-medium text-[var(--v2-on-surface)]">{durationDays} Days</span>
                    </div>
                  </>
                )}
                {selectedAdType === 'sponsored' && (
                  <div className="flex items-center justify-between py-2 border-b border-[var(--v2-outline-variant)]/10">
                    <span className="text-[var(--v2-on-surface-variant)]">Run Mode</span>
                    <span className="font-medium text-[var(--v2-on-surface)]">
                      {runMode === 'unlimited' ? 'Until budget ends' : `${sponsoredDuration} days`}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-3 bg-[var(--v2-primary)]/5 rounded-xl px-4">
                  <span className="font-bold text-[var(--v2-on-surface)]">Total</span>
                  <span className="text-2xl font-extrabold text-[var(--v2-primary)]">
                    {formatCurrency(selectedAdType === 'featured' ? featuredTotal : sponsoredTotal, currency)}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-xl">
                <span className="v2-icon text-emerald-600">check_circle</span>
                <p className="text-xs text-emerald-700">
                  Your ad will be activated immediately after payment verification. No approval wait needed.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="flex-1 h-14 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-xl hover:bg-[var(--v2-surface-container-high)] transition-colors disabled:opacity-50">
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isSubmitting}
                  className="flex-1 h-14 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                  {isSubmitting ? (
                    <>
                      <span className="v2-icon animate-spin">progress_activity</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay {formatCurrency(selectedAdType === 'featured' ? featuredTotal : sponsoredTotal, currency)}
                      <span className="v2-icon">lock</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

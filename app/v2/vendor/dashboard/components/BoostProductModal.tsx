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
import React, {useState} from 'react';
import {toast} from 'sonner';
import {useQueryClient} from '@tanstack/react-query';
import {createPromotion} from '@/lib/server/actions/promotions';
import {
  calculatePromotionPrice,
  PromotionPlacement,
  PROMOTION_PRICING,
} from '@/lib/utils/promotions';

interface BoostProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  /** Pre-selected product ID - skips the product selection step */
  preselectedProductId?: number | null;
}

type Step = 'product' | 'placement' | 'duration' | 'preview';

const DURATIONS = [
  {days: 3, label: '3 Days', discount: null},
  {days: 7, label: '7 Days', discount: '15% OFF'},
  {days: 14, label: '14 Days', discount: '20% OFF'},
];

const PLACEMENTS: {id: PromotionPlacement; label: string; description: string; icon: string; color: string}[] = [
  {
    id: 'featured',
    label: 'Featured Product',
    description: 'Appear in the Featured section at the top of the Gift Shop',
    icon: 'star',
    color: 'text-amber-500',
  },
  {
    id: 'new_arrivals',
    label: 'New Arrivals',
    description: 'Highlighted in the New Arrivals section with "New Arrival" badge',
    icon: 'new_releases',
    color: 'text-emerald-500',
  },
  {
    id: 'sponsored',
    label: 'Sponsored (Native)',
    description: 'Blended naturally with other products, marked with "Sponsored" label',
    icon: 'campaign',
    color: 'text-purple-500',
  },
];

export function BoostProductModal({open, onOpenChange, onSuccess, preselectedProductId}: BoostProductModalProps) {
  const {data: profile} = useProfile();
  const queryClient = useQueryClient();
  // Pass the current user's ID to only fetch their own products
  const {data: products = [], isLoading: productsLoading} = useVendorProducts(profile?.id, true);

  // Determine initial step based on preselectedProductId
  const hasPreselection = preselectedProductId != null;
  const [step, setStep] = useState<Step>(hasPreselection ? 'placement' : 'product');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(preselectedProductId ?? null);
  const [selectedPlacement, setSelectedPlacement] = useState<PromotionPlacement | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currency = getCurrencyByCountry(profile?.country || 'Nigeria');

  // Update state when preselectedProductId changes
  React.useEffect(() => {
    if (open && preselectedProductId != null) {
      setSelectedProductId(preselectedProductId);
      setStep('placement');
    }
  }, [open, preselectedProductId]);

  // Reset state when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setStep(preselectedProductId != null ? 'placement' : 'product');
      setSelectedProductId(preselectedProductId ?? null);
      setSelectedPlacement(null);
      setSelectedDuration(null);
    }
    onOpenChange(newOpen);
  };

  const selectedProduct = products.find((p: any) => p.id === selectedProductId);
  const totalPrice = selectedPlacement && selectedDuration
    ? calculatePromotionPrice(selectedPlacement, selectedDuration)
    : 0;

  const handleNext = () => {
    if (step === 'product' && selectedProductId) setStep('placement');
    else if (step === 'placement' && selectedPlacement) setStep('duration');
    else if (step === 'duration' && selectedDuration) setStep('preview');
  };

  const handleBack = () => {
    if (step === 'placement') {
      // Only go back to product selection if not preselected
      if (!hasPreselection) {
        setStep('product');
      }
    } else if (step === 'duration') setStep('placement');
    else if (step === 'preview') setStep('duration');
  };

  const handlePayment = async () => {
    if (!selectedProductId || !selectedPlacement || !selectedDuration) return;

    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      toast.error('Payment gateway not configured');
      return;
    }

    setIsSubmitting(true);
    try {
      // Dynamic import Paystack
      const PaystackPop = (await import('@paystack/inline-js')).default;
      const paystack = new (PaystackPop as any)();

      // Close the modal before showing payment
      handleOpenChange(false);

      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: profile?.email || '',
        amount: Math.round(totalPrice * 100), // Convert to kobo
        currency: 'NGN',
        metadata: {
          type: 'promotion',
          product_id: selectedProductId,
          placement: selectedPlacement,
          duration_days: selectedDuration,
        },
        onSuccess: async (response: any) => {
          // Create the promotion
          const result = await createPromotion({
            product_id: selectedProductId,
            placement: selectedPlacement,
            duration_days: selectedDuration,
            amount_paid: totalPrice,
            payment_reference: response.reference,
          });

          if (result.success) {
            toast.success('Promotion submitted for approval!');
            // Invalidate queries to refresh the UI immediately
            queryClient.invalidateQueries({queryKey: ['vendor-promotions']});
            queryClient.invalidateQueries({queryKey: ['vendor-products']});
            onSuccess?.();
          } else {
            toast.error(result.error || 'Failed to create promotion');
          }
          setIsSubmitting(false);
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

  const renderStepIndicator = () => {
    // If preselected, skip the product step in the indicator
    const steps = hasPreselection
      ? ['placement', 'duration', 'preview']
      : ['product', 'placement', 'duration', 'preview'];

    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s) => (
          <div
            key={s}
            className={cn(
              'h-2 rounded-full transition-all',
              s === step ? 'w-8 bg-[var(--v2-primary)]' : 'w-2 bg-[var(--v2-outline-variant)]/30',
            )}
          />
        ))}
      </div>
    );
  };

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

          {/* Step 1: Select Product */}
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
                onClick={handleNext}
                disabled={!selectedProductId}
                className="w-full h-14 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                Continue
                <span className="v2-icon">arrow_forward</span>
              </button>
            </div>
          )}

          {/* Step 2: Select Placement */}
          {step === 'placement' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-bold text-[var(--v2-on-surface)] mb-4">Choose placement</h3>

              <div className="space-y-3">
                {PLACEMENTS.map(placement => (
                  <button
                    key={placement.id}
                    onClick={() => setSelectedPlacement(placement.id)}
                    className={cn(
                      'w-full p-4 rounded-xl flex items-center gap-4 transition-all text-left',
                      selectedPlacement === placement.id
                        ? 'bg-[var(--v2-primary)]/10 ring-2 ring-[var(--v2-primary)]'
                        : 'bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container-high)]',
                    )}>
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      selectedPlacement === placement.id
                        ? 'bg-[var(--v2-primary)] text-white'
                        : 'bg-[var(--v2-surface-container-high)]',
                    )}>
                      <span className={cn('v2-icon text-xl', selectedPlacement !== placement.id && placement.color)}>
                        {placement.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[var(--v2-on-surface)]">{placement.label}</p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)]">{placement.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[var(--v2-primary)]">
                        {formatCurrency(PROMOTION_PRICING[placement.id], currency)}
                      </p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)]">per day</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                {!hasPreselection && (
                  <button
                    onClick={handleBack}
                    className="flex-1 h-14 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-xl hover:bg-[var(--v2-surface-container-high)] transition-colors">
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!selectedPlacement}
                  className={cn(
                    'h-14 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all',
                    hasPreselection ? 'w-full' : 'flex-1'
                  )}>
                  Continue
                  <span className="v2-icon">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Select Duration */}
          {step === 'duration' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-bold text-[var(--v2-on-surface)] mb-4">Select duration</h3>

              <div className="space-y-3">
                {DURATIONS.map(duration => {
                  const price = selectedPlacement
                    ? calculatePromotionPrice(selectedPlacement, duration.days)
                    : 0;
                  const originalPrice = selectedPlacement
                    ? PROMOTION_PRICING[selectedPlacement] * duration.days
                    : 0;

                  return (
                    <button
                      key={duration.days}
                      onClick={() => setSelectedDuration(duration.days)}
                      className={cn(
                        'w-full p-4 rounded-xl flex items-center justify-between transition-all text-left',
                        selectedDuration === duration.days
                          ? 'bg-[var(--v2-primary)]/10 ring-2 ring-[var(--v2-primary)]'
                          : 'bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container-high)]',
                      )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                          selectedDuration === duration.days
                            ? 'border-[var(--v2-primary)] bg-[var(--v2-primary)]'
                            : 'border-[var(--v2-outline-variant)]',
                        )}>
                          {selectedDuration === duration.days && (
                            <span className="v2-icon text-sm text-white">check</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--v2-on-surface)]">{duration.label}</p>
                          {duration.discount && (
                            <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                              {duration.discount}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[var(--v2-primary)]">{formatCurrency(price, currency)}</p>
                        {duration.discount && (
                          <p className="text-xs text-[var(--v2-on-surface-variant)] line-through">
                            {formatCurrency(originalPrice, currency)}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleBack}
                  className="flex-1 h-14 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-xl hover:bg-[var(--v2-surface-container-high)] transition-colors">
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!selectedDuration}
                  className="flex-1 h-14 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  Continue
                  <span className="v2-icon">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Preview & Pay */}
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

              {/* Promotion Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-[var(--v2-outline-variant)]/10">
                  <span className="text-[var(--v2-on-surface-variant)]">Placement</span>
                  <span className="font-medium text-[var(--v2-on-surface)]">
                    {PLACEMENTS.find(p => p.id === selectedPlacement)?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--v2-outline-variant)]/10">
                  <span className="text-[var(--v2-on-surface-variant)]">Duration</span>
                  <span className="font-medium text-[var(--v2-on-surface)]">{selectedDuration} Days</span>
                </div>
                <div className="flex items-center justify-between py-3 bg-[var(--v2-primary)]/5 rounded-xl px-4">
                  <span className="font-bold text-[var(--v2-on-surface)]">Total</span>
                  <span className="text-2xl font-extrabold text-[var(--v2-primary)]">
                    {formatCurrency(totalPrice, currency)}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
                <span className="v2-icon text-blue-600">info</span>
                <p className="text-xs text-blue-700">
                  Your promotion will be reviewed by our team before going live. This usually takes 24-48 hours.
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
                      Pay {formatCurrency(totalPrice, currency)}
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

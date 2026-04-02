// Promotion pricing and calculation utilities
// These are client-safe, non-server-action utilities

export type PromotionPlacement = 'featured' | 'new_arrivals' | 'sponsored';

// Pricing configuration
export const PROMOTION_PRICING = {
  featured: 1000, // ₦1,000 per day
  new_arrivals: 500, // ₦500 per day
  sponsored: 750, // ₦750 per day
};

export const DURATION_DISCOUNTS: Record<number, number> = {
  3: 1.0, // No discount
  7: 0.85, // 15% discount
  14: 0.80, // 20% discount
};

// Calculate promotion price
export function calculatePromotionPrice(placement: PromotionPlacement, durationDays: number): number {
  const basePrice = PROMOTION_PRICING[placement];
  const discount = DURATION_DISCOUNTS[durationDays] || 1.0;
  return Math.round(basePrice * durationDays * discount);
}

/**
 * Transaction type constants used across the application.
 * Mirrors frontend: src/lib/server/actions/constants.ts
 */

/** Direct monetary support sent to a creator via their page */
export const TX_CREATOR_SUPPORT = 'creator_support';

/** Contribution to a campaign (crowdfunding / claimable gift purchase) */
export const TX_CAMPAIGN_CONTRIBUTION = 'campaign_contribution';

/** Gift card or voucher redemption receipt */
export const TX_RECEIPT = 'receipt';

/** Wallet withdrawal */
export const TX_WITHDRAWAL = 'withdrawal';

/** Wallet top-up / deposit */
export const TX_DEPOSIT = 'deposit';

/** Gift sent (flex card or claimable) */
export const TX_GIFT_SENT = 'gift_sent';

/** Flex card redemption */
export const TX_FLEX_CARD_REDEMPTION = 'flex_card_redemption';

/** Gift redemption at vendor */
export const TX_GIFT_REDEMPTION = 'gift_redemption';

/** Platform credit conversion */
export const TX_PLATFORM_CREDIT_CONVERSION = 'platform_credit_conversion';

/** Withdrawal from a campaign to the wallet */
export const TX_CAMPAIGN_WITHDRAWAL = 'campaign_withdrawal';

/**
 * Campaign / gift statuses
 */
export const STATUS_ACTIVE = 'active';
export const STATUS_CLAIMED = 'claimed';
export const STATUS_REDEEMED = 'redeemed';
export const STATUS_SUCCESS = 'success';
export const STATUS_PAUSED = 'paused';
export const STATUS_COMPLETED = 'completed';
export const STATUS_CANCELLED = 'cancelled';
export const STATUS_CONVERTED = 'converted';

/**
 * Campaign categories
 */
export const CAT_GIFT_RECEIVED = 'gift-received';
export const CAT_CLAIMABLE = 'claimable';

/**
 * Claimable gift types
 */
export const CLAIMABLE_MONEY = 'money';
export const CLAIMABLE_GIFT_CARD = 'gift-card';

/**
 * Promotion pricing & discounts
 * Mirrors frontend: src/lib/utils/promotions.ts
 */
export type PromotionPlacement = 'featured' | 'new_arrivals' | 'sponsored';

export const PROMOTION_PRICING: Record<string, number> = {
  featured: 1000,
  new_arrivals: 500,
  sponsored: 750,
};

export const DURATION_DISCOUNTS: Record<number, number> = {
  3: 1.0,
  7: 0.85,
  14: 0.80,
};

export function calculatePromotionPrice(placement: string, durationDays: number): number {
  const basePrice = PROMOTION_PRICING[placement] || 500;
  const discount = DURATION_DISCOUNTS[durationDays] || 1.0;
  return Math.round(basePrice * durationDays * discount);
}

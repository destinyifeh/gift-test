/**
 * Transaction type constants used across the application.
 * Centralised here for consistency and easy refactoring.
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

/**
 * Campaign / gift statuses
 */
export const STATUS_ACTIVE = 'active';
export const STATUS_CLAIMED = 'claimed';
export const STATUS_REDEEMED = 'redeemed';
export const STATUS_SUCCESS = 'success';

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

/**
 * Utility for centralized platform fee calculations.
 * Ensures consistent financial math across backend services and frontend components.
 */

/**
 * Calculates the platform fee for a given gross amount.
 * Formula: amount * (percentage / 100)
 */
export const calculatePlatformFee = (amount: number, percentage: number): number => {
  if (!amount || !percentage) return 0;
  return amount * (percentage / 100);
};

/**
 * Calculates the total amount to charge the user (amount + fee).
 */
export const calculateTotalWithFee = (amount: number, percentage: number): number => {
  const fee = calculatePlatformFee(amount, percentage);
  return amount + fee;
};

/**
 * Calculates the net amount after a platform fee has been extracted from a total paid amount.
 * Use this when the user paid a total that already includes the fee.
 * Relative math formula: total * (percentage / (100 + percentage))
 */
export const calculateNetAfterFee = (total: number, percentage: number): number => {
  if (!total || !percentage) return total;
  const fee = total * (percentage / (100 + percentage));
  return total - fee;
};

/**
 * Calculates the platform fee portion from a total paid amount.
 */
export const extractFeeFromTotal = (total: number, percentage: number): number => {
  if (!total || !percentage) return 0;
  return total * (percentage / (100 + percentage));
};

/**
 * Calculates the net amount for a withdrawal after subtracting a flat fee.
 */
export const calculateWithdrawalNet = (amount: number, flatFee: number): number => {
  return Math.max(0, amount - flatFee);
};

/**
 * Platform-wide WhatsApp delivery fee (₦100)
 */
export const WHATSAPP_FEE = 100;

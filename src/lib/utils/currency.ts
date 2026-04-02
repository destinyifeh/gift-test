import {getCurrencySymbol} from '../constants/currencies';

/**
 * Formats a numeric amount with the appropriate currency symbol.
 * @param amount The numeric amount to format
 * @param currencyCode The currency code (e.g., 'NGN', 'USD')
 * @param shorthand If true, formats large numbers with K/M suffix (e.g., '₦1.5K', '₦2M')
 * @returns Formatted string (e.g., '₦1,000', '$50')
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currencyCode: string = 'NGN',
  shorthand: boolean = false,
): string {
  const numericAmount =
    typeof amount === 'string' ? parseFloat(amount) : amount;

  if (
    numericAmount === null ||
    numericAmount === undefined ||
    isNaN(numericAmount)
  ) {
    return `${getCurrencySymbol(currencyCode)}0`;
  }

  const symbol = getCurrencySymbol(currencyCode);

  // Shorthand formatting for large numbers
  if (shorthand) {
    if (numericAmount >= 1000000) {
      return `${symbol}${(numericAmount / 1000000).toFixed(1)}M`;
    }
    if (numericAmount >= 1000) {
      return `${symbol}${(numericAmount / 1000).toFixed(1)}K`;
    }
    return `${symbol}${numericAmount}`;
  }

  // Use Intl.NumberFormat for proper grouping (commas)
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  // Custom formatting: Symbol + Formatted Number
  // We use en-US locale for consistent comma separation
  return `${symbol}${formatter.format(numericAmount)}`;
}

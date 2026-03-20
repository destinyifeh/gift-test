import {getCurrencySymbol} from '../constants/currencies';

/**
 * Formats a numeric amount with the appropriate currency symbol.
 * @param amount The numeric amount to format
 * @param currencyCode The currency code (e.g., 'NGN', 'USD')
 * @returns Formatted string (e.g., '₦1,000', '$50')
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currencyCode: string = 'NGN',
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

  // Use Intl.NumberFormat for proper grouping (commas)
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const symbol = getCurrencySymbol(currencyCode);

  // Custom formatting: Symbol + Formatted Number
  // We use en-US locale for consistent comma separation
  return `${symbol}${formatter.format(numericAmount)}`;
}

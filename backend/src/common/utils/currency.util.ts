import { getCurrencySymbol } from '../constants/currencies';

/**
 * Formats a numeric amount with the appropriate currency symbol.
 * Mirrors frontend: src/lib/utils/currency.ts → formatCurrency
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

  if (shorthand) {
    if (numericAmount >= 1000000) {
      return `${symbol}${(numericAmount / 1000000).toFixed(1)}M`;
    }
    if (numericAmount >= 1000) {
      return `${symbol}${(numericAmount / 1000).toFixed(1)}K`;
    }
    return `${symbol}${numericAmount}`;
  }

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return `${symbol}${formatter.format(numericAmount)}`;
}

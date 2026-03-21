import {
  SUPPORTED_CURRENCIES,
  getCurrencyByCountry as getByCountry,
  getCurrencySymbol as getSymbol,
} from './constants/currencies';

export const PAYSTACK_COUNTRIES = SUPPORTED_CURRENCIES.filter(
  c => c.canWithdraw,
).map(c => ({
  name: c.country,
  code: c.code.toLowerCase(),
  currency: c.code,
  symbol: c.symbol,
}));

export const CURRENCY_SYMBOLS: Record<string, string> =
  SUPPORTED_CURRENCIES.reduce(
    (acc, curr) => {
      acc[curr.code] = curr.symbol;
      return acc;
    },
    {} as Record<string, string>,
  );

export function getCurrencyByCountry(countryName: string): string {
  return getByCountry(countryName);
}

export function getCurrencySymbol(currencyCode: string): string {
  return getSymbol(currencyCode);
}

export const PAYSTACK_COUNTRIES = [
  {name: 'Nigeria', code: 'nigeria', currency: 'NGN', symbol: '₦'},
  {name: 'Ghana', code: 'ghana', currency: 'GHS', symbol: 'GH₵'},
  {name: 'Kenya', code: 'kenya', currency: 'KES', symbol: 'KSh'},
  {name: 'South Africa', code: 'south africa', currency: 'ZAR', symbol: 'R'},
  {
    name: "Cote d'Ivoire",
    code: 'cote d ivoire',
    currency: 'XOF',
    symbol: 'CFA',
  },
];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  GHS: 'GH₵',
  KES: 'KSh',
  ZAR: 'R',
  XOF: 'CFA',
  USD: '$',
};

export function getCurrencyByCountry(countryName: string): string {
  const country = PAYSTACK_COUNTRIES.find(
    c => c.name.toLowerCase() === countryName.toLowerCase(),
  );
  return country?.currency || 'NGN';
}

export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCY_SYMBOLS[currencyCode] || '$';
}

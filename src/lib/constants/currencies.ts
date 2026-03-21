export const SUPPORTED_CURRENCIES = [
  // Create & Withdraw Supported
  {
    code: 'NGN',
    symbol: '₦',
    label: 'Nigerian Naira',
    country: 'Nigeria',
    flag: '🇳🇬',
    canCreate: true,
    canWithdraw: true,
    suggestedAmounts: [1000, 1500, 2000, 2500, 5000],
  },
  {
    code: 'GHS',
    symbol: 'GH₵',
    label: 'Ghanaian Cedi',
    country: 'Ghana',
    flag: '🇬🇭',
    canCreate: true,
    canWithdraw: true,
    suggestedAmounts: [10, 20, 50, 100, 200],
  },
  {
    code: 'KES',
    symbol: 'KSh',
    label: 'Kenyan Shilling',
    country: 'Kenya',
    flag: '🇰🇪',
    canCreate: true,
    canWithdraw: true,
    suggestedAmounts: [100, 200, 300, 500, 1000],
  },
  {
    code: 'ZAR',
    symbol: 'R',
    label: 'South African Rand',
    country: 'South Africa',
    flag: '🇿🇦',
    canCreate: true,
    canWithdraw: true,
    suggestedAmounts: [10, 20, 50, 100, 200],
  },
  {
    code: 'XOF',
    symbol: 'CFA',
    label: 'CFA Franc',
    country: "Cote d'Ivoire",
    flag: '🇨🇮',
    canCreate: true,
    canWithdraw: true,
    suggestedAmounts: [500, 1000, 2000, 2500, 5000],
  },
  // Gift Only - African
  {
    code: 'EGP',
    symbol: 'E£',
    label: 'Egyptian Pound',
    country: 'Egypt',
    flag: '🇪🇬',
    canCreate: false,
    canWithdraw: false,
    suggestedAmounts: [50, 100, 200, 500, 1000],
  },
  {
    code: 'MAD',
    symbol: 'DH',
    label: 'Moroccan Dirham',
    country: 'Morocco',
    flag: '🇲🇦',
    canCreate: false,
    canWithdraw: false,
    suggestedAmounts: [50, 100, 200, 500, 1000],
  },
  {
    code: 'RWF',
    symbol: 'FRw',
    label: 'Rwandan Franc',
    country: 'Rwanda',
    flag: '🇷🇼',
    canCreate: false,
    canWithdraw: false,
    suggestedAmounts: [1000, 2000, 5000, 10000, 20000],
  },
  // Gift Only - Asian
  {
    code: 'INR',
    symbol: '₹',
    label: 'Indian Rupee',
    country: 'India',
    flag: '🇮🇳',
    canCreate: false,
    canWithdraw: false,
    suggestedAmounts: [50, 100, 200, 300, 500],
  },
  {
    code: 'CNY',
    symbol: '¥',
    label: 'Chinese Yuan',
    country: 'China',
    flag: '🇨🇳',
    canCreate: false,
    canWithdraw: false,
    suggestedAmounts: [10, 20, 50, 100, 200],
  },
  {
    code: 'JPY',
    symbol: '¥',
    label: 'Japanese Yen',
    country: 'Japan',
    flag: '🇯🇵',
    canCreate: false,
    canWithdraw: false,
    suggestedAmounts: [500, 1000, 2000, 5000, 10000],
  },
  {
    code: 'SGD',
    symbol: 'S$',
    label: 'Singapore Dollar',
    country: 'Singapore',
    flag: '🇸🇬',
    canCreate: false,
    canWithdraw: false,
    suggestedAmounts: [2, 5, 10, 20, 50],
  },
  // Gift Only - Global
  {
    code: 'USD',
    symbol: '$',
    label: 'US Dollar',
    country: 'United States',
    flag: '🇺🇸',
    canCreate: false,
    canWithdraw: false,
    suggestedAmounts: [2, 5, 10, 20, 50],
  },
  {
    code: 'GBP',
    symbol: '£',
    label: 'British Pound',
    country: 'United Kingdom',
    flag: '🇬🇧',
    canCreate: false,
    canWithdraw: false,
    suggestedAmounts: [2, 5, 10, 20, 50],
  },
  {
    code: 'EUR',
    symbol: '€',
    label: 'Euro',
    country: 'European Union',
    flag: '🇪🇺',
    canCreate: false,
    canWithdraw: false,
    suggestedAmounts: [2, 5, 10, 20, 50],
  },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]['code'];

export const getCurrencySymbol = (code: string) => {
  return (
    SUPPORTED_CURRENCIES.find(c => c.code === code.toUpperCase())?.symbol || '$'
  );
};

export const getCurrencyMetadata = (code: string) => {
  return SUPPORTED_CURRENCIES.find(c => c.code === code);
};

export const getCurrencyByCountry = (countryName?: string | null): string => {
  if (!countryName || !countryName.trim()) return 'NGN';
  const match = SUPPORTED_CURRENCIES.find(
    c => c.country.toLowerCase() === countryName.trim().toLowerCase(),
  );
  return match?.code || 'NGN';
};

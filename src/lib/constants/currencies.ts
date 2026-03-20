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
  },
  {
    code: 'GHS',
    symbol: 'GH₵',
    label: 'Ghanaian Cedi',
    country: 'Ghana',
    flag: '🇬🇭',
    canCreate: true,
    canWithdraw: true,
  },
  {
    code: 'KES',
    symbol: 'KSh',
    label: 'Kenyan Shilling',
    country: 'Kenya',
    flag: '🇰🇪',
    canCreate: true,
    canWithdraw: true,
  },
  {
    code: 'ZAR',
    symbol: 'R',
    label: 'South African Rand',
    country: 'South Africa',
    flag: '🇿🇦',
    canCreate: true,
    canWithdraw: true,
  },
  {
    code: 'XOF',
    symbol: 'CFA',
    label: 'CFA Franc',
    country: "Cote d'Ivoire",
    flag: '🇨🇮',
    canCreate: true,
    canWithdraw: true,
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
  },
  {
    code: 'MAD',
    symbol: 'DH',
    label: 'Moroccan Dirham',
    country: 'Morocco',
    flag: '🇲🇦',
    canCreate: false,
    canWithdraw: false,
  },
  {
    code: 'RWF',
    symbol: 'FRw',
    label: 'Rwandan Franc',
    country: 'Rwanda',
    flag: '🇷🇼',
    canCreate: false,
    canWithdraw: false,
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
  },
  {
    code: 'CNY',
    symbol: '¥',
    label: 'Chinese Yuan',
    country: 'China',
    flag: '🇨🇳',
    canCreate: false,
    canWithdraw: false,
  },
  {
    code: 'JPY',
    symbol: '¥',
    label: 'Japanese Yen',
    country: 'Japan',
    flag: '🇯🇵',
    canCreate: false,
    canWithdraw: false,
  },
  {
    code: 'SGD',
    symbol: 'S$',
    label: 'Singapore Dollar',
    country: 'Singapore',
    flag: '🇸🇬',
    canCreate: false,
    canWithdraw: false,
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
  },
  {
    code: 'GBP',
    symbol: '£',
    label: 'British Pound',
    country: 'United Kingdom',
    flag: '🇬🇧',
    canCreate: false,
    canWithdraw: false,
  },
  {
    code: 'EUR',
    symbol: '€',
    label: 'Euro',
    country: 'European Union',
    flag: '🇪🇺',
    canCreate: false,
    canWithdraw: false,
  },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]['code'];

export const getCurrencySymbol = (code: string) => {
  return SUPPORTED_CURRENCIES.find(c => c.code === code)?.symbol || '$';
};

export const getCurrencyMetadata = (code: string) => {
  return SUPPORTED_CURRENCIES.find(c => c.code === code);
};

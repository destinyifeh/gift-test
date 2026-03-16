export const initialProducts = [
  {
    id: 1,
    name: 'Spa Gift Card',
    price: 50,
    sold: 142,
    status: 'active',
    description: 'Relaxing spa experience',
    image:
      'https://images.unsplash.com/photo-1544161515-4ae6ce6db87e?w=800&auto=format&fit=crop&q=60',
    category: 'spa',
    type: 'digital',
  },
  {
    id: 2,
    name: 'Deluxe Massage Voucher',
    price: 80,
    sold: 89,
    status: 'active',
    description: 'Full body massage',
    image:
      'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&auto=format&fit=crop&q=60',
    category: 'spa',
    type: 'digital',
  },
  {
    id: 3,
    name: 'Couples Package',
    price: 120,
    sold: 34,
    status: 'draft',
    description: 'Romantic couples spa day',
    image:
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&auto=format&fit=crop&q=60',
    category: 'spa',
    type: 'digital',
  },
];

export const redeemCodes = [
  {
    code: 'SPA-4821',
    product: 'Spa Gift Card',
    status: 'active',
    buyer: 'John D.',
  },
  {
    code: 'SPA-9173',
    product: 'Deluxe Massage',
    status: 'redeemed',
    buyer: 'Sarah M.',
  },
  {
    code: 'SPA-2634',
    product: 'Spa Gift Card',
    status: 'expired',
    buyer: 'Mike R.',
  },
];

export const orders = [
  {
    id: '#ORD-001',
    product: 'Spa Gift Card',
    buyer: 'John D.',
    amount: 50,
    date: '2026-03-08',
    status: 'completed',
  },
  {
    id: '#ORD-002',
    product: 'Deluxe Massage',
    buyer: 'Sarah M.',
    amount: 80,
    date: '2026-03-07',
    status: 'completed',
  },
  {
    id: '#ORD-003',
    product: 'Couples Package',
    buyer: 'Alex K.',
    amount: 120,
    date: '2026-03-06',
    status: 'pending',
  },
];

export const vendorWallet = {
  available: 420,
  pending: 180,
  totalSales: 2340,
  transactions: [
    {
      id: 1,
      type: 'sale',
      desc: 'Spa Gift Card — John D.',
      amount: 50,
      date: '2026-03-08',
    },
    {
      id: 2,
      type: 'sale',
      desc: 'Deluxe Massage — Sarah M.',
      amount: 80,
      date: '2026-03-07',
    },
    {
      id: 3,
      type: 'redeemed',
      desc: 'SPA-9173 redeemed',
      amount: 0,
      date: '2026-03-07',
    },
    {
      id: 4,
      type: 'withdrawal',
      desc: 'Withdrawal to Bank',
      amount: -200,
      date: '2026-03-05',
    },
    {
      id: 5,
      type: 'sale',
      desc: 'Couples Package — Alex K.',
      amount: 120,
      date: '2026-03-06',
    },
  ],
};

export const initialBankAccounts = [
  {
    id: 1,
    bankName: 'Business Bank',
    accountNumber: '••••••••5678',
    holderName: 'Relax Spa Ltd.',
    country: 'Nigeria',
    isPrimary: true,
  },
];

export type Product = (typeof initialProducts)[0];
export type Order = (typeof orders)[0];
export type RedeemCode = (typeof redeemCodes)[0];
export type Transaction = (typeof vendorWallet.transactions)[0];
export type BankAccount = (typeof initialBankAccounts)[0];

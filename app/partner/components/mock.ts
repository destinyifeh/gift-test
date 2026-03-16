export interface PartnerStats {
  totalGifts: number;
  creatorsCount: number;
  contributorsCount: number;
  totalRevenue: number;
  platformEarnings: number;
}

export interface PartnerCreator {
  id: number;
  name: string;
  email: string;
  totalGifts: number;
  walletBalance: number;
  status: 'active' | 'pending' | 'suspended';
}

export interface PartnerTransaction {
  id: string;
  sender: string;
  recipient: string;
  amount: number;
  platformFee: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

export interface PartnerPayout {
  creator: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed';
}

export const partnerStats: PartnerStats = {
  totalGifts: 120000,
  creatorsCount: 850,
  contributorsCount: 4200,
  totalRevenue: 156000,
  platformEarnings: 6200,
};

export const partnerCreators: PartnerCreator[] = [
  {
    id: 1,
    name: 'John Writer',
    email: 'john@writer.com',
    totalGifts: 540,
    walletBalance: 120,
    status: 'active',
  },
  {
    id: 2,
    name: 'Sarah Blogger',
    email: 'sarah@blog.com',
    totalGifts: 210,
    walletBalance: 45,
    status: 'active',
  },
  {
    id: 3,
    name: 'Mark Dev',
    email: 'mark@dev.io',
    totalGifts: 1200,
    walletBalance: 850,
    status: 'active',
  },
];

export const partnerTransactions: PartnerTransaction[] = [
  {
    id: '#2345',
    sender: 'John',
    recipient: 'Sarah',
    amount: 50,
    platformFee: 2,
    status: 'completed',
    date: '2026-03-15',
  },
  {
    id: '#2346',
    sender: 'Alice',
    recipient: 'Mark',
    amount: 100,
    platformFee: 4,
    status: 'completed',
    date: '2026-03-14',
  },
];

export const partnerPayouts: PartnerPayout[] = [
  {
    creator: 'Mark Dev',
    amount: 500,
    date: '2026-03-10',
    status: 'paid',
  },
  {
    creator: 'John Writer',
    amount: 300,
    date: '2026-03-12',
    status: 'pending',
  },
];

'use client';

import Navbar from '@/components/landing/Navbar';
import {RequireVendor} from '@/components/guards';
import {RoleSwitcher} from '@/components/RoleSwitcher';
import {useIsMobile} from '@/hooks/use-mobile';
import {useProfile} from '@/hooks/use-profile';
import {useVendorWallet} from '@/hooks/use-vendor';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {formatCurrency} from '@/lib/utils/currency';
import {cn} from '@/lib/utils';
import {
  CreditCard,
  DollarSign,
  Package,
  QrCode,
  ShoppingCart,
  Store,
  Wallet,
} from 'lucide-react';
import {useState} from 'react';
import {CodesTab} from './components/CodesTab';
import {OrdersTab} from './components/OrdersTab';
import {ProductsTab} from './components/ProductsTab';
import {ShopTab} from './components/ShopTab';
import {WalletTab} from './components/WalletTab';

type VendorTab = 'products' | 'shop' | 'codes' | 'orders' | 'wallet';

const tabs = [
  {id: 'products' as const, label: 'Products', icon: Package},
  {id: 'shop' as const, label: 'Shop', icon: Store},
  {id: 'codes' as const, label: 'Codes', icon: QrCode},
  {id: 'orders' as const, label: 'Orders', icon: ShoppingCart},
  {id: 'wallet' as const, label: 'Wallet', icon: Wallet},
];

export default function VendorDashboardPage() {
  const {data: profile} = useProfile();
  const {data: stats, isLoading: statsLoading} = useVendorWallet();
  const [activeTab, setActiveTab] = useState<VendorTab>('products');
  const isMobile = useIsMobile();

  const currencyCode = getCurrencyByCountry(profile?.country || 'Nigeria');
  const currencySymbol = getCurrencySymbol(currencyCode);

  const statItems = [
    {
      label: 'Products',
      value: statsLoading ? '...' : stats?.productsCount || 0,
      icon: Package,
      color: 'text-primary bg-primary/10',
    },
    {
      label: 'Orders',
      value: statsLoading ? '...' : stats?.ordersCount || 0,
      icon: ShoppingCart,
      color: 'text-secondary bg-secondary/10',
    },
    {
      label: 'Revenue',
      value: statsLoading
        ? '...'
        : formatCurrency(stats?.totalSales || 0, currencyCode),
      icon: DollarSign,
      color: 'text-green-600 bg-green-500/10',
    },
    {
      label: 'Pending',
      value: statsLoading
        ? '...'
        : formatCurrency(stats?.pending || 0, currencyCode),
      icon: CreditCard,
      color: 'text-amber-600 bg-amber-500/10',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductsTab />;
      case 'shop':
        return <ShopTab />;
      case 'codes':
        return <CodesTab />;
      case 'orders':
        return <OrdersTab />;
      case 'wallet':
        return <WalletTab />;
      default:
        return null;
    }
  };

  return (
    <RequireVendor>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-14 pb-24 md:pt-20 md:pb-16">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-foreground">
                  Vendor Dashboard
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Manage your products, codes, and payouts
                </p>
              </div>
              <div className="w-full sm:w-auto">
                <RoleSwitcher />
              </div>
            </div>

            {/* Stats - Horizontal scroll on mobile */}
            <div className="mb-6 -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide md:grid md:grid-cols-4 md:gap-4">
                {statItems.map(s => (
                  <div
                    key={s.label}
                    className={cn(
                      'shrink-0 w-[140px] md:w-auto',
                      'p-3 md:p-4 rounded-xl',
                      'bg-card border border-border',
                    )}>
                    <div className="flex items-center gap-2.5 md:gap-3">
                      <div
                        className={cn(
                          'w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center',
                          s.color,
                        )}>
                        <s.icon className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div>
                        <p className="text-lg md:text-xl font-bold text-foreground">
                          {s.value}
                        </p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          {s.label}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Tabs */}
            <div className="hidden md:block mb-6">
              <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                        isActive
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground',
                      )}>
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[50vh]">{renderTabContent()}</div>
          </div>
        </div>

        {/* Mobile Bottom Tab Bar */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border pb-safe">
            <div className="flex items-center justify-around h-16">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'relative flex flex-col items-center justify-center',
                      'w-full h-full min-h-[48px]',
                      'transition-colors duration-200',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground active:text-foreground',
                    )}>
                    {isActive && (
                      <div className="absolute top-0 w-8 h-0.5 bg-primary rounded-full" />
                    )}
                    <Icon
                      className={cn(
                        'w-5 h-5 mb-1 transition-transform duration-200',
                        isActive && 'scale-110',
                      )}
                    />
                    <span
                      className={cn(
                        'text-[10px] font-medium',
                        isActive && 'font-semibold',
                      )}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </RequireVendor>
  );
}

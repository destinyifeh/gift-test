'use client';

import Navbar from '@/components/landing/Navbar';
import {RequireVendor} from '@/components/guards';
import {RoleSwitcher} from '@/components/RoleSwitcher';
import {Card, CardContent} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {useProfile} from '@/hooks/use-profile';
import {useVendorWallet} from '@/hooks/use-vendor';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {formatCurrency} from '@/lib/utils/currency';
import {CreditCard, DollarSign, Package, ShoppingCart} from 'lucide-react';
import {CodesTab} from './components/CodesTab';
import {OrdersTab} from './components/OrdersTab';
import {ProductsTab} from './components/ProductsTab';
import {ShopTab} from './components/ShopTab';
import {WalletTab} from './components/WalletTab';

export default function VendorDashboardPage() {
  const {data: profile} = useProfile();
  const {data: stats, isLoading: statsLoading} = useVendorWallet();

  const currencyCode = getCurrencyByCountry(profile?.country || 'Nigeria');
  const currencySymbol = getCurrencySymbol(currencyCode);

  return (
    <RequireVendor>
      <div className="min-h-screen bg-background">
        <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground">
                Vendor Dashboard
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage your products, codes, and payouts
              </p>
            </div>
            <div className="w-full sm:w-auto -mt-3 sm:mt-0">
              <RoleSwitcher />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {[
              {
                label: 'Products',
                value: statsLoading ? '...' : stats?.productsCount || 0,
                icon: Package,
              },
              {
                label: 'Total Orders',
                value: statsLoading ? '...' : stats?.ordersCount || 0,
                icon: ShoppingCart,
              },
              {
                label: 'Revenue',
                value: statsLoading
                  ? '...'
                  : formatCurrency(stats?.totalSales || 0, currencyCode),
                icon: DollarSign,
              },
              {
                label: 'Pending Payout',
                value: statsLoading
                  ? '...'
                  : formatCurrency(stats?.pending || 0, currencyCode),
                icon: CreditCard,
              },
            ].map(s => (
              <Card key={s.label} className="border-border">
                <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <s.icon className="w-4 sm:w-5 h-4 sm:h-5" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">
                      {s.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 max-w-lg">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="shop">Shop</TabsTrigger>
              <TabsTrigger value="codes">Codes</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <ProductsTab />
            </TabsContent>

            <TabsContent value="shop">
              <ShopTab />
            </TabsContent>

            <TabsContent value="codes">
              <CodesTab />
            </TabsContent>

            <TabsContent value="orders">
              <OrdersTab />
            </TabsContent>

            <TabsContent value="wallet">
              <WalletTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      </div>
    </RequireVendor>
  );
}

'use client';

import Navbar from '@/components/landing/Navbar';
import {Card, CardContent} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {CreditCard, DollarSign, Package, ShoppingCart} from 'lucide-react';
import {CodesTab} from './components/CodesTab';
import {OrdersTab} from './components/OrdersTab';
import {PayoutsTab} from './components/PayoutsTab';
import {ProductsTab} from './components/ProductsTab';
import {WalletTab} from './components/WalletTab';

export default function VendorDashboardPage() {
  return (
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
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {[
              {
                label: 'Products',
                value: '3',
                icon: Package,
              },
              {label: 'Total Orders', value: '265', icon: ShoppingCart},
              {label: 'Revenue', value: '$12,450', icon: DollarSign},
              {label: 'Pending Payout', value: '$2,340', icon: CreditCard},
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
            <TabsList className="grid w-full grid-cols-5 max-w-xl">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="codes">Codes</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <ProductsTab />
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

            <TabsContent value="payouts">
              <PayoutsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

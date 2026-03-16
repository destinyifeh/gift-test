'use client';

import Navbar from '@/components/landing/Navbar';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {
  BarChart3,
  Eye,
  FileBarChart,
  History,
  LayoutDashboard,
  Palette,
  Settings,
  Users,
  Wallet,
} from 'lucide-react';
import {AnalyticsTab} from './components/AnalyticsTab';
import {BrandingTab} from './components/BrandingTab';
import {CreatorsTab} from './components/CreatorsTab';
import {IntegrationTab} from './components/IntegrationTab';
import {OverviewTab} from './components/OverviewTab';
import {PayoutsTab} from './components/PayoutsTab';
import {RevenueTab} from './components/RevenueTab';
import {TransactionsTab} from './components/TransactionsTab';
import {WidgetTab} from './components/WidgetTab';

export default function PartnerDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-10 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-foreground mb-2">
              Partner Dashboard
            </h1>
            <p className="text-muted-foreground text-sm flex items-center justify-center sm:justify-start gap-2 font-body">
              Manage integrations, monitoring performance, and track earnings
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-8">
            <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              <TabsList className="h-12 inline-flex w-auto bg-muted/50 p-1 border border-border/50">
                <TabsTrigger
                  value="overview"
                  className="gap-2 px-4 h-10 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                  <LayoutDashboard className="w-4 h-4" /> Overview
                </TabsTrigger>
                <TabsTrigger
                  value="creators"
                  className="gap-2 px-4 h-10 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                  <Users className="w-4 h-4" /> Creators
                </TabsTrigger>
                <TabsTrigger
                  value="transactions"
                  className="gap-2 px-4 h-10 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                  <History className="w-4 h-4" /> Transactions
                </TabsTrigger>
                <TabsTrigger
                  value="revenue"
                  className="gap-2 px-4 h-10 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                  <Wallet className="w-4 h-4" /> Revenue
                </TabsTrigger>
                <TabsTrigger
                  value="payouts"
                  className="gap-2 px-4 h-10 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                  <FileBarChart className="w-4 h-4" /> Payouts
                </TabsTrigger>
                <TabsTrigger
                  value="integration"
                  className="gap-2 px-4 h-10 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                  <Settings className="w-4 h-4" /> Integration
                </TabsTrigger>
                <TabsTrigger
                  value="widget"
                  className="gap-2 px-4 h-10 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                  <Eye className="w-4 h-4" /> Widget
                </TabsTrigger>
                <TabsTrigger
                  value="branding"
                  className="gap-2 px-4 h-10 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                  <Palette className="w-4 h-4" /> Branding
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="gap-2 px-4 h-10 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                  <BarChart3 className="w-4 h-4" /> Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="overview"
              className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <OverviewTab />
            </TabsContent>

            <TabsContent
              value="creators"
              className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CreatorsTab />
            </TabsContent>

            <TabsContent
              value="transactions"
              className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <TransactionsTab />
            </TabsContent>

            <TabsContent
              value="revenue"
              className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <RevenueTab />
            </TabsContent>

            <TabsContent
              value="payouts"
              className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <PayoutsTab />
            </TabsContent>

            <TabsContent
              value="integration"
              className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <IntegrationTab />
            </TabsContent>

            <TabsContent
              value="widget"
              className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <WidgetTab />
            </TabsContent>

            <TabsContent
              value="branding"
              className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <BrandingTab />
            </TabsContent>

            <TabsContent
              value="analytics"
              className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <AnalyticsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

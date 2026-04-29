'use client';

import {useDashboardAnalytics, useUnclaimedGifts} from '@/hooks/use-analytics';
import {useUpdateCreatorStatus} from '@/hooks/use-auth';
import {useProfile} from '@/hooks/use-profile';
import {getCurrencyByCountry} from '@/lib/constants/currencies';
import {useUserStore} from '@/lib/store/useUserStore';
import {formatCurrency} from '@/lib/utils/currency';
import Link from 'next/link';
import {toast} from 'sonner';
import {SelectedSection} from '../dashboard-config';
import { cn } from '@/lib/utils';

interface V2OverviewTabProps {
  creatorEnabled: boolean;
  setCreatorEnabled: (enabled: boolean) => void;
  setSection: (section: SelectedSection) => void;
}

export function V2OverviewTab({creatorEnabled, setCreatorEnabled, setSection}: V2OverviewTabProps) {
  const user = useUserStore(state => state.user);
  const updateCreatorStatus = useUpdateCreatorStatus();

  const handleEnableCreator = async () => {
    updateCreatorStatus.mutate(true, {
      onSuccess: () => {
        setCreatorEnabled(true);
        setSection('gift-page');
        toast.success('Gift page enabled!');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to enable gift page');
      }
    });
  };

  const {data: analytics, isLoading} = useDashboardAnalytics();
  const {data: unclaimedRes} = useUnclaimedGifts();
  const {data: userProfile} = useProfile();

  const unclaimedGifts = unclaimedRes?.data || [];
  const unclaimedFlexCards = unclaimedRes?.flexCards || [];
  const profile = userProfile || null;
  const userCurrency = getCurrencyByCountry(profile?.country);

  // Categorize and count pending claims
  const flexCardCount = unclaimedFlexCards.length;
  const moneyGiftCount = unclaimedGifts.filter((g: any) => g.claimable_type?.toLowerCase() === 'money').length;
  const vendorGiftCount = unclaimedGifts.filter((g: any) => g.claimable_type?.toLowerCase() === 'gift-card').length;
  const totalPendingClaims = flexCardCount + unclaimedGifts.length;

  const stats = analytics || {
    giftsSent: 0,
    giftsReceived: 0,
    totalGiven: 0,
    campaignsCount: 0,
    recentActivity: {sent: [], received: []},
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading dashboard...</p>
      </div>
    );
  }

  const statusColorMap: Record<string, string> = {
    delivered: 'bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)]',
    pending: 'bg-[var(--v2-tertiary-container)] text-[var(--v2-on-tertiary-container)]',
    claimed: 'bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)]',
    unclaimed: 'bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)]',
    sent: 'bg-[var(--v2-primary-container)] text-[var(--v2-on-primary-container)]',
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Greeting Section - Mobile */}
      <section className="md:hidden">
        <p className="text-[var(--v2-on-surface-variant)] text-xs font-semibold opacity-60 mb-0.5">{getTimeGreeting()},</p>
        <h1 className="text-3xl font-black v2-headline tracking-tight text-[var(--v2-on-surface)]">
          {user?.display_name?.split(' ')[0] || 'Friend'}
        </h1>
      </section>

      {/* Desktop Header */}
      <section className="hidden md:block">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--v2-on-surface-variant)] font-black uppercase tracking-[0.2em] mb-2 opacity-50">
              Personal Command Center
            </p>
            <h1 className="text-4xl md:text-5xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
              {getTimeGreeting()}, {user?.display_name?.split(' ')[0] || 'Friend'}
            </h1>
            <p className="text-[var(--v2-on-surface-variant)] text-lg mt-2 font-medium opacity-60">
              Here's a snapshot of your gifting universe.
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="p-4 rounded-3xl bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--v2-primary)]/10 flex items-center justify-center">
                   <span className="v2-icon text-[var(--v2-primary)]">history</span>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-[var(--v2-on-surface-variant)] opacity-50 leading-none">Last sync</p>
                   <p className="text-xs font-bold text-[var(--v2-on-surface)]">Just now</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Unified Pending Claims Banner */}
      {totalPendingClaims > 0 && (
        <div className="relative group overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 v2-gradient-primary shadow-2xl shadow-[var(--v2-primary)]/20 transition-all duration-500">
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-[60px] -ml-24 -mb-24" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center md:items-center gap-4 md:gap-5">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-[1.5rem] bg-white/20 flex-shrink-0 flex items-center justify-center backdrop-blur-md shadow-inner">
                <span className="v2-icon text-2xl md:text-3xl text-white animate-bounce">redeem</span>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xl md:text-3xl font-black text-white v2-headline tracking-tight leading-tight">
                  {totalPendingClaims} Gift{totalPendingClaims > 1 ? 's' : ''} Awaiting You!
                </h3>
                <p className="text-white/70 font-medium text-xs md:text-base">Somebody's thinking about you. Claim them now.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
               {/* Breakdown Bubbles - Hidden on mobile, visible on desktop */}
               <div className="hidden md:flex -space-x-3">
                  {flexCardCount > 0 && (
                     <div title={`${flexCardCount} Flex Cards`} className="w-10 h-10 rounded-full bg-amber-400 border-[3px] border-white/10 flex items-center justify-center text-white shadow-lg">
                        <span className="v2-icon text-lg">account_balance_wallet</span>
                     </div>
                  )}
                  {vendorGiftCount > 0 && (
                     <div title={`${vendorGiftCount} Gift Cards`} className="w-10 h-10 rounded-full bg-purple-400 border-[3px] border-white/10 flex items-center justify-center text-white shadow-lg">
                        <span className="v2-icon text-lg">card_giftcard</span>
                     </div>
                  )}
                  {moneyGiftCount > 0 && (
                     <div title={`${moneyGiftCount} Cash Gifts`} className="w-10 h-10 rounded-full bg-emerald-400 border-[3px] border-white/10 flex items-center justify-center text-white shadow-lg">
                        <span className="v2-icon text-lg">payments</span>
                     </div>
                  )}
               </div>

               <Link
                 href="/claims"
                 className="w-full sm:w-auto px-8 h-12 md:h-14 bg-white text-gray-900 font-black rounded-xl md:rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] shadow-white/10 hover:shadow-2xl">
                 Claim All <span className="v2-icon">arrow_forward</span>
               </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid - Bento Style */}
      <div className="grid grid-cols-2 md:grid-cols-12 gap-4 md:gap-6">
        {/* Total Given - Large Premium Card */}
        <div className="col-span-2 md:col-span-8 p-8 md:p-10 rounded-[2.5rem] bg-[var(--v2-surface-container-high)] border border-[var(--v2-outline-variant)]/5 shadow-sm relative overflow-hidden group">
          <div className="relative z-10 hidden md:block">
            <p className="text-[var(--v2-on-surface-variant)] font-black uppercase tracking-[0.2em] text-xs opacity-50 mb-1">Impact Overview</p>
            <h3 className="text-lg font-bold v2-headline text-[var(--v2-on-surface)] mb-8">Total Contributions</h3>
            
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl md:text-6xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tighter">
                   {formatCurrency(stats.totalGiven, userCurrency)}
                </p>
                <div className="flex items-center gap-2 mt-4 text-[var(--v2-primary)] font-bold text-sm">
                   <span className="v2-icon text-sm">trending_up</span>
                   <span>Generosity Score: High</span>
                </div>
              </div>
              <button 
                onClick={() => setSection('wallet')}
                className="px-6 h-12 rounded-2xl bg-[var(--v2-primary)] text-white font-bold flex items-center gap-2 hover:opacity-90 transition-all">
                Wallet Details <span className="v2-icon">account_balance_wallet</span>
              </button>
            </div>
          </div>

          {/* Mobile version of Total Given */}
          <div className="md:hidden relative z-10">
             <p className="text-[var(--v2-on-surface-variant)] text-xs font-black uppercase tracking-widest opacity-50 mb-1">Total Given</p>
             <h2 className="text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tighter">
                {formatCurrency(stats.totalGiven, userCurrency)}
             </h2>
             <button 
                onClick={() => setSection('wallet')}
                className="mt-6 w-full h-12 rounded-xl border border-[var(--v2-outline-variant)] text-[var(--v2-on-surface)] font-bold text-sm">
                View Wallet
             </button>
          </div>

          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--v2-primary)]/5 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-[var(--v2-primary)]/10 transition-colors duration-700" />
          <span className="v2-icon absolute -right-8 -bottom-8 text-[var(--v2-on-surface-variant)]/5 text-[220px] pointer-events-none group-hover:scale-110 transition-transform duration-1000">redeem</span>
        </div>

        {/* Small Stats - Side-by-side on mobile, Stacked on Desktop */}
        <div className="col-span-2 md:col-span-4 grid grid-cols-2 md:flex md:flex-col gap-4 md:gap-6">
           {/* Gifts Sent */}
           <div className="p-5 md:p-6 rounded-[2rem] bg-[var(--v2-surface-container-lowest)] border border-[var(--v2-outline-variant)]/10 shadow-sm hover:border-[var(--v2-primary)]/20 transition-all group">
             <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--v2-secondary-container)]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <span className="v2-icon text-2xl text-[var(--v2-secondary)]">outbox</span>
                </div>
                <span className="v2-icon text-[var(--v2-on-surface-variant)] opacity-20 hidden md:inline">trending_up</span>
             </div>
             <p className="text-[var(--v2-on-surface-variant)] text-xs font-black uppercase tracking-widest opacity-60">Gifts Sent</p>
             <p className="text-2xl md:text-3xl font-black v2-headline text-[var(--v2-on-surface)] mt-1">
               {stats.giftsSent}
             </p>
           </div>

           {/* Gifts Received */}
           <div className="p-5 md:p-6 rounded-[2rem] bg-[var(--v2-surface-container-lowest)] border border-[var(--v2-outline-variant)]/10 shadow-sm hover:border-[var(--v2-tertiary)]/20 transition-all group">
             <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--v2-tertiary-container)]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <span className="v2-icon text-2xl text-[var(--v2-tertiary)]">move_to_inbox</span>
                </div>
                <span className="v2-icon text-[var(--v2-on-surface-variant)] opacity-20 hidden md:inline">celebration</span>
             </div>
             <p className="text-[var(--v2-on-surface-variant)] text-xs font-black uppercase tracking-widest opacity-60">Received</p>
             <p className="text-2xl md:text-3xl font-black v2-headline text-[var(--v2-on-surface)] mt-1">
               {stats.giftsReceived}
             </p>
           </div>
        </div>
      </div>

      {/* Main Secondary Grid (Actions & Activity) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
         
         {/* LEFT COLUMN: Actions & Campaigns */}
         <div className="md:col-span-5 space-y-8">
            {/* Quick Action Cards */}
            <section className="space-y-4">
               <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--v2-on-surface-variant)] opacity-50 ml-1">Launchbox</h3>
               
               <Link href="/send-gift" className="block group">
                 <div className="p-6 rounded-[2rem] bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/10 flex items-center gap-5 transition-all duration-300 hover:bg-[var(--v2-surface-container-high)] group-active:scale-[0.98]">
                   <div className="w-14 h-14 rounded-2xl v2-gradient-primary flex items-center justify-center text-white shadow-lg shadow-[var(--v2-primary)]/20 group-hover:rotate-12 transition-transform">
                     <span className="v2-icon text-2xl">send</span>
                   </div>
                   <div className="flex-1">
                     <h4 className="v2-headline font-black text-[var(--v2-on-surface)] text-lg">Send Gift</h4>
                     <p className="text-sm text-[var(--v2-on-surface-variant)] font-medium opacity-60">Instantly gift value to anyone</p>
                   </div>
                   <span className="v2-icon text-[var(--v2-primary)] opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_forward</span>
                 </div>
               </Link>

               <Link href="/create-campaign" className="block group">
                 <div className="p-6 rounded-[2rem] bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/10 flex items-center gap-5 transition-all duration-300 hover:bg-[var(--v2-surface-container-high)] group-active:scale-[0.98]">
                   <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-lg shadow-orange-500/10 group-hover:rotate-[-12deg] transition-transform">
                     <span className="v2-icon text-2xl">campaign</span>
                   </div>
                   <div className="flex-1">
                     <h4 className="v2-headline font-black text-[var(--v2-on-surface)] text-lg">New Campaign</h4>
                     <p className="text-sm text-[var(--v2-on-surface-variant)] font-medium opacity-60">Rally support for your goal</p>
                   </div>
                   <span className="v2-icon text-orange-600 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_forward</span>
                 </div>
               </Link>
            </section>

            {/* Campaign Summary */}
            <section className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-[var(--v2-outline-variant)]/5 relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-lg font-black v2-headline">Your Campaigns</h3>
                     <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                        <span className="v2-icon text-indigo-500 animate-pulse">analytics</span>
                     </div>
                  </div>

                  {stats.campaignsCount > 0 ? (
                     <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20">
                           <p className="text-xs font-black uppercase tracking-widest text-[var(--v2-on-surface-variant)] opacity-50">Active Now</p>
                           <p className="text-4xl font-black v2-headline mt-1">{stats.campaignsCount}</p>
                           <button 
                             onClick={() => setSection('campaigns')}
                             className="mt-4 flex items-center gap-2 text-[var(--v2-primary)] font-bold text-sm">
                              Manage Campaigns <span className="v2-icon text-sm">arrow_forward</span>
                           </button>
                        </div>
                     </div>
                  ) : (
                     <div className="text-center py-4">
                        <p className="text-[var(--v2-on-surface-variant)] font-medium opacity-60 mb-4 text-sm">You haven't started any campaigns yet.</p>
                        <Link href="/create-campaign" className="inline-flex items-center gap-2 text-[var(--v2-primary)] font-black text-sm uppercase tracking-widest">
                           Start One Now <span className="v2-icon text-sm">add</span>
                        </Link>
                     </div>
                  )}
               </div>
               {/* Background Glow */}
               <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            </section>
         </div>

         {/* RIGHT COLUMN: Recent Activity */}
         <div className="md:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--v2-on-surface-variant)] opacity-50">Recent Activity</h3>
               <span className="v2-icon text-[var(--v2-primary)] opacity-40">history</span>
            </div>

            <div className="rounded-[2.5rem] bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/5 p-2 overflow-hidden">
               {stats.recentActivity.sent.length === 0 && stats.recentActivity.received.length === 0 ? (
                  <div className="text-center py-16">
                     <div className="w-20 h-20 rounded-full bg-[var(--v2-surface-container-high)] flex items-center justify-center mx-auto mb-4 border border-[var(--v2-outline-variant)]/5">
                        <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)] opacity-30">inbox</span>
                     </div>
                     <p className="font-bold text-[var(--v2-on-surface)]">Clean Slate</p>
                     <p className="text-sm text-[var(--v2-on-surface-variant)] opacity-60">Your recent activity will appear here.</p>
                  </div>
               ) : (
                  <div className="divide-y divide-[var(--v2-outline-variant)]/5">
                     {[...stats.recentActivity.sent, ...stats.recentActivity.received].slice(0, 8).map((g: any, i) => (
                        <div key={g.id || i} className="group flex items-center justify-between p-3.5 md:p-5 transition-all hover:bg-[var(--v2-surface-container-high)]">
                           <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1 mr-3">
                              <div className={cn(
                                 "w-10 h-10 md:w-12 md:h-12 rounded-[1rem] md:rounded-2xl flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105",
                                 g.type === 'sent' || g.type?.includes('redemption') 
                                    ? 'bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]' 
                                    : 'bg-[var(--v2-secondary-container)]/30 text-[var(--v2-secondary)]'
                              )}>
                                 <span className="v2-icon text-lg md:text-xl">
                                    {g.type === 'sent' ? 'send' : (g.type?.includes('redemption') ? 'shopping_bag' : 'redeem')}
                                 </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                 <p className="font-black text-[var(--v2-on-surface)] truncate text-sm md:text-base leading-tight">{g.name}</p>
                                 <div className="text-[9px] md:text-xs font-bold text-[var(--v2-on-surface-variant)] opacity-50 flex items-center gap-1.5 uppercase tracking-normal md:tracking-widest mt-1">
                                   <span className="truncate">{g.giftCategory || g.type || 'Asset'}</span>
                                   <span className="w-0.5 h-0.5 rounded-full bg-current opacity-30 flex-shrink-0" />
                                   <span className="flex-shrink-0">{g.date}</span>
                                 </div>
                              </div>
                           </div>
                           <span className={cn(
                              "px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest flex-shrink-0 transition-all",
                              statusColorMap[g.status] || statusColorMap.pending,
                              "group-hover:md:px-4"
                           )}>
                              {g.status}
                           </span>
                        </div>
                     ))}
                  </div>
               )}
               {(stats.recentActivity.sent.length > 0 || stats.recentActivity.received.length > 0) && (
                  <div className="p-4 border-t border-[var(--v2-outline-variant)]/5">
                     <button className="w-full py-3 text-sm font-black text-[var(--v2-primary)] uppercase tracking-widest hover:bg-[var(--v2-primary)]/5 rounded-2xl transition-all">
                        View Full History
                     </button>
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* Creator CTA */}
      {!creatorEnabled && (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[var(--v2-surface-container-high)] border border-[var(--v2-primary)]/20 p-8 group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--v2-primary)]/5 rounded-full blur-[80px] -mr-32 -mt-32" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
              <div className="w-16 h-16 rounded-2xl bg-[var(--v2-primary)]/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span
                  className="v2-icon text-3xl text-[var(--v2-primary)]"
                  style={{fontVariationSettings: "'FILL' 1"}}>
                  auto_awesome
                </span>
              </div>
              <div className="max-w-md">
                <h3 className="text-2xl font-black text-[var(--v2-on-surface)] v2-headline tracking-tight">
                  Launch Your Personal Gift Hub
                </h3>
                <p className="text-[var(--v2-on-surface-variant)] font-medium mt-2 opacity-70">
                  Allow your community to send you appreciation gifts directly at 
                  <span className="text-[var(--v2-primary)] font-black italic ml-1">gifthance.com/{user?.username || 'user'}</span>
                </p>
              </div>
            </div>
            
            <button
               onClick={handleEnableCreator}
               className="w-full md:w-auto px-10 h-16 v2-btn-primary rounded-2xl font-black text-lg shadow-xl shadow-[var(--v2-primary)]/25 group-hover:shadow-2xl transition-all active:scale-[0.98]">
              Enable Page
            </button>
          </div>
        </div>
      )}

      {/* Global extra styles */}
      <style jsx global>{`
         .animate-bounce-slow {
            animation: bounce-slow 3s infinite ease-in-out;
         }
         @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
         }
      `}</style>
    </div>
  );
}

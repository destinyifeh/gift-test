'use client';

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {useReceivedGifts} from '@/hooks/use-analytics';
import {formatCurrency} from '@/lib/utils/currency';
import {useState} from 'react';
import {SelectedSection} from '../dashboard-config';

const statusConfig: Record<string, {bg: string; text: string; label: string}> = {
  success: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    label: 'Received',
  },
  delivered: {
    bg: 'bg-[var(--v2-secondary-container)]',
    text: 'text-[var(--v2-on-secondary-container)]',
    label: 'Received',
  },
  pending: {
    bg: 'bg-[var(--v2-tertiary-container)]',
    text: 'text-[var(--v2-on-tertiary-container)]',
    label: 'Processing',
  },
  claimed: {
    bg: 'bg-[var(--v2-secondary-container)]',
    text: 'text-[var(--v2-on-secondary-container)]',
    label: 'Received',
  },
  completed: {
    bg: 'bg-[var(--v2-secondary-container)]',
    text: 'text-[var(--v2-on-secondary-container)]',
    label: 'Completed',
  },
  failed: {
    bg: 'bg-[var(--v2-error-container)]',
    text: 'text-[var(--v2-on-error-container)]',
    label: 'Failed',
  },
};

interface V2ReceivedGiftsTabProps {
  setSection: (section: SelectedSection) => void;
  setWalletView: () => void;
}

export function V2ReceivedGiftsTab({setSection, setWalletView}: V2ReceivedGiftsTabProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedGift, setSelectedGift] = useState<any | null>(null);

  const [page, setPage] = useState(1);
  const {data: receivedRes, isLoading} = useReceivedGifts(page);

  const receivedGiftsList = receivedRes?.data || [];

  // Calculate stats
  const totalReceived = receivedGiftsList.length;
  const totalValue = receivedGiftsList.reduce((sum: number, g: any) => sum + (g.amount || 0), 0);
  const recentCount = receivedGiftsList.filter((g: any) => {
    const date = new Date(g.timestamp || g.date);
    const now = new Date();
    return now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000; // Last 7 days
  }).length;

  // Filter gifts
  const filteredGifts =
    filterStatus === 'all'
      ? receivedGiftsList
      : receivedGiftsList.filter((g: any) => g.status === filterStatus);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading received gifts...</p>
      </div>
    );
  }

  if (receivedGiftsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="w-20 h-20 bg-[var(--v2-secondary)]/10 rounded-[1.5rem] flex items-center justify-center mb-6">
          <span className="v2-icon text-4xl text-[var(--v2-secondary)]">volunteer_activism</span>
        </div>
        <h2 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
          No Donations Yet
        </h2>
        <p className="text-[var(--v2-on-surface-variant)] mb-8 max-w-[280px]">
          Donations from your campaigns will appear here. Create a campaign to start receiving support!
        </p>
        <button
          onClick={() => setSection('campaigns')}
          className="inline-flex items-center gap-2 px-6 h-12 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-2xl transition-transform active:scale-[0.98] shadow-lg shadow-[var(--v2-primary)]/20">
          <span className="v2-icon">campaign</span>
          Create Campaign
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Desktop */}
      <div className="hidden md:block">
        <p className="text-xs text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
          Campaign Management
        </p>
        <h1 className="text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)] tracking-tight">
          Campaign Donations
        </h1>
        <p className="text-[var(--v2-on-surface-variant)] mt-1">
          View all donations received from your campaigns. Your supporters are making a difference!
        </p>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <p className="text-xs text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
          Campaigns
        </p>
        <h1 className="text-2xl font-extrabold v2-headline text-[var(--v2-on-surface)] tracking-tight">
          Campaign Donations
        </h1>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">
          Track donations from your supporters in real-time.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Total Donations */}
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-[1.25rem] md:rounded-[1.5rem] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[var(--v2-secondary)]/10 flex items-center justify-center mb-3">
            <span className="v2-icon text-[var(--v2-secondary)]">volunteer_activism</span>
          </div>
          <p className="text-[10px] md:text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
            Total Donations
          </p>
          <p className="text-2xl md:text-3xl font-extrabold text-[var(--v2-on-surface)] tracking-tight v2-headline">
            {totalReceived}
          </p>
        </div>

        {/* Total Value */}
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-[1.25rem] md:rounded-[1.5rem] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center mb-3">
            <span className="v2-icon text-[var(--v2-primary)]">payments</span>
          </div>
          <p className="text-[10px] md:text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
            Total Raised
          </p>
          <p className="text-2xl md:text-3xl font-extrabold text-[var(--v2-on-surface)] tracking-tight v2-headline">
            {formatCurrency(totalValue, 'NGN')}
          </p>
        </div>

        {/* Recent Donations - Desktop only as highlight */}
        <div className="hidden md:block col-span-2 v2-gradient-primary rounded-[1.5rem] p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6 blur-xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-white/70 font-semibold text-xs uppercase tracking-wider">
                This Week
              </p>
              <p className="text-3xl font-extrabold text-white v2-headline">+{recentCount} Donations</p>
            </div>
            <span className="v2-icon text-5xl text-white/20">volunteer_activism</span>
          </div>
        </div>

        {/* Recent - Mobile */}
        <div className="md:hidden bg-[var(--v2-surface-container-lowest)] p-4 rounded-[1.25rem] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[var(--v2-tertiary)]/10 flex items-center justify-center mb-3">
            <span className="v2-icon text-[var(--v2-tertiary)]">schedule</span>
          </div>
          <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
            This Week
          </p>
          <p className="text-2xl font-extrabold text-[var(--v2-on-surface)] tracking-tight v2-headline">
            {recentCount}
          </p>
        </div>
      </div>

      {/* Filter Tabs - Desktop */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex gap-2">
          {['all', 'pending', 'success', 'failed'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                filterStatus === status
                  ? 'bg-[var(--v2-primary)] text-white'
                  : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)]'
              }`}>
              {status === 'all' ? 'All Donations' : status === 'success' ? 'Received' : status === 'failed' ? 'Failed' : 'Processing'}
            </button>
          ))}
        </div>
      </div>

      {/* Donation List Container */}
      <div className="bg-[var(--v2-surface-container-low)] rounded-[2rem] p-3 md:p-6">
        {/* Desktop List Header */}
        <div className="hidden md:flex items-center justify-between mb-6 px-2">
          <h2 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)]">Recent Donations</h2>
          <span className="text-sm text-[var(--v2-on-surface-variant)]">
            Showing {filteredGifts.length} donations
          </span>
        </div>

        <div className="space-y-2 md:space-y-3">
          {filteredGifts.map((g: any) => {
            const status = statusConfig[g.status] || statusConfig.pending;

            return (
              <button
                key={g.id}
                onClick={() => setSelectedGift(g)}
                className="w-full flex items-center gap-4 p-4 md:p-5 rounded-[1.5rem] bg-[var(--v2-surface-container-lowest)] hover:shadow-md transition-all group text-left cursor-pointer">
                {/* Donation Icon */}
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[var(--v2-secondary)]/10 flex items-center justify-center flex-shrink-0">
                  <span
                    className="v2-icon text-2xl md:text-3xl text-[var(--v2-secondary)]"
                    style={{fontVariationSettings: "'FILL' 1"}}>
                    redeem
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {/* Main Title */}
                      <h3 className="font-bold text-[var(--v2-on-surface)] text-base md:text-lg group-hover:text-[var(--v2-primary)] transition-colors">
                        Campaign Contribution
                      </h3>
                      {/* Campaign name, From, Date */}
                      <p className="text-xs md:text-sm text-[var(--v2-on-surface-variant)] truncate">
                        Campaign: <span className="font-medium">{g.campaignName || g.name || 'Campaign'}</span> • From: <span className="font-medium">{g.sender || 'Anonymous'}</span> • {g.date}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider flex-shrink-0 ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 md:mt-3">
                    <p className="text-lg md:text-2xl font-extrabold text-[var(--v2-on-surface)] v2-headline">
                      {formatCurrency(g.amount, g.currency)}
                    </p>
                    <span className="hidden md:flex px-5 py-2 bg-[var(--v2-surface-container-high)] text-[var(--v2-primary)] font-bold rounded-xl group-hover:bg-[var(--v2-surface-container-highest)] transition-colors text-sm">
                      Details
                    </span>
                    <span className="md:hidden text-sm font-bold text-[var(--v2-primary)] flex items-center gap-0.5">
                      <span className="v2-icon text-sm">chevron_right</span>
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>



      {/* Donation Detail Modal */}
      <ResponsiveModal open={!!selectedGift} onOpenChange={open => !open && setSelectedGift(null)}>
        <ResponsiveModalContent className="bg-[var(--v2-surface)] md:max-w-[480px]">
          <ResponsiveModalHeader className="border-b border-[var(--v2-outline-variant)]/10">
            <ResponsiveModalTitle className="text-xl font-bold v2-headline text-[var(--v2-on-surface)]">
              Donation Details
            </ResponsiveModalTitle>
          </ResponsiveModalHeader>

          {selectedGift && (
            <div className="p-4 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* Donation Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[var(--v2-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <span
                    className="v2-icon text-3xl text-[var(--v2-primary)]"
                    style={{fontVariationSettings: "'FILL' 1"}}>
                    volunteer_activism
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] truncate">
                    {selectedGift.campaignName || selectedGift.name || 'Campaign Donation'}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase mt-1 ${
                      (statusConfig[selectedGift.status] || statusConfig.pending).bg
                    } ${(statusConfig[selectedGift.status] || statusConfig.pending).text}`}>
                    {(statusConfig[selectedGift.status] || statusConfig.pending).label}
                  </span>
                </div>
              </div>

              {/* Donation Amount */}
              <div className="p-4 rounded-2xl bg-[var(--v2-primary)]/10 text-center">
                <p className="text-sm text-[var(--v2-on-surface-variant)] mb-1">Donation Amount</p>
                <p className="text-3xl font-bold text-[var(--v2-primary)] v2-headline">
                  {formatCurrency(selectedGift.amount, selectedGift.currency)}
                </p>
              </div>

              {/* Donation Info */}
              <div className="space-y-3">
                {/* Campaign */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
                  <div className="flex items-center gap-2">
                    <span className="v2-icon text-[var(--v2-on-surface-variant)]">campaign</span>
                    <span className="text-sm text-[var(--v2-on-surface-variant)]">Campaign</span>
                  </div>
                  <span className="text-sm font-medium text-[var(--v2-on-surface)] truncate max-w-[180px]">
                    {selectedGift.campaignName || selectedGift.name || 'Campaign'}
                  </span>
                </div>
                {/* Donor */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
                  <div className="flex items-center gap-2">
                    <span className="v2-icon text-[var(--v2-on-surface-variant)]">person</span>
                    <span className="text-sm text-[var(--v2-on-surface-variant)]">Donor</span>
                  </div>
                  <span className="text-sm font-medium text-[var(--v2-on-surface)]">
                    {selectedGift.sender || 'Anonymous Supporter'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
                  <div className="flex items-center gap-2">
                    <span className="v2-icon text-[var(--v2-on-surface-variant)]">calendar_today</span>
                    <span className="text-sm text-[var(--v2-on-surface-variant)]">Date</span>
                  </div>
                  <span className="text-sm font-medium text-[var(--v2-on-surface)]">
                    {selectedGift.date}
                  </span>
                </div>
                {selectedGift.message && (
                  <div className="p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="v2-icon text-[var(--v2-on-surface-variant)]">chat</span>
                      <span className="text-sm text-[var(--v2-on-surface-variant)]">Message from Donor</span>
                    </div>
                    <p className="text-sm text-[var(--v2-on-surface)] italic">"{selectedGift.message}"</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[var(--v2-outline-variant)]/10 space-y-3">
                <button
                  onClick={() => setWalletView()}
                  className="w-full h-12 v2-hero-gradient text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg">
                  <span className="v2-icon">account_balance_wallet</span>
                  View in Wallet
                </button>
                <button
                  onClick={() => setSelectedGift(null)}
                  className="w-full h-12 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[var(--v2-surface-container-high)] transition-colors">
                  Close
                </button>
              </div>
            </div>
          )}
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}

'use client';

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {useSentGifts, useResendGift, useEditRecipient} from '@/hooks/use-analytics';
import {formatCurrency} from '@/lib/utils/currency';
import Link from 'next/link';
import {useState} from 'react';
import {toast} from 'sonner';

const statusConfig: Record<string, {bg: string; text: string; label: string; icon: string}> = {
  delivered: {
    bg: 'bg-[var(--v2-secondary-container)]',
    text: 'text-[var(--v2-on-secondary-container)]',
    label: 'Delivered',
    icon: 'check_circle',
  },
  scheduled: {
    bg: 'bg-[var(--v2-tertiary-container)]',
    text: 'text-[var(--v2-on-tertiary-container)]',
    label: 'Scheduled',
    icon: 'schedule',
  },
  pending: {
    bg: 'bg-[var(--v2-secondary-container)]',
    text: 'text-[var(--v2-on-secondary-container)]',
    label: 'Sent',
    icon: 'mail',
  },
  claimed: {
    bg: 'bg-[var(--v2-primary-container)]',
    text: 'text-[var(--v2-on-primary-container)]',
    label: 'Claimed',
    icon: 'verified',
  },
  redeemed: {
    bg: 'bg-[var(--v2-primary-container)]',
    text: 'text-[var(--v2-on-primary-container)]',
    label: 'Claimed',
    icon: 'verified',
  },
  used: {
    bg: 'bg-[var(--v2-tertiary-container)]',
    text: 'text-[var(--v2-on-tertiary-container)]',
    label: 'Spent',
    icon: 'payments',
  },
  partially_used: {
    bg: 'bg-[var(--v2-tertiary-container)]',
    text: 'text-[var(--v2-on-tertiary-container)]',
    label: 'Partially Spent',
    icon: 'clock_loader_40',
  },
};

export function V2SentGiftsTab() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedGift, setSelectedGift] = useState<any | null>(null);

  const [page, setPage] = useState(1);
  const {data: sentRes, isLoading, refetch} = useSentGifts(page);
  const {mutateAsync: resendGift} = useResendGift();
  const {mutateAsync: editRecipient} = useEditRecipient();

  const [isResending, setIsResending] = useState(false);
  const [isEditingRecipient, setIsEditingRecipient] = useState(false);
  const [isSavingRecipient, setIsSavingRecipient] = useState(false);
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [newRecipientPhone, setNewRecipientPhone] = useState('');

  const sentGiftsData = sentRes?.data || [];
  const sentGiftsList = sentGiftsData;

  // Calculate stats
  const pagination = sentRes?.pagination || { totalCount: 0, totalPages: 1 };
  const totalSent = pagination.totalCount;
  const totalValue = sentRes?.totalSum || 0;
  const unclaimedCount = sentGiftsList.filter((g: any) => g.status === 'scheduled' || g.status === 'pending').length;

  const handleResend = async (gift: any) => {
    try {
      setIsResending(true);
      await resendGift({ giftId: gift.id, giftType: gift.type });
      toast.success('Gift notification resent successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to resend gift');
    } finally {
      setIsResending(false);
    }
  };

  const handleSaveRecipient = async () => {
    if (!newRecipientEmail && !newRecipientPhone) {
      toast.error('Please enter an email or phone number');
      return;
    }
    
    try {
      setIsSavingRecipient(true);
      const isPhone = newRecipientEmail.startsWith('+') || (/^\d+$/.test(newRecipientEmail) && newRecipientEmail.length > 8);
      const payload: any = { 
        giftId: selectedGift.id, 
        giftType: selectedGift.type 
      };
      
      if (isPhone) {
        payload.phone = newRecipientEmail;
      } else {
        payload.email = newRecipientEmail;
      }
      
      await editRecipient(payload);
      toast.success('Recipient updated and gift resent!');
      setIsEditingRecipient(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update recipient');
    } finally {
      setIsSavingRecipient(false);
    }
  };

  // Filter gifts
  const filteredGifts =
    filterStatus === 'all'
      ? sentGiftsList
      : sentGiftsList.filter((g: any) => g.status === filterStatus);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading sent gifts...</p>
      </div>
    );
  }

  if (sentGiftsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="w-20 h-20 bg-[var(--v2-primary)]/10 rounded-[1.5rem] flex items-center justify-center mb-6">
          <span className="v2-icon text-4xl text-[var(--v2-primary)]">send</span>
        </div>
        <h2 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
          No Sent Gifts Yet
        </h2>
        <p className="text-[var(--v2-on-surface-variant)] mb-8 max-w-[280px]">
          You haven't sent any gifts yet. Brighten someone's day!
        </p>
        <Link
          href="/send-gift"
          className="inline-flex items-center gap-2 px-6 h-12 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-2xl transition-transform active:scale-[0.98] shadow-lg shadow-[var(--v2-primary)]/20">
          <span className="v2-icon">send</span>
          Send a Gift
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Desktop */}
      <div className="hidden md:block">
        <p className="text-xs text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
          Management Suite
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold v2-headline text-[var(--v2-on-surface)] tracking-tight">
          Sent Gifts
        </h1>
        <p className="text-[var(--v2-on-surface-variant)] mt-1 max-w-xl">
          Track and manage all the gifts you've sent.
        </p>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <p className="text-xs text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-1">
          Management
        </p>
        <h1 className="text-2xl font-extrabold v2-headline text-[var(--v2-on-surface)] tracking-tight">
          Sent Gifts
        </h1>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">
          Tracking your generosity in real-time.
        </p>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {/* Total Sent */}
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-[1.25rem] md:rounded-[1.5rem] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center mb-3">
            <span className="v2-icon text-[var(--v2-primary)]">send</span>
          </div>
          <p className="text-[10px] md:text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
            Total Sent
          </p>
          <p className="text-2xl md:text-3xl font-extrabold text-[var(--v2-on-surface)] tracking-tight v2-headline">
            {totalSent}
          </p>
        </div>

        {/* Total Value */}
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-[1.25rem] md:rounded-[1.5rem] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[var(--v2-secondary)]/10 flex items-center justify-center mb-3">
            <span className="v2-icon text-[var(--v2-secondary)]">payments</span>
          </div>
          <p className="text-[10px] md:text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
            Total Value
          </p>
          <p className="text-2xl md:text-3xl font-extrabold text-[var(--v2-on-surface)] tracking-tight v2-headline">
            {formatCurrency(totalValue, 'NGN')}
          </p>
        </div>

        {/* Scheduled Gifts - Desktop highlight */}
        <div className="hidden md:block col-span-1 v2-gradient-primary rounded-[1.5rem] p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6 blur-xl" />
          <div className="relative z-10">
            <span
              className="v2-icon text-white/80 mb-2 block"
              style={{fontVariationSettings: "'FILL' 1"}}>
              pending_actions
            </span>
            <p className="text-white/70 font-semibold text-xs uppercase tracking-wider">
              Unclaimed
            </p>
            <p className="text-3xl font-extrabold text-white v2-headline">{unclaimedCount} Gifts</p>
          </div>
        </div>
      </div>

      {/* Scheduled Count - Mobile only */}
      <div className="md:hidden flex items-center justify-between p-4 rounded-2xl bg-[var(--v2-tertiary-container)]/30">
        <div className="flex items-center gap-3">
          <span className="v2-icon text-[var(--v2-tertiary)]">pending_actions</span>
          <span className="font-medium text-[var(--v2-on-surface)]">{unclaimedCount} unclaimed gifts</span>
        </div>
        <span className="v2-icon text-[var(--v2-on-surface-variant)]">chevron_right</span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'pending', 'claimed', 'used', 'delivered'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
              filterStatus === status
                ? 'bg-[var(--v2-primary)] text-white'
                : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)]'
            }`}>
            {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Gift List Container */}
      <div className="bg-[var(--v2-surface-container-low)] rounded-[2rem] p-3 md:p-4">
        <div className="hidden md:flex items-center justify-between mb-4 px-2">
          <h2 className="text-lg font-bold v2-headline text-[var(--v2-on-surface)]">
            Recent Gifts
          </h2>
          <span className="text-sm text-[var(--v2-on-surface-variant)]">
            Showing {filteredGifts.length} gifts
          </span>
        </div>

        <div className="space-y-2">
          {filteredGifts.map((g: any) => {
            const status = statusConfig[g.status] || statusConfig.pending;

            return (
              <button
                key={g.id}
                onClick={() => {
                  setSelectedGift(g);
                  setIsEditingRecipient(false);
                  setNewRecipientEmail(g.recipient || '');
                }}
                className="w-full flex items-center gap-4 p-4 md:p-5 rounded-[1.5rem] bg-[var(--v2-surface-container-lowest)] hover:shadow-md transition-all group text-left cursor-pointer">
                {/* Gift Icon/Image */}
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[var(--v2-primary)]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <span
                    className="v2-icon text-2xl md:text-3xl text-[var(--v2-primary)]"
                    style={{fontVariationSettings: "'FILL' 1"}}>
                    {status.icon || 'redeem'}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-[var(--v2-on-surface)] text-base md:text-lg truncate group-hover:text-[var(--v2-primary)] transition-colors">
                        {g.name || 'Gift'}
                      </h3>
                      <p className="text-xs md:text-sm text-[var(--v2-on-surface-variant)]">
                        To: <span className="font-medium text-[var(--v2-primary)]">{g.recipient || 'Anonymous'}</span> • {new Date(g.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${status.bg} ${status.text}`}>
                      <span className="v2-icon text-xs hidden md:inline">{status.icon}</span>
                      {status.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 md:mt-3">
                    <p className="text-lg md:text-xl font-extrabold text-[var(--v2-on-surface)] v2-headline">
                      {formatCurrency(g.amount, g.currency)}
                    </p>
                    <span className="hidden md:flex text-sm font-bold text-[var(--v2-primary)] items-center gap-1 group-hover:underline">
                      Details
                      <span className="v2-icon text-sm">chevron_right</span>
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

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 px-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] font-bold text-sm disabled:opacity-30 transition-all border border-[var(--v2-outline-variant)]/10">
              <span className="v2-icon text-sm">arrow_back</span>
              Previous
            </button>
            <span className="text-sm font-bold text-[var(--v2-on-surface-variant)]">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] font-bold text-sm disabled:opacity-30 transition-all border border-[var(--v2-outline-variant)]/10">
              Next
              <span className="v2-icon text-sm">arrow_forward</span>
            </button>
          </div>
        )}
      </div>



      {/* Gift Detail Modal */}
      <ResponsiveModal open={!!selectedGift} onOpenChange={open => !open && setSelectedGift(null)}>
        <ResponsiveModalContent className="bg-[var(--v2-surface)] md:max-w-[480px]">
          <ResponsiveModalHeader className="border-b border-[var(--v2-outline-variant)]/10">
            <ResponsiveModalTitle className="text-xl font-bold v2-headline text-[var(--v2-on-surface)]">
              Sent Gift Details
            </ResponsiveModalTitle>
          </ResponsiveModalHeader>

          {selectedGift && (
            <div className="p-4 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* Gift Header with Status */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[var(--v2-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <span
                    className="v2-icon text-3xl text-[var(--v2-primary)]"
                    style={{fontVariationSettings: "'FILL' 1"}}>
                    {(statusConfig[selectedGift.status] || statusConfig.pending).icon}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] truncate">
                    {selectedGift.name || 'Gift'}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase mt-1 ${
                      (statusConfig[selectedGift.status] || statusConfig.pending).bg
                    } ${(statusConfig[selectedGift.status] || statusConfig.pending).text}`}>
                    <span className="v2-icon text-xs">
                      {(statusConfig[selectedGift.status] || statusConfig.pending).icon}
                    </span>
                    {(statusConfig[selectedGift.status] || statusConfig.pending).label}
                  </span>
                </div>
              </div>

              {/* Gift Value */}
              <div className="p-4 rounded-2xl bg-[var(--v2-primary)]/10 text-center">
                <p className="text-sm text-[var(--v2-on-surface-variant)] mb-1">Gift Amount</p>
                <p className="text-3xl font-bold text-[var(--v2-primary)] v2-headline">
                  {formatCurrency(selectedGift.amount, selectedGift.currency)}
                </p>
              </div>

              {/* Recipient Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
                  <div className="flex items-center gap-2">
                    <span className="v2-icon text-[var(--v2-on-surface-variant)]">person</span>
                    <span className="text-sm text-[var(--v2-on-surface-variant)]">Recipient</span>
                  </div>
                  {selectedGift.status === 'pending' && isEditingRecipient ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newRecipientEmail}
                        onChange={(e) => setNewRecipientEmail(e.target.value)}
                        placeholder="Email or Phone"
                        className="px-3 py-1.5 rounded-lg border border-[var(--v2-outline-variant)] bg-[var(--v2-surface)] text-sm max-w-[150px] md:max-w-[180px]"
                        autoFocus
                      />
                      <button 
                        onClick={handleSaveRecipient}
                        disabled={isSavingRecipient || (!newRecipientEmail && !newRecipientPhone)}
                        className="p-1.5 rounded-lg bg-[var(--v2-primary)] text-white hover:opacity-90 disabled:opacity-50 min-w-[32px] flex items-center justify-center"
                      >
                        {isSavingRecipient ? (
                          <span className="v2-icon text-sm animate-spin">progress_activity</span>
                        ) : (
                          <span className="v2-icon text-sm">check</span>
                        )}
                      </button>
                      <button 
                        onClick={() => setIsEditingRecipient(false)}
                        className="p-1.5 rounded-lg bg-[var(--v2-surface-container-high)] hover:opacity-90"
                      >
                        <span className="v2-icon text-sm">close</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-[var(--v2-on-surface)]">
                      {selectedGift.recipient || 'Anonymous'}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
                  <div className="flex items-center gap-2">
                    <span className="v2-icon text-[var(--v2-on-surface-variant)]">calendar_today</span>
                    <span className="text-sm text-[var(--v2-on-surface-variant)]">Date Sent</span>
                  </div>
                  <span className="text-sm font-medium text-[var(--v2-on-surface)]">
                    {selectedGift.date}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
                  <div className="flex items-center gap-2">
                    <span className="v2-icon text-[var(--v2-on-surface-variant)]">info</span>
                    <span className="text-sm text-[var(--v2-on-surface-variant)]">Status</span>
                  </div>
                  <span className="text-sm font-medium text-[var(--v2-on-surface)]">
                    {['pending', 'unclaimed'].includes(selectedGift.status) ? 'Pending Claim' : 
                     ['claimed', 'redeemed'].includes(selectedGift.status) ? 'Claimed (Ready for use)' : 
                     selectedGift.status === 'partially_used' ? 'Partially Spent' :
                     selectedGift.status === 'used' ? 'Spent' : 'Delivered'}
                  </span>
                </div>
                {selectedGift.message && (
                  <div className="p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="v2-icon text-[var(--v2-on-surface-variant)]">chat</span>
                      <span className="text-sm text-[var(--v2-on-surface-variant)]">Message</span>
                    </div>
                    <p className="text-sm text-[var(--v2-on-surface)] italic">"{selectedGift.message}"</p>
                  </div>
                )}
              </div>

              {/* Status-specific Info */}
              {selectedGift.status === 'scheduled' && selectedGift.scheduledDate && (
                <div className="p-4 rounded-2xl bg-[var(--v2-tertiary-container)]/30 border border-[var(--v2-tertiary)]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="v2-icon text-[var(--v2-tertiary)]">schedule</span>
                    <span className="text-sm font-bold text-[var(--v2-on-surface)]">Scheduled Delivery</span>
                  </div>
                  <p className="text-sm text-[var(--v2-on-surface-variant)]">
                    This gift will be delivered on <span className="font-medium text-[var(--v2-on-surface)]">{selectedGift.scheduledDate}</span>
                  </p>
                </div>
              )}

              {selectedGift.status === 'claimable' && (
                <div className="p-4 rounded-2xl bg-[var(--v2-primary)]/5 border border-[var(--v2-primary)]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="v2-icon text-[var(--v2-primary)]">link</span>
                    <span className="text-sm font-bold text-[var(--v2-on-surface)]">Claim Link</span>
                  </div>
                  <p className="text-xs text-[var(--v2-on-surface-variant)]">
                    The recipient can claim this gift using the link sent to them.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-[var(--v2-outline-variant)]/10 space-y-3">
                {['pending', 'unclaimed'].includes(selectedGift.status) && !isEditingRecipient && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleResend(selectedGift)}
                      disabled={isResending}
                      className="flex-1 h-12 bg-[var(--v2-primary)] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <span className="v2-icon">{isResending ? 'progress_activity' : 'send'}</span>
                      {isResending ? 'Sending...' : 'Resend'}
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditingRecipient(true);
                        setNewRecipientEmail(selectedGift.recipient || '');
                      }}
                      className="flex-1 h-12 bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[var(--v2-surface-container-highest)] transition-colors"
                    >
                      <span className="v2-icon">edit</span>
                      Edit Recipient
                    </button>
                  </div>
                )}
                {(selectedGift.status === 'scheduled') && (
                  <button className="w-full h-12 bg-[var(--v2-error-container)] text-[var(--v2-on-error-container)] font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                    <span className="v2-icon">cancel</span>
                    Cancel Gift
                  </button>
                )}
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

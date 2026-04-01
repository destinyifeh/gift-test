'use client';

import {useIsMobile} from '@/hooks/use-mobile';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {fetchAdminCreatorGifts, flagCreatorGift} from '@/lib/server/actions/admin';
import {useInfiniteQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {toast} from 'sonner';

interface V2AdminCreatorGiftsTabProps {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

export function V2AdminCreatorGiftsTab({
  searchQuery,
  addLog,
  setViewDetailsModal,
}: V2AdminCreatorGiftsTabProps) {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const [localSearch, setLocalSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const {data: infiniteData, isLoading} = useInfiniteQuery({
    queryKey: ['admin-creator-gifts', searchQuery],
    queryFn: ({pageParam = 0}) => fetchAdminCreatorGifts({search: searchQuery, pageParam}),
    getNextPageParam: lastPage => lastPage.nextPage,
    initialPageParam: 0,
  });

  const gifts = infiniteData?.pages.flatMap(page => page.data || []) || [];

  // Action modal state
  const [flagModal, setFlagModal] = useState<{
    isOpen: boolean;
    gift: any;
  }>({isOpen: false, gift: null});

  const [flagReason, setFlagReason] = useState('');

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({top: 0, left: 0});
  const dropdownRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Mobile sheet state
  const [mobileSheet, setMobileSheet] = useState<{isOpen: boolean; gift: any}>({
    isOpen: false,
    gift: null,
  });

  const flagMutation = useMutation({
    mutationFn: ({id, reason}: {id: string; reason: string}) => flagCreatorGift(id, reason),
    onSuccess: (res, vars) => {
      if (!res.success) {
        toast.error(res.error || 'Failed to flag gift');
        return;
      }
      queryClient.invalidateQueries({queryKey: ['admin-creator-gifts']});
      toast.success('Gift flagged for review');
      addLog(`Flagged gift ${vars.id.slice(0, 8)}… — Reason: "${vars.reason}"`);
    },
    onError: () => toast.error('Error flagging gift'),
  });

  // Filter stats
  const stats = {
    totalGifts: gifts.length,
    moneyGifts: gifts.filter((g: any) => !g.gift_name).length,
    giftCards: gifts.filter((g: any) => g.gift_name).length,
    flaggedGifts: gifts.filter((g: any) => g.is_flagged).length,
  };

  // Calculate total amount
  const totalAmount = gifts.reduce((acc: number, g: any) => acc + parseFloat(g.amount || '0'), 0);

  // Filter gifts
  const filteredGifts = gifts.filter((g: any) => {
    const isMoney = !g.gift_name;

    const matchesSearch =
      !localSearch ||
      g.donor_name?.toLowerCase().includes(localSearch.toLowerCase()) ||
      g.recipient?.username?.toLowerCase().includes(localSearch.toLowerCase()) ||
      g.recipient?.display_name?.toLowerCase().includes(localSearch.toLowerCase());

    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'money' && isMoney) ||
      (typeFilter === 'giftcard' && !isMoney);

    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'flagged' && g.is_flagged) ||
      (statusFilter === 'normal' && !g.is_flagged);

    return matchesSearch && matchesType && matchesStatus;
  });

  const getCurrency = (country: string) => getCurrencySymbol(getCurrencyByCountry(country));

  const handleOpenDropdown = (giftId: string) => {
    const button = dropdownRefs.current[giftId];
    if (button) {
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.right - 160,
      });
    }
    setOpenDropdown(giftId);
  };

  const handleFlag = (gift: any) => {
    setOpenDropdown(null);
    setMobileSheet({isOpen: false, gift: null});
    setFlagModal({isOpen: true, gift});
    setFlagReason('');
  };

  const confirmFlag = () => {
    if (!flagModal.gift || !flagReason.trim()) {
      toast.error('Please provide a reason for flagging');
      return;
    }

    flagMutation.mutate({id: flagModal.gift.id, reason: flagReason});
    setFlagModal({isOpen: false, gift: null});
    setFlagReason('');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)] mt-3">Loading gifts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
            Creator Gifts
          </h2>
          <p className="text-[var(--v2-on-surface-variant)] mt-2 font-medium">
            Monitor gifts sent to creators on the platform.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="text-right">
            <p className="text-xs text-[var(--v2-on-surface-variant)]">Total Volume</p>
            <p className="text-xl font-black text-[var(--v2-primary)]">
              ₦{totalAmount.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => toast.success('Exporting gifts...')}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--v2-surface-container-high)] rounded-full text-[var(--v2-on-surface)] font-bold text-sm hover:bg-[var(--v2-surface-container)] transition-colors">
            <span className="v2-icon text-lg">file_download</span>
            Export
          </button>
        </div>
      </div>

      {/* Filter Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => {
            setStatusFilter(null);
            setTypeFilter('all');
          }}
          className={`p-4 rounded-xl transition-all ${
            !statusFilter && typeFilter === 'all'
              ? 'bg-[var(--v2-primary)] text-white shadow-lg'
              : 'bg-white hover:bg-[var(--v2-surface-container)]'
          }`}>
          <p
            className={`text-2xl font-black ${!statusFilter && typeFilter === 'all' ? 'text-white' : 'text-[var(--v2-on-surface)]'}`}>
            {stats.totalGifts}
          </p>
          <p
            className={`text-xs font-medium ${!statusFilter && typeFilter === 'all' ? 'text-white/80' : 'text-[var(--v2-on-surface-variant)]'}`}>
            Total Gifts
          </p>
        </button>
        <button
          onClick={() => {
            setStatusFilter(null);
            setTypeFilter('money');
          }}
          className={`p-4 rounded-xl transition-all ${
            typeFilter === 'money' && !statusFilter
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'bg-white hover:bg-[var(--v2-surface-container)]'
          }`}>
          <p
            className={`text-2xl font-black ${typeFilter === 'money' && !statusFilter ? 'text-white' : 'text-emerald-600'}`}>
            {stats.moneyGifts}
          </p>
          <p
            className={`text-xs font-medium ${typeFilter === 'money' && !statusFilter ? 'text-white/80' : 'text-[var(--v2-on-surface-variant)]'}`}>
            Cash Gifts
          </p>
        </button>
        <button
          onClick={() => {
            setStatusFilter(null);
            setTypeFilter('giftcard');
          }}
          className={`p-4 rounded-xl transition-all ${
            typeFilter === 'giftcard' && !statusFilter
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-white hover:bg-[var(--v2-surface-container)]'
          }`}>
          <p
            className={`text-2xl font-black ${typeFilter === 'giftcard' && !statusFilter ? 'text-white' : 'text-blue-600'}`}>
            {stats.giftCards}
          </p>
          <p
            className={`text-xs font-medium ${typeFilter === 'giftcard' && !statusFilter ? 'text-white/80' : 'text-[var(--v2-on-surface-variant)]'}`}>
            Gift Cards
          </p>
        </button>
        <button
          onClick={() => {
            setStatusFilter('flagged');
            setTypeFilter('all');
          }}
          className={`p-4 rounded-xl transition-all ${
            statusFilter === 'flagged'
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-white hover:bg-[var(--v2-surface-container)]'
          }`}>
          <p className={`text-2xl font-black ${statusFilter === 'flagged' ? 'text-white' : 'text-red-600'}`}>
            {stats.flaggedGifts}
          </p>
          <p
            className={`text-xs font-medium ${statusFilter === 'flagged' ? 'text-white/80' : 'text-[var(--v2-on-surface-variant)]'}`}>
            Flagged
          </p>
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="v2-icon absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by donor or recipient..."
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Table / Cards */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isMobile ? (
          <div className="divide-y divide-[var(--v2-surface-container)]">
            {filteredGifts.map((gift: any) => (
              <div
                key={gift.id}
                className={`p-4 ${gift.is_flagged ? 'bg-red-50/50' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        gift.is_flagged
                          ? 'bg-red-100'
                          : gift.gift_name
                            ? 'bg-blue-100'
                            : 'bg-emerald-100'
                      }`}>
                      <span
                        className={`v2-icon ${
                          gift.is_flagged
                            ? 'text-red-600'
                            : gift.gift_name
                              ? 'text-blue-600'
                              : 'text-emerald-600'
                        }`}
                        style={{fontVariationSettings: "'FILL' 1"}}>
                        {gift.is_flagged ? 'flag' : gift.gift_name ? 'card_giftcard' : 'monetization_on'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[var(--v2-on-surface)] truncate">
                        {gift.donor_name || 'Anonymous'} {gift.is_anonymous && '(Anon)'}
                      </p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)] truncate">
                        → {gift.recipient?.display_name || gift.recipient?.username || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileSheet({isOpen: true, gift})}
                    className="p-2 rounded-lg hover:bg-[var(--v2-surface-container)]">
                    <span className="v2-icon text-[var(--v2-on-surface-variant)]">more_vert</span>
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--v2-surface-container)]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        gift.gift_name
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                      {gift.gift_name ? 'Gift Card' : 'Cash'}
                    </span>
                    {gift.is_flagged && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700">
                        Flagged
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-[var(--v2-primary)]">
                    {getCurrency(gift.recipient?.country)}
                    {parseFloat(gift.amount || '0').toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--v2-surface-container)]/30">
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Sender
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Recipient
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Type
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Amount
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Date
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Status
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--v2-surface-container)]">
              {filteredGifts.map((gift: any) => (
                <tr
                  key={gift.id}
                  className={`hover:bg-[var(--v2-surface-container)]/20 ${gift.is_flagged ? 'bg-red-50/50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          gift.is_flagged
                            ? 'bg-red-100'
                            : gift.gift_name
                              ? 'bg-blue-100'
                              : 'bg-emerald-100'
                        }`}>
                        <span
                          className={`v2-icon text-sm ${
                            gift.is_flagged
                              ? 'text-red-600'
                              : gift.gift_name
                                ? 'text-blue-600'
                                : 'text-emerald-600'
                          }`}
                          style={{fontVariationSettings: "'FILL' 1"}}>
                          {gift.is_flagged ? 'flag' : gift.gift_name ? 'card_giftcard' : 'monetization_on'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-[var(--v2-on-surface)]">
                          {gift.donor_name || 'Anonymous'}
                        </p>
                        {gift.is_anonymous && (
                          <p className="text-[10px] text-[var(--v2-on-surface-variant)]">Anonymous</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-[var(--v2-on-surface)]">
                      @{gift.recipient?.username || 'unknown'}
                    </p>
                    {gift.recipient?.display_name && (
                      <p className="text-xs text-[var(--v2-on-surface-variant)]">
                        {gift.recipient.display_name}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        gift.gift_name
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                      {gift.gift_name ? 'Gift Card' : 'Cash'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[var(--v2-primary)]">
                      {getCurrency(gift.recipient?.country)}
                      {parseFloat(gift.amount || '0').toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-[var(--v2-on-surface-variant)]">
                    {gift.created_at ? new Date(gift.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {gift.is_flagged ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700">
                        Flagged
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      ref={el => {
                        dropdownRefs.current[gift.id] = el;
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        handleOpenDropdown(gift.id);
                      }}
                      className="p-2 rounded-lg hover:bg-[var(--v2-surface-container)]">
                      <span className="v2-icon text-[var(--v2-on-surface-variant)]">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {filteredGifts.length === 0 && (
        <div className="text-center py-16">
          <span className="v2-icon text-6xl text-[var(--v2-on-surface-variant)]/20">redeem</span>
          <p className="text-sm text-[var(--v2-on-surface-variant)] mt-4">No gifts found</p>
        </div>
      )}

      {/* Desktop Portal Dropdown */}
      {openDropdown &&
        !isMobile &&
        createPortal(
          <div
            className="fixed z-[9999] w-40 bg-white rounded-xl shadow-xl border border-[var(--v2-outline-variant)]/10 py-2 animate-in fade-in zoom-in-95"
            style={{top: dropdownPosition.top, left: dropdownPosition.left}}
            onClick={e => e.stopPropagation()}>
            {(() => {
              const gift = gifts.find((g: any) => g.id === openDropdown);
              if (!gift) return null;
              return (
                <>
                  <button
                    onClick={() => {
                      setViewDetailsModal({
                        isOpen: true,
                        title: 'Gift Details',
                        data: gift,
                      });
                      setOpenDropdown(null);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-[var(--v2-surface-container)] flex items-center gap-3">
                    <span className="v2-icon text-lg">visibility</span>
                    View Details
                  </button>
                  {!gift.is_flagged && (
                    <>
                      <div className="border-t border-[var(--v2-outline-variant)]/10 my-1" />
                      <button
                        onClick={() => handleFlag(gift)}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-red-50 text-red-600 flex items-center gap-3">
                        <span className="v2-icon text-lg">flag</span>
                        Flag Gift
                      </button>
                    </>
                  )}
                </>
              );
            })()}
          </div>,
          document.body,
        )}

      {/* Mobile Bottom Sheet */}
      {mobileSheet.isOpen && (
        <div className="fixed inset-0 z-[100]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileSheet({isOpen: false, gift: null})}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom">
            <div className="w-12 h-1 bg-[var(--v2-outline-variant)]/30 rounded-full mx-auto mb-6" />
            <h3 className="text-lg font-bold mb-2">Gift Actions</h3>
            <p className="text-sm text-[var(--v2-on-surface-variant)] mb-4">
              {getCurrency(mobileSheet.gift?.recipient?.country)}
              {parseFloat(mobileSheet.gift?.amount || '0').toLocaleString()} from{' '}
              {mobileSheet.gift?.donor_name || 'Anonymous'}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setViewDetailsModal({
                    isOpen: true,
                    title: 'Gift Details',
                    data: mobileSheet.gift,
                  });
                  setMobileSheet({isOpen: false, gift: null});
                }}
                className="w-full p-4 rounded-xl bg-[var(--v2-surface-container)] text-left font-medium flex items-center gap-3">
                <span className="v2-icon">visibility</span>
                View Details
              </button>
              {!mobileSheet.gift?.is_flagged && (
                <button
                  onClick={() => handleFlag(mobileSheet.gift)}
                  className="w-full p-4 rounded-xl bg-red-50 text-left font-medium text-red-600 flex items-center gap-3">
                  <span className="v2-icon">flag</span>
                  Flag Gift
                </button>
              )}
            </div>
            <button
              onClick={() => setMobileSheet({isOpen: false, gift: null})}
              className="w-full mt-4 p-4 rounded-xl border border-[var(--v2-outline-variant)]/20 font-bold">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Flag Confirmation Modal */}
      {flagModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setFlagModal({isOpen: false, gift: null})}
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="v2-icon text-2xl text-red-600">flag</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--v2-on-surface)]">Flag Gift</h3>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">
                  {getCurrency(flagModal.gift?.recipient?.country)}
                  {parseFloat(flagModal.gift?.amount || '0').toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-sm text-[var(--v2-on-surface-variant)] mb-4">
              This will flag the gift for review. Please provide a reason for flagging.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--v2-on-surface)] mb-2">
                Reason for flagging <span className="text-red-500">*</span>
              </label>
              <textarea
                value={flagReason}
                onChange={e => setFlagReason(e.target.value)}
                placeholder="Enter the reason for flagging this gift..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] outline-none resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setFlagModal({isOpen: false, gift: null})}
                className="flex-1 py-3 rounded-xl border border-[var(--v2-outline-variant)]/20 font-bold hover:bg-[var(--v2-surface-container)] transition-colors">
                Cancel
              </button>
              <button
                onClick={confirmFlag}
                disabled={!flagReason.trim()}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Flag Gift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

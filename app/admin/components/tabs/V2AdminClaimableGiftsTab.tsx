'use client';

import {useIsMobile} from '@/hooks/use-mobile';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import { useAdminShopGifts, useInvalidateShopGift } from '@/hooks/use-admin';
import { useInfiniteQuery } from '@tanstack/react-query';
import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {toast} from 'sonner';

interface V2AdminClaimableGiftsTabProps {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

export function V2AdminClaimableGiftsTab({
  searchQuery,
  addLog,
  setViewDetailsModal,
}: V2AdminClaimableGiftsTabProps) {
  const isMobile = useIsMobile();

  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data: infiniteData, isLoading } = useAdminShopGifts({ search: searchQuery });

  const gifts = infiniteData?.pages.flatMap(page => page.data || []) || [];

  // Action modal state
  const [invalidateModal, setInvalidateModal] = useState<{
    isOpen: boolean;
    gift: any;
  }>({isOpen: false, gift: null});

  const [invalidateReason, setInvalidateReason] = useState('');

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({top: 0, left: 0});
  const dropdownRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [mobileSheet, setMobileSheet] = useState<{isOpen: boolean; gift: any}>({
    isOpen: false,
    gift: null,
  });

  const invalidateMutation = useInvalidateShopGift();

  // Filter stats
  const stats = {
    totalCodes: gifts.length,
    redeemed: gifts.filter((g: any) => g.status === 'completed' || g.status === 'redeemed').length,
    pending: gifts.filter((g: any) => g.status === 'pending' || g.status === 'ready' || !g.status).length,
    expired: gifts.filter((g: any) => g.status === 'expired').length,
  };

  // Calculate total value
  const totalValue = gifts.reduce((acc: number, g: any) => acc + parseFloat(g.current_amount || '0'), 0);

  // Filter gifts
  const filteredGifts = gifts.filter((g: any) => {
    const matchesSearch =
      !localSearch ||
      g.title?.toLowerCase().includes(localSearch.toLowerCase()) ||
      g.gift_code?.toLowerCase().includes(localSearch.toLowerCase()) ||
      g.profiles?.username?.toLowerCase().includes(localSearch.toLowerCase());

    const displayStatus = g.status === 'completed' ? 'redeemed' : (g.status || 'ready');
    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'redeemed' && (g.status === 'completed' || g.status === 'redeemed')) ||
      (statusFilter === 'pending' && (g.status === 'pending' || g.status === 'ready' || !g.status)) ||
      (statusFilter === 'expired' && g.status === 'expired');

    return matchesSearch && matchesStatus;
  });

  const getCurrency = (country: string) => getCurrencySymbol(getCurrencyByCountry(country));

  const getDisplayStatus = (status: string | null) => {
    if (!status || status === 'ready') return 'pending';
    if (status === 'completed') return 'redeemed';
    return status;
  };

  const getMaskedCode = (code: string | null) =>
    code ? `${code.slice(0, 6)}${'*'.repeat(Math.max(0, code.length - 6))}` : 'PREPAID';

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

  const handleInvalidate = (gift: any) => {
    setOpenDropdown(null);
    setMobileSheet({isOpen: false, gift: null});
    setInvalidateModal({isOpen: true, gift});
    setInvalidateReason('');
  };

  const confirmInvalidate = () => {
    if (!invalidateModal.gift || !invalidateReason.trim()) {
      toast.error('Please provide a reason for invalidation');
      return;
    }

    invalidateMutation.mutate({ 
      id: invalidateModal.gift.id, 
      reason: invalidateReason 
    }, {
      onSuccess: () => {
        addLog(`Invalidated code ${getMaskedCode(invalidateModal.gift.gift_code)} — Reason: "${invalidateReason}"`);
        setInvalidateModal({isOpen: false, gift: null});
        setInvalidateReason('');
      }
    });
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
        <p className="text-sm text-[var(--v2-on-surface-variant)] mt-3">Loading claimable gifts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
            Claimable Gifts
          </h2>
          <p className="text-[var(--v2-on-surface-variant)] mt-2 font-medium">
            Vendor gift codes and redemption tracking.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="text-right">
            <p className="text-xs text-[var(--v2-on-surface-variant)]">Total Value</p>
            <p className="text-xl font-black text-[var(--v2-primary)]">
              ₦{totalValue.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => toast.success('Exporting claimable gifts...')}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--v2-surface-container-high)] rounded-full text-[var(--v2-on-surface)] font-bold text-sm hover:bg-[var(--v2-surface-container)] transition-colors">
            <span className="v2-icon text-lg">file_download</span>
            Export
          </button>
        </div>
      </div>

      {/* Filter Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter(null)}
          className={`p-4 rounded-xl transition-all ${
            !statusFilter
              ? 'bg-[var(--v2-primary)] text-white shadow-lg'
              : 'bg-white hover:bg-[var(--v2-surface-container)]'
          }`}>
          <p className={`text-2xl font-black ${!statusFilter ? 'text-white' : 'text-[var(--v2-on-surface)]'}`}>
            {stats.totalCodes}
          </p>
          <p className={`text-xs font-medium ${!statusFilter ? 'text-white/80' : 'text-[var(--v2-on-surface-variant)]'}`}>
            Total Codes
          </p>
        </button>
        <button
          onClick={() => setStatusFilter('redeemed')}
          className={`p-4 rounded-xl transition-all ${
            statusFilter === 'redeemed'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'bg-white hover:bg-[var(--v2-surface-container)]'
          }`}>
          <p className={`text-2xl font-black ${statusFilter === 'redeemed' ? 'text-white' : 'text-emerald-600'}`}>
            {stats.redeemed}
          </p>
          <p className={`text-xs font-medium ${statusFilter === 'redeemed' ? 'text-white/80' : 'text-[var(--v2-on-surface-variant)]'}`}>
            Redeemed
          </p>
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-xl transition-all ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-white shadow-lg'
              : 'bg-white hover:bg-[var(--v2-surface-container)]'
          }`}>
          <p className={`text-2xl font-black ${statusFilter === 'pending' ? 'text-white' : 'text-amber-600'}`}>
            {stats.pending}
          </p>
          <p className={`text-xs font-medium ${statusFilter === 'pending' ? 'text-white/80' : 'text-[var(--v2-on-surface-variant)]'}`}>
            Pending
          </p>
        </button>
        <button
          onClick={() => setStatusFilter('expired')}
          className={`p-4 rounded-xl transition-all ${
            statusFilter === 'expired'
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-white hover:bg-[var(--v2-surface-container)]'
          }`}>
          <p className={`text-2xl font-black ${statusFilter === 'expired' ? 'text-white' : 'text-red-600'}`}>
            {stats.expired}
          </p>
          <p className={`text-xs font-medium ${statusFilter === 'expired' ? 'text-white/80' : 'text-[var(--v2-on-surface-variant)]'}`}>
            Expired
          </p>
        </button>
      </div>

      {/* Search */}
      <div className="flex-1 relative">
        <span className="v2-icon absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]">
          search
        </span>
        <input
          type="text"
          placeholder="Search by code, product, or vendor..."
          value={localSearch}
          onChange={e => setLocalSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none transition-all"
        />
      </div>

      {/* Table / Cards */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isMobile ? (
          <div className="divide-y divide-[var(--v2-surface-container)]">
            {filteredGifts.map((gift: any) => (
              <div key={gift.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        getDisplayStatus(gift.status) === 'redeemed'
                          ? 'bg-emerald-100'
                          : getDisplayStatus(gift.status) === 'expired'
                            ? 'bg-red-100'
                            : 'bg-amber-100'
                      }`}>
                      <span
                        className={`v2-icon ${
                          getDisplayStatus(gift.status) === 'redeemed'
                            ? 'text-emerald-600'
                            : getDisplayStatus(gift.status) === 'expired'
                              ? 'text-red-600'
                              : 'text-amber-600'
                        }`}
                        style={{fontVariationSettings: "'FILL' 1"}}>
                        card_giftcard
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono font-bold text-[var(--v2-on-surface)] truncate">
                        {getMaskedCode(gift.gift_code)}
                      </p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)] truncate">
                        {gift.title || 'Gift Card'}
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
                        getDisplayStatus(gift.status) === 'redeemed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : getDisplayStatus(gift.status) === 'expired'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}>
                      {getDisplayStatus(gift.status)}
                    </span>
                    <span className="text-xs text-[var(--v2-on-surface-variant)] truncate">
                      {gift.profiles?.displayName || gift.profiles?.username || 'System'}
                    </span>
                  </div>
                  <p className="font-bold text-[var(--v2-primary)]">
                    {getCurrency(gift.profiles?.country)}
                    {parseFloat(gift.current_amount || '0').toLocaleString()}
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
                  Code
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Product
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Vendor
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Value
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Created
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
                  Status
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--v2-surface-container)]">
              {filteredGifts.map((gift: any) => (
                <tr key={gift.id} className="hover:bg-[var(--v2-surface-container)]/20">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          getDisplayStatus(gift.status) === 'redeemed'
                            ? 'bg-emerald-100'
                            : getDisplayStatus(gift.status) === 'expired'
                              ? 'bg-red-100'
                              : 'bg-amber-100'
                        }`}>
                        <span
                          className={`v2-icon text-sm ${
                            getDisplayStatus(gift.status) === 'redeemed'
                              ? 'text-emerald-600'
                              : getDisplayStatus(gift.status) === 'expired'
                                ? 'text-red-600'
                                : 'text-amber-600'
                          }`}
                          style={{fontVariationSettings: "'FILL' 1"}}>
                          card_giftcard
                        </span>
                      </div>
                      <span className="font-mono font-bold">{getMaskedCode(gift.gift_code)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--v2-on-surface)]">{gift.title || 'Gift Card'}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-[var(--v2-on-surface)]">
                      {gift.profiles?.displayName || gift.profiles?.username || 'System'}
                    </p>
                    {gift.profiles?.business_name && (
                      <p className="text-xs text-[var(--v2-on-surface-variant)]">{gift.profiles.business_name}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[var(--v2-primary)]">
                      {getCurrency(gift.profiles?.country)}
                      {parseFloat(gift.current_amount || '0').toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-[var(--v2-on-surface-variant)]">
                    {gift.createdAt ? new Date(gift.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        getDisplayStatus(gift.status) === 'redeemed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : getDisplayStatus(gift.status) === 'expired'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}>
                      {getDisplayStatus(gift.status)}
                    </span>
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
          <span className="v2-icon text-6xl text-[var(--v2-on-surface-variant)]/20">card_giftcard</span>
          <p className="text-sm text-[var(--v2-on-surface-variant)] mt-4">No claimable gifts found</p>
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
                        title: 'Gift Code Details',
                        data: {
                          ...gift,
                          vendor_name: gift.profiles?.displayName || gift.profiles?.username,
                          business_name: gift.profiles?.business_name,
                        },
                      });
                      setOpenDropdown(null);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-[var(--v2-surface-container)] flex items-center gap-3">
                    <span className="v2-icon text-lg">visibility</span>
                    View Details
                  </button>
                  {getDisplayStatus(gift.status) !== 'redeemed' && getDisplayStatus(gift.status) !== 'expired' && (
                    <>
                      <div className="border-t border-[var(--v2-outline-variant)]/10 my-1" />
                      <button
                        onClick={() => handleInvalidate(gift)}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-red-50 text-red-600 flex items-center gap-3">
                        <span className="v2-icon text-lg">block</span>
                        Invalidate
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
            <h3 className="text-lg font-bold mb-2">Gift Code Actions</h3>
            <p className="text-sm text-[var(--v2-on-surface-variant)] mb-4 font-mono">
              {getMaskedCode(mobileSheet.gift?.gift_code)}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setViewDetailsModal({
                    isOpen: true,
                    title: 'Gift Code Details',
                    data: {
                      ...mobileSheet.gift,
                      vendor_name: mobileSheet.gift?.profiles?.displayName || mobileSheet.gift?.profiles?.username,
                      business_name: mobileSheet.gift?.profiles?.business_name,
                    },
                  });
                  setMobileSheet({isOpen: false, gift: null});
                }}
                className="w-full p-4 rounded-xl bg-[var(--v2-surface-container)] text-left font-medium flex items-center gap-3">
                <span className="v2-icon">visibility</span>
                View Details
              </button>
              {getDisplayStatus(mobileSheet.gift?.status) !== 'redeemed' &&
                getDisplayStatus(mobileSheet.gift?.status) !== 'expired' && (
                  <button
                    onClick={() => handleInvalidate(mobileSheet.gift)}
                    className="w-full p-4 rounded-xl bg-red-50 text-left font-medium text-red-600 flex items-center gap-3">
                    <span className="v2-icon">block</span>
                    Invalidate Code
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

      {/* Invalidate Confirmation Modal */}
      {invalidateModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setInvalidateModal({isOpen: false, gift: null})}
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="v2-icon text-2xl text-red-600">block</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--v2-on-surface)]">Invalidate Gift Code</h3>
                <p className="text-sm text-[var(--v2-on-surface-variant)] font-mono">
                  {getMaskedCode(invalidateModal.gift?.gift_code)}
                </p>
              </div>
            </div>
            <p className="text-sm text-[var(--v2-on-surface-variant)] mb-4">
              This will permanently invalidate the gift code. The code will no longer be redeemable.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--v2-on-surface)] mb-2">
                Reason for invalidation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={invalidateReason}
                onChange={e => setInvalidateReason(e.target.value)}
                placeholder="Enter the reason for invalidating this code..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[var(--v2-outline-variant)]/20 focus:border-[var(--v2-primary)] outline-none resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setInvalidateModal({isOpen: false, gift: null})}
                className="flex-1 py-3 rounded-xl border border-[var(--v2-outline-variant)]/20 font-bold hover:bg-[var(--v2-surface-container)] transition-colors">
                Cancel
              </button>
              <button
                onClick={confirmInvalidate}
                disabled={!invalidateReason.trim()}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Invalidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

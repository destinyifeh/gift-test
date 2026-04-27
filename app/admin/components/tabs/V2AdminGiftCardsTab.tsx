'use client';

import { useState } from 'react';
import { useAdminGiftCards, useCreateGiftCard, useUpdateGiftCard, useDeleteGiftCard } from '@/hooks/use-gift-cards';
import { cn } from '@/lib/utils';

const CATEGORIES = ['food', 'fashion', 'shopping', 'electronics', 'lifestyle', 'everyday', 'occasions', 'home', 'education', 'brand', 'flex'];
const STATUSES = ['active', 'draft', 'paused', 'archived'];

export default function V2AdminGiftCardsTab() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [editingCard, setEditingCard] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useAdminGiftCards({ search, status: filterStatus, category: filterCategory });
  const createMutation = useCreateGiftCard();
  const updateMutation = useUpdateGiftCard();
  const deleteMutation = useDeleteGiftCard();

  const cards = data?.data || data || [];

  const openCreate = () => {
    setEditingCard({
      name: '', slug: '', description: '', category: 'food', icon: 'redeem',
      colorFrom: '#6366F1', colorTo: '#4F46E5', amountOptions: [1000, 3000, 5000, 10000],
      allowCustomAmount: true, minAmount: 500, maxAmount: 500000, currency: 'NGN',
      serviceFeePercent: 4, status: 'draft', isFlexCard: false, usageDescription: '',
      displayOrder: 0,
    });
    setShowModal(true);
  };

  const openEdit = (card: any) => {
    setEditingCard({ ...card });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingCard) return;
    const payload = { ...editingCard };
    delete payload.createdAt;
    delete payload.updatedAt;

    if (editingCard.id) {
      await updateMutation.mutateAsync({ id: editingCard.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setShowModal(false);
    setEditingCard(null);
  };

  const handleArchive = async (id: number) => {
    if (confirm('Are you sure you want to archive this gift card?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const updateField = (field: string, value: any) => {
    setEditingCard((prev: any) => ({ ...prev, [field]: value }));
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'active': return 'bg-emerald-500/10 text-emerald-600';
      case 'draft': return 'bg-amber-500/10 text-amber-600';
      case 'paused': return 'bg-orange-500/10 text-orange-600';
      case 'archived': return 'bg-neutral-500/10 text-neutral-500';
      default: return 'bg-neutral-500/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold v2-headline text-[var(--v2-on-surface)]">Gift Cards</h2>
          <p className="text-sm text-[var(--v2-on-surface-variant)]">Manage all gift cards available in the system</p>
        </div>
        <button onClick={openCreate} className="h-10 px-5 bg-[var(--v2-primary)] text-[var(--v2-on-primary)] rounded-xl font-bold text-sm flex items-center gap-2 active:scale-95 transition-transform">
          <span className="v2-icon text-lg">add</span> Create Gift Card
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          placeholder="Search cards..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-10 px-4 bg-[var(--v2-surface-container-low)] rounded-xl border-none text-sm text-[var(--v2-on-surface)] w-full md:w-auto md:flex-1 max-w-xs focus:ring-2 focus:ring-[var(--v2-primary)]/20"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="h-10 px-3 bg-[var(--v2-surface-container-low)] rounded-xl border-none text-sm text-[var(--v2-on-surface)]"
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="h-10 px-3 bg-[var(--v2-surface-container-low)] rounded-xl border-none text-sm text-[var(--v2-on-surface)]"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-[var(--v2-surface-container-high)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Array.isArray(cards) ? cards : []).map((card: any) => (
            <div key={card.id} className="rounded-2xl bg-[var(--v2-surface-container-lowest)] overflow-hidden border border-[var(--v2-outline-variant)]/10">
              <div
                className="h-20 flex items-end p-3"
                style={{ background: `linear-gradient(135deg, ${card.colorFrom || '#6366F1'}, ${card.colorTo || '#4F46E5'})` }}
              >
                <div className="flex items-center gap-2 text-white">
                  <span className="v2-icon text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon || 'redeem'}</span>
                  <span className="font-bold text-sm">{card.name}</span>
                  {card.isFlexCard && (
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">FLEX</span>
                  )}
                </div>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full', statusColor(card.status))}>
                    {card.status}
                  </span>
                  <span className="text-xs text-[var(--v2-on-surface-variant)] capitalize">{card.category}</span>
                </div>
                <p className="text-xs text-[var(--v2-on-surface-variant)] line-clamp-2">{card.description}</p>
                <div className="flex flex-wrap gap-1">
                  {(card.amountOptions as number[] || []).slice(0, 3).map((amt: number) => (
                    <span key={amt} className="text-[10px] bg-[var(--v2-surface-container-high)] px-2 py-0.5 rounded-full text-[var(--v2-on-surface-variant)]">
                      ₦{amt.toLocaleString()}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => openEdit(card)} className="flex-1 h-8 bg-[var(--v2-surface-container-high)] rounded-lg text-xs font-medium text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-highest)] transition-colors flex items-center justify-center gap-1">
                    <span className="v2-icon text-sm">edit</span> Edit
                  </button>
                  {card.status !== 'archived' && (
                    <button onClick={() => handleArchive(card.id)} className="h-8 px-3 rounded-lg text-xs font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center gap-1">
                      <span className="v2-icon text-sm">archive</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--v2-surface)] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--v2-on-surface)]">
                {editingCard.id ? 'Edit Gift Card' : 'Create Gift Card'}
              </h3>
              <button onClick={() => setShowModal(false)} className="v2-icon text-[var(--v2-on-surface-variant)]">close</button>
            </div>

            {/* Preview */}
            <div className="h-24 rounded-2xl overflow-hidden flex items-end p-4 text-white"
              style={{ background: `linear-gradient(135deg, ${editingCard.colorFrom}, ${editingCard.colorTo})` }}>
              <div className="flex items-center gap-2">
                <span className="v2-icon text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{editingCard.icon || 'redeem'}</span>
                <span className="font-bold">{editingCard.name || 'Gift Card Name'}</span>
              </div>
            </div>

            <ModalField label="Name" value={editingCard.name} onChange={v => updateField('name', v)} />
            <ModalField label="Slug" value={editingCard.slug} onChange={v => updateField('slug', v)} />
            <ModalField label="Description" value={editingCard.description} onChange={v => updateField('description', v)} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-[var(--v2-on-surface-variant)] block mb-1">Category</label>
                <select value={editingCard.category} onChange={e => updateField('category', e.target.value)}
                  className="w-full h-10 px-3 bg-[var(--v2-surface-container-low)] rounded-xl border-none text-sm capitalize">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-[var(--v2-on-surface-variant)] block mb-1">Status</label>
                <select value={editingCard.status} onChange={e => updateField('status', e.target.value)}
                  className="w-full h-10 px-3 bg-[var(--v2-surface-container-low)] rounded-xl border-none text-sm capitalize">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <ModalField label="Icon (Material icon name)" value={editingCard.icon} onChange={v => updateField('icon', v)} />
            <ModalField label="Usage Description" value={editingCard.usageDescription} onChange={v => updateField('usageDescription', v)} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-[var(--v2-on-surface-variant)] block mb-1">Color From</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={editingCard.colorFrom} onChange={e => updateField('colorFrom', e.target.value)} className="w-8 h-8 rounded-lg border-none cursor-pointer" />
                  <input value={editingCard.colorFrom} onChange={e => updateField('colorFrom', e.target.value)} className="flex-1 h-9 px-3 bg-[var(--v2-surface-container-low)] rounded-xl border-none text-sm" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-[var(--v2-on-surface-variant)] block mb-1">Color To</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={editingCard.colorTo} onChange={e => updateField('colorTo', e.target.value)} className="w-8 h-8 rounded-lg border-none cursor-pointer" />
                  <input value={editingCard.colorTo} onChange={e => updateField('colorTo', e.target.value)} className="flex-1 h-9 px-3 bg-[var(--v2-surface-container-low)] rounded-xl border-none text-sm" />
                </div>
              </div>
            </div>

            <ModalField label="Amount Options (comma-separated)" value={(editingCard.amountOptions || []).join(', ')}
              onChange={v => updateField('amountOptions', v.split(',').map((s: string) => Number(s.trim())).filter(Boolean))} />

            <div className="grid grid-cols-2 gap-3">
              <ModalField label="Min Amount" value={editingCard.minAmount} onChange={v => updateField('minAmount', Number(v))} type="number" />
              <ModalField label="Max Amount" value={editingCard.maxAmount} onChange={v => updateField('maxAmount', Number(v))} type="number" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ModalField label="Service Fee %" value={editingCard.serviceFeePercent} onChange={v => updateField('serviceFeePercent', Number(v))} type="number" />
              <ModalField label="Display Order" value={editingCard.displayOrder} onChange={v => updateField('displayOrder', Number(v))} type="number" />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={editingCard.allowCustomAmount} onChange={e => updateField('allowCustomAmount', e.target.checked)} className="w-4 h-4" />
              <span className="text-sm text-[var(--v2-on-surface)]">Allow custom amount</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 h-11 rounded-xl bg-[var(--v2-surface-container-high)] font-medium text-[var(--v2-on-surface)]">
                Cancel
              </button>
              <button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 h-11 rounded-xl bg-[var(--v2-primary)] text-[var(--v2-on-primary)] font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                {(createMutation.isPending || updateMutation.isPending) && <span className="v2-icon animate-spin text-sm">progress_activity</span>}
                {editingCard.id ? 'Save Changes' : 'Create Card'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple field component
function ModalField({ label, value, onChange, type = 'text' }: { label: string; value: any; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-[10px] uppercase font-bold text-[var(--v2-on-surface-variant)] block mb-1">{label}</label>
      <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)}
        className="w-full h-10 px-3 bg-[var(--v2-surface-container-low)] rounded-xl border-none text-sm text-[var(--v2-on-surface)] focus:ring-2 focus:ring-[var(--v2-primary)]/20" />
    </div>
  );
}

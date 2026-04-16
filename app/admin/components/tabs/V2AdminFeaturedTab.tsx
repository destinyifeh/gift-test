'use client';

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {useAllFeaturedItems} from '@/hooks/use-featured-items';
import {
  createFeaturedItem,
  updateFeaturedItem,
  deleteFeaturedItem,
  uploadFeaturedItemImage,
  type FeaturedItem,
  type FeaturedItemPlacement,
} from '@/lib/server/actions/featured-items';
import {ImageUpload} from '@/components/ui/image-upload';
import {useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import {toast} from 'sonner';

interface V2AdminFeaturedTabProps {
  searchQuery?: string;
  addLog?: (action: string) => void;
}

const placementLabels: Record<FeaturedItemPlacement, string> = {
  featured: 'Gift Shop - Featured',
  new_arrivals: 'Gift Shop - New Arrivals',
};

const placementIcons: Record<FeaturedItemPlacement, string> = {
  featured: 'star',
  new_arrivals: 'new_releases',
};

export function V2AdminFeaturedTab({searchQuery = '', addLog}: V2AdminFeaturedTabProps) {
  const queryClient = useQueryClient();
  const {data: featuredItems = [], isLoading} = useAllFeaturedItems();

  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [modal, setModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    data: FeaturedItem | null;
  }>({open: false, mode: 'create', data: null});

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    cta_text: 'Learn More',
    cta_url: '',
    placement: 'featured' as FeaturedItemPlacement,
    display_order: 0,
  });

  const resetForm = () => {
    setForm({
      title: '',
      subtitle: '',
      description: '',
      image_url: '',
      cta_text: 'Learn More',
      cta_url: '',
      placement: 'featured',
      display_order: 0,
    });
  };

  const openEditModal = (item: FeaturedItem) => {
    setForm({
      title: item.title,
      subtitle: item.subtitle || '',
      description: item.description || '',
      image_url: item.image_url || '',
      cta_text: item.cta_text || 'Learn More',
      cta_url: item.cta_url,
      placement: item.placement,
      display_order: item.display_order,
    });
    setModal({open: true, mode: 'edit', data: item});
  };

  const handleCreate = async () => {
    if (!form.title || !form.cta_url) {
      toast.error('Title and link are required');
      return;
    }

    setIsProcessing(-1);
    try {
      const result = await createFeaturedItem({
        title: form.title,
        subtitle: form.subtitle || undefined,
        description: form.description || undefined,
        image_url: form.image_url || undefined,
        cta_text: form.cta_text || 'Learn More',
        cta_url: form.cta_url,
        placement: form.placement,
        display_order: form.display_order,
      });

      if (result.success) {
        toast.success('Featured item created!');
        addLog?.(`Created featured item: ${form.title}`);
        queryClient.invalidateQueries({queryKey: ['admin-featured-items']});
        queryClient.invalidateQueries({queryKey: ['featured-items']});
        setModal({open: false, mode: 'create', data: null});
        resetForm();
      } else {
        toast.error(result.error || 'Failed to create');
      }
    } catch {
      toast.error('Failed to create featured item');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleUpdate = async () => {
    if (!modal.data?.id) return;

    setIsProcessing(modal.data.id);
    try {
      const result = await updateFeaturedItem(modal.data.id, {
        title: form.title,
        subtitle: form.subtitle || null,
        description: form.description || null,
        image_url: form.image_url || null,
        cta_text: form.cta_text || 'Learn More',
        cta_url: form.cta_url,
        placement: form.placement,
        display_order: form.display_order,
      });

      if (result.success) {
        toast.success('Featured item updated!');
        addLog?.(`Updated featured item #${modal.data.id}`);
        queryClient.invalidateQueries({queryKey: ['admin-featured-items']});
        queryClient.invalidateQueries({queryKey: ['featured-items']});
        setModal({open: false, mode: 'create', data: null});
        resetForm();
      } else {
        toast.error(result.error || 'Failed to update');
      }
    } catch {
      toast.error('Failed to update featured item');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this featured item?')) return;

    setIsProcessing(id);
    try {
      const result = await deleteFeaturedItem(id);
      if (result.success) {
        toast.success('Featured item deleted');
        addLog?.(`Deleted featured item #${id}`);
        queryClient.invalidateQueries({queryKey: ['admin-featured-items']});
        queryClient.invalidateQueries({queryKey: ['featured-items']});
      } else {
        toast.error(result.error || 'Failed to delete');
      }
    } catch {
      toast.error('Failed to delete featured item');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleToggleStatus = async (item: FeaturedItem) => {
    const newStatus = item.status === 'active' ? 'inactive' : 'active';
    setIsProcessing(item.id);
    try {
      const result = await updateFeaturedItem(item.id, {status: newStatus});
      if (result.success) {
        toast.success(`Item ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
        queryClient.invalidateQueries({queryKey: ['admin-featured-items']});
        queryClient.invalidateQueries({queryKey: ['featured-items']});
      } else {
        toast.error(result.error || 'Failed to update');
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setIsProcessing(null);
    }
  };

  // Filter based on search
  const filteredItems = searchQuery
    ? featuredItems.filter(
        item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : featuredItems;

  // Group by placement
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.placement]) {
      acc[item.placement] = [];
    }
    acc[item.placement].push(item);
    return acc;
  }, {} as Record<FeaturedItemPlacement, FeaturedItem[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)]">
            Featured Items
          </h2>
          <p className="text-sm text-[var(--v2-on-surface-variant)] mt-1">
            Manage internal featured content and awareness items (Flex Card, new features, etc.)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setForm({
                title: 'Gifthance Flex Card',
                subtitle: 'The Universal Gift Card',
                description: 'A reloadable gift card that can be used at any Gifthance vendor. Send any amount and let them choose what they want!',
                image_url: '',
                cta_text: 'Send Flex Card',
                cta_url: '/send-gift?type=flex',
                placement: 'featured',
                display_order: 0,
              });
              setModal({open: true, mode: 'create', data: null});
            }}
            className="h-12 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg hover:from-orange-600 hover:to-amber-600 transition-colors">
            <span className="v2-icon">credit_card</span>
            Add Flex Card
          </button>
          <button
            onClick={() => {
              resetForm();
              setModal({open: true, mode: 'create', data: null});
            }}
            className="h-12 px-6 v2-hero-gradient text-white font-bold rounded-xl flex items-center gap-2 shadow-lg">
            <span className="v2-icon">add</span>
            Add Item
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
            <span className="v2-icon text-emerald-600">check_circle</span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--v2-on-surface)]">
            {featuredItems.filter(i => i.status === 'active').length}
          </p>
          <p className="text-xs text-[var(--v2-on-surface-variant)]">Active Items</p>
        </div>
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
            <span className="v2-icon text-purple-600">star</span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--v2-on-surface)]">
            {groupedItems.featured?.length || 0}
          </p>
          <p className="text-xs text-[var(--v2-on-surface-variant)]">Featured Section</p>
        </div>
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
            <span className="v2-icon text-blue-600">new_releases</span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--v2-on-surface)]">
            {groupedItems.new_arrivals?.length || 0}
          </p>
          <p className="text-xs text-[var(--v2-on-surface-variant)]">New Arrivals</p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">progress_activity</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-[var(--v2-surface-container-lowest)] rounded-2xl">
          <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/30">featured_play_list</span>
          <p className="text-[var(--v2-on-surface-variant)] mt-2">No featured items yet</p>
          <button
            onClick={() => {
              resetForm();
              setModal({open: true, mode: 'create', data: null});
            }}
            className="mt-4 px-6 py-2 bg-[var(--v2-primary)] text-white font-bold rounded-xl">
            Create First Item
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Items grouped by placement */}
          {(Object.keys(placementLabels) as FeaturedItemPlacement[]).map(placement => {
            const items = groupedItems[placement] || [];
            if (items.length === 0) return null;

            return (
              <div key={placement} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="v2-icon text-[var(--v2-primary)]">{placementIcons[placement]}</span>
                  <h3 className="font-bold text-[var(--v2-on-surface)]">{placementLabels[placement]}</h3>
                  <span className="px-2 py-0.5 bg-[var(--v2-surface-container-high)] rounded-full text-xs font-bold">
                    {items.length}
                  </span>
                </div>

                <div className="grid gap-4">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="bg-[var(--v2-surface-container-lowest)] rounded-2xl p-4 md:p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Image */}
                        <div className="w-full md:w-40 h-32 md:h-28 rounded-xl bg-[var(--v2-surface-container-high)] overflow-hidden shrink-0">
                          {item.image_url ? (
                            <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="v2-icon text-3xl text-[var(--v2-on-surface-variant)]/30">image</span>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-lg text-[var(--v2-on-surface)]">{item.title}</h3>
                              {item.subtitle && (
                                <p className="text-sm text-[var(--v2-primary)] font-medium">{item.subtitle}</p>
                              )}
                              {item.description && (
                                <p className="text-sm text-[var(--v2-on-surface-variant)] line-clamp-2 mt-1">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                item.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                              {item.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-[var(--v2-on-surface-variant)] mb-4">
                            <span className="flex items-center gap-1">
                              <span className="v2-icon text-sm">touch_app</span>
                              {item.cta_text}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="v2-icon text-sm">link</span>
                              <a href={item.cta_url} className="text-[var(--v2-primary)] hover:underline truncate max-w-[200px]">
                                {item.cta_url}
                              </a>
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleToggleStatus(item)}
                              disabled={isProcessing === item.id}
                              className={`px-4 py-2 font-bold rounded-xl text-sm flex items-center gap-2 ${
                                item.status === 'active'
                                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              } disabled:opacity-50`}>
                              <span className="v2-icon text-sm">
                                {item.status === 'active' ? 'visibility_off' : 'visibility'}
                              </span>
                              {item.status === 'active' ? 'Hide' : 'Show'}
                            </button>
                            <button
                              onClick={() => openEditModal(item)}
                              className="px-4 py-2 bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-[var(--v2-surface-container-highest)]">
                              <span className="v2-icon text-sm">edit</span>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={isProcessing === item.id}
                              className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-red-200 disabled:opacity-50">
                              <span className="v2-icon text-sm">delete</span>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <ResponsiveModal
        open={modal.open}
        onOpenChange={open => !open && setModal({open: false, mode: 'create', data: null})}>
        <ResponsiveModalContent className="max-h-[90vh] overflow-y-auto">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>
              {modal.mode === 'create' ? 'Add Featured Item' : 'Edit Featured Item'}
            </ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                placeholder="e.g. Gifthance Flex Card"
                className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Explain what this is and why users should check it out..."
                className="w-full h-24 p-4 bg-[var(--v2-surface-container-low)] rounded-xl resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Image
              </label>
              <ImageUpload
                value={form.image_url}
                onChange={url => setForm({...form, image_url: url})}
                onUpload={uploadFeaturedItemImage}
                placeholder="Click to upload or drag and drop"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  value={form.cta_text}
                  onChange={e => setForm({...form, cta_text: e.target.value})}
                  placeholder="Learn More"
                  className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={form.display_order}
                  onChange={e => setForm({...form, display_order: parseInt(e.target.value) || 0})}
                  placeholder="0"
                  className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Link URL *
              </label>
              <input
                type="text"
                value={form.cta_url}
                onChange={e => setForm({...form, cta_url: e.target.value})}
                placeholder="/send-gift?type=flex"
                className="w-full h-12 px-4 bg-[var(--v2-surface-container-low)] rounded-xl"
              />
              <p className="text-xs text-[var(--v2-on-surface-variant)] mt-1">
                Internal path (e.g. /send-gift) or full URL
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Placement
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(placementLabels) as FeaturedItemPlacement[]).map(placement => (
                  <button
                    key={placement}
                    type="button"
                    onClick={() => setForm({...form, placement})}
                    className={`p-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                      form.placement === placement
                        ? 'bg-[var(--v2-primary)] text-white'
                        : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-high)]'
                    }`}>
                    <span className="v2-icon text-sm">{placementIcons[placement]}</span>
                    {placementLabels[placement]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setModal({open: false, mode: 'create', data: null})}
                className="flex-1 py-3 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-xl">
                Cancel
              </button>
              <button
                onClick={modal.mode === 'create' ? handleCreate : handleUpdate}
                disabled={!form.title || !form.cta_url || isProcessing !== null}
                className="flex-1 py-3 v2-hero-gradient text-white font-bold rounded-xl disabled:opacity-50">
                {isProcessing !== null ? 'Saving...' : modal.mode === 'create' ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}

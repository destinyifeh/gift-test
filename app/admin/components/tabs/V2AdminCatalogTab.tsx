'use client';

import React, {useState} from 'react';
import {useCatalogHierarchy} from '@/hooks/use-catalog';
import {toast} from 'sonner';
import api from '@/lib/api-client';
import {useQueryClient} from '@tanstack/react-query';

export function V2AdminCatalogTab() {
  const {data: catalog = [], isLoading} = useCatalogHierarchy();
  const queryClient = useQueryClient();

  const [expandedCats, setExpandedCats] = useState<Record<number, boolean>>({});
  const [expandedSubcats, setExpandedSubcats] = useState<Record<number, boolean>>({});

  const toggleCat = (id: number) => setExpandedCats(prev => ({...prev, [id]: !prev[id]}));
  const toggleSubcat = (id: number) => setExpandedSubcats(prev => ({...prev, [id]: !prev[id]}));

  const [newCatName, setNewCatName] = useState('');
  const [newSubcatName, setNewSubcatName] = useState('');
  const [newTagName, setNewTagName] = useState('');

  const [addingToCatId, setAddingToCatId] = useState<number | null>(null);
  const [addingToSubcatId, setAddingToSubcatId] = useState<number | null>(null);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      await api.post('/catalog/categories', {name: newCatName});
      toast.success('Category created');
      setNewCatName('');
      queryClient.invalidateQueries({queryKey: ['catalog']});
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleCreateSubcategory = async (e: React.FormEvent, categoryId: number) => {
    e.preventDefault();
    if (!newSubcatName) return;
    try {
      await api.post(`/catalog/categories/${categoryId}/subcategories`, {name: newSubcatName});
      toast.success('Subcategory created');
      setNewSubcatName('');
      setAddingToCatId(null);
      queryClient.invalidateQueries({queryKey: ['catalog']});
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create subcategory');
    }
  };

  const handleCreateTag = async (e: React.FormEvent, subcategoryId: number) => {
    e.preventDefault();
    if (!newTagName) return;
    try {
      await api.post(`/catalog/subcategories/${subcategoryId}/tags`, {name: newTagName});
      toast.success('Tag created');
      setNewTagName('');
      setAddingToSubcatId(null);
      queryClient.invalidateQueries({queryKey: ['catalog']});
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create tag');
    }
  };

  const handleDelete = async (type: 'category'|'subcategory'|'tag', id: number) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      if (type === 'category') await api.delete(`/catalog/categories/${id}`);
      else if (type === 'subcategory') await api.delete(`/catalog/subcategories/${id}`);
      else if (type === 'tag') await api.delete(`/catalog/tags/${id}`);
      
      toast.success(`${type} deleted`);
      queryClient.invalidateQueries({queryKey: ['catalog']});
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to delete ${type}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">progress_activity</span>
        <p className="text-[var(--v2-on-surface-variant)]">Loading catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black v2-headline text-[var(--v2-on-surface)]">Catalog Management</h2>
          <p className="text-[var(--v2-on-surface-variant)]">Manage the hierarchical product categorization system</p>
        </div>
      </div>

      <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-6 shadow-sm">
        {/* Add Category Form */}
        <form onSubmit={handleCreateCategory} className="flex gap-2 mb-8 items-end border-b border-[var(--v2-outline-variant)]/20 pb-6">
          <div className="flex-1">
            <label className="block text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase mb-2">Add New Category</label>
            <input
              type="text"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              placeholder="e.g. Electronics"
              className="w-full bg-[var(--v2-surface-container-low)] px-4 py-3 rounded-xl border-none text-[var(--v2-on-surface)] text-sm"
            />
          </div>
          <button type="submit" disabled={!newCatName} className="py-3 px-6 v2-hero-gradient text-white font-bold rounded-xl disabled:opacity-50 flex items-center gap-2 text-sm">
            <span className="v2-icon text-sm">add</span> Add
          </button>
        </form>

        {/* Catalog Hierarchy Display */}
        <div className="space-y-4">
          {catalog.length === 0 ? (
            <div className="text-center py-10 text-[var(--v2-on-surface-variant)]">No categories found</div>
          ) : catalog.map(cat => (
            <div key={cat.id} className="border border-[var(--v2-outline-variant)]/20 rounded-xl overflow-hidden bg-[var(--v2-surface)]">
              {/* Category Row */}
              <div className="flex items-center justify-between p-4 bg-[var(--v2-surface-container-low)]">
                <button onClick={() => toggleCat(cat.id)} className="flex items-center gap-3 text-left font-bold text-[var(--v2-on-surface)] flex-1">
                  <span className={`v2-icon transition-transform ${expandedCats[cat.id] ? 'rotate-90' : ''}`}>chevron_right</span>
                  <span className="text-lg">{cat.name}</span>
                  <span className="text-xs bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] px-2 py-1 rounded-md">{cat.subcategories?.length || 0} subcategories</span>
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => {
                    setAddingToCatId(addingToCatId === cat.id ? null : cat.id);
                    setNewSubcatName('');
                  }} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Add Subcategory">
                    <span className="v2-icon text-sm">add</span>
                  </button>
                  <button onClick={() => handleDelete('category', cat.id)} className="p-2 text-[var(--v2-error)] hover:bg-[var(--v2-error)]/10 rounded-lg transition-colors">
                    <span className="v2-icon text-sm">delete</span>
                  </button>
                </div>
              </div>

              {expandedCats[cat.id] && (
                <div className="p-4 pl-10 space-y-4">
                  {/* Add Subcategory Inline Form */}
                  {addingToCatId === cat.id && (
                    <form onSubmit={e => handleCreateSubcategory(e, cat.id)} className="flex gap-2 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                      <input
                        autoFocus
                        type="text"
                        value={newSubcatName}
                        onChange={e => setNewSubcatName(e.target.value)}
                        placeholder="New subcategory name..."
                        className="flex-1 bg-white px-3 py-2 rounded-lg border border-emerald-200 text-sm"
                      />
                      <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold">Add</button>
                      <button type="button" onClick={() => setAddingToCatId(null)} className="px-4 py-2 bg-white text-gray-600 rounded-lg text-sm">Cancel</button>
                    </form>
                  )}

                  {cat.subcategories?.map(sub => (
                    <div key={sub.id} className="border border-[var(--v2-outline-variant)]/10 rounded-xl overflow-hidden">
                      {/* Subcategory Row */}
                      <div className="flex items-center justify-between p-3 bg-white">
                        <button onClick={() => toggleSubcat(sub.id)} className="flex items-center gap-2 text-left font-bold text-[var(--v2-on-surface-variant)] flex-1 text-sm">
                          <span className={`v2-icon text-base transition-transform ${expandedSubcats[sub.id] ? 'rotate-90' : ''}`}>chevron_right</span>
                          {sub.name}
                          <span className="text-xs font-normal text-[var(--v2-on-surface-variant)] ml-2">({sub.tags?.length || 0} tags)</span>
                        </button>
                        <div className="flex items-center gap-1">
                          <button onClick={() => {
                            setAddingToSubcatId(addingToSubcatId === sub.id ? null : sub.id);
                            setNewTagName('');
                          }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Add Tag">
                            <span className="v2-icon text-sm">local_offer</span>
                          </button>
                          <button onClick={() => handleDelete('subcategory', sub.id)} className="p-1.5 text-[var(--v2-error)] hover:bg-[var(--v2-error)]/10 rounded-md transition-colors">
                            <span className="v2-icon text-sm">delete</span>
                          </button>
                        </div>
                      </div>

                      {expandedSubcats[sub.id] && (
                        <div className="p-3 bg-[var(--v2-surface-container-lowest)] border-t border-[var(--v2-outline-variant)]/10">
                          {/* Add Tag Inline Form */}
                          {addingToSubcatId === sub.id && (
                            <form onSubmit={e => handleCreateTag(e, sub.id)} className="flex gap-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100 mb-3">
                              <input
                                autoFocus
                                type="text"
                                value={newTagName}
                                onChange={e => setNewTagName(e.target.value)}
                                placeholder="New tag name..."
                                className="flex-1 bg-white px-2 py-1.5 rounded-md border border-blue-200 text-xs"
                              />
                              <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-bold">Add</button>
                              <button type="button" onClick={() => setAddingToSubcatId(null)} className="px-3 py-1.5 bg-white text-gray-600 rounded-md text-xs">Cancel</button>
                            </form>
                          )}

                          {/* Tags Grid */}
                          <div className="flex flex-wrap gap-2">
                            {sub.tags?.length === 0 ? (
                              <span className="text-xs text-gray-400 italic">No tags</span>
                            ) : sub.tags?.map(tag => (
                              <div key={tag.id} className="flex items-center gap-1 bg-[var(--v2-surface-container-low)] px-2.5 py-1 rounded-full text-xs font-medium text-[var(--v2-on-surface-variant)]">
                                <span className="v2-icon text-[10px] opacity-50">local_offer</span>
                                {tag.name}
                                <button onClick={() => handleDelete('tag', tag.id)} className="ml-1 text-[var(--v2-error)]/70 hover:text-[var(--v2-error)] outline-none rounded-full transition-colors">
                                  <span className="v2-icon text-[12px]">close</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

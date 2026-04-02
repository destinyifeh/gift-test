'use client';

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {useProfile} from '@/hooks/use-profile';
import {useVendorPromotions} from '@/hooks/use-promotions';
import {useVendorProducts} from '@/hooks/use-vendor';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {
  deleteVendorProduct,
  deleteVendorProductImage,
  manageVendorProduct,
  uploadVendorProductImage,
} from '@/lib/server/actions/vendor';
import {formatCurrency} from '@/lib/utils/currency';
import {useQueryClient} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';
import {toast} from 'sonner';

type FilterType = 'all' | 'active' | 'draft' | 'low';

interface ProductFormData {
  name: string;
  price: string;
  description: string;
  status: string;
  images: string[];
  category: string;
  type: string;
  stock_quantity: string;
}

const initialFormData: ProductFormData = {
  name: '',
  price: '',
  description: '',
  status: 'active',
  images: [],
  category: 'all',
  type: 'digital',
  stock_quantity: '',
};

const MAX_IMAGES = 3;

interface V2VendorInventoryTabProps {
  searchQuery?: string;
  onBoostProduct?: (productId: number) => void;
}

export function V2VendorInventoryTab({searchQuery = '', onBoostProduct}: V2VendorInventoryTabProps) {
  const {data: profile} = useProfile();
  const queryClient = useQueryClient();
  const {data: products = [], isLoading} = useVendorProducts(profile?.id, true);
  const {data: promotions = []} = useVendorPromotions();

  // Get product promotion status map
  const productPromotionStatus = new Map<number, 'pending_approval' | 'active'>();
  promotions.forEach((p) => {
    if (p.status === 'pending_approval' || p.status === 'active') {
      productPromotionStatus.set(p.product_id, p.status);
    }
  });

  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState(searchQuery);

  // Sync with parent search query
  useEffect(() => {
    if (searchQuery) setSearch(searchQuery);
  }, [searchQuery]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState<ProductFormData>(initialFormData);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const currency = getCurrencyByCountry(profile?.country || 'Nigeria');
  const currencySymbol = getCurrencySymbol(currency);

  // Check if shop is set up
  const isShopSetup = !!profile?.shop_name && !!profile?.shop_description;

  // Filter products
  const filteredProducts = products.filter((p: any) => {
    // Search filter
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    // Status filter
    switch (filter) {
      case 'active':
        return p.status === 'active';
      case 'draft':
        return p.status === 'draft';
      case 'low':
        return p.stock_quantity !== null && p.stock_quantity <= 5;
      default:
        return true;
    }
  });

  // Stats
  const activeCount = products.filter((p: any) => p.status === 'active').length;
  const draftCount = products.filter((p: any) => p.status === 'draft').length;
  const lowStockCount = products.filter(
    (p: any) => p.stock_quantity !== null && p.stock_quantity > 0 && p.stock_quantity <= 5
  ).length;
  const totalUnitsSold = products.reduce((sum: number, p: any) => sum + (p.units_sold || 0), 0);

  const getStockStatus = (product: any) => {
    if (product.status === 'draft') return {label: 'Draft', color: 'bg-gray-100 text-gray-800'};
    if (product.stock_quantity === null) return {label: 'Active', color: 'bg-emerald-100 text-emerald-800'};
    if (product.stock_quantity === 0)
      return {label: 'Out of Stock', color: 'bg-[var(--v2-error-container)]/20 text-[var(--v2-error)]'};
    if (product.stock_quantity <= 5) return {label: 'Low Stock', color: 'bg-amber-100 text-amber-800'};
    return {label: 'Active', color: 'bg-emerald-100 text-emerald-800'};
  };

  // Get primary image from product (first image from images array or fallback to image_url)
  const getPrimaryImage = (product: any): string | null => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    return product.image_url || null;
  };

  // Get image count for display
  const getImageCount = (product: any): number => {
    if (product.images && Array.isArray(product.images)) {
      return product.images.length;
    }
    return product.image_url ? 1 : 0;
  };

  const resetForm = () => {
    setProductForm(initialFormData);
    setEditingProduct(null);
  };

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      // Parse images - support both single image_url and images array
      let images: string[] = [];
      if (product.images && Array.isArray(product.images)) {
        images = product.images;
      } else if (product.image_url) {
        images = [product.image_url];
      }
      setProductForm({
        name: product.name || '',
        price: String(product.price || ''),
        description: product.description || '',
        status: product.status || 'active',
        images,
        category: product.category || 'all',
        type: product.type || 'digital',
        stock_quantity: product.stock_quantity !== null ? String(product.stock_quantity) : '',
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    if (productForm.images.length >= MAX_IMAGES && index >= productForm.images.length) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    setUploadingIndex(index);

    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadVendorProductImage(formData);
    setUploadingIndex(null);

    if (result.success && result.url) {
      const newImages = [...productForm.images];
      if (index < newImages.length) {
        // Replace existing image - delete old one first
        await deleteVendorProductImage(newImages[index]);
        newImages[index] = result.url;
      } else {
        // Add new image
        newImages.push(result.url);
      }
      setProductForm({...productForm, images: newImages});
      toast.success('Image uploaded');
    } else {
      toast.error(result.error || 'Upload failed');
    }

    // Reset file input
    e.target.value = '';
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = productForm.images[index];
    if (imageUrl) {
      setUploadingIndex(index);
      await deleteVendorProductImage(imageUrl);
      setUploadingIndex(null);
      const newImages = productForm.images.filter((_, i) => i !== index);
      setProductForm({...productForm, images: newImages});
      toast.success('Image removed');
    }
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) {
      toast.error('Please fill in name and price');
      return;
    }

    setSaving(true);
    const payload = {
      ...productForm,
      id: editingProduct?.id,
      price: Number(productForm.price),
      stock_quantity: productForm.stock_quantity ? Number(productForm.stock_quantity) : null,
      // Store images array and keep image_url as first image for backward compatibility
      image_url: productForm.images[0] || null,
      images: productForm.images,
    };

    const result = await manageVendorProduct(payload);
    setSaving(false);

    if (result.success) {
      toast.success(editingProduct ? 'Product updated' : 'Product created');
      queryClient.invalidateQueries({queryKey: ['vendor-products']});
      handleCloseModal();
    } else {
      toast.error(result.error || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setDeletingId(productId);
    const result = await deleteVendorProduct(productId);
    setDeletingId(null);

    if (result.success) {
      toast.success('Product deleted');
      queryClient.invalidateQueries({queryKey: ['vendor-products']});
    } else {
      toast.error(result.error || 'Failed to delete product');
    }
  };

  const handleToggleStatus = async (product: any) => {
    const newStatus = product.status === 'active' ? 'draft' : 'active';
    const result = await manageVendorProduct({
      ...product,
      status: newStatus,
    });

    if (result.success) {
      toast.success(`Product marked as ${newStatus}`);
      queryClient.invalidateQueries({queryKey: ['vendor-products']});
    } else {
      toast.error(result.error || 'Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading inventory...</p>
      </div>
    );
  }

  if (!isShopSetup) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center mb-4">
          <span className="v2-icon text-4xl text-[var(--v2-primary)]">storefront</span>
        </div>
        <h3 className="text-xl font-bold text-[var(--v2-on-surface)] mb-2">Shop Setup Required</h3>
        <p className="text-[var(--v2-on-surface-variant)] max-w-md mb-4">
          Complete your shop details in the <strong>Shop</strong> tab before adding products.
        </p>
        <p className="text-sm text-[var(--v2-on-surface-variant)]/70">
          A professional shop profile helps build trust with customers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold v2-headline tracking-tight text-[var(--v2-on-surface)] mb-2">
            Inventory Management
          </h2>
          <p className="text-[var(--v2-on-surface-variant)]">
            Manage your gift catalog, track stock levels, and update pricing.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="v2-hero-gradient text-[var(--v2-on-primary)] font-bold px-8 py-4 rounded-xl flex items-center gap-2 shadow-lg shadow-[var(--v2-primary)]/10 hover:opacity-90 transition-all active:scale-95">
          <span className="v2-icon">add_circle</span>
          <span>Add Product</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center mb-3">
            <span className="v2-icon text-[var(--v2-primary)]">inventory_2</span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)]">
            {products.length}
          </p>
          <p className="text-xs text-[var(--v2-on-surface-variant)] font-medium">Total Products</p>
        </div>

        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
            <span className="v2-icon text-emerald-600">check_circle</span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)]">
            {activeCount}
          </p>
          <p className="text-xs text-[var(--v2-on-surface-variant)] font-medium">Active</p>
        </div>

        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <span className="v2-icon text-gray-600">visibility_off</span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)]">
            {draftCount}
          </p>
          <p className="text-xs text-[var(--v2-on-surface-variant)] font-medium">Draft</p>
        </div>

        <div className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-3">
            <span className="v2-icon text-purple-600">shopping_cart</span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold v2-headline text-[var(--v2-on-surface)]">
            {totalUnitsSold}
          </p>
          <p className="text-xs text-[var(--v2-on-surface-variant)] font-medium">Units Sold</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <span className="v2-icon absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[var(--v2-surface-container-low)] border-none rounded-xl py-3 pl-12 pr-4 focus:ring-1 focus:ring-[var(--v2-primary)] text-[var(--v2-on-surface)] placeholder-[var(--v2-on-surface-variant)]/50"
            placeholder="Search products..."
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'active', 'draft', 'low'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-[var(--v2-primary)] text-[var(--v2-on-primary)]'
                  : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)]'
              }`}>
              {f === 'low' ? 'Low Stock' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-8 md:p-12 text-center">
          <span className="v2-icon text-5xl text-[var(--v2-on-surface-variant)]/30 mb-4 block">
            inventory_2
          </span>
          <h3 className="text-lg font-bold text-[var(--v2-on-surface)] mb-2">No products found</h3>
          <p className="text-sm text-[var(--v2-on-surface-variant)] mb-4">
            {search || filter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Add your first product to get started'}
          </p>
          {!search && filter === 'all' && (
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl">
              Add Product
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-[var(--v2-surface-container-lowest)] rounded-[2rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[var(--v2-on-surface-variant)]/60 text-xs uppercase tracking-widest border-b border-[var(--v2-outline-variant)]/10">
                    <th className="py-5 px-6 text-left font-semibold">Product</th>
                    <th className="py-5 px-4 text-left font-semibold">Status</th>
                    <th className="py-5 px-4 text-right font-semibold">Price</th>
                    <th className="py-5 px-4 text-right font-semibold">Stock</th>
                    <th className="py-5 px-4 text-center font-semibold">Sold</th>
                    <th className="py-5 px-6 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product: any) => {
                    const status = getStockStatus(product);
                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-[var(--v2-surface-container-low)] transition-colors border-b border-[var(--v2-outline-variant)]/5 last:border-0">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--v2-surface-container)] flex-shrink-0 relative">
                              {getPrimaryImage(product) ? (
                                <img
                                  src={getPrimaryImage(product)!}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="v2-icon text-xl text-[var(--v2-on-surface-variant)]/30">
                                    image
                                  </span>
                                </div>
                              )}
                              {getImageCount(product) > 1 && (
                                <span className="absolute bottom-0.5 right-0.5 px-1 py-0.5 bg-black/60 text-white text-[9px] font-bold rounded">
                                  +{getImageCount(product) - 1}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-[var(--v2-on-surface)]">{product.name}</p>
                              <p className="text-xs text-[var(--v2-on-surface-variant)]">
                                ID: {product.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <p className="font-bold text-[var(--v2-on-surface)]">
                            {formatCurrency(product.price, currency)}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <p className="text-sm text-[var(--v2-on-surface-variant)]">
                            {product.stock_quantity !== null ? `${product.stock_quantity} units` : 'Unlimited'}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <p className="text-sm font-semibold text-[var(--v2-on-surface)]">
                            {product.units_sold || 0}
                          </p>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {onBoostProduct && product.status === 'active' && !productPromotionStatus.has(product.id) && (
                              <button
                                onClick={() => onBoostProduct(product.id)}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold flex items-center gap-1 hover:opacity-90 transition-opacity"
                                title="Boost">
                                <span className="v2-icon text-sm">rocket_launch</span>
                                Boost
                              </button>
                            )}
                            {productPromotionStatus.get(product.id) === 'pending_approval' && (
                              <span className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold flex items-center gap-1">
                                <span className="v2-icon text-sm">hourglass_top</span>
                                Pending
                              </span>
                            )}
                            {productPromotionStatus.get(product.id) === 'active' && (
                              <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1">
                                <span className="v2-icon text-sm">campaign</span>
                                Boosted
                              </span>
                            )}
                            <button
                              onClick={() => handleOpenModal(product)}
                              className="p-2 rounded-lg hover:bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)] transition-colors"
                              title="Edit">
                              <span className="v2-icon">edit</span>
                            </button>
                            <button
                              onClick={() => handleToggleStatus(product)}
                              className="p-2 rounded-lg hover:bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)] transition-colors"
                              title={product.status === 'active' ? 'Hide' : 'Show'}>
                              <span className="v2-icon">
                                {product.status === 'active' ? 'visibility' : 'visibility_off'}
                              </span>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={deletingId === product.id}
                              className="p-2 rounded-lg hover:bg-[var(--v2-error)]/10 text-[var(--v2-error)] transition-colors disabled:opacity-50"
                              title="Delete">
                              <span className="v2-icon">
                                {deletingId === product.id ? 'progress_activity' : 'delete'}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredProducts.map((product: any) => {
              const status = getStockStatus(product);
              return (
                <div
                  key={product.id}
                  className="bg-[var(--v2-surface-container-lowest)] rounded-2xl overflow-hidden">
                  {/* Image */}
                  <div className="relative h-40 w-full">
                    {getPrimaryImage(product) ? (
                      <img
                        src={getPrimaryImage(product)!}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--v2-surface-container)] flex items-center justify-center">
                        <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/30">
                          image
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase backdrop-blur-md ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    {getImageCount(product) > 1 && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-lg flex items-center gap-1">
                        <span className="v2-icon text-xs">photo_library</span>
                        {getImageCount(product)}
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 bg-[var(--v2-surface-container-lowest)]/90 backdrop-blur-md px-3 py-1.5 rounded-xl">
                      <span className="font-bold text-[var(--v2-primary)]">
                        {formatCurrency(product.price, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-[var(--v2-on-surface)]">{product.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-[var(--v2-on-surface-variant)]">
                          <span>{product.units_sold || 0} sold</span>
                          {product.stock_quantity !== null && (
                            <span>{product.stock_quantity} in stock</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Boost Button for Mobile */}
                    {onBoostProduct && product.status === 'active' && !productPromotionStatus.has(product.id) && (
                      <button
                        onClick={() => onBoostProduct(product.id)}
                        className="w-full mb-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2">
                        <span className="v2-icon text-sm">rocket_launch</span>
                        Boost This Product
                      </button>
                    )}
                    {productPromotionStatus.get(product.id) === 'pending_approval' && (
                      <div className="w-full mb-3 py-2.5 rounded-xl bg-amber-100 text-amber-700 font-bold text-sm flex items-center justify-center gap-2">
                        <span className="v2-icon text-sm">hourglass_top</span>
                        Awaiting Approval
                      </div>
                    )}
                    {productPromotionStatus.get(product.id) === 'active' && (
                      <div className="w-full mb-3 py-2.5 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center gap-2">
                        <span className="v2-icon text-sm">campaign</span>
                        Promotion Active
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-3 border-t border-[var(--v2-outline-variant)]/10">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="flex-1 py-2.5 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-medium text-sm flex items-center justify-center gap-2">
                        <span className="v2-icon text-sm">edit</span>
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className="py-2.5 px-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)]">
                        <span className="v2-icon text-sm">
                          {product.status === 'active' ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deletingId === product.id}
                        className="py-2.5 px-4 rounded-xl bg-[var(--v2-error)]/10 text-[var(--v2-error)] disabled:opacity-50">
                        <span className="v2-icon text-sm">
                          {deletingId === product.id ? 'progress_activity' : 'delete'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Floating Add Button - Mobile */}
      <button
        onClick={() => handleOpenModal()}
        className="md:hidden fixed right-6 bottom-24 w-16 h-16 v2-hero-gradient text-[var(--v2-on-primary)] rounded-2xl shadow-[0_12px_24px_rgba(150,67,0,0.3)] flex items-center justify-center z-40 active:scale-95 transition-transform">
        <span className="v2-icon text-3xl">add</span>
      </button>

      {/* Add/Edit Product Modal */}
      <ResponsiveModal open={showModal} onOpenChange={open => !open && handleCloseModal()}>
        <ResponsiveModalContent className="max-h-[85vh]">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </ResponsiveModalTitle>
          </ResponsiveModalHeader>

          <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
            {/* Image Upload - Multiple Images */}
            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Product Images ({productForm.images.length}/{MAX_IMAGES})
              </label>
              <p className="text-xs text-[var(--v2-on-surface-variant)] mb-3">
                Upload up to {MAX_IMAGES} images. First image will be the main display image.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {/* Existing images */}
                {productForm.images.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-xl border-2 border-[var(--v2-outline-variant)]/30 overflow-hidden bg-[var(--v2-surface-container-low)] relative group">
                    {uploadingIndex === index ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="v2-icon text-2xl text-[var(--v2-primary)] animate-spin">
                          progress_activity
                        </span>
                      </div>
                    ) : (
                      <>
                        <img
                          src={imageUrl}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-[var(--v2-primary)] text-[var(--v2-on-primary)] text-[10px] font-bold rounded">
                            Main
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <label
                            htmlFor={`product-image-${index}`}
                            className="p-2 bg-white/20 rounded-lg cursor-pointer hover:bg-white/30 transition-colors">
                            <span className="v2-icon text-white text-sm">edit</span>
                          </label>
                          <input
                            type="file"
                            id={`product-image-${index}`}
                            className="hidden"
                            accept="image/*"
                            onChange={e => handleImageUpload(e, index)}
                            disabled={uploadingIndex !== null}
                          />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                            <span className="v2-icon text-white text-sm">delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Add more images slot */}
                {productForm.images.length < MAX_IMAGES && (
                  <label
                    htmlFor="product-image-new"
                    className={`aspect-square rounded-xl border-2 border-dashed border-[var(--v2-outline-variant)]/30 flex flex-col items-center justify-center bg-[var(--v2-surface-container-low)] cursor-pointer hover:bg-[var(--v2-surface-container)] hover:border-[var(--v2-primary)]/30 transition-colors ${
                      uploadingIndex !== null ? 'opacity-50 cursor-not-allowed' : ''
                    }`}>
                    {uploadingIndex === productForm.images.length ? (
                      <span className="v2-icon text-2xl text-[var(--v2-primary)] animate-spin">
                        progress_activity
                      </span>
                    ) : (
                      <>
                        <span className="v2-icon text-2xl text-[var(--v2-on-surface-variant)]/50 mb-1">
                          add_photo_alternate
                        </span>
                        <span className="text-[10px] text-[var(--v2-on-surface-variant)]/50 font-medium">
                          Add Image
                        </span>
                      </>
                    )}
                  </label>
                )}
                <input
                  type="file"
                  id="product-image-new"
                  className="hidden"
                  accept="image/*"
                  onChange={e => handleImageUpload(e, productForm.images.length)}
                  disabled={uploadingIndex !== null || productForm.images.length >= MAX_IMAGES}
                />
              </div>
              <p className="text-xs text-[var(--v2-on-surface-variant)] mt-2">Max 2MB per image (JPG, PNG)</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={productForm.name}
                onChange={e => setProductForm({...productForm, name: e.target.value})}
                className="w-full py-3 px-4 bg-[var(--v2-surface-container-low)] border-none rounded-xl text-[var(--v2-on-surface)]"
                placeholder="e.g. Spa Gift Card"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Price ({currencySymbol}) *
              </label>
              <input
                type="number"
                value={productForm.price}
                onChange={e => setProductForm({...productForm, price: e.target.value})}
                className="w-full py-3 px-4 bg-[var(--v2-surface-container-low)] border-none rounded-xl text-[var(--v2-on-surface)]"
                placeholder="5000"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                Description
              </label>
              <textarea
                value={productForm.description}
                onChange={e => setProductForm({...productForm, description: e.target.value})}
                className="w-full py-3 px-4 bg-[var(--v2-surface-container-low)] border-none rounded-xl text-[var(--v2-on-surface)] resize-none"
                rows={3}
                placeholder="Describe your product..."
              />
            </div>

            {/* Category & Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                  Category
                </label>
                <select
                  value={productForm.category}
                  onChange={e => setProductForm({...productForm, category: e.target.value})}
                  className="w-full py-3 px-4 bg-[var(--v2-surface-container-low)] border-none rounded-xl text-[var(--v2-on-surface)]">
                  <option value="all">All</option>
                  <option value="birthday">Birthday</option>
                  <option value="spa">Spa</option>
                  <option value="fashion">Fashion</option>
                  <option value="food">Food</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                  Type
                </label>
                <select
                  value={productForm.type}
                  onChange={e => setProductForm({...productForm, type: e.target.value})}
                  className="w-full py-3 px-4 bg-[var(--v2-surface-container-low)] border-none rounded-xl text-[var(--v2-on-surface)]">
                  <option value="digital">Digital</option>
                  <option value="physical">Physical</option>
                </select>
              </div>
            </div>

            {/* Stock & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={productForm.stock_quantity}
                  onChange={e => setProductForm({...productForm, stock_quantity: e.target.value})}
                  className="w-full py-3 px-4 bg-[var(--v2-surface-container-low)] border-none rounded-xl text-[var(--v2-on-surface)]"
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--v2-on-surface-variant)] mb-2">
                  Status
                </label>
                <select
                  value={productForm.status}
                  onChange={e => setProductForm({...productForm, status: e.target.value})}
                  className="w-full py-3 px-4 bg-[var(--v2-surface-container-low)] border-none rounded-xl text-[var(--v2-on-surface)]">
                  <option value="active">Active (Visible)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-0 flex gap-3">
            <button
              onClick={handleCloseModal}
              className="flex-1 py-3 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-medium">
              Cancel
            </button>
            <button
              onClick={handleSaveProduct}
              disabled={saving || !productForm.name || !productForm.price}
              className="flex-1 py-3 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <span className="v2-icon text-sm animate-spin">progress_activity</span>}
              {editingProduct ? 'Update' : 'Save'}
            </button>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}

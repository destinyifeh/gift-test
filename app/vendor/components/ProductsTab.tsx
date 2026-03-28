'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {useProfile} from '@/hooks/use-profile';
import {useVendorProducts} from '@/hooks/use-vendor';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {
  deleteVendorProduct,
  deleteVendorProductImage,
  manageVendorProduct,
  uploadVendorProductImage,
} from '@/lib/server/actions/vendor';
import {cn} from '@/lib/utils';
import {useQueryClient} from '@tanstack/react-query';
import {Edit, Eye, EyeOff, Loader2, Package, Plus, Trash2, Upload} from 'lucide-react';
import React, {useState} from 'react';
import {toast} from 'sonner';
import {SecurityModal} from './SecurityModal';

export function ProductsTab() {
  const {data: profile} = useProfile();
  const queryClient = useQueryClient();
  const {data: products = [], isLoading: productsLoading} = useVendorProducts(
    profile?.id,
    true,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [verifyAction, setVerifyAction] = useState<null | string>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const currencyCode = getCurrencyByCountry(profile?.country);
  const currencySymbol = getCurrencySymbol(currencyCode);

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    status: 'active',
    image_url: '',
    category: 'all',
    type: 'digital',
  });

  const resetForm = () => {
    setProductForm({
      name: '',
      price: '',
      description: '',
      status: 'active',
      image_url: '',
      category: 'all',
      type: 'digital',
    });
    setEditingProduct(null);
  };

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingProduct(product.id);
      setProductForm({
        name: product.name,
        price: String(product.price),
        description: product.description,
        status: product.status,
        image_url: product.image_url || '',
        category: product.category || 'all',
        type: product.type || 'digital',
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }

      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      if (productForm.image_url) {
        await deleteVendorProductImage(productForm.image_url);
      }

      const res = await uploadVendorProductImage(formData);
      setUploading(false);

      if (res.success) {
        setProductForm(prev => ({...prev, image_url: res.url!}));
        toast.success('Image uploaded');
      } else {
        toast.error(res.error || 'Upload failed');
      }
    }
  };

  const handleRemoveImage = async () => {
    if (productForm.image_url) {
      setUploading(true);
      const res = await deleteVendorProductImage(productForm.image_url);
      setUploading(false);
      if (res.success) {
        setProductForm(prev => ({...prev, image_url: ''}));
        toast.success('Image removed');
      } else {
        setProductForm(prev => ({...prev, image_url: ''}));
      }
    }
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) {
      toast.error('Please fill in name and price');
      return;
    }

    setSaving(true);
    const res = await manageVendorProduct({
      ...productForm,
      id: editingProduct,
      price: Number(productForm.price),
    });
    setSaving(false);
    if (res.success) {
      toast.success(editingProduct ? 'Product updated' : 'Product created');
      queryClient.invalidateQueries({queryKey: ['vendor-products']});
      handleCloseModal();
    } else {
      toast.error(res.error || 'Failed to save product');
    }
  };

  const handleConfirmAction = async (password: string) => {
    if (verifyAction?.startsWith('delete-product-')) {
      const id = Number(verifyAction.split('-')[2]);
      if (confirm('Are you sure you want to delete this product?')) {
        const res = await deleteVendorProduct(id);
        if (res.success) {
          toast.success('Product deleted');
          queryClient.invalidateQueries({queryKey: ['vendor-products']});
        } else {
          toast.error(res.error || 'Failed to delete product');
        }
      }
    }
    setVerifyAction(null);
  };

  const handleToggleStatus = async (product: any) => {
    const newStatus = product.status === 'active' ? 'draft' : 'active';
    const res = await manageVendorProduct({
      ...product,
      status: newStatus,
    });
    if (res.success) {
      toast.success(`Product marked as ${newStatus}`);
      queryClient.invalidateQueries({queryKey: ['vendor-products']});
    } else {
      toast.error(res.error || 'Failed to update status');
    }
  };

  const isShopSetup =
    !!profile?.shop_name &&
    !!profile?.shop_description &&
    !!profile?.shop_address;

  if (productsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SecurityModal
        isOpen={!!verifyAction}
        onClose={() => setVerifyAction(null)}
        onConfirm={handleConfirmAction}
      />

      {!isShopSetup ? (
        <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 md:p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">
            Shop Setup Required
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
            Complete your shop details in the <strong>Shop</strong> tab before adding products.
          </p>
          <p className="text-xs text-muted-foreground italic">
            A professional shop profile helps build trust with customers.
          </p>
        </div>
      ) : (
        <>
          {/* Add Product Button */}
          <div className="flex justify-end">
            <Button
              variant="hero"
              size="sm"
              onClick={() => handleOpenModal()}
              className="gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>

          {/* Products List */}
          {products.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 md:p-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground mb-1">
                No products yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first product to start selling.
              </p>
              <Button variant="outline" size="sm" onClick={() => handleOpenModal()}>
                <Plus className="w-4 h-4 mr-1" /> Add Product
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {products.map(p => (
                <div
                  key={p.id}
                  className={cn(
                    'flex items-center gap-3 p-3 md:p-4 rounded-xl',
                    'bg-card border border-border',
                    'hover:border-primary/20 transition-colors',
                  )}>
                  {/* Image */}
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg border border-border overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-muted-foreground/50" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm md:text-base truncate">
                      {p.name}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {currencySymbol}
                      {p.price.toLocaleString()} · {p.sold || 0} sold
                    </p>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Badge
                      variant={p.status === 'active' ? 'secondary' : 'outline'}
                      className="hidden sm:inline-flex text-xs">
                      {p.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 md:h-9 md:w-9"
                      onClick={() => handleOpenModal(p)}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 md:h-9 md:w-9"
                      onClick={() => handleToggleStatus(p)}>
                      {p.status === 'active' ? (
                        <Eye className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 md:h-9 md:w-9 text-destructive hover:text-destructive"
                      onClick={() => setVerifyAction(`delete-product-${p.id}`)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Product Modal */}
      <ResponsiveModal open={isModalOpen} onOpenChange={open => !open && handleCloseModal()}>
        <ResponsiveModalContent className="sm:max-w-lg">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </ResponsiveModalTitle>
            <ResponsiveModalDescription>
              {editingProduct
                ? 'Update your product details'
                : 'Fill in the details to create a new product'}
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>

          <div className="px-4 md:px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Product Image</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted relative group">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  ) : productForm.image_url ? (
                    <>
                      <img
                        src={productForm.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </>
                  ) : (
                    <Package className="w-8 h-8 text-muted-foreground/30" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor="product-image"
                    className={cn(
                      'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg',
                      'bg-primary/10 text-primary hover:bg-primary/20',
                      'cursor-pointer transition-colors text-sm font-medium',
                      uploading && 'opacity-50 cursor-not-allowed',
                    )}>
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : productForm.image_url ? 'Change' : 'Upload'}
                  </Label>
                  <input
                    type="file"
                    id="product-image"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <p className="text-xs text-muted-foreground">Max 2MB (JPG, PNG, WebP)</p>
                </div>
              </div>
            </div>

            {/* Name & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input
                  value={productForm.name}
                  onChange={e => setProductForm({...productForm, name: e.target.value})}
                  placeholder="e.g. Spa Gift Card"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Price ({currencySymbol})</Label>
                <Input
                  type="number"
                  value={productForm.price}
                  onChange={e => setProductForm({...productForm, price: e.target.value})}
                  placeholder="5000"
                  className="h-11"
                />
              </div>
            </div>

            {/* Category & Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={productForm.category}
                  onValueChange={v => setProductForm({...productForm, category: v})}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="spa">Spa</SelectItem>
                    <SelectItem value="fashion">Fashion</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={productForm.type}
                  onValueChange={v => setProductForm({...productForm, type: v})}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={productForm.description}
                onChange={e => setProductForm({...productForm, description: e.target.value})}
                placeholder="Describe your product..."
                rows={3}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={productForm.status}
                onValueChange={v => setProductForm({...productForm, status: v})}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (Visible)</SelectItem>
                  <SelectItem value="draft">Draft (Hidden)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ResponsiveModalFooter className="flex-col-reverse sm:flex-row">
            <Button variant="outline" onClick={handleCloseModal} className="w-full sm:w-auto h-11">
              Cancel
            </Button>
            <Button
              variant="hero"
              onClick={handleSaveProduct}
              disabled={saving || !productForm.name || !productForm.price}
              className="w-full sm:w-auto h-11">
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingProduct ? 'Update Product' : 'Save Product'}
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}

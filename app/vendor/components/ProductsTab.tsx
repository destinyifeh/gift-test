'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
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
import {useQueryClient} from '@tanstack/react-query';
import {Edit, Eye, Loader2, Package, Trash2, Upload} from 'lucide-react';
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

      // Clean up old image if changing
      if (productForm.image_url) {
        await deleteVendorProductImage(productForm.image_url);
      }

      const res = await uploadVendorProductImage(formData);
      setUploading(false);

      if (res.success) {
        setProductForm(prev => ({...prev, image_url: res.url!}));
        toast.success('Image uploaded successfully');
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
        console.warn('Failed to delete from storage:', res.error);
      }
    }
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) return;

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
      setIsModalOpen(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        price: '',
        description: '',
        status: 'active',
        image_url: '',
        category: 'all',
        type: 'digital',
      });
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

  const isShopSetup =
    !!profile?.shop_name &&
    !!profile?.shop_description &&
    !!profile?.shop_address;

  return (
    <div className="space-y-4">
      <SecurityModal
        isOpen={!!verifyAction}
        onClose={() => setVerifyAction(null)}
        onConfirm={handleConfirmAction}
      />

      {!isShopSetup ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Shop Setup Required
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Please complete your shop's name, description, and address in
                the **Shop** tab before you can add products.
              </p>
            </div>
            <p className="text-xs text-muted-foreground italic">
              A professional shop profile helps build trust with your customers.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsModalOpen(!isModalOpen);
              setEditingProduct(null);
              setProductForm({
                name: '',
                price: '',
                description: '',
                status: 'active',
                image_url: '',
                category: 'all',
                type: 'digital',
              });
            }}>
            {isModalOpen ? 'Cancel' : 'Add Product'}
          </Button>
        </div>
      )}

      {(isModalOpen || editingProduct) && (
        <Card className="border-primary/20">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <h3 className="font-semibold text-foreground">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input
                  value={productForm.name}
                  onChange={e =>
                    setProductForm({...productForm, name: e.target.value})
                  }
                  placeholder="e.g. Spa Gift Card"
                />
              </div>
              <div className="space-y-2">
                <Label>Price ({currencySymbol})</Label>
                <Input
                  type="number"
                  value={productForm.price}
                  onChange={e =>
                    setProductForm({...productForm, price: e.target.value})
                  }
                  placeholder="50"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Product Image</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted relative group">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    ) : productForm.image_url ? (
                      <>
                        <img
                          src={productForm.image_url}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-5 h-5 text-white" />
                        </button>
                      </>
                    ) : (
                      <Package className="w-8 h-8 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      <Label
                        htmlFor="product-image"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors text-sm font-medium ${
                          uploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}>
                        <Upload className="w-4 h-4" />
                        {uploading
                          ? 'Uploading...'
                          : productForm.image_url
                            ? 'Change Image'
                            : 'Upload Image'}
                      </Label>
                      {productForm.image_url && !uploading && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive h-9"
                          onClick={handleRemoveImage}>
                          Remove
                        </Button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="product-image"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG or WebP. Max size: 2MB.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={productForm.category}
                  onValueChange={v =>
                    setProductForm({...productForm, category: v})
                  }>
                  <SelectTrigger>
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
                  onValueChange={v =>
                    setProductForm({...productForm, type: v})
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={productForm.description}
                  onChange={e =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Product description"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={productForm.status}
                  onValueChange={v =>
                    setProductForm({...productForm, status: v})
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="hero"
                size="sm"
                onClick={handleSaveProduct}
                disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editingProduct ? 'Update Product' : 'Save Product'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProduct(null);
                }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {products.map(p => (
        <Card key={p.id} className="border-border">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg border border-border overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground">{p.name}</p>
                <p className="text-sm text-muted-foreground">
                  {currencySymbol}
                  {p.price} · {p.sold || 0} sold
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Badge variant={p.status === 'active' ? 'secondary' : 'outline'}>
                {p.status}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingProduct(p.id);
                  setProductForm({
                    name: p.name,
                    price: String(p.price),
                    description: p.description,
                    status: p.status,
                    image_url: p.image_url || '',
                    category: p.category || 'all',
                    type: p.type || 'digital',
                  });
                  setIsModalOpen(true);
                }}>
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  const newStatus = p.status === 'active' ? 'draft' : 'active';
                  const res = await manageVendorProduct({
                    ...p,
                    status: newStatus,
                  });
                  if (res.success) {
                    toast.success(`Product marked as ${newStatus}`);
                    queryClient.invalidateQueries({
                      queryKey: ['vendor-products'],
                    });
                  } else {
                    toast.error(res.error || 'Failed to update status');
                  }
                }}>
                <Eye
                  className={`w-3.5 h-3.5 ${p.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => setVerifyAction(`delete-product-${p.id}`)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

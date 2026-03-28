'use client';

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
import {Textarea} from '@/components/ui/textarea';
import {cn} from '@/lib/utils';
import {updateVendorShopAdmin} from '@/lib/server/actions/admin';
import {
  deleteVendorProductImage,
  uploadVendorProductImage,
} from '@/lib/server/actions/vendor';
import {Loader2, Save, Store, Trash2, Upload} from 'lucide-react';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';

interface EditVendorModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: any;
  onSuccess?: () => void;
}

export function EditVendorModal({
  isOpen,
  onOpenChange,
  vendor,
  onSuccess,
}: EditVendorModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    shop_name: '',
    shop_description: '',
    shop_address: '',
    shop_slug: '',
    shop_logo_url: '',
  });

  useEffect(() => {
    if (vendor) {
      setForm({
        shop_name: vendor.shop_name || '',
        shop_description: vendor.shop_description || '',
        shop_address: vendor.shop_address || '',
        shop_slug: vendor.shop_slug || '',
        shop_logo_url: vendor.shop_logo_url || '',
      });
    }
  }, [vendor]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleShopNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm(prev => ({
      ...prev,
      shop_name: name,
      shop_slug: generateSlug(name),
    }));
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
      const res = await uploadVendorProductImage(formData);
      setUploading(false);

      if (res.success) {
        setForm(prev => ({...prev, shop_logo_url: res.url!}));
        toast.success('Logo uploaded successfully');
      } else {
        toast.error(res.error || 'Upload failed');
      }
    }
  };

  const handleRemoveImage = async () => {
    if (form.shop_logo_url) {
      setUploading(true);
      const res = await deleteVendorProductImage(form.shop_logo_url);
      setUploading(false);
      if (res.success) {
        setForm(prev => ({...prev, shop_logo_url: ''}));
        toast.success('Logo removed');
      } else {
        setForm(prev => ({...prev, shop_logo_url: ''}));
        console.warn('Failed to delete from storage:', res.error);
      }
    }
  };

  const handleSave = async () => {
    if (!form.shop_name) {
      toast.error('Shop name is required');
      return;
    }

    setLoading(true);
    const res = await updateVendorShopAdmin(vendor.id, {
      shop_name: form.shop_name,
      shop_description: form.shop_description,
      shop_address: form.shop_address,
      shop_logo_url: form.shop_logo_url,
      shop_slug: form.shop_slug || generateSlug(form.shop_name),
    });
    setLoading(false);

    if (res.success) {
      toast.success('Vendor shop details updated successfully');
      onSuccess?.();
      onOpenChange(false);
    } else {
      toast.error(res.error || 'Failed to update shop details');
    }
  };

  if (!vendor) return null;

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-xl">
        <ResponsiveModalHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <ResponsiveModalTitle>Edit Vendor Shop</ResponsiveModalTitle>
              <ResponsiveModalDescription>
                Update shop profile for @{vendor.username}
              </ResponsiveModalDescription>
            </div>
          </div>
        </ResponsiveModalHeader>

        <div className="px-4 md:px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Logo Upload */}
          <div className="flex items-center gap-4">
            <div className={cn(
              'w-16 h-16 rounded-xl border-2 border-dashed border-border',
              'flex items-center justify-center bg-muted overflow-hidden relative group',
            )}>
              {uploading ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : form.shop_logo_url ? (
                <>
                  <img
                    src={form.shop_logo_url}
                    alt="Shop Logo"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </>
              ) : (
                <Store className="w-6 h-6 text-muted-foreground/30" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap gap-2">
                <Label
                  htmlFor="admin-shop-logo"
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-2 rounded-lg',
                    'bg-primary/10 text-primary hover:bg-primary/20',
                    'cursor-pointer transition-colors text-xs font-medium',
                    uploading && 'opacity-50 cursor-not-allowed',
                  )}>
                  <Upload className="w-3.5 h-3.5" />
                  {uploading
                    ? 'Uploading...'
                    : form.shop_logo_url
                      ? 'Change'
                      : 'Upload'}
                </Label>
                <input
                  type="file"
                  id="admin-shop-logo"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {form.shop_logo_url && !uploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive h-8 px-2 text-xs"
                    onClick={handleRemoveImage}>
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Max 2MB
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="shop_name" className="text-sm font-medium">
                Shop Name
              </Label>
              <Input
                id="shop_name"
                value={form.shop_name}
                onChange={handleShopNameChange}
                placeholder="Shop Name"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop_slug" className="text-sm font-medium">
                Shop Slug
              </Label>
              <Input
                id="shop_slug"
                value={form.shop_slug}
                onChange={e =>
                  setForm({...form, shop_slug: generateSlug(e.target.value)})
                }
                placeholder="shop-slug"
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shop_description" className="text-sm font-medium">
              Shop Description
            </Label>
            <Textarea
              id="shop_description"
              value={form.shop_description}
              onChange={e =>
                setForm({...form, shop_description: e.target.value})
              }
              placeholder="Describe the shop..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shop_address" className="text-sm font-medium">
              Shop Address
            </Label>
            <Input
              id="shop_address"
              value={form.shop_address}
              onChange={e => setForm({...form, shop_address: e.target.value})}
              placeholder="Shop Address"
              className="h-11"
            />
          </div>
        </div>

        <ResponsiveModalFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-11">
            Cancel
          </Button>
          <Button
            variant="hero"
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto h-11">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
